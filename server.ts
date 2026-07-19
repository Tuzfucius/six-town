import 'dotenv/config';
import { Readable } from 'node:stream';
import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';

const app = express();
const port = Number(process.env.PORT ?? 3001);
const difyBaseUrl = (process.env.DIFY_API_BASE_URL ?? '').replace(/\/+$/, '');
const difyApiKey = process.env.DIFY_API_KEY;
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

app.disable('x-powered-by');
app.use(express.json({ limit: '8kb' }));
app.use((error: unknown, _request: Request, response: Response, next: NextFunction) => {
  if (response.headersSent) return next(error);
  return response.status(400).json({ error: '请求内容格式无效。' });
});

function isRateLimited(request: Request) {
  const address = request.ip || request.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const bucket = requestBuckets.get(address);
  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(address, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > 20;
}

function validText(value: unknown, maxLength: number) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function hasDifyConfiguration(response: Response) {
  if (difyBaseUrl && difyApiKey) return true;
  response.status(503).json({ error: '智能问答服务尚未配置。' });
  return false;
}

app.post('/api/chat/messages', async (request, response) => {
  if (!hasDifyConfiguration(response)) return;
  if (isRateLimited(request)) return response.status(429).json({ error: '请求过于频繁，请稍后再试。' });

  const { query, conversationId, userId } = request.body as Record<string, unknown>;
  if (!validText(query, 2000) || !validText(userId, 128) || (conversationId !== undefined && !validText(conversationId, 128))) {
    return response.status(400).json({ error: '请求参数无效。' });
  }
  const safeQuery = query as string;
  const safeUserId = userId as string;
  const safeConversationId = conversationId as string | undefined;

  const controller = new AbortController();
  response.on('close', () => { if (!response.writableEnded) controller.abort(); });
  try {
    const upstream = await fetch(`${difyBaseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ inputs: {}, query: safeQuery.trim(), response_mode: 'streaming', conversation_id: safeConversationId ?? '', user: safeUserId }),
      signal: controller.signal,
    });

    if (!upstream.ok || !upstream.body) {
      return response.status(502).json({ error: '智能问答服务暂时不可用。' });
    }
    response.status(200);
    response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders();
    Readable.fromWeb(upstream.body as import('node:stream/web').ReadableStream).pipe(response);
  } catch (error) {
    if (!controller.signal.aborted && !response.headersSent) {
      response.status(502).json({ error: '智能问答服务暂时不可用。' });
    }
  }
});

app.post('/api/chat/messages/:taskId/stop', async (request, response) => {
  if (!hasDifyConfiguration(response)) return;
  const { userId } = request.body as Record<string, unknown>;
  if (!validText(userId, 128) || !validText(request.params.taskId, 128)) return response.status(400).json({ error: '请求参数无效。' });
  try {
    const upstream = await fetch(`${difyBaseUrl}/chat-messages/${encodeURIComponent(request.params.taskId)}/stop`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${difyApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: userId }),
    });
    if (!upstream.ok) return response.status(502).json({ error: '停止生成失败。' });
    response.status(200).json({ result: 'success' });
  } catch {
    response.status(502).json({ error: '停止生成失败。' });
  }
});

const distDirectory = path.resolve(process.cwd(), 'dist');
app.use(express.static(distDirectory));
app.get('*', (_request, response) => response.sendFile(path.join(distDirectory, 'index.html')));

app.listen(port, () => console.log(`六镇地图服务已启动：http://localhost:${port}`));

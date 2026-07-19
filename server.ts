import 'dotenv/config';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';

const app = express();
const port = Number(process.env.PORT ?? 3001);
const localConfigPath = path.resolve(process.cwd(), '.dify.local.json');
let difyBaseUrl = (process.env.DIFY_API_BASE_URL ?? '').replace(/\/+$/, '');
let difyApiKey = (process.env.DIFY_API_KEY ?? '').trim();
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

type StoredDifyConfig = {
  baseUrl: string;
  apiKey: string;
};

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

function normalizeBaseUrl(value: string) {
  const trimmedValue = value.trim().replace(/\/+$/, '');
  try {
    const parsed = new URL(trimmedValue);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? trimmedValue : '';
  } catch {
    return '';
  }
}

function isLocalConfigurationRequest(request: Request) {
  const address = request.ip || request.socket.remoteAddress || '';
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
}

function allowLocalConfiguration(request: Request, response: Response) {
  if (isLocalConfigurationRequest(request)) return true;
  response.status(403).json({ error: '配置界面仅允许在本机访问。' });
  return false;
}

async function loadLocalDifyConfig() {
  try {
    const rawConfig = await readFile(localConfigPath, 'utf8');
    const savedConfig = JSON.parse(rawConfig) as Partial<StoredDifyConfig>;
    const savedBaseUrl = typeof savedConfig.baseUrl === 'string' ? normalizeBaseUrl(savedConfig.baseUrl) : '';
    const savedApiKey = typeof savedConfig.apiKey === 'string' ? savedConfig.apiKey.trim() : '';
    if (savedBaseUrl && savedApiKey) {
      difyBaseUrl = savedBaseUrl;
      difyApiKey = savedApiKey;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn('未能读取本地 Dify 配置，将使用环境变量。');
    }
  }
}

async function saveLocalDifyConfig(config: StoredDifyConfig) {
  const temporaryPath = `${localConfigPath}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(config, null, 2), { encoding: 'utf8', mode: 0o600 });
  await rename(temporaryPath, localConfigPath);
}

function hasDifyConfiguration(response: Response) {
  if (difyBaseUrl && difyApiKey) return true;
  response.status(503).json({ error: '智能问答服务尚未配置。' });
  return false;
}

app.get('/api/chat/config', (request, response) => {
  if (!allowLocalConfiguration(request, response)) return;
  response.status(200).json({
    baseUrl: difyBaseUrl,
    hasApiKey: Boolean(difyApiKey),
    isConfigured: Boolean(difyBaseUrl && difyApiKey),
  });
});

app.put('/api/chat/config', async (request, response) => {
  if (!allowLocalConfiguration(request, response)) return;
  const { baseUrl, apiKey } = request.body as Record<string, unknown>;
  const normalizedBaseUrl = typeof baseUrl === 'string' ? normalizeBaseUrl(baseUrl) : '';
  const nextApiKey = typeof apiKey === 'string' && apiKey.trim() ? apiKey.trim() : difyApiKey;
  if (!normalizedBaseUrl || !validText(nextApiKey, 512)) {
    return response.status(400).json({ error: '请填写有效的 Dify URL 和 API Key。' });
  }
  try {
    await saveLocalDifyConfig({ baseUrl: normalizedBaseUrl, apiKey: nextApiKey });
    difyBaseUrl = normalizedBaseUrl;
    difyApiKey = nextApiKey;
    response.status(200).json({ baseUrl: difyBaseUrl, hasApiKey: true, isConfigured: true });
  } catch {
    response.status(500).json({ error: '本地配置保存失败。' });
  }
});

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

void loadLocalDifyConfig().finally(() => {
  app.listen(port, () => console.log(`六镇地图服务已启动：http://localhost:${port}`));
});

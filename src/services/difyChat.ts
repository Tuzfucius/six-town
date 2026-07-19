export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type SendMessageInput = {
  query: string;
  conversationId?: string;
  userId: string;
  signal: AbortSignal;
  onMessage: (answer: string) => void;
  onConversation: (conversationId: string) => void;
  onTask: (taskId: string) => void;
};

type DifyStreamEvent = {
  event?: string;
  answer?: string;
  conversation_id?: string;
  task_id?: string;
  message?: string;
};

export async function sendChatMessage({
  query,
  conversationId,
  userId,
  signal,
  onMessage,
  onConversation,
  onTask,
}: SendMessageInput) {
  const response = await fetch('/api/chat/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, conversationId, userId }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error('智能问答暂时无法连接，请稍后重试。');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let complete = false;

  const handleEvent = (event: DifyStreamEvent) => {
    if (event.conversation_id) onConversation(event.conversation_id);
    if (event.task_id) onTask(event.task_id);
    if (event.event === 'message' && event.answer) onMessage(event.answer);
    if (event.event === 'error') throw new Error(event.message || '智能问答暂时无法连接，请稍后重试。');
    if (event.event === 'message_end') complete = true;
  };

  while (!complete) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const records = buffer.split(/\r?\n\r?\n/);
    buffer = records.pop() ?? '';

    for (const record of records) {
      const dataLine = record.split(/\r?\n/).find((line) => line.startsWith('data:'));
      if (!dataLine) continue;
      try {
        handleEvent(JSON.parse(dataLine.slice(5).trim()) as DifyStreamEvent);
      } catch (error) {
        if (error instanceof SyntaxError) continue;
        throw error;
      }
    }
    if (done) break;
  }
}

export async function stopChatMessage(taskId: string, userId: string) {
  await fetch(`/api/chat/messages/${encodeURIComponent(taskId)}/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
}

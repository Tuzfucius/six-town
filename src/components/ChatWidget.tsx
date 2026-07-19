import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { MessageCircle, Plus, Send, Sparkles, Square, X } from 'lucide-react';
import { type ChatMessage, sendChatMessage, stopChatMessage } from '../services/difyChat';

const STORAGE_KEYS = {
  userId: 'six-town-chat-user-id',
  conversationId: 'six-town-chat-conversation-id',
  messages: 'six-town-chat-messages',
};

const prompts = [
  '六镇分别有哪些代表企业？',
  '有什么支持特色小镇发展的政策？',
  '六镇之间有哪些产业协同方向？',
];

function createId(prefix: string) {
  const randomPart = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomPart}`;
}

function getUserId() {
  const existing = window.localStorage.getItem(STORAGE_KEYS.userId);
  if (existing) return existing;
  const userId = createId('six-town-user');
  window.localStorage.setItem(STORAGE_KEYS.userId, userId);
  return userId;
}

function loadMessages() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEYS.messages);
    return value ? JSON.parse(value) as ChatMessage[] : [];
  } catch {
    return [];
  }
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const taskIdRef = useRef<string | null>(null);
  const userIdRef = useRef(getUserId());
  const conversationIdRef = useRef(window.localStorage.getItem(STORAGE_KEYS.conversationId));

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
    messageEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    textareaRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape as unknown as EventListener);
    return () => window.removeEventListener('keydown', closeOnEscape as unknown as EventListener);
  }, [isOpen]);

  const createConversation = () => {
    if (isStreaming) return;
    conversationIdRef.current = null;
    window.localStorage.removeItem(STORAGE_KEYS.conversationId);
    window.localStorage.removeItem(STORAGE_KEYS.messages);
    setMessages([]);
    setError('');
  };

  const sendMessage = async (value: string) => {
    const query = value.trim();
    if (!query || isStreaming) return;

    const assistantId = createId('assistant');
    setMessages((current) => [
      ...current,
      { id: createId('user'), role: 'user', content: query },
      { id: assistantId, role: 'assistant', content: '' },
    ]);
    setInput('');
    setError('');
    setIsStreaming(true);
    taskIdRef.current = null;
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await sendChatMessage({
        query,
        conversationId: conversationIdRef.current ?? undefined,
        userId: userIdRef.current,
        signal: controller.signal,
        onMessage: (answer) => {
          setMessages((current) => current.map((message) => message.id === assistantId
            ? { ...message, content: `${message.content}${answer}` }
            : message));
        },
        onConversation: (conversationId) => {
          conversationIdRef.current = conversationId;
          window.localStorage.setItem(STORAGE_KEYS.conversationId, conversationId);
        },
        onTask: (taskId) => { taskIdRef.current = taskId; },
      });
    } catch (caught) {
      if (!controller.signal.aborted) {
        setError(caught instanceof Error ? caught.message : '智能问答暂时无法连接，请稍后重试。');
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsStreaming(false);
      taskIdRef.current = null;
    }
  };

  const stopStreaming = () => {
    const taskId = taskIdRef.current;
    abortRef.current?.abort();
    if (taskId) void stopChatMessage(taskId, userIdRef.current);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  return (
    <section className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6" aria-label="智能问答">
      {isOpen && (
        <div role="dialog" aria-modal="false" aria-labelledby="chat-title" className="absolute bottom-14 right-0 flex h-[80dvh] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden border border-cyan-100/25 bg-[#080b12]/95 shadow-2xl backdrop-blur-xl sm:bottom-16 sm:h-[min(680px,calc(100vh-7rem))] sm:w-[400px]">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center bg-cyan-200/10 text-cyan-100"><Sparkles className="h-4 w-4" aria-hidden="true" /></span>
              <h2 id="chat-title" className="text-sm font-semibold text-white">六镇智能问答</h2>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={createConversation} disabled={isStreaming} title="新建会话" aria-label="新建会话" className="grid h-8 w-8 place-items-center text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-4 w-4" aria-hidden="true" /></button>
              <button type="button" onClick={() => setIsOpen(false)} title="关闭问答窗口" aria-label="关闭问答窗口" className="grid h-8 w-8 place-items-center text-white/60 transition-colors hover:bg-white/10 hover:text-white"><X className="h-4 w-4" aria-hidden="true" /></button>
            </div>
          </header>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {messages.length === 0 && (
              <div className="space-y-4">
                <p className="max-w-[30ch] text-sm leading-6 text-white/75">围绕六镇企业、产业与政策资料提问，我会从已接入的知识库中检索回答。</p>
                <div className="flex flex-col items-start gap-2">
                  {prompts.map((prompt) => <button key={prompt} type="button" onClick={() => void sendMessage(prompt)} className="border border-white/15 bg-white/[0.03] px-3 py-2 text-left text-xs leading-5 text-cyan-50/80 transition-colors hover:border-cyan-200/45 hover:bg-cyan-200/[0.08]">{prompt}</button>)}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[85%] whitespace-pre-wrap break-words px-3 py-2 text-sm leading-6 ${message.role === 'user' ? 'bg-cyan-200 text-[#07111c]' : 'border border-white/10 bg-white/[0.04] text-white/85'}`}>
                  {message.content || (isStreaming ? <span className="text-white/45">正在检索资料...</span> : '未获得回复。')}
                </p>
              </div>
            ))}
            {error && <p role="alert" className="border-l-2 border-amber-300/80 bg-amber-300/10 px-3 py-2 text-xs leading-5 text-amber-100">{error}</p>}
            <div ref={messageEndRef} />
          </div>

          <form onSubmit={submit} className="shrink-0 border-t border-white/10 p-3">
            <div className="flex items-end gap-2 border border-white/15 bg-black/20 px-3 py-2 focus-within:border-cyan-200/60">
              <label className="sr-only" htmlFor="chat-message">输入问题</label>
              <textarea ref={textareaRef} id="chat-message" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleInputKeyDown} disabled={isStreaming} rows={2} maxLength={2000} placeholder="输入有关企业或政策的问题" className="min-h-10 flex-1 resize-none bg-transparent py-1 text-sm leading-5 text-white outline-none placeholder:text-white/35 disabled:opacity-50" />
              {isStreaming ? <button type="button" onClick={stopStreaming} title="停止生成" aria-label="停止生成" className="grid h-8 w-8 shrink-0 place-items-center bg-amber-200 text-[#07111c] hover:bg-amber-100"><Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" /></button> : <button type="submit" disabled={!input.trim()} title="发送问题" aria-label="发送问题" className="grid h-8 w-8 shrink-0 place-items-center bg-cyan-200 text-[#07111c] transition-colors hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-35"><Send className="h-4 w-4" aria-hidden="true" /></button>}
            </div>
          </form>
        </div>
      )}
      <button type="button" onClick={() => setIsOpen((value) => !value)} aria-expanded={isOpen} aria-label={isOpen ? '关闭智能问答' : '打开智能问答'} title={isOpen ? '关闭智能问答' : '智能问答'} className="grid h-12 w-12 place-items-center border border-cyan-100/40 bg-[#0b111c]/95 text-cyan-100 shadow-xl backdrop-blur transition-colors hover:bg-cyan-200 hover:text-[#07111c] sm:h-14 sm:w-14">
        {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <MessageCircle className="h-5 w-5" aria-hidden="true" />}
      </button>
    </section>
  );
}

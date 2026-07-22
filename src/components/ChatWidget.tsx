import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ChevronDown, MessageCircle, Plus, Save, Send, Settings, Sparkles, Square, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getChatConfig, saveChatConfig, type ChatConfigStatus, type ChatMessage, sendChatMessage, stopChatMessage } from '../services/difyChat';

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

const chatButtonClass = 'transition-[transform,color,background-color,border-color,box-shadow] duration-200 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200';

const markdownComponents: Components = {
  a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
};

function ThoughtPanel({ thought, isStreaming, reduceMotion }: { thought: string; isStreaming: boolean; reduceMotion: boolean | null }) {
  const [isExpanded, setIsExpanded] = useState(isStreaming);

  return (
    <div className="mb-2 max-w-[85%] overflow-hidden rounded-lg border border-cyan-100/15 bg-cyan-200/[0.04]">
      <button
        type="button"
        onClick={() => setIsExpanded((expanded) => !expanded)}
        aria-expanded={isExpanded}
        className={`flex min-h-9 w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs text-cyan-50/70 hover:bg-cyan-200/[0.08] ${chatButtonClass}`}
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-cyan-200/75" aria-hidden="true" />
          {isStreaming ? '正在思考' : '思考过程'}
        </span>
        <motion.span animate={reduceMotion ? undefined : { rotate: isExpanded ? 180 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}>
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <div className="border-t border-cyan-100/10 px-3 py-2.5 text-xs leading-5 text-white/55">
              <p className="whitespace-pre-wrap break-words">{thought}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLauncherVisible, setIsLauncherVisible] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [configUrl, setConfigUrl] = useState('');
  const [configApiKey, setConfigApiKey] = useState('');
  const [configStatus, setConfigStatus] = useState<ChatConfigStatus | null>(null);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [configError, setConfigError] = useState('');
  const [configNotice, setConfigNotice] = useState('');
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
  const isMapView = location.pathname === '/metro' || location.pathname.endsWith('/map');
  const reduceMotion = useReducedMotion();
  const dialogTransition = { duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] as const };

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

  const loadConfiguration = async () => {
    setConfigError('');
    setConfigNotice('');
    try {
      const status = await getChatConfig();
      setConfigStatus(status);
      setConfigUrl(status.baseUrl);
    } catch (caught) {
      setConfigError(caught instanceof Error ? caught.message : '读取配置失败。');
    }
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
    void loadConfiguration();
  };

  const saveConfiguration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsConfigSaving(true);
    setConfigError('');
    setConfigNotice('');
    try {
      const status = await saveChatConfig(configUrl, configApiKey);
      setConfigStatus(status);
      setConfigApiKey('');
      setConfigNotice('配置已保存，后续问答将使用新的 Dify 服务。');
    } catch (caught) {
      setConfigError(caught instanceof Error ? caught.message : '保存配置失败。');
    } finally {
      setIsConfigSaving(false);
    }
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
        onThought: (thought) => {
          setMessages((current) => current.map((message) => message.id === assistantId
            ? { ...message, thought: `${message.thought ?? ''}${message.thought ? '\n' : ''}${thought}` }
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
    <section className={`fixed right-4 z-[60] sm:right-6 ${isMapView ? 'bottom-32 sm:bottom-36' : 'bottom-4 sm:bottom-6'}`} aria-label="智能问答">
      <AnimatePresence onExitComplete={() => setIsLauncherVisible(true)}>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-title"
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.97 }}
          transition={dialogTransition}
          className={`absolute right-0 flex h-[80dvh] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-xl border border-cyan-100/25 bg-[#0b111c]/86 shadow-[0_24px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl sm:bottom-16 sm:h-[min(680px,calc(100vh-7rem))] sm:w-[400px] ${isMapView ? 'bottom-8' : 'bottom-14'}`}
        >
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-cyan-100/20 bg-cyan-200/10 text-cyan-100 backdrop-blur-md"><Sparkles className="h-4 w-4" aria-hidden="true" /></span>
              <h2 id="chat-title" className="text-sm font-semibold text-white">六镇智能问答</h2>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={openSettings} title="Dify 配置" aria-label="Dify 配置" className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-[#0b111c]/65 text-white/60 backdrop-blur-md transition-colors hover:border-cyan-100/35 hover:bg-cyan-200/10 hover:text-cyan-50"><Settings className="h-4 w-4" aria-hidden="true" /></button>
              <button type="button" onClick={createConversation} disabled={isStreaming} title="新建会话" aria-label="新建会话" className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-[#0b111c]/65 text-white/60 backdrop-blur-md transition-colors hover:border-cyan-100/35 hover:bg-cyan-200/10 hover:text-cyan-50 disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-4 w-4" aria-hidden="true" /></button>
              <button type="button" onClick={() => setIsOpen(false)} title="关闭问答窗口" aria-label="关闭问答窗口" className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-[#0b111c]/65 text-white/60 backdrop-blur-md transition-colors hover:border-cyan-100/35 hover:bg-cyan-200/10 hover:text-cyan-50"><X className="h-4 w-4" aria-hidden="true" /></button>
            </div>
          </header>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {isSettingsOpen ? <form onSubmit={saveConfiguration} className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">Dify 服务配置</h3>
                  <p className="mt-1 text-xs leading-5 text-white/55">密钥仅提交给本机服务并保存于 Git 忽略的本地配置文件，不会回显或写入浏览器存储。</p>
                </div>
                <button type="button" onClick={() => setIsSettingsOpen(false)} title="返回对话" aria-label="返回对话" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-[#0b111c]/65 text-white/60 backdrop-blur-md transition-colors hover:border-cyan-100/35 hover:bg-cyan-200/10 hover:text-cyan-50"><X className="h-4 w-4" aria-hidden="true" /></button>
              </div>
              <label className="block space-y-2 text-xs text-white/70" htmlFor="dify-base-url">
                <span>Dify 基础 URL</span>
                <input id="dify-base-url" type="url" value={configUrl} onChange={(event) => setConfigUrl(event.target.value)} required placeholder="http://localhost/v1" className="h-10 w-full rounded-lg border border-white/15 bg-[#07111c]/75 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-200/60" />
              </label>
              <label className="block space-y-2 text-xs text-white/70" htmlFor="dify-api-key">
                <span>Dify API Key {configStatus?.hasApiKey ? '（留空则保留当前密钥）' : ''}</span>
                <input id="dify-api-key" type="password" value={configApiKey} onChange={(event) => setConfigApiKey(event.target.value)} required={!configStatus?.hasApiKey} autoComplete="new-password" placeholder={configStatus?.hasApiKey ? '已配置，不会显示' : 'app-...'} className="h-10 w-full rounded-lg border border-white/15 bg-[#07111c]/75 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-200/60" />
              </label>
              {configStatus && <p className={`rounded-lg border px-3 py-2 text-xs ${configStatus.isConfigured ? 'border-cyan-200/25 bg-cyan-200/10 text-cyan-50/85' : 'border-white/10 bg-white/[0.04] text-white/55'}`}>{configStatus.isConfigured ? 'Dify 服务已配置。' : '尚未完成 Dify 服务配置。'}</p>}
              {configError && <p role="alert" className="rounded-lg border border-amber-300/35 bg-amber-300/10 px-3 py-2 text-xs leading-5 text-amber-100">{configError}</p>}
              {configNotice && <p className="rounded-lg border border-cyan-200/25 bg-cyan-200/10 px-3 py-2 text-xs leading-5 text-cyan-50/85">{configNotice}</p>}
              <button type="submit" disabled={isConfigSaving} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-cyan-100/60 bg-cyan-200/80 px-4 text-sm font-medium text-[#07111c] backdrop-blur-md transition-colors hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-45"><Save className="h-4 w-4" aria-hidden="true" />{isConfigSaving ? '正在保存' : '保存配置'}</button>
            </form> : <>
            {messages.length === 0 && (
              <div className="space-y-4">
                <p className="max-w-[30ch] text-sm leading-6 text-white/75">围绕六镇企业、产业与政策资料提问，我会从已接入的知识库中检索回答。</p>
                <div className="flex flex-col items-start gap-2">
                  {prompts.map((prompt) => <button key={prompt} type="button" onClick={() => void sendMessage(prompt)} className="rounded-lg border border-white/15 bg-[#0b111c]/60 px-3 py-2 text-left text-xs leading-5 text-cyan-50/80 backdrop-blur-md transition-colors hover:border-cyan-200/45 hover:bg-cyan-200/[0.08]">{prompt}</button>)}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <motion.div key={message.id} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%]">
                  {message.role === 'assistant' && message.thought && <ThoughtPanel thought={message.thought} isStreaming={isStreaming && !message.content} reduceMotion={reduceMotion} />}
                  <div className={`break-words rounded-lg px-3 py-2 text-sm leading-6 backdrop-blur-md ${message.role === 'user' ? 'whitespace-pre-wrap border border-cyan-100/45 bg-cyan-200/80 text-[#07111c]' : 'border border-white/10 bg-[#0b111c]/60 text-white/85'}`}>
                    {message.role === 'assistant' && message.content
                      ? <div className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{message.content}</ReactMarkdown></div>
                      : message.content || (isStreaming ? <span className="text-white/45">正在检索资料...</span> : '未获得回复。')}
                  </div>
                </div>
              </motion.div>
            ))}
            {error && <p role="alert" className="rounded-lg border border-amber-300/35 bg-amber-300/10 px-3 py-2 text-xs leading-5 text-amber-100 backdrop-blur-md">{error}</p>}
            <div ref={messageEndRef} />
            </>}
          </div>

          {!isSettingsOpen && <form onSubmit={submit} className="shrink-0 border-t border-white/10 p-3">
            <div className="flex items-end gap-2 rounded-lg border border-white/15 bg-[#07111c]/75 px-3 py-2 backdrop-blur-md focus-within:border-cyan-200/60">
              <label className="sr-only" htmlFor="chat-message">输入问题</label>
              <textarea ref={textareaRef} id="chat-message" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleInputKeyDown} disabled={isStreaming} rows={2} maxLength={2000} placeholder="输入有关企业或政策的问题" className="min-h-10 flex-1 resize-none bg-transparent py-1 text-sm leading-5 text-white outline-none placeholder:text-white/35 disabled:opacity-50" />
              {isStreaming ? <button type="button" onClick={stopStreaming} title="停止生成" aria-label="停止生成" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-amber-100/60 bg-amber-200/80 text-[#07111c] backdrop-blur-md transition-colors hover:bg-amber-100"><Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" /></button> : <button type="submit" disabled={!input.trim()} title="发送问题" aria-label="发送问题" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-cyan-100/65 bg-cyan-200/80 text-[#07111c] backdrop-blur-md transition-colors hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-35"><Send className="h-4 w-4" aria-hidden="true" /></button>}
            </div>
          </form>}
        </motion.div>
      )}
      </AnimatePresence>
      {!isOpen && isLauncherVisible && <motion.button type="button" onClick={() => { setIsLauncherVisible(false); setIsOpen(true); }} aria-expanded="false" aria-label="打开智能问答" title="智能问答" initial={reduceMotion ? false : { opacity: 0, scale: 0.86 }} animate={{ opacity: 1, scale: 1 }} transition={dialogTransition} className="grid h-12 w-12 place-items-center rounded-full border border-cyan-100/40 bg-[#0b111c]/78 text-cyan-100 shadow-xl backdrop-blur-xl transition-colors hover:border-cyan-100/70 hover:bg-cyan-200/25 hover:text-cyan-50 sm:h-14 sm:w-14">
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
      </motion.button>}
    </section>
  );
}

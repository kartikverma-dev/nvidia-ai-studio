import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Square, 
  Paperclip, 
  Copy, 
  Check, 
  Bot, 
  User, 
  Sparkles, 
  Terminal, 
  Cpu, 
  Code2,
  RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, Model } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  models: Model[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isStreaming,
  onStopStreaming,
  models,
  selectedModel,
  onSelectModel,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    {
      title: "Microservice Architecture",
      prompt: "Design a fault-tolerant microservice system with Redis cache invalidation and distributed tracing.",
      icon: Cpu
    },
    {
      title: "Debug Python Async Event Loop",
      prompt: "Explain common causes of deadlock or task starvation in asyncio with mitigation code examples.",
      icon: Terminal
    },
    {
      title: "NVIDIA TensorRT-LLM Pipeline",
      prompt: "Provide an architectural overview and configuration for deploying Llama 3.1 on NVIDIA TensorRT-LLM with Triton inference server.",
      icon: Sparkles
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0B0E] relative overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          /* Empty Starter State */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#141622] border border-[#262A3B] flex items-center justify-center shadow-xl relative">
              <svg className="w-8 h-8 text-[#E5FF44]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="m2 17 10 5 10-5" />
                <path d="m2 12 10 5 10-5" />
              </svg>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#E5FF44] border-2 border-[#0A0B0E]" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                EVILCLOWN <span className="text-[#E5FF44]">AI</span>
              </h2>
              <p className="text-xs text-[#8E93A6] mt-1.5 leading-relaxed">
                Autonomous technical workspace powered by live NVIDIA NIM inference engines.
              </p>
            </div>

            {/* Quick Starters */}
            <div className="grid grid-cols-1 gap-2.5 w-full pt-4">
              {quickPrompts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(item.prompt);
                      textareaRef.current?.focus();
                    }}
                    className="flex items-center gap-3 p-3 text-left rounded-xl bg-[#12141D] hover:bg-[#181B26] border border-[#202330] hover:border-[#E5FF44]/30 transition-all text-xs text-[#C5C9DB] group"
                  >
                    <div className="p-2 rounded-lg bg-[#181A25] border border-[#272B3C] text-[#E5FF44] group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white group-hover:text-[#E5FF44] transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#71768B] truncate mt-0.5">
                        {item.prompt}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Message List */
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-[#141622] border border-[#252838] flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-[#E5FF44]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="m2 17 10 5 10-5" />
                    </svg>
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#181B26] border border-[#272C3F] text-[#F1F3F9]'
                      : 'bg-[#11131B] border border-[#1F222F] text-[#E3E6F3] w-full'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/5">
                    <span className="font-mono text-[10px] text-[#71768B]">
                      {isUser ? 'You' : msg.model || 'NVIDIA NIM'}
                    </span>
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#71768B] hover:text-[#E5FF44] transition-all p-0.5 rounded"
                      title="Copy content"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-[#E5FF44]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="prose prose-invert prose-xs max-w-none break-words">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-[#1D2130] border border-[#2E344A] flex items-center justify-center shrink-0 mt-0.5 text-[#A5ABBF]">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Large Bottom Composer */}
      <div className="p-4 bg-gradient-to-t from-[#0A0B0E] via-[#0A0B0E]/95 to-transparent">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative rounded-2xl bg-[#12141D] border border-[#242838] focus-within:border-[#E5FF44]/50 shadow-2xl transition-all"
          >
            {/* Input Textarea */}
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything or request technical architecture... (Shift + Enter for new line)"
              className="w-full bg-transparent px-4 pt-3.5 pb-12 text-xs text-white placeholder-[#60657A] resize-none focus:outline-none leading-relaxed"
            />

            {/* Bottom Controls Bar inside composer */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
              {/* Left Utilities: Attachment & Model */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-[#71768B] hover:text-white hover:bg-[#1C1F2D] transition-colors"
                  title="Attach context or code file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <div className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#181B26] border border-[#242839] text-[#9EA4BA] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5FF44]" />
                  <span className="truncate max-w-[140px]">
                    {models.find(m => m.id === selectedModel)?.name || selectedModel}
                  </span>
                </div>
              </div>

              {/* Right Action: Send / Stop */}
              <div className="flex items-center gap-2">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={onStopStreaming}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 text-xs font-semibold transition-all active:scale-95"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={`flex items-center justify-center p-2 rounded-xl transition-all shadow-md active:scale-95 ${
                      input.trim()
                        ? 'bg-[#E5FF44] text-black hover:bg-[#D6F232] shadow-[0_0_12px_rgba(229,255,68,0.25)]'
                        : 'bg-[#1A1D2A] text-[#55596D] cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-[#555A6E] font-mono">
              EVILCLOWN AI executes live NVIDIA NIM inferences. Press Enter to submit.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

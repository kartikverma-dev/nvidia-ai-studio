import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Square, 
  Paperclip, 
  Copy, 
  Check, 
  User, 
  Sparkles, 
  Terminal, 
  Cpu, 
  CornerDownLeft
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
      title: "Distributed Fault-Tolerant Cache",
      prompt: "Design a fault-tolerant microservice architecture with Redis token-bucket rate limiting and zero-downtime fallback.",
      icon: Cpu
    },
    {
      title: "Debug Python Asyncio Memory Leaks",
      prompt: "Analyze common causes of task starvation and memory leaks in Python asyncio with defensive code examples.",
      icon: Terminal
    },
    {
      title: "NVIDIA TensorRT-LLM Inference",
      prompt: "Outline the deployment steps for optimizing LLM inference using NVIDIA TensorRT-LLM and Triton server.",
      icon: Sparkles
    }
  ];

  const currentModelName = models.find(m => m.id === selectedModel)?.name || selectedModel.split('/').pop() || selectedModel;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] relative overflow-hidden">
      {/* Scrollable Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          /* Empty State styled as macOS Widget Deck */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto space-y-6">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-2xl">
              <svg className="w-7 h-7 text-[#E5FF44]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="m2 17 10 5 10-5" />
                <path d="m2 12 10 5 10-5" />
              </svg>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#E5FF44] ring-2 ring-[#08090C]" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                EVILCLOWN <span className="text-[#E5FF44]">AI</span>
              </h2>
              <p className="text-xs text-[#8E93A6] mt-1 leading-relaxed">
                Native macOS workspace connected to live NVIDIA NIM inference engines.
              </p>
            </div>

            {/* Quick Starters */}
            <div className="grid grid-cols-1 gap-2 w-full pt-2">
              {quickPrompts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(item.prompt);
                      textareaRef.current?.focus();
                    }}
                    className="flex items-center gap-3 p-3 text-left rounded-xl macos-card hover:bg-white/[0.06] hover:border-[#E5FF44]/30 transition-all text-xs text-[#D1D5E5] group"
                  >
                    <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[#E5FF44] group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white group-hover:text-[#E5FF44] transition-colors text-[12px]">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#63687E] truncate mt-0.5">
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
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <svg className="w-3.5 h-3.5 text-[#E5FF44]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="m2 17 10 5 10-5" />
                    </svg>
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all ${
                    isUser
                      ? 'bg-white/[0.08] border border-white/[0.12] text-white shadow-md'
                      : 'macos-card text-[#E1E4F2] w-full'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/[0.06]">
                    <span className="font-mono text-[10px] text-[#71768B]">
                      {isUser ? 'You' : msg.model ? msg.model.split('/').pop() : 'NVIDIA NIM'}
                    </span>
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#71768B] hover:text-[#E5FF44] transition-all p-0.5 rounded"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-[#E5FF44]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <div className="prose prose-invert prose-xs max-w-none break-words leading-normal">
                    {msg.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <span className="inline-block w-2 h-4 bg-[#E5FF44] animate-pulse rounded-sm" />
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-white/[0.1] border border-white/[0.15] flex items-center justify-center shrink-0 mt-0.5 text-[#C5C9D8]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* macOS Floating Island Composer */}
      <div className="p-4 bg-gradient-to-t from-[#08090C] via-[#08090C]/90 to-transparent">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative rounded-2xl macos-composer focus-within:border-[#E5FF44]/60 transition-all shadow-2xl"
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
              placeholder="Send instruction or query to NVIDIA NIM... (Shift + Enter for newline)"
              className="w-full bg-transparent px-4 pt-3 pb-12 text-xs text-white placeholder-[#5A6075] resize-none focus:outline-none leading-relaxed"
            />

            {/* macOS Inner Controls Bar */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
              {/* Left Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-[#787E96] hover:text-white hover:bg-white/[0.08] transition-colors"
                  title="Attach context file"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>

                <div className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[#9EA4BA] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5FF44]" />
                  <span className="truncate max-w-[130px] font-medium">
                    {currentModelName}
                  </span>
                </div>
              </div>

              {/* Right Action: Send / Stop Button */}
              <div className="flex items-center gap-2">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={onStopStreaming}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 text-xs font-semibold transition-all active:scale-95"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all active:scale-95 shadow-md ${
                      input.trim()
                        ? 'bg-[#E5FF44] text-black hover:bg-[#D6F232] shadow-[0_0_15px_rgba(229,255,68,0.25)]'
                        : 'bg-white/[0.06] text-[#555A6E] cursor-not-allowed border border-white/[0.05]'
                    }`}
                  >
                    <span>Send</span>
                    <CornerDownLeft className="w-3 h-3 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>
          </form>
          <div className="text-center mt-1.5">
            <span className="text-[10px] text-[#555A6E] font-mono">
              EVILCLOWN macOS AI Studio • Return to send, Shift + Return for new line
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

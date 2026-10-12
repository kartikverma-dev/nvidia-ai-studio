import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Square, 
  Paperclip, 
  Mic, 
  MicOff, 
  Copy, 
  Check, 
  User, 
  Sparkles, 
  Terminal, 
  Cpu, 
  CornerDownLeft,
  Download,
  Share2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, Model } from '../types';
import { MacOSCodeBlock } from './MacOSCodeBlock';
import { playSendSound, playCompletionChime } from '../utils/audio';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  models: Model[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
  onOpenArtifact?: (code: string, language: string) => void;
  soundEnabled?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isStreaming,
  onStopStreaming,
  models,
  selectedModel,
  onSelectModel,
  onOpenArtifact,
  soundEnabled = true
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Audio completion chime trigger when streaming completes
  useEffect(() => {
    if (!isStreaming && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content) {
        playCompletionChime(soundEnabled);
      }
    }
  }, [isStreaming]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + transcript);
        }
      };
      rec.onerror = () => {
        setIsRecording(false);
      };
      rec.onend = () => {
        setIsRecording(false);
      };
      recognitionRef.current = rec;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isStreaming) return;
    playSendSound(soundEnabled);
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

  const exportConversation = () => {
    if (messages.length === 0) return;
    const content = messages.map(m => `### ${m.role === 'user' ? 'User' : 'Assistant (' + (m.model || 'NIM') + ')'}\n*${new Date(m.timestamp).toLocaleString()}*\n\n${m.content}\n\n---\n`).join('\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evilclown-chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickPrompts = [
    {
      title: "Interactive React Dashboard Widget",
      prompt: "Generate a complete single-file interactive SVG or HTML/Tailwind analytics widget with animated charts and dark theme.",
      icon: Sparkles
    },
    {
      title: "Distributed Fault-Tolerant Cache",
      prompt: "Design a fault-tolerant microservice architecture with Redis token-bucket rate limiting and zero-downtime fallback.",
      icon: Cpu
    },
    {
      title: "Python Async Deadlock Diagnosis",
      prompt: "Analyze common causes of task starvation and memory leaks in Python asyncio with defensive code examples.",
      icon: Terminal
    }
  ];

  const currentModelName = models.find(m => m.id === selectedModel)?.name || selectedModel.split('/').pop() || selectedModel;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] relative overflow-hidden">
      {/* Session Header Utility Bar */}
      {messages.length > 0 && (
        <div className="px-6 py-2 border-b border-white/[0.05] bg-white/[0.01] flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-[#787E96] font-mono text-[11px]">
            <span>{messages.length} messages</span>
            <span>•</span>
            <span className="text-[#E5FF44]">{currentModelName}</span>
          </div>

          <button
            onClick={exportConversation}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#8E93A6] hover:text-white bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.15] transition-all"
            title="Export session to Markdown"
          >
            <Download className="w-3 h-3" />
            <span>Export .md</span>
          </button>
        </div>
      )}

      {/* Scrollable Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          /* Empty State macOS Deck */
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
                Native macOS workspace with Live Artifacts and NVIDIA NIM engines.
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

                  {/* Markdown Renderer with Custom macOS Code Block Component */}
                  <div className="prose prose-invert prose-xs max-w-none break-words leading-normal">
                    {msg.content ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const isInline = !match && !String(children).includes('\n');
                            if (isInline) {
                              return (
                                <code className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[#E5FF44] font-mono text-[11px]" {...props}>
                                  {children}
                                </code>
                              );
                            }
                            return (
                              <MacOSCodeBlock
                                language={match ? match[1] : 'text'}
                                value={String(children).replace(/\n$/, '')}
                                onOpenArtifact={onOpenArtifact}
                              />
                            );
                          }
                        }}
                      >
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
              placeholder={isRecording ? "Listening to your voice..." : "Send instruction or query to NVIDIA NIM... (Shift + Return for newline)"}
              className={`w-full bg-transparent px-4 pt-3 pb-12 text-xs text-white placeholder-[#5A6075] resize-none focus:outline-none leading-relaxed ${
                isRecording ? 'placeholder-[#E5FF44] animate-pulse' : ''
              }`}
            />

            {/* macOS Inner Controls Bar */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
              {/* Left Toolbar: Attachment & Mic Dictation */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-[#787E96] hover:text-white hover:bg-white/[0.08] transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>

                {/* Voice Dictation Button */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`p-1.5 rounded-lg transition-all ${
                    isRecording 
                      ? 'bg-[#E5FF44] text-black shadow-[0_0_10px_#E5FF44] animate-pulse' 
                      : 'text-[#787E96] hover:text-white hover:bg-white/[0.08]'
                  }`}
                  title={isRecording ? "Stop voice dictation" : "Dictate prompt with microphone"}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>

                <div className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[#9EA4BA] flex items-center gap-1.5 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5FF44]" />
                  <span className="truncate max-w-[130px] font-medium">
                    {currentModelName}
                  </span>
                </div>
              </div>

              {/* Right Action: Send / Stop */}
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
              EVILCLOWN macOS AI Studio • Return to send, Shift + Return for new line • Voice Dictation enabled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

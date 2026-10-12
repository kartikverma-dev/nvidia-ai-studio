import React, { useState } from 'react';
import { Code, Play, Copy, Check, Terminal, Bug, Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Model } from '../types';
import { runPlaygroundInference } from '../api';

interface CodeAssistantViewProps {
  models: Model[];
  selectedModel: string;
  onRecordCall: () => void;
}

export const CodeAssistantView: React.FC<CodeAssistantViewProps> = ({
  models,
  selectedModel,
  onRecordCall
}) => {
  const [mode, setMode] = useState<'explain' | 'debug' | 'refactor' | 'generate'>('debug');
  const [codeSnippet, setCodeSnippet] = useState(`async function fetchUserData(userId: string) {
  const user = await db.users.find({ id: userId });
  // Potential unhandled null or async leak
  const profile = await http.get('/api/profile/' + user.profileId);
  return { ...user, ...profile.data };
}`);
  const [instructions, setInstructions] = useState('Identify potential concurrency bugs, missing null safety, and refactor with resilient try/catch and typings.');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleExecute = async () => {
    if (!codeSnippet.trim() || loading) return;
    setLoading(true);

    const systemPromptMap = {
      explain: "You are a principal engineer. Explain the provided code thoroughly: architectural intent, algorithm complexity (Big O), and lifecycle considerations.",
      debug: "You are an elite software debugger. Identify security vulnerabilities, memory leaks, concurrency races, unhandled promise rejections, and provide the fixed code.",
      refactor: "You are a clean-code specialist. Refactor the code for maximum modularity, readability, idiomatic conventions, and performance.",
      generate: "You are a systems programmer. Generate complete, production-grade code adhering to modern standards and best practices."
    };

    const userPrompt = `Mode: ${mode.toUpperCase()}
User Instructions: ${instructions}

Code to analyze:
\`\`\`
${codeSnippet}
\`\`\``;

    try {
      const res = await runPlaygroundInference({
        model: selectedModel,
        system_prompt: systemPromptMap[mode],
        user_prompt: userPrompt,
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 2048
      });

      if (res.success) {
        setOutput(res.output);
        onRecordCall();
      } else {
        setOutput(`Execution failed: ${res.error}`);
      }
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] overflow-hidden">
      {/* macOS Header Bar */}
      <div className="h-12 border-b border-white/[0.07] bg-white/[0.02] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Code className="w-4 h-4 text-[#E5FF44]" />
          <span className="text-xs font-semibold text-white tracking-tight">
            AI Coding Assistant
          </span>

          {/* macOS Segmented Control */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08] ml-4">
            {[
              { id: 'debug', label: 'Debug', icon: Bug },
              { id: 'refactor', label: 'Refactor', icon: RefreshCw },
              { id: 'explain', label: 'Explain', icon: Terminal },
              { id: 'generate', label: 'Generate', icon: Sparkles },
            ].map((m) => {
              const Icon = m.icon;
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-[#E5FF44] text-black font-semibold shadow-sm'
                      : 'text-[#8E93A6] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="text-[11px]">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleExecute}
          disabled={loading || !codeSnippet.trim()}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-semibold text-xs transition-all active:scale-95 shadow-md ${
            loading || !codeSnippet.trim()
              ? 'bg-white/[0.05] text-[#63687E] cursor-not-allowed border border-white/[0.04]'
              : 'bg-[#E5FF44] text-black hover:bg-[#D6F232] shadow-[0_0_15px_rgba(229,255,68,0.22)]'
          }`}
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{loading ? 'Analyzing...' : 'Execute'}</span>
        </button>
      </div>

      {/* Dual Workspace Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.07] overflow-hidden">
        {/* Left: Input Code & Instructions */}
        <div className="flex-1 flex flex-col p-6 space-y-4 bg-black/20 overflow-y-auto">
          <div className="flex-1 flex flex-col min-h-[220px]">
            <label className="text-[10px] font-semibold text-[#8E93A6] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Code Editor</span>
              <span className="font-mono text-[10px] text-[#E5FF44]">TypeScript / Python</span>
            </label>
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="Paste code snippet..."
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-xs text-[#E1E4F2] font-mono focus:outline-none focus:border-[#E5FF44]/60 resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-[#8E93A6] uppercase tracking-wider mb-1.5">
              Refinement Directives
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Directives..."
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5FF44]/60"
            />
          </div>
        </div>

        {/* Right: Output */}
        <div className="flex-1 flex flex-col p-6 space-y-3 bg-transparent overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#8E93A6] uppercase tracking-wider">
              Analysis & Solution
            </span>
            <button
              onClick={copyResult}
              disabled={!output}
              className="p-1 rounded-lg text-[#8E93A6] hover:text-[#E5FF44] hover:bg-white/10 transition-colors"
              title="Copy output"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#E5FF44]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex-1 rounded-2xl macos-card p-4 overflow-y-auto">
            {output ? (
              <div className="prose prose-invert prose-xs max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {output}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-[#555A6E] text-xs space-y-2">
                <Terminal className="w-8 h-8 text-white/10" />
                <span>Select a mode and click "Execute" to run code analysis.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

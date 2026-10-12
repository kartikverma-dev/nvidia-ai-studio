import React, { useState } from 'react';
import { Play, Copy, Check, Sliders, Clock, Hash, AlertCircle, RefreshCw, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Model } from '../types';
import { runPlaygroundInference } from '../api';

interface PlaygroundViewProps {
  models: Model[];
  selectedModel: string;
  onSelectModel: (m: string) => void;
  onRecordCall: () => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({
  models,
  selectedModel,
  onSelectModel,
  onRecordCall
}) => {
  const [systemPrompt, setSystemPrompt] = useState('You are an expert AI systems architect and performance engineer.');
  const [userPrompt, setUserPrompt] = useState('Explain how speculative decoding accelerates transformer inference latency.');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(1024);

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [metrics, setMetrics] = useState<{
    latencyMs?: number;
    tokens?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    finishReason?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    if (!userPrompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await runPlaygroundInference({
        model: selectedModel,
        system_prompt: systemPrompt,
        user_prompt: userPrompt,
        temperature,
        top_p: topP,
        max_tokens: maxTokens
      });

      if (res.success) {
        setOutput(res.output);
        setMetrics({
          latencyMs: res.latency_ms,
          tokens: res.tokens,
          finishReason: res.finish_reason
        });
        onRecordCall();
      } else {
        setError(res.error || 'Inference execution failed');
      }
    } catch (e: any) {
      setError(e.message || 'Error executing request');
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] overflow-hidden">
      {/* macOS Header Bar */}
      <div className="h-12 border-b border-white/[0.07] bg-white/[0.02] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#E5FF44]" />
          <span className="text-xs font-semibold text-white tracking-tight">
            Parameter Inspector & Lab
          </span>
        </div>

        <button
          onClick={handleRun}
          disabled={loading || !userPrompt.trim()}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-semibold text-xs transition-all active:scale-95 shadow-md ${
            loading || !userPrompt.trim()
              ? 'bg-white/[0.05] text-[#63687E] cursor-not-allowed border border-white/[0.04]'
              : 'bg-[#E5FF44] text-black hover:bg-[#D6F232] shadow-[0_0_15px_rgba(229,255,68,0.22)]'
          }`}
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{loading ? 'Evaluating...' : 'Run Lab'}</span>
        </button>
      </div>

      {/* Dual Panel Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.07] overflow-hidden">
        {/* Left Panel: Sliders & Prompts */}
        <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto bg-black/20">
          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-[#8E93A6] uppercase tracking-wider">
                Target NIM Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5FF44]/60"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#141620] text-white">
                    {m.name} ({m.owner})
                  </option>
                ))}
              </select>
            </div>

            {/* macOS Sliders Card */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 rounded-xl macos-card">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#8E93A6] text-[10px]">Temp</span>
                  <span className="font-mono text-[#E5FF44] text-[10px] font-bold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-[#E5FF44] cursor-pointer"
                />
              </div>

              <div className="p-2.5 rounded-xl macos-card">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#8E93A6] text-[10px]">Top P</span>
                  <span className="font-mono text-[#E5FF44] text-[10px] font-bold">{topP}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full accent-[#E5FF44] cursor-pointer"
                />
              </div>

              <div className="p-2.5 rounded-xl macos-card">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#8E93A6] text-[10px]">Max Tokens</span>
                  <span className="font-mono text-[#E5FF44] text-[10px] font-bold">{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="128"
                  max="4096"
                  step="128"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full accent-[#E5FF44] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div className="flex-1 flex flex-col min-h-[110px]">
            <label className="text-[10px] font-semibold text-[#8E93A6] uppercase tracking-wider mb-1.5">
              System Prompt
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="System prompt..."
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E5FF44]/60 resize-none font-mono"
            />
          </div>

          {/* User Prompt */}
          <div className="flex-1 flex flex-col min-h-[130px]">
            <label className="text-[10px] font-semibold text-[#8E93A6] uppercase tracking-wider mb-1.5">
              Input Prompt
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Enter user prompt..."
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E5FF44]/60 resize-none"
            />
          </div>
        </div>

        {/* Right Panel: Output & Telemetry */}
        <div className="flex-1 flex flex-col p-6 space-y-4 bg-transparent overflow-y-auto">
          {/* macOS Telemetry Pill */}
          <div className="flex items-center justify-between p-2.5 rounded-xl macos-card">
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-[#8E93A6] text-[11px]">
                <Clock className="w-3.5 h-3.5 text-[#E5FF44]" />
                <span>{metrics?.latencyMs ? `${metrics.latencyMs} ms` : '— ms'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#8E93A6] text-[11px]">
                <Hash className="w-3.5 h-3.5 text-[#E5FF44]" />
                <span>{metrics?.tokens ? `${metrics.tokens.total_tokens} tokens` : '— tokens'}</span>
              </div>
            </div>

            <button
              onClick={copyOutput}
              disabled={!output}
              className="p-1 rounded-lg text-[#8E93A6] hover:text-[#E5FF44] hover:bg-white/10 transition-colors"
              title="Copy output"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#E5FF44]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Output Display Card */}
          <div className="flex-1 rounded-2xl macos-card p-4 overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-start gap-2 mb-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {output ? (
              <div className="prose prose-invert prose-xs max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {output}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-[#555A6E] text-xs space-y-2">
                <Cpu className="w-8 h-8 text-white/10" />
                <span>Configure hyperparameters and click "Run Lab" to inspect outputs.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

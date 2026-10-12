import React, { useState } from 'react';
import { 
  Cpu, 
  Play, 
  Layers, 
  Terminal, 
  Sparkles, 
  Copy, 
  Check, 
  ShieldAlert,
  Code2,
  FileText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Model } from '../types';

interface SwarmViewProps {
  models: Model[];
  selectedModel: string;
  onRecordCall: () => void;
  isSwarmRunning: boolean;
  setIsSwarmRunning: (running: boolean) => void;
}

interface AgentState {
  id: string;
  name: string;
  role: string;
  icon: any;
  status: 'idle' | 'running' | 'completed' | 'error';
  durationMs?: number;
  output?: string;
}

export const SwarmView: React.FC<SwarmViewProps> = ({
  models,
  selectedModel,
  onRecordCall,
  isSwarmRunning,
  setIsSwarmRunning
}) => {
  const [objective, setObjective] = useState(
    'Build a high-performance distributed rate-limiter using Redis token-bucket algorithm, with circuit breaking and zero-downtime graceful fallback.'
  );
  const [activeTab, setActiveTab] = useState<'monitor' | 'synthesis'>('monitor');
  const [logs, setLogs] = useState<string[]>([]);
  const [synthesisResult, setSynthesisResult] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const [agents, setAgents] = useState<AgentState[]>([
    {
      id: 'agent-planner',
      name: 'System Architect',
      role: 'Architecture & Decomposition',
      icon: Layers,
      status: 'idle'
    },
    {
      id: 'agent-engineer',
      name: 'Core Engineer',
      role: 'Concrete Implementation & Code',
      icon: Code2,
      status: 'idle'
    },
    {
      id: 'agent-auditor',
      name: 'Security & QA Auditor',
      role: 'Threat Analysis & Resilience',
      icon: ShieldAlert,
      status: 'idle'
    },
    {
      id: 'agent-synthesizer',
      name: 'Swarm Synthesizer',
      role: 'Final Executive Deliverable',
      icon: Sparkles,
      status: 'idle'
    }
  ]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  const handleLaunchSwarm = async () => {
    if (!objective.trim() || isSwarmRunning) return;

    setIsSwarmRunning(true);
    setActiveTab('monitor');
    setLogs([]);
    setSynthesisResult('');

    setAgents(prev => prev.map(a => ({ ...a, status: 'idle', output: undefined, durationMs: undefined })));
    addLog(`Initiating EVILCLOWN AI Swarm with target model: ${selectedModel}`);

    try {
      const response = await fetch('/api/swarm/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective,
          model: selectedModel,
          temperature: 0.6
        })
      });

      if (!response.ok) {
        addLog(`Error: Swarm coordinator returned HTTP ${response.status}`);
        setIsSwarmRunning(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setIsSwarmRunning(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const raw = trimmed.replace('data: ', '').trim();

          if (raw === '[DONE]') {
            addLog('Swarm multi-agent orchestration completed.');
            setIsSwarmRunning(false);
            break;
          }

          try {
            const data = JSON.parse(raw);
            if (data.event === 'agent_started') {
              addLog(`Agent [${data.name}] activated: ${data.role}`);
              setAgents(prev => prev.map(a => 
                a.id === data.agent_id ? { ...a, status: 'running' } : a
              ));
            } else if (data.event === 'agent_completed') {
              addLog(`Agent [${data.name}] completed in ${data.duration_ms}ms.`);
              setAgents(prev => prev.map(a => 
                a.id === data.agent_id ? { ...a, status: 'completed', output: data.output, durationMs: data.duration_ms } : a
              ));
              onRecordCall();
            } else if (data.event === 'swarm_finished') {
              setSynthesisResult(data.synthesis);
              setActiveTab('synthesis');
            } else if (data.event === 'swarm_error') {
              addLog(`Swarm error: ${data.error}`);
            }
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (err: any) {
      addLog(`Network exception: ${err.message}`);
    } finally {
      setIsSwarmRunning(false);
    }
  };

  const copySynthesis = () => {
    if (!synthesisResult) return;
    navigator.clipboard.writeText(synthesisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] overflow-hidden">
      {/* macOS Header Bar */}
      <div className="h-12 border-b border-white/[0.07] bg-white/[0.02] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-[#E5FF44]" />
          <div>
            <h2 className="text-xs font-bold text-white tracking-tight">
              EVILCLOWN AGENT SWARM
            </h2>
          </div>
        </div>

        <button
          onClick={handleLaunchSwarm}
          disabled={isSwarmRunning || !objective.trim()}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold text-xs tracking-wide transition-all active:scale-95 shadow-md ${
            isSwarmRunning || !objective.trim()
              ? 'bg-white/[0.05] text-[#63687E] cursor-not-allowed border border-white/[0.04]'
              : 'bg-[#E5FF44] text-black hover:bg-[#D6F232] shadow-[0_0_18px_rgba(229,255,68,0.25)]'
          }`}
        >
          {isSwarmRunning ? (
            <>
              <span className="w-2 h-2 rounded-full bg-black animate-ping" />
              <span>Orchestrating...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Swarm</span>
            </>
          )}
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col p-6 space-y-5 overflow-y-auto">
        {/* Objective Box */}
        <div className="p-4 rounded-2xl macos-card space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold text-[#8E93A6] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#E5FF44]" />
              Swarm Mission Objective
            </label>
            <span className="text-[10px] font-mono text-[#E5FF44]">
              4 Autonomous Roles
            </span>
          </div>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            disabled={isSwarmRunning}
            placeholder="Define complex objective for the AI swarm..."
            rows={2}
            className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E5FF44]/60 resize-none leading-relaxed"
          />
        </div>

        {/* 4 Agent Pipeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            const isRunning = agent.status === 'running';
            const isCompleted = agent.status === 'completed';

            return (
              <div
                key={agent.id}
                className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                  isRunning
                    ? 'bg-white/[0.08] border-[#E5FF44]/60 shadow-[0_0_20px_rgba(229,255,68,0.15)] ring-1 ring-[#E5FF44]/30'
                    : isCompleted
                    ? 'macos-card border-white/[0.12]'
                    : 'bg-white/[0.02] border-white/[0.05] opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-xl ${isRunning ? 'bg-[#E5FF44]/20 text-[#E5FF44]' : 'bg-white/[0.05] text-[#8E93A6]'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isRunning 
                      ? 'bg-[#E5FF44] text-black animate-pulse'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/[0.05] text-[#63687E]'
                  }`}>
                    {agent.status.toUpperCase()}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-[#E5FF44]">0{index + 1}.</span>
                    <h3 className="font-bold text-xs text-white">{agent.name}</h3>
                  </div>
                  <p className="text-[11px] text-[#71768B] mt-0.5 leading-snug">
                    {agent.role}
                  </p>
                </div>

                {agent.durationMs && (
                  <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#8E93A6]">
                    <span>Latency</span>
                    <span className="text-[#E5FF44]">{agent.durationMs}ms</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View Tabs: Live Event Stream vs Final Deliverable */}
        <div className="flex-1 flex flex-col rounded-2xl macos-card overflow-hidden min-h-[280px]">
          <div className="flex items-center justify-between px-4 border-b border-white/[0.07] bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('monitor')}
                className={`py-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'monitor'
                    ? 'border-[#E5FF44] text-[#E5FF44]'
                    : 'border-transparent text-[#71768B] hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Live Event Stream</span>
              </button>
              <button
                onClick={() => setActiveTab('synthesis')}
                className={`py-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'synthesis'
                    ? 'border-[#E5FF44] text-[#E5FF44]'
                    : 'border-transparent text-[#71768B] hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Synthesis Artifact</span>
              </button>
            </div>

            {activeTab === 'synthesis' && synthesisResult && (
              <button
                onClick={copySynthesis}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#8E93A6] hover:text-white bg-white/[0.06] border border-white/[0.08] transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-[#E5FF44]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
            {activeTab === 'monitor' ? (
              <div className="space-y-1.5 text-[#A5ABBE]">
                {logs.length === 0 ? (
                  <div className="text-center py-10 text-[#565A6E]">
                    Swarm logs will stream in real-time once launched.
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="leading-relaxed hover:text-white transition-colors">
                      {log}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="font-sans text-xs">
                {synthesisResult ? (
                  <div className="prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {synthesisResult}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-10 text-[#565A6E]">
                    No synthesis generated yet. Click Launch Swarm to orchestrate.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

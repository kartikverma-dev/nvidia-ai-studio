import React from 'react';
import { BarChart2, Zap, Clock, Activity, Server } from 'lucide-react';
import { Model } from '../types';

interface UsageViewProps {
  totalCalls: number;
  models: Model[];
  selectedModel: string;
  hasNvidiaKey: boolean;
}

export const UsageView: React.FC<UsageViewProps> = ({
  totalCalls,
  models,
  selectedModel,
  hasNvidiaKey
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] p-8 overflow-y-auto">
      <div className="max-w-5xl w-full mx-auto space-y-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
            <BarChart2 className="w-5 h-5 text-[#E5FF44]" />
            Telemetry & NIM Usage Monitor
          </h2>
          <p className="text-xs text-[#8E93A6] mt-1">
            Real-time inference telemetry tracked from active NVIDIA NIM endpoints.
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl macos-card space-y-1">
            <span className="text-[10px] font-semibold text-[#8E93A6] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#E5FF44]" />
              Inference Requests
            </span>
            <div className="text-2xl font-mono font-bold text-white">{totalCalls}</div>
            <span className="text-[10px] text-[#555A6E]">Current session</span>
          </div>

          <div className="p-4 rounded-2xl macos-card space-y-1">
            <span className="text-[10px] font-semibold text-[#8E93A6] uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#E5FF44]" />
              Discovered Models
            </span>
            <div className="text-2xl font-mono font-bold text-white">{models.length}</div>
            <span className="text-[10px] text-[#555A6E]">NVIDIA NIM Catalog</span>
          </div>

          <div className="p-4 rounded-2xl macos-card space-y-1">
            <span className="text-[10px] font-semibold text-[#8E93A6] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#E5FF44]" />
              NIM Status
            </span>
            <div className="text-2xl font-mono font-bold text-emerald-400">
              {hasNvidiaKey ? '200 OK' : 'No Key'}
            </div>
            <span className="text-[10px] text-[#555A6E]">Active Connection</span>
          </div>

          <div className="p-4 rounded-2xl macos-card space-y-1">
            <span className="text-[10px] font-semibold text-[#8E93A6] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#E5FF44]" />
              Current Engine
            </span>
            <div className="text-xs font-mono font-bold text-white truncate mt-1">
              {selectedModel.split('/').pop()}
            </div>
            <span className="text-[10px] text-[#555A6E]">Primary Router</span>
          </div>
        </div>

        {/* Catalog */}
        <div className="p-5 rounded-2xl macos-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              NVIDIA NIM Model Catalog ({models.length})
            </h3>
            <span className="text-[11px] text-[#8E93A6] font-mono">
              Live Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
            {models.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs hover:border-[#E5FF44]/30 transition-all"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-white truncate text-[12px]">{m.name}</div>
                  <div className="text-[10px] font-mono text-[#71768B] truncate">{m.id}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#E5FF44]/15 text-[#E5FF44] shrink-0 border border-[#E5FF44]/30">
                  {m.owner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

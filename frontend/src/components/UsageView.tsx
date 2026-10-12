import React from 'react';
import { BarChart2, Zap, Clock, Hash, CheckCircle2, ShieldCheck, Activity, Server } from 'lucide-react';
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
    <div className="flex-1 flex flex-col h-full bg-[#0A0B0E] p-8 overflow-y-auto">
      <div className="max-w-5xl w-full mx-auto space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#E5FF44]" />
            Telemetry & NIM Usage Metrics
          </h2>
          <p className="text-xs text-[#8E93A6] mt-1">
            Real-time inference telemetry tracked from active NVIDIA NIM endpoints.
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#12141D] border border-[#202330] space-y-1">
            <span className="text-[11px] font-semibold text-[#8E93A6] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#E5FF44]" />
              Inference Requests
            </span>
            <div className="text-2xl font-mono font-bold text-white">{totalCalls}</div>
            <span className="text-[10px] text-[#63687E]">Tracked in current session</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#12141D] border border-[#202330] space-y-1">
            <span className="text-[11px] font-semibold text-[#8E93A6] uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#E5FF44]" />
              Available NIM Models
            </span>
            <div className="text-2xl font-mono font-bold text-white">{models.length}</div>
            <span className="text-[10px] text-[#63687E]">Discovered via NVIDIA API</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#12141D] border border-[#202330] space-y-1">
            <span className="text-[11px] font-semibold text-[#8E93A6] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#E5FF44]" />
              NIM Provider Status
            </span>
            <div className="text-2xl font-mono font-bold text-emerald-400">
              {hasNvidiaKey ? 'Operational' : 'No Key'}
            </div>
            <span className="text-[10px] text-[#63687E]">integrate.api.nvidia.com</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#12141D] border border-[#202330] space-y-1">
            <span className="text-[11px] font-semibold text-[#8E93A6] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#E5FF44]" />
              Target Model
            </span>
            <div className="text-xs font-mono font-bold text-white truncate mt-1">
              {selectedModel.split('/').pop()}
            </div>
            <span className="text-[10px] text-[#63687E]">Default routing engine</span>
          </div>
        </div>

        {/* Available Models Catalog */}
        <div className="p-5 rounded-2xl bg-[#12141D] border border-[#202330] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Discovered NVIDIA NIM Endpoints ({models.length})
            </h3>
            <span className="text-[11px] text-[#8E93A6] font-mono">
              Live API Catalog
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {models.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-[#0D0E15] border border-[#1E212E] flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-white truncate">{m.name}</div>
                  <div className="text-[10px] font-mono text-[#71768B] truncate">{m.id}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#181B26] text-[#E5FF44] shrink-0 border border-[#252838]">
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

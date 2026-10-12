import React from 'react';
import { X, Key, Cpu } from 'lucide-react';
import { Model } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasNvidiaKey: boolean;
  models: Model[];
  selectedModel: string;
  onSelectModel: (m: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  hasNvidiaKey,
  models,
  selectedModel,
  onSelectModel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl macos-window shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* macOS Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.03]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5FF44]" />
            <h3 className="text-xs font-bold text-white tracking-tight">
              Settings & Architecture
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8E93A6] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Key Status */}
          <div className="p-3 rounded-xl macos-card space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                <Key className="w-3.5 h-3.5 text-[#E5FF44]" />
                NVIDIA NIM API Key
              </span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                hasNvidiaKey ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'
              }`}>
                {hasNvidiaKey ? 'VERIFIED ACTIVE' : 'MISSING'}
              </span>
            </div>
            <p className="text-[11px] text-[#71768B] leading-relaxed">
              API key securely loaded in backend environment (<code className="text-[#E5FF44]">.env</code>).
            </p>
          </div>

          {/* Model selection */}
          <div className="space-y-1">
            <label className="font-semibold text-white uppercase text-[10px] tracking-wider">
              Default Inference Engine
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

          {/* Architecture info */}
          <div className="p-3 rounded-xl macos-card space-y-1.5">
            <div className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-[#E5FF44]" />
              Inference Protocol
            </div>
            <div className="text-[11px] text-[#71768B] space-y-0.5 font-mono">
              <div>• Base URL: integrate.api.nvidia.com/v1</div>
              <div>• Streaming: Server-Sent Events (SSE)</div>
              <div>• Client: HTTPX Async / FastAPI</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/[0.08] bg-white/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 rounded-xl bg-[#E5FF44] text-black font-bold text-xs hover:bg-[#D6F232] transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

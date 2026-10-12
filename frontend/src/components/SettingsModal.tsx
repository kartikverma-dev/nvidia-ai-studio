import React from 'react';
import { X, Key, Shield, Cpu, ExternalLink, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-[#10121A] border border-[#232738] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1F222F] bg-[#141622]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E5FF44]" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              EVILCLOWN AI Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8E93A6] hover:text-white hover:bg-[#1E2232] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* API Key Status */}
          <div className="p-3.5 rounded-xl bg-[#161824] border border-[#242838] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#E5FF44]" />
                NVIDIA NIM API Key
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                hasNvidiaKey ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'
              }`}>
                {hasNvidiaKey ? 'CONNECTED' : 'MISSING'}
              </span>
            </div>
            <p className="text-[11px] text-[#71768B] leading-relaxed">
              API keys are stored securely in the backend <code className="text-[#E5FF44]">.env</code> file and are never leaked to client browsers.
            </p>
          </div>

          {/* Default Model */}
          <div className="space-y-1.5">
            <label className="font-semibold text-white uppercase text-[11px] tracking-wider">
              Default Inference Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              className="w-full bg-[#161824] border border-[#242838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5FF44]/60"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.owner})
                </option>
              ))}
            </select>
          </div>

          {/* Architecture info */}
          <div className="p-3.5 rounded-xl bg-[#161824] border border-[#242838] space-y-2">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#E5FF44]" />
              Inference Architecture
            </div>
            <div className="text-[11px] text-[#71768B] space-y-1">
              <div>• Base URL: <code className="text-[#A5ABBF]">https://integrate.api.nvidia.com/v1</code></div>
              <div>• Protocol: HTTP/2 Async & Server-Sent Events (SSE)</div>
              <div>• Backend: FastAPI 0.110 + HTTPX Async Client</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1F222F] bg-[#141622] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#E5FF44] text-black font-semibold text-xs hover:bg-[#D6F232] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

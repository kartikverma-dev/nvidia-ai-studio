import React from 'react';
import { 
  ChevronDown, 
  Settings, 
  SlidersHorizontal,
  Activity,
  Layers
} from 'lucide-react';
import { Model } from '../types';

interface TopBarProps {
  title: string;
  models: Model[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  isSwarmActive: boolean;
  onOpenSettings: () => void;
  apiKeyConnected: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  models,
  selectedModel,
  onSelectModel,
  isSwarmActive,
  onOpenSettings,
  apiKeyConnected
}) => {
  const currentModelObj = models.find(m => m.id === selectedModel);
  const displayName = currentModelObj ? currentModelObj.name : selectedModel.split('/').pop() || selectedModel;

  return (
    <header className="h-12 macos-titlebar px-4 flex items-center justify-between shrink-0 select-none z-20 border-b border-white/[0.07]">
      {/* Left: Window Path & Title */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#6B7280] font-medium text-[11px]">Workspace</span>
          <span className="text-[#4B5563] text-[10px]">/</span>
          <span className="text-white font-semibold text-[12px] tracking-tight truncate max-w-[200px] sm:max-w-[320px]">
            {title}
          </span>
        </div>

        {isSwarmActive && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E5FF44]/15 border border-[#E5FF44]/30 text-[#E5FF44] text-[10px] font-mono font-medium animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5FF44] shadow-[0_0_6px_#E5FF44]" />
            Swarm Running
          </div>
        )}
      </div>

      {/* Right: macOS Segmented Controls & Actions */}
      <div className="flex items-center gap-2">
        {/* Model Selector Pill */}
        <div className="relative flex items-center">
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="appearance-none bg-white/[0.05] hover:bg-white/[0.09] text-[11px] font-medium text-[#E1E4F0] pl-2.5 pr-7 py-1 rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#E5FF44]/50 cursor-pointer transition-all max-w-[190px] sm:max-w-[240px] truncate"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#141620] text-white">
                {m.name || m.id} {m.is_default ? '★' : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-2 w-3 h-3 text-[#787E96] pointer-events-none" />
        </div>

        {/* API Status Pill */}
        <div 
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-[#8E93A6]"
          title={apiKeyConnected ? "NVIDIA NIM API key active" : "No API key"}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${apiKeyConnected ? 'bg-[#E5FF44] shadow-[0_0_5px_#E5FF44]' : 'bg-red-400'}`} />
          <span>{apiKeyConnected ? 'NIM 200' : 'No Key'}</span>
        </div>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1 rounded-lg text-[#787E96] hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/[0.06] transition-all"
          title="macOS Settings Sheet"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};

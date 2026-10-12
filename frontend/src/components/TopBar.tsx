import React from 'react';
import { 
  Cpu, 
  ChevronDown, 
  Settings, 
  ShieldCheck, 
  ExternalLink,
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
    <header className="h-14 border-b border-[#1F222E] bg-[#0D0E12]/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: Title & Swarm indicator */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-white tracking-wide truncate max-w-xs sm:max-w-md">
          {title}
        </h1>

        {isSwarmActive && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E5FF44]/15 border border-[#E5FF44]/30 text-[#E5FF44] text-[11px] font-medium animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5FF44]" />
            Swarm Orchestrating
          </div>
        )}
      </div>

      {/* Right Controls: Model Selector, Key Status, Settings */}
      <div className="flex items-center gap-2.5">
        {/* Model Picker */}
        <div className="relative">
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="appearance-none bg-[#141620] hover:bg-[#1A1D2A] text-xs font-medium text-[#E1E4F0] pl-3 pr-8 py-1.5 rounded-lg border border-[#272B3B] focus:outline-none focus:border-[#E5FF44]/60 cursor-pointer transition-colors max-w-[200px] sm:max-w-[260px] truncate"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#141620] text-white">
                {m.name || m.id}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-[#8E93A6] pointer-events-none" />
        </div>

        {/* API Status Pill */}
        <div 
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141620] border border-[#272B3B] text-[11px]"
          title={apiKeyConnected ? "NVIDIA NIM API key loaded & verified" : "No API key configured"}
        >
          <span className={`w-2 h-2 rounded-full ${apiKeyConnected ? 'bg-[#E5FF44]' : 'bg-red-400'}`} />
          <span className="text-[#8E93A6] font-mono">
            {apiKeyConnected ? 'NIM 200 OK' : 'No Key'}
          </span>
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-[#8E93A6] hover:text-white hover:bg-[#1A1D2A] border border-transparent hover:border-[#272B3B] transition-colors"
          title="Settings & Config"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

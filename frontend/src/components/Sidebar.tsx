import React, { useState } from 'react';
import { 
  MessageSquare, 
  Terminal, 
  Cpu, 
  Play, 
  BarChart2, 
  Settings, 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  ChevronDown, 
  ChevronLeft,
  Sparkles,
  Zap,
  Code
} from 'lucide-react';
import { Conversation } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  totalCalls: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isCollapsed,
  setIsCollapsed,
  totalCalls
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWorkspace, setActiveWorkspace] = useState('Default Swarm');

  const navItems = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'playground', label: 'Model Playground', icon: Play },
    { id: 'swarm', label: 'AI Swarm', icon: Cpu, badge: 'NIM' },
    { id: 'code', label: 'Coding Assistant', icon: Code },
    { id: 'usage', label: 'Usage Dashboard', icon: BarChart2 },
  ];

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside 
      className={`relative flex flex-col h-screen bg-[#0D0E12] border-r border-[#1F222E] transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64 sm:w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1F222E]/80">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* EVILCLOWN Geometric Icon */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#161822] border border-[#2B2F40] shadow-inner group-hover:border-[#E5FF44]/50 transition-colors shrink-0">
            <svg className="w-5 h-5 text-[#E5FF44]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="m2 17 10 5 10-5" />
              <path d="m2 12 10 5 10-5" />
            </svg>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#E5FF44] animate-pulse" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-wider text-sm text-white">EVILCLOWN</span>
                <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-[#E5FF44]/10 text-[#E5FF44] font-semibold">AI</span>
              </div>
              <span className="text-[11px] text-[#8E93A6] truncate">NVIDIA NIM Studio</span>
            </div>
          )}
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg text-[#8E93A6] hover:text-white hover:bg-[#1A1D27] transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Workspace Selector */}
      {!isCollapsed && (
        <div className="px-3 pt-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#14161F] border border-[#222533] text-xs text-[#C5C9D8] cursor-pointer hover:border-[#E5FF44]/40 transition-colors">
            <div className="flex items-center gap-2 truncate">
              <div className="w-2 h-2 rounded-full bg-[#E5FF44]" />
              <span className="truncate font-medium">{activeWorkspace}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8E93A6]" />
          </div>
        </div>
      )}

      {/* Prominent Action Button: New Chat / Task */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-md active:scale-95 ${
            isCollapsed 
              ? 'bg-[#E5FF44] text-black hover:bg-[#D6F232]' 
              : 'bg-[#E5FF44] text-black hover:bg-[#D6F232] shadow-[0_0_15px_rgba(229,255,68,0.2)]'
          }`}
          title="Start New Chat"
        >
          <Plus className="w-4 h-4 text-black stroke-[2.5]" />
          {!isCollapsed && <span>New Session</span>}
        </button>
      </div>

      {/* Navigation Modules */}
      <div className="px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-[#1E212E] text-white border-l-2 border-[#E5FF44] shadow-sm' 
                  : 'text-[#9AA0B5] hover:text-white hover:bg-[#161822]'
              }`}
              title={item.label}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E5FF44]' : 'text-[#8E93A6]'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!isCollapsed && item.badge && (
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#E5FF44]/10 text-[#E5FF44] font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conversation History & Search */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col min-h-0 mt-4 px-3 border-t border-[#1F222E]/80 pt-3">
          {/* Search bar */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#62677C]" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#14161F] border border-[#222533] text-xs text-[#E1E4F0] placeholder-[#62677C] focus:outline-none focus:border-[#E5FF44]/60 transition-colors"
            />
          </div>

          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#63687E] px-1 mb-1.5 flex items-center justify-between">
            <span>Recent History</span>
            <span className="text-[10px] font-normal">{filteredConversations.length}</span>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
            {filteredConversations.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#63687E]">
                No conversations yet
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = activeConversationId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectConversation(c.id);
                      setActiveTab('chat');
                    }}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-[#1C1F2B] text-white border border-[#2C3042]' 
                        : 'text-[#8E93A6] hover:text-[#D5D8E6] hover:bg-[#14161F]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#E5FF44]' : 'text-[#63687E]'}`} />
                      <span className="truncate">{c.title || 'Untitled Session'}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(c.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#63687E] hover:text-red-400 rounded transition-all"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Bottom Compact Usage / Status Panel */}
      <div className="p-3 border-t border-[#1F222E]/80 bg-[#0A0B0E]">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-[#12141C] border border-[#202330] space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8E93A6] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5FF44]" />
                NVIDIA NIM API
              </span>
              <span className="font-mono text-[#E5FF44] font-medium text-[10px]">Active</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#63687E]">
              <span>Inference Calls</span>
              <span className="font-mono text-white font-medium">{totalCalls}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="NVIDIA NIM Connected">
            <div className="w-2 h-2 rounded-full bg-[#E5FF44] ring-4 ring-[#E5FF44]/20" />
          </div>
        )}
      </div>
    </aside>
  );
};

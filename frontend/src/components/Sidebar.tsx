import React, { useState } from 'react';
import { 
  MessageSquare, 
  Cpu, 
  Play, 
  BarChart2, 
  Plus, 
  Search, 
  Trash2, 
  ChevronDown, 
  ChevronLeft,
  Code,
  FolderKanban,
  Sparkles
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
  const [activeWorkspace, setActiveWorkspace] = useState('Personal Studio');

  const navItems = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, shortcut: '⌘1' },
    { id: 'playground', label: 'Playground', icon: Play, shortcut: '⌘2' },
    { id: 'swarm', label: 'AI Swarm', icon: Cpu, badge: 'NIM', shortcut: '⌘3' },
    { id: 'code', label: 'Coding Lab', icon: Code, shortcut: '⌘4' },
    { id: 'usage', label: 'Telemetry', icon: BarChart2, shortcut: '⌘5' },
  ];

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside 
      className={`relative flex flex-col h-screen macos-sidebar transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64 sm:w-72'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-white/[0.07]">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.1] shadow-sm">
            <svg className="w-4 h-4 text-[#E5FF44]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="m2 17 10 5 10-5" />
              <path d="m2 12 10 5 10-5" />
            </svg>
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#E5FF44]" />
          </div>

          {!isCollapsed && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wider">EVILCLOWN</span>
              <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-[#E5FF44]/15 text-[#E5FF44] font-bold">PRO</span>
            </div>
          )}
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md text-[#787E96] hover:text-white hover:bg-white/10 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Workspace Selector (macOS Dropdown style) */}
      {!isCollapsed && (
        <div className="px-3 pt-3">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] text-xs text-[#D1D5E5] cursor-pointer transition-all">
            <div className="flex items-center gap-2 truncate">
              <FolderKanban className="w-3.5 h-3.5 text-[#E5FF44]" />
              <span className="truncate font-medium text-[11px]">{activeWorkspace}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#787E96]" />
          </div>
        </div>
      )}

      {/* Prominent Action Button: New Chat / Task */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl font-semibold text-xs transition-all active:scale-[0.98] shadow-md ${
            isCollapsed 
              ? 'justify-center bg-[#E5FF44] text-black hover:bg-[#D6F232]' 
              : 'bg-[#E5FF44] text-black hover:bg-[#D6F232] shadow-[0_0_15px_rgba(229,255,68,0.22)]'
          }`}
          title="New Session"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            {!isCollapsed && <span>New Session</span>}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10 font-bold">
              ⌘N
            </span>
          )}
        </button>
      </div>

      {/* Navigation Modules (macOS Sidebar Items) */}
      <div className="px-2 space-y-0.5">
        {!isCollapsed && (
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#63687E] px-2.5 py-1">
            Workspace
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-white/[0.12] text-white shadow-sm ring-1 ring-white/10' 
                  : 'text-[#8E93A6] hover:text-white hover:bg-white/[0.05]'
              }`}
              title={item.label}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E5FF44]' : 'text-[#787E96]'}`} />
                {!isCollapsed && <span className="truncate text-[12px]">{item.label}</span>}
              </div>
              {!isCollapsed && (
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="text-[8px] font-mono uppercase px-1 py-0.5 rounded bg-[#E5FF44]/20 text-[#E5FF44] font-bold">
                      {item.badge}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-[#585E75]">
                    {item.shortcut}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Conversation History & Search (macOS Notes style) */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col min-h-0 mt-3 px-3 border-t border-white/[0.07] pt-3">
          {/* macOS Search bar */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#63687E]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs text-[#E1E4F0] placeholder-[#5A5F73] focus:outline-none focus:border-[#E5FF44]/50 transition-colors"
            />
            <span className="absolute right-2 top-2 text-[10px] font-mono text-[#5A5F73]">⌘K</span>
          </div>

          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#63687E] px-1 mb-1 flex items-center justify-between">
            <span>Sessions</span>
            <span className="text-[9px] font-mono text-[#505466]">{filteredConversations.length}</span>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
            {filteredConversations.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#5A5F73]">
                No sessions
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
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-[#E5FF44]/15 text-white border border-[#E5FF44]/30' 
                        : 'text-[#8E93A6] hover:text-[#E1E4F0] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#E5FF44]' : 'text-[#63687E]'}`} />
                      <span className="truncate text-[11px]">{c.title || 'Untitled Session'}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(c.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-[#63687E] hover:text-red-400 rounded transition-all"
                      title="Delete session"
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

      {/* Bottom macOS Status Bar Widget */}
      <div className="p-3 border-t border-white/[0.07] bg-black/30">
        {!isCollapsed ? (
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8E93A6] flex items-center gap-1.5 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5FF44] shadow-[0_0_6px_#E5FF44]" />
                NVIDIA NIM 200 OK
              </span>
              <span className="font-mono text-[#E5FF44] text-[10px]">Live</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#5A5F73] font-mono">
              <span>Telemetry Count</span>
              <span className="text-white font-medium">{totalCalls}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="NVIDIA NIM Online">
            <div className="w-2 h-2 rounded-full bg-[#E5FF44] ring-4 ring-[#E5FF44]/20" />
          </div>
        )}
      </div>
    </aside>
  );
};

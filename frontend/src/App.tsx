import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ChatView } from './components/ChatView';
import { PlaygroundView } from './components/PlaygroundView';
import { SwarmView } from './components/SwarmView';
import { CodeAssistantView } from './components/CodeAssistantView';
import { UsageView } from './components/UsageView';
import { SettingsModal } from './components/SettingsModal';
import { ArtifactCanvas } from './components/ArtifactCanvas';
import { Model, Conversation, ChatMessage } from './types';
import { fetchHealth, fetchModels, streamChatCompletion } from './api';

const DEFAULT_VERIFIED_MODEL = 'meta/llama-3.2-11b-vision-instruct';

export const App: React.FC = () => {
  // LocalStorage-backed state initializers
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('evilclown_active_tab') || 'chat';
  });
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('evilclown_sound') !== 'false';
  });

  // Models state
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('evilclown_model') || DEFAULT_VERIFIED_MODEL;
  });
  const [hasNvidiaKey, setHasNvidiaKey] = useState<boolean>(true);

  // Telemetry metrics
  const [totalCalls, setTotalCalls] = useState<number>(() => {
    return parseInt(localStorage.getItem('evilclown_calls') || '0', 10);
  });

  // Swarm state
  const [isSwarmRunning, setIsSwarmRunning] = useState<boolean>(false);

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('evilclown_conversations');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return [
      {
        id: 'conv-1',
        title: 'Distributed System Architecture',
        messages: [],
        updatedAt: new Date().toISOString()
      }
    ];
  });
  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return localStorage.getItem('evilclown_active_conv') || 'conv-1';
  });

  // Live Artifact Canvas state
  const [artifactState, setArtifactState] = useState<{
    isOpen: boolean;
    code: string;
    language: string;
  }>({
    isOpen: false,
    code: '',
    language: 'typescript'
  });

  // Streaming state for Chat
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('evilclown_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('evilclown_active_conv', activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    localStorage.setItem('evilclown_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('evilclown_model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('evilclown_calls', totalCalls.toString());
  }, [totalCalls]);

  useEffect(() => {
    localStorage.setItem('evilclown_sound', soundEnabled.toString());
  }, [soundEnabled]);

  // Load models & backend health on start
  useEffect(() => {
    async function init() {
      try {
        const health = await fetchHealth();
        setHasNvidiaKey(Boolean(health.has_nvidia_key));
      } catch (err) {
        console.warn('Backend health check error:', err);
      }

      try {
        const fetchedModels = await fetchModels();
        if (fetchedModels.length > 0) {
          setModels(fetchedModels);
          if (!selectedModel || selectedModel === 'meta/llama-3.1-70b-instruct') {
            const defaultModel = fetchedModels.find(m => m.is_default) || fetchedModels[0];
            setSelectedModel(defaultModel.id);
          }
        }
      } catch (err) {
        console.warn('Error fetching models:', err);
      }
    }
    init();
  }, []);

  // Keyboard shortcut listener for macOS navigation (⌘1..5, ⌘N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (!isCmdOrCtrl) return;

      if (e.key === '1') { e.preventDefault(); setActiveTab('chat'); }
      else if (e.key === '2') { e.preventDefault(); setActiveTab('playground'); }
      else if (e.key === '3') { e.preventDefault(); setActiveTab('swarm'); }
      else if (e.key === '4') { e.preventDefault(); setActiveTab('code'); }
      else if (e.key === '5') { e.preventDefault(); setActiveTab('usage'); }
      else if (e.key === 'n' || e.key === 'N') { e.preventDefault(); handleNewChat(); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  const handleRecordCall = () => {
    setTotalCalls(prev => prev + 1);
  };

  const handleNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New Session',
      messages: [],
      updatedAt: new Date().toISOString()
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newId);
    setActiveTab('chat');
  };

  const handleDeleteConversation = (id: string) => {
    const remaining = conversations.filter(c => c.id !== id);
    if (remaining.length === 0) {
      handleNewChat();
    } else {
      setConversations(remaining);
      if (activeConversationId === id) {
        setActiveConversationId(remaining[0].id);
      }
    }
  };

  const handleOpenArtifact = (code: string, language: string) => {
    setArtifactState({
      isOpen: true,
      code,
      language
    });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const assistantMessageId = `msg-${Date.now() + 1}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      model: selectedModel
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
        const newTitle = c.messages.length === 0 ? text.slice(0, 30) + (text.length > 30 ? '...' : '') : c.title;
        return {
          ...c,
          title: newTitle,
          messages: [...c.messages, userMessage, assistantMessage],
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    const currentMessages = activeConversation ? [...activeConversation.messages, userMessage] : [userMessage];
    const payloadMessages = currentMessages.map(m => ({ role: m.role, content: m.content }));

    await streamChatCompletion({
      messages: payloadMessages,
      model: selectedModel,
      signal: abortControllerRef.current.signal,
      onChunk: (chunk: string) => {
        setConversations(prev => prev.map(c => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              messages: c.messages.map(m => {
                if (m.id === assistantMessageId) {
                  return { ...m, content: (m.content || '') + chunk };
                }
                return m;
              })
            };
          }
          return c;
        }));
      },
      onError: (err: string) => {
        setConversations(prev => prev.map(c => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              messages: c.messages.map(m => {
                if (m.id === assistantMessageId) {
                  return { ...m, content: (m.content || '') + `\n\n*[Notice: ${err}]*` };
                }
                return m;
              })
            };
          }
          return c;
        }));
      },
      onDone: () => {
        setIsStreaming(false);
        handleRecordCall();
      }
    });
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#08090C] text-[#F3F4F6] select-none font-sans relative">
      {/* Persistent macOS Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        totalCalls={totalCalls}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top macOS Titlebar */}
        <TopBar
          title={
            activeTab === 'chat'
              ? activeConversation?.title || 'AI Chat'
              : activeTab === 'playground'
              ? 'Model Playground'
              : activeTab === 'swarm'
              ? 'AI Swarm Coordinator'
              : activeTab === 'code'
              ? 'Coding Assistant'
              : 'Telemetry & Usage'
          }
          models={models}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          isSwarmActive={isSwarmRunning}
          onOpenSettings={() => setIsSettingsOpen(true)}
          apiKeyConnected={hasNvidiaKey}
        />

        {/* Central Workspace Router */}
        <main className="flex-1 flex overflow-hidden">
          {activeTab === 'chat' && (
            <ChatView
              messages={activeConversation?.messages || []}
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
              onStopStreaming={handleStopStreaming}
              models={models}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              onOpenArtifact={handleOpenArtifact}
              soundEnabled={soundEnabled}
            />
          )}

          {activeTab === 'playground' && (
            <PlaygroundView
              models={models}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              onRecordCall={handleRecordCall}
            />
          )}

          {activeTab === 'swarm' && (
            <SwarmView
              models={models}
              selectedModel={selectedModel}
              onRecordCall={handleRecordCall}
              isSwarmRunning={isSwarmRunning}
              setIsSwarmRunning={setIsSwarmRunning}
              soundEnabled={soundEnabled}
            />
          )}

          {activeTab === 'code' && (
            <CodeAssistantView
              models={models}
              selectedModel={selectedModel}
              onRecordCall={handleRecordCall}
            />
          )}

          {activeTab === 'usage' && (
            <UsageView
              totalCalls={totalCalls}
              models={models}
              selectedModel={selectedModel}
              hasNvidiaKey={hasNvidiaKey}
            />
          )}
        </main>
      </div>

      {/* Live macOS Artifact Canvas Slide-Out */}
      <ArtifactCanvas
        isOpen={artifactState.isOpen}
        onClose={() => setArtifactState(prev => ({ ...prev, isOpen: false }))}
        code={artifactState.code}
        language={artifactState.language}
      />

      {/* macOS Settings Modal Sheet */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        hasNvidiaKey={hasNvidiaKey}
        models={models}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />
    </div>
  );
};

export default App;

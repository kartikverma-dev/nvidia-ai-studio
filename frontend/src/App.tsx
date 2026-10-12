import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ChatView } from './components/ChatView';
import { PlaygroundView } from './components/PlaygroundView';
import { SwarmView } from './components/SwarmView';
import { CodeAssistantView } from './components/CodeAssistantView';
import { UsageView } from './components/UsageView';
import { SettingsModal } from './components/SettingsModal';
import { Model, Conversation, ChatMessage } from './types';
import { fetchHealth, fetchModels, streamChatCompletion } from './api';

const DEFAULT_VERIFIED_MODEL = 'meta/llama-3.2-11b-vision-instruct';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Models state
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_VERIFIED_MODEL);
  const [hasNvidiaKey, setHasNvidiaKey] = useState<boolean>(true);

  // Telemetry metrics
  const [totalCalls, setTotalCalls] = useState<number>(0);

  // Swarm state
  const [isSwarmRunning, setIsSwarmRunning] = useState<boolean>(false);

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      title: 'Distributed System Architecture',
      messages: [],
      updatedAt: new Date().toISOString()
    }
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');

  // Streaming state for Chat
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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
          // Set to default or verified model
          const defaultModel = fetchedModels.find(m => m.is_default) || fetchedModels[0];
          setSelectedModel(defaultModel.id);
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

    // Update conversation with user message and assistant placeholder
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#08090C] text-[#F3F4F6] select-none font-sans">
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

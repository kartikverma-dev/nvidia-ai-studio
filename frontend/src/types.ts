export interface Model {
  id: string;
  name: string;
  owner: string;
  category: string;
  is_default?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
  pinned?: boolean;
}

export interface SwarmAgent {
  id: string;
  name: string;
  role: string;
  system_prompt: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  output?: string;
  duration_ms?: number;
}

export interface SwarmEvent {
  time: string;
  type: string;
  message: string;
}

export interface UsageMetric {
  totalRequests: number;
  totalTokens: number;
  avgLatencyMs: number;
  lastUsedModel: string;
}

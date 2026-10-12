import { Model, ChatMessage } from './types';

export const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchModels(): Promise<Model[]> {
  try {
    const res = await fetch(`${API_BASE}/models`);
    if (!res.ok) throw new Error('Failed to fetch models');
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error('Error fetching models:', err);
    return [];
  }
}

export async function streamChatCompletion({
  messages,
  model,
  temperature = 0.7,
  max_tokens = 2048,
  onChunk,
  onError,
  onDone,
  signal
}: {
  messages: { role: string; content: string }[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  onChunk: (chunk: string) => void;
  onError: (err: string) => void;
  onDone: () => void;
  signal?: AbortSignal;
}) {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model,
        temperature,
        max_tokens,
        stream: true
      }),
      signal
    });

    if (!response.ok) {
      const errText = await response.text();
      onError(`API Error (${response.status}): ${errText}`);
      onDone();
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('Response stream body not available.');
      onDone();
      return;
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const dataStr = trimmed.replace('data: ', '').trim();

        if (dataStr === '[DONE]') {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            onError(parsed.error);
          } else if (parsed.content) {
            onChunk(parsed.content);
          }
        } catch (e) {
          // ignore malformed fragments
        }
      }
    }
    onDone();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      onDone();
    } else {
      onError(err.message || 'Network stream error');
      onDone();
    }
  }
}

export async function runPlaygroundInference({
  model,
  system_prompt,
  user_prompt,
  temperature,
  top_p,
  max_tokens
}: {
  model: string;
  system_prompt: string;
  user_prompt: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
}) {
  const res = await fetch(`${API_BASE}/playground`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      system_prompt,
      user_prompt,
      temperature,
      top_p,
      max_tokens
    })
  });
  return res.json();
}

import type { Message } from "../types";

const API_BASE_URL = 'http://localhost:8000';

export async function sendMessage(messages: Message[]): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data.response;
}

export async function sendMessageStream(messages: Message[], onChunk: (chunk: string) => void): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
    });

    if (!response.ok || !response.body) {
        throw new Error(`Error: ${response.status}`);
    }

    const reader = response.body.getReader();
    if (!reader) {
      throw new Error('ReadableStream not supported');
    }

    const decoder = new TextDecoder();

    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            const text = decoder.decode(value, { stream: true });

            const lines = text.split('\n')

            for (const line of lines) {

                if (line.startsWith('data: ')) {
                    const data = line.slice(6);

                if (data === '[DONE]') {
                    return;
                }

                try {
                    const parsed = JSON.parse(data);
                    if (parsed.content) {
                        onChunk(parsed.content);
                    }
                } catch (e) {
                    // On ne prend pas en compte les lignes mal formées
                }
            }
        }
    }
} finally {
        reader.releaseLock();
    }
}
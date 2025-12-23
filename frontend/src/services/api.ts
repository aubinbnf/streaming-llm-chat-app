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
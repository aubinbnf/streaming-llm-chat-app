import { useState } from 'react'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import type { Message } from './types'
import { sendMessageStream } from './services/api'

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');

  const handleSendMessage = async (text: string) => {
    
    const userMessage: Message = {
      role: 'user',
      content: text
    };
    setMessages(prev => [...messages, userMessage]);

    setIsLoading(true);
    setStreamingMessage('');

    let accumulatedText = '';

    try {
      const allMessages = [...messages, userMessage];

      await sendMessageStream(allMessages, (chunk) => {
        accumulatedText += chunk;
        setStreamingMessage(accumulatedText);
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: accumulatedText
      }]);
      setStreamingMessage('');

    } catch (error) {
      console.error('Error:', error);
      let errorText = 'Désolé, une erreur est survenue. Veuillez réessayer.';
      if (error instanceof Error) {
        errorText = error.message;
      }
      const errorMessage: Message = {
        role: 'assistant',
        content: errorText
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Chat LLM</h1>
      <div className="messages-container">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {streamingMessage && (
          <ChatMessage 
            message={{ role: 'assistant', content: streamingMessage }} 
          />
        )}
        {isLoading && !streamingMessage && (
          <div className="loading-indicator">
            Assistant écrit...
          </div>
        )}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}

export default App;
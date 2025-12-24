import { useState, useRef, useEffect } from 'react'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import type { Message } from './types'
import { sendMessageStream } from './services/api'

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
      scrollToBottom();
  }, [messages, streamingMessage]);

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
      const systemMessage: Message = {
        role: 'system',
        content: 'Tu es un assistant IA serviable et concis.'
      };

      const allMessages = [systemMessage, ...messages, userMessage];

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
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} isDisabled={isLoading}/>
    </div>
  );
}

export default App;
import { useState } from 'react'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import type { Message } from './types'
import { sendMessage } from './services/api'

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    
    const userMessage: Message = {
      role: 'user',
      content: text
    };
    setMessages(prev => [...messages, userMessage]);

    setIsLoading(true);

    try {
      const allMessages = [...messages, userMessage];
      const response = await sendMessage(allMessages);
      const assistantMessage: Message = {
        role: 'assistant',
        content: response
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur lors de l\'appel API:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.'
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
        {isLoading && (
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
import { useState } from 'react'
import viteLogo from '/vite.svg'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import type { Message } from './types'

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'user', content: 'Bonjour !' },
    { role: 'assistant', content: 'Bonjour ! Comment puis-je vous aider ?' }
  ]);

  const handleSendMessage = (text: string) => {
    console.log('Message envoyé:', text);
    const newMessage: Message = {
      role: 'user',
      content: text
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="App">
      <h1>Chat LLM</h1>
      <div className="messages-container">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}

export default App;
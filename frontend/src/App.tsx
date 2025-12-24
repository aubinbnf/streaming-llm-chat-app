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
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('chat_session_id'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
      scrollToBottom();
  }, [messages, streamingMessage]);

  useEffect(() => {
    const loadHistory = async () => {
      if (sessionId) {
        try {
          const response = await fetch(`http://localhost:8000/chat/session/${sessionId}`);
          if (response.ok) {
            const data = await response.json();
            setMessages(data.messages);
          } else if (response.status === 404) {
            console.log('Session expirée, création d\'une nouvelle session');
            setSessionId(null);
            localStorage.removeItem('chat_session_id');
          }
        } catch (error) {
          console.error('Erreur chargement historique:', error);
        }
      }
    };

    loadHistory();
  }, []);

  const handleNewConversation = () => {
    localStorage.removeItem('chat_session_id');
    setSessionId(null);
    setMessages([]);
    setStreamingMessage('');
  };

  const handleSendMessage = async (text: string) => {
    let currentSessionId = sessionId;

    if (!currentSessionId) {
      try {
        const response = await fetch('http://localhost:8000/chat/session', {
          method: 'POST'
        });
        const data = await response.json();
        currentSessionId = data.session_id;
        setSessionId(currentSessionId);
        localStorage.setItem('chat_session_id', currentSessionId!);
      } catch (error) {
        console.error('Erreur création session:', error);
        return;
      }
    }
    
    const userMessage: Message = {
      role: 'user',
      content: text
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);
    setStreamingMessage('');

    let accumulatedText = '';

    try {
      await sendMessageStream(currentSessionId!, userMessage, (chunk) => {
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
      <div className="header">
        <button onClick={handleNewConversation} className="new-chat-btn">
          Nouvelle conversation
        </button>
        <h1>Chat LLM</h1>
      </div>
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
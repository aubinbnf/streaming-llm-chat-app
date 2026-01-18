import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-role">{isUser ? 'Vous' : 'Assistant'}</div>
      <div className="message-content">{message.content}</div>
    </div>
  );
}

export default ChatMessage;

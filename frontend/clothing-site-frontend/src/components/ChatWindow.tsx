import React from 'react';
import MessageList from './MessageList';
import UserInput from './UserInput';
import { useChat } from '../context/ChatContent';

const ChatWindow: React.FC = () => {
  const { messages, addMessage, setLoading } = useChat();

  const handleSend = (text: string) => {
    addMessage({ sender: 'user', text });

    setLoading(true);
    setTimeout(() => {
      addMessage({ sender: 'ai', text: `You said: "${text}"` });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <MessageList messages={messages} />
      <UserInput onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;

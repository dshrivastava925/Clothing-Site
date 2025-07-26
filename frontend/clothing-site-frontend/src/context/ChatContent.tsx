import { createContext, useState, useContext, type ReactNode } from 'react';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

type ChatContextType = {
  messages: Message[];
  loading: boolean;
  addMessage: (msg: Message) => void;
  setLoading: (status: boolean) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);


  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <ChatContext.Provider value={{ messages, loading, addMessage, setLoading }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used inside ChatProvider');
  return context;
};

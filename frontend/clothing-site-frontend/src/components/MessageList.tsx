import React, { useEffect, useRef } from 'react';
import { Message } from './Message';
import { useChatStore } from '../store/chatStore';
import { Loader2 } from 'lucide-react';

export const MessageList: React.FC = () => {
  const messages = useChatStore((s) => s.messages) ?? [];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug log to help diagnose blank screen
  console.log('MessageList messages:', messages);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-[300px]">
      {/* Welcome message when no messages */}
      {(!messages || messages.length === 0) && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
            <p className="text-sm">Send a message to begin chatting with the AI assistant.</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-1">
        {messages && messages.map((message, idx) => (
          <Message 
            key={message._id ?? idx} 
            message={message}
          />
        ))}
      </div>

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};
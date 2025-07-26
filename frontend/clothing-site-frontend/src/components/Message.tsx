import React from 'react';

type MessageProps = {
  sender: 'user' | 'ai';
  text: string;
};

const Message: React.FC<MessageProps> = ({ sender, text }) => {
  const isUser = sender === 'user';

  return (
    <div className={`my-2 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`px-4 py-2 rounded-xl max-w-[70%] break-words ${
          isUser ? 'bg-green-700' : 'bg-gray-700'
        }`}
      >
        {text}
      </div>
    </div>
  );
};

export default Message;

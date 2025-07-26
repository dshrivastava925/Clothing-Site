import React from 'react';
import ChatWindow from './components/ChatWindow';
import { ChatProvider } from './context/ChatContent';

const App: React.FC = () => {
  return (
    <ChatProvider>
      <div className="h-screen w-screen bg-gray-100 flex justify-center items-center">
        <div className="w-full max-w-4xl h-[90vh] bg-white rounded-xl shadow-xl flex">
          <ChatWindow />
        </div>
      </div>
    </ChatProvider>
  );
};

export default App;
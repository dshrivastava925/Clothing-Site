import React, { useState } from 'react';

type Props = {
  onSend: (text: string) => void;
};

const UserInput: React.FC<Props> = ({ onSend }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex p-4 border-t">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 outline-none"
        placeholder="Type a message..."
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-r-md hover:bg-blue-700 transition"
      >
        Send
      </button>
    </form>
  );
};

export default UserInput;

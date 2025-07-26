import React from 'react';
import { Message as MessageType } from '../types';

export const Message: React.FC<{ message: MessageType }> = ({ message }) => (
  <div
    style={{
      textAlign: message.role === 'user' ? 'right' : 'left',
      background: message.role === 'user' ? '#e0f7fa' : '#f1f8e9',
      margin: '4px 0',
      padding: '8px',
      borderRadius: '6px',
    }}
  >
    <strong>{message.role === 'user' ? 'You' : 'AI'}:</strong> {message.content}
  </div>
);
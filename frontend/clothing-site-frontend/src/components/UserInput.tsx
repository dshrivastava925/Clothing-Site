import React, { useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export const UserInput: React.FC<{ onSend: (msg: string) => void }> = ({ onSend }) => {
  const input = useChatStore((s) => s.input);
  const setInput = useChatStore((s) => s.setInput);
  const loading = useChatStore((s) => s.loading);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginTop: '12px' }}>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
        disabled={loading}
        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        rows={1}
      />
      <button
        type="submit"
        disabled={loading || !input.trim()}
        style={{
          padding: '8px 16px',
          borderRadius: '4px',
          backgroundColor: loading ? '#f0f0f0' : '#007bff',
          color: loading ? '#999' : '#fff',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title={loading ? 'Sending...' : 'Send message'}
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Send size={20} />
        )}
      </button>
    </form>
  );
};
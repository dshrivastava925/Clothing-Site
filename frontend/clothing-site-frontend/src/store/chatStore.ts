import { create } from 'zustand';
import { ChatState, Message, ChatRequest, ChatResponse } from '../types';
import { chatApi } from '../services/api';

interface ConversationSession {
  id: string;
  title?: string;
  messages: Message[];
}

interface ChatStore extends ChatState {
  sendMessage: (message: string) => Promise<void>;
  setError: (error: string | null) => void;
  history: ConversationSession[];
  loadHistory: (id: string) => void;
}

export const useChat = create<ChatStore>((set, get) => ({
  messages: [],
  error: null,
  isLoading: false,
  history: [],

  setError: (error) => set({ error }),

  sendMessage: async (message: string) => {
    set({ isLoading: true, error: null });
    try {
      // You may want to pass user_id and conversation_id here
      const user_id = 'user123'; // Replace with actual user logic
      const conversation_id = undefined; // Replace with actual conversation logic

      const request: ChatRequest = { message, user_id, conversation_id };
      const response: ChatResponse = await chatApi.sendMessage(request);

      set((state) => ({
        messages: [
          ...state.messages,
          { role: 'user', content: message },
          { role: 'assistant', content: response.response }
        ],
        isLoading: false
      }));

      // Save to history (simple implementation)
      const sessionId = Date.now().toString();
      set((state) => ({
        history: [
          ...state.history,
          { id: sessionId, title: `Session ${state.history.length + 1}`, messages: [...state.messages, { role: 'user', content: message }, { role: 'assistant', content: response.response }] }
        ]
      }));
    } catch (err: any) {
      set({ error: err?.response?.data?.detail || 'Failed to send message', isLoading: false });
    }
  },

  loadHistory: (id: string) => {
    const session = get().history.find(h => h.id === id);
    if (session) set({ messages: session.messages });
  }
}));

type ChatState = {
  messages: Message[];
  loading: boolean;
  input: string;
  conversations: Conversation[];
  currentConversationId: string | null;
  setMessages: (msgs: Message[]) => void;
  setLoading: (loading: boolean) => void;
  setInput: (input: string) => void;
  setConversations: (convs: Conversation[]) => void;
  setCurrentConversationId: (id: string | null) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  loading: false,
  input: '',
  conversations: [],
  currentConversationId: null,
  setMessages: (msgs) => set({ messages: msgs }),
  setLoading: (loading) => set({ loading }),
  setInput: (input) => set({ input }),
  setConversations: (convs) => set({ conversations: convs }),
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
}));



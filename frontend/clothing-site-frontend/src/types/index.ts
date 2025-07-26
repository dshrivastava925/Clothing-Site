// Types for the chat application

export type Message = {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
};

export type Conversation = {
  _id: string;
  title: string;
  updated_at: string;
};

export interface ChatRequest {
  message: string;
  user_id: string;
  conversation_id?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
}

export interface ChatState {
  error: string | null;
  messages: Array<{ role: string; content: string }>;
  isLoading: boolean;
}

export interface ApiError {
  detail: string;
}
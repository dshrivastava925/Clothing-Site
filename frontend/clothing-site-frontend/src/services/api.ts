// API service for backend communication

import axios from 'axios';
import { ChatRequest, ChatResponse, Conversation, Message } from '../types';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatApi = {
  // Send a chat message
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post('/chat', request);
    return response.data;
  },

  // Get user conversations
  getUserConversations: async (userId: string): Promise<Conversation[]> => {
    const response = await api.get(`/conversations/${userId}`);
    return response.data;
  },

  // Get conversation messages
  getConversationMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response.data;
  },

  // Create a new conversation
  createConversation: async (userId: string, title: string = 'New Chat') => {
    const response = await api.post('/conversations', {
      user_id: userId,
      title,
    });
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;

import axios from "axios";
import { Message, Conversation } from "../types";

const BASE_URL = "http://localhost:8000";

export async function sendMessage(user_id: string, message: string, conversation_id?: string) {
  const res = await axios.post(`${BASE_URL}/api/chat`, {
    user_id,
    message,
    conversation_id,
  });
  return res.data;
}

export async function fetchConversations(user_id: string): Promise<Conversation[]> {
  const res = await axios.get(`${BASE_URL}/conversations/${user_id}`);
  return res.data;
}

export async function fetchMessages(conversation_id: string): Promise<Message[]> {
  const res = await axios.get(`${BASE_URL}/conversations/${conversation_id}/messages`);
  return res.data;
}
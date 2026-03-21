import api from './api';

export const chatService = {
  // Get all conversations for the logged-in user
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  // Get or create a conversation with a specific user (must be mutual match)
  getOrCreateConversation: async (userId) => {
    const response = await api.get(`/chat/with/${userId}`);
    return response.data;
  },

  // Get messages for a conversation (paginated)
  getMessages: async (conversationId, page = 1) => {
    const response = await api.get(`/chat/${conversationId}/messages?page=${page}`);
    return response.data;
  },

  // Send a message
  sendMessage: async (conversationId, text) => {
    const response = await api.post(`/chat/${conversationId}/messages`, { text });
    return response.data;
  },
};

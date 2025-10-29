import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

/**
 * Chat Store using Zustand
 * Manages chat-related state (users, messages, selected chat)
 */
const useChatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  onlineUsers: [],
  isLoading: false,
  error: null,

  /**
   * Get all users
   */
  getUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/api/users');
      set({ users: data.users, isLoading: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  /**
   * Get messages with a specific user
   */
  getMessages: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/api/messages/${userId}`);
      set({ messages: data.messages, isLoading: false });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch messages';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  /**
   * Send a message
   */
  sendMessage: async (userId, messageText) => {
    try {
      const { data } = await api.post(`/api/messages/${userId}`, { messageText });
      
      // Add message to local state
      set((state) => ({
        messages: [...state.messages, data.message]
      }));

      return data.message;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send message';
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Set selected user for chat
   */
  setSelectedUser: (user) => {
    set({ selectedUser: user });
  },

  /**
   * Add new message to messages array (from Socket.io)
   */
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }));
  },

  /**
   * Set online users
   */
  setOnlineUsers: (users) => {
    set({ onlineUsers: users });
  },

  /**
   * Update user online status
   */
  updateUserStatus: (userId, isOnline) => {
    set((state) => ({
      users: state.users.map((user) =>
        user._id === userId ? { ...user, isOnline } : user
      ),
      onlineUsers: isOnline
        ? [...state.onlineUsers, userId]
        : state.onlineUsers.filter((id) => id !== userId)
    }));
  },

  /**
   * Clear messages
   */
  clearMessages: () => {
    set({ messages: [] });
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null });
  }
}));

export default useChatStore;

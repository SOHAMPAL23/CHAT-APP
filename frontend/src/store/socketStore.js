import { create } from 'zustand';
import { io } from 'socket.io-client';
import useChatStore from './chatStore';

/**
 * Socket Store using Zustand
 * Manages Socket.io connection and real-time events
 */
const useSocketStore = create((set, get) => ({
  socket: null,
  typingUsers: {},

  /**
   * Initialize Socket.io connection
   */
  initializeSocket: (token) => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    const newSocket = io(socketUrl, {
      auth: { token }
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Online users list
    newSocket.on('onlineUsers', (users) => {
      useChatStore.getState().setOnlineUsers(users);
    });

    // User status change
    newSocket.on('userStatusChange', ({ userId, isOnline }) => {
      useChatStore.getState().updateUserStatus(userId, isOnline);
    });

    // Receive message
    newSocket.on('receiveMessage', (message) => {
      useChatStore.getState().addMessage(message);
    });

    // Message sent confirmation
    newSocket.on('messageSent', (message) => {
      useChatStore.getState().addMessage(message);
    });

    // Typing indicator
    newSocket.on('userTyping', ({ userId, username, isTyping }) => {
      set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [userId]: isTyping
        }
      }));
    });

    set({ socket: newSocket });
    return newSocket;
  },

  /**
   * Disconnect socket
   */
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, typingUsers: {} });
    }
  }
}));

export default useSocketStore;

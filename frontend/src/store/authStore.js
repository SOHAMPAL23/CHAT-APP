import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

/**
 * Authentication Store using Zustand
 * Manages user authentication state globally
 */
const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  /**
   * Signup new user
   */
  signup: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/api/auth/signup', userData);
      
      // Store token and user in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.token,
        isLoading: false,
        error: null
      });

      toast.success('Account created successfully!');
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Signup failed. Please try again.';
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Login user
   */
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/api/auth/login', credentials);

      // Store token and user in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.token,
        isLoading: false,
        error: null
      });

      toast.success(`Welcome back, ${data.user.username}!`);
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please try again.';
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, error: null });
      toast.success('Logged out successfully');
    }
  },

  /**
   * Get current user (refresh user data)
   */
  getMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/api/auth/me');
      
      localStorage.setItem('user', JSON.stringify(data.user));
      
      set({
        user: data.user,
        isLoading: false,
        error: null
      });

      return data.user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch user data';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  /**
   * Update user in state
   */
  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  /**
   * Clear error
   */
  clearError: () => set({ error: null })
}));

export default useAuthStore;

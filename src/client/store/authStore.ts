import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initAuth: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  verifyToken: () => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      initAuth: () => {
        const { token } = get();
        if (token) {
          api.setAuthToken(token);
          get().verifyToken();
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, token } = response.data;
          
          api.setAuthToken(token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', {
            username,
            email,
            password
          });
          const { user, token } = response.data;
          
          api.setAuthToken(token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      logout: () => {
        api.setAuthToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      verifyToken: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const response = await api.get('/auth/verify');
          set({
            user: response.data.user,
            isAuthenticated: true
          });
        } catch (error) {
          get().logout();
        }
      },

      updateProfile: async (updates) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put('/user/profile', updates);
          set({
            user: response.data.user,
            isLoading: false
          });
          return { success: true };
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Update failed',
            isLoading: false
          });
          return { success: false, error: error.response?.data?.message };
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'mono-games-auth',
      version: 1,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export { useAuthStore };
export default useAuthStore;


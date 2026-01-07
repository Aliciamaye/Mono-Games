import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { signRequest, generateCSRFToken, isRateLimited } from '../utils/security';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check rate limiting
    if (isRateLimited(config.url || '')) {
      return Promise.reject(new Error('Too many requests. Please try again later.'));
    }

    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token
    const csrfToken = generateCSRFToken();
    config.headers['X-CSRF-Token'] = csrfToken;

    // Sign request
    const { signature, timestamp, nonce } = signRequest(
      (config.method || 'GET').toUpperCase(),
      config.url || '',
      config.data
    );
    
    config.headers['X-Signature'] = signature;
    config.headers['X-Timestamp'] = timestamp;
    config.headers['X-Nonce'] = nonce;

    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/';
          break;
        case 403:
          // Forbidden
          console.error('Access denied');
          break;
        case 429:
          // Rate limited
          console.error('Rate limit exceeded');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
        default:
          break;
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Auth endpoints
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  logout: () => api.post('/auth/logout'),
  verifyToken: () => api.get('/auth/verify'),
  
  // User endpoints
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getUserStats: (userId) => api.get(`/user/${userId}/stats`),
  
  // Game endpoints
  getGames: () => api.get('/games'),
  getGame: (gameId) => api.get(`/games/${gameId}`),
  downloadGame: (gameId) => api.get(`/games/${gameId}/download`, { responseType: 'blob' }),
  
  // Leaderboard endpoints
  getLeaderboard: (gameId, limit = 100) => api.get(`/leaderboard/${gameId}?limit=${limit}`),
  submitScore: (gameId, score, metadata) => api.post(`/leaderboard/${gameId}`, { score, metadata }),
  
  // Achievements endpoints
  getAchievements: (userId) => api.get(`/achievements/${userId}`),
  unlockAchievement: (achievementId) => api.post(`/achievements/${achievementId}/unlock`),
  
  // Cloud save endpoints
  getSave: (gameId) => api.get(`/saves/${gameId}`),
  uploadSave: (gameId, saveData) => api.post(`/saves/${gameId}`, { saveData }),
  deleteSave: (gameId) => api.delete(`/saves/${gameId}`)
};

// Extend AxiosInstance to add setAuthToken method
interface ExtendedAxiosInstance extends AxiosInstance {
  setAuthToken: (token: string | null) => void;
}

// Helper method to set auth token
(api as ExtendedAxiosInstance).setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export default api as ExtendedAxiosInstance;

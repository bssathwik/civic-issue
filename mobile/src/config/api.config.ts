import axios from 'axios';

// API Configuration for different environments
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

// Environment-specific configurations
const configs: Record<string, ApiConfig> = {
  development: {
    baseUrl: __DEV__ ? 'http://10.207.93.220:3000/api' : 'http://10.0.2.2:3000/api',
    timeout: 10000,
    retryAttempts: 3,
  },
  production: {
    baseUrl: 'https://your-production-api.com/api',
    timeout: 15000,
    retryAttempts: 2,
  },
  testing: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 5000,
    retryAttempts: 1,
  },
};

// Get current environment
const getEnvironment = (): string => {
  return __DEV__ ? 'development' : 'production';
};

// Get API configuration
export const getApiConfig = (): ApiConfig => {
  const env = getEnvironment();
  return configs[env] || configs.development;
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Issue endpoints
  ISSUES: {
    LIST: '/issues',
    CREATE: '/issues',
    DETAIL: (id: string) => `/issues/${id}`,
    UPDATE: (id: string) => `/issues/${id}`,
    DELETE: (id: string) => `/issues/${id}`,
    UPVOTE: (id: string) => `/issues/${id}/upvote`,
    DOWNVOTE: (id: string) => `/issues/${id}/downvote`,
    MY_ISSUES: '/issues/my-issues',
    NEARBY: '/issues/nearby',
    BY_STATUS: (status: string) => `/issues?status=${status}`,
    BY_CATEGORY: (category: string) => `/issues?category=${category}`,
  },
  
  // User endpoints
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    STATISTICS: '/users/statistics',
    LEADERBOARD: '/users/leaderboard',
  },
  
  // Notification endpoints
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
  },
  
  // Health check
  HEALTH: '/health',
};

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const fetchPlaces = async (query: string) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json`,
      {
        params: {
          query,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching places:', error);
    throw error;
  }
};

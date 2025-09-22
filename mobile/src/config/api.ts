// API Configuration
export const API_BASE_URL = 'http://localhost:3000/api';

// Development/Production environment detection
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  
  // Issues
  ISSUES: {
    BASE: '/issues',
    CREATE: '/issues',
    UPDATE: (id: string) => `/issues/${id}`,
    DELETE: (id: string) => `/issues/${id}`,
    GET_BY_ID: (id: string) => `/issues/${id}`,
    UPVOTE: (id: string) => `/issues/${id}/upvote`,
    COMMENT: (id: string) => `/issues/${id}/comments`,
    NEARBY: '/issues/nearby',
    SEARCH: '/issues/search',
  },

  // Users
  USERS: {
    BASE: '/users',
    PROFILE: (id: string) => `/users/${id}`,
    UPDATE_PROFILE: '/users/profile',
    ACHIEVEMENTS: '/users/achievements',
    LEADERBOARD: '/users/leaderboard',
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    SETTINGS: '/notifications/settings',
    REGISTER_TOKEN: '/notifications/register-token',
    ACHIEVEMENTS: '/notifications/achievements',
  },

  // Gamification
  GAMIFICATION: {
    BASE: '/gamification',
    BADGES: '/gamification/badges',
    CERTIFICATES: '/gamification/certificates',
    LEADERBOARD: '/gamification/leaderboard',
    PROGRESS: '/gamification/progress',
  },

  // Admin (if needed for mobile admin features)
  ADMIN: {
    BASE: '/admin',
    USERS: '/admin/users',
    ISSUES: '/admin/issues',
    ANALYTICS: '/admin/analytics',
  },
};

// Request timeout configuration
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// API response status codes
export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
} as const;
import { apiService } from './apiService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'citizen' | 'field_worker' | 'admin';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  address?: string;
  gamification?: {
    points: number;
    level: string;
    badges: any[];
    streak?: any;
  };
  preferences?: any;
  isVerified?: boolean;
  createdAt: string;
}

class AuthService {
  async login(credentials: LoginCredentials) {
    const response = await apiService.post('/auth/login', credentials);
    if (response.success) {
      return response;
    }
    throw new Error(response.message || 'Login failed');
  }

  async register(userData: RegisterData) {
    const response = await apiService.post('/auth/register', userData);
    if (response.success) {
      return response;
    }
    throw new Error(response.message || 'Registration failed');
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get('/auth/me');
    if (response.success) {
      return response.user;
    }
    throw new Error(response.message || 'Failed to get user data');
  }

  async updateProfile(userData: Partial<User>) {
    const response = await apiService.put('/auth/profile', userData);
    if (response.success) {
      return response.user;
    }
    throw new Error(response.message || 'Failed to update profile');
  }

  async updateAvatar(avatarFile: File) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    const response = await apiService.postFormData('/auth/avatar', formData);
    if (response.success) {
      return response;
    }
    throw new Error(response.message || 'Failed to update avatar');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await apiService.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    if (response.success) {
      return response;
    }
    throw new Error(response.message || 'Failed to change password');
  }

  async forgotPassword(email: string) {
    const response = await apiService.post('/auth/forgot-password', { email });
    if (response.success) {
      return response;
    }
    throw new Error(response.message || 'Failed to send reset email');
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await apiService.post('/auth/reset-password', {
      token,
      newPassword
    });
    if (response.success) {
      return response;
    }
    throw new Error(response.message || 'Failed to reset password');
  }

  setToken(token: string | null) {
    apiService.setToken(token);
  }

  async logout() {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    }
    
    // Clear local storage
    localStorage.removeItem('token');
    apiService.setToken(null);
  }
}

export const authService = new AuthService();
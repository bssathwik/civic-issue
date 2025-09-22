import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api';

// Types
interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  gamificationData?: any;
}

// Comprehensive registration data interface
interface ComprehensiveRegistrationData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  occupation: string;
  aadharNumber?: string;
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    ward?: string;
    landmark?: string;
  };
  location: {
    coordinates: number[];
  };
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    language: string;
  };
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: ComprehensiveRegistrationData | {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<{ success: boolean; message: string }>;
  updateUser: (userData: Partial<User>) => void;
  checkAuthStatus: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Check authentication status on app start
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verify token is still valid by fetching user profile
        try {
          const profile = await apiClient.getProfile();
          if (profile.success) {
            setUser(profile.user);
          } else {
            // Token is invalid, clear storage
            await clearAuthData();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear authentication data
  const clearAuthData = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  };

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(email, password);
      
      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        return { success: true, message: 'Login successful!' };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: ComprehensiveRegistrationData | {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      
      // Check if this is comprehensive registration data or legacy format
      const isComprehensiveData = 'dateOfBirth' in userData;
      
      if (isComprehensiveData) {
        // Use comprehensive registration endpoint
        const response = await apiClient.registerComprehensive(userData as ComprehensiveRegistrationData);
        
        if (response.success) {
          setUser(response.user);
          setToken(response.token);
          
          // Store auth data
          await AsyncStorage.setItem('authToken', response.token);
          await AsyncStorage.setItem('user', JSON.stringify(response.user));
          
          return { success: true, message: 'Comprehensive registration successful!' };
        } else {
          return { success: false, message: response.message || 'Registration failed' };
        }
      } else {
        // Use legacy registration endpoint (for backward compatibility)
        const response = await apiClient.register(userData as {
          name: string;
          email: string;
          password: string;
          phone: string;
          role?: string;
        });
        
        if (response.success) {
          setUser(response.user);
          setToken(response.token);
          
          // Store auth data
          await AsyncStorage.setItem('authToken', response.token);
          await AsyncStorage.setItem('user', JSON.stringify(response.user));
          
          return { success: true, message: 'Registration successful!' };
        } else {
          return { success: false, message: response.message || 'Registration failed' };
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      
      // Call API logout if token exists
      if (token) {
        await apiClient.logout();
      }
      
      // Clear all auth data
      await clearAuthData();
      
      return { success: true, message: 'Logged out successfully' };
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local data
      await clearAuthData();
      return { success: true, message: 'Logged out successfully' };
    } finally {
      setIsLoading(false);
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

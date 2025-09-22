import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiConfig, API_ENDPOINTS, ApiConfig } from '../config/api.config';

// API client class
class ApiClient {
  private config: ApiConfig;
  private baseURL: string;

  constructor() {
    this.config = getApiConfig();
    this.baseURL = this.config.baseUrl;
  }

  // Helper method to get auth token
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Helper method to make authenticated requests with retry
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    requireAuth: boolean = true,
    attempt: number = 1
  ): Promise<any> {
    try {
      console.log(`🌐 API Request (Attempt ${attempt}): ${method} ${this.baseURL}${endpoint}`);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (requireAuth) {
        const token = await this.getAuthToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const config: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
        console.log('📤 Request body:', JSON.stringify(data, null, 2));
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      clearTimeout(timeoutId);
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', errorData);
        
        // If it's a network error and we have retries left, retry
        if (response.status >= 500 && attempt < this.config.retryAttempts) {
          console.log(`🔄 Retrying request (${attempt + 1}/${this.config.retryAttempts})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
          return this.makeRequest(endpoint, method, data, requireAuth, attempt + 1);
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('✅ Response data:', responseData);
      return responseData;
    } catch (error: any) {
      console.error('🚨 API request error:', error);
      
      // Handle timeout and network errors with retry
      if ((error.name === 'AbortError' || error.message === 'Network request failed') && attempt < this.config.retryAttempts) {
        console.log(`🔄 Retrying request (${attempt + 1}/${this.config.retryAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return this.makeRequest(endpoint, method, data, requireAuth, attempt + 1);
      }
      
      // Provide more helpful error messages
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your internet connection and ensure the server is running.');
      }
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      throw error;
    }
  }

  // Simple health check
  async healthCheck(): Promise<any> {
    try {
      console.log(`🏥 Health check: GET ${this.baseURL}${API_ENDPOINTS.HEALTH}`);
      console.log(`🔗 Connecting to backend at: ${this.baseURL}`);
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.HEALTH}`);
      const data = await response.json();
      console.log('✅ Health check success:', data);
      return data;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw new Error(`Cannot connect to backend at ${this.baseURL}. Make sure backend is running.`);
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<any> {
    const response = await this.makeRequest(API_ENDPOINTS.AUTH.LOGIN, 'POST', {
      email,
      password
    }, false);

    // Store the token if login is successful
    if (response.success && response.token) {
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
  }): Promise<any> {
    const response = await this.makeRequest(API_ENDPOINTS.AUTH.REGISTER, 'POST', userData, false);

    // Store the token if registration is successful
    if (response.success && response.token) {
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async registerComprehensive(userData: {
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
  }): Promise<any> {
    console.log('📤 Comprehensive registration request:', JSON.stringify(userData, null, 2));
    const response = await this.makeRequest(API_ENDPOINTS.AUTH.REGISTER, 'POST', userData, false);

    // Store the token if registration is successful
    if (response.success && response.token) {
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async sendPhoneVerification(phone: string): Promise<any> {
    return await this.makeRequest('/verification/send-phone-otp', 'POST', { phone }, false);
  }

  async verifyPhone(phone: string, otp: string): Promise<any> {
    return await this.makeRequest('/verification/verify-phone-otp', 'POST', { phone, otp }, false);
  }

  async sendEmailVerification(email: string): Promise<any> {
    return await this.makeRequest('/verification/send-email-otp', 'POST', { email }, false);
  }

  async verifyEmail(email: string, otp: string): Promise<any> {
    return await this.makeRequest('/verification/verify-email-otp', 'POST', { email, otp }, false);
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest(API_ENDPOINTS.AUTH.LOGOUT, 'POST');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage regardless of API response
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
  }

  async getProfile(): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.AUTH.ME, 'GET');
  }

  async updateProfile(profileData: any): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.AUTH.PROFILE, 'PUT', profileData);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, 'PUT', {
      oldPassword,
      newPassword
    });
  }

  async forgotPassword(email: string): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, 'POST', { email }, false);
  }

  async resetPassword(token: string, password: string): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.AUTH.RESET_PASSWORD, 'POST', {
      token,
      password
    }, false);
  }

  // Issues methods
  async getIssues(filters?: any): Promise<any> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return await this.makeRequest(`${API_ENDPOINTS.ISSUES.LIST}${queryParams}`, 'GET');
  }

  async getMyIssues(): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.ISSUES.MY_ISSUES, 'GET');
  }

  async getNearbyIssues(latitude: number, longitude: number, radius: number = 10): Promise<any> {
    return await this.makeRequest(`${API_ENDPOINTS.ISSUES.NEARBY}?lat=${latitude}&lng=${longitude}&radius=${radius}`, 'GET');
  }

  async getIssuesByStatus(status: string): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.ISSUES.BY_STATUS(status), 'GET');
  }

  async getIssuesByCategory(category: string): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.ISSUES.BY_CATEGORY(category), 'GET');
  }

  async getIssueById(id: string): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.ISSUES.DETAIL(id), 'GET');
  }

  async createIssue(issueData: any): Promise<any> {
    // Handle image upload differently
    if (issueData.images && issueData.images.length > 0) {
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', issueData.title);
      formData.append('description', issueData.description);
      formData.append('category', issueData.category);
      formData.append('priority', issueData.priority);
      formData.append('location', JSON.stringify(issueData.location));
      formData.append('address', issueData.address);
      formData.append('isAnonymous', issueData.isAnonymous.toString());
      formData.append('visibility', issueData.visibility);
      
      // Add images
      for (let i = 0; i < issueData.images.length; i++) {
        const imageUri = issueData.images[i];
        const filename = `image_${i}.jpg`;
        
        // Create file object from URI
        formData.append('images', {
          uri: imageUri,
          type: 'image/jpeg',
          name: filename,
        } as any);
      }
      
      return await this.makeFormDataRequest(API_ENDPOINTS.ISSUES.CREATE, 'POST', formData);
    } else {
      // No images, use regular JSON request
      return await this.makeRequest(API_ENDPOINTS.ISSUES.CREATE, 'POST', issueData);
    }
  }

  private async makeFormDataRequest(endpoint: string, method: string, formData: FormData): Promise<any> {
    try {
      const headers: Record<string, string> = {};
      
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Don't set Content-Type for FormData - let the browser set it with boundary
      
      console.log(`📡 ${method} ${this.baseURL}${endpoint} (FormData)`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
        body: formData,
      });
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('✅ Response data:', responseData);
      return responseData;
    } catch (error: any) {
      console.error('🚨 FormData API request error:', error);
      throw error;
    }
  }

  async updateIssue(id: string, issueData: any): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.ISSUES.UPDATE(id), 'PUT', issueData);
  }

  async deleteIssue(id: string): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.ISSUES.DELETE(id), 'DELETE');
  }

  async upvoteIssue(id: string): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.ISSUES.UPVOTE(id), 'POST');
  }

  async downvoteIssue(id: string): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.ISSUES.DOWNVOTE(id), 'POST');
  }

  // User methods
  async getUsers(): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.USERS.LIST, 'GET');
  }

  async getUserById(id: string): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.USERS.DETAIL(id), 'GET');
  }

  async getUserProfile(id?: string): Promise<any> {
    const userId = id || 'me'; // Use 'me' for current user or specific ID
    return await this.makeRequest(`/users/${userId}/profile`, 'GET');
  }

  async getUserDashboardStats(): Promise<any> {
    return await this.makeRequest('/users/dashboard/stats', 'GET');
  }

  async getGamificationStats(): Promise<any> {
    return await this.makeRequest('/users/gamification/stats', 'GET');
  }

  async getUserStatistics(): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.USERS.STATISTICS, 'GET');
  }

  async getLeaderboard(): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.USERS.LEADERBOARD, 'GET');
  }

  // Notification methods
  async getNotifications(): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.NOTIFICATIONS.LIST, 'GET');
  }

  async markNotificationRead(id: string): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), 'PUT');
  }

  async markAllNotificationsRead(): Promise<any> {
    return await this.makeRequest(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, 'PUT');
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;

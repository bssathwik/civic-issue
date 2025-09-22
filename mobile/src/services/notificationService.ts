import { getApiConfig } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationData {
  _id: string;
  recipient: string;
  sender?: {
    name: string;
    avatar?: string;
  };
  type: 'issue_created' | 'issue_updated' | 'issue_assigned' | 'issue_resolved' | 
        'issue_commented' | 'issue_upvoted' | 'achievement_earned' | 'level_up' | 
        'system_announcement';
  title: string;
  message: string;
  data: {
    issueId?: string;
    achievementId?: string;
    badgeId?: string;
    certificateId?: string;
    actionUrl?: string;
    pointsAwarded?: number;
    metadata?: any;
  };
  isRead: boolean;
  readAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: NotificationData[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    unreadCount: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

class NotificationService {
  private baseURL: string;

  constructor() {
    this.baseURL = getApiConfig().baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
  ): Promise<any> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const token = await this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const config: RequestInit = {
        method,
        headers,
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getNotifications(options?: {
    page?: number;
    limit?: number;
    type?: string;
    unread?: boolean;
  }): Promise<NotificationResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.page) queryParams.append('page', options.page.toString());
      if (options?.limit) queryParams.append('limit', options.limit.toString());
      if (options?.type) queryParams.append('type', options.type);
      if (options?.unread !== undefined) queryParams.append('unread', options.unread.toString());

      const endpoint = `/notifications${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      return await this.makeRequest(endpoint, 'GET');
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get achievement notifications specifically
   */
  async getAchievementNotifications(): Promise<{ success: boolean; data: NotificationData[] }> {
    try {
      return await this.makeRequest('/notifications/achievements', 'GET');
    } catch (error) {
      console.error('Error fetching achievement notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      return await this.makeRequest('/notifications/unread-count', 'GET');
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean; message: string }> {
    try {
      return await this.makeRequest(`/notifications/${notificationId}/read`, 'PATCH');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    try {
      return await this.makeRequest('/notifications/mark-all-read', 'PATCH');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    try {
      return await this.makeRequest(`/notifications/${notificationId}`, 'DELETE');
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Send test notification (development only)
   */
  async sendTestNotification(
    type: string, 
    title: string, 
    message: string, 
    data?: any
  ): Promise<{ success: boolean; message: string; data: NotificationData }> {
    try {
      return await this.makeRequest('/notifications/test', 'POST', {
        type,
        title,
        message,
        data
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  /**
   * Format notification for display
   */
  formatNotificationTime(createdAt: Date | string): string {
    const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'issue_created': '📝',
      'issue_updated': '📋',
      'issue_assigned': '👷',
      'issue_resolved': '✅',
      'issue_commented': '💬',
      'issue_upvoted': '👍',
      'achievement_earned': '🏆',
      'level_up': '🌟',
      'system_announcement': '📢'
    };

    return iconMap[type] || '🔔';
  }

  /**
   * Get priority color
   */
  getPriorityColor(priority: string): string {
    const colorMap: Record<string, string> = {
      'low': '#95A5A6',
      'medium': '#3498DB',
      'high': '#F39C12',
      'urgent': '#E74C3C'
    };

    return colorMap[priority] || '#3498DB';
  }
}

export const notificationService = new NotificationService();
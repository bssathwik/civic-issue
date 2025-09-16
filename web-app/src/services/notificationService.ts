import { apiService } from './apiService';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

class NotificationService {
  async getNotifications(page: number = 1, limit: number = 20) {
    const response = await apiService.get('/users/notifications', { page, limit });
    if (response.success) {
      return response;
    }
    throw new Error(response.message || 'Failed to fetch notifications');
  }

  async markAsRead(notificationId: string) {
    const response = await apiService.put(`/users/notifications/${notificationId}/read`);
    if (response.success) {
      return response;
    }
    throw new Error(response.message || 'Failed to mark notification as read');
  }

  async markAllAsRead() {
    const response = await apiService.put('/users/notifications/read-all');
    if (response.success) {
      return response;
    }
    throw new Error(response.message || 'Failed to mark all notifications as read');
  }

  // Helper method to get notification icon based on type
  getNotificationIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      issue_created: '🆕',
      issue_updated: '📝',
      issue_assigned: '👤',
      issue_resolved: '✅',
      issue_commented: '💬',
      issue_upvoted: '👍',
      issue_downvoted: '👎',
      achievement_earned: '🏆',
      level_up: '⭐',
      system_announcement: '📢',
      resolution_reminder: '⏰'
    };
    return iconMap[type] || '📋';
  }

  // Helper method to get notification color based on priority
  getNotificationColor(priority: string): string {
    const colorMap: { [key: string]: string } = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#f44336',
      urgent: '#e91e63'
    };
    return colorMap[priority] || '#2196f3';
  }
}

export const notificationService = new NotificationService();
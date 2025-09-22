// Import these conditionally since they may not be installed
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration - temporary inline until config is available
const API_BASE_URL = 'http://localhost:3000/api';

// Type definitions for expo notifications (in case package is not installed)
interface NotificationContent {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  priority?: any;
}

interface NotificationRequest {
  content: NotificationContent;
  identifier: string;
  trigger: any;
}

interface Notification {
  request: NotificationRequest;
  date: number;
}

interface NotificationResponse {
  notification: Notification;
  actionIdentifier: string;
  userText?: string;
}

// Try to import Expo modules, fallback if not available
let Notifications: any = null;
let Device: any = null;

// Initialize notification modules if available
const initializeNotificationModules = () => {
  try {
    // @ts-ignore - Dynamic import for optional dependency
    Notifications = global.require('expo-notifications');
    // @ts-ignore - Dynamic import for optional dependency  
    Device = global.require('expo-device');
    
    // Configure notification behavior if available
    if (Notifications && Notifications.setNotificationHandler) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    }
    return true;
  } catch {
    console.warn('Expo notifications or device modules not available');
    return false;
  }
};

// Initialize modules
const notificationModulesAvailable = initializeNotificationModules();

interface PushNotificationData {
  type: string;
  title: string;
  message: string;
  data?: any;
}

class PushNotificationService {
  private expoPushToken: string | null = null;

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return null;
      }

      // Get existing permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permission not granted');
        return null;
      }

      // Get the push token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token:', token);
      
      this.expoPushToken = token;
      
      // Register token with backend
      await this.registerTokenWithBackend(token);
      
      return token;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }

  /**
   * Register push token with backend
   */
  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      const authToken = await AsyncStorage.getItem('auth_token');
      if (!authToken) {
        console.warn('No auth token found, cannot register push token');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          pushToken: token,
          platform: Platform.OS,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to register push token: ${response.status}`);
      }

      console.log('Push token registered successfully');
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  }

  /**
   * Set up notification listeners
   */
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notification) => void,
    onNotificationTapped?: (response: NotificationResponse) => void
  ) {
    if (!Notifications) return null;
    
    // Listener for notifications received while app is foregrounded
    const foregroundSubscription = Notifications.addNotificationReceivedListener((notification: any) => {
      console.log('Notification received in foreground:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listener for when user taps on notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log('Notification tapped:', response);
      if (onNotificationTapped) {
        onNotificationTapped(response);
      }
    });

    return {
      foregroundSubscription,
      responseSubscription,
    };
  }

  /**
   * Send a local notification
   */
  async sendLocalNotification(data: PushNotificationData): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.message,
          data: data.data || {},
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: {
    pushEnabled: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  }): Promise<void> {
    try {
      const authToken = await AsyncStorage.getItem('auth_token');
      if (!authToken) return;

      const response = await fetch(`${API_BASE_URL}/notifications/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Failed to update notification settings: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  /**
   * Get current notification settings
   */
  async getNotificationSettings(): Promise<{
    pushEnabled: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  }> {
    try {
      const authToken = await AsyncStorage.getItem('auth_token');
      if (!authToken) {
        return { pushEnabled: false, soundEnabled: true, vibrationEnabled: true };
      }

      const response = await fetch(`${API_BASE_URL}/notifications/settings`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get notification settings: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return { pushEnabled: false, soundEnabled: true, vibrationEnabled: true };
    }
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Handle notification navigation
   */
  handleNotificationNavigation(
    notification: Notification | NotificationResponse,
    navigation: any
  ): void {
    const data = 'notification' in notification 
      ? notification.notification.request.content.data 
      : notification.request.content.data;

    if (!data || !data.type) return;

    switch (data.type) {
      case 'achievement_earned':
      case 'level_up':
        navigation.navigate('Achievements');
        break;
      case 'issue_created':
      case 'issue_updated':
      case 'issue_resolved':
      case 'issue_commented':
      case 'issue_upvoted':
        if (data.issueId) {
          navigation.navigate('IssueDetails', { issueId: data.issueId });
        }
        break;
      case 'system_announcement':
        navigation.navigate('Notifications');
        break;
      default:
        navigation.navigate('Notifications');
        break;
    }
  }

  /**
   * Get current push token
   */
  getCurrentToken(): string | null {
    return this.expoPushToken;
  }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
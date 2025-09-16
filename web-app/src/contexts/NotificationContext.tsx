import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetchNotifications();
      // Set up periodic refresh
      const interval = setInterval(fetchNotifications, 30000); // every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user, token]);

  const fetchNotifications = async () => {
    try {
      if (!token) return;
      
      const response = await notificationService.getNotifications();
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const showNotification = (
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setSnackbar({
      open: true,
      message,
      severity: type,
    });
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      showNotification('Failed to update notification', 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      showNotification('Failed to update notifications', 'error');
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const value = {
    notifications,
    unreadCount,
    showNotification,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
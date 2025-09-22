import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { pushNotificationService } from '../services/pushNotificationService';

interface AppInitializerProps {
  children: React.ReactNode;
  navigation?: any;
}

/**
 * App initializer component that sets up push notifications and other services
 */
const AppInitializer: React.FC<AppInitializerProps> = ({ children, navigation }) => {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize push notifications
        const token = await pushNotificationService.initialize();
        
        if (token) {
          console.log('Push notifications initialized successfully');
          
          // Set up notification listeners
          const subscriptions = pushNotificationService.setupNotificationListeners(
            // Handle foreground notifications
            (notification) => {
              const { title, body } = notification.request.content;
              
              // Show alert for foreground notifications
              Alert.alert(
                title || 'Notification',
                body || 'You have a new notification',
                [
                  {
                    text: 'View',
                    onPress: () => {
                      if (navigation) {
                        pushNotificationService.handleNotificationNavigation(notification, navigation);
                      }
                    },
                  },
                  {
                    text: 'Dismiss',
                    style: 'cancel',
                  },
                ]
              );
            },
            
            // Handle notification taps (background/killed app)
            (response) => {
              if (navigation) {
                pushNotificationService.handleNotificationNavigation(response, navigation);
              }
            }
          );

          // Update badge count on app start
          try {
            // This would be replaced with actual unread count from notification service
            await pushNotificationService.setBadgeCount(0);
          } catch (error) {
            console.warn('Could not update badge count:', error);
          }

          // Cleanup function
          return () => {
            if (subscriptions) {
              subscriptions.foregroundSubscription?.remove();
              subscriptions.responseSubscription?.remove();
            }
          };
        } else {
          console.warn('Push notifications not available');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, [navigation]);

  return <>{children}</>;
};

export default AppInitializer;
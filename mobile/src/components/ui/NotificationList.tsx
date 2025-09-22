import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { notificationService, NotificationData } from '../../services/notificationService';

interface NotificationListProps {
  onNotificationPress?: (notification: NotificationData) => void;
  showOnlyUnread?: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({
  onNotificationPress,
  showOnlyUnread = false,
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      const response = await notificationService.getNotifications({
        page: pageNum,
        limit: 20,
        unread: showOnlyUnread ? true : undefined,
      });

      if (response.success) {
        const newNotifications = response.data.notifications;
        
        setNotifications(prev => 
          append ? [...prev, ...newNotifications] : newNotifications
        );
        
        setUnreadCount(response.data.unreadCount);
        setHasMore(response.data.pagination.hasNext);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications. Please try again.');
    }
  }, [showOnlyUnread]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadNotifications(1, false);
    setIsRefreshing(false);
  }, [loadNotifications]);

  const loadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      await loadNotifications(page + 1, true);
    }
  }, [hasMore, isLoading, page, loadNotifications]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await loadNotifications(1, false);
      setIsLoading(false);
    };

    initialize();
  }, [loadNotifications]);

  const handleNotificationPress = async (notification: NotificationData) => {
    try {
      // Mark as read if not already read
      if (!notification.isRead) {
        await notificationService.markAsRead(notification._id);
        
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id
              ? { ...n, isRead: true, readAt: new Date() }
              : n
          )
        );
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Call external handler
      onNotificationPress?.(notification);
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
      
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const renderNotification = ({ item }: { item: NotificationData }) => {
    const icon = notificationService.getNotificationIcon(item.type);
    const timeAgo = notificationService.formatNotificationTime(item.createdAt);
    const priorityColor = notificationService.getPriorityColor(item.priority);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.isRead && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        {/* Priority indicator */}
        <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />

        {/* Notification content */}
        <View style={styles.notificationContent}>
          <View style={styles.header}>
            <Text style={styles.icon}>{icon}</Text>
            <View style={styles.headerText}>
              <Text style={[styles.title, !item.isRead && styles.unreadText]}>
                {item.title}
              </Text>
              <Text style={styles.timeStamp}>{timeAgo}</Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>

          <Text style={[styles.message, !item.isRead && styles.unreadText]}>
            {item.message}
          </Text>

          {/* Achievement-specific data */}
          {(item.type === 'achievement_earned' || item.type === 'level_up') && item.data.pointsAwarded && (
            <View style={styles.achievementInfo}>
              <Text style={styles.pointsText}>+{item.data.pointsAwarded} points</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>
        {showOnlyUnread ? 'No unread notifications' : 'No notifications yet'}
      </Text>
      <Text style={styles.emptyText}>
        {showOnlyUnread 
          ? 'You\'re all caught up!' 
          : 'When you receive notifications, they\'ll appear here.'
        }
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3498DB" />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with unread count and mark all read */}
      {unreadCount > 0 && (
        <View style={styles.headerContainer}>
          <Text style={styles.unreadCountText}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllButtonText}>Mark all read</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={notifications.length === 0 ? styles.emptyList : undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  unreadCountText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3498DB',
    borderRadius: 16,
  },
  markAllButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  unreadNotification: {
    backgroundColor: '#FFF',
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  priorityIndicator: {
    width: 4,
    backgroundColor: '#3498DB',
  },
  notificationContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    lineHeight: 20,
  },
  unreadText: {
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  timeStamp: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
    marginLeft: 8,
    marginTop: 6,
  },
  message: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 18,
    marginLeft: 32,
  },
  achievementInfo: {
    marginLeft: 32,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  pointsText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
  },
});

export default NotificationList;
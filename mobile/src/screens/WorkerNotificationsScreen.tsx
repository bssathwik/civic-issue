import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Switch,
  Modal,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Types
interface NotificationData {
  id: string;
  type: 'assignment' | 'status_update' | 'priority_change' | 'system' | 'message' | 'reminder';
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  data?: {
    issueId?: number;
    userId?: number;
    actionUrl?: string;
    priority?: 'high' | 'medium' | 'low';
  };
  source: 'system' | 'supervisor' | 'citizen';
}

interface NotificationSettings {
  pushEnabled: boolean;
  assignments: boolean;
  statusUpdates: boolean;
  priorityChanges: boolean;
  systemAnnouncements: boolean;
  messages: boolean;
  reminders: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
  };
  sound: boolean;
  vibration: boolean;
}

// Mock notifications data
const MOCK_NOTIFICATIONS: NotificationData[] = [
  {
    id: '1',
    type: 'assignment',
    title: 'New Issue Assigned',
    body: 'You have been assigned to fix a pothole on Main Street',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    read: false,
    data: { issueId: 123, priority: 'high' },
    source: 'system',
  },
  {
    id: '2',
    type: 'priority_change',
    title: 'Priority Updated',
    body: 'Issue #105 priority changed from Medium to High',
    timestamp: new Date(Date.now() - 600000), // 10 minutes ago
    read: false,
    data: { issueId: 105, priority: 'high' },
    source: 'supervisor',
  },
  {
    id: '3',
    type: 'status_update',
    title: 'Status Confirmation Required',
    body: 'Please confirm completion of issue #098',
    timestamp: new Date(Date.now() - 900000), // 15 minutes ago
    read: true,
    data: { issueId: 98 },
    source: 'system',
  },
  {
    id: '4',
    type: 'message',
    title: 'Message from Supervisor',
    body: 'Great work on the recent street light repairs!',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    read: true,
    data: { userId: 456 },
    source: 'supervisor',
  },
  {
    id: '5',
    type: 'system',
    title: 'System Maintenance',
    body: 'Scheduled maintenance tonight from 11 PM to 1 AM',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    read: true,
    source: 'system',
  },
];

const WorkerNotificationsScreen = () => {
  const navigation = useNavigation<any>();

  // State management
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    assignments: true,
    statusUpdates: true,
    priorityChanges: true,
    systemAnnouncements: true,
    messages: true,
    reminders: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    sound: true,
    vibration: true,
  });
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'assignments' | 'system'>('all');

  const loadNotifications = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/worker/notifications');
      // setNotifications(response.data);
      
      // Using mock data for now
      setNotifications(MOCK_NOTIFICATIONS);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    requestNotificationPermissions();
    setupNotificationListeners();
  }, [loadNotifications]);

  const requestNotificationPermissions = async () => {
    try {
      // TODO: Implement actual notification permissions
      // import * as Notifications from 'expo-notifications';
      // const { status } = await Notifications.requestPermissionsAsync();
      // if (status !== 'granted') {
      //   Alert.alert(
      //     'Notifications Disabled',
      //     'Please enable notifications to receive important updates about your assignments.',
      //     [
      //       { text: 'Cancel', style: 'cancel' },
      //       { text: 'Settings', onPress: () => Linking.openSettings() },
      //     ]
      //   );
      // }
      
      console.log('Requesting notification permissions...');
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
    }
  };

  const setupNotificationListeners = () => {
    // TODO: Implement actual notification listeners
    // const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    //   console.log('Notification received:', notification);
    //   loadNotifications(); // Refresh notifications when new one arrives
    // });

    // const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    //   console.log('Notification response:', response);
    //   handleNotificationPress(response.notification.request.content.data);
    // });

    // return () => {
    //   Notifications.removeNotificationSubscription(notificationListener);
    //   Notifications.removeNotificationSubscription(responseListener);
    // };
    
    console.log('Setting up notification listeners...');
  };

  const handleNotificationPress = (notification: NotificationData) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.data?.issueId) {
      navigation.navigate('WorkerIssueDetails', { issueId: notification.data.issueId });
    } else if (notification.data?.actionUrl) {
      // Handle custom action URLs
      console.log('Navigate to:', notification.data.actionUrl);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    
    // TODO: Update read status on server
    // apiClient.post(`/worker/notifications/${notificationId}/read`);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    
    // TODO: Update all notifications as read on server
    // apiClient.post('/worker/notifications/mark-all-read');
    
    Alert.alert('Success', 'All notifications marked as read');
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    
    // TODO: Delete notification on server
    // apiClient.delete(`/worker/notifications/${notificationId}`);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // TODO: Save settings to server
    // apiClient.post('/worker/notification-settings', { ...settings, ...newSettings });
    
    // TODO: Update local notification configuration
    // configureNotifications({ ...settings, ...newSettings });
  };

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'assignment': return 'briefcase';
      case 'status_update': return 'refresh';
      case 'priority_change': return 'alert-circle';
      case 'system': return 'settings';
      case 'message': return 'mail';
      case 'reminder': return 'time';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: NotificationData['type'], read: boolean) => {
    if (read) return '#9CA3AF';
    
    switch (type) {
      case 'assignment': return '#6366F1';
      case 'status_update': return '#10B981';
      case 'priority_change': return '#EF4444';
      case 'system': return '#F59E0B';
      case 'message': return '#8B5CF6';
      case 'reminder': return '#06B6D4';
      default: return '#6B7280';
    }
  };

  const getSourceIcon = (source: NotificationData['source']) => {
    switch (source) {
      case 'supervisor': return 'person';
      case 'citizen': return 'people';
      case 'system': return 'cog';
      default: return 'information-circle';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read;
      case 'assignments': return notification.type === 'assignment';
      case 'system': return notification.type === 'system';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotificationItem = ({ item }: { item: NotificationData }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getNotificationIcon(item.type) as any}
              size={20}
              color={getNotificationColor(item.type, item.read)}
            />
          </View>
          
          <View style={styles.notificationText}>
            <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>
              {item.title}
            </Text>
            <Text style={styles.notificationBody} numberOfLines={2}>
              {item.body}
            </Text>
          </View>
          
          <View style={styles.notificationMeta}>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
            <Ionicons
              name={getSourceIcon(item.source) as any}
              size={12}
              color="#9CA3AF"
            />
          </View>
        </View>
        
        {!item.read && <View style={styles.unreadIndicator} />}
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteNotification(item.id) },
            ]
          );
        }}
      >
        <Ionicons name="trash-outline" size={16} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSettings = () => (
    <Modal
      visible={settingsModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setSettingsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.settingsModal}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Notification Settings</Text>
            <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={[
              { key: 'pushEnabled', label: 'Push Notifications', description: 'Enable all push notifications' },
              { key: 'assignments', label: 'New Assignments', description: 'Notify when assigned to new issues' },
              { key: 'statusUpdates', label: 'Status Updates', description: 'Notify about issue status changes' },
              { key: 'priorityChanges', label: 'Priority Changes', description: 'Notify when issue priority changes' },
              { key: 'systemAnnouncements', label: 'System Announcements', description: 'Important system updates' },
              { key: 'messages', label: 'Messages', description: 'Messages from supervisors or citizens' },
              { key: 'reminders', label: 'Reminders', description: 'Deadline and follow-up reminders' },
              { key: 'sound', label: 'Sound', description: 'Play sound for notifications' },
              { key: 'vibration', label: 'Vibration', description: 'Vibrate for notifications' },
            ]}
            renderItem={({ item }) => (
              <View style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
                <Switch
                  value={settings[item.key as keyof NotificationSettings] as boolean}
                  onValueChange={(value) => updateSettings({ [item.key]: value })}
                  trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                  thumbColor={settings[item.key as keyof NotificationSettings] ? '#FFF' : '#F3F4F6'}
                />
              </View>
            )}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6366F1" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.headerButton} onPress={markAllAsRead}>
              <Ionicons name="checkmark-done" size={20} color="#FFF" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setSettingsModalVisible(true)}
          >
            <Ionicons name="settings" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'assignments', label: 'Assignments', count: notifications.filter(n => n.type === 'assignment').length },
          { key: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              filter === tab.key && styles.filterTabActive
            ]}
            onPress={() => setFilter(tab.key as any)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === tab.key && styles.filterTabTextActive
              ]}
            >
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'unread' ? 'All notifications are read!' : 'You\'ll see notifications here when they arrive'}
            </Text>
          </View>
        }
      />

      {/* Settings Modal */}
      {renderSettings()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  filterContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#6366F1',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFF',
  },
  filterBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  notificationItem: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
    backgroundColor: '#FEFEFE',
  },
  notificationContent: {
    flex: 1,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  unreadTitle: {
    color: '#000',
    fontWeight: 'bold',
  },
  notificationBody: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  notificationMeta: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  unreadIndicator: {
    position: 'absolute',
    right: -8,
    top: -8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  settingsModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default WorkerNotificationsScreen;

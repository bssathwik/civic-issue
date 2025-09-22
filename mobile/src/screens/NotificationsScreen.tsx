import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch, Alert } from 'react-native';
import NotificationList from '../components/ui/NotificationList';
import { NotificationData } from '../services/notificationService';

interface NotificationsScreenProps {
  navigation: any;
}

const NotificationsScreen = ({ navigation }: NotificationsScreenProps) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [updateNotifications, setUpdateNotifications] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'updates' | 'resolved' | 'alerts'>('all');

  const handleNotificationPress = (notification: NotificationData) => {
    // Navigate based on notification type
    switch (notification.type) {
      case 'achievement_earned':
      case 'level_up':
        navigation.navigate('Achievements');
        break;
      case 'issue_created':
      case 'issue_updated':
      case 'issue_resolved':
      case 'issue_commented':
      case 'issue_upvoted':
        if (notification.data.issueId) {
          navigation.navigate('IssueDetails', { 
            issueId: notification.data.issueId 
          });
        }
        break;
      default:
        // For system announcements or other types, show details in modal
        Alert.alert(
          notification.title,
          notification.message,
          [{ text: 'OK', style: 'default' }]
        );
        break;
    }
  };

  const getFilteredNotifications = (filterType: string) => {
    switch (filterType) {
      case 'unread':
        return { showOnlyUnread: true };
      case 'updates':
        return { typeFilter: ['issue_updated', 'issue_commented'] };
      case 'resolved':
        return { typeFilter: ['issue_resolved'] };
      case 'alerts':
        return { typeFilter: ['achievement_earned', 'level_up', 'system_announcement'] };
      default:
        return {};
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollView}
          >
            <TouchableOpacity 
              style={[styles.filterTab, activeFilter === 'all' && styles.activeFilter]}
              onPress={() => setActiveFilter('all')}
            >
              <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterTab, activeFilter === 'unread' && styles.activeFilter]}
              onPress={() => setActiveFilter('unread')}
            >
              <Text style={[styles.filterText, activeFilter === 'unread' && styles.activeFilterText]}>Unread</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterTab, activeFilter === 'updates' && styles.activeFilter]}
              onPress={() => setActiveFilter('updates')}
            >
              <Text style={[styles.filterText, activeFilter === 'updates' && styles.activeFilterText]}>Updates</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterTab, activeFilter === 'resolved' && styles.activeFilter]}
              onPress={() => setActiveFilter('resolved')}
            >
              <Text style={[styles.filterText, activeFilter === 'resolved' && styles.activeFilterText]}>Resolved</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterTab, activeFilter === 'alerts' && styles.activeFilter]}
              onPress={() => setActiveFilter('alerts')}
            >
              <Text style={[styles.filterText, activeFilter === 'alerts' && styles.activeFilterText]}>Alerts</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Notifications List */}
        <View style={styles.notificationsList}>
          <NotificationList
            {...getFilteredNotifications(activeFilter)}
            onNotificationPress={handleNotificationPress}
          />
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#4FD1C720' }]}>
                <Ionicons name="phone-portrait" size={20} color="#4FD1C7" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSubtitle}>Receive instant updates</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#E5E7EB', true: '#4FD1C7' }}
              thumbColor={pushNotifications ? '#fff' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="mail" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Email Notifications</Text>
                <Text style={styles.settingSubtitle}>Weekly summary emails</Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#E5E7EB', true: '#4FD1C7' }}
              thumbColor={emailNotifications ? '#fff' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#8B5CF620' }]}>
                <Ionicons name="refresh" size={20} color="#8B5CF6" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Status Updates</Text>
                <Text style={styles.settingSubtitle}>Issue progress notifications</Text>
              </View>
            </View>
            <Switch
              value={updateNotifications}
              onValueChange={setUpdateNotifications}
              trackColor={{ false: '#E5E7EB', true: '#4FD1C7' }}
              thumbColor={updateNotifications ? '#fff' : '#9CA3AF'}
            />
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#4FD1C7',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  settingsButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filterScrollView: {
    flexDirection: 'row',
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  activeFilter: {
    backgroundColor: '#4FD1C7',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default NotificationsScreen;

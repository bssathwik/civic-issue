import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface SettingsScreenProps {
  navigation: any;
}

interface BaseSettingItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ActionSettingItem extends BaseSettingItem {
  action: () => void;
  toggle?: never;
  value?: never;
  onToggle?: never;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ToggleSettingItem extends BaseSettingItem {
  toggle: true;
  value: boolean;
  onToggle: (value: boolean) => void;
  action?: never;
}

const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const result = await logout();
              if (result.success) {
                Alert.alert('Success', result.message);
                // Navigation will be handled by the AppNavigator based on auth state
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Logout failed');
            }
          }
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          icon: 'person',
          color: '#4FD1C7',
          action: () => navigation.navigate('Profile'),
        },
        {
          id: 'privacy',
          title: 'Privacy & Security',
          subtitle: 'Manage your privacy settings',
          icon: 'shield-checkmark',
          color: '#8B5CF6',
          action: () => {},
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'location',
          title: 'Location Services',
          subtitle: 'Allow location access for better reporting',
          icon: 'location',
          color: '#EF4444',
          toggle: true,
          value: locationEnabled,
          onToggle: setLocationEnabled,
        },
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive updates about your reports',
          icon: 'notifications',
          color: '#F59E0B',
          toggle: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          id: 'theme',
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme',
          icon: 'moon',
          color: '#6B7280',
          toggle: true,
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          id: 'sync',
          title: 'Auto Sync',
          subtitle: 'Automatically sync data when available',
          icon: 'sync',
          color: '#10B981',
          toggle: true,
          value: autoSync,
          onToggle: setAutoSync,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          subtitle: 'Get help and support',
          icon: 'help-circle',
          color: '#3B82F6',
          action: () => {},
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Help us improve the app',
          icon: 'chatbubble-ellipses',
          color: '#EC4899',
          action: () => {},
        },
        {
          id: 'about',
          title: 'About',
          subtitle: 'App version and information',
          icon: 'information-circle',
          color: '#6366F1',
          action: () => {},
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.settingItem}
                  onPress={'action' in item ? item.action : undefined}
                  disabled={'toggle' in item}
                >
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: `${item.color}20` }]}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  {'toggle' in item ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#E5E7EB', true: '#4FD1C7' }}
                      thumbColor={item.value ? '#fff' : '#9CA3AF'}
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.versionSubtext}>© 2024 Civic Issue Tracker</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, isLoading && styles.logoutButtonDisabled]} 
          onPress={handleLogout}
          disabled={isLoading}
        >
          <View style={styles.logoutContent}>
            <View style={styles.logoutIcon}>
              <Ionicons name="log-out" size={20} color={isLoading ? "#9CA3AF" : "#EF4444"} />
            </View>
            <Text style={[styles.logoutText, isLoading && styles.logoutTextDisabled]}>
              {isLoading ? 'Logging out...' : 'Logout'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

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
  placeholder: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  settingText: {
    flex: 1,
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
  versionSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  versionSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutTextDisabled: {
    color: '#9CA3AF',
  },
});

export default SettingsScreen;

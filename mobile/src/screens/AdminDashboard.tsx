import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

// Navigation type for admin features
type AdminNavigationProp = NavigationProp<{
  Analytics: undefined;
  AdminDashboard: undefined;
  Profile: undefined;
  Notifications: undefined;
  Settings: undefined;
  About: undefined;
}>;

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<AdminNavigationProp>();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              // Navigation will be handled by AuthContext state change
            }
          },
        },
      ]
    );
  };

  const QuickActionCard = ({ title, icon, onPress, color = '#007AFF', count }: any) => (
    <TouchableOpacity style={[styles.actionCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.actionContent}>
        <Ionicons name={icon} size={32} color={color} />
        <View style={styles.actionInfo}>
          <Text style={styles.actionTitle}>{title}</Text>
          {count !== undefined && (
            <Text style={[styles.actionCount, { color }]}>{count}</Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  const StatsCard = ({ title, value, icon, color, trend }: any) => (
    <View style={[styles.statsCard, { backgroundColor: color }]}>
      <View style={styles.statsHeader}>
        <Ionicons name={icon} size={28} color="white" />
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons 
              name={trend > 0 ? "trending-up" : "trending-down"} 
              size={16} 
              color="white" 
            />
            <Text style={styles.trendText}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={user?.avatar ? { uri: user.avatar } : require('../assets/icon.png')}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.welcomeText}>Administrator</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userRole}>System Administrator</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <StatsCard
          title="Total Issues"
          value="1,247"
          icon="document-text"
          color="#FF6B6B"
          trend={12}
        />
        <StatsCard
          title="Active Users"
          value="856"
          icon="people"
          color="#4ECDC4"
          trend={8}
        />
        <StatsCard
          title="Resolved Today"
          value="23"
          icon="checkmark-circle"
          color="#45B7D1"
          trend={-3}
        />
      </View>

      {/* System Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Management</Text>
        
        <QuickActionCard
          title="Analytics Dashboard"
          icon="analytics"
          color="#9C88FF"
          onPress={() => navigation.navigate('Analytics')}
        />
        
        <QuickActionCard
          title="User Management"
          icon="people"
          color="#FF6B6B"
          count="856 users"
          onPress={() => {
            Alert.alert('Coming Soon', 'User management interface will be available soon!');
          }}
        />
        
        <QuickActionCard
          title="Issue Categories"
          icon="pricetags"
          color="#4ECDC4"
          count="12 categories"
          onPress={() => {
            Alert.alert('Coming Soon', 'Category management interface will be available soon!');
          }}
        />
        
        <QuickActionCard
          title="Field Workers"
          icon="construct"
          color="#FFA500"
          count="45 workers"
          onPress={() => {
            Alert.alert('Coming Soon', 'Worker management interface will be available soon!');
          }}
        />
      </View>

      {/* Reports & Monitoring */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reports & Monitoring</Text>
        
        <QuickActionCard
          title="System Reports"
          icon="document-text"
          color="#666"
          onPress={() => {
            Alert.alert('Coming Soon', 'System reports will be available soon!');
          }}
        />
        
        <QuickActionCard
          title="Performance Metrics"
          icon="speedometer"
          color="#666"
          onPress={() => {
            Alert.alert('Coming Soon', 'Performance metrics will be available soon!');
          }}
        />
        
        <QuickActionCard
          title="Audit Logs"
          icon="document"
          color="#666"
          onPress={() => {
            Alert.alert('Coming Soon', 'Audit logs will be available soon!');
          }}
        />
      </View>

      {/* Account & Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account & Settings</Text>
        
        <QuickActionCard
          title="My Profile"
          icon="person"
          color="#666"
          onPress={() => navigation.navigate('Profile')}
        />
        
        <QuickActionCard
          title="System Settings"
          icon="settings"
          color="#666"
          onPress={() => navigation.navigate('Settings')}
        />
        
        <QuickActionCard
          title="About System"
          icon="information-circle"
          color="#666"
          onPress={() => navigation.navigate('About')}
        />
      </View>

      {/* Recent System Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent System Activity</Text>
        
        <View style={styles.activityCard}>
          <Ionicons name="person-add" size={20} color="#4ECDC4" />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>New User Registered</Text>
            <Text style={styles.activityDesc}>John Doe registered as a citizen</Text>
            <Text style={styles.activityTime}>15 minutes ago</Text>
          </View>
        </View>

        <View style={styles.activityCard}>
          <Ionicons name="checkmark-circle" size={20} color="#45B7D1" />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Issue Resolved</Text>
            <Text style={styles.activityDesc}>Pothole on Main Street marked as resolved</Text>
            <Text style={styles.activityTime}>1 hour ago</Text>
          </View>
        </View>

        <View style={styles.activityCard}>
          <Ionicons name="warning" size={20} color="#FFA500" />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>High Priority Issue</Text>
            <Text style={styles.activityDesc}>Water main break reported on Oak Street</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  logoutButton: {
    padding: 5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userRole: {
    fontSize: 12,
    color: '#9C88FF',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  statsTitle: {
    fontSize: 12,
    color: 'white',
    textAlign: 'left',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  actionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionInfo: {
    marginLeft: 15,
  },
  actionTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  actionCount: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  activityContent: {
    flex: 1,
    marginLeft: 10,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activityDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
});

export default AdminDashboardScreen;
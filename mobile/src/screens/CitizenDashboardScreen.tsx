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

// Navigation type for citizen features
type CitizenNavigationProp = NavigationProp<{
  ReportIssue: undefined;
  MyReports: undefined;
  MapView: undefined;
  Profile: undefined;
  Notifications: undefined;
  Settings: undefined;
  Feedback: undefined;
  HelpSupport: undefined;
}>;

const CitizenDashboardScreen: React.FC = () => {
  const navigation = useNavigation<CitizenNavigationProp>();
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

  const QuickActionCard = ({ title, icon, onPress, color = '#007AFF' }: any) => (
    <TouchableOpacity style={[styles.actionCard, { borderLeftColor: color }]} onPress={onPress}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.actionTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  const StatsCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statsCard, { backgroundColor: color }]}>
      <Ionicons name={icon} size={30} color="white" />
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
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userRole}>Citizen</Text>
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
          title="Reported Issues"
          value="12"
          icon="document-text"
          color="#FF6B6B"
        />
        <StatsCard
          title="Resolved Issues"
          value="8"
          icon="checkmark-circle"
          color="#4ECDC4"
        />
        <StatsCard
          title="Community Points"
          value="150"
          icon="star"
          color="#45B7D1"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <QuickActionCard
          title="Report New Issue"
          icon="add-circle"
          color="#FF6B6B"
          onPress={() => navigation.navigate('ReportIssue')}
        />
        
        <QuickActionCard
          title="My Reports"
          icon="document-text"
          color="#4ECDC4"
          onPress={() => navigation.navigate('MyReports')}
        />
        
        <QuickActionCard
          title="Issues Near Me"
          icon="location"
          color="#45B7D1"
          onPress={() => navigation.navigate('MapView')}
        />
        
        <QuickActionCard
          title="Community Voting"
          icon="thumbs-up"
          color="#9C88FF"
          onPress={() => {
            // Navigate to community voting screen
            Alert.alert('Coming Soon', 'Community voting feature will be available soon!');
          }}
        />
      </View>

      {/* Account & Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account & Support</Text>
        
        <QuickActionCard
          title="My Profile"
          icon="person"
          color="#666"
          onPress={() => navigation.navigate('Profile')}
        />
        
        <QuickActionCard
          title="Feedback"
          icon="chatbox"
          color="#666"
          onPress={() => navigation.navigate('Feedback')}
        />
        
        <QuickActionCard
          title="Help & Support"
          icon="help-circle"
          color="#666"
          onPress={() => navigation.navigate('HelpSupport')}
        />
        
        <QuickActionCard
          title="Settings"
          icon="settings"
          color="#666"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Issue Resolved</Text>
            <Text style={styles.activityDesc}>Your pothole report has been resolved</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
        </View>
        <View style={styles.activityCard}>
          <Ionicons name="eye" size={20} color="#45B7D1" />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Issue Updated</Text>
            <Text style={styles.activityDesc}>Streetlight issue is now in progress</Text>
            <Text style={styles.activityTime}>1 day ago</Text>
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
    color: '#007AFF',
    textTransform: 'uppercase',
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
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  statsTitle: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginTop: 2,
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
  actionTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
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

export default CitizenDashboardScreen;

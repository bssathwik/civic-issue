import React, { useState } from 'react';
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

// Navigation type for worker features
type WorkerNavigationProp = NavigationProp<{
  AssignedIssues: undefined;
  IssueManagement: undefined;
  TimeTracking: undefined;
  WorkerReports: undefined;
  Profile: undefined;
  Notifications: undefined;
  Settings: undefined;
  MapView: undefined;
}>;

const WorkerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<WorkerNavigationProp>();
  const { user, logout } = useAuth();
  const [isOnShift, setIsOnShift] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState<Date | null>(null);

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

  const handleShiftToggle = () => {
    if (isOnShift) {
      // End shift
      Alert.alert(
        'End Shift',
        'Are you sure you want to end your shift?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'End Shift',
            onPress: () => {
              setIsOnShift(false);
              setShiftStartTime(null);
              Alert.alert('Shift Ended', 'Your shift has been ended successfully.');
            },
          },
        ]
      );
    } else {
      // Start shift
      setIsOnShift(true);
      setShiftStartTime(new Date());
      Alert.alert('Shift Started', 'Your shift has been started successfully.');
    }
  };

  const getShiftDuration = () => {
    if (!isOnShift || !shiftStartTime) return '00:00';
    const now = new Date();
    const diff = now.getTime() - shiftStartTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const QuickActionCard = ({ title, icon, onPress, color = '#007AFF', disabled = false }: any) => (
    <TouchableOpacity
      style={[
        styles.actionCard,
        { borderLeftColor: color, opacity: disabled ? 0.5 : 1 }
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
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
            <Text style={styles.welcomeText}>Field Worker</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isOnShift ? '#4ECDC4' : '#FF6B6B' }
                ]}
              />
              <Text style={styles.statusText}>
                {isOnShift ? 'On Shift' : 'Off Shift'}
              </Text>
              {isOnShift && (
                <Text style={styles.shiftTime}>({getShiftDuration()})</Text>
              )}
            </View>
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

      {/* Shift Control */}
      <View style={styles.shiftContainer}>
        <TouchableOpacity
          style={[
            styles.shiftButton,
            { backgroundColor: isOnShift ? '#FF6B6B' : '#4ECDC4' }
          ]}
          onPress={handleShiftToggle}
        >
          <Ionicons
            name={isOnShift ? "stop-circle" : "play-circle"}
            size={24}
            color="white"
          />
          <Text style={styles.shiftButtonText}>
            {isOnShift ? 'End Shift' : 'Start Shift'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <StatsCard
          title="Assigned"
          value="5"
          icon="clipboard"
          color="#FF6B6B"
        />
        <StatsCard
          title="Completed"
          value="23"
          icon="checkmark-circle"
          color="#4ECDC4"
        />
        <StatsCard
          title="This Week"
          value="8"
          icon="calendar"
          color="#45B7D1"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Work Management</Text>
        
        <QuickActionCard
          title="View Assigned Issues"
          icon="list"
          color="#FF6B6B"
          onPress={() => navigation.navigate('AssignedIssues')}
        />
        
        <QuickActionCard
          title="Issue Management"
          icon="construct"
          color="#4ECDC4"
          onPress={() => navigation.navigate('IssueManagement')}
          disabled={!isOnShift}
        />
        
        <QuickActionCard
          title="Issues Map"
          icon="location"
          color="#45B7D1"
          onPress={() => navigation.navigate('MapView')}
        />
        
        <QuickActionCard
          title="Time Tracking"
          icon="time"
          color="#9C88FF"
          onPress={() => navigation.navigate('TimeTracking')}
        />
      </View>

      {/* Reports & Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reports & Account</Text>
        
        <QuickActionCard
          title="My Reports"
          icon="document-text"
          color="#666"
          onPress={() => navigation.navigate('WorkerReports')}
        />
        
        <QuickActionCard
          title="My Profile"
          icon="person"
          color="#666"
          onPress={() => navigation.navigate('Profile')}
        />
        
        <QuickActionCard
          title="Settings"
          icon="settings"
          color="#666"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>

      {/* Today's Tasks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today&apos;s Priority Tasks</Text>
        
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Ionicons name="construct" size={20} color="#FF6B6B" />
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>Pothole Repair</Text>
              <Text style={styles.taskLocation}>Main Street, Block A</Text>
            </View>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>HIGH</Text>
            </View>
          </View>
          <Text style={styles.taskDescription}>
            Large pothole causing traffic issues. Requires immediate attention.
          </Text>
          <View style={styles.taskFooter}>
            <Text style={styles.taskTime}>Assigned 2 hours ago</Text>
            <TouchableOpacity style={styles.taskButton}>
              <Text style={styles.taskButtonText}>Start Work</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Ionicons name="bulb" size={20} color="#45B7D1" />
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>Streetlight Repair</Text>
              <Text style={styles.taskLocation}>Park Avenue, Block B</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: '#FFA500' }]}>
              <Text style={styles.priorityText}>MEDIUM</Text>
            </View>
          </View>
          <Text style={styles.taskDescription}>
            Streetlight not working properly. Needs bulb replacement.
          </Text>
          <View style={styles.taskFooter}>
            <Text style={styles.taskTime}>Assigned 5 hours ago</Text>
            <TouchableOpacity style={styles.taskButton}>
              <Text style={styles.taskButtonText}>Start Work</Text>
            </TouchableOpacity>
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
    marginBottom: 5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  shiftTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  shiftContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  shiftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  shiftButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  taskCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskInfo: {
    flex: 1,
    marginLeft: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  taskLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  priorityBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTime: {
    fontSize: 12,
    color: '#999',
  },
  taskButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  taskButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WorkerDashboardScreen;

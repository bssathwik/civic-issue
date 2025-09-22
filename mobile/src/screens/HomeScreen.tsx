import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { apiClient } from '../services/api';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { issues, nearbyIssues, isLoading, isRefreshing, refreshData, fetchNearbyIssues } = useReports();
  
  // Local state for user statistics
  const [userStats, setUserStats] = useState({
    points: 150,
    reportsCount: 12,
    rank: 0,
    issuesResolved: 8,
    responseRate: 85
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch user statistics
  const fetchUserStatistics = async () => {
    try {
      setIsLoadingStats(true);
      const [statsResponse, leaderboardResponse] = await Promise.all([
        apiClient.getUserStatistics(),
        apiClient.getLeaderboard()
      ]);

      if (statsResponse.data) {
        setUserStats(prev => ({
          ...prev,
          ...statsResponse.data,
        }));
      }
    } catch (error) {
      console.error('Error fetching user statistics:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch stats on component mount
  useEffect(() => {
    fetchUserStatistics();
  }, [issues]);

  const getUserDisplayName = () => {
    return user?.name || user?.email?.split('@')[0] || 'Sathwik';
  };

  const handleRefresh = async () => {
    await refreshData();
    await fetchUserStatistics();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4FD1C7" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.welcomeSection}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{getUserDisplayName()}</Text>
              <Text style={styles.userRole}>CITIZEN</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <Ionicons name="person-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="document-text" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>{userStats.reportsCount}</Text>
              <Text style={styles.statLabel}>Reported Issues</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>{userStats.issuesResolved}</Text>
              <Text style={styles.statLabel}>Resolved Issues</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="star" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>{userStats.points}</Text>
              <Text style={styles.statLabel}>Community Points</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#4FD1C7']}
            tintColor="#4FD1C7"
          />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('ReportIssue')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="add-circle" size={24} color="#DC2626" />
            </View>
            <Text style={styles.actionText}>Report New Issue</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('MyReports')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="document-text" size={24} color="#059669" />
            </View>
            <Text style={styles.actionText}>My Reports</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('MapView')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="location" size={24} color="#2563EB" />
            </View>
            <Text style={styles.actionText}>Issues Near Me</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('CommunityVoting')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="thumbs-up" size={24} color="#7C3AED" />
            </View>
            <Text style={styles.actionText}>Community Voting</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Account & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Support</Text>
          
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="person" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.actionText}>Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="settings" size={24} color="#6B7280" />
            </View>
            <Text style={styles.actionText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="help-circle" size={24} color="#10B981" />
            </View>
            <Text style={styles.actionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
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
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  welcomeSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    marginRight: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});

export default HomeScreen;
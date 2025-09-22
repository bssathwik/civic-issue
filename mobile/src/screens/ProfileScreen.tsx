import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { DebugPanel } from '../components/DebugPanel';
import { apiClient } from '../services/api';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { logout, user } = useAuth();
  
  // State for dynamic data
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [gamificationStats, setGamificationStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user statistics
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [dashboardResponse, gamificationResponse] = await Promise.all([
          apiClient.getUserDashboardStats(),
          apiClient.getGamificationStats()
        ]);

        if (dashboardResponse.success) {
          setDashboardStats(dashboardResponse.stats);
        }
        
        if (gamificationResponse.success) {
          setGamificationStats(gamificationResponse.stats || gamificationResponse.data);
        }
        
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        setError(error.message || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleMenuPress = (item: string) => {
    switch (item) {
      case 'reports':
        navigation.navigate('My Reports');
        break;
      case 'notifications':
        // Navigate to the Notifications tab instead of trying to push a new screen
        navigation.getParent()?.navigate('Notifications');
        break;
      case 'community':
        navigation.navigate('CommunityVoting');
        break;
      case 'settings':
        (navigation as any).navigate('Settings');
        break;
      case 'logout':
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
                    // Navigation will automatically happen via AuthContext
                    console.log('Logout successful');
                  }
                } catch (error) {
                  console.error('Logout error:', error);
                  Alert.alert('Error', 'Failed to logout. Please try again.');
                }
              }
            },
          ]
        );
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ 
                  uri: user?.avatar || 'https://via.placeholder.com/80'
                }} 
                style={styles.avatar} 
              />
              <TouchableOpacity style={styles.cameraButton}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{user?.name || 'Unknown User'}</Text>
            <Text style={styles.email}>{user?.email || 'No email provided'}</Text>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4FD1C7" />
                <Text style={styles.loadingText}>Loading profile data...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : (
              <>
                <View style={styles.levelContainer}>
                  <View style={styles.levelBadge}>
                    <Ionicons name="trophy" size={16} color="#fff" />
                    <Text style={styles.levelText}>
                      Level {gamificationStats?.level || dashboardStats?.engagement?.level || 1} - {dashboardStats?.engagement?.badge || 'Newcomer'}
                    </Text>
                  </View>
                </View>

                {/* XP Progress Bar */}
                <View style={styles.xpContainer}>
                  <View style={styles.xpBar}>
                    <View style={[
                      styles.xpProgress, 
                      { 
                        width: `${Math.min((gamificationStats?.currentXP || 0) / (gamificationStats?.xpToNextLevel || 100) * 100, 100)}%`
                      }
                    ]} />
                  </View>
                  <Text style={styles.xpText}>
                    {gamificationStats?.currentXP || 0} / {gamificationStats?.xpToNextLevel || 100} XP
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>
              {isLoading ? '-' : (dashboardStats?.issues?.total || 0)}
            </Text>
            <Text style={styles.statsLabel}>Reports Filed</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>
              {isLoading ? '-' : (dashboardStats?.issues?.resolved || 0)}
            </Text>
            <Text style={styles.statsLabel}>Issues Resolved</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>
              {isLoading ? '-' : (dashboardStats?.engagement?.points || 0)}
            </Text>
            <Text style={styles.statsLabel}>Community Points</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
            {isLoading ? (
              <View style={styles.achievementItem}>
                <View style={[styles.achievementIcon, { backgroundColor: '#E5E7EB' }]}>
                  <ActivityIndicator size="small" color="#9CA3AF" />
                </View>
                <Text style={styles.achievementText}>Loading...</Text>
              </View>
            ) : error ? (
              <View style={styles.achievementItem}>
                <View style={[styles.achievementIcon, { backgroundColor: '#FEF2F2' }]}>
                  <Ionicons name="warning" size={24} color="#EF4444" />
                </View>
                <Text style={styles.achievementText}>Error loading</Text>
              </View>
            ) : (
              <>
                {/* Default/Demo Achievement based on reports */}
                {(dashboardStats?.issues?.total || 0) > 0 && (
                  <View style={styles.achievementItem}>
                    <View style={[styles.achievementIcon, { backgroundColor: '#FFD700' }]}>
                      <Ionicons name="star" size={24} color="#fff" />
                    </View>
                    <Text style={styles.achievementText}>Reporter</Text>
                  </View>
                )}
                
                {/* Achievement for resolved issues */}
                {(dashboardStats?.issues?.resolved || 0) > 0 && (
                  <View style={styles.achievementItem}>
                    <View style={[styles.achievementIcon, { backgroundColor: '#4FD1C7' }]}>
                      <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    </View>
                    <Text style={styles.achievementText}>Problem Solver</Text>
                  </View>
                )}
                
                {/* Achievement for community engagement */}
                {(dashboardStats?.engagement?.points || 0) >= 100 && (
                  <View style={styles.achievementItem}>
                    <View style={[styles.achievementIcon, { backgroundColor: '#10B981' }]}>
                      <Ionicons name="people" size={24} color="#fff" />
                    </View>
                    <Text style={styles.achievementText}>Community Helper</Text>
                  </View>
                )}
                
                {/* Achievement for high-level users */}
                {(dashboardStats?.engagement?.level || 1) >= 5 && (
                  <View style={styles.achievementItem}>
                    <View style={[styles.achievementIcon, { backgroundColor: '#8B5CF6' }]}>
                      <Ionicons name="shield-checkmark" size={24} color="#fff" />
                    </View>
                    <Text style={styles.achievementText}>Civic Guardian</Text>
                  </View>
                )}
                
                {/* Default if no achievements */}
                {(dashboardStats?.issues?.total || 0) === 0 && 
                 (dashboardStats?.engagement?.points || 0) === 0 && (
                  <View style={styles.achievementItem}>
                    <View style={[styles.achievementIcon, { backgroundColor: '#E5E7EB' }]}>
                      <Ionicons name="trophy-outline" size={24} color="#9CA3AF" />
                    </View>
                    <Text style={styles.achievementText}>Getting Started</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('reports')}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#4FD1C7' }]}>
                <Ionicons name="document-text" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.menuTitle}>My Reports</Text>
                <Text style={styles.menuSubtitle}>View all your submitted reports</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('notifications')}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="notifications" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Notifications</Text>
                <Text style={styles.menuSubtitle}>Manage your preferences</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('community')}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#3B82F6' }]}>
                <Ionicons name="people" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Community Voting</Text>
                <Text style={styles.menuSubtitle}>Vote on community issues</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('settings')}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="settings" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Account Settings</Text>
                <Text style={styles.menuSubtitle}>Privacy and security settings</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('logout')}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#EF4444' }]}>
                <Ionicons name="log-out" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Logout</Text>
                <Text style={styles.menuSubtitle}>Sign out of your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Debug Panel for Development */}
        <DebugPanel navigation={navigation} />

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

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
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4FD1C7',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  levelContainer: {
    marginBottom: 16,
  },
  levelBadge: {
    backgroundColor: '#4FD1C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  xpContainer: {
    width: '100%',
    alignItems: 'center',
  },
  xpBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#4FD1C7',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4FD1C7',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  achievementsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  achievementItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  menuItem: {
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
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    marginVertical: 10,
    paddingHorizontal: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 8,
  },
});

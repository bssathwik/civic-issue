import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { apiClient } from '../services/api';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { issues, nearbyIssues, isLoading, isRefreshing, refreshData, fetchNearbyIssues } = useReports();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));
  
  // Local state for user statistics
  const [userStats, setUserStats] = useState({
    points: 1250,
    reportsCount: 12,
    rank: 8,
    issuesResolved: 8,
    responseRate: 85,
    streak: 7
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [greeting, setGreeting] = useState('');

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for stats cards
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);
    
    const loopPulse = Animated.loop(pulse);
    loopPulse.start();

    return () => loopPulse.stop();
  }, []);

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Get user location for nearby issues
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        fetchNearbyIssues(latitude, longitude, 10);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    getCurrentLocation();
  }, [fetchNearbyIssues]);

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

  const QuickActionCard = ({ icon, title, subtitle, color, onPress, gradient }) => (
    <TouchableOpacity onPress={onPress} style={styles.quickActionCard}>
      <LinearGradient
        colors={gradient}
        style={styles.quickActionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.quickActionContent}>
          <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
            <Ionicons name={icon} size={28} color="#FFFFFF" />
          </View>
          <View style={styles.quickActionText}>
            <Text style={styles.quickActionTitle}>{title}</Text>
            <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const StatCard = ({ icon, value, label, color, trend }) => (
    <Animated.View style={[styles.statCard, { transform: [{ scale: pulseAnim }] }]}>
      <LinearGradient
        colors={[color, `${color}80`]}
        style={styles.statGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statIcon}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons 
              name={trend > 0 ? "trending-up" : "trending-down"} 
              size={14} 
              color="#FFFFFF" 
            />
            <Text style={styles.trendText}>{Math.abs(trend)}%</Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />
      
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Animated.View 
            style={[
              styles.headerContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.headerTop}>
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>{greeting},</Text>
                <Text style={styles.userName}>{getUserDisplayName()}</Text>
                <View style={styles.userBadge}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.userLevel}>Level {Math.floor(userStats.points / 500) + 1}</Text>
                </View>
              </View>
              
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={() => navigation.navigate('Notifications')}
                >
                  <Ionicons name="notifications" size={24} color="#FFFFFF" />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>3</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={() => navigation.navigate('Profile')}
                >
                  <Ionicons name="person-circle" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Dynamic Stats Row */}
            <View style={styles.statsRow}>
              <StatCard 
                icon="document-text" 
                value={userStats.reportsCount} 
                label="Reports" 
                color="#FF6B6B"
                trend={12}
              />
              <StatCard 
                icon="checkmark-circle" 
                value={userStats.issuesResolved} 
                label="Resolved" 
                color="#4ECDC4"
                trend={8}
              />
              <StatCard 
                icon="trophy" 
                value={userStats.points} 
                label="Points" 
                color="#45B7D1"
                trend={15}
              />
              <StatCard 
                icon="flame" 
                value={userStats.streak} 
                label="Streak" 
                color="#FFA726"
                trend={5}
              />
            </View>
          </Animated.View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
      >
        {/* Modern Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <QuickActionCard
            icon="add-circle"
            title="Report New Issue"
            subtitle="Help improve your community"
            color="#FF6B6B"
            gradient={['#FF6B6B', '#FF8E8E']}
            onPress={() => navigation.navigate('ReportIssue')}
          />
          
          <QuickActionCard
            icon="map"
            title="Explore Issues"
            subtitle="View issues in your area"
            color="#4ECDC4"
            gradient={['#4ECDC4', '#44A08D']}
            onPress={() => navigation.navigate('MapView')}
          />
          
          <QuickActionCard
            icon="stats-chart"
            title="My Dashboard"
            subtitle="Track your contributions"
            color="#45B7D1"
            gradient={['#45B7D1', '#96C93D']}
            onPress={() => navigation.navigate('MyReports')}
          />
        </View>

        {/* Community Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community</Text>
          
          <View style={styles.communityGrid}>
            <TouchableOpacity 
              style={styles.communityCard}
              onPress={() => navigation.navigate('CommunityVoting')}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.communityGradient}
              >
                <Ionicons name="people" size={28} color="#FFFFFF" />
                <Text style={styles.communityTitle}>Voting</Text>
                <Text style={styles.communitySubtitle}>5 active polls</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.communityCard}
              onPress={() => navigation.navigate('Leaderboard')}
            >
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.communityGradient}
              >
                <Ionicons name="trophy" size={28} color="#FFFFFF" />
                <Text style={styles.communityTitle}>Rankings</Text>
                <Text style={styles.communitySubtitle}>You're #{userStats.rank}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ActivityFeed')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityFeed}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Issue Resolved</Text>
                <Text style={styles.activitySubtitle}>Broken streetlight fixed on Main St</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="thumbs-up" size={20} color="#FF6B6B" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New Upvote</Text>
                <Text style={styles.activitySubtitle}>Your pothole report gained support</Text>
                <Text style={styles.activityTime}>4 hours ago</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  userLevel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 12,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 2,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    marginTop: -10,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  quickActionCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  quickActionGradient: {
    padding: 20,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  communityGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  communityCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  communityGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  communitySubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  activityFeed: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
});

export default HomeScreen;
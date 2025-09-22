import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { apiClient } from '../services/api';

const ModernHomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { issues, isRefreshing, refreshData, fetchNearbyIssues } = useReports();
  
  // Animation states
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [pulseAnim] = useState(new Animated.Value(1));
  
  // Data states
  const [userStats, setUserStats] = useState({
    points: 0,
    reportsCount: 0,
    rank: 0,
    issuesResolved: 0,
    responseRate: 85
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [locationInfo, setLocationInfo] = useState<{ city?: string; area?: string } | null>(null);
  const [todaysStats, setTodaysStats] = useState({
    newIssues: 0,
    resolvedIssues: 0,
    activeUsers: 0
  });

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation for stat cards
    const pulseAnimation = Animated.loop(
      Animated.sequence([
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
      ])
    );
    
    // Start pulse after initial animation
    setTimeout(() => pulseAnimation.start(), 1000);

    return () => pulseAnimation.stop();
  }, [fadeAnim, slideAnim, pulseAnim]);

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
        
        // Get location info
        const locationData = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        
        if (locationData.length > 0) {
          setLocationInfo({
            city: locationData[0].city || locationData[0].subregion || undefined,
            area: locationData[0].district || locationData[0].region || undefined,
          });
        }
        
        // Fetch nearby issues
        fetchNearbyIssues(latitude, longitude, 10);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    getCurrentLocation();
  }, [fetchNearbyIssues]);

  // Fetch user statistics
  const fetchUserStatistics = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const [statsResponse] = await Promise.all([
        apiClient.getUserStatistics(),
        apiClient.getLeaderboard()
      ]);

      if (statsResponse.data) {
        setUserStats(prev => ({
          ...prev,
          ...statsResponse.data,
        }));
      }

      // Update today's stats based on issues
      setTodaysStats({
        newIssues: issues.filter(issue => {
          const issueDate = new Date(issue.createdAt);
          const today = new Date();
          return issueDate.toDateString() === today.toDateString();
        }).length,
        resolvedIssues: issues.filter(issue => 
          issue.status === 'resolved' || issue.status === 'closed'
        ).length,
        activeUsers: Math.floor(Math.random() * 50) + 20, // Mock data
      });

    } catch (error) {
      console.error('Error fetching user statistics:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [issues]);

  // Fetch stats on component mount and when issues change
  useEffect(() => {
    fetchUserStatistics();
  }, [fetchUserStatistics]);

  const getUserDisplayName = () => {
    return user?.name || user?.email?.split('@')[0] || 'User';
  };

  const handleRefresh = async () => {
    await refreshData();
    await fetchUserStatistics();
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <StatusBar backgroundColor="#667eea" barStyle="light-content" />

      {/* Modern Gradient Header */}
      <View style={styles.modernHeader}>
        <View style={styles.headerGradient} />
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.welcomeSection}>
              <Text style={styles.modernGreeting}>
                Hello, {getUserDisplayName()}! 👋
              </Text>
              <Text style={styles.modernSubtitle}>
                Ready to make an impact today?
              </Text>
              {locationInfo?.city && (
                <View style={styles.locationBadge}>
                  <Ionicons name="location-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.locationText}>{locationInfo.city}</Text>
                </View>
              )}
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.modernActionButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modernProfileButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <View style={styles.modernAvatarContainer}>
                  <Text style={styles.modernAvatarText}>
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </Text>
                  <View style={styles.onlineIndicator} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Enhanced Stats Row */}
          <Animated.View style={[
            styles.modernStatsRow, 
            { 
              opacity: fadeAnim,
              transform: [{ scale: pulseAnim }]
            }
          ]}>
            <Animated.View style={[
              styles.modernStatCard,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="star" size={18} color="#FFD700" />
              </View>
              {isLoadingStats ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.modernStatValue}>{userStats.points}</Text>
                  <Text style={styles.modernStatLabel}>Points</Text>
                </>
              )}
            </Animated.View>
            
            <Animated.View style={[
              styles.modernStatCard,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="trending-up" size={18} color="#10B981" />
              </View>
              {isLoadingStats ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.modernStatValue}>#{userStats.rank || 1}</Text>
                  <Text style={styles.modernStatLabel}>Rank</Text>
                </>
              )}
            </Animated.View>

            <Animated.View style={[
              styles.modernStatCard,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={18} color="#4FD1C7" />
              </View>
              {isLoadingStats ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.modernStatValue}>{userStats.issuesResolved}</Text>
                  <Text style={styles.modernStatLabel}>Resolved</Text>
                </>
              )}
            </Animated.View>
          </Animated.View>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#4FD1C7']}
            tintColor="#4FD1C7"
          />
        }
      >
        {/* Modern Dashboard Overview */}
        <View style={styles.dashboardGrid}>
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Ionicons name="today-outline" size={22} color="#3B82F6" />
              <Text style={styles.overviewTitle}>Today&apos;s Activity</Text>
            </View>
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewNumber}>{todaysStats.newIssues}</Text>
                <Text style={styles.overviewLabel}>New Issues</Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewNumber}>{todaysStats.resolvedIssues}</Text>
                <Text style={styles.overviewLabel}>Resolved</Text>
              </View>
            </View>
          </View>

          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Ionicons name="analytics-outline" size={22} color="#10B981" />
              <Text style={styles.overviewTitle}>Your Impact</Text>
            </View>
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewNumber}>{userStats.reportsCount}</Text>
                <Text style={styles.overviewLabel}>Reports</Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewNumber}>{userStats.responseRate}%</Text>
                <Text style={styles.overviewLabel}>Response Rate</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Trending Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CommunityVoting')}>
              <Text style={styles.seeAll}>Vote</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <TouchableOpacity style={[styles.categoryCard, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="construct-outline" size={24} color="#D97706" />
              <Text style={[styles.categoryText, { color: '#D97706' }]}>Infrastructure</Text>
              <Text style={[styles.categoryCount, { color: '#92400E' }]}>
                {issues.filter(issue => issue.category === 'infrastructure').length} issues
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.categoryCard, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="water-outline" size={24} color="#2563EB" />
              <Text style={[styles.categoryText, { color: '#2563EB' }]}>Cleanliness</Text>
              <Text style={[styles.categoryCount, { color: '#1E40AF' }]}>
                {issues.filter(issue => issue.category === 'cleanliness').length} issues
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.categoryCard, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#059669" />
              <Text style={[styles.categoryText, { color: '#059669' }]}>Safety</Text>
              <Text style={[styles.categoryCount, { color: '#047857' }]}>
                {issues.filter(issue => issue.category === 'safety').length} issues
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.categoryCard, { backgroundColor: '#FDF2F8' }]}>
              <Ionicons name="flash-outline" size={24} color="#DC2626" />
              <Text style={[styles.categoryText, { color: '#DC2626' }]}>Utilities</Text>
              <Text style={[styles.categoryCount, { color: '#B91C1C' }]}>
                {issues.filter(issue => issue.category === 'utilities').length} issues
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Enhanced Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsList}>
            <TouchableOpacity
              style={[styles.actionItem, { backgroundColor: '#FEE2E2' }]}
              onPress={() => navigation.navigate('ReportIssue')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#DC2626' }]}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Report New Issue</Text>
                <Text style={styles.actionSubtitle}>Help improve your community</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionItem, { backgroundColor: '#D1FAE5' }]}
              onPress={() => navigation.navigate('MyReports')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
                <Ionicons name="document-text" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>My Reports</Text>
                <Text style={styles.actionSubtitle}>Track your submissions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionItem, { backgroundColor: '#E0F2FE' }]}
              onPress={() => navigation.navigate('CommunityVoting')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#0EA5E9' }]}>
                <Ionicons name="heart" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Community Voting</Text>
                <Text style={styles.actionSubtitle}>Support important issues</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#10B981' }]}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Issue Resolved</Text>
                <Text style={styles.activitySubtitle}>
                  Pothole on Main Street was fixed
                </Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#3B82F6' }]}>
                <Ionicons name="add" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New Report</Text>
                <Text style={styles.activitySubtitle}>
                  Streetlight issue reported nearby
                </Text>
                <Text style={styles.activityTime}>4 hours ago</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="star" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Achievement Unlocked</Text>
                <Text style={styles.activitySubtitle}>
                  You earned 50 community points!
                </Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced Community Impact Card with Progress */}
        <View style={styles.impactCard}>
          <View style={styles.impactHeader}>
            <Ionicons name="people-outline" size={24} color="#4FD1C7" />
            <Text style={styles.impactTitle}>Community Impact</Text>
          </View>
          
          {/* Progress Bar for Weekly Goal */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Weekly Goal Progress</Text>
              <Text style={styles.progressPercentage}>
                {Math.round((userStats.reportsCount / 10) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${Math.min((userStats.reportsCount / 10) * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressSubtext}>
              {userStats.reportsCount} of 10 reports this week
            </Text>
          </View>

          <View style={styles.impactStats}>
            <View style={styles.impactStat}>
              <Text style={styles.impactNumber}>{issues.length}</Text>
              <Text style={styles.impactLabel}>Total Issues</Text>
            </View>
            <View style={styles.impactStat}>
              <Text style={styles.impactNumber}>{todaysStats.activeUsers}</Text>
              <Text style={styles.impactLabel}>Active Citizens</Text>
            </View>
            <View style={styles.impactStat}>
              <Text style={styles.impactNumber}>{userStats.responseRate}%</Text>
              <Text style={styles.impactLabel}>Response Rate</Text>
            </View>
          </View>

          {/* Achievement Badge */}
          {userStats.points > 100 && (
            <View style={styles.achievementBadge}>
              <Ionicons name="trophy" size={16} color="#F59E0B" />
              <Text style={styles.achievementText}>
                🎉 Community Champion! Youve earned {userStats.points} points!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Modern Floating Quick Actions */}
      <View style={styles.floatingActions}>
        <TouchableOpacity
          style={[styles.floatingAction, { backgroundColor: '#3B82F6' }]}
          onPress={() => navigation.navigate('ReportIssue')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.floatingActionText}>Report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.floatingAction, { backgroundColor: '#10B981' }]}
          onPress={() => navigation.navigate('CommunityVoting')}
        >
          <Ionicons name="heart" size={20} color="#FFFFFF" />
          <Text style={styles.floatingActionText}>Vote</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.floatingAction, { backgroundColor: '#F59E0B' }]}
          onPress={() => navigation.navigate('MyReports')}
        >
          <Ionicons name="list" size={20} color="#FFFFFF" />
          <Text style={styles.floatingActionText}>My Issues</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Modern Header Styles
  modernHeader: {
    backgroundColor: '#667eea',
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(118, 75, 162, 0.3)',
  },
  
  headerContent: {
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 2,
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  
  welcomeSection: {
    flex: 1,
  },
  
  modernGreeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  
  modernSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 12,
  },
  
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  
  locationText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  
  modernProfileButton: {
    marginLeft: 16,
  },
  
  modernAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  modernAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  
  modernStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  
  modernStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  modernStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  
  modernStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Dashboard Grid
  dashboardGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  
  overviewCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  overviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  overviewStat: {
    alignItems: 'center',
  },
  
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  
  overviewLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  
  // Sections
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  
  seeAll: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  
  // Categories
  categoriesScroll: {
    paddingVertical: 8,
  },
  
  categoryCard: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    marginRight: 16,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  
  categoryCount: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Actions List
  actionsList: {
    gap: 12,
  },
  
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  actionContent: {
    flex: 1,
  },
  
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  // Impact Card
  impactCard: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  impactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  impactStat: {
    alignItems: 'center',
  },
  
  impactNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4FD1C7',
  },
  
  impactLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Progress Section
  progressSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4FD1C7',
  },
  
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  
  progressBar: {
    height: '100%',
    backgroundColor: '#4FD1C7',
    borderRadius: 4,
  },
  
  progressSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  // Achievement Badge
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 12,
  },
  
  achievementText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
  },
  
  // Activity Section
  activityList: {
    gap: 12,
  },
  
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  activityContent: {
    flex: 1,
  },
  
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  
  activitySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  
  activityTime: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  
  // Floating Actions
  floatingActions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  
  floatingAction: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  floatingActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  
  // Additional Header Styles
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  modernActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});

export default ModernHomeScreen;
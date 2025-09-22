import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { gamificationService, Achievement } from '../services/gamificationService';
import { Badge, Certificate, UserStats } from '../types/gamification';
import BadgeComponent from '../components/ui/BadgeComponent';
import CertificateComponent from '../components/ui/CertificateComponent';
import UserProgress from '../components/ui/UserProgress';

interface TabButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ title, isActive, onPress }) => (
  <TouchableOpacity 
    style={[styles.tabButton, isActive && styles.tabButtonActive]} 
    onPress={onPress}
  >
    <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const GamificationScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'progress' | 'badges' | 'certificates'>('progress');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Data states
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [userLevel, setUserLevel] = useState<string>('Bronze');

  const loadUserData = useCallback(async () => {
    try {
      const [stats, badgesData, achievements, certificatesData] = await Promise.all([
        gamificationService.getUserStats(),
        gamificationService.getBadges(),
        gamificationService.getUserAchievementsForCurrentUser(),
        gamificationService.getCertificates(),
      ]);

      setUserStats(stats);
      setBadges(badgesData);
      setUserAchievements(achievements);
      setCertificates(certificatesData);

      // Calculate user level based on points
      if (stats) {
        if (stats.total_points >= 1000) setUserLevel('Platinum');
        else if (stats.total_points >= 500) setUserLevel('Gold');
        else if (stats.total_points >= 100) setUserLevel('Silver');
        else setUserLevel('Bronze');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load gamification data. Please try again.');
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    await loadUserData();
    setIsLoading(false);
  }, [loadUserData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadUserData();
    setIsRefreshing(false);
  }, [loadUserData]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const renderProgressTab = () => {
    if (!userStats) return null;

    return (
      <View style={styles.tabContent}>
        <UserProgress stats={userStats} userLevel={userLevel} />
        
        {/* Recent achievements */}
          {userAchievements.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>Recent Achievements</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {userAchievements
                  .slice(0, 5) // Show last 5 achievements
                  .map((achievement, index) => {
                    return (
                      <View key={index} style={styles.achievementItem}>
                        {achievement.badge && (
                          <BadgeComponent 
                            badge={achievement.badge} 
                            earned={true}
                            size="small"
                          />
                        )}
                        {achievement.certificate && (
                          <CertificateComponent 
                            certificate={achievement.certificate}
                            earned={true}
                          />
                        )}
                        <Text style={styles.achievementDate}>
                          {new Date(achievement.awardedAt).toLocaleDateString()}
                        </Text>
                      </View>
                    );
                  })}
              </ScrollView>
            </View>
          )}
      </View>
    );
  };

  const renderBadgesTab = () => {
    const earnedBadges = badges.filter(badge => 
      userAchievements.some(achievement => achievement.badge?._id === badge._id)
    );
    const unearnedBadges = badges.filter(badge => 
      !userAchievements.some(achievement => achievement.badge?._id === badge._id)
    );

    return (
      <View style={styles.tabContent}>
        {earnedBadges.length > 0 && (
          <View style={styles.badgeSection}>
            <Text style={styles.sectionTitle}>Earned Badges ({earnedBadges.length})</Text>
            <View style={styles.badgeGrid}>
              {earnedBadges.map(badge => (
                <View key={badge._id} style={styles.badgeGridItem}>
                  <BadgeComponent 
                    badge={badge} 
                    earned={true}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.badgeSection}>
          <Text style={styles.sectionTitle}>Available Badges ({unearnedBadges.length})</Text>
          <View style={styles.badgeGrid}>
            {unearnedBadges.map(badge => (
              <View key={badge._id} style={styles.badgeGridItem}>
                <BadgeComponent 
                  badge={badge} 
                  earned={false}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderCertificatesTab = () => {
    const earnedCertificates = certificates.filter(cert => 
      userAchievements.some(achievement => achievement.certificate?._id === cert._id)
    );
    const availableCertificates = certificates.filter(cert => 
      !userAchievements.some(achievement => achievement.certificate?._id === cert._id)
    );

    return (
      <View style={styles.tabContent}>
        {earnedCertificates.length > 0 && (
          <View style={styles.certificateSection}>
            <Text style={styles.sectionTitle}>Earned Certificates ({earnedCertificates.length})</Text>
            {earnedCertificates.map(certificate => (
              <View key={certificate._id} style={styles.certificateItem}>
                <CertificateComponent 
                  certificate={certificate} 
                  earned={true}
                />
              </View>
            ))}
          </View>
        )}

        <View style={styles.certificateSection}>
          <Text style={styles.sectionTitle}>Available Certificates ({availableCertificates.length})</Text>
          {availableCertificates.map(certificate => (
            <View key={certificate._id} style={styles.certificateItem}>
              <CertificateComponent 
                certificate={certificate} 
                earned={false}
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Loading your achievements...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements</Text>
        <Text style={styles.headerSubtitle}>Track your civic engagement progress</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton
          title="Progress"
          isActive={activeTab === 'progress'}
          onPress={() => setActiveTab('progress')}
        />
        <TabButton
          title="Badges"
          isActive={activeTab === 'badges'}
          onPress={() => setActiveTab('badges')}
        />
        <TabButton
          title="Certificates"
          isActive={activeTab === 'certificates'}
          onPress={() => setActiveTab('certificates')}
        />
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'progress' && renderProgressTab()}
        {activeTab === 'badges' && renderBadgesTab()}
        {activeTab === 'certificates' && renderCertificatesTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#3498DB',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  recentSection: {
    marginTop: 16,
  },
  achievementItem: {
    alignItems: 'center',
    marginRight: 12,
    width: 80,
  },
  achievementDate: {
    fontSize: 10,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'center',
  },
  badgeSection: {
    marginBottom: 24,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeGridItem: {
    width: '48%',
    marginBottom: 12,
  },
  certificateSection: {
    marginBottom: 24,
  },
  certificateItem: {
    marginBottom: 12,
  },
});

export default GamificationScreen;
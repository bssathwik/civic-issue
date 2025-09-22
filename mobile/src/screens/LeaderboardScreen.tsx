import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { gamificationService, LeaderboardEntry } from '../services/gamificationService';

interface LeaderboardScreenProps {
  onUserSelect?: (userId: string) => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onUserSelect }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<'weekly' | 'monthly' | 'yearly' | 'all_time'>('all_time');

  const timeFrameOptions = [
    { key: 'weekly' as const, label: 'This Week', icon: '📅' },
    { key: 'monthly' as const, label: 'This Month', icon: '📊' },
    { key: 'yearly' as const, label: 'This Year', icon: '🗓️' },
    { key: 'all_time' as const, label: 'All Time', icon: '🏆' },
  ];

  const loadLeaderboard = async () => {
    try {
      const data = await gamificationService.getLeaderboard({
        timeFrame: selectedTimeFrame,
        limit: 50,
      });
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      Alert.alert('Error', 'Failed to load leaderboard. Please try again.');
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadLeaderboard();
    setIsRefreshing(false);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await loadLeaderboard();
      setIsLoading(false);
    };
    
    loadInitialData();
  }, [selectedTimeFrame]); // eslint-disable-line react-hooks/exhaustive-deps

  const getRankMedal = (position: number): string => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const getRankColor = (position: number): string => {
    if (position <= 3) return '#F39C12';
    if (position <= 10) return '#3498DB';
    return '#95A5A6';
  };

  const getLevelColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#CD7F32';
    }
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const position = index + 1;
    const rankColor = getRankColor(position);
    const levelColor = getLevelColor(item.user.gamification.level);
    const medal = getRankMedal(position);

    return (
      <TouchableOpacity
        style={[
          styles.leaderboardItem,
          position <= 3 && styles.topThreeItem,
        ]}
        onPress={() => onUserSelect?.(item._id)}
      >
        {/* Rank */}
        <View style={styles.rankContainer}>
          {medal ? (
            <Text style={styles.medalText}>{medal}</Text>
          ) : (
            <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
              <Text style={styles.rankText}>#{position}</Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.userName}>{item.user.name}</Text>
            <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
              <Text style={styles.levelText}>{item.user.gamification.level.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.userStats}>
            <Text style={styles.pointsText}>{item.totalPoints.toLocaleString()} pts</Text>
            <Text style={styles.actionsText}>{item.actionsCount} actions</Text>
          </View>

          {/* Badges Preview */}
          {item.user.gamification.badges.length > 0 && (
            <View style={styles.badgesPreview}>
              {item.user.gamification.badges.slice(0, 3).map((badge: any, idx: number) => (
                <View key={idx} style={styles.badgeIcon}>
                  <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                </View>
              ))}
              {item.user.gamification.badges.length > 3 && (
                <Text style={styles.moreBadges}>+{item.user.gamification.badges.length - 3}</Text>
              )}
            </View>
          )}
        </View>

        {/* Chevron */}
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>See how you stack up!</Text>
      </View>

      {/* Time Frame Selector */}
      <View style={styles.timeFrameContainer}>
        {timeFrameOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.timeFrameButton,
              selectedTimeFrame === option.key && styles.timeFrameButtonActive,
            ]}
            onPress={() => setSelectedTimeFrame(option.key)}
          >
            <Text style={styles.timeFrameIcon}>{option.icon}</Text>
            <Text
              style={[
                styles.timeFrameText,
                selectedTimeFrame === option.key && styles.timeFrameTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leaderboard List */}
      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptyText}>
              Be the first to make a civic contribution and appear on the leaderboard!
            </Text>
          </View>
        }
      />
    </View>
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
  timeFrameContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  timeFrameButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  timeFrameButtonActive: {
    backgroundColor: '#3498DB',
  },
  timeFrameIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  timeFrameText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7F8C8D',
    textAlign: 'center',
  },
  timeFrameTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topThreeItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  medalText: {
    fontSize: 24,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498DB',
    marginRight: 12,
  },
  actionsText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  badgesPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  badgeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECF0F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  badgeEmoji: {
    fontSize: 12,
  },
  moreBadges: {
    fontSize: 10,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  chevron: {
    fontSize: 18,
    color: '#BDC3C7',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LeaderboardScreen;
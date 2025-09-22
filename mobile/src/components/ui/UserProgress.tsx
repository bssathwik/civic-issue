import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserStats } from '../../services/gamificationService';

interface UserProgressProps {
  stats: UserStats;
  userLevel?: string;
}

const UserProgress: React.FC<UserProgressProps> = ({ stats, userLevel = 'Bronze' }) => {
  const getLevelColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#CD7F32';
    }
  };

  const getLevelProgress = (points: number): { progress: number; nextLevel: string; pointsToNext: number } => {
    const levels = [
      { name: 'Bronze', threshold: 0 },
      { name: 'Silver', threshold: 100 },
      { name: 'Gold', threshold: 500 },
      { name: 'Platinum', threshold: 1000 }
    ];

    let currentLevel = levels[0];
    let nextLevel = levels[1];

    for (let i = 0; i < levels.length; i++) {
      if (points >= levels[i].threshold) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1] || levels[i];
      }
    }

    if (currentLevel === nextLevel) {
      return {
        progress: 100,
        nextLevel: currentLevel.name,
        pointsToNext: 0
      };
    }

    const progress = ((points - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100;
    const pointsToNext = nextLevel.threshold - points;

    return {
      progress: Math.min(100, Math.max(0, progress)),
      nextLevel: nextLevel.name,
      pointsToNext: Math.max(0, pointsToNext)
    };
  };

  const levelInfo = getLevelProgress(stats.total_points);
  const levelColor = getLevelColor(userLevel);

  return (
    <View style={styles.container}>
      {/* Header with points and level */}
      <View style={styles.header}>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsValue}>
            {stats.total_points.toLocaleString()}
          </Text>
          <Text style={styles.pointsLabel}>Points</Text>
        </View>

        <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
          <Text style={styles.levelText}>{userLevel.toUpperCase()}</Text>
        </View>
      </View>

      {/* Progress bar */}
      {levelInfo.pointsToNext > 0 && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              Progress to {levelInfo.nextLevel}
            </Text>
            <Text style={styles.progressPoints}>
              {levelInfo.pointsToNext} pts to go
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${levelInfo.progress}%`, backgroundColor: levelColor }
              ]} 
            />
          </View>
        </View>
      )}

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatItem 
          icon="📝" 
          value={stats.issues_reported} 
          label="Issues Reported" 
        />
        <StatItem 
          icon="👍" 
          value={stats.votes_given} 
          label="Votes Given" 
        />
        <StatItem 
          icon="💬" 
          value={stats.comments_made} 
          label="Comments Made" 
        />
        <StatItem 
          icon="🔥" 
          value={stats.currentStreak} 
          label="Current Streak" 
        />
      </View>

      {/* Additional stats */}
      <View style={styles.additionalStats}>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Longest Streak:</Text>
          <Text style={styles.statRowValue}>{stats.longestStreak} days</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Verified Issues:</Text>
          <Text style={styles.statRowValue}>{stats.issues_verified}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Shares Made:</Text>
          <Text style={styles.statRowValue}>{stats.shares_made}</Text>
        </View>
      </View>
    </View>
  );
};

interface StatItemProps {
  icon: string;
  value: number;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsContainer: {
    alignItems: 'flex-start',
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  progressPoints: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 12,
  },
  additionalStats: {
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statRowLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
});

export default UserProgress;
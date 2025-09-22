import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Badge, Certificate } from '../../types/gamification';

interface AchievementNotificationProps {
  visible: boolean;
  badge?: Badge;
  certificate?: Certificate;
  points: number;
  onClose: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  visible,
  badge,
  certificate,
  points,
  onClose,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const getRarityColor = (rarity: string): string => {
    switch (rarity?.toLowerCase()) {
      case 'common': return '#95A5A6';
      case 'uncommon': return '#27AE60';
      case 'rare': return '#3498DB';
      case 'epic': return '#9B59B6';
      case 'legendary': return '#F39C12';
      default: return '#BDC3C7';
    }
  };

  const getLevelColor = (level: string): string => {
    switch (level?.toLowerCase()) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#CD7F32';
    }
  };

  if (!visible || (!badge && !certificate)) {
    return null;
  }

  const isBadge = !!badge;
  const achievement = badge || certificate!;
  const color = isBadge ? getRarityColor(badge!.rarity) : getLevelColor(certificate!.level);

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Celebration Effect */}
          <View style={styles.celebrationContainer}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationEmoji}>✨</Text>
            <Text style={styles.celebrationEmoji}>🏆</Text>
            <Text style={styles.celebrationEmoji}>⭐</Text>
          </View>

          {/* Achievement Content */}
          <View style={styles.content}>
            <Text style={styles.congratsText}>Congratulations!</Text>
            <Text style={styles.achievementType}>
              You&apos;ve earned a new {isBadge ? 'Badge' : 'Certificate'}!
            </Text>

            {/* Achievement Icon */}
            <View style={[styles.achievementIcon, { backgroundColor: color }]}>
              <Text style={styles.achievementEmoji}>
                {isBadge ? badge!.icon : certificate!.level === 'gold' ? '🥇' : 
                 certificate!.level === 'silver' ? '🥈' : 
                 certificate!.level === 'bronze' ? '🥉' : '🏆'}
              </Text>
            </View>

            {/* Achievement Details */}
            <Text style={styles.achievementName}>
              {isBadge ? badge!.displayName : certificate!.displayName}
            </Text>
            <Text style={styles.achievementDescription}>
              {achievement.description}
            </Text>

            {/* Points */}
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>+{points} Points</Text>
            </View>

            {/* Category/Rarity */}
            <View style={styles.badgeInfo}>
              {isBadge && (
                <View style={[styles.rarityBadge, { backgroundColor: color }]}>
                  <Text style={styles.rarityText}>{badge!.rarity.toUpperCase()}</Text>
                </View>
              )}
              <Text style={styles.categoryText}>
                {isBadge ? badge!.category : certificate!.category}
              </Text>
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  celebrationContainer: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1,
  },
  celebrationEmoji: {
    fontSize: 24,
    opacity: 0.8,
  },
  content: {
    alignItems: 'center',
    paddingTop: 20,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  achievementType: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  achievementIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  achievementEmoji: {
    fontSize: 48,
  },
  achievementName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  pointsContainer: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  pointsText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  badgeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  categoryText: {
    fontSize: 12,
    color: '#7F8C8D',
    textTransform: 'capitalize',
  },
  closeButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AchievementNotification;
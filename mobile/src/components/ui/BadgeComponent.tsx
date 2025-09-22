import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Badge } from '../../services/gamificationService';

interface BadgeComponentProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  earned?: boolean;
}

const BadgeComponent: React.FC<BadgeComponentProps> = ({
  badge,
  size = 'medium',
  showDetails = true,
  earned = true
}) => {
  const sizeStyles = {
    small: styles.badgeSmall,
    medium: styles.badgeMedium,
    large: styles.badgeLarge
  };

  const iconSizes = {
    small: 24,
    medium: 40,
    large: 56
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity.toLowerCase()) {
      case 'common': return '#95A5A6';
      case 'uncommon': return '#27AE60';
      case 'rare': return '#3498DB';
      case 'epic': return '#9B59B6';
      case 'legendary': return '#F39C12';
      default: return '#BDC3C7';
    }
  };

  return (
    <View style={[
      styles.container,
      sizeStyles[size],
      !earned && styles.unearnedBadge,
      { borderColor: earned ? getRarityColor(badge.rarity) : '#E0E0E0' }
    ]}>
      <View style={[
        styles.iconContainer,
        { backgroundColor: earned ? badge.color : '#F5F5F5' }
      ]}>
        <Text style={[
          styles.icon,
          { fontSize: iconSizes[size], opacity: earned ? 1 : 0.5 }
        ]}>
          {badge.icon}
        </Text>
      </View>
      
      {showDetails && (
        <View style={styles.details}>
          <Text style={[
            styles.name,
            size === 'small' && styles.nameSmall,
            !earned && styles.unearnedText
          ]}>
            {badge.displayName}
          </Text>
          
          {size !== 'small' && (
            <Text style={[
              styles.description,
              !earned && styles.unearnedText
            ]}>
              {badge.description}
            </Text>
          )}
          
          <View style={styles.metadata}>
            <Text style={[styles.rarity, { color: getRarityColor(badge.rarity) }]}>
              {badge.rarity.toUpperCase()}
            </Text>
            <Text style={styles.points}>
              +{badge.points} pts
            </Text>
          </View>
        </View>
      )}
      
      {earned && badge.earnedAt && (
        <Text style={styles.earnedDate}>
          Earned {new Date(badge.earnedAt).toLocaleDateString()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  badgeMedium: {
    minHeight: 100,
  },
  badgeLarge: {
    minHeight: 120,
    padding: 16,
  },
  unearnedBadge: {
    backgroundColor: '#F9F9F9',
    borderStyle: 'dashed',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'center',
  },
  icon: {
    fontSize: 40,
  },
  details: {
    flex: 1,
    marginLeft: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  nameSmall: {
    fontSize: 14,
    textAlign: 'left',
    marginLeft: 12,
  },
  description: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  rarity: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  points: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
  },
  earnedDate: {
    fontSize: 10,
    color: '#95A5A6',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  unearnedText: {
    color: '#BDC3C7',
  },
});

export default BadgeComponent;
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Certificate } from '../../services/gamificationService';

interface CertificateComponentProps {
  certificate: Certificate;
  onView?: () => void;
  earned?: boolean;
}

const CertificateComponent: React.FC<CertificateComponentProps> = ({
  certificate,
  onView,
  earned = true
}) => {
  const getLevelColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      case 'diamond': return '#B9F2FF';
      default: return '#CD7F32';
    }
  };

  const getLevelIcon = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '🏆';
      case 'diamond': return '💎';
      default: return '📜';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !earned && styles.unearnedCertificate,
        { borderColor: earned ? getLevelColor(certificate.level) : '#E0E0E0' }
      ]}
      onPress={onView}
      disabled={!earned || !onView}
    >
      {/* Header with level indicator */}
      <View style={[styles.header, { backgroundColor: getLevelColor(certificate.level) }]}>
        <View style={styles.headerContent}>
          <Text style={styles.levelIcon}>
            {getLevelIcon(certificate.level)}
          </Text>
          <Text style={styles.levelText}>
            {certificate.level.toUpperCase()} CERTIFICATE
          </Text>
        </View>
      </View>

      {/* Certificate content */}
      <View style={styles.content}>
        <Text style={[styles.title, !earned && styles.unearnedText]}>
          {certificate.displayName}
        </Text>
        
        <Text style={[styles.description, !earned && styles.unearnedText]}>
          {certificate.description}
        </Text>

        <View style={styles.metadata}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {certificate.category.toUpperCase()}
            </Text>
          </View>
          
          <Text style={[styles.points, !earned && styles.unearnedText]}>
            +{certificate.points} pts
          </Text>
        </View>

        {earned && certificate.awardedAt && (
          <Text style={styles.awardedDate}>
            Awarded on {new Date(certificate.awardedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        )}

        {!earned && (
          <Text style={styles.notEarnedText}>
            Requirements not yet met
          </Text>
        )}
      </View>

      {/* Action button */}
      {earned && onView && (
        <View style={styles.actionArea}>
          <Text style={styles.viewButton}>
            VIEW CERTIFICATE →
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 3,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  unearnedCertificate: {
    backgroundColor: '#F9F9F9',
    opacity: 0.7,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#ECF0F1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 0.5,
  },
  points: {
    fontSize: 16,
    color: '#27AE60',
    fontWeight: 'bold',
  },
  awardedDate: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  notEarnedText: {
    fontSize: 12,
    color: '#E74C3C',
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  actionArea: {
    backgroundColor: '#3498DB',
    padding: 12,
    alignItems: 'center',
  },
  viewButton: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  unearnedText: {
    color: '#BDC3C7',
  },
});

export default CertificateComponent;
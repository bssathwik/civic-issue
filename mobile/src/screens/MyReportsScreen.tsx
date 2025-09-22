import { NavigationProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReports } from '../context/ReportsContext';
import { AppStackParamList } from '../navigation/AppNavigator';

const MyReportsScreen = () => {
  const { myIssues, fetchMyIssues, deleteIssue } = useReports();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [selectedReport, setSelectedReport] = React.useState<string | null>(null);

  // Fetch my issues when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchMyIssues();
    }, [fetchMyIssues])
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved': 
      case 'closed': 
        return '#10B981';
      case 'in_progress': 
        return '#3B82F6';
      case 'assigned': 
        return '#8B5CF6';
      case 'in_review': 
        return '#F59E0B';
      case 'reported': 
      case 'pending': 
        return '#EF4444';
      case 'rejected': 
        return '#6B7280';
      default: 
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'in_progress': 
        return 'In Progress';
      case 'in_review': 
        return 'Under Review';
      case 'reported': 
        return 'Reported';
      case 'assigned': 
        return 'Assigned';
      case 'resolved': 
        return 'Resolved';
      case 'closed': 
        return 'Closed';
      case 'rejected': 
        return 'Rejected';
      default: 
        return status || 'Pending';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const handleDeleteIssue = async (issueId: string, issueTitle: string) => {
    Alert.alert(
      'Delete Issue',
      `Are you sure you want to delete "${issueTitle}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIssue(issueId);
              // Refresh the list
              await fetchMyIssues();
            } catch (error) {
              console.error('Delete issue error:', error);
              Alert.alert('Error', 'Failed to delete issue. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderReport = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.reportCard}
      onPress={() => setSelectedReport(selectedReport === item._id ? null : item._id)}
    >
      <View style={styles.cardContent}>
        <Image
          source={
            item.images && item.images.length > 0 
              ? { uri: typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url } 
              : require('../assets/city-skyline.png')
          }
          style={styles.reportImage}
        />
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteIssue(item._id, item.title)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={20} color="#DC2626" />
        </TouchableOpacity>
        <View style={styles.reportDetails}>
          <Text style={styles.reportType} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.reportDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#6B7280" />
            <Text style={styles.reportLocation} numberOfLines={1}>
              {typeof item.address === 'string' ? item.address : item.address?.full || 'Location not specified'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
            </View>
            <Text style={styles.reportDate}>{getTimeAgo(item.createdAt)}</Text>
          </View>
          {item.issueNumber && (
            <View style={styles.metaRow}>
              <Text style={styles.reportDate}>ID: {item.issueNumber}</Text>
            </View>
          )}
        </View>
      </View>
      
      {selectedReport === item._id && (
        <View style={styles.expandedContent}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              // For now, just show an alert - we need to create IssueDetail screen later
              alert(`Issue ID: ${item.issueNumber || item._id}\nStatus: ${item.status}`);
            }}
          >
            <Ionicons name="eye" size={18} color="#4FD1C7" />
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4FD1C7" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Reports</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>{myIssues.length} reports</Text>
        </View>
      </View>

      {/* Reports List */}
      <FlatList
        data={myIssues}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderReport}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Reports Yet</Text>
            <Text style={styles.emptyDescription}>
              Start making a difference by reporting issues in your community
            </Text>
            <TouchableOpacity 
              style={styles.reportButton}
              onPress={() => navigation.navigate('ReportIssue')}
            >
              <Text style={styles.reportButtonText}>Report an Issue</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFB' 
  },
  header: { 
    backgroundColor: '#4FD1C7',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    marginBottom: 4,
  },
  headerStats: {
    flexDirection: 'row',
  },
  statsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  listContainer: { 
    padding: 16,
    paddingBottom: 32,
  },
  
  // Report Card Styles
  reportCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    marginBottom: 12, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  reportImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 12, 
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  reportDetails: { 
    flex: 1,
    justifyContent: 'space-between',
  },
  reportType: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#111827',
    marginBottom: 4,
  },
  reportDescription: { 
    fontSize: 14, 
    color: '#6B7280', 
    marginBottom: 8,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  reportLocation: { 
    fontSize: 12, 
    color: '#6B7280',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  reportDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  
  // Expanded Content
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    padding: 16,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4FD1C7',
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  reportButton: {
    backgroundColor: '#4FD1C7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#4FD1C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default MyReportsScreen;

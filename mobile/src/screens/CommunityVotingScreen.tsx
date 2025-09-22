import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReports } from '../context/ReportsContext';
import { useFocusEffect } from '@react-navigation/native';

interface CommunityVotingScreenProps {
  navigation: any;
}

export default function CommunityVotingScreen({ navigation }: CommunityVotingScreenProps) {
  const { 
    issues, 
    fetchIssues, 
    upvoteIssue, 
    downvoteIssue, 
    isLoading, 
    isRefreshing 
  } = useReports();
  
  const [votingIssueId, setVotingIssueId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Categories for filtering
  const categories = [
    { key: 'all', label: 'All Issues', icon: 'list', color: '#4FD1C7' },
    { key: 'infrastructure', label: 'Infrastructure', icon: 'construct', color: '#F59E0B' },
    { key: 'cleanliness', label: 'Cleanliness', icon: 'leaf', color: '#10B981' },
    { key: 'safety', label: 'Safety', icon: 'shield-checkmark', color: '#EF4444' },
    { key: 'utilities', label: 'Utilities', icon: 'flash', color: '#8B5CF6' },
  ];

  // Fetch issues when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchIssues();
    }, [fetchIssues])
  );

  const handleVote = async (issueId: string, voteType: 'upvote' | 'downvote') => {
    try {
      setVotingIssueId(issueId);
      
      const response = voteType === 'upvote' 
        ? await upvoteIssue(issueId)
        : await downvoteIssue(issueId);
      
      if (response.success) {
        // Success feedback could be a subtle animation or haptic
        console.log(`${voteType} successful`);
      } else {
        Alert.alert('Error', response.message || `Failed to ${voteType}`);
      }
    } catch (error: any) {
      console.error(`${voteType} error:`, error);
      Alert.alert('Error', error.message || `Failed to ${voteType}`);
    } finally {
      setVotingIssueId(null);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return '#10B981';
      case 'in_progress': return '#F59E0B';
      case 'assigned': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'reported': return 'Reported';
      case 'in_review': return 'Under Review';
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return 'Unknown';
    }
  };

  const getFilteredIssues = () => {
    if (selectedCategory === 'all') {
      return issues;
    }
    return issues.filter(issue => issue.category === selectedCategory);
  };

  const renderIssueCard = ({ item }: { item: any }) => {
    const isVoting = votingIssueId === item._id;
    
    return (
      <TouchableOpacity 
        style={styles.issueCard}
        onPress={() => {
          // Navigate to issue details if needed
          // navigation.navigate('IssueDetails', { issueId: item._id });
        }}
      >
        {/* Issue Image */}
        <View style={styles.cardHeader}>
          <Image
            source={
              item.images && item.images.length > 0 
                ? { uri: typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url } 
                : require('../assets/city-skyline.png')
            }
            style={styles.issueImage}
          />
          <View style={styles.issueInfo}>
            <Text style={styles.issueTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.issueDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.metaRow}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
              </View>
              <Text style={styles.timeText}>{getTimeAgo(item.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="#6B7280" />
          <Text style={styles.locationText} numberOfLines={1}>
            {typeof item.address === 'string' ? item.address : item.address?.full || 'Location not specified'}
          </Text>
        </View>

        {/* Voting Section */}
        <View style={styles.votingSection}>
          <View style={styles.votingStats}>
            <Text style={styles.netVotesText}>
              {(item.upvotes || item.upvoteCount || 0) - (item.downvotes || item.downvoteCount || 0)} net votes
            </Text>
            <Text style={styles.voteBreakdown}>
              {item.upvotes || item.upvoteCount || 0} up • {item.downvotes || item.downvoteCount || 0} down
            </Text>
          </View>
          
          <View style={styles.votingButtons}>
            {/* Upvote Button */}
            <TouchableOpacity 
              style={[
                styles.voteButton,
                styles.upvoteButton,
                item.userVote === 'upvote' && styles.votedButton,
              ]}
              onPress={() => handleVote(item._id, 'upvote')}
              disabled={isVoting}
            >
              {isVoting ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <>
                  <Ionicons 
                    name={item.userVote === 'upvote' ? 'arrow-up' : 'arrow-up-outline'} 
                    size={20} 
                    color={item.userVote === 'upvote' ? '#fff' : '#10B981'} 
                  />
                  <Text style={[
                    styles.voteButtonText,
                    item.userVote === 'upvote' && styles.votedButtonText,
                  ]}>
                    {item.upvotes || item.upvoteCount || 0}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Downvote Button */}
            <TouchableOpacity 
              style={[
                styles.voteButton,
                styles.downvoteButton,
                item.userVote === 'downvote' && styles.votedButton,
              ]}
              onPress={() => handleVote(item._id, 'downvote')}
              disabled={isVoting}
            >
              {isVoting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Ionicons 
                    name={item.userVote === 'downvote' ? 'arrow-down' : 'arrow-down-outline'} 
                    size={20} 
                    color={item.userVote === 'downvote' ? '#fff' : '#EF4444'} 
                  />
                  <Text style={[
                    styles.voteButtonText,
                    item.userVote === 'downvote' && styles.votedButtonText,
                  ]}>
                    {item.downvotes || item.downvoteCount || 0}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryFilter = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.key && styles.selectedCategoryChip,
      ]}
      onPress={() => setSelectedCategory(item.key)}
    >
      <Ionicons 
        name={item.icon} 
        size={16} 
        color={selectedCategory === item.key ? '#fff' : item.color} 
      />
      <Text style={[
        styles.categoryText,
        selectedCategory === item.key && styles.selectedCategoryText,
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading && issues.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FD1C7" />
        <Text style={styles.loadingText}>Loading community issues...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Voting</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Category Filters */}
      <View style={styles.filtersSection}>
        <FlatList
          data={categories}
          renderItem={renderCategoryFilter}
          keyExtractor={item => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        />
      </View>

      {/* Issues List */}
      <FlatList
        data={getFilteredIssues()}
        renderItem={renderIssueCard}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={fetchIssues}
            colors={['#4FD1C7']}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Issues Found</Text>
            <Text style={styles.emptyDescription}>
              {selectedCategory === 'all' 
                ? 'There are no community issues to vote on at the moment.'
                : `No issues found in the ${selectedCategory} category.`
              }
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  filtersSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCategoryChip: {
    backgroundColor: '#4FD1C7',
    borderColor: '#4FD1C7',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 6,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  issueCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  issueImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  issueInfo: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  votingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  votingStats: {
    flex: 1,
  },
  netVotesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  voteBreakdown: {
    fontSize: 12,
    color: '#6B7280',
  },
  votingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 60,
    justifyContent: 'center',
  },
  upvoteButton: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  downvoteButton: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  votedButton: {
    backgroundColor: '#4FD1C7',
    borderColor: '#4FD1C7',
  },
  voteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  votedButtonText: {
    color: '#fff',
  },
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
  },
});
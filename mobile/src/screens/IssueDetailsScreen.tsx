import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useReports } from '../context/ReportsContext';
import { apiClient } from '../services/api';

// Define route params type
type IssueDetailsRouteProp = RouteProp<{ params: { issueId: string } }, 'params'>;

const IssueDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<IssueDetailsRouteProp>();
  const { reports } = useReports();
  const { issueId } = route.params;

  const [showComments, setShowComments] = useState(false);
  const [issue, setIssue] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);

  // Find the issue from the reports context or fetch from API
  useEffect(() => {
    const loadIssue = async () => {
      try {
        setIsLoading(true);
        
        // First try to find in local reports
        const localIssue = reports.find(report => report.id?.toString() === issueId);
        if (localIssue) {
          setIssue(localIssue);
          setIsLoading(false);
          return;
        }

        // If not found locally, fetch from API
        const response = await apiClient.getIssueById(issueId);
        if (response.success && response.data) {
          setIssue(response.data);
        } else {
          throw new Error('Issue not found');
        }
      } catch (error) {
        console.error('Error loading issue:', error);
        Alert.alert('Error', 'Failed to load issue details. Please try again.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    loadIssue();
  }, [issueId, reports, navigation]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!issue || isVoting) return;
    
    try {
      setIsVoting(true);
      
      if (voteType === 'upvote') {
        await apiClient.upvoteIssue(issue._id || issue.id);
      } else {
        await apiClient.downvoteIssue(issue._id || issue.id);
      }
      
      // Update local issue state
      setIssue((prevIssue: any) => {
        const newVotesCount = voteType === 'upvote' 
          ? (prevIssue.votesCount || 0) + 1 
          : Math.max((prevIssue.votesCount || 0) - 1, 0);
        return { ...prevIssue, votesCount: newVotesCount };
      });
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Failed to register your vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar backgroundColor="#4FD1C7" barStyle="light-content" />
        <ActivityIndicator size="large" color="#4FD1C7" />
        <Text style={styles.loadingText}>Loading issue details...</Text>
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar backgroundColor="#4FD1C7" barStyle="light-content" />
        <Text style={styles.errorText}>Issue not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusProgress = () => {
    switch (issue.status?.toLowerCase()) {
      case 'reported': case 'pending': return 25;
      case 'acknowledged': case 'assigned': return 50;
      case 'in-progress': case 'in progress': return 75;
      case 'resolved': case 'completed': return 100;
      default: return 25;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': case 'urgent': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#4FD1C7';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved': case 'completed': return '#10B981';
      case 'in-progress': case 'in progress': case 'assigned': return '#F59E0B';
      case 'acknowledged': return '#3B82F6';
      case 'reported': case 'pending': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const StatusTimeline = () => (
    <View style={styles.timelineContainer}>
      <Text style={styles.timelineTitle}>Status Timeline</Text>
      
      <View style={styles.timeline}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${getStatusProgress()}%` }]} />
        </View>
        <View style={styles.timelineSteps}>
          <View style={[styles.timelineStep, issue.status === 'reported' && styles.activeStep]}>
            <Ionicons name="checkmark-circle" size={20} color="#4FD1C7" />
          </View>
          <View style={[styles.timelineStep, issue.status === 'acknowledged' && styles.activeStep]}>
            <Ionicons name="checkmark-circle" size={20} color="#4FD1C7" />
          </View>
          <View style={[styles.timelineStep, issue.status === 'in-progress' && styles.activeStep]}>
            <Ionicons name="ellipse-outline" size={20} color="#D1D5DB" />
          </View>
          <View style={[styles.timelineStep, issue.status === 'resolved' && styles.activeStep]}>
            <Ionicons name="ellipse-outline" size={20} color="#D1D5DB" />
          </View>
        </View>
      </View>

      <View style={styles.statusList}>
        <View style={styles.statusItem}>
          <Ionicons name="checkmark-circle" size={16} color="#4FD1C7" />
          <Text style={styles.statusLabel}>Reported</Text>
          <Text style={styles.statusValue}>{new Date(issue.createdAt || issue.created_at || Date.now()).toLocaleDateString()}</Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons name="checkmark-circle" size={16} color="#4FD1C7" />
          <Text style={styles.statusLabel}>Acknowledged</Text>
          <Text style={styles.statusValue}>{issue.acknowledgedAt ? new Date(issue.acknowledgedAt).toLocaleDateString() : 'Pending'}</Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons name="ellipse-outline" size={16} color="#D1D5DB" />
          <Text style={styles.statusLabel}>In-Progress</Text>
        </View>
      </View>

      <View style={styles.assignedSection}>
        <Text style={styles.assignedText}>
          {issue.description || 'Issue reported to relevant department'}{'\n'}{issue.assignedDepartment || 'Public Works Department'}
        </Text>
        <TouchableOpacity style={styles.reportSpamButton}>
          <Text style={styles.reportSpamText}>Report Spam</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const CommunityFeedback = () => (
    <View style={styles.feedbackContainer}>
      <Text style={styles.feedbackTitle}>Community Feedback</Text>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.upvoteButton]}
          onPress={() => handleVote('upvote')}
          disabled={isVoting}
        >
          <Text style={[styles.upvoteButtonText]}>
            Upvote ({issue.votesCount || issue.upvotes || 0})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.commentButton}>
          <Text style={styles.commentButtonText}>Comment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.commentsSection}>
        {(issue.comments || []).map((comment: any, index: number) => (
          <View key={comment.id} style={styles.commentItem}>
            <Image source={comment.avatar} style={styles.commentAvatar} />
            <View style={styles.commentContent}>
              <Text style={[styles.commentAuthor, comment.isStaff && styles.staffComment]}>
                {comment.author}{comment.isStaff ? ':' : ':'} 
              </Text>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4FD1C7" barStyle="light-content" />
      
      {!showComments ? (
        // Main Issue Details View
        <View style={styles.mainContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Issue Details</Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Location */}
            <View style={styles.locationCard}>
              <Ionicons name="location" size={16} color="#4FD1C7" />
              <Text style={styles.locationText}>{issue.location?.address || issue.address || 'Location not specified'}</Text>
            </View>

            {/* Issue Image */}
            <View style={styles.imageContainer}>
              {issue.images && issue.images.length > 0 ? (
                <Image source={{ uri: issue.images[0] }} style={styles.issueImage} />
              ) : (
                <View style={[styles.issueImage, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                </View>
              )}
            </View>

            {/* Issue Info with Status Badge */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={20} color="#4FD1C7" />
                <Text style={styles.infoTitle}>{issue.title || 'Issue Report'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
                  <Text style={styles.statusText}>{issue.status || 'pending'}</Text>
                </View>
              </View>
              <Text style={styles.infoDescription}>{issue.description}</Text>
              {issue.priority && (
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issue.priority) }]}>
                  <Text style={styles.priorityText}>{issue.priority} priority</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      ) : (
        // Comments/Timeline View
        <View style={styles.commentsContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="menu" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Issue Details</Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Location */}
            <View style={styles.locationCard}>
              <Ionicons name="location" size={16} color="#4FD1C7" />
              <Text style={styles.locationText}>{issue.location?.address || issue.address || 'Location not specified'}</Text>
            </View>

            <StatusTimeline />
            <CommunityFeedback />
          </ScrollView>
        </View>
      )}

      {/* Toggle Button */}
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={() => setShowComments(!showComments)}
      >
        <Ionicons 
          name={showComments ? "images" : "time"} 
          size={24} 
          color="#FFFFFF" 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  mainContainer: {
    flex: 1,
  },
  commentsContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4FD1C7',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  imageContainer: {
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  issueImage: {
    width: '100%',
    height: 200,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  infoDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  timelineContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  timeline: {
    position: 'relative',
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4FD1C7',
    borderRadius: 2,
  },
  timelineSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineStep: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#4FD1C7',
  },
  statusList: {
    marginBottom: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  statusValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  assignedSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
    alignItems: 'center',
  },
  assignedText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  reportSpamButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 6,
  },
  reportSpamText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  feedbackContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  upvoteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4FD1C7',
    borderRadius: 8,
    alignItems: 'center',
  },
  upvoteButtonActive: {
    backgroundColor: '#4FD1C7',
  },
  upvoteButtonText: {
    fontSize: 14,
    color: '#4FD1C7',
    fontWeight: '500',
  },
  upvoteButtonTextActive: {
    color: '#FFFFFF',
  },
  commentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  commentButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  commentsSection: {
    gap: 16,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  staffComment: {
    color: '#4FD1C7',
  },
  commentText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4FD1C7',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Loading and Error States
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: '#4FD1C7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Status and Priority Badges
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default IssueDetailsScreen;

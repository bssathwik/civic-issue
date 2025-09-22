import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// Types
interface IssueComment {
  id: number;
  author: string;
  message: string;
  timestamp: string;
  type: 'worker' | 'admin' | 'system';
}

interface IssueDetail {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  location: string;
  coordinates: { lat: number; lng: number };
  assignedDate: string;
  reportedBy: string;
  estimatedTime: string;
  category: string;
  photos: string[];
  comments: IssueComment[];
  workLog?: {
    startTime?: string;
    endTime?: string;
    timeSpent?: number;
  };
}

const WorkerIssueDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { issueId } = route.params;

  // State management
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null);

  // Mock data - will be replaced with API calls
  const mockIssueDetail: IssueDetail = {
    id: issueId,
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues and potential vehicle damage. Located near the intersection with Oak Street. Multiple residents have reported this issue.',
    status: 'open',
    priority: 'high',
    location: 'Main St, Block A, Near Oak St Intersection',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    assignedDate: '2025-09-15T10:30:00Z',
    reportedBy: 'John Doe',
    estimatedTime: '2 hours',
    category: 'Road Maintenance',
    photos: [
      'https://via.placeholder.com/400x300/666666/FFFFFF?text=Pothole+Photo+1',
      'https://via.placeholder.com/400x300/888888/FFFFFF?text=Pothole+Photo+2',
    ],
    comments: [
      {
        id: 1,
        author: 'System',
        message: 'Issue assigned to worker',
        timestamp: '2025-09-15T10:30:00Z',
        type: 'system',
      },
      {
        id: 2,
        author: 'Admin Smith',
        message: 'High priority - please address as soon as possible',
        timestamp: '2025-09-15T11:00:00Z',
        type: 'admin',
      },
    ],
  };

  useEffect(() => {
    loadIssueDetails();
  }, []);

  const loadIssueDetails = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/worker/issues/${issueId}`);
      // setIssue(response.data);
      
      // Using mock data for now
      setTimeout(() => {
        setIssue(mockIssueDetail);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load issue details:', error);
      Alert.alert('Error', 'Failed to load issue details');
      setLoading(false);
    }
  };

  const updateIssueStatus = async (newStatus: string) => {
    try {
      // TODO: Replace with actual API call
      // await apiClient.put(`/worker/issues/${issueId}/status`, { status: newStatus });
      
      setIssue(prev => prev ? { ...prev, status: newStatus as any } : null);
      setStatusModalVisible(false);
      
      // Add system comment
      const systemComment: IssueComment = {
        id: Date.now(),
        author: 'System',
        message: `Status updated to ${newStatus} by ${user?.name}`,
        timestamp: new Date().toISOString(),
        type: 'system',
      };
      
      setIssue(prev => prev ? {
        ...prev,
        comments: [...prev.comments, systemComment]
      } : null);
      
      Alert.alert('Success', 'Issue status updated successfully');
    } catch (error) {
      console.error('Failed to update status:', error);
      Alert.alert('Error', 'Failed to update issue status');
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      // TODO: Replace with actual API call
      // await apiClient.post(`/worker/issues/${issueId}/comments`, { message: newComment });
      
      const comment: IssueComment = {
        id: Date.now(),
        author: user?.name || 'Worker',
        message: newComment.trim(),
        timestamp: new Date().toISOString(),
        type: 'worker',
      };
      
      setIssue(prev => prev ? {
        ...prev,
        comments: [...prev.comments, comment]
      } : null);
      
      setNewComment('');
      Alert.alert('Success', 'Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const startWork = () => {
    const startTime = new Date();
    setWorkStartTime(startTime);
    setIsWorking(true);
    
    // Update status to in-progress if not already
    if (issue?.status === 'open') {
      updateIssueStatus('in-progress');
    }
    
    Alert.alert('Work Started', 'Timer started. Don\'t forget to end work when finished.');
  };

  const endWork = () => {
    if (!workStartTime) return;
    
    const endTime = new Date();
    const timeSpentMinutes = Math.floor((endTime.getTime() - workStartTime.getTime()) / (1000 * 60));
    
    setIsWorking(false);
    setWorkStartTime(null);
    
    Alert.alert(
      'Work Completed',
      `Time spent: ${timeSpentMinutes} minutes.\nWould you like to mark this issue as resolved?`,
      [
        { text: 'Not Yet', style: 'cancel' },
        { text: 'Mark Resolved', onPress: () => updateIssueStatus('resolved') },
      ]
    );
  };

  const openNavigation = () => {
    if (!issue) return;
    
    const { lat, lng } = issue.coordinates;
    // Open maps app with navigation
    Alert.alert(
      'Navigation',
      'Open navigation in maps app?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Maps', onPress: () => {
          // TODO: Implement actual navigation opening
          console.log(`Navigate to: ${lat}, ${lng}`);
        }},
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#EF4444';
      case 'in-progress': return '#F59E0B';
      case 'resolved': return '#10B981';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCommentIcon = (type: string) => {
    switch (type) {
      case 'admin': return 'shield-checkmark';
      case 'system': return 'cog';
      case 'worker': return 'hammer';
      default: return 'person';
    }
  };

  if (loading || !issue) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading issue details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6366F1" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Issue Details</Text>
        <TouchableOpacity onPress={() => setStatusModalVisible(true)} style={styles.statusButton}>
          <Ionicons name="settings" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Issue Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <Text style={styles.issueTitle}>{issue.title}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issue.priority) }]}>
              <Text style={styles.priorityText}>{issue.priority.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
            <Text style={styles.statusText}>{issue.status.replace('-', ' ').toUpperCase()}</Text>
          </View>
          
          <Text style={styles.description}>{issue.description}</Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{issue.location}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={16} color="#6B7280" />
              <Text style={styles.detailText}>Est: {issue.estimatedTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{formatDate(issue.assignedDate)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="person" size={16} color="#6B7280" />
              <Text style={styles.detailText}>By: {issue.reportedBy}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={openNavigation}>
            <Ionicons name="navigate" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Navigate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, isWorking ? styles.endWorkButton : styles.startWorkButton]}
            onPress={isWorking ? endWork : startWork}
          >
            <Ionicons name={isWorking ? "stop" : "play"} size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>
              {isWorking ? "End Work" : "Start Work"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Work Timer */}
        {isWorking && workStartTime && (
          <View style={styles.timerCard}>
            <Ionicons name="timer" size={24} color="#F59E0B" />
            <Text style={styles.timerText}>
              Work in progress since {workStartTime.toLocaleTimeString()}
            </Text>
          </View>
        )}

        {/* Photos Section */}
        {issue.photos.length > 0 && (
          <View style={styles.photosCard}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {issue.photos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedPhoto(photo);
                    setPhotoModalVisible(true);
                  }}
                >
                  <Image source={{ uri: photo }} style={styles.photoThumbnail} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Comments Section */}
        <View style={styles.commentsCard}>
          <Text style={styles.sectionTitle}>Communication Log</Text>
          
          {issue.comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <View style={styles.commentAuthor}>
                  <Ionicons 
                    name={getCommentIcon(comment.type) as any} 
                    size={16} 
                    color="#6B7280" 
                  />
                  <Text style={styles.authorName}>{comment.author}</Text>
                </View>
                <Text style={styles.commentTime}>{formatDate(comment.timestamp)}</Text>
              </View>
              <Text style={styles.commentMessage}>{comment.message}</Text>
            </View>
          ))}
          
          {/* Add Comment */}
          <View style={styles.addCommentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#9CA3AF"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={addComment}>
              <Ionicons name="send" size={20} color="#6366F1" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Status Update Modal */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Status</Text>
            
            {['open', 'in-progress', 'resolved'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  issue.status === status && styles.currentStatus
                ]}
                onPress={() => updateIssueStatus(status)}
              >
                <Text style={[
                  styles.statusOptionText,
                  issue.status === status && styles.currentStatusText
                ]}>
                  {status.replace('-', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Photo Modal */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.photoModalOverlay}>
          <TouchableOpacity
            style={styles.closePhotoButton}
            onPress={() => setPhotoModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="#FFF" />
          </TouchableOpacity>
          {selectedPhoto && (
            <Image source={{ uri: selectedPhoto }} style={styles.fullScreenPhoto} />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  startWorkButton: {
    backgroundColor: '#10B981',
  },
  endWorkButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  timerCard: {
    backgroundColor: '#FEF3C7',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  timerText: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '600',
  },
  photosCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  commentsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  commentItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
    marginBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  commentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  commentMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    maxHeight: 100,
  },
  sendButton: {
    padding: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: width * 0.8,
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  currentStatus: {
    backgroundColor: '#EBF4FF',
  },
  statusOptionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  currentStatusText: {
    color: '#1D4ED8',
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closePhotoButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  fullScreenPhoto: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 8,
    resizeMode: 'contain',
  },
});

export default WorkerIssueDetailsScreen;

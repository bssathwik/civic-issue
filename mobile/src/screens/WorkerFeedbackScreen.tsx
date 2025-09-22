import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types
interface FeedbackReport {
  id: string;
  type: 'completion' | 'quality' | 'incident' | 'suggestion' | 'complaint';
  issueId?: number;
  title: string;
  description: string;
  rating?: number; // 1-5 stars
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'submitted' | 'under_review' | 'resolved';
  createdAt: Date;
  updatedAt?: Date;
  attachments: string[]; // photo URIs
  response?: {
    message: string;
    respondedBy: string;
    respondedAt: Date;
  };
}

// interface QualityMetrics {
//   issueId: number;
//   completionTime: number; // minutes
//   qualityScore: number; // 1-5
//   citizenSatisfaction?: number; // 1-5
//   supervisorRating?: number; // 1-5
//   notes?: string;
// }

interface SupervisorMessage {
  id: string;
  from: string;
  message: string;
  timestamp: Date;
  type: 'feedback' | 'instruction' | 'appreciation' | 'concern';
  issueId?: number;
  read: boolean;
}

const WorkerFeedbackScreen = () => {
  // const navigation = useNavigation<any>();

  // State management
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [messages, setMessages] = useState<SupervisorMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'messages' | 'metrics'>('reports');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newReport, setNewReport] = useState<Partial<FeedbackReport>>({
    type: 'completion',
    priority: 'medium',
    title: '',
    description: '',
    category: 'General',
  });
  // Mock data (moved to module level to avoid re-renders)
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FeedbackReport | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const loadFeedbackData = useCallback(async () => {
    try {
      // Mock data
      const mockReports: FeedbackReport[] = [
        {
          id: '1',
          type: 'completion',
          issueId: 123,
          title: 'Pothole Repair Completed',
          description: 'Successfully repaired the large pothole on Main Street. Used 2 bags of asphalt mix and completed within estimated time.',
          rating: 4,
          category: 'Road Maintenance',
          priority: 'medium',
          status: 'submitted',
          createdAt: new Date(Date.now() - 3600000),
          attachments: ['photo1.jpg', 'photo2.jpg'],
        },
        {
          id: '2',
          type: 'incident',
          title: 'Equipment Malfunction',
          description: 'The asphalt mixer malfunctioned during repair work. Need maintenance check before next use.',
          category: 'Equipment',
          priority: 'high',
          status: 'under_review',
          createdAt: new Date(Date.now() - 7200000),
          attachments: [],
          response: {
            message: 'Equipment has been scheduled for maintenance. Use backup unit for now.',
            respondedBy: 'John Smith (Supervisor)',
            respondedAt: new Date(Date.now() - 3600000),
          },
        },
        {
          id: '3',
          type: 'quality',
          issueId: 124,
          title: 'Street Light Installation Quality Check',
          description: 'Installation completed successfully. All electrical connections tested and working properly.',
          rating: 5,
          category: 'Electrical',
          priority: 'medium',
          status: 'resolved',
          createdAt: new Date(Date.now() - 86400000),
          attachments: ['installation1.jpg'],
        },
      ];

      const mockMessages: SupervisorMessage[] = [
        {
          id: '1',
          from: 'Sarah Johnson',
          message: 'Excellent work on the recent street light repairs. The quality has been consistently high.',
          timestamp: new Date(Date.now() - 1800000),
          type: 'appreciation',
          read: false,
        },
        {
          id: '2',
          from: 'Mike Davis',
          message: 'Please ensure all safety equipment is used when working on electrical issues.',
          timestamp: new Date(Date.now() - 3600000),
          type: 'instruction',
          issueId: 125,
          read: true,
        },
        {
          id: '3',
          from: 'Sarah Johnson',
          message: 'The citizen reported satisfaction with issue #123. Great job on the pothole repair!',
          timestamp: new Date(Date.now() - 7200000),
          type: 'feedback',
          issueId: 123,
          read: true,
        },
      ];
      
      // TODO: Replace with actual API calls
      // const reportsResponse = await apiClient.get('/worker/feedback/reports');
      // const messagesResponse = await apiClient.get('/worker/feedback/messages');
      // setReports(reportsResponse.data);
      // setMessages(messagesResponse.data);
      
      // Using mock data
      setReports(mockReports);
      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to load feedback data:', error);
      Alert.alert('Error', 'Failed to load feedback data');
    }
  }, []);

  useEffect(() => {
    loadFeedbackData();
  }, [loadFeedbackData]);

  const submitReport = async () => {
    if (!newReport.title?.trim() || !newReport.description?.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      const report: FeedbackReport = {
        id: Date.now().toString(),
        type: newReport.type || 'completion',
        issueId: newReport.issueId,
        title: newReport.title,
        description: newReport.description,
        rating: newReport.rating,
        category: newReport.category || 'General',
        priority: newReport.priority || 'medium',
        status: 'submitted',
        createdAt: new Date(),
        attachments: newReport.attachments || [],
      };

      setReports(prev => [report, ...prev]);
      setNewReport({
        type: 'completion',
        priority: 'medium',
        title: '',
        description: '',
        category: 'General',
      });
      setCreateModalVisible(false);

      // TODO: Submit to API
      // await apiClient.post('/worker/feedback/reports', report);

      Alert.alert('Success', 'Feedback report submitted successfully!');
    } catch (error) {
      console.error('Failed to submit report:', error);
      Alert.alert('Error', 'Failed to submit report');
    }
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
    
    // TODO: Update on server
    // apiClient.post(`/worker/feedback/messages/${messageId}/read`);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeedbackData();
    setRefreshing(false);
  }, [loadFeedbackData]);

  const getTypeIcon = (type: FeedbackReport['type']) => {
    switch (type) {
      case 'completion': return 'checkmark-circle';
      case 'quality': return 'star';
      case 'incident': return 'alert-circle';
      case 'suggestion': return 'bulb';
      case 'complaint': return 'warning';
    }
  };

  const getTypeColor = (type: FeedbackReport['type']) => {
    switch (type) {
      case 'completion': return '#10B981';
      case 'quality': return '#F59E0B';
      case 'incident': return '#EF4444';
      case 'suggestion': return '#6366F1';
      case 'complaint': return '#DC2626';
    }
  };

  const getStatusColor = (status: FeedbackReport['status']) => {
    switch (status) {
      case 'draft': return '#9CA3AF';
      case 'submitted': return '#3B82F6';
      case 'under_review': return '#F59E0B';
      case 'resolved': return '#10B981';
    }
  };

  const getMessageTypeIcon = (type: SupervisorMessage['type']) => {
    switch (type) {
      case 'feedback': return 'chatbubble';
      case 'instruction': return 'information-circle';
      case 'appreciation': return 'heart';
      case 'concern': return 'alert-circle';
    }
  };

  const renderStarRating = (rating: number, onRate?: (rating: number) => void) => {
    return (
      <View style={styles.starRating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRate?.(star)}
            disabled={!onRate}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={24}
              color="#F59E0B"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReportItem = (report: FeedbackReport) => (
    <TouchableOpacity
      key={report.id}
      style={styles.reportItem}
      onPress={() => {
        setSelectedReport(report);
        setDetailsModalVisible(true);
      }}
    >
      <View style={styles.reportHeader}>
        <View style={[styles.typeIcon, { backgroundColor: getTypeColor(report.type) }]}>
          <Ionicons name={getTypeIcon(report.type) as any} size={20} color="#FFF" />
        </View>
        
        <View style={styles.reportContent}>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportDescription} numberOfLines={2}>
            {report.description}
          </Text>
          
          {report.rating && (
            <View style={styles.reportRating}>
              {renderStarRating(report.rating)}
            </View>
          )}
        </View>
        
        <View style={styles.reportMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
            <Text style={styles.statusText}>{report.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
          <Text style={styles.reportTime}>
            {report.createdAt.toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      {report.response && (
        <View style={styles.responseIndicator}>
          <Ionicons name="mail" size={16} color="#6366F1" />
          <Text style={styles.responseText}>Response received</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderMessageItem = (message: SupervisorMessage) => (
    <TouchableOpacity
      key={message.id}
      style={[styles.messageItem, !message.read && styles.unreadMessage]}
      onPress={() => markMessageAsRead(message.id)}
    >
      <View style={styles.messageHeader}>
        <View style={styles.messageIcon}>
          <Ionicons
            name={getMessageTypeIcon(message.type) as any}
            size={20}
            color="#6366F1"
          />
        </View>
        
        <View style={styles.messageContent}>
          <View style={styles.messageInfo}>
            <Text style={styles.messageFrom}>{message.from}</Text>
            <Text style={styles.messageTime}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Text style={styles.messageText}>{message.message}</Text>
          {message.issueId && (
            <Text style={styles.messageIssue}>Issue #{message.issueId}</Text>
          )}
        </View>
        
        {!message.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  const unreadMessagesCount = messages.filter(m => !m.read).length;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6366F1" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feedback & Reports</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setCreateModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.createButtonText}>New Report</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'reports', label: 'Reports', count: reports.length },
          { key: 'messages', label: 'Messages', count: unreadMessagesCount },
          { key: 'metrics', label: 'Quality', count: 0 },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'reports' && (
          <View style={styles.reportsContent}>
            {reports.length > 0 ? (
              reports.map(renderReportItem)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No reports yet</Text>
                <Text style={styles.emptySubtitle}>
                  Create your first feedback report to get started
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'messages' && (
          <View style={styles.messagesContent}>
            {messages.length > 0 ? (
              messages.map(renderMessageItem)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="mail-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No messages</Text>
                <Text style={styles.emptySubtitle}>
                  Messages from supervisors will appear here
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'metrics' && (
          <View style={styles.metricsContent}>
            <View style={styles.metricsCard}>
              <Text style={styles.metricsTitle}>Quality Metrics</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>4.7</Text>
                  <Text style={styles.metricLabel}>Avg Rating</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>92%</Text>
                  <Text style={styles.metricLabel}>Completion Rate</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>87%</Text>
                  <Text style={styles.metricLabel}>Citizen Satisfaction</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>15</Text>
                  <Text style={styles.metricLabel}>Issues This Week</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Create Report Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Report</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Report Type */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Report Type</Text>
                <View style={styles.typeSelector}>
                  {[
                    { key: 'completion', label: 'Completion', icon: 'checkmark-circle' },
                    { key: 'quality', label: 'Quality', icon: 'star' },
                    { key: 'incident', label: 'Incident', icon: 'alert-circle' },
                    { key: 'suggestion', label: 'Suggestion', icon: 'bulb' },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.typeOption,
                        newReport.type === type.key && styles.selectedTypeOption
                      ]}
                      onPress={() => setNewReport(prev => ({ ...prev, type: type.key as any }))}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={20}
                        color={newReport.type === type.key ? '#FFF' : '#6B7280'}
                      />
                      <Text style={[
                        styles.typeOptionText,
                        newReport.type === type.key && styles.selectedTypeOptionText
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Title */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newReport.title}
                  onChangeText={(text) => setNewReport(prev => ({ ...prev, title: text }))}
                  placeholder="Enter report title"
                />
              </View>

              {/* Description */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Description *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newReport.description}
                  onChangeText={(text) => setNewReport(prev => ({ ...prev, description: text }))}
                  placeholder="Describe the details..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Rating (for quality reports) */}
              {newReport.type === 'quality' && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Quality Rating</Text>
                  {renderStarRating(newReport.rating || 0, (rating) =>
                    setNewReport(prev => ({ ...prev, rating }))
                  )}
                </View>
              )}

              {/* Priority */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Priority</Text>
                <View style={styles.prioritySelector}>
                  {['low', 'medium', 'high', 'critical'].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityOption,
                        newReport.priority === priority && styles.selectedPriorityOption
                      ]}
                      onPress={() => setNewReport(prev => ({ ...prev, priority: priority as any }))}
                    >
                      <Text style={[
                        styles.priorityOptionText,
                        newReport.priority === priority && styles.selectedPriorityOptionText
                      ]}>
                        {priority.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitReport}
              >
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Report Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModal}>
            {selectedReport && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Report Details</Text>
                  <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                  <Text style={styles.detailsTitle}>{selectedReport.title}</Text>
                  <Text style={styles.detailsDescription}>{selectedReport.description}</Text>
                  
                  {selectedReport.rating && (
                    <View style={styles.detailsRating}>
                      <Text style={styles.detailsRatingLabel}>Rating:</Text>
                      {renderStarRating(selectedReport.rating)}
                    </View>
                  )}
                  
                  <View style={styles.detailsInfo}>
                    <View style={styles.detailsInfoRow}>
                      <Text style={styles.detailsInfoLabel}>Type:</Text>
                      <Text style={styles.detailsInfoValue}>{selectedReport.type}</Text>
                    </View>
                    <View style={styles.detailsInfoRow}>
                      <Text style={styles.detailsInfoLabel}>Status:</Text>
                      <Text style={styles.detailsInfoValue}>{selectedReport.status}</Text>
                    </View>
                    <View style={styles.detailsInfoRow}>
                      <Text style={styles.detailsInfoLabel}>Created:</Text>
                      <Text style={styles.detailsInfoValue}>
                        {selectedReport.createdAt.toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  {selectedReport.response && (
                    <View style={styles.responseSection}>
                      <Text style={styles.responseSectionTitle}>Supervisor Response</Text>
                      <View style={styles.responseContent}>
                        <Text style={styles.responseMessage}>{selectedReport.response.message}</Text>
                        <Text style={styles.responseBy}>
                          - {selectedReport.response.respondedBy}
                        </Text>
                        <Text style={styles.responseDate}>
                          {selectedReport.response.respondedAt.toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
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
  header: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  reportsContent: {
    gap: 12,
  },
  reportItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  reportRating: {
    marginBottom: 4,
  },
  reportMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  reportTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  responseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 6,
  },
  responseText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  messagesContent: {
    gap: 12,
  },
  messageItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  messageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageFrom: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messageText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  messageIssue: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  unreadDot: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
  metricsContent: {
    gap: 16,
  },
  metricsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  starRating: {
    flexDirection: 'row',
    gap: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  createModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  detailsModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFF',
    gap: 6,
  },
  selectedTypeOption: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  typeOptionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedTypeOptionText: {
    color: '#FFF',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  textArea: {
    minHeight: 100,
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFF',
  },
  selectedPriorityOption: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  priorityOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedPriorityOptionText: {
    color: '#FFF',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366F1',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  detailsDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  detailsRatingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  detailsInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  detailsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailsInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  responseSection: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 16,
  },
  responseSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 12,
  },
  responseContent: {
    gap: 4,
  },
  responseMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  responseBy: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  responseDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default WorkerFeedbackScreen;

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

// Types for worker issues
interface WorkerIssue {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  location: string;
  assignedDate: string;
  reportedBy: string;
  estimatedTime: string;
  category: string;
}

type IconName = 'list' | 'alert-circle' | 'build' | 'checkmark-circle';

interface FilterOption {
  key: string;
  label: string;
  icon: IconName;
}

// Worker Dashboard Screen - Main interface for workers to manage assigned issues
const WorkerDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  // State management
  const [assignedIssues, setAssignedIssues] = useState<WorkerIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<WorkerIssue[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('priority');

  // Filter options
  const filterOptions: FilterOption[] = [
    { key: 'all', label: 'All Issues', icon: 'list' },
    { key: 'open', label: 'Open', icon: 'alert-circle' },
    { key: 'in-progress', label: 'In Progress', icon: 'build' },
    { key: 'resolved', label: 'Resolved', icon: 'checkmark-circle' },
  ];

  // Sort options
  const sortOptions = [
    { key: 'priority', label: 'Priority' },
    { key: 'date', label: 'Date Created' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' },
  ];

  // Mock data for demonstration - will be replaced with API calls
  const mockIssues: WorkerIssue[] = [
    {
      id: 1,
      title: 'Pothole on Main Street',
      description: 'Large pothole causing traffic issues',
      status: 'open',
      priority: 'high',
      location: 'Main St, Block A',
      assignedDate: '2025-09-15T10:30:00Z',
      reportedBy: 'John Doe',
      estimatedTime: '2 hours',
      category: 'Road Maintenance',
    },
    {
      id: 2,
      title: 'Broken Street Light',
      description: 'Street light not functioning at intersection',
      status: 'in-progress',
      priority: 'medium',
      location: '1st Ave & Oak St',
      assignedDate: '2025-09-14T14:20:00Z',
      reportedBy: 'Jane Smith',
      estimatedTime: '1 hour',
      category: 'Electrical',
    },
    {
      id: 3,
      title: 'Graffiti Removal',
      description: 'Graffiti on public building wall',
      status: 'resolved',
      priority: 'low',
      location: 'City Hall, South Wall',
      assignedDate: '2025-09-13T09:15:00Z',
      reportedBy: 'Mike Johnson',
      estimatedTime: '30 minutes',
      category: 'Cleaning',
    },
  ];

  const loadAssignedIssues = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/worker/issues/${user._id}`);
      // setAssignedIssues(response.data);
      
      // Using mock data for now
      setTimeout(() => {
        setAssignedIssues(mockIssues);
      }, 1000);
    } catch (error) {
      console.error('Failed to load issues:', error);
      Alert.alert('Error', 'Failed to load assigned issues');
    }
  }, []);

  const applyFiltersAndSorting = useCallback(() => {
    let filtered = [...assignedIssues];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.id.toString().includes(searchQuery)
      );
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === selectedFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'priority':
          const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'date':
          return new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime();
        case 'location':
          return a.location.localeCompare(b.location);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredIssues(filtered);
  }, [assignedIssues, searchQuery, selectedFilter, selectedSort]);

  useEffect(() => {
    loadAssignedIssues();
  }, [loadAssignedIssues]);

  useEffect(() => {
    applyFiltersAndSorting();
  }, [applyFiltersAndSorting]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssignedIssues();
    setRefreshing(false);
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
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'today';
    if (diffDays === 2) return 'yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'New';
      case 'in-progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'open': return { backgroundColor: '#10B981' };
      case 'in-progress': return { backgroundColor: '#F59E0B' };
      case 'resolved': return { backgroundColor: '#6B7280' };
      default: return { backgroundColor: '#6B7280' };
    }
  };

  const getStatusTextStyle = (status: string) => {
    return { color: '#FFFFFF' };
  };

  const renderIssueItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => navigation.navigate('WorkerIssueDetails', { issueId: item.id })}
    >
      <View style={styles.taskRow}>
        {/* Task Image */}
        <View style={styles.taskImageContainer}>
          <View style={styles.taskImagePlaceholder}>
            <Ionicons name="image-outline" size={24} color="#9CA3AF" />
          </View>
        </View>

        {/* Task Content */}
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {item.priority === 'high' && (
              <View style={styles.priorityIndicator}>
                <Ionicons name="alert-circle" size={16} color="#F59E0B" />
              </View>
            )}
          </View>
          
          <Text style={styles.taskLocation} numberOfLines={1}>
            {item.location}
          </Text>
          
          <View style={styles.taskMeta}>
            <Text style={styles.taskAssigned}>
              Assigned {formatDateShort(item.assignedDate)}
            </Text>
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>My Tasks</Text>
        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>
              {user?.name?.charAt(0).toUpperCase() || 'W'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Filter Pills */}
      <View style={styles.filterPills}>
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterPill, selectedFilter === 'all' && styles.filterPillActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterPillText, selectedFilter === 'all' && styles.filterPillTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterPill, styles.filterPillWithCount, selectedFilter === 'open' && styles.filterPillActive]}
            onPress={() => setSelectedFilter('open')}
          >
            <Text style={[styles.filterPillText, selectedFilter === 'open' && styles.filterPillTextActive]}>
              New ({assignedIssues.filter(i => i.status === 'open').length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterPill, styles.filterPillWithCount, selectedFilter === 'in-progress' && styles.filterPillActive]}
            onPress={() => setSelectedFilter('in-progress')}
          >
            <Text style={[styles.filterPillText, selectedFilter === 'in-progress' && styles.filterPillTextActive]}>
              In Progress ({assignedIssues.filter(i => i.status === 'in-progress').length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sortButton}>
            <Ionicons name="options-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Assigned Issues</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredIssues}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderIssueItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No issues match your search' : 'No issues assigned'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('WorkerMapView')}
        >
          <Ionicons name="map" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fabSecondary}
          onPress={() => navigation.navigate('WorkerProfile')}
        >
          <Ionicons name="person" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 100,
  },
  
  // Header Styles (new modern header)
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  // Filter Pills (new design)
  filterPills: {
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillWithCount: {
    // Additional styles for pills with counts
  },
  filterPillActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  
  // Task Card Styles (matching mockup)
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskImageContainer: {
    marginRight: 12,
  },
  taskImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  priorityIndicator: {
    // Indicator for high priority items
  },
  taskLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskAssigned: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Legacy styles (keeping for backward compatibility)
  header: {
    backgroundColor: '#10B981',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 16,
    color: '#E0F2E6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
    color: '#E0F2E6',
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterButtonActive: {
    backgroundColor: '#FFF',
  },
  filterButtonText: {
    color: '#E0F2E6',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#10B981',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    color: '#E0F2E6',
    fontSize: 14,
    marginRight: 12,
    fontWeight: '500',
  },
  sortButton: {
    padding: 8,
  },
  sortButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
  },
  sortButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  issueCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  issueHeader: {
    marginBottom: 12,
  },
  issueTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 18,
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
  issueDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  issueDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  assignedDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  category: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'column',
  },
  fab: {
    backgroundColor: '#10B981',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 12,
  },
  fabSecondary: {
    backgroundColor: '#FFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});

export default WorkerDashboardScreen;

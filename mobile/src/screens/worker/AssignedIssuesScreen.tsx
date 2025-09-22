import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: 'high' | 'medium' | 'low';
  location: {
    address: string;
    coordinates: [number, number];
  };
  assignedAt: string;
  dueDate?: string;
}

const AssignedIssuesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Mock data for now
  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setIssues([
        {
          _id: '1',
          title: 'Large Pothole on Main Street',
          description: 'Deep pothole causing vehicle damage',
          category: 'Road Maintenance',
          status: 'assigned',
          priority: 'high',
          location: {
            address: 'Main Street, Block A',
            coordinates: [12.9716, 77.5946],
          },
          assignedAt: '2025-09-18T08:00:00Z',
          dueDate: '2025-09-18T18:00:00Z',
        },
        {
          _id: '2',
          title: 'Streetlight Not Working',
          description: 'Streetlight bulb replacement needed',
          category: 'Electrical',
          status: 'assigned',
          priority: 'medium',
          location: {
            address: 'Park Avenue, Block B',
            coordinates: [12.9716, 77.5946],
          },
          assignedAt: '2025-09-17T14:30:00Z',
        },
        {
          _id: '3',
          title: 'Broken Water Pipe',
          description: 'Water leak on residential street',
          category: 'Water Supply',
          status: 'assigned',
          priority: 'high',
          location: {
            address: 'Oak Street, Block C',
            coordinates: [12.9716, 77.5946],
          },
          assignedAt: '2025-09-17T10:15:00Z',
          dueDate: '2025-09-18T16:00:00Z',
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  const filteredIssues = filter === 'all' 
    ? issues 
    : issues.filter(issue => issue.priority === filter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFA500';
      case 'low': return '#4ECDC4';
      default: return '#666';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'road maintenance': return 'construct';
      case 'electrical': return 'bulb';
      case 'water supply': return 'water';
      case 'waste management': return 'trash';
      default: return 'document-text';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} days ago`;
    }
  };

  const handleIssuePress = (issue: Issue) => {
    // Navigate to issue management screen with the selected issue
    Alert.alert('Issue Selected', `Navigate to manage: ${issue.title}`);
  };

  const renderIssueCard = ({ item }: { item: Issue }) => (
    <TouchableOpacity
      style={[styles.issueCard, { borderLeftColor: getPriorityColor(item.priority) }]}
      onPress={() => handleIssuePress(item)}
    >
      <View style={styles.issueHeader}>
        <View style={styles.issueIcon}>
          <Ionicons
            name={getCategoryIcon(item.category) as any}
            size={20}
            color={getPriorityColor(item.priority)}
          />
        </View>
        <View style={styles.issueInfo}>
          <Text style={styles.issueTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.issueLocation}>
            <Ionicons name="location" size={12} color="#666" />
            {' '}{item.location.address}
          </Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.priorityText}>
            {item.priority.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.issueDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.issueFooter}>
        <Text style={styles.issueCategory}>{item.category}</Text>
        <Text style={styles.assignedTime}>
          Assigned {formatTimeAgo(item.assignedAt)}
        </Text>
      </View>

      {item.dueDate && (
        <View style={styles.dueDateContainer}>
          <Ionicons name="time" size={16} color="#FF6B6B" />
          <Text style={styles.dueDate}>
            Due: {new Date(item.dueDate).toLocaleDateString()} at{' '}
            {new Date(item.dueDate).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const FilterButton = ({ label, value }: { label: string; value: typeof filter }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.activeFilterButton,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.activeFilterButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assigned Issues</Text>
        <TouchableOpacity onPress={loadIssues}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FilterButton label="All" value="all" />
        <FilterButton label="High" value="high" />
        <FilterButton label="Medium" value="medium" />
        <FilterButton label="Low" value="low" />
      </View>

      {/* Issues List */}
      <FlatList
        data={filteredIssues}
        keyExtractor={(item) => item._id}
        renderItem={renderIssueCard}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadIssues} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No assigned issues</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all'
                ? 'You have no issues assigned at the moment'
                : `No ${filter} priority issues assigned`}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  listContainer: {
    padding: 20,
  },
  issueCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  issueIcon: {
    marginRight: 12,
  },
  issueInfo: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  issueLocation: {
    fontSize: 14,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  issueDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueCategory: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  assignedTime: {
    fontSize: 12,
    color: '#999',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff5f5',
    borderRadius: 6,
  },
  dueDate: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});

export default AssignedIssuesScreen;

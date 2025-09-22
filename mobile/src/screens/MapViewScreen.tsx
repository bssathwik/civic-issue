import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const MapViewScreen = () => {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);

  // Mock data for issues on the map
  const mapIssues = [
    {
      id: 1,
      title: 'Pothole on Main St',
      status: 'reported',
      urgency: 'high',
      position: { x: '60%', y: '40%' },
      image: require('../assets/city-skyline.png')
    },
    {
      id: 2,
      title: 'Broken Streetlight',
      status: 'in-progress',
      urgency: 'medium',
      position: { x: '30%', y: '60%' },
      image: require('../assets/city-skyline.png')
    },
    {
      id: 3,
      title: 'Damaged Sidewalk',
      status: 'acknowledged',
      urgency: 'low',
      position: { x: '75%', y: '25%' },
      image: require('../assets/city-skyline.png')
    },
    {
      id: 4,
      title: 'Traffic Signal Issue',
      status: 'resolved',
      urgency: 'high',
      position: { x: '45%', y: '70%' },
      image: require('../assets/city-skyline.png')
    }
  ];

  const filterOptions = [
    { id: 'all', label: 'All Issues', count: 15 },
    { id: 'reported', label: 'Reported', count: 5 },
    { id: 'in-progress', label: 'In Progress', count: 4 },
    { id: 'resolved', label: 'Resolved', count: 6 }
  ];

  const getMarkerColor = (status: string, urgency: string) => {
    if (status === 'resolved') return '#10B981';
    if (urgency === 'high') return '#EF4444';
    if (urgency === 'medium') return '#F59E0B';
    return '#4FD1C7';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return '#F59E0B';
      case 'acknowledged': return '#4FD1C7';
      case 'in-progress': return '#3B82F6';
      case 'resolved': return '#10B981';
      default: return '#6B7280';
    }
  };

  const filteredIssues = selectedFilter === 'all' 
    ? mapIssues 
    : mapIssues.filter(issue => issue.status === selectedFilter);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4FD1C7" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Issue Map</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filterOptions.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                selectedFilter === filter.id && styles.filterTabActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterTabText,
                selectedFilter === filter.id && styles.filterTabTextActive
              ]}>
                {filter.label}
              </Text>
              <View style={[
                styles.filterCount,
                selectedFilter === filter.id && styles.filterCountActive
              ]}>
                <Text style={[
                  styles.filterCountText,
                  selectedFilter === filter.id && styles.filterCountTextActive
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        {/* Map Background */}
        <View style={styles.mapBackground}>
          <View style={styles.mapGrid} />
          
          {/* Street Labels */}
          <Text style={[styles.streetLabel, { top: '15%', left: '10%' }]}>Oak Street</Text>
          <Text style={[styles.streetLabel, { top: '45%', left: '5%' }]}>Main Street</Text>
          <Text style={[styles.streetLabel, { top: '75%', left: '15%' }]}>Park Avenue</Text>
          
          {/* Issue Markers */}
          {filteredIssues.map(issue => (
            <TouchableOpacity
              key={issue.id}
              style={[
                styles.issueMarker,
                {
                  position: 'absolute',
                  left: issue.position.x,
                  top: issue.position.y,
                  backgroundColor: getMarkerColor(issue.status, issue.urgency)
                } as any
              ]}
              onPress={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
            >
              <Ionicons name="location" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>High Priority</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Medium Priority</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4FD1C7' }]} />
            <Text style={styles.legendText}>Low Priority</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Resolved</Text>
          </View>
        </View>
      </View>

      {/* Issue Details Card */}
      {selectedIssue && (
        <View style={styles.issueCard}>
          {(() => {
            const issue = mapIssues.find(i => i.id === selectedIssue);
            return issue ? (
              <View style={styles.issueCardContent}>
                <Image source={issue.image} style={styles.issueImage} />
                <View style={styles.issueInfo}>
                  <View style={styles.issueHeader}>
                    <Text style={styles.issueTitle}>{issue.title}</Text>
                    <TouchableOpacity onPress={() => setSelectedIssue(null)}>
                      <Ionicons name="close" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.issueStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
                      <Text style={styles.statusText}>{issue.status.replace('-', ' ')}</Text>
                    </View>
                    <View style={styles.urgencyBadge}>
                      <Text style={styles.urgencyText}>{issue.urgency} priority</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.viewDetailsButton}
                    onPress={() => (navigation as any).navigate('IssueDetails', { issueId: issue.id })}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={16} color="#4FD1C7" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null;
          })()}
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => (navigation as any).navigate('ReportIssue')}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#4FD1C7',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  searchButton: {
    padding: 4,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#4FD1C7',
  },
  filterTabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginRight: 8,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  filterCount: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: '#FFFFFF',
  },
  filterCountText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterCountTextActive: {
    color: '#4FD1C7',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  mapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
    backgroundSize: '50px 50px',
  },
  streetLabel: {
    position: 'absolute',
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  issueMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  legend: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  issueCard: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  issueCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  issueImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  issueInfo: {
    flex: 1,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  issueStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#4FD1C7',
    fontWeight: '500',
    marginRight: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4FD1C7',
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
});

export default MapViewScreen;

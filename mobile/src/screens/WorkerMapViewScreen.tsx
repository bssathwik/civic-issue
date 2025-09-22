import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Mock MapView component - replace with actual map implementation
const MapView = ({ style, region, onRegionChange, children }: any) => (
  <View style={[style, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
    <Text style={{ color: '#6B7280', fontSize: 16 }}>Map View Placeholder</Text>
    <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>
      Integrate with MapBox or Google Maps
    </Text>
    {children}
  </View>
);

const Marker = ({ coordinate, onPress, children }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.markerContainer}>
    {children}
  </TouchableOpacity>
);

interface IssueLocation {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance?: number; // in km
  estimatedTime: string;
  category: string;
}

// Mock data for demonstration
const MOCK_ISSUES: IssueLocation[] = [
  {
    id: 1,
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues',
    status: 'open',
    priority: 'high',
    location: 'Main St, Block A',
    coordinates: { latitude: 40.7138, longitude: -74.0070 },
    distance: 0.8,
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
    coordinates: { latitude: 40.7118, longitude: -74.0050 },
    distance: 1.2,
    estimatedTime: '1 hour',
    category: 'Electrical',
  },
  {
    id: 3,
    title: 'Graffiti Removal',
    description: 'Graffiti on public building wall',
    status: 'open',
    priority: 'low',
    location: 'City Hall, South Wall',
    coordinates: { latitude: 40.7108, longitude: -74.0080 },
    distance: 2.1,
    estimatedTime: '30 minutes',
    category: 'Cleaning',
  },
];

const WorkerMapViewScreen = () => {
  const navigation = useNavigation<any>();

  // State management
  const [issues, setIssues] = useState<IssueLocation[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<IssueLocation | null>(null);
  const [currentLocation] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
  });
  const [mapRegion, setMapRegion] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const loadNearbyIssues = React.useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/worker/issues/nearby', {
      //   params: { lat: currentLocation.latitude, lng: currentLocation.longitude }
      // });
      // setIssues(response.data);
      
      // Using mock data for now
      setTimeout(() => {
        setIssues(MOCK_ISSUES);
      }, 1000);
    } catch (error) {
      console.error('Failed to load nearby issues:', error);
      Alert.alert('Error', 'Failed to load nearby issues');
    }
  }, []);

  useEffect(() => {
    loadNearbyIssues();
    getCurrentLocation();
  }, [loadNearbyIssues]);

  const getCurrentLocation = async () => {
    try {
      // TODO: Implement actual geolocation
      // const position = await Location.getCurrentPositionAsync({});
      // const { latitude, longitude } = position.coords;
      // setCurrentLocation({ latitude, longitude });
      // setMapRegion(prev => ({ ...prev, latitude, longitude }));
      
      console.log('Getting current location...');
    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert('Location Error', 'Could not get your current location');
    }
  };

  const navigateToIssue = (issue: IssueLocation) => {
    // TODO: Implement navigation using maps app
    Alert.alert(
      'Navigate to Issue',
      `Start navigation to ${issue.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Navigate', 
          onPress: () => {
            console.log(`Navigate to: ${issue.coordinates.latitude}, ${issue.coordinates.longitude}`);
            // You can use Linking to open maps app:
            // const url = `https://maps.google.com/maps?daddr=${issue.coordinates.latitude},${issue.coordinates.longitude}`;
            // Linking.openURL(url);
          }
        },
      ]
    );
  };

  const openIssueDetails = (issue: IssueLocation) => {
    setSelectedIssue(issue);
    setDetailsModalVisible(true);
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

  const getMarkerIcon = (status: string) => {
    switch (status) {
      case 'open': return 'alert-circle';
      case 'in-progress': return 'build';
      case 'resolved': return 'checkmark-circle';
      default: return 'location';
    }
  };

  const filteredIssues = issues.filter(issue => 
    filterStatus === 'all' || issue.status === filterStatus
  );

  const renderIssueMarker = (issue: IssueLocation) => (
    <Marker
      key={issue.id}
      coordinate={issue.coordinates}
      onPress={() => openIssueDetails(issue)}
    >
      <View style={[styles.markerContainer, { borderColor: getPriorityColor(issue.priority) }]}>
        <Ionicons 
          name={getMarkerIcon(issue.status) as any} 
          size={20} 
          color={getStatusColor(issue.status)} 
        />
      </View>
    </Marker>
  );

  const renderIssueItem = ({ item }: { item: IssueLocation }) => (
    <TouchableOpacity
      style={styles.issueItem}
      onPress={() => openIssueDetails(item)}
    >
      <View style={styles.issueHeader}>
        <Text style={styles.issueTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.issueLocation}>{item.location}</Text>
      
      <View style={styles.issueFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.replace('-', ' ').toUpperCase()}</Text>
        </View>
        <Text style={styles.distanceText}>{item.distance} km away</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6366F1" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Nearby Issues</Text>
          <Text style={styles.headerSubtitle}>{filteredIssues.length} issues found</Text>
        </View>
        
        <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
          <Ionicons name="navigate" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'open', 'in-progress', 'resolved'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTab,
              filterStatus === status && styles.filterTabActive
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterStatus === status && styles.filterTabTextActive
              ]}
            >
              {status === 'all' ? 'All' : status.replace('-', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChange={setMapRegion}
        >
          {/* Current Location Marker */}
          <Marker coordinate={currentLocation}>
            <View style={styles.currentLocationMarker}>
              <Ionicons name="person" size={16} color="#FFF" />
            </View>
          </Marker>
          
          {/* Issue Markers */}
          {filteredIssues.map(renderIssueMarker)}
        </MapView>
      </View>

      {/* Issues List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Issues List</Text>
        <FlatList
          data={filteredIssues}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderIssueItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Issue Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedIssue && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedIssue.title}</Text>
                  <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalBody}>
                  <Text style={styles.modalDescription}>{selectedIssue.description}</Text>
                  
                  <View style={styles.modalDetails}>
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="location" size={16} color="#6B7280" />
                      <Text style={styles.modalDetailText}>{selectedIssue.location}</Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="time" size={16} color="#6B7280" />
                      <Text style={styles.modalDetailText}>Est: {selectedIssue.estimatedTime}</Text>
                    </View>
                    
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="navigate" size={16} color="#6B7280" />
                      <Text style={styles.modalDetailText}>{selectedIssue.distance} km away</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalBadges}>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedIssue.priority) }]}>
                      <Text style={styles.priorityText}>{selectedIssue.priority.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedIssue.status) }]}>
                      <Text style={styles.statusText}>{selectedIssue.status.replace('-', ' ').toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.navigateButton}
                    onPress={() => {
                      setDetailsModalVisible(false);
                      navigateToIssue(selectedIssue);
                    }}
                  >
                    <Ionicons name="navigate" size={20} color="#FFF" />
                    <Text style={styles.navigateButtonText}>Navigate</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => {
                      setDetailsModalVisible(false);
                      navigation.navigate('WorkerIssueDetails', { issueId: selectedIssue.id });
                    }}
                  >
                    <Text style={styles.viewDetailsButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  locationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  filterContainer: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterTabActive: {
    backgroundColor: '#FFF',
  },
  filterTabText: {
    fontSize: 14,
    color: '#E0E7FF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  filterTabTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  currentLocationMarker: {
    backgroundColor: '#6366F1',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  listContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  issueItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    width: 200,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFF',
  },
  issueLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  issueFooter: {
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
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  distanceText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 16,
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  modalDetails: {
    marginBottom: 16,
    gap: 8,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  navigateButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  navigateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewDetailsButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkerMapViewScreen;

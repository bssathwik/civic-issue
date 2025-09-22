import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { useReports } from '../context/ReportsContext';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES } from '../services/issueService';

const ReportIssueScreen = () => {
  const navigation = useNavigation<any>();
  const { createIssue } = useReports();

  // Form state
  const [selectedCategory, setSelectedCategory] = useState(ISSUE_CATEGORIES[0].id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState('Fetching current location...');
  const [mapVisible, setMapVisible] = useState(false);
  const [pinLocation, setPinLocation] = useState({ latitude: 37.78825, longitude: -122.4324 });
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // Fetch current location on component mount
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setIsLocationLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to fetch your current location.');
          setLocation('Location permission denied');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = currentLocation.coords;
        setPinLocation({ latitude, longitude });
        
        // Get address from coordinates
        const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (addresses.length > 0) {
          const address = addresses[0];
          const fullAddress = `${address.name || ''} ${address.street || ''}, ${address.city || ''}`.trim();
          setLocation(fullAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } else {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } catch (error) {
        console.error('Error fetching location:', error);
        setLocation('Unable to fetch location');
      } finally {
        setIsLocationLoading(false);
      }
    };

    fetchLocation();
  }, []);

  // Image picker handler
  const handleAddPhoto = async () => {
    if (photos.length >= 1) {
      Alert.alert('Replace Photo', 'You already have a photo. Do you want to replace it?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Replace',
          onPress: () => {
            setPhotos([]);
            setTimeout(() => selectPhoto(), 100);
          },
        },
      ]);
      return;
    }

    selectPhoto();
  };

  const selectPhoto = async () => {

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Camera permission is required to add a photo.');
      return;
    }

    Alert.alert('Add Photo', 'Choose an option', [
      {
        text: 'Camera',
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            allowsEditing: true,
            aspect: [4, 3],
          });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhotos([result.assets[0].uri]);
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            allowsEditing: true,
            aspect: [4, 3],
          });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhotos([result.assets[0].uri]);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Remove photo handler
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Location picker handler
  const handleEditLocation = () => {
    setMapVisible(true);
  };

  const handleMapConfirm = async () => {
    try {
      const addresses = await Location.reverseGeocodeAsync(pinLocation);
      if (addresses.length > 0) {
        const address = addresses[0];
        const fullAddress = `${address.name || ''} ${address.street || ''}, ${address.city || ''}`.trim();
        setLocation(fullAddress || `${pinLocation.latitude.toFixed(4)}, ${pinLocation.longitude.toFixed(4)}`);
      } else {
        setLocation(`${pinLocation.latitude.toFixed(4)}, ${pinLocation.longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setLocation(`${pinLocation.latitude.toFixed(4)}, ${pinLocation.longitude.toFixed(4)}`);
    }
    setMapVisible(false);
  };

  // Form validation
  const validateForm = (): string | null => {
    if (!title.trim()) {
      return 'Please enter a title for the issue';
    }
    if (title.trim().length < 10) {
      return 'Title must be at least 10 characters long';
    }
    if (!description.trim()) {
      return 'Please enter a description of the issue';
    }
    if (description.trim().length < 20) {
      return 'Description must be at least 20 characters long';
    }
    return null;
  };

  // Submit handler
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      const issueData = {
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory,
        priority,
        location: {
          type: 'Point' as const,
          coordinates: [pinLocation.longitude, pinLocation.latitude] as [number, number],
        },
        address: location,
        images: photos,
        isAnonymous: false,
        visibility: 'public' as const,
      };

      const result = await createIssue(issueData);
      
      if (result.success && result.data) {
        const issueNumber = result.data.issueNumber || result.data._id;
        Alert.alert(
          'Success!', 
          `Your issue has been reported successfully!\n\nIssue ID: ${issueNumber}\n\nYou can track its progress in "My Reports" section.`,
          [
            {
              text: 'View My Reports',
              onPress: () => {
                // Navigate back to the tab navigator and select MyReports tab
                navigation.navigate('MyReports' as any);
              },
            },
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to submit report. Please try again.');
      }
    } catch (error: any) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4FD1C7" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report a New Issue</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Title Input Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Issue Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter a clear, descriptive title (e.g., 'Pothole on Main Street')"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            multiline={false}
          />
          <Text style={styles.characterCount}>{title.length}/100</Text>
        </View>

        {/* Photo Section */}
        <View style={styles.photoCard}>
          <Text style={styles.cardTitle}>Photos (Optional)</Text>
          <View style={styles.photoContainer}>
            {photos.length === 0 ? (
              <View style={styles.photoPlaceholder}>
                <View style={styles.logoContainer}>
                  <Ionicons name="location" size={40} color="#4FD1C7" />
                  <Text style={styles.logoText}>CivicConnect</Text>
                </View>
              </View>
            ) : (
              <View style={styles.photoItem}>
                <Image source={{ uri: photos[0] }} style={styles.photo} />
                <TouchableOpacity 
                  style={styles.removePhotoBtn}
                  onPress={() => removePhoto(0)}
                >
                  <Ionicons name="close-circle" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto}>
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.addPhotoText}>
                {photos.length === 0 ? '+ Add Photo' : 'Photo Added'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Issue Category</Text>
          <View style={styles.categoryContainer}>
            {ISSUE_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categorySelected
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View style={styles.categoryIconContainer}>
                  <Ionicons name={category.icon as any} size={28} color={selectedCategory === category.id ? '#FFFFFF' : '#4FD1C7'} />
                </View>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextSelected
                ]}>
                  {category.label}
                </Text>
                {selectedCategory === category.id && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Priority Level</Text>
          <View style={styles.priorityContainer}>
            {ISSUE_PRIORITIES.map(priorityOption => (
              <TouchableOpacity
                key={priorityOption.id}
                style={[
                  styles.priorityButton,
                  { borderColor: priorityOption.color },
                  priority === priorityOption.id && { backgroundColor: priorityOption.color }
                ]}
                onPress={() => setPriority(priorityOption.id as any)}
              >
                <Text style={[
                  styles.priorityText,
                  { color: priority === priorityOption.id ? '#FFFFFF' : priorityOption.color }
                ]}>
                  {priorityOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location</Text>
          <View style={styles.locationRow}>
            <View style={styles.locationIconContainer}>
              <Ionicons name="location" size={20} color="#4FD1C7" />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>
                {isLocationLoading ? 'Getting your location...' : 'Current location:'}
              </Text>
              <Text style={styles.locationValue}>
                {isLocationLoading ? 'Please wait...' : location}
              </Text>
            </View>
            <TouchableOpacity style={styles.editLocationBtn} onPress={handleEditLocation}>
              <Text style={styles.editLocationText}>Edit Location</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Large pothole causing traffic issues. Needs immediate repair."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Map Modal */}
      <Modal visible={mapVisible} animationType="slide">
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: pinLocation.latitude,
              longitude: pinLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={(e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => setPinLocation(e.nativeEvent.coordinate)}
          >
            <Marker coordinate={pinLocation} />
          </MapView>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleMapConfirm}>
            <Text style={styles.confirmText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  header: {
    backgroundColor: '#4FD1C7',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  
  // Photo Card Styles
  photoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    opacity: 0.7,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4FD1C7',
    marginTop: 8,
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 16,
  },
  cameraIconContainer: {
    marginRight: 8,
  },
  addPhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  
  // Location Styles
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  editLocationBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  editLocationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4FD1C7',
  },
  
  // Issue Type Styles
  issueTypeContainer: {
    gap: 12,
  },
  
  // Category Selection Styles
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  categorySelected: {
    backgroundColor: '#4FD1C7',
    borderColor: '#4FD1C7',
  },
  categoryIconContainer: {
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  issueTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  issueTypeSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#4FD1C7',
  },
  issueTypeImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  issueTypeInfo: {
    flex: 1,
  },
  issueTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  issueTypeSublabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4FD1C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Description Styles
  descriptionInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  
  // Title Input Styles
  titleInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontWeight: '500',
  },
  
  // Character Count
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  
  // Photo Scroll
  photoScroll: {
    marginBottom: 16,
  },
  
  // Photo Item
  photoItem: {
    position: 'relative',
    width: '100%',
    marginBottom: 16,
  },
  
  // Remove Photo Button
  removePhotoBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Selected Badge
  selectedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#10B981',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Priority Container
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  // Priority Button
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  
  // Priority Text
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 6,
  },
  
  // Submit Button
  submitBtn: {
    backgroundColor: '#4FD1C7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
    shadowColor: '#4FD1C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Map Modal Styles
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '80%',
  },
  confirmBtn: {
    backgroundColor: '#4FD1C7',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#4FD1C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportIssueScreen;

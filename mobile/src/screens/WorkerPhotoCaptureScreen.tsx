import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

interface PhotoData {
  id: string;
  uri: string;
  type: 'before' | 'progress' | 'after';
  timestamp: Date;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  compressed?: boolean;
  size?: number; // in bytes
}

// Mock data for demonstration
const MOCK_PHOTOS: PhotoData[] = [
  {
    id: '1',
    uri: 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Before+Photo',
    type: 'before',
    timestamp: new Date(Date.now() - 3600000),
    description: 'Initial state of pothole',
    size: 1.2,
  },
  {
    id: '2',
    uri: 'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Progress+Photo',
    type: 'progress',
    timestamp: new Date(Date.now() - 1800000),
    description: 'Preparation work in progress',
    size: 1.5,
  },
];

const WorkerPhotoCaptureScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { issueTitle } = route.params || { issueTitle: 'Sample Issue' };

  // State management
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [captureModalVisible, setCaptureModalVisible] = useState(false);
  const [photoType, setPhotoType] = useState<'before' | 'progress' | 'after'>('progress');
  const [photoDescription, setPhotoDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storageInfo, setStorageInfo] = useState({ used: 0, limit: 50 }); // MB

  const loadPhotos = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/worker/issues/${issueId}/photos`);
      // setPhotos(response.data);
      
      // Using mock data for now
      setPhotos(MOCK_PHOTOS);
    } catch (error) {
      console.error('Failed to load photos:', error);
      Alert.alert('Error', 'Failed to load photos');
    }
  }, []);

  const calculateStorageUsage = useCallback(() => {
    const totalSize = photos.reduce((sum, photo) => sum + (photo.size || 0), 0);
    setStorageInfo(prev => ({ ...prev, used: totalSize }));
  }, [photos]);

  useEffect(() => {
    loadPhotos();
    calculateStorageUsage();
  }, [loadPhotos, calculateStorageUsage]);

  const takePhoto = async (type: 'before' | 'progress' | 'after') => {
    try {
      // TODO: Implement actual camera functionality
      // import * as ImagePicker from 'expo-image-picker';
      // const permission = await ImagePicker.requestCameraPermissionsAsync();
      // if (!permission.granted) {
      //   Alert.alert('Permission Required', 'Camera permission is needed to take photos');
      //   return;
      // }
      
      // const result = await ImagePicker.launchCameraAsync({
      //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //   allowsEditing: true,
      //   aspect: [16, 12],
      //   quality: 0.8,
      // });
      
      // if (!result.canceled && result.assets[0]) {
      //   const photo = result.assets[0];
      //   const compressedPhoto = await compressImage(photo.uri);
      //   addPhotoToCollection(compressedPhoto, type);
      // }
      
      // Mock photo capture for demonstration
      const mockPhotoUri = getPlaceholderImage(type);
      const newPhoto: PhotoData = {
        id: Date.now().toString(),
        uri: mockPhotoUri,
        type: type,
        timestamp: new Date(),
        description: photoDescription,
        size: Math.random() * 2 + 0.5, // Random size between 0.5-2.5 MB
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
        compressed: true,
      };
      
      setPhotos(prev => [...prev, newPhoto]);
      setPhotoDescription('');
      setCaptureModalVisible(false);
      
      Alert.alert('Success', 'Photo captured successfully!');
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const selectFromGallery = async (type: 'before' | 'progress' | 'after') => {
    try {
      // TODO: Implement actual gallery selection
      // const result = await ImagePicker.launchImageLibraryAsync({
      //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //   allowsEditing: true,
      //   aspect: [16, 12],
      //   quality: 0.8,
      //   allowsMultipleSelection: true,
      // });
      
      // Mock gallery selection for demonstration
      const mockPhotoUri = getPlaceholderImage(type);
      const newPhoto: PhotoData = {
        id: Date.now().toString(),
        uri: mockPhotoUri,
        type: type,
        timestamp: new Date(),
        description: photoDescription,
        size: Math.random() * 2 + 0.5,
        compressed: true,
      };
      
      setPhotos(prev => [...prev, newPhoto]);
      setPhotoDescription('');
      setCaptureModalVisible(false);
      
      Alert.alert('Success', 'Photo selected successfully!');
    } catch (error) {
      console.error('Failed to select photo:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  const getPlaceholderImage = (type: 'before' | 'progress' | 'after') => {
    const colors = {
      before: 'FF6B6B',
      progress: '4ECDC4',
      after: '45B7D1',
    };
    return `https://via.placeholder.com/400x300/${colors[type]}/FFFFFF?text=${type.charAt(0).toUpperCase() + type.slice(1)}+Photo`;
  };

  const deletePhoto = (photoId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPhotos(prev => prev.filter(photo => photo.id !== photoId));
            setPhotoModalVisible(false);
          },
        },
      ]
    );
  };

  const uploadPhotos = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // TODO: Implement actual upload with progress tracking
      // for (let i = 0; i < photos.length; i++) {
      //   const photo = photos[i];
      //   await uploadSinglePhoto(photo);
      //   setUploadProgress(((i + 1) / photos.length) * 100);
      // }
      
      // Mock upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      Alert.alert('Success', 'All photos uploaded successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to upload photos:', error);
      Alert.alert('Upload Error', 'Failed to upload some photos. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getTypeColor = (type: 'before' | 'progress' | 'after') => {
    switch (type) {
      case 'before': return '#EF4444';
      case 'progress': return '#F59E0B';
      case 'after': return '#10B981';
    }
  };

  const getTypeIcon = (type: 'before' | 'progress' | 'after') => {
    switch (type) {
      case 'before': return 'play-back';
      case 'progress': return 'build';
      case 'after': return 'checkmark-circle';
    }
  };

  const groupedPhotos = photos.reduce((acc, photo) => {
    if (!acc[photo.type]) acc[photo.type] = [];
    acc[photo.type].push(photo);
    return acc;
  }, {} as Record<string, PhotoData[]>);

  const renderPhotoItem = (photo: PhotoData) => (
    <TouchableOpacity
      key={photo.id}
      style={styles.photoItem}
      onPress={() => {
        setSelectedPhoto(photo);
        setPhotoModalVisible(true);
      }}
    >
      <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
      <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(photo.type) }]}>
        <Ionicons name={getTypeIcon(photo.type) as any} size={12} color="#FFF" />
      </View>
      <View style={styles.photoOverlay}>
        <Text style={styles.photoTime}>
          {photo.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderPhotoSection = (type: 'before' | 'progress' | 'after') => {
    const sectionPhotos = groupedPhotos[type] || [];
    
    return (
      <View key={type} style={styles.photoSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons 
              name={getTypeIcon(type) as any} 
              size={20} 
              color={getTypeColor(type)} 
            />
            <Text style={[styles.sectionTitle, { color: getTypeColor(type) }]}>
              {type.charAt(0).toUpperCase() + type.slice(1)} Photos
            </Text>
            <View style={[styles.photoCount, { backgroundColor: getTypeColor(type) }]}>
              <Text style={styles.photoCountText}>{sectionPhotos.length}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.addPhotoButton, { backgroundColor: getTypeColor(type) }]}
            onPress={() => {
              setPhotoType(type);
              setCaptureModalVisible(true);
            }}
          >
            <Ionicons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        {sectionPhotos.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoList}
          >
            {sectionPhotos.map(renderPhotoItem)}
          </ScrollView>
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="camera-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No {type} photos yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add photos</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6366F1" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Photo Documentation</Text>
          <Text style={styles.headerSubtitle}>{issueTitle}</Text>
        </View>
        <TouchableOpacity style={styles.uploadButton} onPress={uploadPhotos} disabled={isUploading}>
          <Ionicons name="cloud-upload" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Storage Info */}
      <View style={styles.storageInfo}>
        <View style={styles.storageBar}>
          <View 
            style={[
              styles.storageProgress, 
              { 
                width: `${(storageInfo.used / storageInfo.limit) * 100}%`,
                backgroundColor: storageInfo.used > storageInfo.limit * 0.8 ? '#EF4444' : '#6366F1'
              }
            ]} 
          />
        </View>
        <Text style={styles.storageText}>
          {storageInfo.used.toFixed(1)} / {storageInfo.limit} MB used • {photos.length} photos
        </Text>
      </View>

      {/* Photo Sections */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {['before', 'progress', 'after'].map(type => 
          renderPhotoSection(type as 'before' | 'progress' | 'after')
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Upload Progress Modal */}
      {isUploading && (
        <Modal visible={isUploading} transparent>
          <View style={styles.uploadModalOverlay}>
            <View style={styles.uploadModal}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.uploadTitle}>Uploading Photos...</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Photo Capture Modal */}
      <Modal
        visible={captureModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCaptureModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.captureModal}>
            <View style={styles.captureHeader}>
              <Text style={styles.captureTitle}>Add {photoType} Photo</Text>
              <TouchableOpacity onPress={() => setCaptureModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add description (optional)"
              value={photoDescription}
              onChangeText={setPhotoDescription}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.captureActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => takePhoto(photoType)}
              >
                <Ionicons name="camera" size={24} color="#6366F1" />
                <Text style={styles.actionText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => selectFromGallery(photoType)}
              >
                <Ionicons name="images" size={24} color="#6366F1" />
                <Text style={styles.actionText}>From Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Photo View Modal */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.photoModalOverlay}>
          {selectedPhoto && (
            <>
              <TouchableOpacity 
                style={styles.photoModalClose}
                onPress={() => setPhotoModalVisible(false)}
              >
                <Ionicons name="close" size={30} color="#FFF" />
              </TouchableOpacity>
              
              <Image source={{ uri: selectedPhoto.uri }} style={styles.fullPhoto} />
              
              <View style={styles.photoDetails}>
                <View style={styles.photoMeta}>
                  <View style={[styles.typeTag, { backgroundColor: getTypeColor(selectedPhoto.type) }]}>
                    <Ionicons name={getTypeIcon(selectedPhoto.type) as any} size={16} color="#FFF" />
                    <Text style={styles.typeTagText}>{selectedPhoto.type.toUpperCase()}</Text>
                  </View>
                  
                  <Text style={styles.photoTimestamp}>
                    {selectedPhoto.timestamp.toLocaleString()}
                  </Text>
                </View>
                
                {selectedPhoto.description && (
                  <Text style={styles.photoDescription}>{selectedPhoto.description}</Text>
                )}
                
                <View style={styles.photoActions}>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deletePhoto(selectedPhoto.id)}
                  >
                    <Ionicons name="trash" size={20} color="#EF4444" />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
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
  header: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 2,
  },
  uploadButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  storageInfo: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  storageBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  storageProgress: {
    height: '100%',
    borderRadius: 2,
  },
  storageText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  photoSection: {
    backgroundColor: '#FFF',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  photoCount: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  photoCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addPhotoButton: {
    borderRadius: 20,
    padding: 8,
  },
  photoList: {
    paddingRight: 16,
  },
  photoItem: {
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbnail: {
    width: 120,
    height: 90,
    backgroundColor: '#F3F4F6',
  },
  typeIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: 12,
    padding: 4,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  photoTime: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '500',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  bottomSpacer: {
    height: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  captureModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  captureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  captureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  descriptionInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    margin: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  captureActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginTop: 8,
  },
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  photoModalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  fullPhoto: {
    width: width,
    height: height * 0.6,
    resizeMode: 'contain',
  },
  photoDetails: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  photoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  photoTimestamp: {
    fontSize: 14,
    color: '#6B7280',
  },
  photoDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  photoActions: {
    alignItems: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    gap: 8,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  uploadModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadModal: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 250,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
});

export default WorkerPhotoCaptureScreen;

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useReports } from '../context/ReportsContext';

const issueTypes = [
  { id: 1, label: 'Roads & Potholes', image: require('../assets/city-skyline.png') },
  { id: 2, label: 'Graffiti', image: require('../assets/city-skyline.png') },
  { id: 3, label: 'Trash Sanitation', image: require('../assets/city-skyline.png') },
];

const ReportIssueScreen = () => {
  const { addReport } = useReports();

  const [selectedType, setSelectedType] = useState(1);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState('Fetching current location...');
  const [mapVisible, setMapVisible] = useState(false);
  const [pinLocation, setPinLocation] = useState({ latitude: 37.78825, longitude: -122.4324 });

  // Fetch current location on component mount
  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to fetch your current location.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;
      setPinLocation({ latitude, longitude });
      setLocation(`Lat: ${latitude}, Lng: ${longitude}`);
    };

    fetchLocation();
  }, []);

  // Image picker handler
  const handleAddPhoto = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Camera permission is required to add a photo.');
      return;
    }
    Alert.alert('Add Photo', 'Choose an option', [
      {
        text: 'Camera',
        onPress: async () => {
          let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhoto(result.assets[0].uri);
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhoto(result.assets[0].uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Location picker handler
  const handleEditLocation = async () => {
    setMapVisible(true);
  };

  const handleMapConfirm = () => {
    setLocation(`Lat: ${pinLocation.latitude}, Lng: ${pinLocation.longitude}`);
    setMapVisible(false);
  };
  const handleSubmit = () => {
    const newReport = {
      id: Date.now(),
      type: issueTypes.find(type => type.id === selectedType)?.label || 'Unknown',
      description,
      photo,
      location,
      latitude: pinLocation.latitude, // Include latitude
      longitude: pinLocation.longitude, // Include longitude
    };

    addReport(newReport);
    Alert.alert('Success', 'Your report has been submitted!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.header}>Report a New Issue</Text>
      <View style={styles.photoSection}>
        <Image
          source={photo ? { uri: photo } : require('../assets/city-skyline.png')}
          style={styles.photo}
        />
        <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto}>
          <Image source={require('../assets/icon.png')} style={styles.cameraIcon} />
          <Text style={styles.addPhotoText}>+ Add Photo</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <View style={styles.locationRow}>
          <Image source={require('../assets/adaptive-icon.png')} style={styles.locationIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>Auto-located:</Text>
            <Text style={styles.cardValue}>{location}</Text>
          </View>
          <TouchableOpacity style={styles.editLocationBtn} onPress={handleEditLocation}>
            <Text style={styles.editLocationText}>Edit Location</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Issue Type</Text>
        <View style={styles.issueTypeRow}>
          {issueTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[styles.issueTypeBtn, selectedType === type.id && styles.issueTypeSelected]}
              onPress={() => setSelectedType(type.id)}
            >
              <Image source={type.image} style={styles.issueTypeImage} />
              <Text style={styles.issueTypeText}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Describe the issue..."
          multiline
          value={description}
          onChangeText={setDescription}
        />
      </View>
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Report</Text>
      </TouchableOpacity>

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 18,
    alignSelf: 'center',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  photo: {
    width: 220,
    height: 140,
    borderRadius: 16,
    marginBottom: -28,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2979ff',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 12,
    elevation: 2,
  },
  cameraIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
    tintColor: '#fff',
  },
  addPhotoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    elevation: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    color: '#555',
  },
  editLocationBtn: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  editLocationText: {
    color: '#1976d2',
    fontWeight: '600',
    fontSize: 13,
  },
  issueTypeRow: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  issueTypeBtn: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f6f8fa',
    width: 90,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  issueTypeSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  issueTypeImage: {
    width: 32,
    height: 32,
    marginBottom: 4,
    borderRadius: 6,
  },
  issueTypeText: {
    fontSize: 13,
    color: '#222',
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f6f8fa',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 60,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  submitBtn: {
    backgroundColor: '#26c6da',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
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
    backgroundColor: '#26c6da',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default ReportIssueScreen;

import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { AppStackParamList } from '../navigation/AppNavigator';

type WorkerScreenProps = StackScreenProps<AppStackParamList, 'WorkerScreen'>;

const WorkerScreen: React.FC<WorkerScreenProps> = ({ route }) => {
  const { reportId, latitude, longitude } = route.params; // Accept latitude and longitude from route params
  const [mapVisible, setMapVisible] = useState(false);

  const taskLocation = {
    latitude: latitude ,//|| 37.78825, // Use provided latitude or fallback to default
    longitude: longitude, //|| -122.4324, // Use provided longitude or fallback to default
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Worker Screen</Text>
      <Text style={styles.text}>Report ID: {reportId}</Text>

      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => setMapVisible(true)}
      >
        <Text style={styles.mapButtonText}>View Map</Text>
      </TouchableOpacity>

      {mapVisible && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: taskLocation.latitude,
            longitude: taskLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker coordinate={taskLocation} />
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f8fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#555',
  },
  mapButton: {
    backgroundColor: '#26c6da',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  map: {
    width: '100%',
    height: '50%',
    marginTop: 20,
  },
});

export default WorkerScreen;

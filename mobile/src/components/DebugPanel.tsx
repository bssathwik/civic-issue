// Quick Debug Screen - Add this to any screen to test different features
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DebugPanelProps {
  navigation?: any;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ navigation }) => {
  const { logout } = useAuth();

  const clearAuth = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      Alert.alert('Success', 'Authentication data cleared! The app will restart from the beginning.');
      // Force app restart by reloading
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'StartingScreen' }],
        });
      }
    } catch {
      Alert.alert('Error', 'Failed to clear auth data');
    }
  };

  const testWorkerFeatures = () => {
    if (navigation) {
      // Navigate to WorkerScreen with sample data
      navigation.navigate('WorkerScreen', {
        reportId: 123,
        latitude: 37.78825,
        longitude: -122.4324
      });
    }
  };

  const checkCurrentUser = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const userData = await AsyncStorage.getItem('user');
    
    let userInfo = 'Not logged in';
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        userInfo = `Role: ${parsed.role}\nEmail: ${parsed.email}`;
      } catch {
        userInfo = 'Invalid user data';
      }
    }
    
    Alert.alert('Current User Info', `Token: ${token ? 'Yes' : 'No'}\n${userInfo}`);
  };

  return (
    <View style={styles.debugPanel}>
      <Text style={styles.debugTitle}>🛠️ Debug Panel</Text>
      
      <TouchableOpacity style={styles.debugButton} onPress={checkCurrentUser}>
        <Text style={styles.debugButtonText}>Check Current User</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.debugButton} onPress={clearAuth}>
        <Text style={styles.debugButtonText}>Reset to Starting Screen</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.debugButton} onPress={testWorkerFeatures}>
        <Text style={styles.debugButtonText}>Test Worker Features</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.debugButton} onPress={logout}>
        <Text style={styles.debugButtonText}>Logout (Proper)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  debugPanel: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  debugButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 3,
  },
  debugButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
  },
});

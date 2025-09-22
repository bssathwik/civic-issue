import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { apiClient } from '../services/api';

interface NavigationProps {
  navigate: (screen: string) => void;
}

const StartingScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showIPInput, setShowIPInput] = useState(false);
  const [customIP, setCustomIP] = useState('');

  const testConnectionWithCustomIP = () => {
    Alert.prompt(
      'Manual IP Configuration',
      'Current setup: 192.168.10.41:3000 (Real Backend + MongoDB)\nEnter a different IP if needed:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Test',
          onPress: async (ip: string | undefined) => {
            if (!ip || !ip.trim()) return;
            
            setIsTestingConnection(true);
            try {
              const testUrl = `http://${ip.trim()}:3001/api/health`;
              console.log(`🧪 Testing custom IP: ${testUrl}`);
              
              const response = await fetch(testUrl, {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
              });
              
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
              
              const data = await response.json();
              Alert.alert(
                'Manual IP Test Success! ✅',
                `Connected to: ${testUrl}\n\nServer Response: ${data.message}\n\nUpdate your API configuration if this IP works better.`
              );
            } catch (error: any) {
              Alert.alert(
                'Manual IP Test Failed ❌',
                `Could not connect to: http://${ip.trim()}:3001/api/health\n\nError: ${error.message}\n\nTry a different IP address.`
              );
            } finally {
              setIsTestingConnection(false);
            }
          },
        },
      ],
      'plain-text',
      '192.168.10.41'
    );
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const response = await apiClient.healthCheck();
      Alert.alert(
        'Auto Connection Success! ✅', 
        `Server is running and accessible!\n\nServer Message: ${response.message}\nTimestamp: ${new Date(response.timestamp).toLocaleString()}`
      );
    } catch (error: any) {
      Alert.alert(
        'Auto Connection Failed ❌', 
        `${error.message}\n\n📱 Current setup:\n• Computer IP: 192.168.10.41\n• API URL: http://192.168.10.41:3000/api\n• Status: REAL BACKEND + MongoDB\n• Make sure backend is running with 'npm run dev'\n\nTry "Manual IP Test" if needed.`
      );
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/city-skyline.png')} // Replace with the actual path to your city skyline image
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>CityPulse</Text>
          <Text style={styles.subtitle}>Your City, Your Voice</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('LoginScreen')}
          >
            <Icon name="user" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('RegisterScreen')}
          >
            <Icon name="plus" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.workerButton]}
            onPress={() => navigation.navigate('LoginScreen')}
          >
            <Icon name="shield" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Staff/Worker Login</Text>
          </TouchableOpacity>

          {/* Test Connection Button for Development */}
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testConnection}
            disabled={isTestingConnection}
          >
            <Icon 
              name={isTestingConnection ? "spinner" : "wifi"} 
              size={20} 
              color="#fff" 
              style={styles.icon} 
            />
            <Text style={styles.buttonText}>
              {isTestingConnection ? "Testing..." : "Auto Test Connection"}
            </Text>
          </TouchableOpacity>

          {/* Manual IP Test Button */}
          <TouchableOpacity
            style={[styles.button, styles.manualTestButton]}
            onPress={testConnectionWithCustomIP}
            disabled={isTestingConnection}
          >
            <Icon name="gear" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Manual IP Test</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need help?{' '}
            <Text style={styles.link} onPress={() => console.log('Navigate to support')}>Visit Support</Text>
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 25,
    marginVertical: 10,
    width: '80%',
  },
  workerButton: {
    backgroundColor: '#1E88E5',
  },
  testButton: {
    backgroundColor: '#FF9800',
  },
  manualTestButton: {
    backgroundColor: '#9C27B0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
  },
  link: {
    color: '#FFD700',
    textDecorationLine: 'underline',
  },
});

export default StartingScreen;

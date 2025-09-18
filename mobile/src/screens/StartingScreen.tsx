import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface NavigationProps {
  navigate: (screen: string) => void;
}

const StartingScreen = () => {
  const navigation = useNavigation<NavigationProps>();

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
            onPress={() => navigation.navigate('WorkerLoginScreen')}
          >
            <Icon name="shield" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Staff/Worker Login</Text>
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

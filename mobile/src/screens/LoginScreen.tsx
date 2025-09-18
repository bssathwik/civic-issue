import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppStackParamList } from '../navigation/AppNavigator';

// Define props for LoginScreen
type LoginScreenProps = StackScreenProps<AppStackParamList, 'LoginScreen'>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Bypass authentication for testing purposes
    Alert.alert('Success', 'Login bypassed for testing purposes!');
    navigation.navigate('MainTabs'); // Navigate to MainTabs instead of HomeScreen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back.</Text>
      <Text style={styles.subtitle}>Login to continue.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <View style={styles.socialLoginContainer}>
        <Text style={styles.socialLoginText}>Or login with</Text>
        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-facebook" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.linkContainer}>
        <Text style={styles.linkText}>Don’t have an account? Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkContainer}>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialLoginContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  socialLoginText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  socialButton: {
    backgroundColor: '#007BFF',
    borderRadius: 25,
    padding: 10,
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;

import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('https://dummyapi.com/register', {
        name,
        email,
        password,
        phoneNumber,
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Registration successful!');
        navigation.navigate('Dashboard');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>Create your account.</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

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

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <View style={styles.checkboxContainer}>
        <TouchableOpacity style={styles.checkbox}>
          <Ionicons name="checkmark" size={20} color="#007BFF" />
        </TouchableOpacity>
        <Text style={styles.checkboxText}>I agree to the Terms & Conditions</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('LoginScreen')}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>Already have an account? Login</Text>
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxText: {
    fontSize: 14,
    color: '#666',
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
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';

interface FormData {
  name?: string;
  email: string;
  password: string;
  role?: string;
}

interface AuthScreenProps {
  navigation: any; // Replace 'any' with proper type if using a navigation library
}

const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    role: '',
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAuth = async () => {
    try {
      const endpoint = isLogin
        ? 'https://dummyapi.com/login'
        : 'https://dummyapi.com/register';

      const response = await axios.post(endpoint, formData);

      if (response.status === 200) {
        Alert.alert('Success', isLogin ? 'Login successful!' : 'Registration successful!');
        navigation.navigate('Dashboard');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong!');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, isLogin && styles.activeTab]}
          onPress={() => setIsLogin(true)}
        >
          <Text style={styles.tabText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, !isLogin && styles.activeTab]}
          onPress={() => setIsLogin(false)}
        >
          <Text style={styles.tabText}>Register</Text>
        </TouchableOpacity>
      </View>

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={(value) => handleInputChange('password', value)}
      />

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Role (e.g., Staff or Worker)"
          value={formData.role}
          onChangeText={(value) => handleInputChange('role', value)}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Register'}</Text>
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  activeTab: {
    borderBottomColor: '#007BFF',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
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
});

export default AuthScreen;

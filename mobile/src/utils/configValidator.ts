// Mobile App Configuration Validator
// Run this in your mobile app to verify backend connectivity

import { apiClient } from '../services/api';

export const validateConfiguration = async () => {
  console.log('🔄 Validating Mobile App Configuration...\n');

  try {
    console.log('📡 API Base URL:', 'http://192.168.1.19:3000/api');
    console.log('🏥 Testing health endpoint...');
    
    const health = await apiClient.healthCheck();
    console.log('✅ Health Check Response:', health);
    
    console.log('📋 Testing issues endpoint...');
    const issues = await apiClient.getIssues();
    console.log('✅ Issues Response:', {
      success: issues.success,
      count: issues.data?.length || 0
    });
    
    console.log('🎉 Configuration validated successfully!');
    return {
      success: true,
      message: 'Backend connection working correctly',
      baseUrl: 'http://192.168.1.19:3000/api'
    };
    
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Connection failed';
    return {
      success: false,
      message: errorMessage,
      troubleshooting: [
        'Ensure backend server is running on 192.168.1.19:3000',
        'Check if both devices are on the same WiFi network',
        'Verify Windows Firewall settings allow port 3000',
        'Try restarting both backend server and Expo dev server'
      ]
    };
  }
};

// Usage: Add this to your mobile app and call validateConfiguration() in useEffect

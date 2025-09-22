// Test script to verify backend API connectivity
const fetch = require('node-fetch');

const baseURL = 'http://192.168.1.19:3000/api';

async function testAPIConnection() {
  console.log('🧪 Testing API Connection...\n');

  try {
    // Test health endpoint
    console.log('1. Testing Health Endpoint...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
    
    if (healthData.status === 'OK') {
      console.log('🎉 Backend is running correctly on IP:', healthData.server?.ip || '192.168.1.19');
    }
    
    // Test issues endpoint
    console.log('\n2. Testing Issues Endpoint...');
    const issuesResponse = await fetch(`${baseURL}/issues`);
    const issuesData = await issuesResponse.json();
    console.log('✅ Issues Endpoint:', {
      status: issuesResponse.status,
      success: issuesData.success,
      dataCount: issuesData.data?.length || 0
    });
    
    console.log('\n🎉 All tests passed! Backend is ready for mobile app connection.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   - Backend server is running on port 3000');
    console.log('   - Your IP address is 192.168.1.19');
    console.log('   - Windows Firewall allows connections on port 3000');
  }
}

testAPIConnection();

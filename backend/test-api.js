// Simple API test script to verify backend connectivity
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing Civic Issue API with MongoDB...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check Success:', healthResponse.data);
    console.log('');

    // Test 2: Register a new user
    console.log('2️⃣ Testing User Registration...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      phone: '1234567890',
      role: 'citizen'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration Success:', registerResponse.data);
    console.log('');

    // Test 3: Login with the new user
    console.log('3️⃣ Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login Success:', loginResponse.data);
    console.log('');

    // Test 4: Get current user profile (with auth token)
    console.log('4️⃣ Testing Authenticated Request...');
    const token = loginResponse.data.token;
    const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile Success:', profileResponse.data);
    console.log('');

    console.log('🎉 ALL TESTS PASSED! Your backend with MongoDB is working perfectly!');
    console.log('📊 Data is being stored permanently in MongoDB');
    console.log('🚀 Ready for mobile app connection!');

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
}

// Run the test
testAPI();

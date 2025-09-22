const axios = require('axios');

const baseURL = 'http://localhost:3000/api';

async function testEndpoints() {
  console.log('🧪 Testing Backend API Endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing Health Endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test issues endpoint (public)
    console.log('2. Testing Issues List Endpoint...');
    const issuesResponse = await axios.get(`${baseURL}/issues`);
    console.log('✅ Issues List:', {
      success: issuesResponse.data.success,
      count: issuesResponse.data.data?.length || 0,
      sample: issuesResponse.data.data?.[0] ? {
        id: issuesResponse.data.data[0]._id,
        title: issuesResponse.data.data[0].title,
        category: issuesResponse.data.data[0].category,
        status: issuesResponse.data.data[0].status,
      } : 'No issues found'
    });
    console.log('');

    // Test issues by category
    console.log('3. Testing Issues by Category Endpoint...');
    const categoryResponse = await axios.get(`${baseURL}/issues?category=road_maintenance`);
    console.log('✅ Road Maintenance Issues:', {
      success: categoryResponse.data.success,
      count: categoryResponse.data.data?.length || 0
    });
    console.log('');

    // Test issue stats
    console.log('4. Testing Issue Statistics Endpoint...');
    const statsResponse = await axios.get(`${baseURL}/issues/stats`);
    console.log('✅ Issue Stats:', statsResponse.data);
    console.log('');

    console.log('🎉 All endpoint tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
}

testEndpoints();

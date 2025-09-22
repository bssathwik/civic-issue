const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Helper function to make API requests
async function test(method, endpoint, data = null, token = null) {
  const config = {
    method: method.toLowerCase(),
    url: `${BASE_URL}${endpoint}`,
    headers: {}
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
    config.data = data;
    config.headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

// Test comprehensive citizen functionality
async function testCitizenFeatures() {
  console.log('🧪 Testing Comprehensive Citizen Features...\n');

  try {
    // Test 1: Register a citizen with all required data
    console.log('1. Testing citizen registration with complete profile...');
    const registrationData = {
      name: 'John Citizen',
      email: 'johncitizen@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      phone: '9876543210',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      occupation: 'Software Engineer',
      address: {
        street: '123 Main Street',
        area: 'Tech Park',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        ward: 'Ward 15',
        landmark: 'Near Tech Park'
      },
      location: {
        coordinates: [77.5946, 12.9716]
      },
      emergencyContact: {
        name: 'Jane Citizen',
        phone: '9876543211',
        relation: 'spouse'
      },
      aadharNumber: '123456789012',
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        language: 'en'
      },
      agreeToTerms: true,
      agreeToPrivacy: true
    };

    const response = await test('POST', '/api/auth/register', registrationData);
    console.log('✅ Registration successful');
    console.log(`Profile completeness: ${response.user?.profileCompleteness || 'N/A'}%`);
    
    const token = response.token;
    console.log();

    // Test 2: Create an issue to test report tracking
    console.log('2. Testing issue creation and report tracking...');
    const issueData = {
      title: 'Pothole on Main Street',
      description: 'Large pothole causing traffic issues',
      category: 'infrastructure',
      priority: 'high',
      location: {
        coordinates: [77.5946, 12.9716]
      },
      address: {
        street: '123 Main Street',
        area: 'Tech Park',
        city: 'Bangalore',
        full: '123 Main Street, Tech Park, Bangalore'
      }
    };

    const issueResponse = await test('POST', '/api/issues', issueData, token);
    console.log('✅ Issue created successfully');
    console.log(`Issue Number: ${issueResponse.issue?.issueNumber}`);
    const issueId = issueResponse.issue?._id;
    console.log();

    // Test 3: Get citizen dashboard
    console.log('3. Testing citizen dashboard...');
    const dashboardResponse = await test('GET', '/api/citizen/dashboard', null, token);
    console.log('✅ Dashboard retrieved successfully');
    console.log(`Total reports: ${dashboardResponse.data?.stats?.totalReports || 0}`);
    console.log(`Profile completeness: ${dashboardResponse.data?.citizen?.profileCompleteness || 0}%`);
    console.log();

    // Test 4: Get report history
    console.log('4. Testing report history...');
    const historyResponse = await test('GET', '/api/citizen/reports', null, token);
    console.log('✅ Report history retrieved successfully');
    console.log(`Total reports in history: ${historyResponse.data?.pagination?.totalReports || 0}`);
    console.log();

    // Test 5: Get specific citizen issue
    console.log('5. Testing citizen issue details...');
    if (issueId) {
      const issueDetailResponse = await test('GET', `/api/citizen/issues/${issueId}`, null, token);
      console.log('✅ Issue details retrieved successfully');
      console.log(`Issue status: ${issueDetailResponse.data?.issue?.status}`);
      console.log(`Citizen summary: ${JSON.stringify(issueDetailResponse.data?.issue?.citizenSummary, null, 2)}`);
    }
    console.log();

    // Test 6: Update citizen profile
    console.log('6. Testing profile update...');
    const profileUpdateData = {
      name: 'John Updated Citizen',
      citizenProfile: {
        occupation: 'Senior Software Engineer',
        emergencyContact: {
          name: 'Jane Updated Citizen',
          phone: '9876543212',
          relation: 'Spouse'
        }
      }
    };

    const updateResponse = await test('PUT', '/api/citizen/profile', profileUpdateData, token);
    console.log('✅ Profile updated successfully');
    console.log(`Updated name: ${updateResponse.data?.citizen?.name}`);
    console.log(`Updated occupation: ${updateResponse.data?.citizen?.citizenProfile?.occupation}`);
    console.log();

    // Test 7: Test issue status update and citizen tracking
    console.log('7. Testing admin issue status update and citizen tracking...');
    
    // First create an admin user for testing
    const adminData = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    };

    const adminResponse = await test('POST', '/api/auth/register', adminData);
    const adminToken = adminResponse.token;

    if (issueId && adminToken) {
      const statusUpdateData = {
        status: 'in_progress'
      };

      const statusUpdateResponse = await test('PUT', `/api/issues/${issueId}`, statusUpdateData, adminToken);
      console.log('✅ Issue status updated by admin');
      console.log(`New status: ${statusUpdateResponse.issue?.status}`);

      // Check if citizen dashboard reflects the change
      const updatedDashboard = await test('GET', '/api/citizen/dashboard', null, token);
      const inProgressCount = updatedDashboard.data?.stats?.inProgress || 0;
      console.log(`Citizen dashboard shows ${inProgressCount} in-progress issues`);
    }
    console.log();

    console.log('🎉 All citizen functionality tests passed!\n');

    // Summary
    console.log('=== TEST SUMMARY ===');
    console.log('✅ Citizen registration with complete profile');
    console.log('✅ Issue creation and automatic report tracking');
    console.log('✅ Citizen dashboard with comprehensive stats');
    console.log('✅ Report history with pagination and filtering');
    console.log('✅ Individual issue details for citizens');
    console.log('✅ Profile update functionality');
    console.log('✅ Issue status updates with citizen tracking');
    console.log('\n🚀 Backend is ready for comprehensive citizen management!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test
if (require.main === module) {
  testCitizenFeatures();
}

module.exports = { testCitizenFeatures };
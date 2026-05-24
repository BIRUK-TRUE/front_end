/**
 * API Testing Script
 * Run this with: node test-api.js
 * 
 * This script tests the backend API endpoints to verify data is being returned correctly
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';

// You'll need to replace this with a valid token from your login
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`
  },
});

async function testEndpoints() {
  console.log('🧪 Testing Backend API Endpoints\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Academic Years
    console.log('\n📚 Test 1: Academic Years');
    console.log('-'.repeat(60));
    const yearsResponse = await axiosInstance.get('/academics/years', {
      params: { page: 1, size: 20 }
    });
    console.log('Status:', yearsResponse.status);
    console.log('Response structure:', Object.keys(yearsResponse.data));
    console.log('Total academic years:', yearsResponse.data.total);
    console.log('Items count:', yearsResponse.data.items?.length || 0);
    if (yearsResponse.data.items?.length > 0) {
      console.log('First item:', JSON.stringify(yearsResponse.data.items[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Academic Years Error:', error.response?.data || error.message);
  }

  try {
    // Test 2: Users (all)
    console.log('\n👥 Test 2: All Users');
    console.log('-'.repeat(60));
    const usersResponse = await axiosInstance.get('/users', {
      params: { page: 1, size: 20 }
    });
    console.log('Status:', usersResponse.status);
    console.log('Response structure:', Object.keys(usersResponse.data));
    console.log('Total users:', usersResponse.data.total);
    console.log('Items count:', usersResponse.data.items?.length || 0);
    if (usersResponse.data.items?.length > 0) {
      console.log('First user:', JSON.stringify(usersResponse.data.items[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Users Error:', error.response?.data || error.message);
  }

  try {
    // Test 3: Students
    console.log('\n🎓 Test 3: Students');
    console.log('-'.repeat(60));
    const studentsResponse = await axiosInstance.get('/students', {
      params: { page: 1, size: 20 }
    });
    console.log('Status:', studentsResponse.status);
    console.log('Response structure:', Object.keys(studentsResponse.data));
    console.log('Total students:', studentsResponse.data.total);
    console.log('Items count:', studentsResponse.data.items?.length || 0);
    if (studentsResponse.data.items?.length > 0) {
      console.log('First student:', JSON.stringify(studentsResponse.data.items[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Students Error:', error.response?.data || error.message);
  }

  try {
    // Test 4: Student Stats
    console.log('\n📊 Test 4: Student Stats');
    console.log('-'.repeat(60));
    const statsResponse = await axiosInstance.get('/students/stats/summary');
    console.log('Status:', statsResponse.status);
    console.log('Stats:', JSON.stringify(statsResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Student Stats Error:', error.response?.data || error.message);
  }

  try {
    // Test 5: User Stats
    console.log('\n📊 Test 5: User Stats');
    console.log('-'.repeat(60));
    const userStatsResponse = await axiosInstance.get('/users/stats/summary');
    console.log('Status:', userStatsResponse.status);
    console.log('Stats:', JSON.stringify(userStatsResponse.data, null, 2));

  } catch (error) {
    console.error('❌ User Stats Error:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Testing Complete\n');
}

// Instructions
console.log(`
📋 INSTRUCTIONS:
1. Make sure the backend server is running on http://localhost:8000
2. Login to the application and get your access token from browser DevTools:
   - Open DevTools (F12)
   - Go to Application/Storage tab
   - Find localStorage
   - Copy the value of 'accessToken'
3. Replace 'YOUR_ACCESS_TOKEN_HERE' in this file with your token
4. Run: node test-api.js
`);

if (ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_HERE') {
  console.log('⚠️  Please set your ACCESS_TOKEN first!\n');
} else {
  testEndpoints();
}

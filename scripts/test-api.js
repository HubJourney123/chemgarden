// ============================================
// scripts/test-api.js
// ============================================
// Use this script to test your API endpoints
const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing API Endpoints...\n');
  
  // Test login
  console.log('1. Testing Login...');
  const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'teacher@demo.com',
      password: 'teacher123'
    })
  });
  
  if (loginResponse.ok) {
    console.log('✅ Login successful');
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Test batches endpoint
    console.log('\n2. Testing Batches API...');
    const batchesResponse = await fetch(`${BASE_URL}/api/batches`, {
      headers: { 'Cookie': cookies }
    });
    
    if (batchesResponse.ok) {
      const batches = await batchesResponse.json();
      console.log(`✅ Fetched ${batches.length} batches`);
    } else {
      console.log('❌ Failed to fetch batches');
    }
    
    // Test students endpoint
    console.log('\n3. Testing Students API...');
    const studentsResponse = await fetch(`${BASE_URL}/api/students`, {
      headers: { 'Cookie': cookies }
    });
    
    if (studentsResponse.ok) {
      const students = await studentsResponse.json();
      console.log(`✅ Fetched ${students.length} students`);
    } else {
      console.log('❌ Failed to fetch students');
    }
    
    // Test stats endpoint
    console.log('\n4. Testing Stats API...');
    const statsResponse = await fetch(`${BASE_URL}/api/stats`, {
      headers: { 'Cookie': cookies }
    });
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Stats:', stats);
    } else {
      console.log('❌ Failed to fetch stats');
    }
  } else {
    console.log('❌ Login failed');
  }
  
  console.log('\n✨ API tests completed!');
}

testAPI().catch(console.error);

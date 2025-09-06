const axios = require('axios');

const API_BASE = 'http://localhost:8000/api';

async function testAPI() {
  console.log('🧪 Testing ForestWatch API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check:', health.data);

    // Test 2: Debug images
    console.log('\n2. Testing debug images endpoint...');
    const debug = await axios.get(`${API_BASE}/debug/images`);
    console.log('✅ Database entries:', debug.data.data.length, 'images found');
    debug.data.data.forEach(img => {
      console.log(`   - ${img.area}: ${img.pointer_name} (${img.image1_path} → ${img.image2_path})`);
    });

    // Test 3: Get specific images
    console.log('\n3. Testing specific image fetch...');
    const images = await axios.get(`${API_BASE}/ndvi-images/sundarbans/Random Point 1`);
    console.log('✅ Sundarbans Random Point 1:', images.data);

    // Test 4: Test Gemini connection
    console.log('\n4. Testing Gemini connection...');
    const gemini = await axios.get(`${API_BASE}/test-gemini`);
    console.log('✅ Gemini test:', gemini.data);

    // Test 5: Test vegetation analysis
    console.log('\n5. Testing vegetation analysis...');
    const analysis = await axios.post(`${API_BASE}/analyze-vegetation`, {
      image1_url: 'http://localhost:8000/uploads/1.png',
      image2_url: 'http://localhost:8000/uploads/2.png',
      area: 'sundarbans',
      pointer_name: 'Random Point 1'
    });
    console.log('✅ Analysis result:', analysis.data);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPI();

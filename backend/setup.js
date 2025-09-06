const fs = require('fs');
const path = require('path');

console.log('🌲 ForestWatch Backend Setup');
console.log('============================\n');

// Check if images exist
const imageFiles = ['1.png', '2.png', '3.png', '4.png'];
const uploadsDir = './uploads';

console.log('📁 Checking uploaded images...');
imageFiles.forEach(file => {
  const filePath = path.join(uploadsDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ Found: ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
  }
});

console.log('\n🔑 Gemini API Key Setup:');
console.log('1. Get your API key from: https://makersuite.google.com/app/apikey');
console.log('2. Set the environment variable:');
console.log('   Windows: set GEMINI_API_KEY=your_api_key_here');
console.log('   Linux/Mac: export GEMINI_API_KEY=your_api_key_here');
console.log('3. Or update the config.js file directly');

console.log('\n🚀 To start the backend:');
console.log('1. Install dependencies: npm install');
console.log('2. Set your API key (see above)');
console.log('3. Start server: npm start');

console.log('\n📊 Database will be created with your images:');
console.log('- Sundarbans Point 1: 1.png → 2.png');
console.log('- Sundarbans Point 2: 3.png → 4.png');
console.log('- Sundarbans Point 3: 1.png → 3.png');
console.log('- Kabini Point 1: 2.png → 4.png');
console.log('- Kabini Point 2: 1.png → 4.png');
console.log('- Kabini Point 3: 2.png → 3.png');

console.log('\n🔍 Test endpoints:');
console.log('- Health: http://localhost:8000/api/health');
console.log('- Test Gemini: http://localhost:8000/api/test-gemini');
console.log('- Get images: http://localhost:8000/api/ndvi-images/sundarbans');

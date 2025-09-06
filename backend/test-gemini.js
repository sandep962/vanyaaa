const GeminiVegetationAnalyzer = require('./gemini-integration');
const path = require('path');

async function testGemini() {
  console.log('🤖 Testing Gemini Integration...\n');

  // Initialize with your API key
  const analyzer = new GeminiVegetationAnalyzer('AIzaSyDoWj24rwPpu15Kk96EQfnkYG1qJz-bsfU');

  try {
    // Test 1: Connection test
    console.log('1. Testing Gemini connection...');
    const connectionTest = await analyzer.testConnection();
    console.log('✅ Connection test:', connectionTest);

    // Test 2: Image analysis
    console.log('\n2. Testing image analysis...');
    const image1Path = path.join(__dirname, 'uploads', '1.png');
    const image2Path = path.join(__dirname, 'uploads', '2.png');
    
    const analysis = await analyzer.analyzeVegetation(
      image1Path, 
      image2Path, 
      'sundarbans', 
      'Random Point 1'
    );
    
    console.log('✅ Analysis result:', JSON.stringify(analysis, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGemini();

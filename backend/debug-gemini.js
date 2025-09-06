const GeminiVegetationAnalyzer = require('./gemini-integration');
const path = require('path');

async function debugGemini() {
  console.log('🔍 Debugging Gemini Response...\n');

  const analyzer = new GeminiVegetationAnalyzer('AIzaSyDoWj24rwPpu15Kk96EQfnkYG1qJz-bsfU');

  try {
    const image1Path = path.join(__dirname, 'uploads', '1.png');
    const image2Path = path.join(__dirname, 'uploads', '2.png');
    
    console.log('Testing with images:');
    console.log('- Image 1:', image1Path);
    console.log('- Image 2:', image2Path);
    console.log('');
    
    const analysis = await analyzer.analyzeVegetation(
      image1Path, 
      image2Path, 
      'sundarbans', 
      'Random Point 1'
    );
    
    console.log('\n=== FINAL RESULT ===');
    console.log('Success:', analysis.success);
    if (analysis.success) {
      console.log('Data keys:', Object.keys(analysis.data));
      console.log('Vegetation scores:', {
        image1: analysis.data.vegetation_score_image1,
        image2: analysis.data.vegetation_score_image2,
        loss: analysis.data.vegetation_loss
      });
    } else {
      console.log('Error:', analysis.error);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugGemini();

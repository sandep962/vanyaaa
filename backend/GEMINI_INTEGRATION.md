# Gemini 2.5 Flash Integration for ForestWatch

## Overview
This document explains how the Gemini 2.5 Flash API is integrated into the ForestWatch backend for vegetation analysis.

## Files Created

### 1. `gemini-integration.js`
The main integration file containing the `GeminiVegetationAnalyzer` class.

**Key Features:**
- Connects to Gemini 2.5 Flash API
- Analyzes before/after forest images
- Provides comprehensive vegetation assessment
- Returns structured JSON responses

### 2. `config.js`
Configuration file for API keys and settings.

### 3. Updated `server.js`
Modified to use real Gemini API instead of mock data.

## API Key Setup

### Method 1: Environment Variable (Recommended)
```bash
# Windows
set GEMINI_API_KEY=your_api_key_here

# Linux/Mac
export GEMINI_API_KEY=your_api_key_here
```

### Method 2: Direct Configuration
Edit `backend/config.js` and replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key.

## How It Works

### 1. Image Processing
```javascript
// Images are read from the uploads directory
const image1Buffer = fs.readFileSync(image1Path);
const image2Buffer = fs.readFileSync(image2Path);

// Converted to base64 for API transmission
const image1Base64 = image1Buffer.toString('base64');
const image2Base64 = image2Buffer.toString('base64');
```

### 2. Gemini API Call
```javascript
const result = await this.model.generateContent([
  prompt,
  {
    inlineData: {
      mimeType: "image/png",
      data: image1Base64
    }
  },
  {
    inlineData: {
      mimeType: "image/png", 
      data: image2Base64
    }
  }
]);
```

### 3. Response Processing
The API returns a detailed JSON response with:
- Vegetation scores (0-100%)
- Vegetation loss percentage
- Health assessments
- Land use changes
- Analysis summary
- Conservation recommendations
- Confidence score

## Database Integration

### Image Mapping
Your 4 uploaded images are mapped as follows:
- **1.png** → Used in multiple combinations
- **2.png** → Used in multiple combinations  
- **3.png** → Used in multiple combinations
- **4.png** → Used in multiple combinations

### Database Entries
```sql
-- Sundarbans Point 1: 1.png → 2.png
-- Sundarbans Point 2: 3.png → 4.png
-- Sundarbans Point 3: 1.png → 3.png
-- Kabini Point 1: 2.png → 4.png
-- Kabini Point 2: 1.png → 4.png
-- Kabini Point 3: 2.png → 3.png
```

## API Endpoints

### 1. Test Gemini Connection
```
GET /api/test-gemini
```
Tests if the Gemini API is working correctly.

### 2. Analyze Vegetation
```
POST /api/analyze-vegetation
```
Body:
```json
{
  "image1_url": "http://localhost:8000/uploads/1.png",
  "image2_url": "http://localhost:8000/uploads/2.png",
  "area": "sundarbans",
  "pointer_name": "Sundarbans Point 1"
}
```

### 3. Get Images
```
GET /api/ndvi-images/sundarbans
GET /api/ndvi-images/sundarbans/Sundarbans Point 1
```

## Response Format

### Successful Analysis
```json
{
  "success": true,
  "data": {
    "vegetation_score_image1": 0.855,
    "vegetation_score_image2": 0.723,
    "vegetation_loss": 0.154,
    "vegetation_health_image1": "Healthy dense forest with good canopy coverage",
    "vegetation_health_image2": "Moderate degradation with some areas showing stress",
    "land_use_changes": "Evidence of selective logging and minor road development",
    "analysis_summary": "Comprehensive analysis of forest changes...",
    "recommendations": [
      "Implement immediate reforestation in degraded areas",
      "Establish buffer zones around remaining forest",
      "Monitor illegal logging activities",
      "Engage local communities in conservation"
    ],
    "confidence_score": 0.925,
    "key_findings": [
      "15.4% reduction in forest cover",
      "Evidence of selective logging",
      "Some areas showing natural regeneration",
      "Overall forest health declining but recoverable"
    ]
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Gemini analysis failed",
  "details": "API key invalid or quota exceeded"
}
```

## Testing the Integration

### 1. Start the Backend
```bash
cd backend
npm install
npm start
```

### 2. Test API Connection
```bash
curl http://localhost:8000/api/test-gemini
```

### 3. Test Image Analysis
```bash
curl -X POST http://localhost:8000/api/analyze-vegetation \
  -H "Content-Type: application/json" \
  -d '{
    "image1_url": "http://localhost:8000/uploads/1.png",
    "image2_url": "http://localhost:8000/uploads/2.png",
    "area": "sundarbans",
    "pointer_name": "Sundarbans Point 1"
  }'
```

## Troubleshooting

### Common Issues

1. **API Key Not Set**
   - Error: "API key invalid"
   - Solution: Set the GEMINI_API_KEY environment variable

2. **Images Not Found**
   - Error: "Image files not found"
   - Solution: Ensure images are in the uploads directory

3. **JSON Parse Error**
   - Error: "Could not parse JSON response"
   - Solution: The API returns raw text, which is handled gracefully

4. **Quota Exceeded**
   - Error: "Quota exceeded"
   - Solution: Check your Gemini API usage limits

### Debug Mode
Add console.log statements in `gemini-integration.js` to debug:
```javascript
console.log('Sending request to Gemini...');
console.log('Response received:', text);
```

## Cost Considerations

- Gemini 2.5 Flash has competitive pricing
- Each analysis uses 2 images + text prompt
- Monitor usage in Google AI Studio
- Consider implementing caching for repeated analyses

## Security Notes

- Never commit API keys to version control
- Use environment variables for production
- Implement rate limiting for production use
- Consider API key rotation

## Future Enhancements

1. **Caching**: Cache analysis results to reduce API calls
2. **Batch Processing**: Analyze multiple image pairs simultaneously
3. **Error Recovery**: Implement retry logic for failed requests
4. **Monitoring**: Add logging and metrics for API usage
5. **Alternative Models**: Support for other vision models as fallback

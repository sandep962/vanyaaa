// Configuration file for ForestWatch Backend
module.exports = {
  // Gemini API Configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyCilEq6SgMSd9rzFNl8A0ndN2i46znZOjQ',
  
  // YouTube API Configuration
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || 'AIzaSyAuLELgg6NUf784rZxfZgJnEAeGPiLOugk',
  
  // Server Configuration
  PORT: process.env.PORT || 8000,
  
  // Database Configuration
  DATABASE_PATH: './forestwatch.db',
  
  // Upload Configuration
  UPLOAD_DIR: './uploads',
  
  // API Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
};

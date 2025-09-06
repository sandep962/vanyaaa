// Configuration file for ForestWatch Backend
module.exports = {
  // Gemini API Configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyDoWj24rwPpu15Kk96EQfnkYG1qJz-bsfU',
  
  // YouTube API Configuration
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || 'AIzaSyCMcIZXDlikQtcl3tsrvNrjkjY_yxMBxXI',
  
  // Server Configuration
  PORT: process.env.PORT || 8000,
  
  // Database Configuration
  DATABASE_PATH: './forestwatch.db',
  
  // Upload Configuration
  UPLOAD_DIR: './uploads',
  
  // API Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
};

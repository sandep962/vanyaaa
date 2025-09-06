// Configuration file for ForestWatch Backend
module.exports = {
  // Gemini API Configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyDoWj24rwPpu15Kk96EQfnkYG1qJz-bsfU',
  
  // Server Configuration
  PORT: process.env.PORT || 8000,
  
  // Database Configuration
  DATABASE_PATH: './forestwatch.db',
  
  // Upload Configuration
  UPLOAD_DIR: './uploads',
  
  // API Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
};

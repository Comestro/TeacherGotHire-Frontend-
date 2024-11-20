// src/services/configService.js

const config = {
    apiUrl : import.meta.env.VITE_API_URL || 'purnea-kart-frontend/.env',
    // apiKey: process.env.REACT_APP_API_KEY || '',
      // featureFlag: process.env.REACT_APP_FEATURE_FLAG === 'true',
    };
  
   
    
    export const getApiUrl = () => config.apiUrl;
    // export const getApiKey = () => config.apiKey;
    // export const isFeatureEnabled = () => config.featureFlag;
    
    export default config;
  
  //   This service centralizes configuration settings (like API URLs, keys, or flags).
  //   We can import and use the helper functions (getApiUrl, isFeatureEnabled) wherever needed.
    
    
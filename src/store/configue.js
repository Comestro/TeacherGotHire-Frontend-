const config = {
    apiUrl : import.meta.env.VITE_API_URL || 'teacher-hire-frontend/.env',
    };
  
   
    export const getApiUrl = () => config.apiUrl;
    
    export default config;
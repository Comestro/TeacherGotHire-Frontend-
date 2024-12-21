const config = {
    apiUrl : import.meta.env.VITE_API_URL || 'teacher-hire-frontend/.env',
    pinCodeUrl : import.meta.env.VITE_POSTAL_API_URL || 'teacher-hire-frontend/.env',
    };
  
   
    export const getApiUrl = () => config.apiUrl;
    export const getPincodeUrl = () => config.pinCodeUrl;
    
    export default config;
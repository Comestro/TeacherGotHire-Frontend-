import axios from 'axios';
import { getApiUrl } from '../store/configue';


const apiClient = axios.create({
  baseURL: getApiUrl(), 
  headers: {
    'Content-Type': 'application/json',
  },
}); 

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); 
    if (token) {
      config.headers['Authorization'] = `Token ${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      
      localStorage.removeItem('access_token'); // Clear the token
      window.location.href = '/signin'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export const fetchSubjects = async()=>{
  try{
     const response = await apiClient.get('/api/admin/subject/');
     
     return JSON.parse(JSON.stringify(response));
  }
     catch (err) {
         
         throw err;
  }
}

export default apiClient;
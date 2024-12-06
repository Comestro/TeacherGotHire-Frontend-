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


export const fetchSubjects = async()=>{
  try{
     const response = await apiClient.get('/api/admin/subject/');
     console.log("get data:",response.data);
     return JSON.parse(JSON.stringify(response));
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}

export default apiClient;
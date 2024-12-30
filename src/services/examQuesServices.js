import axios from 'axios';
import { getApiUrl } from '../store/configue';


const apiClient = axios.create({
  baseURL: getApiUrl(), // Use the API URL from config service
  headers: {
    'Content-Type': 'application/json',
  },
}); 



apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); // Fetch the token from localStorage
    if (token) {
      config.headers['Authorization'] = `Token ${token}`; // Add the token to the header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchExamLang = async()=>{
  try{
     const response = await apiClient.get('/api/admin//');
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
};

export const fetchQuestion = async({ level_id, class_category_id, subject_id, language })=>{
  try{
    console.log("jsbfkdnvkjd",{ level_id, class_category_id, subject_id, language })
     const response = await apiClient.get(`http://127.0.0.1:8000/api/self/question/questions/`, {
          params: {
            level_id,
            class_category_id,
            subject_id,
            language,
          },
        });
        console.log("newres",response)
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
};

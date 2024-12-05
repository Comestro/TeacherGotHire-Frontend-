import axios from 'axios';
import { getApiUrl } from '../store/configue';


const apiClient = axios.create({
  baseURL: getApiUrl(), // Use the API URL from config service
  headers: {
    'Content-Type': 'application/json',
    //'Authorization': `Token ${localStorage.getItem('access_token')}`, // Use API key from config service
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

export const updateEducationProfile = async(educationdata)=>{
     try{
        const response = await apiClient.post('/api/admin/educationalQulification/',educationdata);
        console.log(response.data);
        console.log("hello");
        return JSON.parse(JSON.stringify(response)); 
     }
        catch (err) {
            console.error(' error:', err.response?.data || err);
            throw err;
     }
}
export const fetchEducationProfile = async()=>{
  try{
     const response = await apiClient.get('/api/admin/educationalQulification/');
     console.log("get data:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}
export const updateSkillsProfile = async(skillsdata)=>{
  try{
    const response = await apiClient.post('api/admin/skill/',skillsdata);
    console.log(response.data);
    return JSON.parese(JSON.stringify(response));
  }
  catch(err){
            console.error('Registration error:', err.response?.data || err);
            throw err;
  }
}
export const fetchSkillsProfile = async()=>{
  try{
     const response = await apiClient.get('api/admin/skill/');
     console.log("get data:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}

export const updateExprienceProfile = async(expriencedata)=>{
  try{
    const response = await apiClient.post('api/admin/teacherexperience/',expriencedata);
    console.log(response.data);
    return JSON.parese(JSON.stringify(response));
  }
  catch(err){
            console.error('Registration error:', err.response?.data || err);
            throw err;
  }
}
export const fetchExprienceProfile = async()=>{
  try{
     const response = await apiClient.get('api/admin/teacherexperience/');
     console.log("get data:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}


export default apiClient;
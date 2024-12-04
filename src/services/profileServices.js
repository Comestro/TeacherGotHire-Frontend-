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

export const updatePersonalProfile = async(personaldata)=>{
     try{
        const response = await apiClient.post('/api/admin/teacher/',personaldata);
        console.log(response.data);
        console.log("hello");
        
        return JSON.parse(JSON.stringify(response)); 
     }
        catch (err) {
            console.error(' error:', err.response?.data || err);
            throw err;
     }
}
export const fetchPersonalProfile = async()=>{
  try{
     const response = await apiClient.get('/api/admin/teacher/');
     console.log("get data:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}
export const updateAddressProfile = async(addressdata)=>{
  try{
    const response = await apiClient.post('api/admin/teachersAddress/',addressdata);
    console.log(response.data);
    return JSON.parese(JSON.stringify(response));
  }
  catch(err){
            console.error('Registration error:', err.response?.data || err);
            throw err;
  }
}
export const fetchAddressProfile = async()=>{
  try{
     const response = await apiClient.get('api/admin/teachersAddress/');
     console.log("get data:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}

export default apiClient;
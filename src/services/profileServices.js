import axios from 'axios';
import { getApiUrl,getPincodeUrl } from '../store/configue';


const apiClient = axios.create({
  baseURL: getApiUrl(), // Use the API URL from config service
  
  withCredentials: true, 
}); 

const pincodeClient = axios.create({
  baseURL: getPincodeUrl(), // Pincode API base URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['Authorization'] = `Token ${token}`;
  }

  // Let Axios handle Content-Type for FormData
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']; // Axios auto-sets multipart/form-data
  } else {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Response Interceptor to Handle 401 Unauthorized
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

export const createTeacherRequest = async (payload) => {
  try {
    const response = await apiClient.post('/api/self/recruiterenquiryform/', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to submit request');
  }
};

export const requestTeacher = async (payload) => {
  try {
    const response = await apiClient.post('/api/self/hirerequest/', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to submit request');
  }
}


export const updateBasicProfile = async(personaldata)=>{
  try{
     const response = await apiClient.put('/api/self/basicProfile/',personaldata);
     return JSON.parse(JSON.stringify(response)); 
  }
     catch (err) {
         
         throw err;
  }
}

export const fetchBasicProfile = async()=>{
  try{
     const response = await apiClient.get('/api/self/basicProfile/');
    // 
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}
export const updateAddressProfile = async(addressdata)=>{
  try{
    const response = await apiClient.put(`/api/self/teacherAddress/`,addressdata);
    return JSON.parse(JSON.stringify(response));
  }
  catch (err) {
  
    

    // Extract validation errors
    const errorMessage = err.response?.data && typeof err.response.data === "object"
        ? Object.values(err.response.data).flat().join(", ") // Convert nested errors to a string
        : err.message || "Failed to update Address profile";

    throw new Error(errorMessage);
  }
}
export const addAddressProfile = async(addressdata)=>{
  try{
    const response = await apiClient.post('/api/self/teacherAddress/',addressdata);
    
    return JSON.parse(JSON.stringify(response));
  }
  catch (err) {
  
    

    // Extract validation errors
    const errorMessage = err.response?.data && typeof err.response.data === "object"
        ? Object.values(err.response.data).flat().join(", ") // Convert nested errors to a string
        : err.message || "Failed to update Address profile";

    throw new Error(errorMessage);
  }
}
export const fetchAddressProfile = async()=>{
  try{
    const response = await apiClient.get('/api/self/teacherAddress/');
     
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}
export const fetchCompleteProfile = async()=>{
  try{
    const response = await apiClient.get('/api/profile/completed/');
     
     return response.data;
  }
     catch (err) {
         
         throw err;
  }
}


export default apiClient;
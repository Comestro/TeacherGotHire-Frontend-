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
      console.error('Unauthorized: Logging out the user');
      localStorage.removeItem('access_token'); // Clear the token
      window.location.href = '/signin'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export const updateBasicProfile = async(personaldata)=>{
  try{
    console.log("profile image services", personaldata)
     const response = await apiClient.put('/api/self/basicProfile/',personaldata);
     return JSON.parse(JSON.stringify(response)); 
  }
     catch (err) {
         console.error(' error:', err.response?.data || err);
         throw err;
  }
}

export const fetchBasicProfile = async()=>{
  try{
     const response = await apiClient.get('/api/self/basicProfile/');
    // console.log("get profile image:",response.data.profile_picture);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}
export const updateAddressProfile = async(addressdata)=>{
  try{
  console.log("adress",addressdata)
    const response = await apiClient.put(`/api/self/teacherAddress/`,addressdata);
    // console.log("adressresponse",response )
    return JSON.parse(JSON.stringify(response));
  }
  catch (err) {
  
    console.error("API Error:", err.response?.data || err.message);

    // Extract validation errors
    const errorMessage = err.response?.data && typeof err.response.data === "object"
        ? Object.values(err.response.data).flat().join(", ") // Convert nested errors to a string
        : err.message || "Failed to update Address profile";

    throw new Error(errorMessage);
  }
}
export const addAddressProfile = async(addressdata)=>{
  try{
console.log("adress",addressdata)
    const response = await apiClient.post('/api/self/teacherAddress/',addressdata);
    
    return JSON.parse(JSON.stringify(response));
  }
  catch (err) {
  
    console.error("API Error:", err.response?.data || err.message);

    // Extract validation errors
    const errorMessage = err.response?.data && typeof err.response.data === "object"
        ? Object.values(err.response.data).flat().join(", ") // Convert nested errors to a string
        : err.message || "Failed to update Adress profile";

    console.log("errorMessage",errorMessage)
    throw new Error(errorMessage);
  }
}
export const fetchAddressProfile = async()=>{
  try{
    const response = await apiClient.get('/api/self/teacherAddress/');
     console.log("res",response)
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}
export const fetchCompleteProfile = async()=>{
  try{
    const response = await apiClient.get('/api/profile/completed/');
     
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}


export default apiClient;
import axios from 'axios';
import { getApiUrl } from '../store/configue';

// Axios instance
const apiClient = axios.create({
  baseURL: getApiUrl(), // Use the API URL from config service
  headers: {
    'Content-Type': 'application/json',
    //'Authorization': `Token ${localStorage.getItem('access_token')}`,
  },
});

// Interceptor to dynamically add the token after login
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Register User
export const createaccount = async ({ Fname, Lname, email, password }) => {
  try {
    const response = await apiClient.post('/api/register/', { Fname, Lname, email, password });
    if (response.status === 200){  
      const { token } = response.data;
      localStorage.setItem('access_token', token);
    }
    return response.data;
  }
  catch(err) {
    console.error('Registration error:', err.response?.data || err);
    throw err;
  }
};

export const fetchUserData = async()=>{
  try{
     const response = await apiClient.get('/api/self/customuser/');
     //console.log("get newdata:",response.data);
     return response.data;
  }
     catch (err) {
         console.error('error:', err.response?.data || err);
         throw err;
  }
}
//verify otp service
export const verifyOtp = async ({ email, otp }) => {
  try {
    // Send the OTP verification request
    const response = await apiClient.post('/api/verify/', { email, otp });
    return response.data;


  } catch (err) {
    console.error('OTP verification error:', err.response?.data || err);
    throw err;
  }
};

// Login User
export const login = async ({ email, password }) => {
  try {
    // If the backend expects JSON payload
    const response = await apiClient.post('/api/login/', { email, password });


      // Parse the token from the response
      const { access_token } = response.data;
      //console.log('Login archana:', access_token);

      // Store token in localStorage
      localStorage.setItem('access_token', access_token);
      console.log('User logged in:', access_token);

      return response.data;
  } catch (err) {
    throw err;
  }
};


export const logout = () => {
  try {
    localStorage.removeItem('access_token'); // Remove token from local storage
   // console.log('User logged out');
  } catch (err) {
    console.error('Logout error:', err);
    throw err;
  }
}
export default apiClient;

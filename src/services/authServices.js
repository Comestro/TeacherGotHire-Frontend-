import axios from 'axios';
import { getApiUrl } from '../store/configue';

// Axios instance
const apiClient = axios.create({
  baseURL: getApiUrl(), // Use the API URL from config service
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Token ${localStorage.getItem('access_token')}`,
  },
});

// Interceptor to dynamically add the token after login
// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem('access_token');
//   if (token) {
//     config.headers.Authorization = `Token ${token}`;
//   }
//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });

// Register User
export const createaccount = async ({ username, email, password }) => {
  try {
    const response = await apiClient.post('/api/register/', { username, email, password });
    console.log('User registered:', response.data);

    const { token } = response.data;
    console.log('Received token:', token);
    localStorage.setItem('access_token', token); // Store the token in local storage

    return response.data;
  } catch (err) {
    console.error('Registration error:', err.response?.data || err);
    throw err;
  }
};

// Login User
export const login = async ({ username, password }) => {
  try {
    // If the backend expects JSON payload
    const response = await apiClient.post('/api/login/', { username, password });

    // Parse the token from the response
    const { access_token } = response.data;
    console.log('Login archana:', access_token);

    // Store token in localStorage
    localStorage.setItem('access_token', access_token);
    console.log('User logged in:', access_token);

    return response.data;
  } catch (err) {
    // Handle login errors
    console.error('Login error:', err.response?.data || err);
    throw err;
  }
};

// Alternative Login for FormData (if needed by the backend)
// export const loginWithFormData = async ({ username, password }) => {
//   try {
//     const formData = new FormData();
//     formData.append('username', username);
//     formData.append('password', password);

//     const response = await axios.post('/api/login/', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });

//     const { token } = response.data;
//     console.log('Login response:', response.data);

//     // Store token in localStorage
//     localStorage.setItem('access_token', token);
//     console.log('User logged in:', token);

//     return response.data;
//   } catch (err) {
//     console.error('Login error (FormData):', err.response?.data || err);
//     throw err;
//   }
//  };

// Export the API client
export default apiClient;

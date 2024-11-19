
import axios from 'axios';
import { getApiUrl } from './configService';


const apiClient = axios.create({
  baseURL: getApiUrl(),  // Use the API URL from config service
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Use API key from config service
  },
}); 

export const createaccount = async ({ email, password, name })=> {
    try {
      const response = await apiClient.post('/auth/register', { email, password, name });
      console.log('User registered:', response.data);
      localStorage.setItem('name', response.data.user.name); // Store token in local storage
      console.log('User name:', response.data.user.name);
      return response.data;
    } catch (err) {
      console.error('Registration error:', err.response?.data || err);
      throw err;
    }
  }

  export const createprofile = async()
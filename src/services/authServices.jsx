
import axios from 'axios';
import { getApiUrl } from './configueServices';


const apiClient = axios.create({
  baseURL: getApiUrl(), // Use the API URL from config service
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': `Bearer ${localStorage.getItem('token')}`, // Use API key from config service
  },
}); 

  // Register User
  export const createaccount = async ({username, email, password})=> {
    try {
      const response = await apiClient.post('/api/register/', { username,email, password});
      console.log('User registered:', response.data);;
      const {token} = response.data;
      // localStorage.setItem('username',JSON.stringify(username));
      localStorage.setItem('email',JSON.stringify(email));
      localStorage.setItem('token',token);
      console.log('user logged in',token);
      return response.data;

     
    } catch (err) {
      console.error('Registration error:', err.response?.data || err);
      throw err;
    }
  }

  // Login User
  export const login = async ({ email, password })=> {
    try {
      const response = await apiClient.post('/api/login/', { email, password });
      const { token } = response.data;
      console.log('Login response:', response.data);
      localStorage.setItem('token', token); // Store token in local storage
      console.log('User logged in:', token);
      //localStorage.setItem('username',JSON.stringify(username));
      localStorage.setItem('email',JSON.stringify(email));
      return token;
    } catch (err) {
      console.error('Login error:', err.response?.data || err);
      throw err;
    }
  }

  export const getuser = async (dispatch)=> {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.get('/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      console.error('Get user error:', err.response?.data || err);
      throw err; 
    }
  }

  // Logout User
  export const logout = async () =>{
    try {
      localStorage.removeItem('token'); // Remove token from local storage
      console.log('User logged out');
    } catch (err) {
      console.error('Logout error:', err);
      throw err;
    }
  }
  



  

export default apiClient;


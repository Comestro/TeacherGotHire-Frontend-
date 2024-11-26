
import axios from 'axios';
import { getApiUrl } from './configService';


const apiClient = axios.create({
  baseURL: getApiUrl(),  // Use the API URL from config service
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Use API key from config service
  },
}); 



import axios from 'axios';
import { getApiUrl } from '../store/configue';


const apiClient = axios.create({
  baseURL: getApiUrl(),  // Use the API URL from config service
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Use API key from config service
  },
}); 


export const updateProfileService = async (profileData) => {
  try {
    const response = await apiClient.post(`/profile/update`, profileData);
    return response.data; // Return updated profile data
  } catch (error) {
    throw error.response?.data || error.message; // Throw meaningful error
  }
};
  


export default apiClient;
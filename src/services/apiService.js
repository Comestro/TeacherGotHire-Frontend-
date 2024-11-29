import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/login/';

const logInservice = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    localStorage.setItem('access_token', accessToken); // Store the access token
    localStorage.setItem('refresh_token', refreshToken); // Store the refresh token
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('access_token'); // Remove the access token
  localStorage.removeItem('refresh_token'); // Remove the refresh token
};

export default {
  logInservice,
  logout,
};
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
    const token = response.data.token;
    localStorage.setItem('AuthToken', token); // Store the token
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('AuthToken'); // Remove the token
};

export default {
  logInservice,
  logout,
};
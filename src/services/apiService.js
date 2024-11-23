import axios from 'axios';

const API_URL = 'https://ronicomestro.pythonanywhere.com/api/login/';

const logInservice = async (email, password) => {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('password', password);

  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export default {
  logInservice,
};
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

    // if (response.status === 200) {  
    //   const { token } = response.data;
    //   localStorage.setItem('access_token', token);
    // }

    return response.data;
  } catch (err) {
    if (err.response) {
      // Handle specific status codes
      const { status, data } = err.response;
      switch (status) {
        case 400:
          throw new Error(data.message || 'Bad Request. Please check your input.');
        case 409:
          throw new Error('Conflict. The email is already registered.');
        case 422:
          throw new Error('Unprocessable Entity. Invalid data provided.');
        case 500:
          throw new Error('Internal Server Error. Please try again later.');
        default:
          throw new Error(data.message || `An error occurred. Status code: ${status}`);
      }
    } else if (err.request) {
      // No response received from the server
      throw new Error('No response from the server. Please check your network connection.');
    } else {
      // Error in setting up the request
      throw new Error(err.message || 'An unexpected error occurred.');
    }
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
    if (err.response) {
      const { status, data } = err.response;

      throw {
        status,
        message: data.message || 'An error occurred.',
      };
    } else if (err.request) {
      // No response received from the server
      throw {
        status: null,
        message: 'No response from the server. Please check your network connection.',
      };
    } else {
      // Error in setting up the request
      throw {
        status: null,
        message: err.message || 'An unexpected error occurred.',
      };
    }
  }
};


// Login User
export const login = async ({ email, password }) => {
  try {
    // Send the login request to the backend
    const response = await apiClient.post('/api/login/', { email, password });

    // Extract and store the access token
    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    console.log('User logged in:', access_token);

    return response.data;
  } catch (err) {
    // Pass the error response to the form handler for specific error message handling
    if (err.response) {
      throw {
        status: err.response.status,
        message: err.response.data.message || 'An error occurred.',
        data: err.response.data,
      };
    } else if (err.request) {
      throw {
        status: null,
        message: 'No response from the server. Please check your network connection.',
      };
    } else {
      throw {
        status: null,
        message: err.message || 'An unexpected error occurred.',
      };
    }
  }
};

export const resendOtp = async (email) => {
  try {
    const response = await apiClient.post('/api/resend-otp/', { email });
    console.log("OTP sent successfully:", response.data);
    return response; // Ensure the response is returned to the caller
  } catch (err) {
    if (err.response) {
      throw {
        status: err.response.status,
        message: err.response.data.message || 'An error occurred.',
        data: err.response.data,
      };
    } else {
      throw {
        status: null,
        message: 'No response from the server. Please check your network connection.',
      };
    }
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

import axios from "axios";
import { getApiUrl } from "../store/configue";
import store, { persistor } from "../store/store";
import { userLogout } from "../features/authSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Helper function to get CSRF token from cookies
const getCsrfToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  maxBodyLength: Infinity, // For large payloads
});

// Interceptor to add token and CSRF token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    // Add CSRF token for state-changing methods
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const handleApiError = async (err) => {
  if (err.response) {
    const { status, data } = err.response;
    if (status === 401 && !err.config.url.includes('/api/login/') && !err.config.url.includes('/api/logout/')) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
      await persistor.purge();
      await persistor.flush();
    }
    let message;
    if (typeof data === 'string') {
      message = data;
    } else if (data && typeof data === 'object') {
      message = data.message || data.detail || (Array.isArray(data.errors) && data.errors[0]?.detail) || (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) || (data.error?.email && Array.isArray(data.error.email) && data.error.email[0]) || (data.error?.non_field_errors && Array.isArray(data.error.non_field_errors) && data.error.non_field_errors[0]);
    }
    if (!message) {
      message = `An error occurred. Status code: ${status}`;
    }
    throw new Error(message);
  } else if (err.request) {
    throw new Error("No response from the server. Please check your network connection.");
  } else {
    throw new Error(err.message || "An unexpected error occurred.");
  }
};

// Helper function for POST requests
const postRequest = async (url, payload) => {
  try {
    const response = await apiClient.post(url, payload);
    return response.data;
  } catch (err) {
    await handleApiError(err);
  }
};

// Helper function for GET requests
const getRequest = async (url) => {
  try {
    const response = await apiClient.get(url);
    return response.data;
  } catch (err) {
    handleApiError(err);
  }
};

export const createaccount = async (userDetails) => {
  try {
    const response = await postRequest("/api/register/teacher/", userDetails);

    return response;
  } catch (error) {


    // Rethrow error so it can be caught in `signup`
    throw error;
  }
};

export const verifyTeacherOtp = async ({ email, otp }) => {
  try {
    const response = await apiClient.post('https://api.ptpinstitute.com/api/verify_otp/', {
      email,
      otp
    });

    if (response.data && response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'OTP verification failed';
  }
};

export const resendTeacherOtp = async (email) => {
  try {
    const response = await apiClient.post('https://api.ptpinstitute.com/api/resend_otp/', {
      email: email
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to resend OTP';
  }
};


export const createRecruiteraccount = async (userDetails) => {
  const response = await postRequest("/api/register/recruiter/", userDetails);
  // Removed auto-login to force OTP verification
  return response;
};

export const verifyRecruiterOtp = async ({ email, otp }) => {
  try {
    const response = await apiClient.post('https://api.ptpinstitute.com/api/verify_otp/', {
      email,
      otp
    });

    if (response.data && response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'OTP verification failed';
  }
};

export const resendRecruiterOtp = async (email) => {
  try {
    const response = await apiClient.post('https://api.ptpinstitute.com/api/resend_otp/', {
      email: email
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to resend OTP';
  }
};

export const fetchUserData = async () => getRequest("/api/self/customuser/");

export const verifyOtp = async (payload) =>
  postRequest("/api/verify_otp/", payload);

export const login = async (credentials) => {
  try {
    // First, make a GET request to get CSRF token if needed
    if (!getCsrfToken()) {
      try {
        await apiClient.get('/api/csrf/');
      } catch (csrfErr) {
        // If CSRF endpoint doesn't exist, continue anyway
        console.warn('CSRF token fetch failed, continuing with login');
      }
    }

    const response = await apiClient.post("/api/login/", credentials);
    const { access_token, role, is_active } = response.data.data;
    if (!is_active) {

      toast.error("Your account is deactivated. Please contact the admin.", {
        position: "top-center",
        autoClose: 5000, // Close after 5 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      alert("Your account is deactivated. Please contact the admin.");
      return;
    }

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("role", role);
    return response.data;
  } catch (err) {
    if (err.response?.data) {
      // Handle CSRF error specifically
      if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
        const csrfError = err.response.data.errors.find(e => e.code === 'error' && e.detail?.includes('CSRF'));
        if (csrfError) {
          // Clear any stale tokens and retry
          document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          throw new Error('Session expired. Please refresh the page and try again.');
        }
      }

      // Handle string response
      if (typeof err.response.data === 'string') {
        throw new Error(err.response.data);
      }
      // Handle object response
      if (typeof err.response.data === 'object') {
        const message = err.response.data.message || err.response.data.detail || "Invalid credentials. Please try again.";
        throw new Error(message);
      }
    }
    throw new Error('Network error. Please check your connection and try again.');
  }
};

export const resendOtp = async (email) =>
  postRequest("/api/resend_otp/", { email });

export const forgetPassword = async (email) =>
  postRequest("/api/password_reset_request/", { email });

export const resetPassword = async (uidb64, token, newPassword) =>
  postRequest(`/api/reset_password/${uidb64}/${token}/`, {
    new_password: newPassword,
    confirm_password: newPassword,
  });

export const logout = async () => {
  try {
    // Step 1: Call the logout API first
    await apiClient.post("/api/logout/").catch((err) => {

      // Even if the API fails, proceed with local logout
    });

    // Step 2: Clear local storage after the API call
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");

    // Step 3: Clear all cookies including CSRF token
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Step 4: Clear redux persist state
    await persistor.purge();
    await persistor.flush();

    return { success: true };
  } catch (err) {

    // Still return success since we've cleared local state
    return { success: true };
  }
};

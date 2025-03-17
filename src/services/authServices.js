import axios from "axios";
import { getApiUrl } from "../store/configue";
import store, { persistor } from "../store/store";
import { userLogout } from "../features/authSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  maxBodyLength: Infinity, // For large payloads
});

// Interceptor to add token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const handleApiError = async (err) => {
  if (err.response) {
    const { status, data } = err.response;
    // Only perform logout actions for 401s that aren't from the login or logout endpoints
    if (status === 401 && !err.config.url.includes('/api/login/') && !err.config.url.includes('/api/logout/')) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
      await persistor.purge();
      await persistor.flush();
    }
    throw {
      status,
      message: data.message || (typeof data === 'string' ? data : `An error occurred. Status code: ${status}`),
      data,
    };
  } else if (err.request) {
    throw {
      status: null,
      message:
        "No response from the server. Please check your network connection.",
    };
  } else {
    throw {
      status: null,
      message: err.message || "An unexpected error occurred.",
    };
  }
};

// Helper function for POST requests
const postRequest = async (url, payload) => {
  try {
    const response = await apiClient.post(url, payload);
    console.log("response", response);
    return response.data;
  } catch (err) {
    handleApiError(err);
    
    // Extract meaningful error message from the API response
    const errorMessage = err.response?.data?.error?.email?.[0] || err.response?.data?.message || "Something went wrong";
    throw new Error(errorMessage);
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
    console.log("response", response);
    return response;
  } catch (error) {
    console.error("Error in createaccount:", error);

    // Rethrow error so it can be caught in `signup`
    throw error;
  }
};

export const createRecruiteraccount = async (userDetails) => {
  const response = await postRequest("/api/register/recruiter/", userDetails);
  if (response && response.access_token) {
    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("role", response.role);
  }
  return response;
};

export const fetchUserData = async () => getRequest("/api/self/customuser/");

export const verifyOtp = async (payload) =>
  postRequest("/api/verify_otp/", payload);

export const login = async (credentials) => {
  try {
    const response = await apiClient.post("/api/login/", credentials);
    const { access_token, role,is_active } = response.data;

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
  postRequest("/api/forget-password/", { email });

export const resetPassword = async (uidb64, token, newPassword) =>
  postRequest(`/api/reset_password/${uidb64}/${token}/`, {
    new_password: newPassword,
    confirm_password: newPassword,
  });

  export const logout = async () => {
    try {
      // Step 1: Call the logout API first
      await apiClient.post("/api/logout/").catch((err) => {
        console.error("Logout API call failed:", err);
        // Even if the API fails, proceed with local logout
      });
  
      // Step 2: Clear local storage after the API call
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
  
      // Step 3: Clear redux persist state
      await persistor.purge();
      await persistor.flush();
  
      return { success: true };
    } catch (err) {
      console.error("Error during logout:", err);
      // Still return success since we've cleared local state
      return { success: true };
    }
  };
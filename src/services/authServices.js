import axios from "axios";
import { getApiUrl } from "../store/configue";
import store, { persistor } from "../store/store";
import { userLogout } from "../features/authSlice";

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
    // Only perform logout actions for 401s that aren't from the login endpoint
    if (status === 401 && !err.config.url.includes('/api/login/')) {
      await store.dispatch(userLogout()).unwrap();
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
      await persistor.purge();
      await persistor.flush();
    }
    throw {
      status,
      message: data.message || `An error occurred. Status code: ${status}`,
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
// const postRequest = async (url, payload) => {
//   try {
//     const response = await apiClient.post(url, payload);
//     console.log("response",response)
//     return response.data;
//   } catch (err) {
//     handleApiError(err);
//   }
// };
const postRequest = async (url, payload) => {
  try {
    const response = await apiClient.post(url, payload);
    console.log("response", response);
    return response.data;
  } catch (err) {
    console.error("API Error:", err);
    handleApiError(err);
    
    // Extract meaningful error message
    const errorMessage = err.response?.data?.error?.email[0]|| "Something went wrong.";
    console.log("errorMessage",errorMessage)
    // Throw the error so the calling function can catch it
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

// export const createaccount = async (userDetails) =>
//   postRequest("/api/register/teacher/", userDetails);

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
    const { access_token, role } = response.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("role", role);
    return response.data;
  } catch (err) {
    handleApiError(err);
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
  
     
     const response = await apiClient.post("/api/logout/");
     console.log("Logged out successfully:", response.data);
     
     localStorage.removeItem("access_token");
     localStorage.removeItem("role");
 
     await persistor.purge(); // Clears persisted state
     await persistor.flush(); // Ensures changes are flushed to storage
 
     // Step 4: Return the response data (optional)
     return response.data;
  } catch (err) {
    handleApiError(err);
  }
};

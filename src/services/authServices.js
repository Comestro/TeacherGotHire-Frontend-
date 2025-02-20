import axios from "axios";
import { getApiUrl } from "../store/configue";
//import { userLogout as logoutAction } from "../features/authSlice"; 
//import store, {persistor} from "../store/store"

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

const handleApiError = (err) => {
  if (err.response) {
    const { status, data } = err.response;
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
const postRequest = async (url, payload) => {
  try {
    const response = await apiClient.post(url, payload);
    return response.data;
  } catch (err) {
    handleApiError(err);
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

export const createaccount = async (userDetails) =>
  postRequest("/api/register/teacher/", userDetails);

export const createRecruiteraccount = async (userDetails) =>
  postRequest("/api/register/recruiter/", userDetails);

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

// export const logout = async () => {
//   try {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("role");

//     store.dispatch(logoutAction()); // Dispatch logout action to reset auth state

    
//     await persistor.purge(); 
//     await persistor.flush(); 

//     const response = await apiClient.post("/api/logout/");
//     console.log("Logged out successfully:", response.data);

//     return response.data;
//   } catch (err) {
//     handleApiError(err);
//   }
// };

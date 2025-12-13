import axios from "axios";
import { getApiUrl } from "../store/configue";
import store, { persistor } from "../store/store";
import { userLogout } from "../features/authSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
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
const postRequest = async (url, payload) => {
  try {
    const response = await apiClient.post(url, payload);
    return response.data;
  } catch (err) {
    await handleApiError(err);
  }
};
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
   

    const response = await apiClient.post("/api/login/", credentials);
    if (response.data && response.data.is_verified === false) {
      const error = new Error(response.data.message || "Please verify your account.");
      error.is_verified = false;
      throw error;
    }

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
      if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
        const csrfError = err.response.data.errors.find(e => e.code === 'error' && e.detail?.includes('CSRF'));
        if (csrfError) {
          document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          throw new Error('Session expired. Please refresh the page and try again.');
        }
      }
      if (err.response.data.is_verified === false) {
        const error = new Error(err.response.data.message || "Please verify your account.");
        error.is_verified = false;
        throw error;
      }
      if (typeof err.response.data === 'string') {
        throw new Error(err.response.data);
      }
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

export const changePassword = async ({ oldPassword, newPassword }) =>
  postRequest("/api/change_password/", {
    old_password: oldPassword,
    new_password: newPassword,
  });

export const logout = async () => {
  try {
    await apiClient.post("/api/logout/").catch((err) => {
    });
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    document.cookie.split(";").forEach((c) => {
      const cookie = c.trim();
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      if (name !== 'csrftoken') {
        document.cookie = name + "=;expires=" + new Date().toUTCString() + ";path=/";
      }
    });
    await persistor.purge();
    await persistor.flush();

    return { success: true };
  } catch (err) {
    return { success: true };
  }
};

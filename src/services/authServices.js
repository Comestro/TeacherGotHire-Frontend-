import axios from "axios";
import { getApiUrl } from "../store/configue";

const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Use this if you store your token in httpOnly cookies; otherwise, omit if you use Authorization header.
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

export const createaccount = async ({ Fname, Lname, email, password }) => {
  try {
    const response = await apiClient.post("/api/register/teacher/", {
      Fname,
      Lname,
      email,
      password,
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;
      switch (status) {
        case 400:
          throw new Error(
            data.message || "Bad Request. Please check your input."
          );
        case 409:
          throw new Error("Conflict. The email is already registered.");
        case 422:
          throw new Error("Unprocessable Entity. Invalid data provided.");
        case 500:
          throw new Error("Internal Server Error. Please try again later.");
        default:
          throw new Error(
            data.message || `An error occurred. Status code: ${status}`
          );
      }
    } else if (err.request) {
      throw new Error(
        "No response from the server. Please check your network connection."
      );
    } else {
      throw new Error(err.message || "An unexpected error occurred.");
    }
  }
};

export const createRecruiteraccount = async ({
  Fname,
  Lname,
  email,
  password,
}) => {
  try {
    const response = await apiClient.post("/api/register/recruiter/", {
      Fname,
      Lname,
      email,
      password,
    });
    return response.data;
  } catch (err) {
    // Similar error handling as above...
    if (err.response) {
      const { status, data } = err.response;
      switch (status) {
        case 400:
          throw new Error(
            data.message || "Bad Request. Please check your input."
          );
        case 409:
          throw new Error("Conflict. The email is already registered.");
        case 422:
          throw new Error("Unprocessable Entity. Invalid data provided.");
        case 500:
          throw new Error("Internal Server Error. Please try again later.");
        default:
          throw new Error(
            data.message || `An error occurred. Status code: ${status}`
          );
      }
    } else if (err.request) {
      throw new Error(
        "No response from the server. Please check your network connection."
      );
    } else {
      throw new Error(err.message || "An unexpected error occurred.");
    }
  }
};

export const fetchUserData = async () => {
  try {
    const response = await apiClient.get("/api/self/customuser/");
    return response.data;
  } catch (err) {
    console.error("Error fetching user data:", err.response?.data || err);
    throw err;
  }
};

export const verifyOtp = async ({ email, otp }) => {
  try {
    const response = await apiClient.post("/api/verify_otp/", { email, otp });
    return response.data;
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;
      throw { status, message: data.message || "An error occurred." };
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
  }
};

export const login = async ({ email, password }) => {
  try {
    const response = await apiClient.post("/api/login/", { email, password });
    const { access_token, role } = response.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("role", role); // Note: We will override this on each protected route fetch.
    return response.data;
  } catch (err) {
    if (err.response) {
      throw {
        status: err.response.status,
        message: err.response.data.message || "An error occurred.",
        data: err.response.data,
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
  }
};

export const resendOtp = async (email) => {
  try {
    const response = await apiClient.post("/api/resend_otp/", { email });
    console.log("OTP sent successfully:", response.data);
    return response;
  } catch (err) {
    if (err.response) {
      throw {
        status: err.response.status,
        message: err.response.data.message || "An error occurred.",
        data: err.response.data,
      };
    } else {
      throw {
        status: null,
        message:
          "No response from the server. Please check your network connection.",
      };
    }
  }
};



export const forgetPassword = async (email) => {
  try {
    const response = await apiClient.post("/api/forget-password/", { email });
    return response;
  } catch (err) {
    if (err.response) {
      throw {
        status: err.response.status,
        message:
          err.response.data.message ||
          "An error occurred while sending the reset email.",
        data: err.response.data,
      };
    } else {
      throw {
        status: null,
        message:
          "No response from the server. Please check your network connection.",
      };
    }
  }
};

export const resetPassword = async (uidb64, token, newPassword) => {
  try {
    const response = await apiClient.post(
      `/api/reset_password/${uidb64}/${token}/`,
      {
        new_password: newPassword,
        confirm_password: newPassword,
      }
    );
    return response;
  } catch (err) {
    if (err.response) {
      throw {
        status: err.response.status,
        message:
          err.response.data.message ||
          "An error occurred while resetting the password",
        data: err.response.data,
      };
    } else {
      throw {
        status: null,
        message:
          "No response from the server. Please check your network connection.",
      };
    }
  }
};



export const logout = async () => {
  try {
    const response = await apiClient.post("/api/logout/");
    

    persistor.purge().then(() => {
      console.log('Persisted store cleared.');
    });
    
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    

    console.log("logout hua bhai", response.data)
    return response.data;
  } catch (err) {
    if (err.response) {
      throw {
        status: err.response.status,
        message: err.response.data.message || "Logout failed.",
        data: err.response.data,
      };
    } else {
      throw {
        status: null,
        message:
          "No response from the server. Please check your network connection.",
      };
    }
  }
};

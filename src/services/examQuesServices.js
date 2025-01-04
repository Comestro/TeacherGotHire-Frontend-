import axios from "axios";
import { getApiUrl } from "../store/configue";

const apiClient = axios.create({
  baseURL: getApiUrl(), // Use the API URL from config service
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token"); // Fetch the token from localStorage
    if (token) {
      config.headers["Authorization"] = `Token ${token}`; // Add the token to the header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized: Logging out the user");
      localStorage.removeItem("access_token"); // Clear the token
      window.location.href = "/signin"; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export const fetchExam = async ({
  level_id,
  class_category_id,
  subject_id,
}) => {
  try {
    const response = await apiClient.get(`/api/self/exam/exams/`, {
      params: {
        level_id,
        class_category_id,
        subject_id,
      },
    });
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const fetchQuestion = async ({ exam_id, language }) => {
  try {
    console.log("jsbfkdnvkjd", { exam_id, language });
    const response = await apiClient.get(`/api/self/exam/exams/${exam_id}`, {
      params: {
        language,
      },
    });
    console.log("newres", response);
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

export const Attempts = async () => {
  try {
    const response = await apiClient.get(`/api/self/teacherexamresult/`);
    return response.data;
  } catch (err) {
    console.error("error:", err.response?.data || err);
    throw err;
  }
};

// manage questions service
import axios from "axios";
const API_URL = "http://127.0.0.1:8000";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token dynamically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// manage questions

// get all questions method(GET)

const getQuestions = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/question/");
    return response.data;
  } catch (error) {
    console.error("Error getting questions:", error);
    throw error;
  }
};

// get question by id method(GET)

const getQuestionById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/admin/question/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error getting question by id:", error);
    throw error;
  }
};

// update question method(PUT)

const updateQuestion = async (id, data) => {
  try {
    const response = await axiosInstance.put(
      `/api/admin/question/${id}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
};

// delete question method(DELETE)

const deleteQuestion = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/question/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

// delete all questions method(DELETE)

const deleteAllQuestions = async () => {
  try {
    const response = await axiosInstance.delete("/api/admin/question/");
    return response.data;
  } catch (error) {
    console.error("Error deleting all questions:", error);
    throw error;
  }
};

export {
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  deleteAllQuestions,
};

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

// manage exam

// get all exam method(GET)

export const getExam = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/exam/");
    return response.data;
  } catch (error) {
    console.error("Error getting exam:", error);
    throw error;
  }
};

// get exam by id method(GET)

export const getExamById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/admin/exam/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error getting exam by id:", error);
    throw error;
  }
};

// update exam method(PUT)

export const updateExam = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/admin/exam/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating exam:", error);
    throw error;
  }
};

// delete exam method(DELETE)

export const deleteExam = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/exam/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting exam:", error);
    throw error;
  }
};

// delete all exam method(DELETE)

export const deleteAllExam = async () => {
  try {
    const response = await axiosInstance.delete("/api/admin/exam/");
    return response.data;
  } catch (error) {
    console.error("Error deleting all exam:", error);
    throw error;
  }
};

// create exam method(POST)

export const createExam = async (data) => {
  try {
    const response = await axiosInstance.post("/api/admin/exam/", data);
    return response.data;
  } catch (error) {
    console.error("Error creating exam:", error);
    throw error;
  }
};


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
    const token = localStorage.getItem("AuthToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// manage subjects

// get all subjects method(GET)
const getSubjects = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/subject/");
    return response.data;
  } catch (error) {
    console.error("Error getting subjects:", error);
    throw error;
  }
};

// get subject by id method(GET)
const getSubjectById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/admin/subject/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error getting subject by id:", error);
    throw error;
  }
};

// update subject method(PUT)
const updateSubject = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/admin/subject/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating subject:", error);
    throw error;
  }
};

// delete subject method(DELETE)
const deleteSubject = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/subject/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting subject:", error);
    throw error;
  }
};

// delete all subjects method(DELETE)
const deleteAllSubjects = async () => {
  try {
    const response = await axiosInstance.delete("/api/admin/subject/");
    return response.data;
  } catch (error) {
    console.error("Error deleting all subjects:", error);
    throw error;
  }
};

// create subject method(POST)
const createSubject = async (data) => {
  try {
    const response = await axiosInstance.post("/api/admin/subject/", data);
    return response.data;
  } catch (error) {
    console.error("Error creating subject:", error);
    throw error;
  }
};

// search subject method(GET)
const searchSubject = async (query) => {
  try {
    const response = await axiosInstance.get(
      `/api/admin/subject/?search=${query}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching subject:", error);
    throw error;
  }
};

// count subjects method(GET)
const countSubjects = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/subject/count/");
    return response.data;
  } catch (error) {
    console.error("Error counting subjects:", error);
    throw error;
  }
};

export {
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  deleteAllSubjects,
  createSubject,
  searchSubject,
  countSubjects,
};
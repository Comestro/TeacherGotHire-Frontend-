import axios from "axios";
import { getApiUrl } from "../store/configue";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
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

export const fetchSingleTeacherById = async (teacherId) => {
  try {
    const response = await axiosInstance.get(
      `/api/admin/teacher/${teacherId}/`
    );
    return response.data; // Return the single teacher's data
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "An error occurred while fetching the teacher."
    );
  }
};

const apiService = {
  getAll: async (endpoint) => {
    try {
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error getting data from ${endpoint}:`, error);
      throw error;
    }
  },

  getById: async (endpoint, id) => {
    try {
      const response = await axiosInstance.get(`${endpoint}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error getting data by id from ${endpoint}:`, error);
      throw error;
    }
  },

  create: async (endpoint, data) => {
    try {
      const response = await axiosInstance.post(`${endpoint}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error creating data in ${endpoint}:`, error);
      throw error;
    }
  },

  update: async (endpoint, id, data) => {
    try {
      const response = await axiosInstance.put(`${endpoint}/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating data in ${endpoint}:`, error);
      throw error;
    }
  },

  patch: async (endpoint, id, data) => {
    try {
      const response = await axiosInstance.patch(`${endpoint}/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error patching data in ${endpoint}:`, error);
      throw error;
    }
  },

  delete: async (endpoint, id) => {
    try {
      const response = await axiosInstance.delete(`${endpoint}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting data from ${endpoint}:`, error);
      throw error;
    }
  },

  bulkDelete: async (endpoint, examIds) => {
    try {
      const response = await axiosInstance.post(`${endpoint}bulk-delete/`, {
        ids: examIds,
      });
      return response.data;
    } catch (error) {
      console.error(`Error bulk deleting data from ${endpoint}:`, error);
      throw error;
    }
  },

  deleteAll: async (endpoint) => {
    try {
      const response = await axiosInstance.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error deleting all data from ${endpoint}:`, error);
      throw error;
    }
  },
};

export default apiService;

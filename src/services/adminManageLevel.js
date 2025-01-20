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

// manage level

// get all level method(GET)
const getLevel = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/level/");
    return response.data;
  } catch (error) {
    console.error("Error getting level:", error);
    throw error;
  }
};

// get level by id method(GET)
const getLevelById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/admin/level/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error getting level by id:", error);
    throw error;
  }
};

// update level method(PUT)
const updateLevel = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/admin/level/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating level:", error);
    throw error;
  }
};

// create level method(POST)
const createLevel = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/admin/level/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating level:", error);
    throw error;
  }
};

// delete level method(DELETE)
const deleteLevel = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/level/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting level:", error);
    throw error;
  }
};

// delete all levels method(DELETE)
const deleteAllLevel = async () => {
  try {
    const response = await axiosInstance.delete("/api/admin/level/");
    return response.data;
  } catch (error) {
    console.error("Error deleting all level:", error);
    throw error;
  }
};

export { getLevel, getLevelById, updateLevel, createLevel, deleteLevel, deleteAllLevel };
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/admin/teacher";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {},
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); 
    if (token) {
      config.headers['Authorization'] = `Token ${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Service to fetch filtered teachers
export const fetchTeachers = async (filters) => {
  try {
    const response = await axiosInstance.get("/", {
      params: filters,
    });
    console.log("teacher filter data in service", response.data);
    return response.data;
  } catch (error) {
    // Handle and return the error response
    if (error.response) {
      throw new Error(error.response.data.message || "An error occurred.");
    } else {
      throw new Error("Unable to connect to the server.");
    }
  }
};

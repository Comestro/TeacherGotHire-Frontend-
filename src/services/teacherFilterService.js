import axios from "axios";
import { getApiUrl } from "../store/configue";

const axiosInstance = axios.create({
  baseURL: getApiUrl(),
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

export const fetchTeachers = async (filters) => {
  try {
    
    console.log("filter data", filters);
    const response = await axiosInstance.get("/api/admin/teacher/", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "An error occurred.");
    } else {
      throw new Error("Unable to connect to the server.");
    }
  }
};

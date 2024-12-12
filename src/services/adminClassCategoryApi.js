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

// manage class category

// get all class category method(GET)
export const getClassCategory = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/classcategory/");
    return response.data;
  } catch (error) {
    console.error("Error getting class category:", error);
    throw error;
  }
};

// get class category by id method(GET)
export const getClassCategoryById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/admin/classcategory/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error getting class category by id:", error);
    throw error;
  }
};

// update class category method(PUT)
export const updateClassCategory = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/admin/classcategory/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating class category:", error);
    throw error;
  }
};

// delete class category method(DELETE)
export const deleteClassCategory = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/classcategory/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting class category:", error);
    throw error;
  }
};

// delete all class category method(DELETE)
export const deleteAllClassCategory = async () => {
  try {
    const response = await axiosInstance.delete("/api/admin/classcategory/");
    return response.data;
  } catch (error) {
    console.error("Error deleting all class category:", error);
    throw error;
  }
}

// create class category method(POST)
export const createClassCategory = async (data) => {
  try {
    const response = await axiosInstance.post("/api/admin/classcategory/", data);
    return response.data;
  } catch (error) {
    console.error("Error creating class category:", error);
    throw error;
  }
};
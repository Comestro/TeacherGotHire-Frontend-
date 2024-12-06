// Code to interact with the backend for the admin teacher management

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

// manage teachers

// get all teachers method(GET)
const getTeachers = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/teacher/");
    return response.data;
  } catch (error) {
    console.error("Error getting teachers:", error);
    throw error;
  }
};

// get teacher by id method(GET)
const getTeacherById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/admin/teacher/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error getting teacher by id:", error);
    throw error;
  }
};

// update teacher method(PUT)
const updateTeacher = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/admin/teacher/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating teacher:", error);
    throw error;
  }
};

// delete teacher method(DELETE)
const deleteTeacher = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/teacher/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting teacher:", error);
    throw error;
  }
};

// delete all teachers method(DELETE)
const deleteAllTeachers = async () => {
  try {
    const response = await axiosInstance.delete("/api/admin/teacher/");
    return response.data;
  } catch (error) {
    console.error("Error deleting all teachers:", error);
    throw error;
  }
};

// create teacher method(POST)
const createTeacher = async (data) => {
  try {
    const response = await axiosInstance.post("/api/admin/teacher/", data);
    return response.data;
  } catch (error) {
    console.error("Error creating teacher:", error);
    throw error;
  }
};

// search teacher method(GET)
const searchTeacher = async (query) => {
  try {
    const response = await axiosInstance.get(
      `/api/admin/teacher/?search=${query}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching teacher:", error);
    throw error;
  }
};

// count teachers method(GET)
const countTeachers = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/teacher/count/");
    return response.data;
  } catch (error) {
    console.error("Error counting teachers:", error);
    throw error;
  }
};

export {
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  deleteAllTeachers,
  createTeacher,
  searchTeacher,
  countTeachers,
};
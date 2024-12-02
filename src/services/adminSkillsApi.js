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

// manage skills

// get all skills method(GET)
const getSkills = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/skill/");
    return response.data;
  } catch (error) {
    console.error("Error getting skills:", error);
    throw error;
  }
};

// get skill by id method(GET)
const getSkillById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/admin/skill/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error getting skill by id:", error);
    throw error;
  }
};

// update skill method(PUT)
const updateSkill = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/admin/skill/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating skill:", error);
    throw error;
  }
};

// delete skill method(DELETE)
const deleteSkill = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/skill/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting skill:", error);
    throw error;
  }
};

// delete all skills method(DELETE)
const deleteAllSkills = async () => {
  try {
    const response = await axiosInstance.delete("/api/admin/skill/");
    return response.data;
  } catch (error) {
    console.error("Error deleting all skills:", error);
    throw error;
  }
};

// create skill method(POST)
const createSkill = async (data) => {
  try {
    const response = await axiosInstance.post("/api/admin/skill/", data);
    return response.data;
  } catch (error) {
    console.error("Error creating skill:", error);
    throw error;
  }
};

// search skill method(GET)
const searchSkill = async (query) => {
  try {
    const response = await axiosInstance.get(
      `/api/admin/skill/?search=${query}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching skill:", error);
    throw error;
  }
};

// count skills method(GET)
const countSkills = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/skill/count/");
    return response.data;
  } catch (error) {
    console.error("Error counting skills:", error);
    throw error;
  }
};

export {
  getSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
  deleteAllSkills,
  createSkill,
  searchSkill,
  countSkills,
};
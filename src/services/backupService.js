import axios from "axios";
import { getApiUrl } from "../store/configue";

const API_URL = getApiUrl();
const token = localStorage.getItem("access_token");

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Token ${token}`
  },
});

export const getBackups = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/backup/");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createBackup = async () => {
  try {
    const response = await axiosInstance.post("/api/admin/backup/");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const restoreBackup = async (filename) => {
  try {
    const response = await axiosInstance.post("/api/admin/restore/", { filename });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

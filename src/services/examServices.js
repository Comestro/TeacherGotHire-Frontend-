import axios from "axios";
import { getApiUrl } from "../store/configue";

const apiClient = axios.create({
  baseURL: getApiUrl(), // Use the API URL from config service
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token"); // Fetch the token from localStorage
    if (token) {
      config.headers["Authorization"] = `Token ${token}`; // Add the token to the header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {

      localStorage.removeItem("access_token"); // Clear the token
      // window.location.href = "/signin"; // Redirect to login page - Removed to prevent refresh loop
    }
    return Promise.reject(error);
  }
);

// export const addExamCard = async ({subject_id,class_category_id,level_id}) => {
//   try {
//     const response = await apiClient.post(`api/self/new/exam/exam/`,{subject_id,class_category_id,level_id});
//     
//     return response.data;
//   } catch (err) {
//     
//     throw err;
//   }
// };
export const addExamCard = async ({ subject_id, class_category_id, level_id }) => {
  try {
    const params = new URLSearchParams();

    // Only append parameters that exist
    if (subject_id) params.append('subject_id', subject_id);
    if (class_category_id) params.append('class_category_id', class_category_id);
    if (level_id) params.append('level_id', level_id);

    const response = await apiClient.get(`api/self/new/exam/exam/?${params.toString()}`);

    return response.data;
  } catch (err) {

    throw err;
  }
};

export const fetchLevel = async () => {
  try {
    const response = await apiClient.get(`/api/admin/level/`);
    return response.data;
  } catch (err) {

    throw err;
  }
};
export const checkPasskey = async (exam) => {
  try {
    const response = await apiClient.post(`/api/check-passkey/`, exam);

    return response.data;
  } catch (err) {

    throw err;
  }
};
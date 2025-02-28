import axios from "axios";

const API_URL = "https://api.ptpinstitute.com/";

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

export const fetchTeacherById = async (id) => {
  try {
    const response = await axiosInstance.get(`api/admin/teacher/${id}`);
    return response.data;
    if (!response.ok) throw new Error("Teacher not found");
  } catch (error) {
    throw new Error(error.message);
  }
};

// export const updateEducationProfile = async ({ payload, id }) => {
//   try {
//     console.log("payload", payload, id);
//     const response = await apiClient.put(
//       `api/self/teacherqualification/${id}/`,
//       payload
//     );
//     console.log("eduresponse", response);
//     return JSON.parse(JSON.stringify(response));
//   } catch (err) {
//     console.error("API Error:", err.response?.data || err.message);

//     // Extract validation errors
//     const errorMessage =
//       err.response?.data && typeof err.response.data === "object"
//         ? Object.values(err.response.data).flat().join(", ") // Convert nested errors to a string
//         : err.message || "Failed to update education profile";

//     throw new Error(errorMessage);
//   }
// };

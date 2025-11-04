import axios from "axios";
import { getApiUrl } from "../store/configue";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const axiosInstance = axios.create({
  baseURL: getApiUrl(),
  headers: {},
  withCredentials: true,
});

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

export const fetchTeachers = createAsyncThunk(
  "teachers/fetchTeachers",
  async (filters, { rejectWithValue }) => {
    try {
      // Build query string manually to handle array parameters
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        
        // Handle array values (send as multiple params with same key)
        if (Array.isArray(value) && value.length > 0) {
          value.forEach(item => {
            params.append(key, item);
          });
        }
        // Handle object values (like experience_years, total_marks)
        else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          if (value.min !== "" && value.min !== undefined) {
            params.append(`${key}_min`, value.min);
          }
          if (value.max !== "" && value.max !== undefined) {
            params.append(`${key}_max`, value.max);
          }
        }
        // Handle simple string/number values
        else if (value !== "" && value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
      
      const response = await axiosInstance.get(`/api/new/teacher/?${params.toString()}`);
      return response.data; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "An error occurred."
      );
    }
  }
);

export const searchTeachers = createAsyncThunk(
  "teachers/searchTeachers",
  async (searchValue, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/admin/teacherSearch/", {
        params: { search: searchValue },
      });
      
      return response.data;
    } catch (error) {}
  }
);

const teacherSlice = createSlice({
  name: "teachers",
  initialState: {
    data: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload; // Store fetched data
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
    builder
      .addCase(searchTeachers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(searchTeachers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(searchTeachers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default teacherSlice.reducer;

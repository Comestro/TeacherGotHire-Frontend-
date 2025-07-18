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
    console.log("filter data in slice", filters);
    try {
      const response = await axiosInstance.get("/api/admin/teacher/", {
        params: filters,
      });
      // console.log("filter data in slice", response.data);
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
      console.log("search data in slice", response.data);
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

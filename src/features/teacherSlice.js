import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchTeachers } from "../services/teacherFilterService";

// Async Thunk for fetching filtered teachers
export const fetchFilteredTeachers = createAsyncThunk(
  "teachers/fetchFilteredTeachers",
  async (filters, { rejectWithValue }) => {
    try {
      return await fetchTeachers(filters);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const teacherSlice = createSlice({
  name: "teachers",
  initialState: {
    teachers: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilteredTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilteredTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload;
      })
      .addCase(fetchFilteredTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default teacherSlice.reducer;

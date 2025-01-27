// src/store/slices/teacherSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTeachers } from '../services/teacherFilterService';

// Async thunk to fetch teachers
export const fetchFilteredTeachers = createAsyncThunk(
  'teachers/fetchFilteredTeachers',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await fetchTeachers(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const teacherSlice = createSlice({
  name: 'teachers',
  initialState: {
    teacherData: [],
    filters: {
      district: [],
      pincode: [],
      block: [],
      village: [],
      qualification: [],
      experience: [],
      skill: [],
    },
    loading: false,
    error: null,
  },
  reducers: {
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        district: [],
        pincode: [],
        block: [],
        village: '',
        qualification: [],
        experience: '',
        skill: [],
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilteredTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilteredTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teacherData = action.payload;
      })
      .addCase(fetchFilteredTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateFilters, resetFilters } = teacherSlice.actions;
export default teacherSlice.reducer;

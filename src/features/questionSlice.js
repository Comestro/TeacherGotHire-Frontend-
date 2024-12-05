import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for the API
const API_BASE_URL = 'http://127.0.0.1:8000/api/admin/question/';

// Async Thunk for fetching questions
export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_BASE_URL);
      // Ensure the response has valid data
      if (response.status === 200 && response.data) {
        return response.data; // Assuming the API returns an array of questions
      } else {
        return rejectWithValue('Invalid response from the server');
      }
    } catch (error) {
      // Handle various types of errors
      if (error.response) {
        // Server returned an error response
        return rejectWithValue(error.response.data || 'Server Error');
      } else if (error.request) {
        // Request was made but no response was received
        return rejectWithValue('No response from the server. Please try again.');
      } else {
        // Other errors (network issues, etc.)
        return rejectWithValue(error.message || 'An unexpected error occurred');
      }
    }
  }
);

const questionSlice = createSlice({
  name: 'questions',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch questions';
      });
  },
});

export default questionSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: false, // Indicates if the user is logged in
  userData: null, // Stores user data after login
  error: null, // Stores error messages
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signup: (state, action) => {
      state.status = true;
      state.userData = action.payload;
      state.error = action.payload.error; // Clear any previous errors
    },
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload;
      state.error = null; // Clear any previous errors
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
      state.error = null; // Clear errors on logout
    },
    setError: (state, action) => {
      state.error = action.payload; // Update error state
    },
    clearError: (state) => {
      state.error = null; // Clear error state
    },
  },
});

export const { signup,login, logout, setError, clearError } = authSlice.actions;

export default authSlice.reducer;

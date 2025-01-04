
import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
import {createaccount,createRecruiteraccount,fetchUserData} from "../services/authServices";

const initialState = {
  userData: {},
  recruiterData: {},
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null, // Stores user data after login
};

export const getUserData = createAsyncThunk(
  "getUserData",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchUserData();
      //console.log("gedata",data)
       // Call the service
      return data; // Return the updated profile data
    } catch (error) {
      return rejectWithValue({
        message: error.message, // Only include the error message
        code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
      });
    }
  }
);
export const getPostData = createAsyncThunk(
  "getPostData",
  async ({ Fname, Lname, email, password }, { rejectWithValue }) => {
    try {
      const data = await createaccount({ Fname, Lname, email, password });
      //console.log("gedata",data)
       // Call the service
      return data; // Return the updated profile data
    } catch (error) {
      return rejectWithValue({
        message: error.message, // Only include the error message
        code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
      });
    }
  }
);

export const recruiterPostData = createAsyncThunk(
  "auth/recruiterPostData",
  async ({ Fname, Lname, email, password }, { rejectWithValue }) => {
    try {
      const data = await createRecruiteraccount({ Fname, Lname, email, password });
      //console.log("gedata",data)
       // Call the service
      return data; // Return the updated profile data
    } catch (error) {
      return rejectWithValue({
        message: error.message, // Only include the error message
        code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
      });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // for handeling  basic profile
    builder
      // Handle pending state
      .addCase(getUserData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      // Handle fulfilled state
      .addCase(getUserData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userData = action.payload; 
      
      })
      // Handle rejected state
      .addCase(getUserData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
      

      //for post data handel
     
      builder
      // Handle pending state
      .addCase(getPostData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      // Handle fulfilled state
      .addCase(getPostData.fulfilled, (state, action) => {
        state.status = "succeeded";
        //state.userData = action.payload;
      })
      // Handle rejected state
      .addCase(getPostData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });

      builder
      // Handle pending state
      .addCase(recruiterPostData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      // Handle fulfilled state
      .addCase(recruiterPostData.fulfilled, (state, action) => {
        state.status = "succeeded";
        //state.userData = action.payload;
      })
      // Handle rejected state
      .addCase(recruiterPostData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
    },
});


export default authSlice.reducer;


import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
import {createaccount,createRecruiterAccount,fetchUserData} from "../services/authServices";

const initialState = {
  userData: {},
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
export const createRecruiter = createAsyncThunk(
  "auth/createRecruiter",
  async ({ Fname, Lname, email, password }, { rejectWithValue }) => {
    try {
      const data = await createRecruiterAccount({ Fname, Lname, email, password });
      return data; // Return the recruiter data after successful registration
    } catch (error) {
      return rejectWithValue({
        message: error.message, // Provide error message
        code: error.code || "UNKNOWN_ERROR", // Add custom error code
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



      // recruiter data

      builder
      // Handle pending state
      .addCase(createRecruiter.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      // Handle fulfilled state
      .addCase(createRecruiter.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userData = action.payload; 
      
      })
      // Handle rejected state
      .addCase(createRecruiter.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
    },
});


export default authSlice.reducer;

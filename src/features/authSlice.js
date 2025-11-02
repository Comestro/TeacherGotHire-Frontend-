import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createaccount,
  createRecruiteraccount,
  fetchUserData,
  logout,
  resendOtp,
} from "../services/authServices";
import { persistor } from "../store/store";

const initialState = {
  userData: {},
  resendotp: {},
  recruiterData: {},
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null, // Stores user data after login
};

export const getUserData = createAsyncThunk(
  "getUserData",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchUserData();
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
      const data = await createRecruiteraccount({
        Fname,
        Lname,
        email,
        password,
      });
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

export const getResendOtp = createAsyncThunk(
  "getResendOtp",
  async (email, { rejectWithValue }) => {
    try {
      const data = await resendOtp(email);
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

export const userLogout = createAsyncThunk(
  "userLogout", async (_, { rejectWithValue }) => {
    try {
      await logout();
      return { success: true };
    } catch (error) {
      console.error("Error in userLogout:", error);
      // Still return success since local logout was done in the service
      return { success: true };
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

    builder
      // Handle pending state
      .addCase(getResendOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getResendOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.resendotp = action.payload;
      })

      // Handle rejected state
      .addCase(getResendOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });

    builder
      .addCase(userLogout.pending, (state) => {
        state.status = "loading";
        state.error = null; 
      })
      .addCase(userLogout.fulfilled, () => {
        return initialState; // Reset state to initial
      })
      .addCase(userLogout.rejected, () => {
        // Even if rejected, we want to reset the state
        return initialState;
      });
  },
});

export default authSlice.reducer;

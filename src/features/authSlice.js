import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createaccount,
  createRecruiteraccount,
  fetchUserData,
 
  resendOtp,
} from "../services/authServices";
import {persistor} from "../store/store"
// import { persistor } from "../store"; // Import persistor

const initialState = {
  userData: {},
  resendotp:{},
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
      console.log("gedata", data);
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

// export const userLogout = createAsyncThunk(
//   "user/logout",
//   async (_, { rejectWithValue }) => {
//     try {
//       

//       console.log("heloo")
//       console.log("token",token);

//       if (!token) {
//         throw new Error("No token found. Already logged out?");
//       }

//       const response = await fetch("http://127.0.0.1:8000/api/logout/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`, // Ensure token is sent

//         },
//       });

//       if (!response.ok) {
//         throw new Error("Logout failed. Server response: " + response.statusText);
//       }

//       // localStorage.removeItem("access_token");
//       // localStorage.removeItem("role");
//       // localStorage.removeItem("persist:root");

//       //persistor.purge(); // Clears Redux state

//       await persistor.purge(); 
//       await persistor.flush(); 

//       return {};
//     } catch (error) {
//       return rejectWithValue(error.message || "Logout failed.");
//     }
//   }
// );


export  const  userLogout = createAsyncThunk(
  "userLogout", async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      console.log("Token:", token); // Ensure this runs
    
      if (!token) {
        throw new Error("No token found.");
      }
    
      const response = await fetch("http://127.0.0.1:8000/api/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    
    } catch (error) {
      console.error("Error in userLogout:", error);
    }}
)


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
      .addCase(userLogout.fulfilled, () =>   {
        return { ...initialState }; // 🛑 Completely reset state to initial
      }
    )      
      .addCase(userLogout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; 
      });
  },
});

export default authSlice.reducer;

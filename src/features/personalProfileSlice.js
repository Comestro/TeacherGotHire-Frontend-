
import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
import { updatePersonalProfile } from "../services/profileServices";
import { fetchPersonalProfile } from "../services/profileServices";


// const initialState={
// user_id : "",
// fullname: "",
// gender: "",
// religion: "",
// nationality: "",
// image: "",
// aadhar_no: "",
// phone: "",
// alternate_phone: "",
// verified: "",
// class_categories: "",
// rating: "",
// date_of_birth:"",
// status: "idle",  // 'idle' | 'loading' | 'succeeded' | 'failed'
// error: null,
// profileData:[],
// }

// Initial state
const initialState = {
  profileData: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Thunk for fetching personal profile
export const getProfile = createAsyncThunk(
  "getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchPersonalProfile();
      console.log("data",data)
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

export const postProfile = createAsyncThunk(
  "postProfile",
  async (personalData, { rejectWithValue }) => {
    try {
      const data = await updatePersonalProfile(personalData);
      console.log("data",data)
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

// Redux slice
const personalProfileSlice = createSlice({
  name: "personalProfile",
  initialState,
  reducers: {}, // Add reducers if needed
  extraReducers: (builder) => {
    // for get data handeling
    builder
      // Handle pending state
      .addCase(getProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      // Handle fulfilled state
      .addCase(getProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profileData = action.payload; // Update profile data
        //Object.assign(state, action.payload);
        //console.log(profileData)
        console.log(action.payload)
      })
      // Handle rejected state
      .addCase(getProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
      

      //for post data handel
     
      builder
      // Handle pending state
      .addCase(postProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      // Handle fulfilled state
      .addCase(postProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profileData = action.payload; // Update profile data
        //Object.assign(state, action.payload);
        //console.log(profileData)
        console.log(action.payload)
      })
      // Handle rejected state
      .addCase(postProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
      
  },
});

// Export reducer
export default personalProfileSlice.reducer;

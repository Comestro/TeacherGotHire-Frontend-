
import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
import {fetchAddressProfile,updateAddressProfile }from "../services/profileServices";
import {updateBasicProfile,fetchBasicProfile} from "../services/profileServices"



// Initial state
const initialState = {
  basicData:{},
  personalData:{},
  address:{},
  showForm: false,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};
export const getBasic = createAsyncThunk(
  "getBasic",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchBasicProfile();
      console.log("gedata",data)
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

export const postBasic = createAsyncThunk(
  "postBasic",
  async (basicData, { rejectWithValue }) => {
    try {
     const data = await updateBasicProfile(basicData);
      console.log("podata",data)
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

export const getAddress = createAsyncThunk(
  "getAddress",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAddressProfile();
     // console.log("data",data)
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

export const postAddress = createAsyncThunk(
  "postAddress",
  async (addressData, { rejectWithValue }) => {
    try {
      const data = await updateAddressProfile(addressData);
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
  reducers: {
    setShowForm(state, action) {
      state.showForm = action.payload;
    },
  }, // Add reducers if needed
    extraReducers: (builder) => {
      // for handeling  basic profile
      builder
        // Handle pending state
        .addCase(getBasic.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        // Handle fulfilled state
        .addCase(getBasic.fulfilled, (state, action) => {
          state.status = "succeeded";
          
         // state.basicData = action.payload; 
          console.log("hi",action.payload);// Update profile data
          //Object.assign(state, action.payload);
          //console.log(profileData)
          console.log(action.payload)
        })
        // Handle rejected state
        .addCase(getBasic.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });
        
  
        //for post data handel
       
        builder
        // Handle pending state
        .addCase(postBasic.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        // Handle fulfilled state
        .addCase(postBasic.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.basicData = action.payload;
          console.log("hello",action.payload); // Update profile data
          //Object.assign(state, action.payload);
          //console.log(profileData)
          console.log("payload",action.payload)
        })
        // Handle rejected state
        .addCase(postBasic.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });
  
      // for handeling  address 
      builder
        // Handle pending state
        .addCase(getAddress.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        // Handle fulfilled state
        .addCase(getAddress.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.addsress = action.payload; // Update profile data
          //Object.assign(state, action.payload);
          //console.log(profileData)
          console.log(action.payload)
        })
        // Handle rejected state
        .addCase(getAddress.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });
        
  
        //for post data handel
       
        builder
        // Handle pending state
        .addCase(postAddress.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        // Handle fulfilled state
        .addCase(postAddress.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.addsress = action.payload; // Update profile data
          //Object.assign(state, action.payload);
          //console.log(profileData)
          console.log(action.payload)
        })
        // Handle rejected state
        .addCase(postAddress.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });
  
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

export const { setShowForm } = personalProfileSlice.actions;
export default personalProfileSlice.reducer;

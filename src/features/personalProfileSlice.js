
import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
import {fetchAddressProfile,updateAddressProfile ,addAddressProfile}from "../services/profileServices";
import {updateBasicProfile,fetchBasicProfile,fetchCompleteProfile} from "../services/profileServices"



// Initial state
const initialState = {
  basicData:{},
  personalData:{},
  address:[],
  completionData :'',
  showForm: false,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const getProfilCompletion = createAsyncThunk(
  "getProfilCompletion",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCompleteProfile();
      return data; 
    } catch (error) {
      return rejectWithValue({
        message: error.message, // Only include the error message
        code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
      });
    }
  }
);

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
      const data = await addAddressProfile(addressData);
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
export const putAddress = createAsyncThunk(
  "putAddress",
  async (updateData, { rejectWithValue }) => {
    try {
      const data = await updateAddressProfile(updateData);
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
          
          state.basicData = action.payload; 
          console.log("hi",action.payload);// Update profile data
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
          // state.basicData = action.payload; i will not update the basic data after post b
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
          state.address = action.payload; // Update profile data
          //Object.assign(state, action.payload);
          //console.log(profileData)
          console.log("address",action.payload);
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
         // state.address = action.payload; // Update profile data
        })
        // Handle rejected state
        .addCase(postAddress.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });

        builder
        // Handle pending state
        .addCase(putAddress.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        // Handle fulfilled state
        .addCase(putAddress.fulfilled, (state, action) => {
          state.status = "succeeded";
          //state.address = action.payload; // Update profile data
        })
        // Handle rejected state
        .addCase(putAddress.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });

        builder
      
        .addCase(getProfilCompletion.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        
        .addCase(getProfilCompletion.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.completionData = action.payload; // Update profile data
        })
        
        .addCase(getProfilCompletion.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });
      }    

      
});

// Export reducer

export const { setShowForm } = personalProfileSlice.actions;
export default personalProfileSlice.reducer;

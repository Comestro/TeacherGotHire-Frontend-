
import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
import {fetchAddressProfile,updateAddressProfile ,addAddressProfile}from "../services/profileServices";
import {updateBasicProfile,fetchBasicProfile,fetchCompleteProfile} from "../services/profileServices"
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
      return data; // Return the updated profile data
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const putAddress = createAsyncThunk(
  "putAddress",
  async (updateData, { rejectWithValue }) => {
    try {
      const data = await updateAddressProfile(updateData);
      return data; // Return the updated profile data
    }catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getProfile = createAsyncThunk(
  "getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchPersonalProfile();
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
      return data; // Return the updated profile data
    } catch (error) {
      return rejectWithValue({
        message: error.message, // Only include the error message
        code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
      });
    }
  }
);
const personalProfileSlice = createSlice({
  name: "personalProfile",
  initialState,
  reducers: {
    setShowForm(state, action) {
      state.showForm = action.payload;
    },
    resetError: (state) => {
      state.error = null; // Reset error state
    },
  }, // Add reducers if needed
    extraReducers: (builder) => {
      builder
        .addCase(getBasic.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(getBasic.fulfilled, (state, action) => {
          state.status = "succeeded";
          
          state.basicData = action.payload; 
          
        })
        .addCase(getBasic.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });
       
        builder
        .addCase(postBasic.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(postBasic.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.basicData = action.payload;
        })
        .addCase(postBasic.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });
      builder
        .addCase(getAddress.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(getAddress.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.address = action.payload; // Update profile data
          
        })
        .addCase(getAddress.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });
       
        builder
        .addCase(postAddress.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(postAddress.fulfilled, (state, action) => {
          state.status = "succeeded";
        })
        .addCase(postAddress.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });

        builder
        .addCase(putAddress.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(putAddress.fulfilled, (state, action) => {
          state.status = "succeeded";
        })
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

export const { setShowForm ,resetError} = personalProfileSlice.actions;
export default personalProfileSlice.reducer;

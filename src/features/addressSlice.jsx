import { createSlice ,createAsyncThunk} from "@reduxjs/toolkit";

const initialState ={
addsress:[],
status: "idle",  // 'idle' | 'loading' | 'succeeded' | 'failed'
error: null,
}

export const getAddress = createAsyncThunk(
  "getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAddressProfile();
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
export const postAddress = createAsyncThunk(
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

  const addressProfileSlice = createSlice({
    name: 'addressProfile',
    initialState,
    reducers:{},

    extraReducers: (builder) => {
      // for get data handeling
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
        
    },
  });
  
    
export default addressProfileSlice.reducer



import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
import { updateEducationProfile,fetchEducationProfile} from "../services/jobProfileService";
import { updateSkillsProfile,fetchSkillsProfile } from "../services/jobProfileService";
import { updateExprienceProfile,fetchExprienceProfile } from "../services/jobProfileService";


const initialState = {
  educationData: [],
  skillsData:[],
  exprienceData:[],
  status: "idle", 
  error: null,
};

// Thunk for handling  education profile
export const getEducationProfile = createAsyncThunk(
  "getEducationProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchEducationProfile();
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

export const postEducationProfile = createAsyncThunk(
  "postEducationProfile",
  async (personalData, { rejectWithValue }) => {
    try {
      const data = await updateEducationProfile(personalData);
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

// Thunk for handling skills profile

export const getSkillsProfile = createAsyncThunk(
    "getSkillProfile",
    async (_, { rejectWithValue }) => {
      try {
        const data = await fetchSkillsProfile ();
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
  
  export const postSkillsProfile = createAsyncThunk(
    "postSkillProfile",
    async (personalData, { rejectWithValue }) => {
      try {
        const data = await updateExprienceProfile(personalData);
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

  export const getExprienceProfile = createAsyncThunk(
    "getSkillProfile",
    async (_, { rejectWithValue }) => {
      try {
        const data = await fetchExprienceProfile ();
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
  
  export const postExprienceProfile = createAsyncThunk(
    "postSkillProfile",
    async (personalData, { rejectWithValue }) => {
      try {
        const data = await updateSkillsProfile(personalData);
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
const jobProfileSlice = createSlice({
  name: "jobProfile",
  initialState,
  reducers: {}, // Add reducers if needed
  extraReducers: (builder) => {
    // handling education profile
    builder
    // for get data handeling
      .addCase(getEducationProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getEducationProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profileData = action.payload; // Update profile data
        //Object.assign(state, action.payload);
        //console.log(profileData)
        console.log(action.payload)
      })
      .addCase(getEducationProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
      

      //for post data handel
     
      builder
      .addCase(postEducationProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(postEducationProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profileData = action.payload; // Update profile data
        //Object.assign(state, action.payload);
        //console.log(profileData)
        console.log(action.payload)
      })
      .addCase(postEducationProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
      

      // hadle skills profile


      // builder
      // .addCase(getSkillsProfile.pending, (state) => {
      //   state.status = "loading";
      //   state.error = null;
      // })
      // .addCase(getSkillsProfile.fulfilled, (state, action) => {
      //   state.status = "succeeded";
      //   state.skillsData = action.payload; // Update profile data
      //   //Object.assign(state, action.payload);
      //   //console.log(profileData)
      //   console.log(action.payload)
      // })
      // .addCase(getSkillsProfile.rejected, (state, action) => {
      //   state.status = "failed";
      //   state.error = action.payload; // Set error from rejected payload
      // });
      

      // //for post data handel
     
      // builder
      // .addCase(postSkillsProfile.pending, (state) => {
      //   state.status = "loading";
      //   state.error = null;
      // })
      // .addCase(postSkillsProfile.fulfilled, (state, action) => {
      //   state.status = "succeeded";
      //   state.skillsData = action.payload; // Update profile data
      //   //Object.assign(state, action.payload);
      //   //console.log(profileData)
      //   console.log(action.payload)
      // })
      // .addCase(postSkillsProfile.rejected, (state, action) => {
      //   state.status = "failed";
      //   state.error = action.payload; // Set error from rejected payload
      // });
      
       // handling education profile
    builder
    // for get data handeling
      .addCase(getExprienceProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getExprienceProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.exprienceData = action.payload; // Update profile data
        //Object.assign(state, action.payload);
        //console.log(profileData)
        console.log(action.payload)
      })
      .addCase(getExprienceProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
      

      //for post data handel
     
      builder
      .addCase(postExprienceProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(postExprienceProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.exprienceData = action.payload; // Update profile data
        //Object.assign(state, action.payload);
        //console.log(profileData)
        console.log(action.payload)
      })
      .addCase(postExprienceProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
      

      // hadle skills profile


      // builder
      // .addCase(getProfile.pending, (state) => {
      //   state.status = "loading";
      //   state.error = null;
      // })
      // .addCase(getProfile.fulfilled, (state, action) => {
      //   state.status = "succeeded";
      //   state.profileData = action.payload; // Update profile data
      //   //Object.assign(state, action.payload);
      //   //console.log(profileData)
      //   console.log(action.payload)
      // })
      // .addCase(getProfile.rejected, (state, action) => {
      //   state.status = "failed";
      //   state.error = action.payload; // Set error from rejected payload
      // });
      

      // //for post data handel
     
      // builder
      // .addCase(postProfile.pending, (state) => {
      //   state.status = "loading";
      //   state.error = null;
      // })
      // .addCase(postProfile.fulfilled, (state, action) => {
      //   state.status = "succeeded";
      //   state.profileData = action.payload; // Update profile data
      //   //Object.assign(state, action.payload);
      //   //console.log(profileData)
      //   console.log(action.payload)
      // })
      // .addCase(postProfile.rejected, (state, action) => {
      //   state.status = "failed";
      //   state.error = action.payload; // Set error from rejected payload
      // });
       // handling education profile
    

      
  },
});

export default jobProfileSlice.reducer;

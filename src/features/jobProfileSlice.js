
import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
//import { updateEducationProfile,fetchEducationProfile} from "../services/jobProfileService";
//import { updateSkillsProfile,fetchSkillsProfile } from "../services/jobProfileService";
//import { updateExprienceProfile,fetchExprienceProfile } from "../services/jobProfileService";
import { fetchClassCategory, fetchSubject } from "../services/jobProfileService";
import { fetchTeacherPrefrence,updateTeacherPrefrence,fetchJobRole,fetchTeacherJobRole} from "../services/jobProfileService";

const initialState = {
  classCategories:[],
  jobRole:[],
  subject:[],
  teacherjobRole:[],
  prefrence:[],
  // educationData: [],
  // skillsData:[],
  // exprienceData:[],
  status: "idle", 
  error: null,
};

export const getClassCategory= createAsyncThunk(
  "getClassCategory",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchClassCategory();
      //console.log("getclass",data)
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
export const getJob= createAsyncThunk(
  "getJob",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchJobRole();
      //console.log("getclass",data)
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

export const getTeacherjobType= createAsyncThunk(
  "getTeacherjobType",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchTeacherJobRole();
      console.log("getteacherjob",data)
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


export const getSubject= createAsyncThunk(
  "getSubject",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchSubject();
      console.log("getsubject",data)
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

export const getPrefrence= createAsyncThunk(
  "getPrefrence",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchTeacherPrefrence();
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

export const postPrefrence = createAsyncThunk(
    "postPrefrence",
    async (prefrenceData, { rejectWithValue }) => {
      try {
        const data = await updateTeacherPrefrence(prefrenceData);
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

// // Thunk for handling  education profile
// export const getEducationProfile = createAsyncThunk(
//   "getEducationProfile",
//   async (_, { rejectWithValue }) => {
//     try {
//       const data = await fetchEducationProfile();
//       console.log("data",data)
//        // Call the service
//       return data; // Return the updated profile data
//     } catch (error) {
//       return rejectWithValue({
//         message: error.message, // Only include the error message
//         code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
//       });
//     }
//   }
// );

// export const postEducationProfile = createAsyncThunk(
//   "postEducationProfile",
//   async (personalData, { rejectWithValue }) => {
//     try {
//       const data = await updateEducationProfile(personalData);
//       console.log("data",data)
//        // Call the service
//       return data; // Return the updated profile data
//     } catch (error) {
//       return rejectWithValue({
//         message: error.message, // Only include the error message
//         code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
//       });
//     }
//   }
// );

// Thunk for handling skills profile

// export const getSkillsProfile = createAsyncThunk(
//     "getSkillProfile",
//     async (_, { rejectWithValue }) => {
//       try {
//         const data = await fetchSkillsProfile ();
//         console.log("data",data)
//          // Call the service
//         return data; // Return the updated profile data
//       } catch (error) {
//         return rejectWithValue({
//           message: error.message, // Only include the error message
//           code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
//         });
//       }
//     }
//   );
  
//   export const postSkillsProfile = createAsyncThunk(
//     "postSkillProfile",
//     async (personalData, { rejectWithValue }) => {
//       try {
//         const data = await updateExprienceProfile(personalData);
//         console.log("data",data)
//          // Call the service
//         return data; // Return the updated profile data
//       } catch (error) {
//         return rejectWithValue({
//           message: error.message, // Only include the error message
//           code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
//         });
//       }
//     }
//   );

//   export const getExprienceProfile = createAsyncThunk(
//     "getSkillProfile",
//     async (_, { rejectWithValue }) => {
//       try {
//         const data = await fetchExprienceProfile ();
//         console.log("data",data)
//          // Call the service
//         return data; // Return the updated profile data
//       } catch (error) {
//         return rejectWithValue({
//           message: error.message, // Only include the error message
//           code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
//         });
//       }
//     }
//   );
  
//   export const postExprienceProfile = createAsyncThunk(
//     "postSkillProfile",
//     async (personalData, { rejectWithValue }) => {
//       try {
//         const data = await updateSkillsProfile(personalData);
//         console.log("data",data)
//          // Call the service
//         return data; // Return the updated profile data
//       } catch (error) {
//         return rejectWithValue({
//           message: error.message, // Only include the error message
//           code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
//         });
//       }
//     }
//   );


// Redux slice
const jobProfileSlice = createSlice({
  name: "jobProfile",
  initialState,
  reducers: {}, // Add reducers if needed
  extraReducers: (builder) => {
    // for handeling  class category
    builder
    // for get data handeling
      .addCase(getClassCategory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getClassCategory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.classCategories = action.payload; // Update profile data
        //console.log("class",action.payload)
      })
      .addCase(getClassCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });

       // for handeling  job role
    builder
    // for get data handeling
      .addCase(getJob.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.jobRole = action.payload; // Update profile data
        //console.log("jobrole",action.payload)
      })
      .addCase(getJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });

       // for handeling  Teacherjob type
    builder
    // for get data handeling
      .addCase(getTeacherjobType.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getTeacherjobType.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.teacherjobRole = action.payload; // Update profile data
        console.log("teacherjobtype",action.payload)
      })
      .addCase(getTeacherjobType.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });

      // for handeling  subject
    builder
    // for get data handeling
      .addCase(getSubject.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getSubject.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.subject = action.payload; 
        console.log("subject",action.payload)
      })
      .addCase(getSubject.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; 
      });
      
 //    handle Teacher prefrence

      // 
      builder
      // for get data handeling
        .addCase(getPrefrence.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(getPrefrence.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.prefrence = action.payload; // Update profile data
          console.log("prefrence",action.payload);
        })
        .addCase(getPrefrence.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });
      

      //for post data handel
     
      // builder
      // .addCase(postEducationProfile.pending, (state) => {
      //   state.status = "loading";
      //   state.error = null;
      // })
      // .addCase(postEducationProfile.fulfilled, (state, action) => {
      //   state.status = "succeeded";
      //   //state.profileData = action.payload; 
      // })
      // .addCase(postEducationProfile.rejected, (state, action) => {
      //   state.status = "failed";
      //   state.error = action.payload; // Set error from rejected payload
      // });
    // handling education profile
    // builder
    // // for get data handeling
    //   .addCase(getEducationProfile.pending, (state) => {
    //     state.status = "loading";
    //     state.error = null;
    //   })
    //   .addCase(getEducationProfile.fulfilled, (state, action) => {
    //     state.status = "succeeded";
    //     state.profileData = action.payload; // Update profile data
    //     //Object.assign(state, action.payload);
    //     //console.log(profileData)
    //     console.log(action.payload)
    //   })
    //   .addCase(getEducationProfile.rejected, (state, action) => {
    //     state.status = "failed";
    //     state.error = action.payload; // Set error from rejected payload
    //   });
      

      //for post data handel
     
      // builder
      // .addCase(postEducationProfile.pending, (state) => {
      //   state.status = "loading";
      //   state.error = null;
      // })
      // .addCase(postEducationProfile.fulfilled, (state, action) => {
      //   state.status = "succeeded";
      //   //state.profileData = action.payload; // Update profile data
      // })
      // .addCase(postEducationProfile.rejected, (state, action) => {
      //   state.status = "failed";
      //   state.error = action.payload; // Set error from rejected payload
      // });
      

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
    //builder
    // // for get data handeling
    //   .addCase(getExprienceProfile.pending, (state) => {
    //     state.status = "loading";
    //     state.error = null;
    //   })
    //   .addCase(getExprienceProfile.fulfilled, (state, action) => {
    //     state.status = "succeeded";
    //     state.exprienceData = action.payload; // Update profile data
    //   })
    //   .addCase(getExprienceProfile.rejected, (state, action) => {
    //     state.status = "failed";
    //     state.error = action.payload; // Set error from rejected payload
    //   });
      

      //for post data handel
     
      // builder
      // .addCase(postExprienceProfile.pending, (state) => {
      //   state.status = "loading";
      //   state.error = null;
      // })
      // .addCase(postExprienceProfile.fulfilled, (state, action) => {
      //   state.status = "succeeded";
      //   state.exprienceData = action.payload; // Update profile data
      // })
      // .addCase(postExprienceProfile.rejected, (state, action) => {
      //   state.status = "failed";
      //   state.error = action.payload; // Set error from rejected payload
      // });  
  },
});

export default jobProfileSlice.reducer;

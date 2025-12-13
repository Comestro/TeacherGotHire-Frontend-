
import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
import { updateEducationProfile,fetchEducationProfile} from "../services/jobProfileService";
import { updateSkillsProfile,fetchSkillsProfile,deleteSkillProfile} from "../services/jobProfileService";
import { addExprienceProfile,updateExprienceProfile,fetchExprienceProfile } from "../services/jobProfileService";
import { fetchClassCategory, fetchSubject,fetchQualification,fetchAllSkills} from "../services/jobProfileService";
import { fetchTeacherPrefrence,updateTeacherPrefrence,fetchJobRole,fetchTeacherJobRole,fetchTeacherJobPrefrenceLocation,updateTeacherJobPrefrenceLocation,deleteTeacherJobPrefrenceLocation,editTeacherJobPrefrenceLocation,deleteExprienceProfile,deleteEducationProfile,addEducationProfile,} from "../services/jobProfileService";

const initialState = {
  classCategories:[],
  jobRole:[],
  subject:[],
  allSkill:[],
  teacherjobRole:[],
  qualification:[],
  prefrence:[],
  prefrenceLocation:[],
  educationData: [],
  teacherSkill:[],
  exprienceData:[],
  status: "idle", 
  error: null,
};

export const getClassCategory= createAsyncThunk(
  "getClassCategory",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchClassCategory();
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
      return data; // Return the updated profile data
    } catch (error) {
      return rejectWithValue({
        message: error.message, // Only include the error message
        code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
      });
    }
  }
);
export const getQualification= createAsyncThunk(
  "getQualificationt",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchQualification();
      return data; // Return the updated profile data
    } catch (error) {
      return rejectWithValue({
        message: error.message, // Only include the error message
        code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
      });
    }
  }
);

export const getAllSkills= createAsyncThunk(
  "getAllSkills",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAllSkills();
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
        return data; // Return the updated profile data
      } catch (error) {
        return rejectWithValue({
          message: error.message, // Only include the error message
          code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
        });
      }
    }
  );

  export const getJobPrefrence= createAsyncThunk(
    "getJobPrefrence",
    async (_, { rejectWithValue }) => {
      try {
        const data = await fetchTeacherJobPrefrenceLocation();
        return data; // Return the updated profile data
      } catch (error) {
        return rejectWithValue({
          message: error.message, // Only include the error message
          code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
        });
      }
    }
  );

  export const postJobPrefrence = createAsyncThunk(
    "postJobPrefrence",
    async (prefrenceData, { rejectWithValue }) => {
      try {
        const data = await updateTeacherJobPrefrenceLocation(prefrenceData);
        
        return data; // Return the updated profile data
      } catch (error) {
        return rejectWithValue({
          message: error.message, // Only include the error message
          code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
        });
      }
    }
  );
  export const editJobPrefrence = createAsyncThunk(
    "editJobPrefrence",
    async (prefrenceData, { rejectWithValue }) => {
      try {
        const data = await editTeacherJobPrefrenceLocation(prefrenceData);
       
        return data; // Return the updated profile data
      } catch (error) {
        return rejectWithValue({
          message: error.message, // Only include the error message
          code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
        });
      }
    }
  );
  export const deleteJobPrefrence = createAsyncThunk(
    "deleteJobPrefrence",
    async (prefrenceData, { rejectWithValue }) => {
      try {
        const data = await deleteTeacherJobPrefrenceLocation(prefrenceData);
       
        return data; // Return the updated profile data
      } catch (error) {
        return rejectWithValue({
          message: error.message, // Only include the error message
          code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
        });
      }
    }
  );
export const getEducationProfile = createAsyncThunk(
  "getEducationProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchEducationProfile();
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
      const data = await addEducationProfile(personalData);
      return data; // Return the updated profile data
    } catch (error) {
      return rejectWithValue({
        message: error.message, // Only include the error message
        code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
      });
    }
  }
);

export const putEducationProfile = createAsyncThunk(
  "putEducationProfile",
  
  async ({payload, id }, { rejectWithValue }) => {
    try {
      const data = await updateEducationProfile({payload, id });
      return data; // Return the updated profile data
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const delEducationProfile = createAsyncThunk(
  "delEducationProfile",
  async (personalData, { rejectWithValue }) => {
    try {
      const data = await deleteEducationProfile(personalData);
      return data; // Return the updated profile data
    } catch (error) {
      return rejectWithValue({
        message: error.message, // Only include the error message
        code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
      });
    }
  }
);

export const getSkillsProfile = createAsyncThunk(
    "getSkillProfile",
    async (_, { rejectWithValue }) => {
      try {
        const data = await fetchSkillsProfile ();
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
        const data = await updateSkillsProfile(personalData);
        return data; // Return the updated profile data
      } catch (error) {
        return rejectWithValue({
          message: error.message, // Only include the error message
          code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
        });
      }
    }
  );

  export const delSkillProfile = createAsyncThunk(
    "delSkillProfile",
    async (skillToRemove, { rejectWithValue }) => {
      try {
        const data = await deleteSkillProfile(skillToRemove);
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
    "getExprienceProfile",
    async (_, { rejectWithValue }) => {
      try {
        const data = await fetchExprienceProfile ();
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
    "postExprienceProfile",
    async (personalData, { rejectWithValue }) => {
      try {
        const data = await addExprienceProfile(personalData);
        return data; // Return the updated profile data
      } catch (error) {
        return rejectWithValue(error);
      }
    }
  );

  export const putExprienceProfile = createAsyncThunk(
    "putExprienceProfile",
    async ({payload, id }, { rejectWithValue }) => {
      try {
        const data = await updateExprienceProfile({payload, id });
        return data; // Return the updated profile data
      } catch (error) {
        return rejectWithValue({
          message: error.message, // Only include the error message
          code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
        });
      }
    }
  );

  export const delExprienceProfile = createAsyncThunk(
    "delExprienceProfile",
    async (personalData, { rejectWithValue }) => {
      try {
        const data = await deleteExprienceProfile(personalData);
        return data; // Return the updated profile data
      } catch (error) {
        return rejectWithValue({
          message: error.message, // Only include the error message
          code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
        });
      }
    }
  );
const jobProfileSlice = createSlice({
  name: "jobProfile",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null; // Reset error state
    },
  }, // Add reducers if needed
  extraReducers: (builder) => {
    builder
      .addCase(getClassCategory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getClassCategory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.classCategories = action.payload; // Update profile data
      })
      .addCase(getClassCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
    builder
      .addCase(getJob.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.jobRole = action.payload; // Update profile data
      })
      .addCase(getJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
    builder
    
      .addCase(getTeacherjobType.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getTeacherjobType.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.teacherjobRole = action.payload; // Update profile data
      })
      .addCase(getTeacherjobType.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
    builder
      .addCase(getSubject.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getSubject.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.subject = action.payload; 
      })
      .addCase(getSubject.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; 
      });
    builder
      .addCase(getQualification.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getQualification.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.qualification = action.payload; 
      })
      .addCase(getQualification.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; 
      });
    
    builder
      .addCase(getAllSkills.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAllSkills.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allSkill = action.payload; 
      })
      .addCase(getAllSkills.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; 
      });

      builder
        .addCase(getPrefrence.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(getPrefrence.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.prefrence = action.payload; // Update profile data
        })
        .addCase(getPrefrence.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });

    builder
      .addCase(getJobPrefrence.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getJobPrefrence.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.prefrenceLocation = action.payload; // Update profile data
        
      })
      .addCase(getJobPrefrence.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
    
      builder
        .addCase(postJobPrefrence.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(postJobPrefrence.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.prefrenceLocation = action.payload; // Update profile data
          
        })
        .addCase(postJobPrefrence.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });

        builder
        .addCase(deleteJobPrefrence.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(deleteJobPrefrence.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.prefrenceLocation = action.payload; // Update profile data
          
        })
        .addCase(deleteJobPrefrence.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });

        builder
        .addCase(editJobPrefrence.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(editJobPrefrence.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.prefrenceLocation = action.payload; // Update profile data
          
        })
        .addCase(editJobPrefrence.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload; // Set error from rejected payload
        });
    builder
      .addCase(getEducationProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getEducationProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.educationData = action.payload; // Update profile data
      })
      .addCase(getEducationProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
     
      builder
      .addCase(postEducationProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(postEducationProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });

      builder
      .addCase(putEducationProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(putEducationProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });


      builder
      .addCase(getSkillsProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getSkillsProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.teacherSkill = action.payload; // Update profile data
      })
      .addCase(getSkillsProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
    builder
      .addCase(getExprienceProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getExprienceProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.exprienceData = action.payload; // Update profile data
      })

      .addCase(getExprienceProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Set error from rejected payload
      });
  },
});

export const {resetError} = jobProfileSlice.actions;
export default jobProfileSlice.reducer;

import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
import { fetchQuestion,fetchExam,addResult,Attempts, fetchLevel,GeneratePasskey,VerifyPasscode, AttemptCount} from "../services/examQuesServices";

const initialState = {
  allQuestion: [],
  examSet: [],
  exam: "",
  attempts: [],
  attemptCount: [],
  levels:[],
  subject: "",
  language: "",
  status: "idle",
  loading: false,
  error: null,
};

export const getLevels = createAsyncThunk(
  "getLevels",
  async (_, { rejectWithValue }) => {
    
    try {
      const data = await fetchLevel();
      return data;
    } catch (error) {
      console.log('Error in getLevels:', error);
      let errorMessage = 'An error occurred';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
        
      } else if (error.message) {
        errorMessage = error.message;
       
      }
      return rejectWithValue(errorMessage);
    }
  }
);
export const getAllQues = createAsyncThunk(
  "getAllQues",
  async ({ exam_id, language }, { rejectWithValue }) => {
    console.log("exam_id, language ",exam_id, language )
    try {
      const data = await fetchQuestion({ exam_id, language });
      return data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
);

  export const getExamSet= createAsyncThunk(
    "getExamSet",
    async ({ level_id, subject_id,type }, { rejectWithValue }) => {
      console.log("exa",{ level_id, subject_id })
      try {
        const data = await fetchExam({ level_id, subject_id,type });
        console.log("examSet",data)
         return data; 
      } catch (error) {
        return rejectWithValue({
          message: error.message, 
          code: error.code || "UNKNOWN_ERROR", 
        });
      }
    }
  );

  export const postResult= createAsyncThunk(
    "postResult",
    async ({ exam,correct_answer,
      incorrect_answer,
      is_unanswered}, { rejectWithValue }) => {
      console.log("result",{ correct_answer,
        incorrect_answer,
        is_unanswered,})
      try {
        const data = await addResult({ exam,correct_answer,
          incorrect_answer,
          is_unanswered,});
         return data; 
      } catch (error) {
        return rejectWithValue({
          message: error.message, 
          code: error.code || "UNKNOWN_ERROR", 
        });
      }
    }
    );

export const attemptsExam = createAsyncThunk(
  "attemptExam",
  async (_, { rejectWithValue }) => {
    try {
      const data = await Attempts();
      return data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
);

export const attemptsCount = createAsyncThunk(
  "attemptCount",
  async (_, { rejectWithValue }) => {
    try {
      const data = await AttemptCount();
      return data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
);

export const generatePasskey= createAsyncThunk(
  "generatePasskey",
  async ({ user_id,exam_id}, { rejectWithValue }) => {
    console.log("generate password",{ user_id,exam_id})
    try {
      const data = await GeneratePasskey({ user_id,exam_id});
       return data; 
    } catch (error) {
      return rejectWithValue({
        message: error.message, 
        code: error.code || "UNKNOWN_ERROR", 
      });
    }
  }
  );

  export const verifyPasscode= createAsyncThunk(
    "verifyPasscode",
    async ({ user_id,exam_id,passcode}, { rejectWithValue }) => {
      console.log("verifyPasscode",{ user_id,exam_id})
      try {
        const data = await VerifyPasscode({ user_id,exam_id,passcode});
         return data; 
      } catch (error) {
        return rejectWithValue({
          message: error.message, 
          code: error.code || "UNKNOWN_ERROR", 
        });
      }
    }
    );

const examQuesSlice = createSlice({
  name: "examQues",
  initialState,
  reducers: {
    setSubject(state, action) {
      state.subject = action.payload;
      console.log("action", action.payload);
    },
    setExam(state, action) {
      state.exam = action.payload;
      console.log("action", action.payload);
    },
    setLanguage(state, action) {
      state.language = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
    // for get data handeling
    .addCase(getLevels.pending, (state) => {
      state.status = "loading";
      state.error = null;
    })
    .addCase(getLevels.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.levels = action.payload;
      console.log("lev",action.payload)
    })
    .addCase(getLevels.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });
    builder
      // for get data handeling
      .addCase(getAllQues.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAllQues.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allQuestion = action.payload;
      })
      .addCase(getAllQues.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      // for get data handeling
      .addCase(attemptsExam.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(attemptsExam.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.attempts = action.payload;
        console.log("action.payload", action.payload);
      })
      .addCase(attemptsExam.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
    
    
    builder
      // for get data handeling
      .addCase(attemptsCount.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(attemptsCount.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.attemptCount = action.payload;
        console.log("action", action.payload);
      })
      .addCase(attemptsCount.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      // for get data handeling
      .addCase(getExamSet.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getExamSet.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.examSet = action.payload;
      })
      .addCase(getExamSet.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
  resetState: () => initialState,
});

export const { setSubject, setExam, setLanguage } = examQuesSlice.actions;
export default examQuesSlice.reducer;

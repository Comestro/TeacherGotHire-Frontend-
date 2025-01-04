import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
import { fetchQuestion,fetchExam} from "../services/examQuesServices";

const initialState = {
   allQuestion : [],
   examSet:[],
   exam:"",
   subject:"",
   language:"",
   status: "idle", 
   error: null, 
};

export const getAllQues= createAsyncThunk(
    "getAllQues",
    async ({  exam_id, language }, { rejectWithValue }) => {
      console.log("jsbfkdnvkjd",{exam_id, language })
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
    async ({ level_id, class_category_id, subject_id }, { rejectWithValue }) => {
      console.log("jsbfkdnvkjd",{ level_id, class_category_id, subject_id })
      try {
        const data = await fetchExam({ level_id, class_category_id, subject_id });
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
    name : "examQues",
    initialState,
    reducers:{
      setSubject(state,action){
       state.subject = action.payload
       console.log("action",action.payload)
      },
      setExam(state,action){
        state.exam = action.payload
        console.log("action",action.payload)
       },
       setLanguage(state,action){
        state.language = action.payload
        console.log("ghjkl;",action.payload)
       }
    },
    extraReducers:(builder)=>{
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
    }
})
export const {setSubject,setExam,setLanguage} = examQuesSlice.actions;
export default examQuesSlice.reducer;
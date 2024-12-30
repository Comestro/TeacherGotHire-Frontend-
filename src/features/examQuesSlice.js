import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
import { fetchQuestion } from "../services/examQuesServices";

const initialState = {
   allQuestion : [],
   subject:"",
   status: "idle", 
   error: null, 
};

export const getAllQues= createAsyncThunk(
    "getAllQues",
    async ({ level_id, class_category_id, subject_id, language }, { rejectWithValue }) => {
      console.log("jsbfkdnvkjd",{ level_id, class_category_id, subject_id, language })
      try {
        const data = await fetchQuestion({ level_id, class_category_id, subject_id, language });
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
    }
})
export const {setSubject} = examQuesSlice.actions;
export default examQuesSlice.reducer;
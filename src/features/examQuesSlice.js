import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
import { fetchQuestion } from "../services/examQuesServices";

const initialState = {
   allQuestion : [],
   status: "idle", 
   error: null, 
};

export const getAllQues= createAsyncThunk(
    "getAllQues",
    async (_, { rejectWithValue }) => {
      try {
        const data = await fetchQuestion();
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
    reducers:{},
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

export default examQuesSlice.reducer;
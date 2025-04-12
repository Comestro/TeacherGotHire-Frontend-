import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addExamCard } from "../services/examServices";

const initialState ={
    examCards: {},
    loading: false,
    error: null,
}

export const examCard = createAsyncThunk(
  "examCard",
  async ({subject_id,class_category_id,level_id},{ rejectWithValue }) => {
    try {
      const data = await addExamCard({subject_id,class_category_id,level_id});

      return data;
    } catch (error) {
      console.log("Error in getLevels:", error);
      let errorMessage = "An error occurred";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);


const examSlice = createSlice({
    name: "exam",
    initialState,
    reducers: {},
    extraReducers:(builder) => {
        builder
              // for get data handeling
              .addCase(examCard.pending, (state) => {
                state.status = "loading";
                state.error = null;
              })
              .addCase(examCard.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.examCards = action.payload;
                console.log("examCard", action.payload);
              })
              .addCase(examCard.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
              });
  }
  });

  export default examSlice.reducer;
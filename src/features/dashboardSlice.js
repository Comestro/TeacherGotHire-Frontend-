import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
import { fetchSubjects } from "../services/dashBoardServices";


const initialState = {
    subjects:[],
    status: "idle", 
    error: null,
  };



export const getSubjects = createAsyncThunk(
    "getSubjects", async (_, { rejectWithValue }) => {
      try {
        const data = await fetchSubjects();
        return data; // Return the updated profile data
      } catch (error) {
        return rejectWithValue({
          message: error.message, // Only include the error message
          code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
        });
      }
    }
  );


  const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {}, // Add reducers if needed
    extraReducers: (builder) => {
      builder
        .addCase(getSubjects.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(getSubjects.fulfilled, (state, action) => {
          state.status = "succeeded";
          state.subjects = action.payload; 
          
        })
        .addCase(getSubjects.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        });
    },  
    });

    export default dashboardSlice.reducer;
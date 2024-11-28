
import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
import { updateProfileService } from "../services/profileServices";


const initialState={
user_id : "",
fullname: "",
gender: "",
religion: "",
nationality: "",
image: "",
aadhar_no: "",
phone: "",
alternate_phone: "",
verified: "",
class_categories: "",
rating: "",
date_of_birth:"",
status: "idle",  // 'idle' | 'loading' | 'succeeded' | 'failed'
error: null,
}

export const updateProfile = createAsyncThunk(
    "personalProfileSlice/updateProfile",
    async (profileData, { rejectWithValue }) => {
      try {
        const data = await updateProfileService(profileData); // Call the service
        return data; // Return the updated profile data
      } catch (error) {
        return rejectWithValue({
          message: error.message, // Only include the error message
          code: error.code || "UNKNOWN_ERROR", // Add a custom field if needed
        });
      }
      
    }
  );

const personalProfileSlice = createSlice({
    name: 'personalProfile',
    initialState,
    extraReducers: (builder) => {
        builder
          .addCase(updateProfile.pending, (state) => {
            state.status = "loading";
            state.error = null;
          })
          .addCase(updateProfile.fulfilled, (state, action) => {
            state.status = "succeeded";
            Object.assign(state, action.payload); // Update the state with the server response
          })
          .addCase(updateProfile.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.payload;
          });
      },
    });
    


//export const {updateUserProfile} = personalProfileSlice.actions;
export default personalProfileSlice.reducer


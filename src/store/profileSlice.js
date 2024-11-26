

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: "" ,
  email: "",
  phone: "8340488397",
  address: "Bengaluru, India",
  location: "Bengaluru, India",
  profileImage: "",
  resume: { fileName: null, uploadedOn: null },
  skills: [],
  experience: [], 
  education: [], 
  signedUp: false, 
};
 

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    // Signup Reducer
    signup(state, action) {
      const { username, email} = action.payload;
      state.username = username;
      state.email = email;
      // state.phone = phone;
      //state.password = password;
      state.signedUp = true
    },

    // Update Profile Reducer
    updateProfile(state, action) {
      Object.assign(state, action.payload); // Update multiple fields at once
    },

    // Upload Image Reducer
    uploadImage(state, action) {
      state.profileImage = action.payload; // Save profile image URL or path
    },

    // Add Skill Reducer
    addSkill(state, action) {
      if (!state.skills.includes(action.payload)) {
        state.skills.push(action.payload); // Add skill if it doesn't already exist
      }
    },

    // Remove Skill Reducer
    removeSkill(state, action) {
      state.skills = state.skills.filter((skill) => skill !== action.payload);
    },

    // Add Experience Reducer
    addExperience(state, action) {
      state.experience.push(action.payload); // Add new experience object
    },

    // Update Experience Reducer
    updateExperience(state, action) {
      const { index, data } = action.payload;
      if (state.experience[index]) {
        state.experience[index] = data; // Update experience at specific index
      }
    },

    // Remove Experience Reducer
    removeExperience(state, action) {
      state.experience.splice(action.payload, 1); // Remove experience by index
    },

    // Add Education Reducer
    addEducation(state, action) {
      state.education.push(action.payload); // Add new education object
    },

    // Update Education Reducer
    updateEducation(state, action) {
      const { index, data } = action.payload;
      if (state.education[index]) {
        state.education[index] = data; // Update education at specific index
      }
    },

    // Remove Education Reducer
    removeEducation(state, action) {
      state.education.splice(action.payload, 1); // Remove education by index
    },

    // Set Resume Reducer
    setResume(state, action) {
      const { fileName, uploadedOn } = action.payload;
      state.resume.fileName = fileName;
      state.resume.uploadedOn = uploadedOn;
    },

    // Clear Resume Reducer
    clearResume(state) {
      state.resume = { fileName: null, uploadedOn: null };
    },
  },
});

// Export actions
export const {
  signup,
  updateProfile,
  uploadImage,
  addSkill,
  removeSkill,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  setResume,
  clearResume,
} = profileSlice.actions;

// Export reducer
export default profileSlice.reducer;

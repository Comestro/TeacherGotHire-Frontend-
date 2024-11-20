import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  email: "",
  phone: "",
  address: "",
   profileImage: "",
  skills: [],
  experience: [], // Array of work experience objects
  education: [], // Array of education objects
  signedUp: false, // Indicates if the user has completed signup
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    signup(state, action) {
      const { name, email, phone } = action.payload;
      state.name = name;
      state.email = email;
      state.phone = phone;
      state.signedUp = true;
    },
    updateProfile(state, action) {
      Object.assign(state, action.payload);
    },
    uploadImage(state, action) {
      state.profileImage = action.payload; // Save image
    },
    addSkill(state, action) {
      state.skills.push(action.payload);
    },
    removeSkill(state, action) {
      state.skills = state.skills.filter((skill) => skill !== action.payload);
    },
    addExperience(state, action) {
      state.experience.push(action.payload);
    },
    updateExperience(state, action) {
      const { index, data } = action.payload;
      state.experience[index] = data;
    },
    removeExperience(state, action) {
      state.experience.splice(action.payload, 1);
    },
    addEducation(state, action) {
      state.education.push(action.payload);
    },
    updateEducation(state, action) {
      const { index, data } = action.payload;
      state.education[index] = data;
    },
    removeEducation: (state, action) => {
      state.education.splice(action.payload, 1);
    },
  },
});

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
} = profileSlice.actions;

export default profileSlice.reducer;

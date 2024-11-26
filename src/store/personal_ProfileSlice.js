import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: '',
  email: '',
  FullName: '',
  gender: '',
  religion: '',
  nationality: '',
  image: '',
  addhar_no: '',
  phone: '',
  alternate_phone: '',
  date_of_birth: '',
  address: {
    street: '',
    division: '',
    district: '',
    block: '',
    village: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
  },
};


const personalProfileSlice = createSlice({
    name: 'personalProfile',
    initialState,
    reducers: {
      // Action to update general user info
      updateUserProfile(state, action) {
        const { field, value } = action.payload;
        state[field] = value;
      },
      // Action to update the address
      updateAddress(state, action) {
        const { field, value } = action.payload;
        state.address[field] = value;
      },
      // Action to reset the user profile to initial state
      resetUserProfile(state) {
        return initialState;
      },
    },
  });
  
export const {updateUserProfile,updateAddress,resetUserProfile} = personalProfileSlice.actions;
export default personalProfileSlice.reducer
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: '',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
  },
};

const yourProfileSlice = createSlice({
  name: 'yourProfile',
  initialState,
  reducers: {
    // Set Initial Profile Information
    setProfile(state, action) {
      const { username, email, phone, address } = action.payload;
      state.username = username || state.username;
      state.email = email || state.email;
      state.phone = phone || state.phone;
      state.address = address || state.address;
    },

    // Update Address Reducer
    updateAddress(state, action) {
      const { street, city, state: stateName, pincode, country } = action.payload;
      state.address = {
        ...state.address,
        street: street || state.address.street,
        city: city || state.address.city,
        state: stateName || state.address.state,
        pincode: pincode || state.address.pincode,
        country: country || state.address.country,
      };
    },

    // Clear Address Reducer
    clearAddress(state) {
      state.address = {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: '',
      };
    },
  },
});

export const { setProfile, updateAddress, clearAddress } = yourProfileSlice.actions;
export default yourProfileSlice.reducer;



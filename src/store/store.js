import { configureStore } from "@reduxjs/toolkit";
import authSlice from '../features/authSlice';
import personalProfileSlice from '../features/personalProfileSlice'


const store = configureStore({
    reducer:{
        auth : authSlice,
        personalProfile : personalProfileSlice,
    },
})

export default store;
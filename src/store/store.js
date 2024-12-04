import { configureStore } from "@reduxjs/toolkit";
import authSlice from '../features/authSlice';
import personalProfileSlice from '../features/personalProfileSlice'
import questionReducer from '../features/questionSlice';


const store = configureStore({
    reducer:{
        auth : authSlice,
        personalProfile : personalProfileSlice,
        questions : questionReducer,
    },
})

export default store;
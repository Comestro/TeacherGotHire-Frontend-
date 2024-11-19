import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status : false,
    userData : null,
}


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers:{
        login:(state, action) => {
           state.status= true;
           state.userData = action.payload;
           console.log("testing");
        },
        logout:(state)=>{
          state.status = false;
          state.userData= null;  // in reducux toolkit inside reduser are action like :login and logout
        },
      }
    })

    export const {login,logout} = authSlice.actions

export default authSlice.reducer
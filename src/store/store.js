import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authSlice from './authSlice';
import PersonalProfileSlice from './personal_ProfileSlice'


const persistConfig = {
    key: "root",
    storage,
  };

// // const persistedProfileReducer = persistReducer(persistConfig, profileSlice.reducer);

// const persistedProfileReducer = persistReducer(persistConfig, profileReducer);

const store = configureStore({
    reducer:{
        auth : authSlice,
        // profile : persistedProfileReducer,
        personalProfile : PersonalProfileSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
          },
        }),
})

export const persistor = persistStore(store);
export default store
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER  } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import { combineReducers } from "redux";
import authSlice from "../features/authSlice";
import personalProfileSlice from "../features/personalProfileSlice";
import jobProfileSlice from "../features/jobProfileSlice";
import dashboardSlice from "../features/dashboardSlice";
import examQuesSlice from "../features/examQuesSlice";
import teacherSlice from "../features/teacherFilterSlice";

// Step 1: Combine all reducers
const rootReducer = combineReducers({
  auth: authSlice,
  personalProfile: personalProfileSlice,
  jobProfile: jobProfileSlice,
  dashboard: dashboardSlice,
  examQues: examQuesSlice,
  teachers: teacherSlice,
});

// Step 2: Configure persist 
const persistConfig = {
  key: "root",
  storage,
  //whitelist: ["auth"], // Only persist auth state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Step 3: Create the store with persistedReducer
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Step 4: Create the persistor
const persistor = persistStore(store);

export  {  persistor };

export default store;
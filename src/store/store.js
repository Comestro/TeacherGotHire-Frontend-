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
import notificationSlice from "../features/notificationSlice";
import examSlice from "../features/examSlice";
import { apiSlice } from '../features/api/apiSlice';
const rootReducer = combineReducers({
  auth: authSlice,
  personalProfile: personalProfileSlice,
  jobProfile: jobProfileSlice,
  dashboard: dashboardSlice,
  examQues: examQuesSlice,
  teachers: teacherSlice,
  exam: examSlice,
  notification: notificationSlice,
  [apiSlice.reducerPath]: apiSlice.reducer,
});
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
});
const persistor = persistStore(store);

export  {  persistor };

export default store;

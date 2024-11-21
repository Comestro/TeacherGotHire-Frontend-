import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from './store/store';
import AdminDashboard from "./admin/Dashboard/Dashboard";
import AdminProfile from "./admin/Profile/Profile";

const Home = lazy(() => import('./components/Home/Home'));
const SignUpPage = lazy(() => import("./components/SignUpPage"));
const TeacherDashboard = lazy(() => import("./components/Dashboard/TeacherDashboard"));
const Payment = lazy(() => import("./components/Payment"));
const ExamPortal = lazy(() => import("./components/ExamPortal/ExamPortal"));
const ContactUs = lazy(() => import("./components/ContactUs/ContactUs"));
const Profile = lazy(() => import("./components/ProfileEdit/ProfileEdit"));
const SchoolAdmin = lazy(() => import("./components/Dashboard/SchoolAdmin"));

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup/:role" element={<SignUpPage />} />
              <Route path="/signin" element={<SignUpPage />} />
              <Route path="/teacherdashbord" element={<TeacherDashboard />} />
              <Route path="/schooladmindashboard" element={<SchoolAdmin />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/exam-portal" element={<ExamPortal />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin-dashboard" element={<AdminDashboard/>} />
              <Route path="/admin-profile" element={<AdminProfile/>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from './store/store';
import AdminDashboard from "./admin/Dashboard/Dashboard";
import AdminProfile from "./admin/Profile/Profile";
import ManageSubject from "./admin/Manage-subject/ManageSubject";
import ManageTeacher from "./admin/Manage-teacher/ManageTeacher";
import ManageRecruiter from "./admin/Manage-recruiter/ManageRecruiter";
import ManageQuestion from "./admin/Manage-question/ManageQuestion";
import ManageSkills from "./admin/Manage-skills/ManageSkills";
import ManageQualification from "./admin/Manage-qualification/ManageQualification";
import Support from "./admin/Support/Support";
import ChangePassword from "./admin/Change-password/ChangePassword";
import Contact from "./admin/Conatct/Contact";
import SignIn from "./components/SignIn";
import AdminSignIn from "./components/AdminLogin";

const Home = lazy(() => import('./components/Home/Home'));
const SignUpPage = lazy(() => import("./components/SignUpPage"));
const TeacherDashboard = lazy(() => import("./components/Dashboard/TeacherDashboard"));
const Payment = lazy(() => import("./components/Payment"));
const ExamPortal = lazy(() => import("./components/ExamPortal/ExamPortal"));
const ContactUs = lazy(() => import("./components/ContactUs/ContactUs"));
const Profile = lazy(() => import("./components/ProfileEdit/ProfileEdit"));
const SchoolAdmin = lazy(() => import("./components/Dashboard/SchoolAdmin"));

function App() {
  const token = localStorage.getItem('jwtToken');

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup/:role" element={<SignUpPage />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/admin-signin" element={token ? <Navigate to="/admin-dashboard" /> : <AdminSignIn />} />
              <Route path="/teacherdashbord" element={token ? <TeacherDashboard /> : <Navigate to="/admin-signin" />} />
              <Route path="/schooladmindashboard" element={token ? <SchoolAdmin /> : <Navigate to="/admin-signin" />} />
              <Route path="/payment" element={token ? <Payment /> : <Navigate to="/admin-signin" />} />
              <Route path="/exam-portal" element={token ? <ExamPortal /> : <Navigate to="/admin-signin" />} />
              <Route path="/contact" element={token ? <ContactUs /> : <Navigate to="/admin-signin" />} />
              <Route path="/profile" element={token ? <Profile /> : <Navigate to="/admin-signin" />} />
              <Route path="/admin-dashboard" element={token ? <AdminDashboard /> : <Navigate to="/admin-signin" />} />
              <Route path="/admin-profile" element={token ? <AdminProfile /> : <Navigate to="/admin-signin" />} />
              <Route path="/admin-manage-subject" element={token ? <ManageSubject /> : <Navigate to="/admin-signin" />} />
              <Route path="/admin-manage-teacher" element={token ? <ManageTeacher /> : <Navigate to="/admin-signin" />} />
              <Route path="/admin-manage-recruiter" element={token ? <ManageRecruiter /> : <Navigate to="/admin-signin" />} />
              <Route path="/admin-manage-question" element={token ? <ManageQuestion /> : <Navigate to="/admin-signin" />} />
              <Route path="/admin-manage-skills" element={token ? <ManageSkills /> : <Navigate to="/admin-signin" />} />
              <Route path="/admin-manage-qualification" element={token ? <ManageQualification /> : <Navigate to="/admin-signin" />} />
              <Route path="/admin-support" element={token ? <Support /> : <Navigate to="/admin-signin" />} />
              <Route path="/admin-change-password" element={token ? <ChangePassword /> : <Navigate to="/admin-signin" />} />
              <Route path="/admin-contact" element={token ? <Contact /> : <Navigate to="/admin-signin" />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
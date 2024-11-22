import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
              <Route path="/signin" element={<SignIn />} />
              <Route path="/teacherdashbord" element={<TeacherDashboard />} />
              <Route path="/schooladmindashboard" element={<SchoolAdmin />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/exam-portal" element={<ExamPortal />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-profile" element={<AdminProfile />} />
              <Route path="/admin-manage-subject" element={<ManageSubject />} />
              <Route path="/admin-manage-teacher" element={<ManageTeacher />} />
              <Route path="/admin-manage-recruiter" element={<ManageRecruiter />} />
              <Route path="/admin-manage-question" element={<ManageQuestion />} />
              <Route path="/admin-manage-skills" element={<ManageSkills />} />
              <Route path="/admin-manage-qualification" element={<ManageQualification />} />
              <Route path="/admin-support" element={<Support />} />
              <Route path="/admin-change-password" element={<ChangePassword />} />
              <Route path="/admin-contact" element={<Contact />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
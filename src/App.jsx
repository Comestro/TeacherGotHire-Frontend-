import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/Home/Home";
import SignUpPage from "./components/Signup";
import Login from "./components/SignIn";
import { Provider } from "react-redux";
import store from "./store/store";
import TeacherDashboard from "./components/Dashboard/TeacherDashboard";
import EditPersonalProfile from "./components/Profile/PersonalProfile/EditPersonalProfile";
import JobProfileEdit from "./components/Profile/JobProfile/jobProfileEdit";
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
import AdminSignIn from "./components/AdminLogin";
import ContactUs from "./components/ContactUs/ContactUs";
import ExamPortal from "./components/Exam/ExamPortal";
import ResultPage from "./components/Exam/Results";
import Layout from "./components/Layout";
import ViewTeacher_Admin from "./admin/Manage-teacher/ViewTeacher";
import ManageClassCategory from "./admin/Manage-class-category/ManageClassCategory";
import MCQGuidelinePage from "./components/Exam/MCQGuidelinePage";
import PublicLayout from "./components/PublicLayout";
import RecruiterLayout from "./components/Recruiter/RecruiterLayout";
import TeacherRecruiter from "./components/Recruiter/TeacherRecruiter";
import ManageTeacherJobType from "./admin/Manage-teacher-job-type/ManageTeacherJobType";
import ManageLevel from "./admin/Manage-level/ManageLevel";
import ViewAttempts from "./components/Dashboard/ViewAttempts";
import RecruiterSignUpPage from "./components/RecruiterSignup";
import ExamManagement from "./admin/Manage-exam/ManageExam";

// Private Route Component
// const PrivateRoute = ({ element }) => {
//   const token = localStorage.getItem("access_token");
//   return token ? element : <Navigate to="/signin" />;
// };

const RoleBasedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/signin" />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/signin" />;
  }

  return element;
};

function App() {
  const token = localStorage.getItem("access_token");
  const userData = localStorage.getItem("role");

  return (
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="/signup/teacher" element={<SignUpPage />} />
            <Route path="/signin" element={<Login />} />
            <Route path="/exam" element={<ExamPortal />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/admin-signin" element={<AdminSignIn />} />
            <Route path="/signup/recruiter" element={<RecruiterSignUpPage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/exam-guide" element={<MCQGuidelinePage />} />
          </Route>

          {/* Recruiter Routes */}
          <Route path="/recruiter" element={<RecruiterLayout />}>
            <Route
              index
              element={
                <RoleBasedRoute
                  element={<TeacherRecruiter />}
                  allowedRoles={['recruiter']}
                />
              }
            />
            <Route
              path="personal-profile"
              element={
                <RoleBasedRoute
                  element={<EditPersonalProfile />}
                  allowedRoles={['recruiter']}
                />
              }
            />
            <Route
              path="job-profile"
              element={
                <RoleBasedRoute
                  element={<JobProfileEdit />}
                  allowedRoles={['recruiter']} 
                />
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={token ? <AdminDashboard /> : <Navigate to="/signin" />}
          />
          <Route
            path="/admin/profile"
            element={token ? <AdminProfile /> : <Navigate to="/signin" />}
          />
          <Route
            path="/admin/manage/subject"
            element={token ? <ManageSubject /> : <Navigate to="/signin" />}
          />
          <Route
            path="/admin/manage/teacher"
            element={token ? <ManageTeacher /> : <Navigate to="/signin" />}
          />
          <Route
            path="/admin/manage/recruiter"
            element={token ? <ManageRecruiter /> : <Navigate to="/signin" />}
          />
          <Route
            path="/admin/manage/question"
            element={token ? <ManageQuestion /> : <Navigate to="/signin" />}
          />
          <Route
            path="/admin/manage/skills"
            element={token ? <ManageSkills /> : <Navigate to="/signin" />}
          />
          <Route
            path="/admin/manage/qualification"
            element={
              token ? <ManageQualification /> : <Navigate to="/signin" />
            }
          />
          <Route
            path="/admin/support"
            element={token ? <Support /> : <Navigate to="/signin" />}
          />
          <Route
            path="/admin/change/password"
            element={token ? <ChangePassword /> : <Navigate to="/signin" />}
          />
          <Route
            path="/admin/contact"
            element={token ? <Contact /> : <Navigate to="/signin" />}
          />
          <Route
            path="/admin/view/teacher"
            element={token ? <ViewTeacher_Admin /> : <Navigate to="/signin" />}
          />
          <Route
            path="/admin/manage/class/category"
            element={
              token ? <ManageClassCategory /> : <Navigate to="/signin" />
            }
          />
          <Route
            path="/admin/manage/teacher/jobtype"
            element={
              token ? <ManageTeacherJobType /> : <Navigate to="/signin" />
            }
          />
          <Route
            path="/admin/manage/level"
            element={
              token ? <ManageLevel /> : <Navigate to="/signin" />
            }
          />
          <Route
            path="/admin/manage/exam"
            element={
              token ? <ExamManagement /> : <Navigate to="/signin" />
            }
          />

          {/* Teacher Routes */}
          <Route path="/teacher" element={<Layout />}>
            <Route
              index
              element={
                <RoleBasedRoute
                  element={<TeacherDashboard />}
                  allowedRoles={['user']} 
                />
              }
            />
            <Route
              path="personal-profile"
              element={
                <RoleBasedRoute
                  element={<EditPersonalProfile />}
                  allowedRoles={['user']} 
                />
              }
            />
            <Route
              path="job-profile"
              element={
                <RoleBasedRoute
                  element={<JobProfileEdit />}
                  allowedRoles={['user']}
                />
              }
            />
            <Route
              path="view-attempts"
              element={
                <RoleBasedRoute
                  element={<ViewAttempts />}
                  allowedRoles={['user']}
                />
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

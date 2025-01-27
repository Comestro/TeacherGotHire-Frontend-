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
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { elements } from "chart.js";

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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            <Route path="/exam" element={<ExamPortal />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/admin-signin" element={<AdminSignIn />} />
            <Route path="/signup/recruiter" element={<RecruiterSignUpPage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/exam-guide" element={<MCQGuidelinePage />} />
          </Route>

          {/* Recruiter Routes */}
          <Route path="/recruiter" element={<RoleBasedRoute element={<RecruiterLayout />} allowedRoles={['recruiter']} />}>
            <Route index element={<TeacherRecruiter />} />
          </Route>

          <Route
            path="/admin/dashboard"
            element={<RoleBasedRoute element={<AdminDashboard />} allowedRoles={['admin']} />}
          />
          <Route
            path="/admin/profile"
            element={<RoleBasedRoute element={<AdminProfile />} allowedRoles={['admin']} />}
          />
          <Route
            path="/admin/manage/subject"
            element={<RoleBasedRoute element={<ManageSubject />} allowedRoles={['admin']} />}
          />
          <Route
            path="/admin/manage/teacher"
            element={<RoleBasedRoute element={<ManageTeacher />} allowedRoles={['admin']} />}
          />
          <Route
            path="/admin/manage/recruiter"
            element={<RoleBasedRoute element={<ManageRecruiter />} allowedRoles={['admin']} />}
          />
          <Route
            path="/admin/manage/question"
            element={<RoleBasedRoute element={<ManageQuestion />} allowedRoles={['admin']} />}
          />
          <Route
            path="/admin/manage/skills"
            element={<RoleBasedRoute element={<ManageSkills />} allowedRoles={['admin']} />}
          />
          <Route
            path="/admin/manage/qualification"
            element={
              <RoleBasedRoute element={<ManageQualification />} allowedRoles={['admin']} />
            }
          />
          <Route
            path="/admin/support"
            element={<RoleBasedRoute elements={<Support />} allowedRoles={['amin']} />}
          />
          <Route
            path="/admin/change/password"
            element={<RoleBasedRoute element={<ChangePassword />} allowedRoles={['admin']} />}
          />
          <Route
            path="/admin/contact"
            element={<RoleBasedRoute element={<Contact />} allowedRoles={['admin']} />}
          />
          <Route
            path="/admin/view/teacher"
            element={<RoleBasedRoute element={<ViewTeacher_Admin />} allowedRoles={['admin']} />}
          />
          <Route
            path="/admin/manage/class/category"
            element={
              <RoleBasedRoute element={<ManageClassCategory />} allowedRoles={['admin']} />
            }
          />
          <Route
            path="/admin/manage/teacher/jobtype"
            element={
              <RoleBasedRoute element={<ManageTeacherJobType />} allowedRoles={['admin']} />
            }
          />
          <Route
            path="/admin/manage/level"
            element={
              <RoleBasedRoute element={<ManageLevel />} allowedRoles={['admin']} />
            }
          />
          <Route
            path="/admin/manage/exam"
            element={
              <RoleBasedRoute element={<ExamManagement />} allowedRoles={['admin']} />
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
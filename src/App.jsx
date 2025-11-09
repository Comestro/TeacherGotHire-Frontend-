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
import ManageSubject from "./admin/Manage-subject/ManageSubject";
import ManageTeacher from "./admin/Manage-teacher/ManageTeacher";
import ManageRecruiter from "./admin/Manage-recruiter/ManageRecruiter";
import ManageSkills from "./admin/Manage-skills/ManageSkills";
import ManageQualification from "./admin/Manage-qualification/ManageQualification";
import ChangePassword from "./admin/Change-password/ChangePassword";
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
import ExamLayout from "./components/Exam/ExamLayout";
import ExamMode from "./components/Exam/ExamMode";
import TeacherLayout from "./teacherPanel/TeacherLayout";
import ExamCenterLayout from "./components/ExamCenter/ExamCenterLayout";
import ExamCenterDashboard from "./components/ExamCenter/ExamCenterDashboard";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import QuestionManagement from "./components/SubjectWiseExam/QuestionManagement";
import SettingsPage from "./components/Pages/SettingsPage";
import ManageCenter from "./admin/Manage-center/ManageCenter";
import PasskeyManagement from "./admin/manage-passkey/ManagePasskey";
import ManageQuestionManager from "./admin/Manage-question-manager/ManageQuestionManager";
import { HelmetProvider } from "react-helmet-async";
import Error404 from "./components/Pages/ErrorPage";
import Unauthorized from "./components/Unauthorized";
import RoleBasedRoute from "./components/RoleBasedRoute";
import ManageHiringRequests from "./admin/Manage-hiring/ManageHiring";
import TeacherViewPage from "./components/Recruiter/TeacherViewPage";
import InterviewManagement from "./admin/Manage-interview/ManageInterview";
import JobApply from "./components/Dashboard/components/JobApply";
import Test from "./admin/test/Test";
import ManageTeacherApplied from "./admin/Manage-teacher-applied/ManageTeacherApplied";
import ManageRecruiterEnquiry from "./admin/Manage-recruiter-enquiry/ManageRecruiterEnquiry";
import ManageQuestionReport from "./admin/Manage-Question-Report/ManageQuestionReport";
import ExamDetails from "./admin/Manage-exam/ExamDetails";
import QuestionManagementPortal from "./components/SubjectWiseExam/QuestionManagementPortal";
import { GetPreferredTeacher } from "./components/enquiry/GetPreferredTeacher";
import ManageExam from "./components/ManageExam/ManageExam";
import SubjectExpertLayout from "./components/ManageExam/SubjectExpertLayout";
import ExamSetterProfile from "./components/ManageExam/ExamSetterProfile";
import ManageQuestion from "./components/ManageExam/ManageQuestion";
import QuestionForm from "./components/ManageExam/componets/QuestionForm";

function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="test" element={<Test />} />

              <Route path="contact" element={<ContactUs />} />
              <Route path="exam-mode" element={<ExamMode />} />  
            </Route>
            <Route path="get-preferred-teacher" element={<GetPreferredTeacher />} />
            <Route path="signup/teacher" element={<SignUpPage />} />
            <Route path="signin" element={<Login />} />
            
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route
              path="reset-password/:uid/:token"
              element={<ResetPassword />}
            />
            <Route path="signup/recruiter" element={<RecruiterSignUpPage />} />

            {/* Unauthorized Page */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Exam Routes */}
            <Route path="exam" element={<ExamLayout />}>
              <Route index element={<MCQGuidelinePage />} />
              <Route path="portal" element={<ExamPortal />} />
              <Route path="result" element={<ResultPage />} />
            </Route>
            {/* <Route path="subject-expert" element={<QuestionManagementPortal />} /> */}

            <Route path="manage-exam" element={<SubjectExpertLayout />} >
              <Route index element={<ManageExam />} />
              <Route path="questions/:examId" element={<ManageQuestion />} />
              <Route path="questions/:examId/add" element={<QuestionForm />} />
              <Route path="profile" element={<ExamSetterProfile />}/>
            </Route>

            {/* Recruiter Routes */}
            <Route
              path="recruiter"
              element={
                <RoleBasedRoute
                  element={<RecruiterLayout />}
                  allowedRoles={["recruiter"]}
                />
              }
            >
              <Route index element={<TeacherRecruiter />} />
              <Route path="teacher/:id" element={<TeacherViewPage />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="admin/dashboard"
              element={
                <RoleBasedRoute
                  element={<AdminDashboard />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/manage/subject"
              element={
                <RoleBasedRoute
                  element={<ManageSubject />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/manage/teacher"
              element={
                <RoleBasedRoute
                  element={<ManageTeacher />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/manage/recruiter"
              element={
                <RoleBasedRoute
                  element={<ManageRecruiter />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/manage/skills"
              element={
                <RoleBasedRoute
                  element={<ManageSkills />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/manage/qualification"
              element={
                <RoleBasedRoute
                  element={<ManageQualification />}
                  allowedRoles={["admin"]}
                />
              }
            />
            
            <Route
              path="admin/change/password"
              element={
                <RoleBasedRoute
                  element={<ChangePassword />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/manage/question/report"
              element={
                <RoleBasedRoute
                  element={<ManageQuestionReport />}
                  allowedRoles={["admin"]}
                />
              }
            />
           
            <Route
              path="admin/view/teacher/:id"
              element={
                <RoleBasedRoute
                  element={<ViewTeacher_Admin />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/manage/class/category"
              element={
                <RoleBasedRoute
                  element={<ManageClassCategory />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/manage/teacher/jobtype"
              element={
                <RoleBasedRoute
                  element={<ManageTeacherJobType />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/manage/level"
              element={
                <RoleBasedRoute
                  element={<ManageLevel />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/manage/exam"
              element={
                <RoleBasedRoute
                  element={<ExamManagement />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/exam/:examId"
              element={<ExamDetails />}
              allowedRoles={["admin"]}
            />
            <Route
              path="admin/manage/exam/center"
              element={
                <RoleBasedRoute
                  element={<ManageCenter />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/manage/teacher/applied/job"
              element={
                <RoleBasedRoute
                  element={<ManageTeacherApplied />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/manage/recruiter/enquiry"
              element={
                <RoleBasedRoute
                  element={<ManageRecruiterEnquiry />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/manage/passkey"
              element={
                <RoleBasedRoute
                  element={<PasskeyManagement />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/manage/question/manager"
              element={
                <RoleBasedRoute
                  element={<ManageQuestionManager />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="admin/manage/hiring"
              element={<ManageHiringRequests />}
              allowedRoles={["admin"]}
            />
            <Route
              path="admin/manage/interview"
              element={<InterviewManagement />}
              allowedRoles={["admin"]}
            />

            {/* Teacher Routes */}
            <Route path="teacher" element={<Layout />}>
              <Route
                index
                element={
                  <RoleBasedRoute
                    element={<TeacherDashboard />}
                    allowedRoles={["teacher"]}
                  />
                }
              />
              <Route
                path="personal-profile"
                element={
                  <RoleBasedRoute
                    element={<EditPersonalProfile />}
                    allowedRoles={["teacher"]}
                  />
                }
              />
              <Route
                path="job-profile"
                element={
                  <RoleBasedRoute
                    element={<JobProfileEdit />}
                    allowedRoles={["teacher"]}
                  />
                }
              />
              <Route
                path="view-attempts"
                element={
                  <RoleBasedRoute
                    element={<ViewAttempts />}
                    allowedRoles={["teacher"]}
                  />
                }
              />
              <Route
                path="job-apply"
                element={
                  <RoleBasedRoute
                    element={<JobApply />}
                    allowedRoles={["teacher"]}
                  />
                }
              />
              <Route
                path="setting"
                element={
                  <RoleBasedRoute
                    element={<SettingsPage />}
                    allowedRoles={["teacher"]}
                  />
                }
              />
            </Route>

            {/* Exam Center Routes */}
            <Route path="examcenter" element={<ExamCenterLayout />}>
              <Route
                path="personal-profile"
                element={
                  <RoleBasedRoute
                    element={<EditPersonalProfile />}
                    allowedRoles={["teacher"]}
                  />
                }
              />
              <Route
                path="job-profile"
                element={
                  <RoleBasedRoute
                    element={<JobProfileEdit />}
                    allowedRoles={["teacher"]}
                  />
                }
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Error404 />} />
          </Routes>
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  );
}

export default App;

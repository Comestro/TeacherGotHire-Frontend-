import React from "react";
import { BrowserRouter, Route, Routes,Navigate } from "react-router-dom";
import Home from "./components/Home/Home";
import SignUpPage from "./components/Signup";
import Login from "./components/SignIn";
import { Provider } from "react-redux";
import store from "./store/store"; 
import TeacherDashboard from "./components/Dashboard/TeacherDashboard";
import EditPersonalProfile from "./components/Profile/PersonalProfile/EditPersonalProfile";
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



function App() {
 
  const token = localStorage.getItem('jwtToken');
  return (
     <Provider store={store}>
       <BrowserRouter>
           <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup/teacher" element={<SignUpPage/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/admin-signin" element={<AdminSignIn/>}/>
              <Route path="/teacherdashboard" element={<TeacherDashboard />} />
               <Route path="/personalprofile" element= {<EditPersonalProfile />} />
              {/* <Route path="/jobprofile" element= {<JobProfilePage />} /> */} 

              <Route path="/admin-dashboard" element={token ? <AdminDashboard /> : <Navigate to="/login" />} />
              <Route path="/admin-profile" element={token ? <AdminProfile /> : <Navigate to="/login" />} />
              <Route path="/admin-manage-subject" element={token ? <ManageSubject /> : <Navigate to="/login" />} />
              <Route path="/admin-manage-teacher" element={token ? <ManageTeacher /> : <Navigate to="/login" />} />
              <Route path="/admin-manage-recruiter" element={token ? <ManageRecruiter /> : <Navigate to="/login" />} />
              <Route path="/admin-manage-question" element={token ? <ManageQuestion /> : <Navigate to="/login" />} />
              <Route path="/admin-manage-skills" element={token ? <ManageSkills /> : <Navigate to="/login" />} />
              <Route path="/admin-manage-qualification" element={token ? <ManageQualification /> : <Navigate to="/login" />} />
              <Route path="/admin-support" element={token ? <Support /> : <Navigate to="/login" />} />
              <Route path="/admin-change-password" element={token ? <ChangePassword /> : <Navigate to="/login" />} />
              <Route path="/admin-contact" element={token ? <Contact /> : <Navigate to="/login" />} />
         
           </Routes>
        </BrowserRouter>
    </Provider>
  );
}

export default App;
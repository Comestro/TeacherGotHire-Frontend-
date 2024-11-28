import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home";
import SignUpPage from "./components/Signup";
import Login from "./components/SignIn";
import { Provider } from "react-redux";
import store from "./store/store"; 
import TeacherDashboard from "./components/Dashboard/TeacherDashboard";
import EditPersonalProfile from "./components/Profile/PersonalProfile/EditPersonalProfile";



function App() {
 

  return (
     <Provider store={store}>
       <BrowserRouter>
           <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup/teacher" element={<SignUpPage/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/teacherdashboard" element={<TeacherDashboard />} />
               <Route path="/personalprofile" element= {<EditPersonalProfile />} />
              {/* <Route path="/jobprofile" element= {<JobProfilePage />} /> */} 
           </Routes>
        </BrowserRouter>
    </Provider>
  );
}

export default App;
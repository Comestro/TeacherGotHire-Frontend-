import React from "react"
import  { BrowserRouter,Route,Routes } from "react-router-dom"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react";
import store,{ persistor } from './store/store'
import Home from './components/Home/Home'
import SignUpPage from "./components/SignUpPage"
import TeacherDashboard from "./components/Dashboard/TeacherDashboard"
import Payment from "./components/Payment"
import ExamPortal from "./components/ExamPortal/ExamPortal"
import ContactUs from "./components/ContactUs/ContactUs"
import Profile from "./components/ProfileEdit/ProfileEdit";
import SchoolAdmin from "./components/Dashboard/SchoolAdmin";
import Login from "./components/SignIn";


function App() {
   return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
                <Routes>
                  <Route path='/' element={<Home/>}/>
                  <Route path="/signup/:role" element={<SignUpPage />} />
                  <Route path="/signin" element={<SignUpPage/>}/>
                  <Route path="/login" element={<Login/>}/>
                  <Route path="/teacherdashbord" element={<TeacherDashboard/>}/>
                  <Route path="/schooladmindashboard" element={<SchoolAdmin/>}/>
                  <Route path="/payment" element={<Payment/>}/>
                  <Route path="/exam-portal" element={<ExamPortal/>}/>
                  <Route path="/contact" element={<ContactUs/>}/>
                  <Route path="/profile" element={<Profile/>}/>
                </Routes>
            </BrowserRouter>
        </PersistGate>
      </Provider>
   </>
  )
}

export default App

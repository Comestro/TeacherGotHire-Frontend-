import React from 'react'
import Navbar from './Navbar/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from './Footer/Footer'

const PublicLayout = () => {
  return (
    <div className="">
        <nav>
            <Navbar
                links={[
                // { id: "1", label: "Login/Signup", to: "/signup/teacher" },
                { id: "1", label: "Find Tutor", to: "/signup/recruiter" },
                { id: "2", label: "Login/Signup", to: "/signin" },
                ]}
            />
        </nav>
        <Outlet />
        <Footer />
    </div>
  )
}

export default PublicLayout
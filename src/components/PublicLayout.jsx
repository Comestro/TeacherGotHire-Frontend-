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
                { id: "1", label: "Register", to: "/signup/teacher" },
                { id: "2", label: "Login", to: "/signin" },
                { id: "3", label: "Contact Us", to: "/contact" },
                { id: "4", label: "About Us", to: "/about" },
                { id: "6", label: "Rec SignUp", to: "/signup/recruiter" },
                ]}
                variant="dark"
            />
        </nav>
        <Outlet />
        <Footer />
    </div>
  )
}

export default PublicLayout
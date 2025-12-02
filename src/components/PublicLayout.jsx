import React from 'react'
import Navbar from './Navbar/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from './Footer/Footer'

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <Navbar
          links={[
            // { id: "1", label: "Login/Signup", to: "/signup/teacher" },
            { id: "1", label: "Find Tutor", to: "/signup/recruiter" },
            { id: "2", label: "Login/Signup", to: "/signin" },
          ]}
        />
      </nav>
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PublicLayout
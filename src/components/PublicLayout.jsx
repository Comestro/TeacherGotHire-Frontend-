import Navbar from './Navbar/Navbar'
import { Outlet } from 'react-router-dom'

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="sticky top-0 z-50">
        <Navbar
          links={[
            { id: "1", label: "Find Tutor", to: "/signup/recruiter" },
            { id: "2", label: "Login/Signup", to: "/signin" },
          ]}
        />
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
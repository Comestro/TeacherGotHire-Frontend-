import React from 'react'
import TeacherRecruiterHeader from './components/RecruiterHeader'
import { Outlet } from 'react-router-dom'
import RecruiterSidebar from './components/RecruiterSidebar'

const RecruiterLayout = () => {
  return (
    <div className="">
      <div className="">
        <TeacherRecruiterHeader />
      </div>
      <div className="flex ">
        <div className="w-72">
          <RecruiterSidebar />
        </div>
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default RecruiterLayout
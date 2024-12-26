import React from 'react'
import TeacherRecruiterHeader from './components/RecruiterHeader'
import { Outlet } from 'react-router-dom'

const RecruiterLayout = () => {
  return (
    <div className='flex flex-col min:h-screen bg-gray-100"'>
        <div className="">
            <TeacherRecruiterHeader />
        </div>
        <div className="">
            <Outlet />
        </div>
    </div>
  )
}

export default RecruiterLayout
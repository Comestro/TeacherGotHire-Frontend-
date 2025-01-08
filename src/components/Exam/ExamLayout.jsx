import React from 'react'
import ExamPortal from './ExamPortal'
import { Outlet } from 'react-router-dom'

const ExamLayout = () => {
  return (
    <div className='w-full'>
        {/* <ExamPortal /> */}
        {/* <h1>This is Exam layout.</h1> */}
        <div className="w-full bg-green-300">
            <Outlet />
        </div>
    </div>
  )
}

export default ExamLayout
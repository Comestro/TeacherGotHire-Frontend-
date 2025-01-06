import React from 'react'
import ExamPortal from './ExamPortal'
import { Outlet } from 'react-router-dom'

const ExamLayout = () => {
  return (
    <div>
        {/* <ExamPortal /> */}
        <h1>This is Exam layout.</h1>
        <Outlet />
    </div>
  )
}

export default ExamLayout
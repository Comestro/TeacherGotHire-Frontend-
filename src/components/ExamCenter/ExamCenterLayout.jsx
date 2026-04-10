import React from 'react'
import { Outlet } from 'react-router-dom';
import UniversalHeader from '../commons/UniversalHeader';
import ExamCenterDashboard from "./ExamCenterDashboard"

function ExamCenterLayout() {
  return (
    <div className='flex flex-col min:h-screen bg-gray-100'>
        <UniversalHeader />
        <div className="">
            <ExamCenterDashboard/>
        </div>
        <div className="">
            <Outlet />
        </div>
    </div>
  )
}

export default ExamCenterLayout;
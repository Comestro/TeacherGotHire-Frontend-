import React from 'react'
import { Outlet } from 'react-router-dom';
import CenterHeader from "./CenterHeader";
import ExamCenterDashboard from "./ExamCenterDashboard"

function ExamCenterLayout() {
  return (
    <div className='flex flex-col min:h-screen bg-gray-100"'>
    <div className="">
        <CenterHeader/>
        <ExamCenterDashboard/>
    </div>
    <div className="">
        <Outlet />
    </div>
</div>
  )
}

export default ExamCenterLayout;
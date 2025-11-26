import React from 'react'
import { Outlet } from 'react-router-dom'

const ExamLayout = () => {
  return (
    <div className='w-full h-screen overflow-hidden flex flex-col'>

      <div className="w-full h-full flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}

export default ExamLayout
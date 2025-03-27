import React from 'react'
import { Outlet } from 'react-router-dom'

const ExamLayout = () => {
  return (
    <div className='w-full'>
     
        <div className="w-full">
            <Outlet />
        </div>
    </div>
  )
}

export default ExamLayout
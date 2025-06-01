import React from 'react'
import Header from './componets/Header'
import { Outlet } from 'react-router-dom'

const SubjectExpertLayout = () => {
  return (
    <>
        <Header />
        <Outlet />
    </>
  )
}

export default SubjectExpertLayout
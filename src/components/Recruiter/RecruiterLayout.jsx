import React from 'react';
import TeacherRecruiterHeader from './components/RecruiterHeader';
import { Outlet } from 'react-router-dom';
import RecruiterSidebar from './components/RecruiterSidebar';

const RecruiterLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <TeacherRecruiterHeader />
      <div className="flex flex-1">
        <div className="w-64">
          <RecruiterSidebar />
        </div>
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default RecruiterLayout;

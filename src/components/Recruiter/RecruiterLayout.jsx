import React from "react";
import TeacherRecruiterHeader from "./components/RecruiterHeader";
import { Outlet } from "react-router-dom";
import RecruiterSidebar from "./components/RecruiterSidebar";

const RecruiterLayout = () => {
  return (
    <div className='min:h-screen bg-gray-100 w-full"'>
      <TeacherRecruiterHeader />
      <div className="flex w-full bg-red-200">
        <div className="hidden md:block">
          <RecruiterSidebar />
        </div>
        <div className="w-full md:ml-72 bg-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default RecruiterLayout;

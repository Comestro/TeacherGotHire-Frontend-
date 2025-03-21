import React from "react";
import TeacherRecruiterHeader from "./components/RecruiterHeader";
import { Outlet } from "react-router-dom";
import RecruiterSidebar from "./components/RecruiterSidebar";

const RecruiterLayout = () => {
  return (
    <div className='min:h-screen w-full"'>
      <TeacherRecruiterHeader />
      <div className="flex w-full">
        <div className="hidden md:block">
          <RecruiterSidebar />
        </div>
        <div className="w-full md:ml-72 mt-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default RecruiterLayout;

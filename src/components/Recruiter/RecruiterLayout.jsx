import React, { useState } from "react";
import TeacherRecruiterHeader from "./components/RecruiterHeader";
import { Outlet } from "react-router-dom";
import RecruiterSidebar from "./components/RecruiterSidebar";
import { Helmet } from "react-helmet-async";

const RecruiterLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Helmet>
        <title>PTPI | Recruiter Panel</title>
      </Helmet>
      <div className='min:h-screen w-full"'>
        <TeacherRecruiterHeader isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className="flex w-full">
          <div className="md:block">
            <RecruiterSidebar isOpen={isOpen} setIsOpen={setIsOpen}/>
          </div>
          <div className="w-full md:ml-72 mt-16">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default RecruiterLayout;

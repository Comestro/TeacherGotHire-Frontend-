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
      <div className='min:h-screen w-full bg-background'>
        <TeacherRecruiterHeader isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className="flex w-full mt-16">
          <div className="md:block">
            <RecruiterSidebar isOpen={isOpen} setIsOpen={setIsOpen}/>
          </div>
          <div className={`w-full transition-all duration-300 ${isOpen ? 'md:ml-0' : 'md:ml-[330px]' } p-4`}>
            <Outlet context={{ isOpen, setIsOpen }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default RecruiterLayout;

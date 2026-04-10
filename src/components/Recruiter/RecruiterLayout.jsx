import React, { useState } from "react";
import UniversalHeader from '../commons/UniversalHeader';
import { Outlet, useLocation } from "react-router-dom";
import RecruiterSidebar from "./components/RecruiterSidebar";
import { Helmet } from "react-helmet-async";

const RecruiterLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isTeacherViewPage = location.pathname.match(/\/teacher\/\d+$/);
  
  return (
    <>
      <Helmet>
        <title>PTPI | Recruiter Panel</title>
      </Helmet>
      <div className='min-h-screen w-full bg-background'>
        <UniversalHeader 
          onToggleSidebar={() => setIsOpen(!isOpen)} 
          isSidebarPresent={true} 
        />
        <div className="flex w-full">
          {/* Hide sidebar on teacher view page */}
          {!isTeacherViewPage && (
            <div className="md:block">
              <RecruiterSidebar isOpen={isOpen} setIsOpen={setIsOpen}/>
            </div>
          )}
          <div className={`w-full transition-all duration-300`}>
            <Outlet context={{ isOpen, setIsOpen }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default RecruiterLayout;

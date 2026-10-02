import React, { useState } from "react";
import TeacherRecruiterHeader from "./components/RecruiterHeader";
import { Outlet, useLocation } from "react-router-dom";
import RecruiterSidebar from "./components/RecruiterSidebar";
import { Helmet } from "react-helmet-async";

const RecruiterLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isTeacherViewPage = location.pathname.match(/\/teacher\/\d+$/);
  const isWalletPage = location.pathname.includes('/wallet');
  const isHireRequestsPage = location.pathname.includes('/hire-requests');
  
  return (
    <>
      <Helmet>
        <title>PTPI | Recruiter Panel</title>
      </Helmet>
      <div className='min-h-screen w-full bg-background'>
        <TeacherRecruiterHeader isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className="flex w-full mt-16">
          {/* Hide sidebar on teacher view page, wallet page, and hire requests page */}
          {!isTeacherViewPage && !isWalletPage && !isHireRequestsPage && (
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

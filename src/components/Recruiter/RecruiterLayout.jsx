import React, { useState } from 'react';
import TeacherRecruiterHeader from './components/RecruiterHeader';
import { Outlet } from 'react-router-dom';
import RecruiterSidebar from './components/RecruiterSidebar';

const RecruiterLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <TeacherRecruiterHeader />

      <div className="flex flex-1">
        {/* Sidebar for larger screens */}
        <div className={`lg:w-64 w-full bg-gray-800 text-white h-screen hidden lg:block transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`} aria-label="Sidebar">
          <RecruiterSidebar />
        </div>
        
        {/* Mobile Sidebar */}
        <div className={`lg:hidden w-full h-full fixed top-0 left-0 bg-gray-800 text-white transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
          <div className="flex justify-between p-4">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-white text-2xl"
            >
              &times;
            </button>
          </div>
          <RecruiterSidebar />
        </div>

        {/* Main Content Area */}
        <div className={`flex flex-1 transition-all duration-300${isSidebarOpen ? 'ml-0' : 'lg:ml-64'}`}>
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterLayout;

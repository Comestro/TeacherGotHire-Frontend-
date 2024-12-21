import React, { useState } from "react";
import Sidebar from "./Dashboard/DashboardSidebar";
import { Outlet } from "react-router-dom";
import DashboardHeader from "./Dashboard/components/DashboardHeader";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-gradient-to-b from-teal-100 to-gray-100">
      <div className="w-full max-w-screen-2xl mx-auto">
        <div className="flex bg-gradient-to-b from-teal-100 to-gray-100">
          {/* Sidebar Drawer */}
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

          {/* Right section */}
          <div
            className={`w-full ${isOpen ? "ml-0" : "md:ml-72"} transition-all`}
          >
            <div className="flex-1">
              {/* Teacher Dashboard Header */}
              <DashboardHeader isOpen={isOpen} setIsOpen={setIsOpen} />

              {/* Outlet section */}
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;

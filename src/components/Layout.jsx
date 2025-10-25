import React, { useState } from "react";
import Sidebar from "./Dashboard/DashboardSidebar";
import { Outlet } from "react-router-dom";
import DashboardHeader from "./Dashboard/components/DashboardHeader";
  
const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
        <div className="flex ">
          {/* Sidebar Drawer */}
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

          {/* Right section */}
          <div
            className={`w-full ${isOpen ? "ml-0" : "md:ml-72"} transition-all`}
          >
            <div className="flex-1">
              {/* Teacher Dashboard Header */}
              <div className="fixed top-0 md:left-72 left-0 right-0 z-50 bg-white shadow-md">
                <DashboardHeader isOpen={isOpen} setIsOpen={setIsOpen} />
              </div>

              {/* Outlet section */}
              <div className="mt-[60px] md:mt-[54px]">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Layout;

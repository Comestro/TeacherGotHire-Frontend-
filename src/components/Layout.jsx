import React from "react";
import Sidebar from "./Dashboard/DashboardSidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="w-full bg-gradient-to-b from-teal-100 to-gray-100">
      <div className="w-full max-w-screen-2xl mx-auto">
      <div className="flex gap-5 bg-gradient-to-b from-teal-100 to-gray-100">
        <div className="hidden md:fixed md:block sm-hidden w-72">
          <Sidebar />
        </div>
        <div className="w-full md:ml-72">
          <div className="flex-1 p-2 bg-teal-50">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Layout;

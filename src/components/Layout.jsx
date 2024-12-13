import React from "react";
import Sidebar from "./Dashboard/DashboardSidebar";
import { Outlet } from "react-router-dom";


const Layout = () => {
  return (
    <div className="flex gap-5 p-3 bg-gradient-to-b from-teal-100 to-gray-100">
      <div className="hidden md:fixed md:block sm-hidden w-72 px-5">
        <Sidebar />
      </div>
      <div className="w-full px-5 md:ml-72">
        <div className="flex-1 p-2 bg-white rounded-xl shadow-xl">
          <Outlet /> {/* Renders nested route content */}
        </div>
      </div>
    </div>
  );
};

export default Layout;

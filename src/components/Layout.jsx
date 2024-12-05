import React from "react";
import Sidebar from "./Dashboard/DashboardSidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex h-screen">
      {/* Static Sidebar */}
      <Sidebar />

      {/* Dynamic Content */}
      <div className="flex-1 p-6 bg-gray-100">
        <Outlet /> {/* Renders nested route content */}
      </div>
    </div>
  );
};

export default Layout;

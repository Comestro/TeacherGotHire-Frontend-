import React from "react";
import Sidebar from "./Dashboard/DashboardSidebar";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";

const Layout = () => {
  return (
    <div className="p-3 bg-gradient-to-b from-teal-100 to-gray-100">
      <div className=" fixed bg-blue-200">
        <Sidebar />
      </div>
      <div className="ml-60">
        {/* <div className=" bg-yellow-200">
          <Navbar
            links={[
              { id: "1", label: "Home", to: "/" },
              { id: "2", label: "Contact US", to: "/contact" },
              { id: "3", label: "Logout", to: "/about" },
            ]}
            variant="dark"
            // notifications={notifications}
            //externalComponent={ProfileButton}
          />
        </div> */}
        <div className="flex-1 p-2 bg-white rounded-xl shadow-2xl">
          <Outlet /> {/* Renders nested route content */}
        </div>
      </div>
    </div>
  );
};

export default Layout;

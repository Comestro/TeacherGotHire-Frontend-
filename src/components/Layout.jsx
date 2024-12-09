import React from "react";
import Sidebar from "./Dashboard/DashboardSidebar";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";

const Layout = () => {
  return (
    <div className="">
      <div className="w-64 fixed">
        <Sidebar />
      </div>
      <div className="ml-64">
        <div className="">
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
        </div>
        <div className="flex-1 p-2 bg-gray-100">
          <Outlet /> {/* Renders nested route content */}
        </div>
      </div>
        <Footer/>
    </div>
  );
};

export default Layout;

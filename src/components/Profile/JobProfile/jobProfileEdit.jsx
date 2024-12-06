import React from "react";
import Navbar from "../../Navbar/Navbar";
import { Outlet } from "react-router-dom";

const JobProfileEdit = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="flex-shrink-0">
        <Navbar
          links={[
            { id: "1", label: "Contact Us", to: "/contact" },
            { id: "2", label: "About Us", to: "/about" },
          ]}
          variant="dark"
        />
      </nav>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto">
        <h1 className="text-2xl flex justify-center font-bold m-4">
          Edit Profile
        </h1>
        <div className="px-6">
          <Outlet /> {/* Render nested routes here */}
        </div>
      </div>
    </div>
  );
};

export default JobProfileEdit;

import React from "react";
import Navbar from "../../Navbar/Navbar";
import { Outlet } from "react-router-dom";

const EditJobProfile = () => {
  return (
    <>
      {/* Navbar */}
      <nav>
        <Navbar
          links={[
            { id: "1", label: "Contact US", to: "/contact" },
            { id: "2", label: "About Us", to: "/about" },
          ]}
          variant="dark"
        />
      </nav>
      <div>
          <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
          <Outlet /> {/* Render nested routes here */}
      </div>
    </>
  );
};

export default EditJobProfile;

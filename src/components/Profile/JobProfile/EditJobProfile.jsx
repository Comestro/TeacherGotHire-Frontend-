
import React from "react";
import Navbar from "../../Navbar/Navbar";
import { Outlet } from "react-router-dom";

const EditJobProfile = () => {
  return (
    <>
      <div>
          <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
          <Outlet /> {/* Render nested routes here */}
      </div>
    </>
  );
};

export default EditJobProfile;

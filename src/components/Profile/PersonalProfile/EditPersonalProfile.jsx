import React from "react";
import Navbar from "../../Navbar/Navbar";
import { Outlet } from "react-router-dom";
import BasicInformation from "./BasicInformation";
import AddressProfileCard from "./AddressProfileCard";

const EditPersonalProfile = () => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-y-auto">
        <div className="flex flex-col py-4 px-10">
          {/* Render nested routes here */}
          <BasicInformation/>
          <AddressProfileCard/>
        </div>
      </div>
    </div>
  );
};

export default EditPersonalProfile;

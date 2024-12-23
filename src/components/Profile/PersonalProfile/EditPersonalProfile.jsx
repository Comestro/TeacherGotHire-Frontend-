import React from "react";
import BasicInformation from "./BasicInformation";
import AddressProfileCard from "./AddressProfileCard";

const EditPersonalProfile = () => {
  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 w-full">
        <div className="flex flex-col w-full py-4 px-6">
          <BasicInformation />
          <AddressProfileCard />
        </div>
      </div>
    </div>
  );
};

export default EditPersonalProfile;

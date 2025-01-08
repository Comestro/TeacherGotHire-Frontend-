import React from "react";
import RecruiterProfile from "./RecruiterProfile";
import RecruiterAddress from "./RecruiterAddress";

const EditPersonalProfile = () => {
  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 w-full">
        <div className="flex flex-col w-full py-4 px-6">
          <RecruiterProfile />
          <RecruiterAddress />
        </div>
      </div>
    </div>
  );
};

export default EditPersonalProfile;

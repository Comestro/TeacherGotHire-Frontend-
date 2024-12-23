import React from "react";
import PrefrenceProfile from "./PrefrenceProfile";
import JobPrefrenceLocation from "./JobPrefrenceLocation";
import Experience from "./Exprience";
import Education from "./Education";

const JobProfileEdit = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Main Content */}
      <div className="flex-grow overflow-y-auto">
        <h1 className="text-2xl flex justify-center font-bold m-4">
          Edit Profile
        </h1>
        <div className="px-6">
          <PrefrenceProfile/>
          <JobPrefrenceLocation/>
          <Experience/>
          <Education/>
        </div>
      </div>
    </div>
  );
};

export default JobProfileEdit;
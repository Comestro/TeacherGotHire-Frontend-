import React from "react";
import PrefrenceProfile from "./PrefrenceProfile";
import JobPrefrenceLocation from "./JobPrefrenceLocation";

const JobProfileEdit = () => {
  return (
    <div className="">
      {/* Main Content */}
      <div className="min-h-screen bg-white py-5 px-8">
          <PrefrenceProfile/>
          <JobPrefrenceLocation/>
      </div>
    </div>
  );
};

export default JobProfileEdit;
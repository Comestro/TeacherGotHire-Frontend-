import React from "react";
import PrefrenceProfile from "./PrefrenceProfile";
import JobPrefrenceLocation from "./JobPrefrenceLocation";
import Experience from "./Exprience";
import Education from "./Education";
import Skills from "./Skills";

const JobProfileEdit = () => {
  return (
    <div className="">
      {/* Main Content */}
      <div className="min-h-screen bg-white py-5 px-2 md:px-4 lg:px-6">
          <PrefrenceProfile/>
          <JobPrefrenceLocation/>
          <Experience/>
          <Education/>
          <Skills/>
        </div>
      </div>
  );
};

export default JobProfileEdit;
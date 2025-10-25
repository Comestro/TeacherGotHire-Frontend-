import React from "react";
import PrefrenceProfile from "./PrefrenceProfile";
import JobPrefrenceLocation from "./JobPrefrenceLocation";
import Experience from "./Exprience";
import Education from "./Education";
import Skills from "./Skills";

const JobProfileEdit = () => {
  return (
      <div className="min-h-screen bg-white md:py-5 md:px-2 md:px-4 lg:px-6">
          <div className="px-2 md:px-4">
            <PrefrenceProfile/>
            <Experience/>
            <Education/>
            <Skills/>
          </div>
        </div>
  );
};

export default JobProfileEdit;
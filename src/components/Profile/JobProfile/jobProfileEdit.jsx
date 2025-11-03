import React from "react";
import PrefrenceProfile from "./PrefrenceProfile";
import JobPrefrenceLocation from "./JobPrefrenceLocation";
import Experience from "./Exprience";
import Education from "./Education";
import Skills from "./Skills";

const JobProfileEdit = () => {
  return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 py-6 px-3 md:py-8 md:px-6 lg:px-8">
          <div className="max-w-8xl mx-auto space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text mb-2">
                Job Profile
                <span className="ml-3 text-secondary text-base font-normal">/ नौकरी प्रोफ़ाइल</span>
              </h1>
              <p className="text-sm text-secondary">Complete your professional profile to unlock job opportunities</p>
            </div>
            <PrefrenceProfile/>
            <Experience/>
            <Education/>
            <Skills/>
          </div>
        </div>
  );
};

export default JobProfileEdit;
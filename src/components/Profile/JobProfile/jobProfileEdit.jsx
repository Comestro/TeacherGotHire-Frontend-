import React from "react";
import PrefrenceProfile from "./PrefrenceProfile";
import Experience from "./Exprience";
import Education from "./Education";
import Skills from "./Skills";
import { HiBriefcase } from "react-icons/hi";

const JobProfileEdit = () => {
  return (
    <div className="w-full mx-auto">
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <span className="p-2 bg-teal-50 rounded-lg text-teal-600">
              <HiBriefcase className="w-6 h-6" />
            </span>
            Teacher Profile
          </h2>
          <p className="text-slate-500 mt-0 ml-14 text-sm">
            Complete your professional profile
          </p>
        </div>

        <PrefrenceProfile />
        <Experience />
        <Education />
        <Skills />
      </div>
    </div>
  );
};

export default JobProfileEdit;
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
            Job Profile
            <span className="text-slate-400 text-lg font-normal">/ नौकरी प्रोफ़ाइल</span>
          </h2>
          <p className="text-slate-500 mt-2 ml-14 text-sm">
            Complete your professional profile to unlock job opportunities / नौकरी के अवसरों को अनलॉक करने के लिए अपनी पेशेवर प्रोफ़ाइल पूरी करें
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
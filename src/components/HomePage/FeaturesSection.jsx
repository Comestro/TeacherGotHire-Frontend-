import React from "react";
import { BiLogInCircle } from "react-icons/bi";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { IoVideocamOutline } from "react-icons/io5";
import { LiaChalkboardTeacherSolid, LiaMoneyCheckSolid } from "react-icons/lia";
import { FiArrowRight, FiPlay } from "react-icons/fi";

const FeaturesSection = () => {
  return (
    <section className="bg-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-100 font-outfit">
      <div className="max-w-7xl mx-auto text-center relative z-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-100 bg-orange-50/50 w-fit mb-6 mx-auto">
           <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
           <span className="text-xs font-bold text-orange-700 tracking-widest uppercase">How it works</span>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight mb-6">
          Simplified <span className="text-orange-600 block mt-2">5-Step Hiring Process</span>
        </h2>
        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
          Join our elite team of educators in just five streamlined steps. No friction, straightforward communication, and immediate opportunities.
        </p>

        <div className="space-y-8">
          {/* First Row */}
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
            <div className="bg-[#fcfdfd] p-8 md:p-10 rounded-lg border border-slate-200 transition-colors duration-300 hover:border-slate-300">
              <div className="w-16 h-16 mx-auto bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center mb-6">
                <BiLogInCircle className="text-3xl text-teal-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                1. Login/Sign Up
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">
                Create an entirely free account in less than a minute to begin your application process.
              </p>
            </div>

            <div className="bg-[#fcfdfd] p-8 md:p-10 rounded-lg border border-slate-200 transition-colors duration-300 hover:border-slate-300">
              <div className="w-16 h-16 mx-auto bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center mb-6">
                <HiOutlinePencilSquare className="text-3xl text-teal-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                2. Take an Exam
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">
                Complete a secure online skill test. You get a maximum of 2 attempts to prove your excellence.
              </p>
            </div>

            <div className="bg-[#fcfdfd] p-8 md:p-10 rounded-lg border border-slate-200 transition-colors duration-300 hover:border-slate-300">
              <div className="w-16 h-16 mx-auto bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center mb-6">
                <IoVideocamOutline className="text-3xl text-teal-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                3. Interview
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">
                Showcase your communication and educational skills in a quick, virtual interview with our panel.
              </p>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:px-32">
            <div className="bg-[#fcfdfd] p-8 md:p-10 rounded-lg border border-slate-200 transition-colors duration-300 hover:border-slate-300">
              <div className="w-16 h-16 mx-auto bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center mb-6">
                <LiaChalkboardTeacherSolid className="text-3xl text-teal-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                4. Demo Classes
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">
                Conduct 10 days of trial demo classes to directly prove your teaching mastery to students.
              </p>
            </div>

            <div className="bg-[#fcfdfd] p-8 md:p-10 rounded-lg border border-slate-200 transition-colors duration-300 hover:border-slate-300">
              <div className="w-16 h-16 mx-auto bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center mb-6">
                <LiaMoneyCheckSolid className="text-3xl text-teal-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                5. Get Hired
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">
                Pass all steps and get officially hired! Receive your full salary with a simple 30% first-month system deduction.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-16">
          <button className="px-8 py-4 bg-teal-600 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-3 hover:bg-teal-700 active:scale-95 transition-all">
            Join as Educator <FiArrowRight className="w-5 h-5"/>
          </button>
          <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-50 active:scale-95 transition-all">
            <FiPlay className="fill-slate-600 w-4 h-4" /> Watch Process Video
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

import React from "react";
import { BiLogInCircle } from "react-icons/bi";
import {
  FaUserCheck,
  FaPencilAlt,
  FaVideo,
  FaChalkboardTeacher,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { IoVideocamOutline } from "react-icons/io5";
import { LiaChalkboardTeacherSolid, LiaMoneyCheckSolid } from "react-icons/lia";

const FeaturesSection = () => {
  return (
    <section className="bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
          Simplified <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500" style={{ fontFamily: '"Edu AU VIC WA NT Pre", cursive' }}>5-Step</span> Teacher Hiring Process
        </h2>
        <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto mb-16">
          Join our team in just five easy steps and kickstart your teaching journey.
        </p>

        <div className="space-y-8">
          {/* First Row */}
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-none hover:shadow-sm transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto bg-teal-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BiLogInCircle className="text-4xl text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Step 1: Login/Sign Up
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Create an account to begin your application process.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-none hover:shadow-sm transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto bg-teal-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <HiOutlinePencilSquare className="text-4xl text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Step 2: Take an Exam
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Complete a secure online test with a maximum of 2 attempts.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-none hover:shadow-sm transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto bg-teal-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <IoVideocamOutline className="text-4xl text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Step 3: Interview
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Showcase your skills in a virtual interview.
              </p>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:mx-32">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-none hover:shadow-sm transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto bg-teal-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <LiaChalkboardTeacherSolid className="text-4xl text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Step 4: Demo Classes
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Conduct 10 days of demo classes to prove your teaching ability.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-none hover:shadow-sm transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto bg-teal-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <LiaMoneyCheckSolid className="text-4xl text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Step 5: Get Hired
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Receive your salary with a 30% deduction for the hiring process.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-16">
          <button className="px-8 py-4 bg-teal-600 text-white rounded-xl font-bold shadow-sm hover:bg-teal-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300">
            Learn More
          </button>
          <button className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:border-teal-500 hover:text-teal-600 transition-all duration-300">
            Watch Process Video
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

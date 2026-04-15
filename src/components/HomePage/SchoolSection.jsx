import React from "react";
import { FiArrowRight } from "react-icons/fi";

const SchoolSection = ({ onSelectRole }) => {
  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100 font-outfit">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#fcfdfd] rounded-lg border border-slate-200 overflow-hidden relative p-8 md:p-12 lg:p-16">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Section with Image */}
            <div className="relative lg:h-full flex items-center justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-md aspect-square bg-white rounded-lg border border-slate-100 p-8 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 rounded-lg bg-indigo-50/20 animate-pulse" />
                <img
                  src="https://img.freepik.com/premium-vector/teacher-teaching-classroom-vector-illustration_1253202-25002.jpg?ga=GA1.1.1207010740.1728043749&semt=ais_hybrid"
                  alt="Classroom"
                  className="relative z-10 w-full h-full object-contain rounded-lg"
                />
              </div>
            </div>

            {/* Right Section with Text */}
            <div className="space-y-8 order-1 lg:order-2">
              <div className="space-y-6 max-w-xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-100 bg-indigo-50/50 w-fit">
                   <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                   <span className="text-xs font-bold text-indigo-700 tracking-widest uppercase">For Institutions</span>
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 leading-[1.1] tracking-tight">
                  Does your school need <span className="text-indigo-600 block mt-2">Dedicated Teachers?</span>
                </h2>
                
                <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
                  We provide qualified teachers committed to shaping a brighter future for your students. Partner with us today and connect with our elite network of verified educators!
                </p>
              </div>

              <div className="flex">
                <button
                  onClick={() => onSelectRole("school")}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-95 transition-all w-full sm:w-auto"
                >
                  Hire Top Faculty <FiArrowRight className="w-5 h-5"/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolSection;

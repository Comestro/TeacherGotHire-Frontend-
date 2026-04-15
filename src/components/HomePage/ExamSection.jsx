import React from "react";
import { IoIosArrowForward } from "react-icons/io";
import { FiArrowRight } from "react-icons/fi";

const ExamSection = () => {
  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100 font-outfit">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#fcfdfd] rounded-lg border border-slate-200 overflow-hidden relative p-8 md:p-12 lg:p-16">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-50/60 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Section with Text */}
            <div className="space-y-8">
              <div className="space-y-6 max-w-xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-100 bg-sky-50/50 w-fit">
                   <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                   <span className="text-xs font-bold text-sky-700 tracking-widest uppercase">Lightning Fast</span>
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 leading-[1.1] tracking-tight">
                  Deploy your first robust exam in <span className="text-sky-600">under an hour!</span>
                </h2>
                
                <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
                  We provide a completely frictionless technical environment so you can focus entirely on educational quality instead of dealing with complicated software.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "No credit card required upfront",
                  "No hidden integrations or complex software installations",
                  "Zero mandatory student account creation loops",
                  "No need to hop on long sales demo calls",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 bg-white border border-slate-100 rounded-lg p-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                      <IoIosArrowForward />
                    </div>
                    <span className="text-sm md:text-base font-medium text-slate-600">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex">
                <button className="px-8 py-4 bg-slate-800 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-900 active:scale-95 transition-all w-full sm:w-auto">
                  Start free trial <FiArrowRight className="w-5 h-5"/>
                </button>
              </div>
            </div>

            {/* Right Section with Image */}
            <div className="relative lg:h-full flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square bg-white rounded-lg border border-slate-100 p-4 flex items-center justify-center overflow-hidden shadow-sm">
                <div className="absolute inset-0 rounded-lg bg-sky-50/20 animate-pulse" />
                <img
                  src="edu.jpg"
                  alt="Classroom"
                  className="relative z-10 w-full h-full object-cover rounded-lg border border-slate-100"
                />
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSection;

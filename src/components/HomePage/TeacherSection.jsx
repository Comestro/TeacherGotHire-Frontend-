import React from "react";
import { FiArrowRight } from "react-icons/fi";

const TeacherSection = ({ onSelectRole }) => {
  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100 font-outfit">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#fcfdfd] rounded-lg border border-slate-200 overflow-hidden relative p-8 md:p-12 lg:p-16">
          {/* Decorative background elements */}
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-50/60 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Section */}
            <div className="space-y-8">
              <div className="space-y-6 max-w-xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-100 bg-orange-50/50 w-fit">
                   <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                   <span className="text-xs font-bold text-orange-700 tracking-widest uppercase">Join Our Community</span>
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 leading-[1.1] tracking-tight">
                  क्या आप <span className="text-orange-600">Teacher</span> बनना चाहते हैं?
                </h2>
                
                <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
                  क्या आपने कभी सोचा है कि आप अगली पीढ़ी को कैसे आकार देंगे? आज ही आवेदन करें और हमारे एजुकेशन नेटवर्क का हिस्सा बनें! आप सबसे बेहतरीन टीचर बन जाएंगे जो छात्रों को प्रेरित करता है। 🌟
                </p>
              </div>

              <div className="flex">
                <button
                  onClick={() => onSelectRole("teacher")}
                  className="px-8 py-4 bg-orange-600 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-3 hover:bg-orange-700 active:scale-95 transition-all w-full sm:w-auto"
                >
                  Apply as Educator <FiArrowRight className="w-5 h-5"/>
                </button>
              </div>
            </div>

            {/* Right Section */}
            <div className="relative lg:h-full flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square bg-white rounded-lg border border-slate-100 p-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-orange-50/20 animate-pulse" />
                <img
                  src="https://pngimg.com/d/teacher_PNG84.png"
                  alt="Teacher"
                  className="relative z-10 w-[80%] h-[80%] object-contain"
                />

                {/* Floating Elements (Clean borders) */}
                <div className="absolute -top-6 -right-6 bg-white p-5 rounded-lg border border-slate-100 animate-float" style={{ animationDelay: "0s" }}>
                  <span className="text-3xl">📚</span>
                </div>
                <div className="absolute bottom-12 -left-8 bg-white p-5 rounded-lg border border-slate-100 animate-float" style={{ animationDelay: "1.5s" }}>
                  <span className="text-3xl">🎓</span>
                </div>
                <div className="absolute top-1/2 -right-10 bg-white p-5 rounded-lg border border-slate-100 animate-float" style={{ animationDelay: "3s" }}>
                  <span className="text-3xl">💡</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSection;

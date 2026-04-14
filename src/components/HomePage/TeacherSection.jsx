import React from "react";

const TeacherSection = ({ onSelectRole }) => {
  return (
    <div className="relative py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden relative">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-50/50 to-transparent" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-50/50 rounded-full blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-6 md:p-10 lg:p-12">
            {/* Left Section */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  <span className="block text-lg font-medium text-teal-600 mb-2 tracking-wide uppercase">
                    Join Our Community
                  </span>
                  क्या आप{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 font-extrabold">
                    Teacher
                  </span>{" "}
                  बनना चाहते हैं?
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                  क्या आपने कभी सोचा है कि आप अगली पीढ़ी को कैसे आकार देंगे? आज
                  ही आवेदन करें और हमारे मिशन का हिस्सा बनें! बोनस: आप सबसे कूल
                  टीचर बन जाएंगे (कम से कम छात्रों की नजर में)! 🌟
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onSelectRole("teacher")}
                  className="px-8 py-4 bg-teal-600 text-white rounded-xl font-bold shadow-sm hover:bg-teal-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Explore More
                </button>
              </div>
            </div>

            {/* Right Section */}
            <div className="relative lg:h-full flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square">
                {/* Image Container */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-orange-100 rounded-full animate-pulse opacity-50" />
                <img
                  src="https://pngimg.com/d/teacher_PNG84.png"
                  alt="Teacher"
                  className="relative z-10 w-full h-full object-contain drop-shadow-xl transform hover:scale-105 transition-transform duration-500"
                />

                {/* Floating Elements */}
                <div
                  className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-sm animate-float"
                  style={{ animationDelay: "0s" }}
                >
                  <span className="text-2xl">📚</span>
                </div>
                <div
                  className="absolute bottom-8 -left-4 bg-white p-4 rounded-2xl shadow-sm animate-float"
                  style={{ animationDelay: "1.5s" }}
                >
                  <span className="text-2xl">🎓</span>
                </div>
                <div
                  className="absolute top-1/2 -right-8 bg-white p-4 rounded-2xl shadow-sm animate-float"
                  style={{ animationDelay: "3s" }}
                >
                  <span className="text-2xl">💡</span>
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

import React from "react";

const SchoolSection = ({ onSelectRole }) => {
  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-teal-50/50 to-transparent" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 md:p-12 lg:p-16">
            {/* Left Section with Image */}
            <div className="relative lg:h-full flex items-center justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-md aspect-square">
                {/* Image Container */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-indigo-100 rounded-full animate-pulse opacity-50" />
                <img
                  src="https://img.freepik.com/premium-vector/teacher-teaching-classroom-vector-illustration_1253202-25002.jpg?ga=GA1.1.1207010740.1728043749&semt=ais_hybrid"
                  alt="Classroom"
                  className="relative z-10 w-full h-full object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500 rounded-2xl"
                />
              </div>
            </div>

            {/* Right Section with Text */}
            <div className="space-y-8 order-1 lg:order-2">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  <span className="block text-lg font-medium text-teal-600 mb-2 tracking-wide uppercase">For Institutions</span>
                  Does your school need <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 font-extrabold">Dedicated Teachers?</span>
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                  We provide qualified teachers committed to shaping a brighter
                  future for your students. Login today and connect with our expert
                  educators!
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onSelectRole("school")}
                  className="px-8 py-4 bg-teal-600 text-white rounded-xl font-bold shadow-sm hover:bg-teal-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Explore More
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

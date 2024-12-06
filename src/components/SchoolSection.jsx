import React from "react";

const SchoolSection = ({ onSelectRole }) => {
  return (
    <div className="relative  overflow-hidden mb-5">
      {/* Content */}
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center px-6 sm:px-12">
        {/* Left Section with Image */}
        <div className="relative w-full mt-5 text-center">
          <div className="w-full h-64 lg:h-96">
            <img
              src="school.png"
              alt="Classroom"
              className="w-full h-full object-contain items-baseline"
            />
          </div>
        </div>

        {/* Right Section with Text */}
        <div className="text-teal-700 mb-10 md:mt-10">
          <h1 className="text-4xl sm:text-4xl font-bold mb-6 leading-normal">
          Does your school need dedicated teachers?
          </h1>
          <p className="text-lg sm:text-xl mb-6 leading-relaxed font-serif text-gray-600">
            We provide qualified teachers committed to shaping a brighter
            future for your students. Login today and connect with our expert
            educators!
          </p>
          <button
            onClick={() => onSelectRole("school")}
            className="bg-white text-teal-600 font-medium text-lg px-6 py-3 rounded-full shadow-md hover:bg-gray-100"
          >
            Explore More..
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolSection;

import React from "react";

const TeacherSection = ({ onSelectRole }) => {
  return (
    <div
      className="relative bg-teal-600 overflow-hidden mt-10"
      style={{
        backgroundImage: `url('')`, // Add background image URL here if needed
      }}
    >
      {/* Content */}
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center px-6 sm:px-12">
        {/* Left Section */}
        <div className="text-white ml-20">
          <h1 className="text-4xl font-hindi sm:text-3xl font-bold mb-6">
            Want to become a teacher and change lives?
          </h1>

          <p className="text-lg sm:text-xl mb-6 leading-relaxed font-serif">
            Are you passionate about shaping young minds? Apply today and become part of our mission to transform education!  
            The future of the classroom is in your hands – no pressure, but no one wants to be the boring teacher either!
          </p>
          <button
            onClick={() => onSelectRole("teacher")}
            className="bg-white text-teal-600 font-medium text-lg px-6 py-3 rounded-full shadow-lg hover:bg-gray-100"
          >
            Explore More..
          </button>
        </div>

        {/* Right Section */}
        <div className="relative mt-10 text-center flex items-center justify-center">
          <div className="w-64 h-64 lg:w-96 lg:h-96 mx-auto lg:mx-0">
            <img
              src="https://pngimg.com/d/teacher_PNG84.png"
              alt="Teacher"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSection;

import React from "react";

const TeacherSection = ({onSelectRole}) => {
  return (
    <div className="relative bg-teal-600 overflow-hidden mt-10">
      {/* Header */}
      {/* <div className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <button className="text-xl">
          <span className="font-bold">☰</span>
        </button>
        <button className="text-sm font-medium text-blue-600 bg-blue-100 px-4 py-2 rounded-full shadow-md">
          📞 Call Now (800) 803-4058
        </button>
      </div> */}

      {/* Content */}
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center px-6 sm:px-12 ">
        {/* Left Section */}
        <div className="text-white ml-20">
          <h1 className="text-4xl  font-hindi sm:text-5xl font-bold mb-6 sm:leading-hindi">
            क्या आप शिक्षक बनना चाहते हैं?
          </h1>
          <p className="text-lg sm:text-xl mb-6 leading-relaxed font-serif ">
            क्या आप अपने शिक्षण करियर को नई दिशा देना चाहते हैं? आज ही आवेदन
            करें और शिक्षा को बदलने के हमारे मिशन का हिस्सा बनें!
          </p>
          <button onClick={() => onSelectRole("teacher")}  className="bg-white text-teal-600 font-medium text-lg px-6 py-3 rounded-full shadow-lg hover:bg-gray-100">
            Explore More..
          </button>
        </div>

        {/* Right Section */}
        <div className="relative mt-10 text-center flex items-center justify-center">
          <div className="w-64 h-64 lg:w-96 lg:h-96 mx-auto lg:mx-0">
            <img
              src="https://pngimg.com/d/teacher_PNG84.png"
              alt="Classroom"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSection;

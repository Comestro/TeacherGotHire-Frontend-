import React from "react";

const SchoolSection = ({ onSelectRole }) => {
  return (
    <div className="relative bg-slate-200 overflow-hidden ">
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
        <div className="text-teal-700 ml-20">
          <h1 className="text-4xl text-render sm:text-4xl font-bold mb-6 sm:leading-hindi font-hindi">
            क्या आपके स्कूल को शिक्षक की आवश्यकता है?
          </h1>
          <p className="text-lg font-hindi text-render sm:text-xl mb-6 leading-relaxed text-gray-600">
            हम आपके छात्रों के उज्ज्वल भविष्य के लिए समर्पित शिक्षकों की पेशकश
            करते हैं। आज ही लॉगिन करें और हमारे योग्य शिक्षकों से जुड़ें!
          </p>
          <button
            onClick={() => onSelectRole("school")}
            className="bg-white text-teal-600 font-medium text-lg px-6 py-3 rounded-full shadow-md hover:bg-gray-100"
          >
            Explore More..
          </button>
        </div>

        {/* Right Section */}
        <div className="relative w-full mt-5 text-center">
          <div className="w-full h-64 lg:h-96 ">
            <img
              src="school.png"
              alt="Classroom"
              className="w-full h-full object-contain items-baseline"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolSection;

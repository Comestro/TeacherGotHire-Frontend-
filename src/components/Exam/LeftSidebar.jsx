import React, { useEffect, useRef } from "react";

const LeftSidebar = ({ currentQuestionIndex }) => {
  const questionRefs = useRef([]);

  useEffect(() => {
    // Ensure the current question is visible
    if (questionRefs.current[currentQuestionIndex]) {
      questionRefs.current[currentQuestionIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentQuestionIndex]);

  return (
    <div className="lg:w-[5%] lg:overflow-y-hidden overflow-x-hidden pt-9 bg-white lg:shadow-md lg:border-r border-gray-200 flex lg:flex-col lg:items-center
    ">
      
      <div className="w-[60px] h-[60px] mb-4">
        <div className="flex justify-center items-center flex-col text-xl font-bold text-center">
          <div>
            <h1 className="text-gray-500 font-semibold lg:text-2xl text-lg mt-4 mx-2">
              <span
                style={{ fontFamily: '"Edu AU VIC WA NT Pre", cursive' }}
                className="text-teal-400"
              >
                P
              </span>
              TPI
            </h1>
          </div>
          <div className="items-center">
            <img src="orange-border.svg" alt="" />
          </div>
        </div>
      </div>

      {/* Sidebar Menu */}
      <ul className="flex lg:flex-col md:flex-row gap-4 text-center mt-4">
        {Array.from({ length: 60 }, (_, i) => (
          <li
            key={i + 1}
            ref={(el) => (questionRefs.current[i] = el)}
            className={`text-gray-700 rounded-full bg-gray-200 w-8 text-center flex items-center justify-center h-8 font-medium ${
              i === currentQuestionIndex ? " text-white bg-green-400" : ""
            }`}
          >
            {i + 1}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeftSidebar;

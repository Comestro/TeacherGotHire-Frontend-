import React, { useState, useEffect } from "react";

export default function Subheader({ totalQuestion, subject }) {
  const [timeLeft, setTimeLeft] = useState(totalQuestion*2 * 60); // 30 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          alert("Time's up!");
          // You can trigger any function here, like auto-submitting the exam.
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format the time in MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className=" rounded-md py-4 px-6 bg-gray-50 shadow-md flex justify-between items-center border-b border-gray-300">
      <div className="flex flex-col">
      <h1 className="lg:text-2xl text-md font-bold text-teal-600">Private Teacher Provider Institute <br />
       <span className="text-gray-500 font-semibold lg:text-lg text-sm"> PTPI / Exam / {subject?.subject.subject_name } / {subject?.level.name }</span></h1>
      </div>
      <div className="relative lg:w-24 lg:h-24 w-20 h-20 flex items-center justify-center rounded-full shadow-lg">
        {/* Clock Base */}
        <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center">
          <div className="lg:w-20 lg:h-20 bg-gray-100 rounded-full flex items-center justify-center shadow-inner">
          </div>
        </div>

        {/* Time Remaining */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-sm font-medium text-gray-500">Time Left</span>
          <span className="lg:text-lg text-sm font-bold text-gray-700">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </div>
  );
}

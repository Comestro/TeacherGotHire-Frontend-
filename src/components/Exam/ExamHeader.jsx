import React, { useState, useEffect } from "react";

export default function Subheader({ totalQuestion }) {
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
    <div className="bg-white rounded-md py-4 px-6 shadow-md flex justify-between items-center border-b border-gray-300">
      <h1 className="text-xl font-bold text-teal-700">English / Level 1</h1>
      <div className="relative w-24 h-24 flex items-center justify-center rounded-full shadow-lg">
        {/* Clock Base */}
        <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center shadow-inner">
          </div>
        </div>

        {/* Time Remaining */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-sm font-medium text-gray-500">Time Left</span>
          <span className="text-lg font-bold text-gray-700">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </div>
  );
}

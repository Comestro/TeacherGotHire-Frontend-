import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function Subheader({handleSubmit}) {
  const { allQuestion } = useSelector((state) => state.examQues);
  const allques = allQuestion?.questions || [];

  // Extract the duration from allQuestion (in minutes)
  const examDuration = allQuestion?.duration || 0; // Duration in minutes

  // Convert duration to seconds for the timer
  const initialTimeLeft = examDuration * 60; // Convert minutes to seconds

  // Initialize timer state
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);

  // Start the timer when the component mounts or when allQuestion changes
  useEffect(() => {
    setTimeLeft(initialTimeLeft); // Reset the timer when allQuestion changes
  }, [allQuestion]); // Dependency array ensures this runs when allQuestion changes

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit the exam when time is up
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup the timer on unmount
  }, [allQuestion]); // Restart the timer when allQuestion changes


  // Format the time in MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Subject details from Redux store
  const subject = useSelector((state) => state.examQues.exam);
  const language = useSelector((state) => state.examQues.language);

  return (
    <div className="w-full bg-white py-4 px-4 sm:px-6 flex flex-wrap md:flex-nowrap justify-between items-center">
      {/* Subject Details */}
      <div className="flex flex-col w-full md:w-auto mb-4 md:mb-0">
        <h1 className="text-lg md:text-xl font-bold text-teal-700">
          <span className="hidden md:inline">Subject: </span>
          {subject?.subject?.subject_name} |
          <span className="hidden md:inline"> Level: </span>
          {subject?.level?.name} |
          <span className="hidden md:inline"> Language: </span>
          {language}
        </h1>
      </div>

      {/* Time Remaining */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <span className="text-sm md:text-md font-medium text-gray-500 mr-2">
          Time Left:
        </span>
        <span className="text-base md:text-lg font-bold text-gray-700">
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
}
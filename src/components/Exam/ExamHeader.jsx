
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function Subheader({ handleSubmit }) {
  const { allQuestion } = useSelector((state) => state.examQues);
  const examDuration = allQuestion?.duration;
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerStarted, setTimerStarted] = useState(false);

  // Initialize timer when duration is available
  useEffect(() => {
    if (examDuration && examDuration > 0 && !timerStarted) {
      setTimeLeft(examDuration * 60);
      setTimerStarted(true);
    }
  }, [examDuration, timerStarted]);

  // Timer countdown logic
  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  // Format time with min/sec labels
  const formatTime = (seconds) => {
    if (seconds === null) return "Loading...";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return (
      <span className="flex items-center gap-1">
        <span className="flex items-center">
          {minutes.toString().padStart(2, "0")}
          <span className="text-xs ml-1">min</span>
        </span>
        :
        <span className="flex items-center">
          {remainingSeconds.toString().padStart(2, "0")}
          <span className="text-xs ml-1">sec</span>
        </span>
      </span>
    );
  };

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
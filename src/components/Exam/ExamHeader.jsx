import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function Subheader() {
  

   const { allQuestion } = useSelector((state) => state.examQues);
      
   const allques = allQuestion?.questions || [];

   // Initialize totalTime state
   const  [timeLeft, setTimeLeft] = useState(0);
 
   // Calculate totalTime whenever allQuestion changes
   useEffect(() => {
     const calculatedTotalTime = allques.reduce((sum, question) => sum + (question.time || 0), 0);
     setTimeLeft(calculatedTotalTime); // Update the state with the calculated total time
   }, [allQuestion]); // Dependency array ensures this runs when allQuestion changes
 
   console.log("timeLeft",timeLeft); // Log the total time to verify
 

  const subject = useSelector((state) => state.examQues.exam);
  const Language = useSelector((state) => state.examQues);
  const language = useSelector((state) => state.examQues.language);


  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // alert("Time's up!");
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
          {formatTime(timeLeft)} min
        </span>
      </div>
    </div>
  );
}

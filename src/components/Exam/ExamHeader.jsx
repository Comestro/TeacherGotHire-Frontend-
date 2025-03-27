import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

export default function Subheader({ handleSubmit }) {
  const { allQuestion } = useSelector((state) => state.examQues);
  const examDuration = allQuestion?.duration;
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const navigate = useNavigate();

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

  const handleExitExam = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    navigate("/teacher");
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  return (
    <>
      <div className="w-full bg-white py-4 px-4 sm:px-6 flex flex-wrap md:flex-nowrap justify-between items-center border-b border-gray-200 shadow-sm">
        {/* Exam Details */}
        <div className="flex flex-col w-full md:w-auto mb-4 md:mb-0">
          <h1 className="text-lg md:text-xl font-bold text-teal-700 mb-1">
            {subject?.name || "Exam"}
          </h1>
          <div className="flex flex-wrap text-sm text-gray-600">
            <span className="mr-2 bg-blue-50 px-2 py-0.5 rounded-md text-blue-700">
              Class : {subject?.class_category?.name || ""}
            </span>
            <span className="mr-2 bg-green-50 px-2 py-0.5 rounded-md text-green-700">
              Subject : {subject?.subject?.subject_name || ""}
            </span>
            <span className="mr-2 bg-purple-50 px-2 py-0.5 rounded-md text-purple-700">
              {subject?.level?.name || ""}
            </span>
           
          </div>
        </div>

        {/* Timer and Exit Button */}
        <div className="flex items-center justify-end w-full md:w-auto gap-4">
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
            <span className="text-sm md:text-md font-medium text-gray-500 mr-2">
              Time Left:
            </span>
            <span className="text-base md:text-lg font-bold text-gray-700">
              {formatTime(timeLeft)}
            </span>
          </div>
          
          <button 
            onClick={handleExitExam}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1"
          >
            <FiLogOut className="size-4" />
            <span className="hidden sm:inline">Exit Exam</span>
          </button>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Exit Exam?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to exit? Your progress will not be saved and this will count as an attempt.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelExit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmExit}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Exit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiX } from "react-icons/fi";

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
      <div className="w-full bg-white py-2 px-3 sm:px-6 flex flex-wrap md:flex-nowrap justify-between items-center border-b border-primary/20 shadow-md">
        {/* Exam Details */}
        <div className="flex flex-col w-full md:w-auto mb-2 md:mb-0">
          <h1 className="text-base md:text-xl font-bold text-primary mb-1">
            {allQuestion?.subject?.subject_name || "Exam"}
          </h1>
          <div className="flex flex-wrap gap-2 text-xs md:text-sm space-x-3 md:space-x-5">
            <span className="text-primary font-semibold">
              Class: {allQuestion?.class_category?.name || "N/A"}
            </span>
            <span className="font-semibold">
              Subject: {allQuestion?.subject?.subject_name || "N/A"}
            </span>
            <span className="font-semibold">
              {allQuestion?.level?.name || "N/A"}
            </span>
          </div>
        </div>

        {/* Timer and Exit Button */}
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3">
          <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="text-xs md:text-md font-semibold text-text mr-2">
              Time Left:
            </span>
            <span className="text-sm md:text-lg font-bold text-primary">
              {formatTime(timeLeft)}
            </span>
          </div>

          <button
            onClick={handleExitExam}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg border border-red-700 transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 font-semibold text-xs md:text-sm"
          >
            <FiX className="size-3 md:size-4" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-200 animate-fadeIn">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 rounded-full">
                <FiX className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-text text-center mb-3">Exit Exam?</h3>
            <p className="text-secondary text-center mb-6 leading-relaxed">
              Are you sure you want to exit? Your progress will not be saved and this will count as an attempt.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelExit}
                className="px-6 py-2.5 border-2 border-secondary/30 rounded-lg text-secondary hover:bg-secondary/10 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmExit}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
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
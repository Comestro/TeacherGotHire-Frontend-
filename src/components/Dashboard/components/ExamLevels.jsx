import React, { useState } from "react";

const ExamLevelsStepper = () => {
  const [profileComplete, setProfileComplete] = useState(true); // Mock profile completion
  const [level1Passed, setLevel1Passed] = useState(false);
  const [level2Passed, setLevel2Passed] = useState(false);
  const [level3Passed, setLevel3Passed] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [completionMessage, setCompletionMessage] = useState("");

  const handleStartExam = () => {
    if (currentLevel === 0) {
      setCurrentLevel(1); // Start Level 1
      alert("Starting Level 1 exam...");
      setTimeout(() => {
        // Simulating exam pass
        setLevel1Passed(true);
        setCompletionMessage("Level 1 Completed Successfully!");
      }, 2000);
    } else if (currentLevel === 1 && level1Passed) {
      setCurrentLevel(2); // Start Level 2
      alert("Starting Level 2 exam...");
      setTimeout(() => {
        // Simulating exam pass
        setLevel2Passed(true);
        setCompletionMessage("Level 2 Completed Successfully!");
      }, 2000);
    } else if (currentLevel === 2 && level2Passed) {
      setCurrentLevel(3); // Start Level 3
      alert("Starting Level 3 exam...");
      setTimeout(() => {
        // Simulating exam pass
        setLevel3Passed(true);
        setCompletionMessage("");
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 p-4 rounded-lg">
      <h1 className="text-2xl font-bold text-gray-700 mb-4">
        Teacher Exam Levels
      </h1>

      {/* Stepper and Button */}
      {!level3Passed ? (
        <>
          {/* Stepper Container */}
          <div className="flex items-center justify-center space-x-8 w-full max-w-3xl">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-16 flex items-center justify-center rounded-full shadow-lg ${
                  profileComplete ? "bg-white" : "bg-gray-400"
                } text-white text-2xl`}
              >
                {profileComplete ? "🔓" : "🔒"}
              </div>
              <p className="text-gray-700 mt-2 font-medium">Level 1</p>
            </div>

            {/* Line Connector */}
            <div
              className={`h-1 w-16 ${
                level1Passed ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-16 flex items-center justify-center rounded-full shadow-lg ${
                  level1Passed ? "bg-green-500" : "bg-gray-400"
                } text-white text-2xl`}
              >
                {level1Passed ? "🔓" : "🔒"}
              </div>
              <p className="text-gray-700 mt-2 font-medium">Level 2</p>
            </div>

            {/* Line Connector */}
            <div
              className={`h-1 w-16 ${
                level2Passed ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-16 flex items-center justify-center rounded-full shadow-lg ${
                  level2Passed ? "bg-green-500" : "bg-gray-400"
                } text-white text-2xl`}
              >
                {level2Passed ? "🔓" : "🔒"}
              </div>
              <p className="text-gray-700 mt-2 font-medium">Level 3</p>
            </div>
          </div>

          {/* Completion Message */}
          {completionMessage && (
            <p className="mt-2 text-green-600 font-medium">
              {completionMessage}
            </p>
          )}
          {/* Dynamic Start Exam Button */}
          <div className="">
            <button
              onClick={handleStartExam}
              className={`mt-8 px-4 py-2 bg-[#3E98C7] text-white text-md font-semibold rounded-md shadow transition ${
                !profileComplete ||
                (currentLevel === 1 && !level1Passed) ||
                (currentLevel === 2 && !level2Passed)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={
                !profileComplete ||
                (currentLevel === 1 && !level1Passed) ||
                (currentLevel === 2 && !level2Passed)
              }
            >
              {currentLevel === 0
                ? "Start Level 1 Exam"
                : currentLevel === 1
                ? "Start Level 2 Exam"
                : "Start Level 3 Exam"}
            </button>
          </div>
        </>
      ) : (
        /* Congratulatory Message */
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-4xl font-bold text-green-600">
            🎉 Congratulations! 🎉
          </h2>
          <p className="text-gray-700 text-lg mt-4">
            You have successfully completed all the exams. Great job!
          </p>
        </div>
      )}
    </div>
  );
};

export default ExamLevelsStepper;

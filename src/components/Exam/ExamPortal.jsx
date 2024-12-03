import React, { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { TiTickOutline } from "react-icons/ti";

const mcqQuestions = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["Paris", "Berlin", "Madrid", "Rome"],
    correctAnswer: "Paris",
  },
  {
    id: 2,
    question: "What is the largest planet in our solar system?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctAnswer: "Jupiter",
  },
  {
    id: 3,
    question: "What is the largest planet in our solar system?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctAnswer: "Jupiter",
  },
  {
    id: 4,
    question: "What is the largest planet in our solar system?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctAnswer: "Jupiter",
  },
  {
    id: 5,
    question: "What is the largest planet in our solar system?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctAnswer: "Jupiter",
  },
  {
    id: 6,
    question: "What is the largest planet in our solar system?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctAnswer: "Jupiter",
  },

  // Add more questions as needed
];

export default function ExamPortal() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Handle answer selection
  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer,
    });
  };

  // Handle navigation between questions
  const handleQuestionChange = (index) => {
    if (index >= 0 && index < mcqQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < mcqQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < mcqQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Enforce full-screen mode
  const enterFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      });
    }
  };

  const handleFullScreenChange = () => {
    if (!document.fullscreenElement) {
      setIsFullScreen(false);
      alert("Exiting full-screen mode is not allowed!");
      enterFullScreen();
    }
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    enterFullScreen();
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  // Detect tab switching or minimizing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        alert("Tab switching is not allowed!");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Disable right-click and text selection
  useEffect(() => {
    const disableContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableContextMenu);
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
      document.body.style.userSelect = "auto";
    };
  }, []);

  // Disable keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const forbiddenKeys = ["Tab", "F12", "PrintScreen"];
      if (
        forbiddenKeys.includes(e.key) ||
        (e.ctrlKey && (e.key === "r" || e.key === "n" || e.key === "c"))
      ) {
        e.preventDefault();
        alert("Keyboard shortcuts are disabled during the exam.");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Detect inactivity
  useEffect(() => {
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        alert("You have been inactive for too long!");
        // Optionally auto-submit the exam
      }, 300000); // 5 minutes
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      {/* Sidebar */}
      <div className="w-[20%] bg-white shadow-md border-r border-gray-200 p-2">
        <h3 className="text-xl font-bold text-center text-teal-700 py-4 border-b border-gray-300">
          Level-1 <span className="text-gray-600">Questions </span>
        </h3>
        <h3 className="text-center font-semibold text-gray-500 mt-2">
          Total question ({mcqQuestions.length})
        </h3>
        <ul className="p-2 space-y-2 mt-2">
          {mcqQuestions.map((q, index) => (
            <li
              key={q.id}
              className={`p-3 rounded cursor-pointer font-semibold ${
                currentQuestionIndex === index
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-200 text-gray-600"
              }`}
              onClick={() => handleQuestionChange(index)}
            >
              <div className="flex justify-between items-center">
                <span>Question {q.id}</span>
                <span
                  className={`text-sm font-medium ${
                    selectedAnswers[q.id] ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {selectedAnswers[q.id] ? <TiTickOutline /> : <RxCross2 />}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-[80%] p-8">
        {mcqQuestions[currentQuestionIndex] ? (
          <div className="bg-white shadow-lg rounded-lg p-6 w-full mt-4">
            <h2 className="text-xl font-semibold mb-4">
              Question {mcqQuestions[currentQuestionIndex].id}
            </h2>
            <p className="text-gray-700 mb-6">
              {mcqQuestions[currentQuestionIndex].question}
            </p>
            <div className="space-y-4">
              {mcqQuestions[currentQuestionIndex].options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <input
                    type="radio"
                    id={`${mcqQuestions[currentQuestionIndex].id}-option${idx}`}
                    name={`question-${mcqQuestions[currentQuestionIndex].id}`}
                    value={option}
                    checked={
                      selectedAnswers[mcqQuestions[currentQuestionIndex].id] ===
                      option
                    }
                    onChange={() =>
                      handleAnswerSelect(
                        mcqQuestions[currentQuestionIndex].id,
                        option
                      )
                    }
                    className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`q${mcqQuestions[currentQuestionIndex].id}-option${idx}`}
                    className="text-gray-700"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded ${
                  currentQuestionIndex === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleSkip}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === mcqQuestions.length - 1}
                className={`px-4 py-2 rounded ${
                  currentQuestionIndex === mcqQuestions.length - 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p className="text-red-500">Question not found.</p>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllQues,
  getReport,
  postResult,
  attemptsExam,
} from "../../features/examQuesSlice";
import { useNavigate } from "react-router-dom";
import Subheader from "./ExamHeader";
import { IoWarningOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { BsArrowLeftShort, BsArrowRightShort } from "react-icons/bs";
import { postReport } from "../../features/examQuesSlice";

const ExamPortal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const toggleModal = () => {
    setIsOpen(true);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  
  const { allQuestion, language, loading } = useSelector((state) => state.examQues);
  const questions = allQuestion.questions || [];
  const exam = allQuestion.id;

  console.log("language", language);
  console.log("allqustion", allQuestion);
  console.log("questions", questions);

  const [results, setResults] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const currentQuestion = questions[currentQuestionIndex];
  const [isNavigating, setIsNavigating] = useState(false);


  
  useEffect(() => {
    dispatch(getReport());
  }, [currentQuestion]);
  const reportOptions = useSelector((state) => state.examQues?.reportReason);
  const [selectedOption, setSelectedOption] = useState([]);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const handleOptionSelect = (optionId) => {
    setSelectedOption(
      (prevSelected) =>
        prevSelected.includes(optionId)
          ? prevSelected.filter((id) => id !== optionId) // Remove if already selected
          : [...prevSelected, optionId] // Add if not selected
    );
  };
  console.log("selectedOption", selectedOption);

  const handleSubmits = () => {
    e?.preventDefault(); // Optional prevention for form submission
    // Process the selected option
    const question = currentQuestion.id;
    const issue_type = selectedOption;
    dispatch(
      postReport({ question: String(question), issue_type: issue_type })
    );
    setConfirmationMessage("Your report has been submitted to Admin.");
    setSelectedOption([]);
    // Close the popup
    setIsOpen(false);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default behavior that causes auto-selection
      if (["Enter", "ArrowRight", "ArrowLeft"].includes(e.key)) {
        e.preventDefault();
      }
  
      if (e.key === "Enter" || e.key === "ArrowRight") {
        handleNext();
        
        // Remove focus from the radio button after moving to the next question
        setTimeout(() => {
          document.activeElement?.blur();
        }, 0);
      }
      
      if (e.key === "ArrowLeft") {
        handlePrevious();
        
        // Also remove focus when navigating backward
        setTimeout(() => {
          document.activeElement?.blur();
        }, 0);
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrevious]);
  
  const handleSubmit = () => {
    let correct_answer = 0;
    let incorrect_answer = 0;
    let is_unanswered = 0;

    questions.forEach((question) => {
      const userAnswer = selectedAnswers[question.id];
      if (userAnswer === undefined) {
        // Unanswered
        is_unanswered++;
      } else if (userAnswer === question.correct_option) {
        // Correctly answered
        correct_answer++;
      } else {
        // Wrongly answered
        incorrect_answer++;
      }
    });

    setResults({
      correct_answer,
      incorrect_answer,
      is_unanswered,
    });
    console.log("Checking results", results);
    console.log("language", language);
    
    dispatch(
      postResult({
        exam,
        correct_answer,
        incorrect_answer,
        is_unanswered,
        language,
      })
    );
    dispatch(attemptsExam());
    navigate("/exam/result", {
      state: { exam, correct_answer, incorrect_answer, is_unanswered,language },
    });
  };

  const handleExitExam = () => {
    setShowExitConfirm(true);
    navigate("/dashboard");
  };


  

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      {/* Sidebar */}
      <div className="hidden md:block w-full sm:w-[30%] md:w-[25%] bg-white shadow-md border-r border-gray-200 p-2">
        <h3 className="text-xl font-bold text-center text-gray-700 py-4 border-b border-gray-300">
          <span className="text-gray-600">Questions</span>
        </h3>
        <h3 className="text-center font-semibold text-gray-500 mt-2">
          Total Questions ({questions.length})
        </h3>
        <ul className="p-2 flex flex-wrap gap-2 mt-2 justify-center sm:justify-start overflow-y-auto max-h-[calc(100vh-150px)]">
          {questions.map((q, index) => (
            <li key={q.id} className="flex">
              <button
                onClick={() => setCurrentQuestionIndex(index)}
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  selectedAnswers[q.id] ? "bg-green-500" : "bg-gray-200"
                } text-white font-bold`}
              >
                {index + 1}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}

      <div className="w-full md:min-w-[80%] md:px-4 max-h-[calc(100vh-150px)]">
        <Subheader handleSubmit={handleSubmit} />
        <div className="bg-white md:hidden">
          <ul className="p-2 flex flex-wrap gap-2 mt-1 justify-center sm:justify-start overflow-y-auto">
            {questions.map((q, index) => (
              <li key={q.id} className="flex">
                <button
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    selectedAnswers[q.id] ? "bg-green-500" : "bg-gray-200"
                  } text-white font-bold`}
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {errorMessage && (
          <div className="mb-4 text-red-500 font-semibold">{errorMessage}</div>
        )}
        {currentQuestion ? (
          <div className="relative bg-white p-6 w-full mt-1 h-full">
            <div className="flex justify-between">
              {" "}
              <h2 className="text-xl font-semibold mb-4">
                Question {currentQuestionIndex + 1}
              </h2>
              <div>
                <button onClick={toggleModal} className="px-4 py-2 text-white ">
                  <IoWarningOutline className="text-2xl text-gray-500" />
                </button>
                {/* Modal */}
                {isOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-96 p-6 shadow-lg">
                      <div className="flex justify-between">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                          Report Question!
                        </h2>
                        <button onClick={() => setIsOpen(false)} className=" ">
                          <RxCross2 />
                        </button>
                      </div>
                      <ul className="space-y-3">
                        {reportOptions &&
                          reportOptions.map((option, index) => (
                            <li
                              key={index}
                              className={`flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer transition-colors 
                          ${
                            selectedOption.includes(option.id)
                              ? "bg-blue-200" // Highlight selected options
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                              onClick={() => handleOptionSelect(option.id)}
                            >
                              <span>{option.issue_type}</span>
                              <IoWarningOutline
                                className={`text-gray-500 ${
                                  selectedOption.includes(option.id)
                                    ? "text-blue-700"
                                    : ""
                                }`}
                              />
                            </li>
                          ))}
                      </ul>
                      <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                        onClick={handleSubmits}
                        disabled={!selectedOption}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-700 mb-6">{currentQuestion.text}</p>
            <div className="space-y-4">
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <input
                    type="radio"
                    id={`${currentQuestion.id}-option${idx}`}
                    name={`question-${currentQuestion.id}`}
                    value={idx + 1}
                    checked={selectedAnswers[currentQuestion.id] === idx + 1}
                    onChange={() =>
                      handleAnswerSelect(currentQuestion.id, idx + 1)
                    }
                    className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`${currentQuestion.id}-option${idx}`}
                    className="text-gray-700"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="absolute bottom-5 right-4 flex justify-self-end gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center px-2 py-2 rounded ${
                  currentQuestionIndex === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gray-500 text-white hover:bg-blue-600"
                }`}
              >
                <BsArrowLeftShort className="size-6" />
                Previous
              </button>
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className={`flex px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 ${
                    isNavigating ? 'ring-2 ring-offset-2 ring-green-500' : ''
                  }`}
                >
                  <span className="text-center">Next</span>
                  <BsArrowRightShort className="size-6 items-center" />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Submit Exam
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ExamPortal;

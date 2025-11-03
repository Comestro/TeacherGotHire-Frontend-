import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllQues,
  getReport,
  postResult,
  attemptsExam,
} from "../../features/examQuesSlice";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  
  const { allQuestion, language: reduxLanguage, loading } = useSelector((state) => state.examQues);
  // Get language from navigation state or Redux (Redux language is set by getAllQues action)
  const language = location.state?.language || reduxLanguage;
  // Ensure questions are sorted by ascending order (order 1 first, then 2, 3, ...)
  const questions = [...(allQuestion.questions || [])].sort((a, b) => {
    // Use Number() and fallback to a large number if order is missing
    const orderA = a.order !== undefined ? Number(a.order) : Number.MAX_SAFE_INTEGER;
    const orderB = b.order !== undefined ? Number(b.order) : Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
  const exam = allQuestion.id;

  
  
  

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
       replace: true
    });
  };

  const handleExitExam = () => {
    setShowExitConfirm(true);
    navigate("/dashboard");
  };


  

  return (
    <div className="flex h-screen bg-gray-50 w-full">
      {/* Sidebar */}
      <div className="hidden md:block w-full sm:w-[30%] md:w-[25%] bg-white shadow-lg border-r border-primary/20 p-4">
        <div className="bg-primary text-white py-4 px-4 rounded-xl mb-4">
          <h3 className="text-lg font-bold text-center">
            Questions
          </h3>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4">
          <h3 className="text-center font-bold text-primary">
            Total: {questions.length} Questions
          </h3>
        </div>
        <ul className="p-2 flex flex-wrap gap-2 mt-2 justify-center sm:justify-start overflow-y-auto max-h-[calc(100vh-220px)]">
          {questions.map((q, index) => (
            <li key={q.id} className="flex">
              <button
                onClick={() => setCurrentQuestionIndex(index)}
                className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold transition-all shadow-sm hover:shadow-md ${
                  currentQuestionIndex === index
                    ? "bg-primary text-white ring-2 ring-primary ring-offset-2"
                    : selectedAnswers[q.id]
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
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
        <div className="bg-white md:hidden border-b border-primary/20">
          <ul className="p-3 flex flex-wrap gap-2 mt-1 justify-center sm:justify-start overflow-y-auto">
            {questions.map((q, index) => (
              <li key={q.id} className="flex">
                <button
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg font-bold transition-all shadow-sm ${
                    currentQuestionIndex === index
                      ? "bg-primary text-white ring-2 ring-primary"
                      : selectedAnswers[q.id]
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
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
          <div className="relative bg-white rounded-xl border border-gray-200 p-6 w-full mt-4 h-full">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-text flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white rounded-lg font-bold text-sm">
                  {currentQuestionIndex + 1}
                </span>
                Question {currentQuestionIndex + 1}
              </h2>
              <div className="flex items-center gap-3">
                {language && (
                  <span className="px-4 py-1.5 border border-blue-200 text-blue-800 rounded-full text-sm font-semibold">
                    {language}
                  </span>
                )}
                <button onClick={toggleModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <IoWarningOutline className="text-2xl text-orange-500" />
                </button>
              </div>
            </div>
                {/* Modal */}
                {isOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-200 animate-fadeIn">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <IoWarningOutline className="text-2xl text-orange-600" />
                          </div>
                          <h2 className="text-xl font-bold text-text">
                            Report Question
                          </h2>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <RxCross2 className="text-xl text-gray-600" />
                        </button>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {reportOptions &&
                          reportOptions.map((option, index) => (
                            <li
                              key={index}
                              className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all border-2 ${
                                selectedOption.includes(option.id)
                                  ? "bg-primary/10 border-primary text-primary font-semibold"
                                  : "bg-gray-50 border-transparent hover:bg-gray-100 text-gray-700"
                              }`}
                              onClick={() => handleOptionSelect(option.id)}
                            >
                              <span>{option.issue_type}</span>
                              <IoWarningOutline
                                className={`text-lg ${
                                  selectedOption.includes(option.id)
                                    ? "text-primary"
                                    : "text-gray-400"
                                }`}
                              />
                            </li>
                          ))}
                      </ul>
                      <button
                        className="w-full px-4 py-3 bg-primary text-white rounded-xl hover:bg-[#2a7ba0] font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSubmits}
                        disabled={selectedOption.length === 0}
                      >
                        Submit Report
                      </button>
                    </div>
                  </div>
                )}

            <p className="text-text text-lg mb-8 leading-relaxed">{currentQuestion.text}</p>
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedAnswers[currentQuestion.id] === idx + 1
                    ? "bg-primary/10 border-primary shadow-sm"
                    : "border-gray-200 hover:border-primary/30 hover:bg-gray-50"
                }`}
                onClick={() => handleAnswerSelect(currentQuestion.id, idx + 1)}
                >
                  <input
                    type="radio"
                    id={`${currentQuestion.id}-option${idx}`}
                    name={`question-${currentQuestion.id}`}
                    value={idx + 1}
                    checked={selectedAnswers[currentQuestion.id] === idx + 1}
                    onChange={() =>
                      handleAnswerSelect(currentQuestion.id, idx + 1)
                    }
                    className="h-5 w-5 text-primary border-gray-300 focus:ring-primary"
                  />
                  <label
                    htmlFor={`${currentQuestion.id}-option${idx}`}
                    className="text-text flex-1 cursor-pointer font-medium"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="absolute bottom-5 right-4 flex justify-self-end gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center gap-1 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md ${
                  currentQuestionIndex === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg"
                }`}
              >
                <BsArrowLeftShort className="size-5" />
                Previous
              </button>
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className={`flex items-center gap-1 px-4 py-2.5 rounded-xl bg-green-600 text-white hover:bg-emerald-700 font-semibold shadow-md hover:shadow-lg transition-all ${
                    isNavigating ? 'ring-2 ring-offset-2 ring-green-500' : ''
                  }`}
                >
                  Next
                  <BsArrowRightShort className="size-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Submit Exam
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ExamPortal;

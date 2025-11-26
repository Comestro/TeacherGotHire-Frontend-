import React, { useEffect, useState, useCallback } from "react";
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
import { AddReport } from '../../services/examQuesServices';
import { toast } from 'react-toastify';

const ExamPortal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [securityViolation, setSecurityViolation] = useState(null);

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


  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleSubmits = async () => {
    // ensure we have a current question
    if (!currentQuestion) return;
    setIsSubmittingReport(true);
    try {
      const payload = {
        question: currentQuestion.id,
        issue_type: selectedOption,
      };

      // Call the service directly
      await AddReport(payload);

      // Keep local confirmation and clear selections
      setConfirmationMessage('Your report has been submitted to Admin.');
      setSelectedOption([]);
      setIsOpen(false);
      // Optionally refresh reasons or reports
      dispatch(getReport());
    } catch (err) {
      console.error('Report submit failed', err);
      setConfirmationMessage('Failed to submit report. Please try again.');
    } finally {
      setIsSubmittingReport(false);
    }
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

  const handleSubmit = useCallback(() => {
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



    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen().catch((err) => console.error("Error exiting fullscreen:", err));
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }

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
      state: { exam, correct_answer, incorrect_answer, is_unanswered, language },
      replace: true
    });
  }, [questions, selectedAnswers, dispatch, exam, language, navigate]);

  // --- Security Restrictions ---

  // 1. Enforce Fullscreen
  const enterFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) { /* Safari */
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE11 */
        await elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.error("Error attempting to enable fullscreen:", err);
    }
  };

  useEffect(() => {
    enterFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        setIsFullscreen(false);
        setWarningCount(prev => prev + 1);
        setSecurityViolation("You must stay in fullscreen mode during the exam.");
      } else {
        setIsFullscreen(true);
        setSecurityViolation(null);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // 2. Disable Right-click, Copy/Paste, and Keyboard Shortcuts
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.warning("Right-click is disabled during the exam.");
    };

    const handleCopyPaste = (e) => {
      e.preventDefault();
      toast.warning("Copy/Paste is disabled during the exam.");
    };

    const handleKeyDown = (e) => {
      // Prevent default behavior that causes auto-selection
      if (["Enter", "ArrowRight", "ArrowLeft"].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === "Enter" || e.key === "ArrowRight") {
        handleNext();
        setTimeout(() => document.activeElement?.blur(), 0);
      }

      if (e.key === "ArrowLeft") {
        handlePrevious();
        setTimeout(() => document.activeElement?.blur(), 0);
      }

      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
        (e.ctrlKey && e.keyCode === 85)
      ) {
        e.preventDefault();
        toast.warning("Developer tools are disabled.");
      }

      // Disable F5 and Ctrl+R (Refresh)
      if (e.keyCode === 116 || (e.ctrlKey && e.keyCode === 82)) {
        e.preventDefault();
        toast.warning("Page refresh is disabled.");
      }

      // Disable Esc (Attempt to prevent, though browser may override for fullscreen)
      if (e.keyCode === 27) {
        e.preventDefault();
        // If Esc is pressed, we might lose fullscreen, so we warn
        toast.warning("Exiting fullscreen is not allowed.");
      }

      // Disable Copy/Paste shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        toast.warning("Copy/Paste shortcuts are disabled.");
      }

      // Disable Alt+Tab (cannot be fully prevented, but we can warn on blur)
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext, handlePrevious]);

  // 3. Prevent Tab Switching (Visibility Change & Blur)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount(prev => prev + 1);
        setSecurityViolation("Tab switching is not allowed. Your exam will be auto-submitted on repeated violations.");
      }
    };

    const handleWindowBlur = () => {
      setWarningCount(prev => prev + 1);
      setSecurityViolation("Please keep the exam window focused.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  // 4. Prevent Navigation (Back Button & Reload)
  useEffect(() => {
    // Push current state to history to trap back button
    window.history.pushState(null, null, window.location.href);

    const handlePopState = (e) => {
      window.history.pushState(null, null, window.location.href);
      // Try to re-enter fullscreen if we were in it (might be blocked by browser without user gesture)
      enterFullscreen();

      setWarningCount(prev => prev + 1);
      setSecurityViolation("Navigation is disabled. You cannot go back during the exam.");
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Chrome requires returnValue to be set
      return '';
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Auto-submit on excessive warnings
  useEffect(() => {
    if (warningCount > 3) {
      toast.error("Maximum security violations exceeded. Auto-submitting exam.");
      handleSubmit();
    }
  }, [warningCount, handleSubmit]);


  const handleExitExam = () => {
    setShowExitConfirm(true);
    navigate("/dashboard");
  };

  return (
    <div className="flex bg-gray-50 w-full h-full select-none overflow-hidden">
      {/* Security Violation Modal */}
      {securityViolation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-shake">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <IoWarningOutline className="text-5xl text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Warning</h2>
            <p className="text-gray-600 mb-6 text-lg">{securityViolation}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="font-bold text-red-800">Warning {warningCount}/3</p>
              <p className="text-sm text-red-600">Exceeding the limit will auto-submit your exam.</p>
            </div>
            <button
              onClick={() => {
                setSecurityViolation(null);
                enterFullscreen();
              }}
              className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
            >
              I Understand & Return to Exam
            </button>
          </div>
        </div>
      )}

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
                className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold transition-all shadow-sm hover:shadow-md ${currentQuestionIndex === index
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

      {/* Main Content */}
      <div className="w-full md:min-w-[80%] md:px-4 flex flex-col h-full overflow-hidden relative">
        <div className="shrink-0 z-10">
          <Subheader handleSubmit={handleSubmit} />
        </div>
        <div className="bg-white md:hidden border-b border-primary/20 shrink-0">
          <ul className="p-3 flex flex-wrap gap-2 mt-1 justify-center sm:justify-start overflow-y-auto max-h-[15vh]">
            {questions.map((q, index) => (
              <li key={q.id} className="flex">
                <button
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg font-bold transition-all shadow-sm ${currentQuestionIndex === index
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

        <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
          {errorMessage && (
            <div className="mb-4 text-red-500 font-semibold">{errorMessage}</div>
          )}
          {currentQuestion ? (
            <div className="relative bg-white rounded-xl border border-gray-200 p-6 w-full h-fit min-h-0">
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
                      Medium: {language}
                    </span>
                  )}
                  <button onClick={toggleModal} className="p-2 flex items-center gap-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <IoWarningOutline className="text-2xl text-orange-500" />
                    <span className="hidden sm:inline">Report This Question</span>
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
                            className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all border-2 ${selectedOption.includes(option.id)
                              ? "bg-primary/10 border-primary text-primary font-semibold"
                              : "bg-gray-50 border-transparent hover:bg-gray-100 text-gray-700"
                              }`}
                            onClick={() => handleOptionSelect(option.id)}
                          >
                            <span>{option.issue_type}</span>
                            <IoWarningOutline
                              className={`text-lg ${selectedOption.includes(option.id)
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
                      disabled={selectedOption.length === 0 || isSubmittingReport}
                    >
                      {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </div>
              )}

              <p className="text-text text-lg mb-8 leading-relaxed">{currentQuestion.text}</p>
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <div key={idx} className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedAnswers[currentQuestion.id] === idx + 1
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

              {/* Navigation Buttons - Fixed at bottom for mobile */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:absolute md:bottom-5 md:right-4 md:left-auto md:bg-transparent md:border-0 md:p-0 flex justify-between md:justify-end gap-3 z-20">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-3 md:py-2.5 rounded-xl font-semibold transition-all shadow-md ${currentQuestionIndex === 0
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
                    className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-3 md:py-2.5 rounded-xl bg-green-600 text-white hover:bg-emerald-700 font-semibold shadow-md hover:shadow-lg transition-all ${isNavigating ? 'ring-2 ring-offset-2 ring-green-500' : ''
                      }`}
                  >
                    Next
                    <BsArrowRightShort className="size-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="flex-1 md:flex-none px-6 py-3 md:py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    Submit Exam
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ExamPortal;

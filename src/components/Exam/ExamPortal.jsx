import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuestions } from "../../features/questionSlice";

const ExamPortal = () => {
  // Redux state and dispatch setup
  const dispatch = useDispatch();
  const { data: questions, loading, error } = useSelector(
    (state) => state.questions
  );

  useEffect(() => {
    dispatch(fetchQuestions()); // Fixed: Missing parentheses to invoke the thunk
  }, [dispatch]);

  // Local state for MCQ functionality
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Handle answer selection
  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Handle navigation between questions
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

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  // Rendering logic
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      {/* Sidebar */}
      <div className="w-[20%] bg-white shadow-md border-r border-gray-200 p-2">
        <h3 className="text-xl font-bold text-center text-teal-700 py-4 border-b border-gray-300">
          Level-1 <span className="text-gray-600">Questions</span>
        </h3>
        <h3 className="text-center font-semibold text-gray-500 mt-2">
          Total Questions ({questions.length})
        </h3>
        <ul className="p-2 flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
          {questions.map((q, index) => (
            <li key={q.id} className="flex">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  selectedAnswers[q.id] ? "bg-green-500" : "bg-gray-200"
                } text-white font-bold`}
              >
                {index + 1}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-[80%] p-8">
        {currentQuestion ? (
          <div className="bg-white shadow-lg rounded-lg p-6 w-full mt-4">
            <h2 className="text-xl font-semibold mb-4">
              Question {currentQuestionIndex + 1}
            </h2>
            <p className="text-gray-700 mb-6">{currentQuestion.text}</p>
            <div className="space-y-4">
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <input
                    type="radio"
                    id={`${currentQuestion.id}-option${idx}`}
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={selectedAnswers[currentQuestion.id] === option}
                    onChange={() => handleAnswerSelect(currentQuestion.id, option)}
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
                disabled={currentQuestionIndex === questions.length - 1}
                className={`px-4 py-2 rounded ${
                  currentQuestionIndex === questions.length - 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p className="text-red-500">No questions available.</p>
        )}
      </div>
    </div>
  );
};

export default ExamPortal;

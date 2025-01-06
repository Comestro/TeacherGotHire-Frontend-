import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllQues, postResult } from "../../features/examQuesSlice";
import { useNavigate } from "react-router-dom";
import Subheader from "./ExamHeader";
import { IoWarningOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { post } from "jquery";

const ExamPortal = () => {
  const reportOptions = [
    "Wrong Translation",
    "Scroll Not Working",
    "Wrong Question",
    "Out of Syllabus",
    "No Solution",
    "Question and Options not visible",
  ];
  const dispatch = useDispatch();

  const questions = useSelector(
    (state) => state.examQues.allQuestion.questions
  );
  console.log("question", questions);
  const exam = useSelector((state) => state.examQues.exam.id);

  const [userAnswers, setUserAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    dispatch(getAllQues());
  }, []);

  // Handle answer selection
  const handleOptionChange = (questionId, option) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: option,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    let correct_answer = 0;
    let incorrect_answer = 0;
    let is_unanswered = 0;

    questions.forEach((question) => {
      const userAnswer = userAnswers[question.id];

      console.log("question.correct_option", question.correct_option);
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
      })
    );
  };

  // Navigation handlers
  // const handleNext = () => {
  //   setCurrentQuestionIndex(prevIndex => Math.min(prevIndex + 1, questions.length - 1));
  // };
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  useEffect(() => {
    console.log("Current Index After Update:", currentQuestionIndex);
  }, [currentQuestionIndex]);
  const handlePrevious = () => {
    setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {!results ? (
        <form onSubmit={handleSubmit}>
          {/* Display current question */}
          <div className="mb-6">
            <p className="font-semibold mb-2">
              Question {currentQuestionIndex + 1} of {questions.length}:{" "}
              {questions[currentQuestionIndex].text}
            </p>
            <div className="space-y-2">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${questions[currentQuestionIndex].id}`}
                    value={index + 1}
                    checked={
                      userAnswers[questions[currentQuestionIndex].id] ===
                      index + 1
                    }
                    onChange={() =>
                      handleOptionChange(
                        questions[currentQuestionIndex].id,
                        index + 1
                      )
                    }
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded ${
                currentQuestionIndex === 0
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Previous
            </button>
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Submit
              </button>
            )}
          </div>
        </form>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">Quiz Results</h2>
          <div className="mb-2">
            <p className="font-semibold">
              Number of Correct Answers: {results.correct_answer}
            </p>
          </div>
          <div className="mb-2">
            <p className="font-semibold">
              Number of Wrong Answers: {results.incorrect_answer}
            </p>
          </div>
          <div className="mb-4">
            <p className="font-semibold">
              Number of Unanswered Questions: {results.is_unanswered}
            </p>
          </div>
          <button
            onClick={() => {
              setResults(null);
              setUserAnswers({});
              setCurrentQuestionIndex(0);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default ExamPortal;

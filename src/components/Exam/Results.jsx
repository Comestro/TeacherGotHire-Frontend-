import React from "react";
import { Link, useLocation } from "react-router-dom";

const ResultPage = () => {
  const location = useLocation();
  const { correct_answer, incorrect_answer, is_unanswered } =
    location.state || {};

  const totalQuestion = correct_answer + incorrect_answer + is_unanswered;
  const percentage = ((correct_answer / totalQuestion) * 100).toFixed(1);
  const isQualified = percentage >= 60;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-sm text-center">
        <div className={`relative flex items-center mb-2 justify-center w-48 h-48 mx-auto  ${isQualified ? "bg-green-100" : "bg-red-100"} rounded-full shadow-inner`}>
          <div className={`w-44 h-44 flex flex-col items-center justify-center ${isQualified ? "bg-green-600" : "bg-red-500"}  text-white rounded-full`}>
            <p className="text-xl font-medium">Your Score</p>
            <p className="text-2xl font-bold">
              {correct_answer}/{totalQuestion}
            </p>
            <p className="text-center flex items-center font-semibold">
              <span className="text-sm">Percentage: </span> {percentage}%
            </p>
          </div>
        </div>
        <h2
          className={`text-2xl font-semibold mb-2 ${
            isQualified ? "text-green-600" : "text-red-600"
          }`}
        >
          {isQualified ? "Congratulations" : "Better Luck Next Time"}
        </h2>
        <p className="text-md text-gray-600 mb-10 font-semibold">
          {isQualified
            ? "Great job! You are qualified."
            : "Don't worry, you can try again and succeed!"}
        </p>
        <div className="mt-6 space-y-3 px-5 flex flex-col">
          {isQualified ? (
            <Link
              to="/teacher/view-attempts"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md shadow transition"
            >
              View Attempts
            </Link>
          ) : (
            <Link
              to=""
              className="w-full px-4 py-2 bg-red-700 text-white rounded-md shadow transition"
            >
              Try Again
            </Link>
          )}
          <Link
            to="/teacher"
            className="w-full px-4 py-2 bg-[#2a4494] text-white rounded-md shadow transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

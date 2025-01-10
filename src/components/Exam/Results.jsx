import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedAnswers, questions } = location.state || {};

  if (!selectedAnswers || !questions) {
    return <div>No data available</div>;
  }

  const totalQuestions = questions.length;

  const correctAnswers = questions.filter((q) => {
    if (!q.correct_options || !q.options[q.correct_options - 1]) {
      console.error(`Question ${q.id} has invalid data`);
      return false;
    }
    const correctAnswer = q.options[q.correct_options - 1];
    const userAnswer = selectedAnswers[q.id];
    return userAnswer === correctAnswer;
  }).length;

  return (
    // <div className="flex flex-col items-center justify-center min-h-screen p-6">
    //   <div className="border  p-8  w-full max-w-md">
    //     <h1 className="text-4xl font-extrabold text-teal-800 mb-6 text-center">Your Result</h1>
    //     <div className="space-y-4">
    //       <p className="text-lg font-medium text-teal-700">
    //         Total Questions: <strong>{totalQuestions}</strong>
    //       </p>
    //       <p className="text-lg font-medium text-teal-700">
    //         Correct Answers: <strong>{correctAnswers}</strong>
    //       </p>
    //       <p className="text-lg font-medium text-teal-700">
    //         Percentage: <strong>{((correctAnswers / totalQuestions) * 100).toFixed(2)}%</strong>
    //       </p>
    //     </div>
    //     <div className="mt-8 flex justify-center">
    //       <button
    //         onClick={() => navigate("/exam")}
    //         className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow-lg transform transition-all hover:scale-105 hover:bg-teal-700"
    //       >
    //         Back to Home
    //       </button>
    //     </div>
    //   </div>
    // </div>

    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-sm text-center">
        <div className="relative flex items-center mb-2 justify-center w-48 h-48 mx-auto bg-blue-100 rounded-full shadow-inner">
          <div className="w-44 h-44 flex flex-col items-center justify-center bg-[#2a4494] text-white rounded-full">
            <p className="text-xl font-medium">Your Score</p>
            <p className="text-2xl font-bold">29/30</p>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-[#2a4494] mb-2">
          Congratulations
        </h2>
        <p className="text-md text-gray-600 mb-40 md:mb-10 font-semibold">Great job, Rahul! You did it.</p>
        <div className="mt-6 space-y-3 px-5">
          <button
            onClick={() => alert("Share button clicked!")}
            className="w-full px-4 py-2 bg-[#2a4494] text-white rounded-md shadow hover:bg-blue-700 transition"
          >
            View Attempts
          </button>
          <button
            onClick={() => alert("Back to Home button clicked!")}
            className="w-full px-4 py-2 bg-[#2a4494] text-white rounded-md shadow hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

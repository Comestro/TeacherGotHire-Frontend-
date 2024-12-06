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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-teal-100 to-blue-100 p-6">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
          <h1 className="text-4xl font-extrabold text-teal-800 mb-6 text-center">Your Result</h1>
          <div className="space-y-4">
            <p className="text-lg font-medium text-teal-700">
              Total Questions: <strong>{totalQuestions}</strong>
            </p>
            <p className="text-lg font-medium text-teal-700">
              Correct Answers: <strong>{correctAnswers}</strong>
            </p>
            <p className="text-lg font-medium text-teal-700">
              Percentage: <strong>{((correctAnswers / totalQuestions) * 100).toFixed(2)}%</strong>
            </p>
          </div>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate("/exam")}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow-lg transform transition-all hover:scale-105 hover:bg-teal-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  };
  

export default ResultPage;

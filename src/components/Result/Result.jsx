
import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from "chart.js";

// Register the necessary components for chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const ResultPage = () => {
  // Dummy data for the result
  const [result, setResult] = useState({
    score: 12, // Example: out of 20
    total: 20,
    attempts: 2,
    correct: 12,
    incorrect: 8,
    accuracy: 60,
    pass: true, // Change to false to test fail case
    level: "Level 1",
    remainingAttempts: 0, // Attempts left for fail case
  });

  // Quiz Stats data for Doughnut chart
  const [correctAnswers, setCorrectAnswers] = useState(result.correct);
  const [incorrectAnswers, setIncorrectAnswers] = useState(result.incorrect);
  const [skippedQuestions, setSkippedQuestions] = useState(result.total - result.correct - result.incorrect);

  // Data for the Doughnut chart
  const data = {
    labels: ["Correct Answers", "Incorrect Answers", "Skipped Questions"],
    datasets: [
      {
        data: [correctAnswers, incorrectAnswers, skippedQuestions],
        backgroundColor: ["#4CAF50", "#FF6347", "#FFC107"], // Green for correct, red for incorrect, yellow for skipped
        borderColor: ["#4CAF50", "#FF6347", "#FFC107"],
        borderWidth: 2,
      },
    ],
  };

  // Options for the Doughnut chart
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div className="flex flex-row items-center justify-center py-10">
      {/* Doughnut Chart for Quiz Stats */}
      <h2 className="text-2xl font-bold mb-4">Quiz Stats</h2>
      <div className="w-80 h-80 mb-8">
        <Doughnut data={data} options={options} />
      </div>

      {/* Result Card */}
      <div className="bg-blue-100 p-6 rounded-lg shadow-md w-full max-w-xl mx-auto">
        <h2 className="text-center text-xl font-bold text-blue-700 mb-4">
          Thank you for attempting Teacher
        </h2>

        <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-md">
          <div className="text-center">
            <p className="text-sm font-semibold">Rank</p>
            <p className="text-gray-600 text-xs">{result.rankAnnounceTime}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">Score</p>
            <p className="text-blue-700">
              {result.score}/{result.total}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">Attempts</p>
            <p className="text-gray-600">{result.attempts}</p>
          </div>
        </div>

        <div className="flex justify-around items-center bg-white p-4 mt-4 rounded-lg shadow-md">
          <div className="text-center">
            <p className="text-sm font-semibold">Correct</p>
            <p className="text-green-600">{result.correct}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">Incorrect</p>
            <p className="text-red-600">{result.incorrect}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">Accuracy</p>
            <p className="text-blue-700">{result.accuracy}%</p>
          </div>
        </div>

        <div className="bg-white p-4 mt-4 rounded-lg shadow-md text-center">
          {result.pass ? (
            <p className="text-green-700 font-semibold">
              🎉 Congratulations! You've achieved {result.level}.
            </p>
          ) : (
            <p className="text-red-600 font-semibold">
              ❌ Try Again! You have {result.remainingAttempts} more attempts.
            </p>
          )}
        </div>

        <p className="text-center text-gray-500 text-xs mt-4">
          Detailed results will be out on {result.rankAnnounceTime}.
        </p>
      </div>
    </div>
  );
};

export default ResultPage;

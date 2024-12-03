import React, { useState } from "react";

const ResultCard = () => {
  // Dummy data for the result
  const [result, setResult] = useState({
    rankAnnounceTime: "9:30 PM Dec 2, 2024",
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

  return (
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
  );
};

export default ResultCard;

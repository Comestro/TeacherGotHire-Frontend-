import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import confetti from 'canvas-confetti';

const ResultPage = () => {
  const location = useLocation();
  const { correct_answer, incorrect_answer, is_unanswered } = location.state || {};
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const totalQuestion = correct_answer + incorrect_answer + is_unanswered;
  const percentage = ((correct_answer / totalQuestion) * 100).toFixed(1);
  const isQualified = percentage >= 60;

  const fireConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 1 }, // Changed from 0.7 to 1 (bottom of screen)
      ticks: 300,
      startVelocity: 30,
      gravity: 0.8,
      shapes: ['square', 'circle'],
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        scalar: 1.2
      });
    }

    // Left side burst
    fire(0.25, {
      spread: 40,
      startVelocity: 45,
      decay: 0.94,
      origin: { x: 0.1, y: 1 }  // Bottom left
    });

    // Right side burst
    fire(0.25, {
      spread: 40,
      startVelocity: 45,
      decay: 0.94,
      origin: { x: 0.9, y: 1 }  // Bottom right
    });

    // Middle bursts with delay
    setTimeout(() => {
      fire(0.2, {
        spread: 60,
        decay: 0.92,
        scalar: 1,
        origin: { x: 0.3, y: 1 }  // Bottom left-center
      });
      fire(0.2, {
        spread: 60,
        decay: 0.92,
        scalar: 1,
        origin: { x: 0.7, y: 1 }  // Bottom right-center
      });
    }, 200);
  };

  useEffect(() => {
    if (isQualified) {
      fireConfetti();
      
      const timer = setTimeout(() => {
        fireConfetti();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isQualified]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-md  p-8 transform transition-all duration-500">
        <div
          className={`relative flex items-center mb-6 justify-center w-56 h-56 mx-auto 
            `}
        >
          <div
            className={`absolute inset-0 ${
              isQualified ? "bg-green-100" : "bg-red-100"
            } rounded-full opacity-50 blur-xl`}
          ></div>
          <div
            className={`relative w-48 h-48 flex flex-col items-center justify-center 
              ${isQualified ? "bg-green-600" : "bg-red-500"}
              text-white rounded-full shadow-2xl`}
          >
            <p className="text-2xl font-medium mb-2">Your Score</p>
            <p className="text-4xl font-bold mb-2">
              {correct_answer}/{totalQuestion}
            </p>
            <p className="text-xl font-semibold">
              {percentage}%
            </p>
          </div>
        </div>

        <div className="space-y-6 text-center">
          <h2
            className={`text-3xl font-bold ${
              isQualified ? "text-green-600" : "text-red-600"
            }`}
          >
            {isQualified ? "🎉 Congratulations! 🎉" : "💪 Keep Going! 💪"}
          </h2>
          
          <p className="text-lg text-gray-700 font-medium">
            {isQualified
              ? "You've successfully passed the exam! Your hard work paid off."
              : "Don't give up! Every attempt brings you closer to success."}
          </p>

          <div className="flex flex-col gap-3 mt-8">
            {isQualified ? (
              <Link
                to="/teacher/view-attempts"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                View Your Attempts
              </Link>
            ) : (
              <Link
                to="/teacher"
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                Try Again
              </Link>
            )}
            <Link
              to="/teacher"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-[#2a4494] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

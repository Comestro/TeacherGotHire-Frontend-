import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import confetti from 'canvas-confetti';
import { HiCheckCircle, HiXCircle, HiMinusCircle, HiArrowRight } from "react-icons/hi";
import { HiTrophy } from "react-icons/hi2";
import { FaHome, FaRedo } from "react-icons/fa";

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
      origin: { y: 1 }, 
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-2xl">
        {/* Main Result Card */}
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
          {/* Header Section with Gradient */}
          <div className={`relative px-8 py-10 ${
            isQualified 
              ? 'bg-green-600' 
              : 'bg-primary'
          }`}>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 animate-pulse">
                {isQualified ? (
                  <HiTrophy className="w-12 h-12 text-white" />
                ) : (
                  <FaRedo className="w-10 h-10 text-white" />
                )}
              </div>
              <h2 className="text-3xl md:text-3xl font-bold text-white mb-2">
                {isQualified ? "Congratulations!" : "Keep Trying!"}
              </h2>
              <p className="text-white/90 text-lg pb-8">
                {isQualified
                  ? "You've successfully passed the exam!"
                  : "Don't give up! Every attempt brings you closer."}
              </p>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          </div>

          {/* Score Circle */}
          <div className="flex justify-center -mt-16 mb-8 relative z-20">
            <div className="relative">
              <div className={`absolute inset-0 ${
                isQualified ? "bg-green-400" : "bg-primary"
              } rounded-full opacity-20 blur-2xl animate-pulse`}></div>
              <div className={`relative w-32 h-32 flex flex-col items-center justify-center 
                ${isQualified ? "bg-green-600" : "bg-primary"}
                text-white rounded-full border-4 border-white transform hover:scale-105 transition-transform duration-300`}>
                <p className="text-sm font-semibold mb-1 opacity-90">Your Score</p>
                <p className="text-2xl font-bold">{percentage}%</p>
                <p className="text-xs opacity-90 mt-1">
                  {correct_answer}/{totalQuestion}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="px-8 pb-8">
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* Correct Answers */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                <HiCheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{correct_answer}</p>
                <p className="text-xs text-green-600 font-medium">Correct</p>
              </div>
              
              {/* Incorrect Answers */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                <HiXCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">{incorrect_answer}</p>
                <p className="text-xs text-red-600 font-medium">Incorrect</p>
              </div>
              
              {/* Unanswered */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                <HiMinusCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-700">{is_unanswered}</p>
                <p className="text-xs text-gray-600 font-medium">Unanswered</p>
              </div>
            </div>

            {/* Message */}
            <div className={`p-4 rounded-xl mb-6 ${
              isQualified 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-orange-50 border border-orange-200'
            }`}>
              <p className={`text-center text-sm font-medium ${
                isQualified ? 'text-green-800' : 'text-orange-800'
              }`}>
                {isQualified
                  ? "🌟 Excellent work! Your hard work and dedication have paid off. Keep up the great performance!"
                  : "📚 Don't be discouraged! Review your answers, strengthen your weak areas, and try again. You've got this!"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {isQualified ? (
                <Link
                  to="/teacher/view-attempts"
                  className="group flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-emerald-700 transition-all duration-300 font-semibold"
                >
                  View Your Attempts
                  <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  to="/teacher"
                  className="group flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-red-700 transition-all duration-300 font-semibold"
                >
                  <FaRedo className="w-4 h-4" />
                  Try Again
                </Link>
              )}
              <Link
                to="/teacher"
                className="group flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-[#2a7ba0] transition-all duration-300 font-semibold"
              >
                <FaHome className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {isQualified 
            ? "🎓 You're one step closer to your teaching career!" 
            : "💡 Tip: Review the topics you struggled with and practice more."}
        </p>
      </div>
    </div>
  );
};

export default ResultPage;

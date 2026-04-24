import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import {
  HiCheckCircle,
  HiXCircle,
  HiMinusCircle,
  HiArrowRight,
  HiHome,
} from "react-icons/hi";
import { HiTrophy, HiFaceFrown } from "react-icons/hi2";

const ResultPage = () => {
  const location = useLocation();
  const [resultData, setResultData] = useState(() => {
    if (location.state) {
      localStorage.setItem("last_exam_result", JSON.stringify(location.state));
      return location.state;
    }
    const saved = localStorage.getItem("last_exam_result");
    return saved ? JSON.parse(saved) : {
      correct_answer: 0,
      incorrect_answer: 0,
      is_unanswered: 0,
    };
  });

  const { correct_answer, incorrect_answer, is_unanswered } = resultData;

  const totalQuestion = correct_answer + incorrect_answer + is_unanswered;
  const percentage =
    totalQuestion > 0 ? ((correct_answer / totalQuestion) * 100).toFixed(1) : 0;
  const isQualified = percentage >= 60;

  const fireConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000,
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  useEffect(() => {
    if (isQualified) {
      fireConfetti();
    }
  }, [isQualified]);

  return (
    <div className="bg-white sm:bg-transparent font-sans">
      <div className="max-w-4xl mx-auto p-0 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          
          {/* Status Section - Bento Box 1 */}
          <div 
            className={`p-6 sm:p-8 text-center sm:rounded-2xl border-b sm:border border-slate-200 ${
              isQualified ? "bg-teal-50/50" : "bg-slate-100/50"
            }`}
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
              isQualified ? "bg-teal-100 text-teal-600" : "bg-slate-200 text-slate-600"
            }`}>
              {isQualified ? <HiTrophy className="w-6 h-6" /> : <HiFaceFrown className="w-6 h-6" />}
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black mb-2 ${
              isQualified ? "text-teal-900" : "text-slate-900"
            }`}>
              {isQualified ? "PASSED!" : "FAILED"}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
              {isQualified
                ? "Excellent! You've successfully met the qualification criteria."
                : "Your score was below the threshold. Keep practicing and try again."}
            </p>
          </div>

          {/* Metrics Section - Bento Box 2 & 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            
            {/* Score Metric */}
            <div className="md:col-span-2 bg-white p-6 sm:rounded-2xl border-y sm:border border-slate-200 flex items-center gap-6">
              <div className="relative shrink-0">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={226.2}
                    strokeDashoffset={226.2 - (226.2 * percentage) / 100}
                    className={`${isQualified ? "text-teal-500" : "text-slate-500"}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-slate-900">{Math.round(percentage)}%</span>
                </div>
              </div>
              <div>
                <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Performance Index</h4>
                <h3 className="text-lg font-bold text-slate-900">Total Score Analysis</h3>
              </div>
            </div>

            {/* Breakdown Metric */}
            <div className="bg-white p-6 sm:rounded-2xl border-y sm:border border-slate-200 flex flex-col justify-center">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs font-medium">Correct</span>
                  <span className="text-teal-600 text-xs font-bold">{correct_answer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs font-medium">Incorrect</span>
                  <span className="text-rose-600 text-xs font-bold">{incorrect_answer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs font-medium">Skipped</span>
                  <span className="text-slate-600 text-xs font-bold">{is_unanswered}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Section - Bento Box 4 */}
          <div className="bg-slate-900 p-5 sm:p-6 sm:rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h3 className="text-white font-bold text-base">Next Steps</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link
                to="/teacher"
                className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-white/10 text-white font-bold text-xs text-center border border-white/10"
              >
                Dashboard
              </Link>
              {isQualified ? (
                <Link
                  to="/teacher/view-attempts"
                  className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-teal-500 text-white font-bold text-xs text-center flex items-center justify-center gap-1"
                >
                  View Attempts <HiArrowRight />
                </Link>
              ) : (
                <Link
                  to="/teacher"
                  className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-indigo-500 text-white font-bold text-xs text-center flex items-center justify-center gap-1"
                >
                  Try Again <HiArrowRight />
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResultPage;

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
  const { correct_answer, incorrect_answer, is_unanswered } = location.state || {
    correct_answer: 0,
    incorrect_answer: 0,
    is_unanswered: 0,
  };

  const totalQuestion = correct_answer + incorrect_answer + is_unanswered;
  const percentage = totalQuestion > 0 ? ((correct_answer / totalQuestion) * 100).toFixed(1) : 0;
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-2 sm:p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        {/* Header Section */}
        <div
          className={`relative px-4 py-8 sm:px-8 sm:py-12 text-center ${isQualified ? "bg-teal-600" : "bg-slate-700"
            }`}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4 sm:mb-6"
          >
            {isQualified ? (
              <HiTrophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            ) : (
              <HiFaceFrown className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            )}
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {isQualified ? "Passed!" : "Failed"}
          </h1>
          <p className="text-white/80 text-sm sm:text-lg max-w-md mx-auto">
            {isQualified
              ? "Congratulations on demonstrating your proficiency. You are now eligible for the next stage."
              : "Unfortunately, you did not meet the passing criteria this time. Keep practicing and try again."}
          </p>
        </div>

        {/* Score Section */}
        <div className="px-4 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col items-center -mt-12 sm:-mt-16 mb-6 sm:mb-8">
            <div className="relative bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-full max-w-sm border border-slate-100 text-center">
              <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Total Score
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className={`text-4xl sm:text-5xl font-bold ${isQualified ? "text-teal-600" : "text-slate-700"}`}>
                  {percentage}%
                </span>
                <span className="text-slate-400 font-medium text-sm sm:text-base">/ 100%</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 rounded-full h-2 sm:h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${isQualified ? "bg-teal-500" : "bg-slate-500"}`}
                />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
            <div className="p-2 sm:p-4 rounded-xl bg-teal-50 border border-teal-100 text-center">
              <HiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mx-auto mb-1 sm:mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-teal-700">{correct_answer}</p>
              <p className="text-[10px] sm:text-xs font-semibold text-teal-600 uppercase tracking-wide">Correct</p>
            </div>

            <div className="p-2 sm:p-4 rounded-xl bg-rose-50 border border-rose-100 text-center">
              <HiXCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 mx-auto mb-1 sm:mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-rose-600">{incorrect_answer}</p>
              <p className="text-[10px] sm:text-xs font-semibold text-rose-500 uppercase tracking-wide">Incorrect</p>
            </div>

            <div className="p-2 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <HiMinusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 mx-auto mb-1 sm:mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-slate-600">{is_unanswered}</p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Skipped</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/teacher"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg border border-slate-300 text-slate-700 text-sm sm:text-base font-medium hover:bg-slate-50 transition-colors"
            >
              <HiHome className="w-4 h-4 sm:w-5 sm:h-5" />
              Dashboard
            </Link>

            {isQualified ? (
              <Link
                to="/teacher/view-attempts"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg bg-teal-600 text-white text-sm sm:text-base font-medium hover:bg-teal-700 shadow-sm hover:shadow transition-all"
              >
                View Attempts
                <HiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            ) : (
              <Link
                to="/teacher"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg bg-slate-800 text-white text-sm sm:text-base font-medium hover:bg-slate-900 shadow-sm hover:shadow transition-all"
              >
                Try Again
                <HiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultPage;

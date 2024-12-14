import React from "react";
import { HiLockClosed, HiLockOpen } from "react-icons/hi2";

const ExamLevelCard = ({ level, isLocked }) => {
  return (
    <button className="w-full max-w-sm mx-auto bg-white shadow-lg rounded-lg border-2 border-teal-500 px-6 py-3 flex flex-col items-center space-y-2">
      <div
        className={`w-16 h-16 flex items-center justify-center rounded-full bg-teal-100`}
      >
        {isLocked ? (
          <HiLockClosed className="text-teal-500 w-8 h-8" />
        ) : (
          <HiLockOpen className="text-teal-500 w-8 h-8" />
        )}
      </div>
      <h2 className="text-lg font-semibold text-teal-700">{level}</h2>
    </button>
  );
};

export default ExamLevelCard;

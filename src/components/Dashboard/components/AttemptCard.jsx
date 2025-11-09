import React, { useEffect, useState } from "react";
import { CiUnlock } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { attemptsCount } from "../../../features/examQuesSlice";

const AttemptCard = () => {
  const dispatch = useDispatch();
  const { levels, attemptCount } = useSelector((state) => state.examQues);

  

  useEffect(() => {
    dispatch(attemptsCount());
  }, []);

  return (
    <>
      <div className="md:px-6 relative px-2 flex items-center md:gap-10 py-4 bg-white border border-[#5a94b3d4] rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
        <div className="">
          <div className="flex flex-col items-center justify-center">
            <img src="/images/exam.png" alt="" className="w-20" />
            <h2 className="text-xl font-bold text-gray-600 truncate">
              Level 1
            </h2>
          </div>
        </div>

        <div className="text-gray-600 text-center ml-5 md:ml-0">
          {/* Check if attemptCount has categories */}
          {Object.keys(attemptCount).length > 0 ? (
            Object.entries(attemptCount).map(([subject, levels]) => (
              <div
                key={`${subject}-level1`}
                className="flex justify-between items-center gap-7"
              >
                <span className="text-gray-600 font-medium">{subject}</span>
                <span className="text-gray-500 font-semibold">
                  {levels.level1} of 10{" "}
                  <span className="text-[12px] text-purple-400 ml-1 mb-1">
                    (attempt)
                  </span>
                </span>
              </div>
            ))
          ) : (
            // Message to display when no categories are available
            (<div className="text-gray-500 font-medium italic">No categories available. Please select a category.
                          </div>)
          )}
        </div>
      </div>
      <div className="md:px-6 relative px-2 flex items-center md:gap-10 py-4 bg-white border border-[#5a94b3d4] rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
        <div className="">
          <div className="flex flex-col items-center justify-center">
            <img src="/images/exam.png" alt="" className="w-20" />
            <h2 className="text-xl font-bold text-gray-600 truncate">
              Level 2
            </h2>
          </div>
        </div>
        <div className="text-gray-600 text-center ml-5 md:ml-0">
          {Object.entries(attemptCount).map(([subject, levels]) => (
            <div
              key={`${subject}-level1`}
              className="flex justify-between items-center gap-7"
            >
              <span className="text-gray-600 font-medium">{subject} :</span>
              <span className="text-gray-500 font-semibold">
                {levels.level2} of 10{" "}
                <span className="text-[12px] text-purple-400 ml-1 mb-1">
                  (attempt)
                </span>
              </span>
            </div>
          ))}
        </div>
        {/* <div className="">
          <div className="flex items-center gap-1 text-md font-semibold bg-green-500 text-white px-4 py-1 rounded-b-lg absolute top-0 right-5">
            <p>unlock</p>
            <CiUnlock className="size-5" />
          </div>
        </div> */}
      </div>
    </>
  );
};

export default AttemptCard;

import React, { useState } from "react";
import { CiUnlock } from "react-icons/ci";
import { useSelector } from "react-redux";

const AttemptCard = ({ subjectAttempt }) => {
  console.log("subAttempt", subjectAttempt)
  const levels = useSelector((state) => state.examQues?.levels || []);
  console.log("level one sub", levels)

  const [remainingAttempts, setRemainingAttempts] = useState("5");
  return (
    <>
      {levels.map((level) => (
        <div className="md:px-6 relative px-2 flex items-center md:gap-10 py-4 bg-white border border-[#5a94b3d4] rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
          <div className="">
            <div className="flex flex-col items-center justify-center">
              <img src="/images/exam.png" alt="" className="w-20" />
              <h2 className="text-xl font-bold text-gray-600">
                {level.level_name}
              </h2>
            </div>
          </div>
          <div className="text-gray-600 text-center">
            <p className="mb-1 font-bold text-gray-600">
              <span className="md:font-bold text-gray-500">Exam Attempt</span>
            </p>
            {/* {level.subjects.map((sub) => (
              <p className="text-md font-semibold text-green-600 text-start">
                {sub.subject_name} : <span>{subjectAttempt.Maths}</span>
              </p>
            ))} */}
            
            {Object.entries(subjectAttempt).map(([key, value]) => (
              <p className=" text-start text-green-600 " key={key}><strong className="mr-2 text-[#3E98C7]">{key} :</strong><span className="text-md font-semibold">{value} of 10</span></p>
            ))}
          </div>
          <div className="">
            <div className="flex items-center gap-1 text-md font-semibold bg-green-500 text-white px-4 py-1 rounded-b-lg absolute top-0 right-5">
              <p>unlock</p>
              <CiUnlock className="size-5" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default AttemptCard;

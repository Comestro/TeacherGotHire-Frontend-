import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { setSubject } from "../../../features/examQuesSlice";

const SubjectAndLevelSelector = () => {
  const subjects = useSelector((state) => state.jobProfile.prefrence.prefered_subject || []);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const dispatch = useDispatch();

  const handleAddSubject = (subjectName) => {
    setSelectedSubject(subjectName);
    dispatch(setSubject(subjectName));  // Dispatch the selected subject to Redux
  };

  const levels = ["Level 1", "Level 2", "Level 3"];

  return (
    <div className="rounded-xl bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 flex justify-between py-10 px-5">
      <div className="">
        <h1 className="text-xl font-bold text-gray-600 mb-4">
          Choose a Subject
        </h1>

        {/* Subject Cards */}
        <div className="grid grid-cols-2 gap-4">
          {subjects.map((subject, index) => (
            <label
              key={index}
              className={`cursor-pointer px-4 py-2 rounded-md border-1 
                ${
                  selectedSubject === subject.subject_name
                    ? "bg-[#3E98C7] text-white"
                    : "bg-white text-gray-800 border-gray-300"
                } transition duration-200 ease-in-out transform hover:scale-105`}
              onClick={() => handleAddSubject(subject.id)}
            >
              <div className="text-center font-semibold">{subject.subject_name}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Show Level Selector after Subject is selected */}
      {selectedSubject && (
        <div className="items-start mt-4">
          <h2 className="text-xl font-bold text-gray-600 mb-4">
            Choose a Level for {selectedSubject}
          </h2>

          {/* Level Cards */}
          <div className="grid grid-cols-3 gap-4">
            {levels.map((level, index) => (
              <label
                key={index}
                className={`cursor-pointer px-4 py-2 rounded-md border-1 
                  ${
                    selectedLevel === level
                      ? "bg-[#3E98C7] text-white"
                      : "bg-white text-gray-800 border-gray-300"
                  } transition duration-200 ease-in-out transform`}
              >
                <input
                  type="radio"
                  name="level"
                  value={level}
                  className="hidden"
                  onChange={() => setSelectedLevel(level)}
                />
                <div className="text-center font-semibold">{level}</div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Show Proceed Button after Level is selected */}
      {selectedLevel && (
        <div className="flex items-end mt-4">
          <Link to="/exam-guide">
            <button className="px-4 py-2 bg-[#3E98C7] rounded-md text-white">
              Proceed to Exam
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SubjectAndLevelSelector;

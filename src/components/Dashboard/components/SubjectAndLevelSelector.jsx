import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getExamSet, setSubject } from "../../../features/examQuesSlice";
import ExamSetCard from "./ExamCard";

const SubjectAndLevelSelector = () => {
  const subjects = useSelector((state) => state.jobProfile?.prefrence?.prefered_subject || []);
  const subject = useSelector((state) => state.examQues.subject || []);
  const examSet = useSelector((state) => state.examQues.examSet || []);
  console.log("exam Set",examSet)
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const dispatch = useDispatch();

  const handleAddSubject = (subjectName) => {
    setSelectedSubject(subjectName);
    dispatch(setSubject(subjectName)); 
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    console.log("Level and Subject:", {
      level_id: level,
      subject_id: subject,
    });
    dispatch(
      getExamSet({
        level_id: level,
        subject_id: subject,
      })
    );
  };

  const levels = ["1", "2", "3"];

  return (
    <div className="rounded-xl bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 flex flex-col py-10 px-5">
      {/* Subject Selector */}
      <div className="">
        <h1 className="text-xl font-bold text-gray-600 mb-4">Choose a Subject</h1>
        <div className="grid grid-cols-2 gap-4">
          {subjects.map((subject, index) => (
            <label
              key={index}
              className={`cursor-pointer px-4 py-2 rounded-md border 
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

      {/* Level Selector */}
      {selectedSubject && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-600 mb-4">
            Choose a Level for {selectedSubject}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {levels.map((level, index) => (
              <label
                key={index}
                className={`cursor-pointer px-4 py-2 rounded-md border 
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
                  onChange={() => handleLevelChange(level)}
                />
                <div className="text-center font-semibold">{level}</div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ExamSetCard Section */}
      {selectedLevel && (
        <div className="mt-8">
           <ExamSetCard examSets={examSet} />
        </div>
      )}
    </div>
  );
};

export default SubjectAndLevelSelector;

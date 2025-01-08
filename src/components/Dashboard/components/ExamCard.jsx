import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setExam } from "../../../features/examQuesSlice";

const ExamSetCard = ({ examSet }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isCardVisible, setIsCardVisible] = useState(true);
  console.log("examset",examSet);
  const guideline = (exam) => {
    navigate('/exam-guide');
    dispatch(setExam(exam));
    setIsCardVisible(false); // Hide the card after selecting
  };

  return (
    <div className="grid grid-cols-1 gap-4 mt-6">
      {isCardVisible && examSet ? (
        <div
          className="border border-gray-300 rounded-lg shadow-lg p-5 bg-white cursor-pointer hover:shadow-xl transition"
          onClick={() => guideline(examSet)}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {examSet.name}
          </h3>
          <p className="text-gray-600">
            <span className="font-semibold">Subject:</span>{" "}
            {examSet.subject.subject_name}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Level:</span>{" "}
            {examSet.level.name}
          </p>
        </div>
      ) : (
        <p className="text-gray-600 text-center">No exams available</p>
      )}
    </div>
  );
};

export default ExamSetCard;
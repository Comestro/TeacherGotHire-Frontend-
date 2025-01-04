import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setExam } from "../../../features/examQuesSlice";

const ExamSetCard = ({examSets}) => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
 // const [exam ,setExam] = useState('');

  const guideline =(exam)=>{
    navigate('/exam-guide');
    dispatch(setExam(exam));
  }
  
  return (
    <div className="grid grid-cols-1 gap-4 mt-6">
      {examSets.length > 0 ? (
        examSets.map((exam, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-lg shadow-lg p-5 bg-white cursor-pointer hover:shadow-xl transition"
            onClick={()=>guideline(exam)}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">{exam.name}</h3>
            <p className="text-gray-600">
              <span className="font-semibold">Subject:</span> {exam.subject.subject_name}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Level:</span> {exam.level.name}
            </p>
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center">No exams available</p>
      )}
    </div>
  );
};

export default ExamSetCard;

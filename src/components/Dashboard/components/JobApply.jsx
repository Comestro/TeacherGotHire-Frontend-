import React, { useState, useEffect } from "react";
// import { apiOutput1, apiOutput2 } from './data';
import { useDispatch, useSelector } from "react-redux";
import { attemptsCount, attemptsExam ,postJobApply} from "../../../features/examQuesSlice";


const JobApply = () => {

  const dispatch = useDispatch();
    useEffect(() => {
      dispatch(attemptsExam());
      
    }, []);

    const {attempts} = useSelector((state) => state.examQues);
    const passedOfflineAttempt = attempts?.filter(
      (attempt) =>
        attempt.isqualified &&
        attempt.exam?.level_name === "2nd Level Offline"&&
        attempt.exam?.level_id === 3
    );
   

    console.log("attempts",attempts);
    console.log("passedOfflineAttempt",passedOfflineAttempt);
    
     // Convert single values to arrays
  const convertToArray = (value) => {
    return Array.isArray(value) ? value : [value]; // If already an array, return it; otherwise, wrap it in an array
  };
  
    // Handle Apply button click
    const handleApply = (subjects, class_categorys) => {
      // alert(`Applied for: ${subject} - ${class_category}`);
      const subject = convertToArray(subjects);
    const class_category = convertToArray(class_categorys);
      dispatch(postJobApply({subject, class_category}));
    };
  
    // Handle Cancel button click
    const handleCancel = (subjectName, classCategoryName) => {
      alert(`Cancelled for: ${subjectName} - ${classCategoryName}`);
    };
  
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Exam Results</h2>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Subject Name</th>
              <th className="py-2 px-4 border-b">Class Category Name</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {passedOfflineAttempt && passedOfflineAttempt.map((attempt, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{attempt.exam.subjet_name}</td>
                <td className="py-2 px-4 border-b">
                  {attempt.exam.class_category_name}
                </td>
                <td className="py-2 px-4 border-b space-x-2">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() =>
                      handleApply(
                        attempt.exam.subject_id,
                        attempt.exam.class_category_id
                      )
                    }
                  >
                    Apply
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={() =>
                      handleCancel(
                        attempt.exam.subjet_name,
                        attempt.exam.class_category_name
                      )
                    }
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
export default JobApply;
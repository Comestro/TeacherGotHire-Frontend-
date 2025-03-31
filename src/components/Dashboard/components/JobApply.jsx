
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { attemptsExam, postJobApply } from "../../../features/examQuesSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JobPrefrenceLocation from "../../Profile/JobProfile/JobPrefrenceLocation"


const JobApply = () => {

  const [appliedJobs,setAppliedJobs] = useState("")
  const dispatch = useDispatch();
  const { attempts,jobApply,error} = useSelector((state) => state.examQues);
  console.log("error",error)
  useEffect(() => {
    dispatch(attemptsExam());
  }, [dispatch]);

  const passedOfflineAttempt = attempts?.filter(
    (attempt) =>
      attempt.isqualified &&
      attempt.exam?.level_name === "2nd Level Offline" 
     
  );

  console.log("jobApply",jobApply)
  const convertToArray = (value) => (Array.isArray(value) ? value : [value]);

  // Handle Notify Button Click
  const handleNotify = async (subjectId, classCategoryId) => {
    try {
      const subject = convertToArray(subjectId);
      const class_category = convertToArray(classCategoryId);

      const response = await dispatch(postJobApply({ subject, class_category })).unwrap();

      if (response.status) {
        setAppliedJobs((prev) => [...prev, { subjectId, classCategoryId }]); // Add to applied list
        toast.success("You will be notified.");
      }
    } catch (error) {
      console.error("Error notifying:", error.code.response.data.error);
    }
  };

  // Handle Cancel Button Click
  const handleCancel = async (subjectId, classCategoryId) => {
    try {
      const subject = convertToArray(subjectId);
      const class_category = convertToArray(classCategoryId);

      const response = await dispatch(postJobApply({ subject, class_category })).unwrap();
    } catch (error) {
      console.error("Error canceling:", error);
    }
  };

  return (
    <div className="p-6">
      
      {passedOfflineAttempt && passedOfflineAttempt.length > 0 ? (
        <>
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border-l-4 border-green-500">
            🎉 <strong>Congratulations!</strong> You are eligible for the Teacher Job Role.
            Below are the subjects and their respective class categories.
            Click <strong>"Notify"</strong> to be visible to recruiters or <strong>"Cancel"</strong> if you do not want to notify.
          </div>
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left font-semibold text-gray-700">Subject Name</th>
                <th className="py-3 px-6 text-left font-semibold text-gray-700">Class Category Name</th>
                <th className="py-3 px-6 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {passedOfflineAttempt.map((attempt, index) => {
                const subjectId = attempt.exam.subject_id;
                const classCategoryId = attempt.exam.class_category_id;
                const isApplied = jobApply?.data?.status
                return (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}
                  >
                    <td className="py-4 px-6 border-b border-gray-200">{attempt.exam.subject_name}</td>
                    <td className="py-4 px-6 border-b border-gray-200">{attempt.exam.class_category_name}</td>
                    <td className="py-4 px-6 border-b border-gray-200">
                      {isApplied ? (

                        <button
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                          onClick={() => handleCancel(subjectId, classCategoryId)}
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                          onClick={() => handleNotify(subjectId, classCategoryId)}
                        >
                          Notify
                        </button>
                   
                        
                      )}
                     
                    </td>
                  </tr>
                  
                );
              })}
            </tbody>
            {error && (
                    <p className="text-red-600 text-center mb-4">{error}</p>
                  )} 
          </table>
        </>
      ) : (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg border-l-4 border-red-500">
          ❌ <strong>Sorry!</strong> You are not eligible for the Teacher Job Role.
        </div>
      )}

       {passedOfflineAttempt?.length>0 && <JobPrefrenceLocation/> }
      
    </div>
    
  );
};

export default JobApply;

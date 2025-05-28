import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { attemptsExam, postJobApply } from "../../../features/examQuesSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JobPrefrenceLocation from "../../Profile/JobProfile/JobPrefrenceLocation";
import { useGetJobsApplyDetailsQuery } from "../../../features/api/apiSlice";
const JobApply = () => {
  const dispatch = useDispatch();
  const { attempts, interviews, error } = useSelector(
    (state) => state.examQues
  );
  const [appliedSubjects, setAppliedSubjects] = useState([]);
  const [isqualified, setQualified] = useState("True");
  const [levelCode, setLevelCode] = useState(2.5);

  useEffect(() => {
    dispatch(
      attemptsExam({
        isqualified: isqualified,
        level_code: levelCode,
      })
    );
  }, []);
  const { data: jobApply, isLoading } = useGetJobsApplyDetailsQuery();
  console.log("jobApply",jobApply)
  const passedOfflineAttempt = attempts || interviews;
  const handleApply = async (subjectId, classCategoryId, subjectName) => {
    try {
      const response = await dispatch(
        postJobApply({
          subject: [subjectId],
          class_category: [classCategoryId],
        })
      ).unwrap();

      if (response.status) {
        setAppliedSubjects((prev) => [...prev, subjectId]);
        toast.success(
          <div>
            <div className="font-bold">Application Successful!</div>
            <div className="text-sm">You've applied for {subjectName}</div>
          </div>,
          {
            position: "top-right",
            className: "bg-green-50 text-green-800",
          }
        );
      }
    } catch (error) {
      toast.error(
        <div>
          <div className="font-bold">Application Failed</div>
          <div className="text-sm">
            {error?.response?.data?.error || "Please try again"}
          </div>
        </div>,
        {
          position: "top-right",
          className: "bg-red-50 text-red-800",
        }
      );
    }
  };
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {passedOfflineAttempt && passedOfflineAttempt.length > 0 ? (
        <>
          <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-blue-500 text-xl mr-3">📊</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Your Exam Results</h3>
                <p className="text-sm">
                  Below are your qualified exams. You can apply separately for
                  each subject.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {passedOfflineAttempt.map((attempt, index) => {
                    const subjectId = attempt.exam.subject_id;
                    const classCategoryId = attempt.exam.class_category_id;
                    const subjectName = attempt.exam.subject_name;
                    const className = attempt.exam.class_category_name;

                    // Check if this subject is applied (status: true in response)
                    const isApplied = jobApply?.some(item => {
                      // Check if item has subjects array with matching subject
                      const hasSubject = item.subject?.some?.(
                        sub => sub.id === subjectId
                      );
                      
                      // Check if item has class_categories array with matching category
                      const hasClassCategory = item.class_category?.some?.(
                        cat => cat.id === classCategoryId
                      );
                      
                      return hasSubject && hasClassCategory && item.status === true;
                    });
                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {subjectName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {className}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {attempt.language}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            {attempt.calculate_percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            {isApplied ? (
                              <>
                                <span className="text-green-600 font-medium">
                                  Applied
                                </span>
                                <button
                                  onClick={() =>
                                    handleApply(
                                      // applicationData.id, // Use the application ID from response
                                      subjectId,
                                      classCategoryId,
                                      subjectName
                                    )
                                  }
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() =>
                                  handleApply(
                                    subjectId,
                                    classCategoryId,
                                    subjectName
                                  )
                                }
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                              >
                                Apply
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-yellow-500 text-xl mr-3">ℹ️</div>
            <div>
              <h3 className="font-bold text-lg mb-1">No Qualified Exams</h3>
              <p className="text-sm">
                You don't have any qualified exam results yet. Please complete
                and pass the exams to apply.
              </p>
            </div>
          </div>
        </div>
      )}
      {passedOfflineAttempt?.length > 0 && <JobPrefrenceLocation />}
    </div>
  );
};

export default JobApply;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { postJobApply } from "../../../features/examQuesSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JobPrefrenceLocation from "../../Profile/JobProfile/JobPrefrenceLocation";
import { useGetJobsApplyDetailsQuery, useGetApplyEligibilityQuery } from "../../../features/api/apiSlice";

const JobApply = () => {
  const dispatch = useDispatch();
  const [appliedSubjects, setAppliedSubjects] = useState([]);
  const [showLocationFirst, setShowLocationFirst] = useState(false);

  // Get eligibility data using the new endpoint
  const { data: eligibilityData, isLoading: isEligibilityLoading, error: eligibilityError } = useGetApplyEligibilityQuery();
  const { data: jobApply, isLoading: isJobApplyLoading, refetch: refetchJobApply } = useGetJobsApplyDetailsQuery();

  console.log("eligibilityData", eligibilityData);
  console.log("jobApply", jobApply);

  // Extract eligible exams from the new response structure
  const eligibleExams = eligibilityData?.qualified_list ? 
    eligibilityData.qualified_list.filter(exam => exam.eligible === true) : [];

  console.log("eligibleExams", eligibleExams);

  // Function to handle location success callback
  const handleLocationSuccess = () => {
    setShowLocationFirst(false);
    toast.success(
      <div>
        <div className="font-bold">Location Added Successfully!</div>
        <div className="text-sm">You can now apply for jobs</div>
      </div>,
      {
        position: "top-right",
        className: "bg-green-50 text-green-800",
        autoClose: 3000,
      }
    );
  };

  const handleApply = async (subjectId, classCategoryId, subjectName, currentStatus = false) => {
    try {
      const response = await dispatch(
        postJobApply({
          subject: [subjectId],
          class_category: [classCategoryId],
        })
      ).unwrap();

      // Refetch the job apply data to get updated status
      refetchJobApply();

      // Remove location warning if application is successful
      setShowLocationFirst(false);

      // Show appropriate success message based on current status
      const action = currentStatus ? "revoked" : "applied";
      const actionText = currentStatus ? "Application Revoked" : "Application Successful";
      const messageText = currentStatus ? `You've revoked your application for ${subjectName}` : `You've applied for ${subjectName}`;

      toast.success(
        <div>
          <div className="font-bold">{actionText}</div>
          <div className="text-sm">{messageText}</div>
        </div>,
        {
          position: "top-right",
          className: "bg-green-50 text-green-800",
        }
      );
    } catch (error) {
      console.log("Application error:", error);
      
      // Extract error message from different possible error structures
      let errorMessage = "Please try again";
      
      if (error?.error) {
        errorMessage = error.error;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Special handling for job preference location error
      if (errorMessage.includes("job preference location")) {
        setShowLocationFirst(true);
        
        toast.error(
          <div>
            <div className="font-bold">Job Preference Required</div>
            <div className="text-sm">
              Please set your job preference location below before applying.
            </div>
          </div>,
          {
            position: "top-right",
            className: "bg-red-50 text-red-800",
            autoClose: 5000,
          }
        );
        
        // Scroll to the location component
        setTimeout(() => {
          const locationElement = document.getElementById('job-preference-location');
          if (locationElement) {
            locationElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      } else {
        // Show generic error toast
        toast.error(
          <div>
            <div className="font-bold">Application Failed</div>
            <div className="text-sm">{errorMessage}</div>
          </div>,
          {
            position: "top-right",
            className: "bg-red-50 text-red-800",
            autoClose: 4000,
          }
        );
      }
    }
  };

  if (isEligibilityLoading || isJobApplyLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (eligibilityError) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-red-500 text-xl mr-3">❌</div>
            <div>
              <h3 className="font-bold text-lg mb-1">Error Loading Data</h3>
              <p className="text-sm">
                Unable to load eligibility data. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Job Preference Location Warning */}
      {showLocationFirst && (
        <div className="mb-6 p-4 bg-orange-50 text-orange-800 rounded-lg border border-orange-200 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-orange-500 text-xl mr-3">⚠️</div>
            <div>
              <h3 className="font-bold text-lg mb-1">Job Preference Required</h3>
              <p className="text-sm">
                Please set your job preference location below before applying for any position.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Job Preference Location Component - Move to top */}
      <div id="job-preference-location" className={`mb-6 ${showLocationFirst ? 'ring-2 ring-orange-300 rounded-lg p-4' : ''}`}>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Preference Location</h2>
          <p className="text-sm text-gray-600">Set your preferred job locations before applying</p>
        </div>
        <JobPrefrenceLocation onLocationSuccess={handleLocationSuccess} />
      </div>

      {eligibleExams && eligibleExams.length > 0 ? (
        <>
          <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-blue-500 text-xl mr-3">📊</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Eligible Subjects for Application</h3>
                <p className="text-sm">
                  Below are the subjects you're eligible to apply for based on your qualification.
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
                      Class Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Eligibility Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eligibleExams.map((exam, index) => {
                    const subjectId = exam.subject_id;
                    const classCategoryId = exam.class_category_id;
                    const subjectName = exam.subject_name;
                    const className = exam.class_category_name;

                    // Find the application status for this subject and class category
                    const applicationData = jobApply?.find(item => {
                      const hasSubject = item.subject?.some?.(
                        sub => sub.id === subjectId
                      );
                      
                      const hasClassCategory = item.class_category?.some?.(
                        cat => cat.id === classCategoryId
                      );
                      
                      return hasSubject && hasClassCategory;
                    });

                    const applicationStatus = applicationData?.status || false;

                    return (
                      <tr
                        key={`${subjectId}-${classCategoryId}-${index}`}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {subjectName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {className}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            Eligible
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {applicationStatus ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              Applied
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                              Not Applied
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() =>
                              handleApply(
                                subjectId,
                                classCategoryId,
                                subjectName,
                                applicationStatus
                              )
                            }
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              applicationStatus
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                            }`}
                          >
                            {applicationStatus ? 'Revoke Apply' : 'Apply'}
                          </button>
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
              <h3 className="font-bold text-lg mb-1">No Eligible Subjects</h3>
              <p className="text-sm">
                You don't have any eligible subjects to apply for at the moment. 
                Please complete your qualifications to become eligible for job applications.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApply;

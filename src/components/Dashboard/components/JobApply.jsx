import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { postJobApply } from "../../../features/examQuesSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JobPrefrenceLocation from "../../Profile/JobProfile/JobPrefrenceLocation";
import { useGetJobsApplyDetailsQuery, useGetApplyEligibilityQuery } from "../../../features/api/apiSlice";
import {
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineXCircle,
  HiOutlineCheckCircle,
  HiOutlineMapPin,
} from "react-icons/hi2";

const JobApply = () => {
  const dispatch = useDispatch();
  const [showLocationFirst, setShowLocationFirst] = useState(false);

  // Get eligibility data using the new endpoint
  const { data: eligibilityData, isLoading: isEligibilityLoading, error: eligibilityError } = useGetApplyEligibilityQuery();
  const { data: jobApply, isLoading: isJobApplyLoading, refetch: refetchJobApply } = useGetJobsApplyDetailsQuery();

  // console.log("eligibilityData", eligibilityData);
  // console.log("jobApply", jobApply);

  // Extract eligible exams from the new response structure
  const eligibleExams = eligibilityData?.qualified_list ? 
    eligibilityData.qualified_list.filter(exam => exam.eligible === true) : [];

  // console.log("eligibleExams", eligibleExams);

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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col justify-center items-center h-64 gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent border-b-primary"></div>
          <p className="text-sm text-secondary">Loading job applications...</p>
        </div>
      </div>
    );
  }

  if (eligibilityError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="p-5 bg-error-light text-error-text rounded-lg border border-error/30">
          <div className="flex items-start">
            <HiOutlineXCircle className="mt-0.5 mr-3 h-6 w-6 text-error flex-shrink-0" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-base mb-1">Error loading data</h3>
              <p className="text-sm">Unable to load eligibility data. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-text">
          Job Applications
          <span className="ml-2 text-secondary text-sm font-normal">/ नौकरी आवेदन</span>
        </h1>
        <p className="mt-2 text-sm text-secondary">Apply to eligible subjects after setting your job preference location.</p>
      </header>
      {/* Job Preference Location Warning */}
      {showLocationFirst && (
        <div className="mb-6 p-5 bg-warning-light text-warning rounded-lg border border-warning/30 animate-pulse">
          <div className="flex items-start">
            <HiOutlineExclamationTriangle className="mt-0.5 mr-3 h-6 w-6 text-warning flex-shrink-0" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-base mb-1">Job preference required</h3>
              <p className="text-sm">Please set your job preference location below before applying for any position.</p>
            </div>
          </div>
        </div>
      )}

      {/* Job Preference Location Component - Move to top */}
      <div id="job-preference-location" className={`mb-8 border py-5  rounded-lg p-4`}>
        <JobPrefrenceLocation onLocationSuccess={handleLocationSuccess} />
      </div>

      {eligibleExams && eligibleExams.length > 0 ? (
        <>
          <div className="mb-6 p-5 bg-primary/5 border border-primary/20 text-text rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HiOutlineInformationCircle className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base text-text mb-1">Eligible subjects for application
                  <span className="ml-2 text-secondary text-sm font-normal">/ आवेदन हेतु पात्र विषय</span>
                </h3>
                <p className="text-sm text-secondary">Below are the subjects you're eligible to apply for based on your qualification.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden border border-secondary/30 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary/10">
                <caption className="sr-only">Eligible subjects list</caption>
                <thead className="bg-gradient-to-br from-background to-background/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-text/70 uppercase tracking-wider">
                      Subject
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-text/70 uppercase tracking-wider">
                      Class Category
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-text/70 uppercase tracking-wider">
                      Eligibility Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-text/70 uppercase tracking-wider">
                      Application Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-text/70 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary/10">
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
                        className="hover:bg-primary/5 transition-all duration-200 group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text">
                          {subjectName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text/70">
                          {className}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text/70">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success rounded-full text-xs font-semibold border border-success/20">
                            <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            Eligible
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text/70">
                          {applicationStatus ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success rounded-full text-xs font-semibold border border-success/20">
                              <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                              Applied
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1.5 bg-background text-secondary rounded-full text-xs font-semibold border border-secondary/30">
                              Not Applied
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text/70">
                          <button
                            onClick={() =>
                              handleApply(
                                subjectId,
                                classCategoryId,
                                subjectName,
                                applicationStatus
                              )
                            }
                            aria-label={`${applicationStatus ? 'Revoke application' : 'Apply to'} ${subjectName}`}
                            className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md ${
                              applicationStatus
                                ? 'bg-error hover:bg-error/90 focus:ring-error'
                                : 'bg-primary hover:bg-primary/90 focus:ring-primary'
                            }`}
                          >
                            {applicationStatus ? 'Revoke' : 'Apply Now'}
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
        <div className="p-8 bg-gradient-to-br from-background to-background/50 rounded-xl border border-secondary/30 text-center">
          <div className="flex flex-col items-center max-w-md mx-auto">
            <div className="p-4 bg-warning/10 rounded-full mb-4">
              <HiOutlineInformationCircle className="h-12 w-12 text-warning" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-text">No eligible subjects
              <span className="ml-2 text-secondary text-sm font-normal">/ कोई पात्र विषय नहीं</span>
            </h3>
            <p className="text-sm text-secondary leading-relaxed">You don't have any eligible subjects to apply for at the moment. Please complete your qualifications to become eligible for job applications.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApply;

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
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    subjectId: null,
    classCategoryId: null,
    subjectName: '',
    currentStatus: false,
    action: '' // 'apply' or 'revoke'
  });

  // Confirmation Dialog Component
  const ConfirmationDialog = ({ isOpen, onClose, onConfirm, subjectName, action, currentStatus }) => {
    if (!isOpen) return null;

    const isApplying = action === 'apply';
    const title = isApplying ? 'Confirm Application' : 'Confirm Cancellation';
    const message = isApplying 
      ? `Are you sure you want to apply for ${subjectName}?`
      : `Are you sure you want to cancel your application for ${subjectName}?`;
    const confirmText = isApplying ? 'Apply' : 'Cancel Application';
    const icon = isApplying ? HiOutlineCheckCircle : HiOutlineXCircle;
    const iconColor = isApplying ? 'text-primary' : 'text-error';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="flex items-center mb-4">
            <div className={`p-2 rounded-full ${isApplying ? 'bg-primary/10' : 'bg-error/10'}`}>
              <icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-text">{title}</h3>
          </div>
          
          <p className="text-sm text-secondary mb-6">{message}</p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                isApplying 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-error hover:bg-error/90'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Get eligibility data using the new endpoint
  const { data: eligibilityData, isLoading: isEligibilityLoading, error: eligibilityError } = useGetApplyEligibilityQuery();
  const { data: jobApply, isLoading: isJobApplyLoading, refetch: refetchJobApply } = useGetJobsApplyDetailsQuery();

  // 
  // 

  // Extract eligible exams from the new response structure
  const eligibleExams = eligibilityData?.qualified_list ? 
    eligibilityData.qualified_list.filter(exam => exam.eligible === true) : [];

  // 

  // Function to show confirmation dialog
  const showConfirmation = (subjectId, classCategoryId, subjectName, currentStatus) => {
    setConfirmationDialog({
      isOpen: true,
      subjectId,
      classCategoryId,
      subjectName,
      currentStatus,
      action: currentStatus ? 'revoke' : 'apply'
    });
  };

  // Function to handle confirmation
  const handleConfirmation = async () => {
    const { subjectId, classCategoryId, subjectName, currentStatus } = confirmationDialog;
    await handleApply(subjectId, classCategoryId, subjectName, currentStatus);
    setConfirmationDialog({ isOpen: false, subjectId: null, classCategoryId: null, subjectName: '', currentStatus: false, action: '' });
  };

  // Function to close confirmation dialog
  const closeConfirmation = () => {
    setConfirmationDialog({ isOpen: false, subjectId: null, classCategoryId: null, subjectName: '', currentStatus: false, action: '' });
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
      const action = currentStatus ? "cancelled" : "applied";
      const actionText = currentStatus ? "Application Cancelled" : "Application Successful";
      const messageText = currentStatus ? `You've cancelled your application for ${subjectName}` : `You've applied for ${subjectName}`;

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
    <div className="p-6 max-w-8xl mx-auto">
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
      <div className="flex xl:flex-row flex-col gap-6">
       

      {/* Job Preference Location Component - Move to top */}
      <div id="job-preference-location" className={`mb-8 border py-5  flex-1 rounded-lg p-4`}>
        <JobPrefrenceLocation />
      </div>

      {eligibleExams && eligibleExams.length > 0 ? (
        <div className="flex flex-col flex-1">
          <div className="mb-6 p-5 flex-1 bg-primary/5 border border-primary/20 text-text rounded-lg">
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

          <div className="grid grid-cols-1 flex-1 gap-4">
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
                <div
                  key={`${subjectId}-${classCategoryId}-${index}`}
                  className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-5 ${
                    applicationStatus
                      ? 'border-success/30 bg-success/5'
                      : 'border-secondary/30 hover:border-primary/30'
                  }`}
                >
                  {/* Header with subject and class */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-text mb-1">
                        {subjectName}
                      </h3>
                      <p className="text-sm text-secondary">
                        {className}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      applicationStatus
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {applicationStatus ? 'Applied' : 'Eligible'}
                    </div>
                  </div>

                  {/* Status indicators */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <HiOutlineCheckCircle className="h-4 w-4 text-success" />
                      <span className="text-xs text-success font-medium">Eligible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {applicationStatus ? (
                        <>
                          <HiOutlineCheckCircle className="h-4 w-4 text-success" />
                          <span className="text-xs text-success font-medium">Applied</span>
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-secondary"></div>
                          <span className="text-xs text-secondary font-medium">Not Applied</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() =>
                      showConfirmation(
                        subjectId,
                        classCategoryId,
                        subjectName,
                        applicationStatus
                      )
                    }
                    aria-label={`${applicationStatus ? 'Cancel application' : 'Apply to'} ${subjectName}`}
                    className={`w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md ${
                      applicationStatus
                        ? 'bg-error hover:bg-error/90 focus:ring-error'
                        : 'bg-primary hover:bg-primary/90 focus:ring-primary'
                    }`}
                  >
                    {applicationStatus ? (
                      <>
                        <HiOutlineXCircle className="h-4 w-4 mr-2" />
                        Cancel Application
                      </>
                    ) : (
                      <>
                        <HiOutlineCheckCircle className="h-4 w-4 mr-2" />
                        Apply Now
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={closeConfirmation}
        onConfirm={handleConfirmation}
        subjectName={confirmationDialog.subjectName}
        action={confirmationDialog.action}
        currentStatus={confirmationDialog.currentStatus}
      />
    </div>
  );
};

export default JobApply;

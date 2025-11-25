import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { postJobApply } from "../../../features/examQuesSlice";
import { getTeacherjobType } from "../../../features/jobProfileSlice";
import { updateJobApply } from "../../../services/examQuesServices";
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
  HiOutlineCurrencyDollar,
  HiOutlinePencilSquare,
} from "react-icons/hi2";

const JobApply = () => {
  const dispatch = useDispatch();
  const [showLocationFirst, setShowLocationFirst] = useState(false);
  
  // Get job types from Redux store
  const { teacherjobRole: jobTypes, status: jobTypesStatus } = useSelector((state) => state.jobProfile);
  
  // Load job types on component mount
  useEffect(() => {
    if (!jobTypes || jobTypes.length === 0) {
      dispatch(getTeacherjobType());
    }
  }, [dispatch, jobTypes]);
  
  // Salary Dialog State
  const [salaryDialog, setSalaryDialog] = useState({
    isOpen: false,
    subjectId: null,
    classCategoryId: null,
    subjectName: '',
    applicationId: null,
    applicationData: null,
    isEdit: false,
  });
  
  // Salary Form State
  const [salaryForm, setSalaryForm] = useState({
    salary_expectation: '',
    salary_type: 'monthly',
    teacher_job_type: [1],
  });
  
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    subjectId: null,
    classCategoryId: null,
    subjectName: '',
    currentStatus: false,
    action: '',
    salaryData: null,
    applicationId: null,
  });

  // Helper function to get job type name by ID - Updated to handle both objects and IDs
  const getJobTypeName = (jobTypeId) => {
    if (!jobTypes || jobTypes.length === 0) return 'Loading...';
    
    // Handle if jobTypeId is an object
    let actualId = jobTypeId;
    if (typeof jobTypeId === 'object' && jobTypeId !== null) {
      actualId = jobTypeId.id || jobTypeId;
    }
    
    const jobType = jobTypes.find(type => type.id === actualId);
    return jobType ? jobType.teacher_job_name : `Job Type ${actualId}`;
  };

  // Helper function to get job type ID from teacher_job_type array
  const getJobTypeId = (teacherJobType) => {
    if (!teacherJobType || !Array.isArray(teacherJobType) || teacherJobType.length === 0) {
      return null;
    }
    
    const firstItem = teacherJobType[0];
    
    // If it's an object, extract the ID
    if (typeof firstItem === 'object' && firstItem !== null) {
      return firstItem.id || firstItem;
    }
    
    // If it's already a number, return it
    return firstItem;
  };

  // Updated Salary Dialog Component with dynamic job types
  const SalaryDialog = ({ isOpen, onClose, onConfirm, subjectName, applicationData, isEdit }) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const salary = formData.get('salary');
      const salaryType = formData.get('salaryType');
      const jobType = formData.get('jobType');
      
      if (!salary || parseFloat(salary) <= 0) {
        toast.error("Please enter a valid salary expectation");
        return;
      }
      
      const salaryData = {
        salary_expectation: salary,
        salary_type: salaryType,
        teacher_job_type: [parseInt(jobType)]
      };
      
      setSalaryForm(salaryData);
      onConfirm(salaryData);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-primary/10">
              <HiOutlineCurrencyDollar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-text">
              {isEdit ? 'Update Salary Details' : 'Salary Details'}
            </h3>
          </div>
          
          <p className="text-sm text-secondary mb-4">
            {isEdit ? 'Update your salary expectation for' : 'Set your salary expectation for'} <strong>{subjectName}</strong>
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Expected Salary <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">₹</span>
                <input
                  name="salary"
                  type="number"
                  placeholder="25000"
                  defaultValue={isEdit ? applicationData?.salary_expectation : ''}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter your expected salary amount</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Salary Type <span className="text-error">*</span>
              </label>
              <select
                name="salaryType"
                defaultValue={isEdit ? applicationData?.salary_type || 'monthly' : 'monthly'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="daily">Daily</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Job Type <span className="text-error">*</span>
              </label>
              <select
                name="jobType"
                defaultValue={isEdit ? (applicationData?.teacher_job_type?.[0] || (jobTypes?.[0]?.id || 1)) : (jobTypes?.[0]?.id || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={jobTypesStatus === 'loading'}
              >
                {jobTypesStatus === 'loading' ? (
                  <option value="">Loading job types...</option>
                ) : jobTypes && jobTypes.length > 0 ? (
                  jobTypes.map((jobType) => (
                    <option key={jobType.id} value={jobType.id}>
                      {jobType.teacher_job_name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">Full Time</option>
                    <option value="2">Part Time</option>
                    <option value="3">Contract</option>
                  </>
                )}
              </select>
              {jobTypesStatus === 'loading' && (
                <p className="text-xs text-gray-500 mt-1">Loading available job types...</p>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={jobTypesStatus === 'loading'}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEdit ? 'Update Salary' : 'Continue to Apply'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Updated Confirmation Dialog Component with dynamic job type names
  const ConfirmationDialog = ({ isOpen, onClose, onConfirm, subjectName, action, currentStatus, salaryData }) => {
    if (!isOpen) return null;

    const isApplying = action === 'apply';
    const isUpdating = action === 'update';
    const title = isApplying ? 'Confirm Application' : isUpdating ? 'Confirm Salary Update' : 'Confirm Cancellation';
    const message = isApplying 
      ? `Are you sure you want to apply for ${subjectName}?`
      : isUpdating 
      ? `Are you sure you want to update salary details for ${subjectName}?`
      : `Are you sure you want to cancel your application for ${subjectName}?`;
    const confirmText = isApplying ? 'Apply' : isUpdating ? 'Update Salary' : 'Cancel Application';
    const IconComponent = (isApplying || isUpdating) ? HiOutlineCheckCircle : HiOutlineXCircle;
    const iconColor = (isApplying || isUpdating) ? 'text-primary' : 'text-error';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="flex items-center mb-4">
            <div className={`p-2 rounded-full ${(isApplying || isUpdating) ? 'bg-primary/10' : 'bg-error/10'}`}>
              <IconComponent className={`h-6 w-6 ${iconColor}`} />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-text">{title}</h3>
          </div>
          
          <p className="text-sm text-secondary mb-4">{message}</p>
          
          {(isApplying || isUpdating) && salaryData && (
            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="text-xs text-secondary mb-1">Salary Details:</div>
              <div className="text-sm font-medium">
                ₹{salaryData.salary_expectation} ({salaryData.salary_type})
              </div>
              <div className="text-xs text-secondary">
                Job Type: {getJobTypeName(salaryData.teacher_job_type[0])}
              </div>
            </div>
          )}
          
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
                (isApplying || isUpdating)
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

  // Extract eligible exams from the new response structure
  const eligibleExams = eligibilityData?.qualified_list ? 
    eligibilityData.qualified_list.filter(exam => exam.eligible === true) : [];

  // Function to show salary dialog
  const showSalaryDialog = (subjectId, classCategoryId, subjectName, applicationId = null, isEdit = false, applicationData = null) => {
    setSalaryDialog({
      isOpen: true,
      subjectId,
      classCategoryId,
      subjectName,
      applicationId,
      isEdit,
      applicationData,
    });
  };

  // Function to handle salary confirmation
  const handleSalaryConfirmation = (salaryData) => {
    setSalaryDialog(prev => ({ ...prev, isOpen: false }));
    
    // Show final confirmation with salary details
    setConfirmationDialog({
      isOpen: true,
      subjectId: salaryDialog.subjectId,
      classCategoryId: salaryDialog.classCategoryId,
      subjectName: salaryDialog.subjectName,
      currentStatus: false,
      action: salaryDialog.isEdit ? 'update' : 'apply',
      salaryData: salaryData,
      applicationId: salaryDialog.applicationId,
    });
  };

  // Function to show confirmation dialog for revoke
  const showRevokeConfirmation = (subjectId, classCategoryId, subjectName, applicationId) => {
    setConfirmationDialog({
      isOpen: true,
      subjectId,
      classCategoryId,
      subjectName,
      currentStatus: true,
      action: 'revoke',
      salaryData: null,
      applicationId,
    });
  };

  // Function to handle confirmation
  const handleConfirmation = async () => {
    const { subjectId, classCategoryId, subjectName, currentStatus, salaryData, applicationId, action } = confirmationDialog;
    await handleApply(subjectId, classCategoryId, subjectName, currentStatus, salaryData, applicationId, action);
    setConfirmationDialog({ 
      isOpen: false, 
      subjectId: null, 
      classCategoryId: null, 
      subjectName: '', 
      currentStatus: false, 
      action: '',
      salaryData: null,
      applicationId: null,
    });
  };

  // Function to close confirmation dialog
  const closeConfirmation = () => {
    setConfirmationDialog({ 
      isOpen: false, 
      subjectId: null, 
      classCategoryId: null, 
      subjectName: '', 
      currentStatus: false, 
      action: '',
      salaryData: null,
      applicationId: null,
    });
  };

  // Function to close salary dialog
  const closeSalaryDialog = () => {
    setSalaryDialog({
      isOpen: false,
      subjectId: null,
      classCategoryId: null,
      subjectName: '',
      applicationId: null,
      isEdit: false,
      applicationData: null,
    });
  };

  // Updated handleApply function with better debugging
  const handleApply = async (subjectId, classCategoryId, subjectName, currentStatus = false, salaryData = null, applicationId = null, action = 'apply') => {
    try {
      let response;
      console.log("=== handleApply Debug ===");
      console.log("currentStatus:", currentStatus);
      console.log("action:", action);
      console.log("applicationId:", applicationId);
      console.log("salaryData:", salaryData);
      
      // Fixed condition logic
      if (applicationId && (currentStatus=== false || action === 'update' || action ==='revoke')) {
        console.log("🔄 Using PATCH/PUT for update/revoke");
        console.log("salaryData for update/revoke:", salaryData);

        // Find the current application data to preserve existing values for revoke
        const currentApplication = jobApply?.find(item => item.id === applicationId);
        
        // Extract teacher_job_type IDs properly
        const getTeacherJobTypeIds = (teacherJobType) => {
          if (!teacherJobType) return [jobTypes?.[0]?.id || 1]; // Use first available job type or fallback
          
          // If it's already an array of numbers, return it
          if (Array.isArray(teacherJobType) && typeof teacherJobType[0] === 'number') {
            return teacherJobType;
          }
          
          // If it's an array of objects, extract IDs
          if (Array.isArray(teacherJobType) && typeof teacherJobType[0] === 'object') {
            return teacherJobType.map(item => item.id);
          }
          
          // If it's a single number, wrap in array
          if (typeof teacherJobType === 'number') {
            return [teacherJobType];
          }
          
          return [jobTypes?.[0]?.id || 1]; // Default fallback
        };
        
        // Use PATCH/PUT for updating existing applications (revoke or update salary)
        const updatePayload = {
          class_category: classCategoryId,
          subject: subjectId,
          teacher_job_type: action === 'revoke' 
            ? getTeacherJobTypeIds(currentApplication?.teacher_job_type)
            : getTeacherJobTypeIds(salaryData?.teacher_job_type),
          salary_expectation: action === 'revoke'
            ? (currentApplication?.salary_expectation || "10000")
            : (salaryData?.salary_expectation || "10000"),
          salary_type: action === 'revoke'
            ? (currentApplication?.salary_type || "monthly")
            : (salaryData?.salary_type || "monthly"),
          status: action === 'revoke' ? false : true,
        };
        
        console.log("PATCH/PUT payload:", updatePayload);
        console.log("Action:", action);
        console.log("Current application data:", currentApplication);
        
        response = await updateJobApply(applicationId, updatePayload);
        console.log("PATCH/PUT response:", response);
      } else {
        // Use POST for new applications
        console.log("📝 Using POST for new application");
        console.log("salaryData for POST:", salaryData);
        
        if (!salaryData) {
          console.error("❌ No salary data provided for new application");
          toast.error("Salary data is required for new applications");
          return;
        }
        
        const payload = {
          subject: subjectId,
          class_category: classCategoryId,
          teacher_job_type: salaryData?.teacher_job_type || [jobTypes?.[0]?.id || 1],
          salary_expectation: salaryData?.salary_expectation || "10000",
          salary_type: salaryData?.salary_type || "monthly",
          status: true,
        };

        console.log("POST payload:", JSON.stringify(payload, null, 2));
        response = await dispatch(postJobApply(payload)).unwrap();
        console.log("✅ POST response:", JSON.stringify(response, null, 2));
      }

      // Check if we got a valid response
      if (!response) {
        console.error("❌ No response from API");
        toast.error("No response from server. Please try again.");
        return;
      }

      console.log("🔄 About to refetch job apply data...");
      console.log("Current jobApply before refetch:", jobApply);
      
      // Refetch the job apply data to get updated status
      const refetchResult = await refetchJobApply();
      console.log("✅ Refetch completed with result:", refetchResult);
      console.log("Updated jobApply after refetch:", refetchResult.data);

      // Remove location warning if application is successful
      setShowLocationFirst(false);

      // Show appropriate success message based on action
      let actionText, messageText;
      if (action === 'revoke') {
        actionText = "Application Cancelled";
        messageText = `You've cancelled your application for ${subjectName}`;
      } else if (action === 'update') {
        actionText = "Salary Updated";
        messageText = `You've updated salary details for ${subjectName}`;
      } else {
        actionText = "Application Successful";
        messageText = `You've applied for ${subjectName}`;
      }

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

      // Add a delay and check the data again
      setTimeout(() => {
        console.log("🕐 Data after 2 second delay:", jobApply);
      }, 2000);

    } catch (error) {
      console.error("❌ Application error:", error);
      
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
    <div className="max-w-8xl mx-auto">
      {/* Page header */}
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-text">
          Job Applications
          <span className="ml-2 text-secondary text-sm font-normal">/ नौकरी आवेदन</span>
        </h1>
        <p className="mt-2 text-sm text-secondary">Apply to eligible subjects after setting your job preference location and salary expectations.</p>
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
              console.log('exam', exam);
              
              const subjectId = exam.subject_id;
              const classCategoryId = exam.class_category_id;
              const subjectName = exam.subject_name;
              const className = exam.class_category_name;
              
              console.log('Processing exam:', { subjectId, classCategoryId, subjectName, className });
              console.log("jobApply data:", jobApply);
              
              // Fixed matching logic based on your actual API structure
              const applicationData = jobApply?.find(item => {
                console.log('Checking application item:', item);
                
                // Try different possible structures for matching
                let subjectMatch = false;
                let categoryMatch = false;
                
                // Method 1: Direct ID comparison (if API returns direct IDs)
                if (item.subject === subjectId || item.subject_id === subjectId) {
                  subjectMatch = true;
                }
                
                if (item.class_category === classCategoryId || item.class_category_id === classCategoryId) {
                  categoryMatch = true;
                }
                
                // Method 2: If subject/class_category are objects with id property
                if (item.subject?.id === subjectId) {
                  subjectMatch = true;
                }
                
                if (item.class_category?.id === classCategoryId) {
                  categoryMatch = true;
                }
                
                // Method 3: If class_category has nested subjects array
                if (item.class_category?.subjects) {
                  const hasSubject = item.class_category.subjects.some(sub => 
                    (typeof sub === 'object' ? sub.id === subjectId : sub === subjectId)
                  );
                  if (hasSubject && item.class_category.id === classCategoryId) {
                    subjectMatch = true;
                    categoryMatch = true;
                  }
                }
                
                console.log('Match results:', {
                  item,
                  subjectId,
                  classCategoryId,
                  subjectMatch,
                  categoryMatch,
                  finalMatch: subjectMatch && categoryMatch
                });
                
                return subjectMatch && categoryMatch;
              });
              
              console.log('Final applicationData for', subjectName, ':', applicationData);
              
              const applicationStatus = applicationData?.status || false;
              const applicationId = applicationData?.id;
              
              console.log('Application status:', { applicationStatus, applicationId });

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

                  {/* Show salary details if applied */}
                  {applicationStatus && applicationData && (
                    <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <HiOutlineCurrencyDollar className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-primary">Salary Details</span>
                      </div>
                      <div className="text-sm">
                        {applicationData.salary_expectation ? (
                          <>₹{applicationData.salary_expectation} ({applicationData.salary_type})</>
                        ) : (
                          <span className="text-error">Salary not set</span>
                        )}
                      </div>
                      <div className="text-xs text-secondary mt-1">
                        Job Type: {applicationData.teacher_job_type && Array.isArray(applicationData.teacher_job_type) && applicationData.teacher_job_type.length > 0 
                          ? getJobTypeName(getJobTypeId(applicationData.teacher_job_type))
                          : 'Not specified'}
                      </div>
                    </div>
                  )}

                  {/* Action buttons - Updated for toggle functionality */}
                  <div className={`flex gap-2 ${applicationStatus ? 'flex-col sm:flex-row' : ''}`}>
                    {applicationStatus ? (
                      <>
                        {/* Update Salary Button */}
                        <button
                          onClick={() => showSalaryDialog(subjectId, classCategoryId, subjectName, applicationId, true, applicationData)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                        >
                          <HiOutlinePencilSquare className="h-4 w-4 mr-2" />
                          Update Salary
                        </button>
                        
                        {/* Revoke Application Button */}
                        <button
                          onClick={() => showRevokeConfirmation(subjectId, classCategoryId, subjectName, applicationId)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-error hover:bg-error/90 rounded-lg transition-colors"
                        >
                          <HiOutlineXCircle className="h-4 w-4 mr-2" />
                          Revoke
                        </button>
                      </>
                    ) : (
                      /* Apply Button */
                      <button
                        onClick={() => showSalaryDialog(subjectId, classCategoryId, subjectName, applicationId)}
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors"
                      >
                        <HiOutlineCurrencyDollar className="h-4 w-4 mr-2" />
                        Set Salary & Apply
                      </button>
                    )}
                  </div>
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

      {/* Salary Dialog */}
      <SalaryDialog
        isOpen={salaryDialog.isOpen}
        onClose={closeSalaryDialog}
        onConfirm={handleSalaryConfirmation}
        subjectName={salaryDialog.subjectName}
        applicationData={salaryDialog.applicationData}
        isEdit={salaryDialog.isEdit}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={closeConfirmation}
        onConfirm={handleConfirmation}
        subjectName={confirmationDialog.subjectName}
        action={confirmationDialog.action}
        currentStatus={confirmationDialog.currentStatus}
        salaryData={confirmationDialog.salaryData}
      />
    </div>
  );
};

export default JobApply;

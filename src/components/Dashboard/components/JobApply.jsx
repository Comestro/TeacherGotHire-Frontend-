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

  // Helper function to get job type ID from teacher_job_type array or single value
  const getJobTypeId = (teacherJobType) => {
    if (!teacherJobType) return null;

    let item = teacherJobType;

    // If it's an array, take the first item
    if (Array.isArray(teacherJobType)) {
      if (teacherJobType.length === 0) return null;
      item = teacherJobType[0];
    }

    // If it's an object, extract the ID
    if (typeof item === 'object' && item !== null) {
      return item.id || item;
    }

    // If it's already a number/string, return it
    return item;
  };

  // Updated Salary Dialog Component with dynamic job types
  const SalaryDialog = ({ isOpen, onClose, onConfirm, subjectName, applicationData, isEdit }) => {
    const [selectedJobTypes, setSelectedJobTypes] = useState([]);
    const [salaryDetails, setSalaryDetails] = useState({});

    // Initialize state when dialog opens
    useEffect(() => {
      if (isOpen) {
        if (isEdit && Array.isArray(applicationData) && applicationData.length > 0) {
          // Parse existing data from multiple application entries
          let initialJobTypes = [];
          let initialSalaryDetails = {};

          applicationData.forEach(app => {
            const jobId = getJobTypeId(app.teacher_job_type);
            if (jobId) {
              initialJobTypes.push(jobId);
              initialSalaryDetails[jobId] = {
                amount: app.salary_expectation,
                type: app.salary_type || 'monthly'
              };
            }
          });

          setSelectedJobTypes(initialJobTypes);
          setSalaryDetails(initialSalaryDetails);
        } else {
          // Reset for new application
          setSelectedJobTypes([]);
          setSalaryDetails({});
        }
      }
    }, [isOpen, isEdit, applicationData]);

    if (!isOpen) return null;

    const handleJobTypeToggle = (jobTypeId) => {
      setSelectedJobTypes(prev => {
        if (prev.includes(jobTypeId)) {
          const newTypes = prev.filter(id => id !== jobTypeId);
          // Clean up salary details for unselected type
          const newDetails = { ...salaryDetails };
          delete newDetails[jobTypeId];
          setSalaryDetails(newDetails);
          return newTypes;
        } else {
          return [...prev, jobTypeId];
        }
      });
    };

    const handleSalaryChange = (jobTypeId, field, value) => {
      setSalaryDetails(prev => ({
        ...prev,
        [jobTypeId]: {
          ...prev[jobTypeId],
          [field]: value
        }
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();

      if (selectedJobTypes.length === 0) {
        toast.error("Please select at least one job type");
        return;
      }

      // Validate all selected types have salary
      for (const jobId of selectedJobTypes) {
        if (!salaryDetails[jobId]?.amount || parseFloat(salaryDetails[jobId].amount) <= 0) {
          const jobName = getJobTypeName(jobId);
          toast.error(`Please enter a valid salary for ${jobName}`);
          return;
        }
      }

      // Construct payload data
      // We'll send the raw maps to handleApply, which will format them for the API
      const salaryData = {
        teacher_job_type: selectedJobTypes,
        salary_details: salaryDetails // This contains both amount and type per job ID
      };

      onConfirm(salaryData);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto py-10">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b">
            <div className="p-2 rounded-full bg-primary/10">
              <HiOutlineCurrencyDollar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-text">
              {isEdit ? 'Update Salary Details' : 'Salary Details'}
            </h3>
          </div>

          <p className="text-sm text-secondary mb-6">
            {isEdit ? 'Update your salary expectations for' : 'Set your salary expectations for'} <strong>{subjectName}</strong>.
            You can select multiple job types and set different expectations for each.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Job Types Selection */}
            <div>
              <label className="block text-sm font-medium text-text mb-3">
                Select Job Types <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {jobTypesStatus === 'loading' ? (
                  <p className="text-sm text-gray-500">Loading job types...</p>
                ) : jobTypes && jobTypes.length > 0 ? (
                  jobTypes.map((jobType) => (
                    <div
                      key={jobType.id}
                      className={`relative flex items-start p-3 rounded-lg border cursor-pointer transition-all ${selectedJobTypes.includes(jobType.id)
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-gray-200 hover:border-primary/50'
                        }`}
                      onClick={() => handleJobTypeToggle(jobType.id)}
                    >
                      <div className="flex h-5 items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={selectedJobTypes.includes(jobType.id)}
                          onChange={() => { }} // Handled by parent div click
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label className="font-medium text-gray-900 cursor-pointer">
                          {jobType.teacher_job_name}
                        </label>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-error">No job types available</p>
                )}
              </div>
            </div>

            {/* Dynamic Salary Inputs */}
            {selectedJobTypes.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900">Salary Expectations</h4>

                {selectedJobTypes.map(jobId => {
                  const jobName = getJobTypeName(jobId);
                  return (
                    <div key={jobId} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h5 className="text-sm font-semibold text-gray-800 mb-3">{jobName}</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Expected Amount <span className="text-error">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">₹</span>
                            <input
                              type="number"
                              placeholder="25000"
                              value={salaryDetails[jobId]?.amount || ''}
                              onChange={(e) => handleSalaryChange(jobId, 'amount', e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                              min="1"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Payment Type <span className="text-error">*</span>
                          </label>
                          <select
                            value={salaryDetails[jobId]?.type || 'monthly'}
                            onChange={(e) => handleSalaryChange(jobId, 'type', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Payment Type</option>
                            <option value="monthly">Monthly</option>
                            <option value="daily">Daily</option>
                            <option value="hourly">Hourly</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
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
                {isEdit ? 'Update Details' : 'Continue to Apply'}
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
    const isRevoke = action === 'revoke';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden transform transition-all">
          <div className={`p-6 ${isRevoke ? 'bg-error/5' : 'bg-primary/5'} border-b ${isRevoke ? 'border-error/10' : 'border-primary/10'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${isRevoke ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                {isRevoke ? <HiOutlineXCircle className="h-8 w-8" /> : <HiOutlineCheckCircle className="h-8 w-8" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {isRevoke ? 'Revoke Application?' : 'Confirm Application'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isRevoke
                    ? `Are you sure you want to revoke your application for ${subjectName}?`
                    : `Please review your application details for ${subjectName}`
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!isRevoke && salaryData && salaryData.salary_details && (
              <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Salary Expectations</h4>
                <div className="space-y-3">
                  {Object.entries(salaryData.salary_details).map(([jobId, details]) => (
                    <div key={jobId} className="flex justify-between items-center pb-2 border-b border-gray-200 last:border-0 last:pb-0">
                      <span className="text-sm font-medium text-gray-700">{getJobTypeName(parseInt(jobId))}</span>
                      <span className="text-sm font-bold text-gray-900">
                        ₹{details.amount} <span className="text-xs font-normal text-gray-500">({details.type})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isRevoke && (
              <div className="mb-6 p-4 bg-orange-50 text-orange-800 text-sm rounded-lg border border-orange-100">
                <p className="flex items-start gap-2">
                  <HiOutlineExclamationTriangle className="h-5 w-5 flex-shrink-0" />
                  <span>This action will remove your application and you will no longer be considered for this position. You can re-apply later if needed.</span>
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${isRevoke
                  ? 'bg-error hover:bg-error/90 focus:ring-error'
                  : 'bg-primary hover:bg-primary/90 focus:ring-primary'
                  }`}
              >
                {isRevoke ? 'Yes, Revoke' : 'Confirm & Apply'}
              </button>
            </div>
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

  // Updated handleApply function to manage multiple API requests
  const handleApply = async (subjectId, classCategoryId, subjectName, currentStatus = false, salaryData = null, applicationId = null, action = 'apply') => {
    try {
      console.log("=== handleApply Sync Debug ===");
      console.log("Action:", action);
      console.log("Salary Data:", salaryData);

      // 1. Get all current applications for this subject/class
      // We need to refetch or filter from the latest jobApply state to be sure
      const currentApplications = jobApply?.filter(item => {
        const itemSubjectId = item.subject?.id || item.subject || item.subject_id;
        const itemClassId = item.class_category?.id || item.class_category || item.class_category_id;

        // Handle nested subject structure if needed
        let isSubjectMatch = itemSubjectId === subjectId;
        if (!isSubjectMatch && item.class_category?.subjects) {
          isSubjectMatch = item.class_category.subjects.some(sub =>
            (typeof sub === 'object' ? sub.id === subjectId : sub === subjectId)
          );
        }

        return isSubjectMatch && itemClassId === classCategoryId;
      }) || [];

      console.log("Current Applications for Subject:", currentApplications);

      const promises = [];
      const selectedJobTypes = salaryData?.teacher_job_type || [];
      const salaryDetails = salaryData?.salary_details || {};

      // 2. Handle Revoke All
      if (action === 'revoke') {
        // Revoke all active applications for this subject
        currentApplications.forEach(app => {
          if (app.status === true) {
            const jobId = getJobTypeId(app.teacher_job_type);
            promises.push(
              updateJobApply(app.id, {
                class_category: classCategoryId,
                subject: subjectId,
                teacher_job_type: jobId, // Send as single ID or array depending on backend, keeping consistent
                salary_expectation: app.salary_expectation,
                salary_type: app.salary_type || 'monthly',
                status: false
              })
            );
          }
        });
      } else {
        // 3. Handle Apply/Update (Sync Logic)

        // A. Process selected job types (Create or Update)
        selectedJobTypes.forEach(jobId => {
          const existingApp = currentApplications.find(app => getJobTypeId(app.teacher_job_type) === jobId);
          const salary = salaryDetails[jobId]?.amount || "10000";
          const type = salaryDetails[jobId]?.type || "monthly";

          if (existingApp) {
            // Update existing application if details changed or status is false
            if (existingApp.salary_expectation !== salary || existingApp.salary_type !== type || existingApp.status === false) {
              console.log(`Updating existing app ${existingApp.id} for job ${jobId}`);
              promises.push(
                updateJobApply(existingApp.id, {
                  class_category: classCategoryId,
                  subject: subjectId,
                  teacher_job_type: jobId,
                  salary_expectation: salary,
                  salary_type: type,
                  status: true
                })
              );
            }
          } else {
            // Create new application
            console.log(`Creating new app for job ${jobId}`);
            const payload = {
              subject: subjectId,
              class_category: classCategoryId,
              teacher_job_type: jobId, // Send single ID as requested
              salary_expectation: salary,
              salary_type: type,
              status: true,
            };
            promises.push(dispatch(postJobApply(payload)).unwrap());
          }
        });

        // B. Process unselected job types (Revoke if they exist and are active)
        currentApplications.forEach(app => {
          const jobId = getJobTypeId(app.teacher_job_type);
          if (!selectedJobTypes.includes(jobId) && app.status === true) {
            console.log(`Revoking unselected app ${app.id} for job ${jobId}`);
            promises.push(
              updateJobApply(app.id, {
                class_category: classCategoryId,
                subject: subjectId,
                teacher_job_type: jobId,
                salary_expectation: app.salary_expectation,
                salary_type: app.salary_type || 'monthly',
                status: false
              })
            );
          }
        });
      }

      // 4. Execute all requests
      if (promises.length === 0) {
        console.log("No changes detected");
        toast.info("No changes to save");
        return;
      }

      console.log(`Executing ${promises.length} requests...`);
      await Promise.all(promises);

      // 5. Refetch and Show Success
      await refetchJobApply();
      setShowLocationFirst(false);

      let messageText = action === 'revoke'
        ? `Cancelled applications for ${subjectName}`
        : `Successfully updated applications for ${subjectName}`;

      toast.success(
        <div>
          <div className="font-bold">Success</div>
          <div className="text-sm">{messageText}</div>
        </div>,
        { position: "top-right", className: "bg-green-50 text-green-800" }
      );

    } catch (error) {
      console.error("❌ Application error:", error);

      let errorMessage = "Please try again";
      if (error?.error) errorMessage = error.error;
      else if (error?.response?.data?.error) errorMessage = error.response.data.error;
      else if (error?.message) errorMessage = error.message;

      if (errorMessage.includes("job preference location")) {
        setShowLocationFirst(true);
        toast.error("Please set your job preference location first.");
        document.getElementById('job-preference-location')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        toast.error(errorMessage);
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
                const subjectId = exam.subject_id;
                const classCategoryId = exam.class_category_id;
                const subjectName = exam.subject_name;
                const className = exam.class_category_name;

                // Find ALL matching applications for this subject/class
                const applications = jobApply?.filter(item => {
                  let subjectMatch = false;
                  let categoryMatch = false;

                  // Check subject match
                  if (item.subject === subjectId || item.subject_id === subjectId || item.subject?.id === subjectId) {
                    subjectMatch = true;
                  }

                  // Check class category match
                  if (item.class_category === classCategoryId || item.class_category_id === classCategoryId || item.class_category?.id === classCategoryId) {
                    categoryMatch = true;
                  } else if (item.class_category?.subjects) {
                    // Nested subject check
                    const hasSubject = item.class_category.subjects.some(sub =>
                      (typeof sub === 'object' ? sub.id === subjectId : sub === subjectId)
                    );
                    if (hasSubject && item.class_category.id === classCategoryId) {
                      subjectMatch = true;
                      categoryMatch = true;
                    }
                  }

                  return subjectMatch && categoryMatch;
                }) || [];

                // Determine if applied (if any active application exists)
                const activeApplications = applications.filter(app => app.status === true);
                const isApplied = activeApplications.length > 0;

                return (
                  <div
                    key={`${subjectId}-${classCategoryId}-${index}`}
                    className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-5 ${isApplied
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
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${isApplied
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                        {isApplied ? 'Applied' : 'Eligible'}
                      </div>
                    </div>

                    {/* Status indicators */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <HiOutlineCheckCircle className="h-4 w-4 text-success" />
                        <span className="text-xs text-success font-medium">Eligible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isApplied ? (
                          <>
                            <HiOutlineCheckCircle className="h-4 w-4 text-success" />
                            <span className="text-xs text-success font-medium">Applied ({activeApplications.length} Roles)</span>
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
                    {isApplied && activeApplications.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <HiOutlineCurrencyDollar className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium text-primary">Salary Details</span>
                        </div>

                        {activeApplications.map((app, i) => {
                          const jobTypeId = getJobTypeId(app.teacher_job_type);
                          return (
                            <div key={app.id || i} className="p-2 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                              <div className="font-medium text-xs text-secondary mb-0.5">
                                {getJobTypeName(getJobTypeId(app.teacher_job_type))}
                              </div>
                              <div>
                                ₹{app.salary_expectation} <span className="text-xs text-secondary">({app.salary_type})</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className={`flex gap-2 ${isApplied ? 'flex-col sm:flex-row' : ''}`}>
                      {isApplied ? (
                        <>
                          {/* Update Salary Button */}
                          <button
                            onClick={() => showSalaryDialog(subjectId, classCategoryId, subjectName, null, true, activeApplications)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                          >
                            <HiOutlinePencilSquare className="h-4 w-4 mr-2" />
                            Update Salary
                          </button>

                          {/* Revoke Application Button */}
                          <button
                            onClick={() => showRevokeConfirmation(subjectId, classCategoryId, subjectName, activeApplications)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-error hover:bg-error/90 rounded-lg transition-colors"
                          >
                            <HiOutlineXCircle className="h-4 w-4 mr-2" />
                            Revoke
                          </button>
                        </>
                      ) : (
                        /* Apply Button */
                        <button
                          onClick={() => showSalaryDialog(subjectId, classCategoryId, subjectName, null)}
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
              <h3 className="font-bold text-xl mb-2 text-text">
                No eligible subjects
                <span className="ml-2 text-secondary text-sm font-normal">/ कोई पात्र विषय नहीं</span>
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                You don't have any eligible subjects to apply for at the moment. Please complete your qualifications to become eligible for job applications.
              </p>
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

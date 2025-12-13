import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { postJobApply } from "../../../features/examQuesSlice";
import { getTeacherjobType } from "../../../features/jobProfileSlice";
import { updateJobApply } from "../../../services/examQuesServices";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JobLocationSelector from "./JobLocationSelector";
import { useGetApplyEligibilityQuery, useGetJobsApplyDetailsQuery } from "../../../features/api/apiSlice";
import { 
  HiOutlineCurrencyDollar, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle, 
  HiOutlineExclamationTriangle, 
  HiOutlineInformationCircle,
  HiOutlinePencilSquare
} from "react-icons/hi2";


const getJobTypeId = (jobType) => {
  if (typeof jobType === 'object' && jobType !== null) {
    return jobType.id;
  }
  return jobType;
};

const getJobTypeName = (jobTypes, id) => {
  const type = jobTypes?.find(t => t.id === parseInt(id));
  return type ? type.teacher_job_name : 'Unknown Job Type';
};

// Inline Application Form Component - Extracted
const ApplicationForm = ({ onCancel, onConfirm, subjectName, applicationData, isEdit, jobTypes, jobTypesStatus }) => {
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [salaryDetails, setSalaryDetails] = useState({});
  const [jobTypeLocations, setJobTypeLocations] = useState({});

  // Initialize state when component mounts
  useEffect(() => {
    if (isEdit && Array.isArray(applicationData) && applicationData.length > 0) {
      // Parse existing data from multiple application entries
      let initialJobTypes = [];
      let initialSalaryDetails = {};
      let initialLocations = {};

      applicationData.forEach(app => {
        const jobId = getJobTypeId(app.teacher_job_type);
        if (jobId) {
          initialJobTypes.push(jobId);
          initialSalaryDetails[jobId] = {
            amount: app.salary_expectation,
            type: app.salary_type || 'monthly'
          };
          initialLocations[jobId] = app.preferred_locations || [];
        }
      });

      setSelectedJobTypes(initialJobTypes);
      setSalaryDetails(initialSalaryDetails);
      setJobTypeLocations(initialLocations);
    } else {
      // Reset for new application
      setSelectedJobTypes([]);
      setSalaryDetails({});
      setJobTypeLocations({});
    }
  }, [isEdit, applicationData]);
  
  const handleJobTypeToggle = (jobTypeId) => {
    setSelectedJobTypes(prev => {
      if (prev.includes(jobTypeId)) {
        const newTypes = prev.filter(id => id !== jobTypeId);
        // Clean up salary details and locations for unselected type
        const newDetails = { ...salaryDetails };
        delete newDetails[jobTypeId];
        setSalaryDetails(newDetails);
        
        const newLocations = { ...jobTypeLocations };
        delete newLocations[jobTypeId];
        setJobTypeLocations(newLocations);
        
        return newTypes;
      } else {
        return [...prev, jobTypeId];
      }
    });
  };

  const handleLocationChange = (jobTypeId, locations) => {
    setJobTypeLocations(prev => ({
      ...prev,
      [jobTypeId]: locations
    }));
  };

  const handleSalaryChange = (jobId, field, value) => {
    setSalaryDetails(prev => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
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
        const jobName = getJobTypeName(jobTypes, jobId);
        toast.error(`Please enter a valid salary for ${jobName}`);
        return;
      }
    }

    // Construct payload data
    const salaryData = {
      teacher_job_type: selectedJobTypes,
      salary_details: salaryDetails,
      job_type_locations: jobTypeLocations
    };

    onConfirm(salaryData);
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-6 animate-fadeIn">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-full bg-primary/10">
          <HiOutlineCurrencyDollar className="h-5 w-5 text-primary" />
        </div>
        <h3 className="ml-3 text-base font-semibold text-text">
          {isEdit ? 'Update Application Details' : 'Application Details'}
        </h3>
      </div>

      <p className="text-sm text-secondary mb-6 ml-1">
        {isEdit ? 'Update your preferences for' : 'Select job types and set preferences for'} <strong>{subjectName}</strong>.
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

        {/* Dynamic Salary Inputs & Locations */}
        {selectedJobTypes.length > 0 && (
          <div className="space-y-6 border-t border-dashed border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900">Preferences by Job Type</h4>

            {selectedJobTypes.map(jobId => {
              const jobName = getJobTypeName(jobTypes, jobId);
              return (
                <div key={jobId} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h5 className="text-sm font-semibold text-gray-800 mb-3">{jobName}</h5>
                  
                  {/* Salary Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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

                  {/* Location Selector */}
                  <div className="border-t border-gray-200 pt-3">
                    <JobLocationSelector
                      jobType={jobName}
                      locations={jobTypeLocations[jobId] || []}
                      onChange={(newLocations) => handleLocationChange(jobId, newLocations)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={jobTypesStatus === 'loading'}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? 'Update details & Apply' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

const JobApply = () => {
  const dispatch = useDispatch();
  const { teacherjobRole: jobTypes, status: jobTypesStatus } = useSelector((state) => state.jobProfile);

  useEffect(() => {
    if (jobTypesStatus === 'idle') {
      dispatch(getTeacherjobType());
    }
  }, [jobTypesStatus, dispatch]);
  
  const [expandedForm, setExpandedForm] = useState({
    subjectId: null,
    classCategoryId: null,
    isEdit: false,
    applicationData: null,
  });



  // ConfirmationDialog component removed as per rework


  // Get eligibility data using the new endpoint
  const { data: eligibilityData, isLoading: isEligibilityLoading, error: eligibilityError } = useGetApplyEligibilityQuery();
  const { data: jobApply, isLoading: isJobApplyLoading, refetch: refetchJobApply } = useGetJobsApplyDetailsQuery();

  // Extract eligible exams from the new response structure
  const eligibleExams = eligibilityData?.qualified_list ?
    eligibilityData.qualified_list.filter(exam => exam.eligible === true) : [];

  // Function to show/expand inline application form
  const handleExpandForm = (subjectId, classCategoryId, isEdit = false, applicationData = null, subjectName = '') => {
    setExpandedForm({
      subjectId,
      classCategoryId,
      isEdit,
      applicationData,
      subjectName,
    });
  };

  // Function to collapse inline form
  const handleCollapseForm = () => {
    setExpandedForm({
      subjectId: null,
      classCategoryId: null,
      isEdit: false,
      applicationData: null,
      subjectName: '',
    });
  };

  // Handle form submission directly
  const handleFormSubmit = async (salaryData) => {
    const { subjectId, classCategoryId, isEdit, subjectName } = expandedForm;
    await handleApply(subjectId, classCategoryId, subjectName, false, salaryData, null, isEdit ? 'update' : 'apply');
    handleCollapseForm();
  };

  // Handle simple revoke with window confirmation
  const handleRevoke = async (subjectId, classCategoryId, subjectName) => {
    if (window.confirm(`Are you sure you want to revoke your application for ${subjectName}?`)) {
      await handleApply(subjectId, classCategoryId, subjectName, true, null, null, 'revoke');
    }
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

      const promises = [];
      const selectedJobTypes = salaryData?.teacher_job_type || [];
      const salaryDetails = salaryData?.salary_details || {};

      console.log("DEBUG: Current Applications:", JSON.parse(JSON.stringify(currentApplications)));
      console.log("DEBUG: Selected Job Types:", selectedJobTypes);

      console.log("Current Applications for Subject:", currentApplications);


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
          console.log(`DEBUG: Checking Job ID ${jobId}. Existing App Found:`, existingApp ? existingApp.id : 'No');

          const salary = salaryDetails[jobId]?.amount || "10000";
          const type = salaryDetails[jobId]?.type || "monthly";

          if (existingApp) {
            // Update existing application if details changed or status is false
            const newLocations = salaryData?.job_type_locations?.[jobId] || [];
            const oldLocations = existingApp.preferred_locations || [];
            
            // Simple comparison using JSON stringify (assuming data structure consistency)
            const isLocationChanged = JSON.stringify(newLocations) !== JSON.stringify(oldLocations);

            if (existingApp.salary_expectation !== salary || existingApp.salary_type !== type || existingApp.status === false || isLocationChanged) {
              console.log(`Updating existing app ${existingApp.id} for job ${jobId}`);
              promises.push(
                updateJobApply(existingApp.id, {
                  class_category: classCategoryId,
                  subject: subjectId,
                  teacher_job_type: jobId,
                  salary_expectation: salary,
                  salary_type: type,
                  status: true,
                  status: true,
                  preferred_locations: newLocations.map(loc => ({
                    state: loc.state,
                    district: loc.district,
                    pincode: loc.pincode,
                    post_office: loc.post_office,
                    area: loc.area || ""
                  }))
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
              status: true,
              preferred_locations: (salaryData?.job_type_locations?.[jobId] || []).map(loc => ({
                state: loc.state,
                district: loc.district,
                pincode: loc.pincode,
                post_office: loc.post_office,
                area: loc.area || ""
              }))
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
        toast.error("Please set your job preference location in the application form.");
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
        <p className="mt-0 text-sm text-slate-500">Apply to eligible subjects by setting your preferences directly below.</p>
      </header>

      {/* Main Content - Full Width Grid */}
      <div className="w-full">
        {eligibleExams && eligibleExams.length > 0 ? (
          <div className="flex flex-col gap-6">
            
            {/* Info Banner */}
            <div className="p-5 bg-primary/5 border border-primary/20 text-text rounded-xl flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <HiOutlineInformationCircle className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-text mb-1">Eligible subjects for application
                  <span className="ml-2 text-secondary text-sm font-normal">/ आवेदन हेतु पात्र विषय</span>
                </h3>
                <p className="text-sm text-secondary">Below are the subjects you're eligible to apply for based on your qualification. Click "Set Salary & Apply" to proceed.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
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
                    className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-6 ${isApplied
                      ? 'border-success/30 bg-success/5'
                      : 'border-slate-200'
                      }`}
                  >
                    {/* Header with subject and class */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-xl text-gray-900">
                            {subjectName}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isApplied
                          ? 'bg-success/10 text-success border border-success/20'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                          {isApplied ? 'Applied' : 'Eligible'}
                        </span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                          {className}
                        </p>
                      </div>
                      
                      {/* Status indicators moved to header on desktop */}
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50/50 border border-green-100">
                          <HiOutlineCheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">Qualification Matched</span>
                        </div>
                      </div>
                    </div>

                    {/* Show salary details if applied */}
                    {isApplied && activeApplications.length > 0 && (
                      <div className="mb-6">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Current Application Details</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activeApplications.map((app, i) => {
                          const jobTypeId = getJobTypeId(app.teacher_job_type);
                          return (
                            <div key={app.id || i} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                              <div className="font-medium text-sm text-gray-900 mb-1">
                                {getJobTypeName(jobTypes, getJobTypeId(app.teacher_job_type))}
                              </div>
                              <div className="text-sm text-slate-600 mb-1">
                                <span className="font-semibold text-gray-900">₹{app.salary_expectation}</span> 
                                <span className="text-xs ml-1">({app.salary_type})</span>
                              </div>
                              {app.preferred_locations && app.preferred_locations.length > 0 && (
                                <div className="text-xs text-slate-500">
                                  <span className="font-medium text-slate-700">Locations: </span>
                                  {app.preferred_locations.map(l => l.district).join(", ")}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        </div>
                      </div>
                    )}

                  {/* Use a wrapper to control transitions if needed, but for now direct render */}
                  {expandedForm.subjectId === subjectId && expandedForm.classCategoryId === classCategoryId ? (
                      <ApplicationForm
                        isEdit={expandedForm.isEdit}
                        applicationData={expandedForm.applicationData}
                        subjectName={subjectName}
                        onConfirm={handleFormSubmit}
                        onCancel={handleCollapseForm}
                        jobTypes={jobTypes}
                        jobTypesStatus={jobTypesStatus}
                      />
                  ) : (
                    /* Only show action buttons if form is NOT expanded */
                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100 mt-2">
                      {isApplied ? (
                        <>
                          <button
                            onClick={() => handleExpandForm(subjectId, classCategoryId, true, activeApplications, subjectName)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <HiOutlinePencilSquare className="h-4 w-4 mr-2" />
                            Update Salary & Preferences
                          </button>

                          <button
                            onClick={() => handleRevoke(subjectId, classCategoryId, subjectName)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <HiOutlineXCircle className="h-4 w-4 mr-2" />
                            Revoke Application
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleExpandForm(subjectId, classCategoryId, false, null, subjectName)}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all"
                        >
                          <HiOutlineCurrencyDollar className="h-5 w-5 mr-2" />
                          Set Salary & Apply
                        </button>
                      )}
                    </div>
                  )}

                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="p-4 bg-yellow-50 rounded-full mb-6">
                <HiOutlineInformationCircle className="h-10 w-10 text-yellow-600" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">
                No eligible subjects found
                <span className="block mt-1 text-base font-normal text-slate-500">कोई पात्र विषय नहीं</span>
              </h3>
              <p className="text-slate-600 leading-relaxed">
                You don't have any eligible subjects to apply for at the moment. Please update your qualifications in your profile to become eligible for job applications.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default JobApply;

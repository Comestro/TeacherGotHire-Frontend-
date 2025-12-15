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
  HiOutlinePencilSquare,
  HiCurrencyRupee
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
const ApplicationForm = ({ onCancel, onConfirm, subjectName, applicationData, isEdit, jobTypes, jobTypesStatus }) => {
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [salaryDetails, setSalaryDetails] = useState({});
  const [jobTypeLocations, setJobTypeLocations] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  useEffect(() => {
    if (jobTypes && jobTypes.length > 0 && !activeTab) {
      setActiveTab(jobTypes[0].id);
    }

    if (isEdit && Array.isArray(applicationData) && applicationData.length > 0) {
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
    }
  }, [isEdit, applicationData, jobTypes]);
  
  const handleJobTypeToggle = (jobTypeId) => {
    setSelectedJobTypes(prev => {
      if (prev.includes(jobTypeId)) {
        const newTypes = prev.filter(id => id !== jobTypeId);
        
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
        ...prev[jobId] || { type: 'monthly' }, // Ensure object exists
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e && e.preventDefault(); // Handle if e is missing for button click

    if (selectedJobTypes.length === 0) {
      toast.error("Please select at least one job type to apply for.");
      return;
    }
    for (const jobId of selectedJobTypes) {
      if (!salaryDetails[jobId]?.amount || parseFloat(salaryDetails[jobId].amount) <= 0) {
        const jobName = getJobTypeName(jobTypes, jobId);
        toast.error(`Please enter a valid salary for ${jobName}`);
        setActiveTab(jobId);
        return;
      }
      const locations = jobTypeLocations[jobId] || [];
       if (locations.length === 0) {
          const jobName = getJobTypeName(jobTypes, jobId);
          toast.warning(`You haven't selected any location preference for ${jobName}. Defaulting to state/district if any.`);
       }
    }
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

      <div className="space-y-6">
        {/* Job Tabs */}
        {jobTypesStatus === 'loading' ? (
           <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <div>
            <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto pb-1 mb-4 no-scrollbar">
              {jobTypes && jobTypes.map((jobType) => {
                 const isSelected = selectedJobTypes.includes(jobType.id);
                 const isActive = activeTab === jobType.id;
                 return (
                   <button
                     key={jobType.id}
                     type="button"
                     onClick={() => setActiveTab(jobType.id)}
                     className={`
                       whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg transition-all relative
                       ${isActive 
                         ? 'text-primary bg-primary/5 border-b-2 border-primary z-10' 
                         : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                       }
                     `}
                   >
                     <div className="flex items-center gap-2">
                       {isSelected && <HiOutlineCheckCircle className="text-success h-4 w-4" />}
                       {jobType.teacher_job_name}
                     </div>
                   </button>
                 );
              })}
            </div>

            {/* Tab Content */}
            {activeTab && (
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 min-h-[300px] animate-in fade-in duration-200">
                {(() => {
                   const currentJob = jobTypes?.find(j => j.id === activeTab);
                   const isApplying = selectedJobTypes.includes(activeTab);
                   
                   if (!currentJob) return null;

                   return (
                     <div className="space-y-6">
                       
                       {/* Checkbox Toggle for Tab */}
                       <div className="flex md:flex-row flex-col md:items-center items-start justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                         <div>
                            <h4 className="font-semibold text-gray-900 text-base">{currentJob.teacher_job_name}</h4>
                            <p className="text-sm text-gray-500">Do you want to apply for this job type?</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={isApplying} 
                              onChange={() => handleJobTypeToggle(activeTab)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900">{isApplying ? 'Yes, Apply' : 'No'}</span>
                          </label>
                       </div>

                       {isApplying ? (
                         <div className="block animate-in slide-in-from-top-2 duration-200 space-y-6">
                            {/* Salary Inputs */}
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
                                    value={salaryDetails[activeTab]?.amount || ''}
                                    onChange={(e) => handleSalaryChange(activeTab, 'amount', e.target.value)}
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
                                  value={salaryDetails[activeTab]?.type || 'monthly'}
                                  onChange={(e) => handleSalaryChange(activeTab, 'type', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                  <option value="monthly">Monthly</option>
                                  <option value="daily">Daily</option>
                                  <option value="hourly">Hourly</option>
                                </select>
                              </div>
                            </div>
          
                            {/* Location Selector */}
                            <div className="border-t border-gray-200/60 pt-4">
                              <JobLocationSelector
                                jobType={currentJob.teacher_job_name}
                                locations={jobTypeLocations[activeTab] || []}
                                onChange={(newLocations) => handleLocationChange(activeTab, newLocations)}
                              />
                            </div>
                         </div>
                       ) : (
                         <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                            <span className="block text-sm">Toggle "Yes" above to configure preferences for {currentJob.teacher_job_name}</span>
                         </div>
                       )}

                     </div>
                   );
                })()}
              </div>
            )}
          </div>
        )}
      </div>


        <div className="flex gap-3 flex-col md:flex-row pt-4 border-t border-gray-100">
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
const ApplicationSummary = ({ applications, jobTypes }) => {
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (applications && applications.length > 0 && !activeTab) {
      setActiveTab(getJobTypeId(applications[0].teacher_job_type));
    }
  }, [applications]);

  if (!applications || applications.length === 0) return null;

  return (
    <div className="mb-6 bg-gray-50/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
         <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Current Applications</h4>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
        {applications.map((app) => {
          const jobId = getJobTypeId(app.teacher_job_type);
          const jobName = getJobTypeName(jobTypes, jobId);
          const isActive = activeTab === jobId;
          
          return (
            <button
              key={jobId}
              onClick={() => setActiveTab(jobId)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive 
                  ? 'border-primary text-primary bg-primary/5' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {jobName}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-5">
        {applications.map((app) => {
          const jobId = getJobTypeId(app.teacher_job_type);
          if (activeTab !== jobId) return null;

          return (
            <div key={app.id} className="animate-in fade-in duration-200">
               <div className="flex flex-wrap gap-6 mb-6">
                 <div>
                   <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">Expected Salary</span>
                   <span className="text-lg font-bold text-gray-900">₹{app.salary_expectation}</span>
                   <span className="text-sm text-gray-500 ml-1">/ {app.salary_type}</span>
                 </div>
                 
                 <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                 </div>
               </div>

               <div>
                 <span className="text-xs font-semibold text-gray-400 uppercase block mb-3">Preferred Locations</span>
                 {app.preferred_locations && app.preferred_locations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {app.preferred_locations.map((loc, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                           <div className="font-medium text-gray-900 mb-0.5">
                             {loc.state ? <span className="text-gray-600 font-normal">{loc.state}, </span> : ''}
                             {loc.district}
                           </div>
                           <div className="text-gray-500 text-xs">
                             {loc.post_office} {loc.pincode && `- ${loc.pincode}`}
                           </div>
                           {loc.area && <div className="text-gray-400 text-xs mt-0.5">{loc.area}</div>}
                        </div>
                      ))}
                    </div>
                 ) : (
                   <p className="text-sm text-gray-500 italic">No specific locations set (Anywhere in state)</p>
                 )}
               </div>
            </div>
          );
        })}
      </div>
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
  const { data: eligibilityData, isLoading: isEligibilityLoading, error: eligibilityError } = useGetApplyEligibilityQuery();

  const { data: jobApply, isLoading: isJobApplyLoading, error: jobApplyError, refetch: refetchJobApply } = useGetJobsApplyDetailsQuery();
  const eligibleExams = eligibilityData?.qualified_list ?
    eligibilityData.qualified_list.filter(exam => exam.eligible === true) : [];
  const handleExpandForm = (subjectId, classCategoryId, isEdit = false, applicationData = null, subjectName = '') => {
    setExpandedForm({
      subjectId,
      classCategoryId,
      isEdit,
      applicationData,
      subjectName,
    });
  };
  const handleCollapseForm = () => {
    setExpandedForm({
      subjectId: null,
      classCategoryId: null,
      isEdit: false,
      applicationData: null,
      subjectName: '',
    });
  };
  const handleFormSubmit = async (salaryData) => {
    const { subjectId, classCategoryId, isEdit, subjectName } = expandedForm;
    await handleApply(subjectId, classCategoryId, subjectName, false, salaryData, null, isEdit ? 'update' : 'apply');
    handleCollapseForm();
  };
  const handleRevoke = async (subjectId, classCategoryId, subjectName) => {
    if (window.confirm(`Are you sure you want to withdraw your application for ${subjectName}? This action cannot be undone immediately.`)) {
      await handleApply(subjectId, classCategoryId, subjectName, true, null, null, 'revoke');
    }
  };
  const handleApply = async (subjectId, classCategoryId, subjectName, currentStatus = false, salaryData = null, applicationId = null, action = 'apply') => {
    try {
      console.log("=== handleApply Sync Debug ===");
      console.log("Action:", action);
      console.log("Salary Data:", salaryData);
      const currentApplications = jobApply?.filter(item => {
        const itemSubjectId = item.subject?.id || item.subject || item.subject_id;
        const itemClassId = item.class_category?.id || item.class_category || item.class_category_id;
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
      if (action === 'revoke') {
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
        selectedJobTypes.forEach(jobId => {
          const existingApp = currentApplications.find(app => getJobTypeId(app.teacher_job_type) === jobId);
          console.log(`DEBUG: Checking Job ID ${jobId}. Existing App Found:`, existingApp ? existingApp.id : 'No');

          const salary = salaryDetails[jobId]?.amount || "10000";
          const type = salaryDetails[jobId]?.type || "monthly";

          if (existingApp) {
            const newLocations = salaryData?.job_type_locations?.[jobId] || [];
            const oldLocations = existingApp.preferred_locations || [];
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
      if (promises.length === 0) {
        console.log("No changes detected");
        toast.info("No changes to save");
        return;
      }

      console.log(`Executing ${promises.length} requests...`);
      await Promise.all(promises);
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

  if (eligibilityError || jobApplyError || jobTypesStatus === 'failed') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-300 text-center">
          <div className="p-4 bg-red-50 rounded-full mb-4">
             <HiOutlineExclamationTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-500 max-w-md mb-6">
            We couldn't load some required data. Please check your internet connection and try again.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
             <span>Reload Page</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto">
      {/* Page header */}
      <header className="mb-5">
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
            
            

            <div className="grid grid-cols-1 gap-6">
              {eligibleExams.map((exam, index) => {
                const subjectId = exam.subject_id;
                const classCategoryId = exam.class_category_id;
                const subjectName = exam.subject_name;
                const className = exam.class_category_name;
                const applications = jobApply?.filter(item => {
                  let subjectMatch = false;
                  let categoryMatch = false;
                  if (item.subject === subjectId || item.subject_id === subjectId || item.subject?.id === subjectId) {
                    subjectMatch = true;
                  }
                  if (item.class_category === classCategoryId || item.class_category_id === classCategoryId || item.class_category?.id === classCategoryId) {
                    categoryMatch = true;
                  } else if (item.class_category?.subjects) {
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
                const activeApplications = applications.filter(app => app.status === true);
                const isApplied = activeApplications.length > 0;

                return (
                  <div
                    key={`${subjectId}-${classCategoryId}-${index}`}
                    className={`group bg-white border border-gray-200 rounded-2xl p-0 hover:border-gray-300 transition-all duration-200 overflow-hidden ${isApplied ? 'ring-1 ring-success/50 border-success/30' : ''}`}
                  >
                    {/* Compact Row Header */}
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-4">
                         {/* Icon Placeholder or Status Indicator */}
                         <div className={`h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold ${
                           isApplied ? 'bg-success/10 text-success' : 'bg-blue-50 text-blue-600'
                         }`}>
                           {subjectName.charAt(0)}
                         </div>

                         <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg text-gray-900 leading-tight">
                                {subjectName}
                              </h3>
                              {isApplied && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
                                  Applied
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                               <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold">{className}</span>
                               <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                               <span className="text-xs">Eligible</span>
                            </p>
                         </div>
                      </div>
                      
                      {/* Status indicators moved to header on desktop */}
                      {/* Status indicators moved/removed */}
                      {/* Status indicators and Action Button moved to header */}
                      <div className="flex items-center gap-4">
                        {!isApplied && !(expandedForm.subjectId === subjectId && expandedForm.classCategoryId === classCategoryId) && (
                           <button
                             onClick={() => handleExpandForm(subjectId, classCategoryId, false, null, subjectName)}
                             className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all"
                           >
                             <HiCurrencyRupee className="h-5 w-5 mr-2" />
                             Apply Job Now
                           </button>
                        )}
                      </div>
                    </div>

                    {/* Content Body Wrapper */}
                    <div className="px-5 pb-5">
                      
                      {/* Show salary details if applied AND form is NOT expanded */}
                      {isApplied && activeApplications.length > 0 && !(expandedForm.subjectId === subjectId && expandedForm.classCategoryId === classCategoryId) && (
                        <ApplicationSummary 
                          applications={activeApplications} 
                          jobTypes={jobTypes} 
                        />
                      )}
  
                      {/* Form or Buttons */}
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
                        /* Only show Update/Withdraw buttons if applied and form is NOT expanded */
                        isApplied && (
                          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                              <button
                                onClick={() => handleExpandForm(subjectId, classCategoryId, true, activeApplications, subjectName)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                <HiOutlinePencilSquare className="h-4 w-4 mr-2" />
                                Update Application
                              </button>
                              <button
                                onClick={() => handleRevoke(subjectId, classCategoryId, subjectName)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <HiOutlineXCircle className="h-4 w-4 mr-2" />
                                {/* in hindi also */}
                                Cancel Application / आवेदन रद्द करें
                              </button>
                          </div>
                        )
                      )}
                      
                      {/* Mobile Apply Button when form not expanded and not applied */}
                      {!isApplied && !(expandedForm.subjectId === subjectId && expandedForm.classCategoryId === classCategoryId) && (
                         <div className="sm:hidden mt-4 border-t border-gray-100 pt-4">
                            <button
                             onClick={() => handleExpandForm(subjectId, classCategoryId, false, null, subjectName)}
                             className="w-full inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all"
                           >
                             <HiCurrencyRupee className="h-5 w-5 mr-2" />
                             Apply Job Now
                           </button>
                         </div>
                      )}
                    </div>

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

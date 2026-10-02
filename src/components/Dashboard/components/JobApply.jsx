import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { postJobApply } from "../../../features/examQuesSlice";
import { getTeacherjobType } from "../../../features/jobProfileSlice";
import { updateJobApply } from "../../../services/examQuesServices";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JobLocationSelector from "./JobLocationSelector";
import {
  useGetApplyEligibilityQuery,
  useGetJobsApplyDetailsQuery,
} from "../../../features/api/apiSlice";
import {
  HiOutlineCurrencyDollar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlinePencilSquare,
  HiCurrencyRupee,
} from "react-icons/hi2";

const getJobTypeId = (jobType) => {
  if (typeof jobType === "object" && jobType !== null) {
    return jobType.id;
  }
  return jobType;
};

const getJobTypeName = (jobTypes, id) => {
  const type = jobTypes?.find((t) => t.id === parseInt(id));
  return type ? type.teacher_job_name : "Unknown Job Type";
};
const ApplicationForm = ({
  onCancel,
  onConfirm,
  subjectName,
  applicationData,
  isEdit,
  jobTypes,
  jobTypesStatus,
}) => {
  const [selectedJobType, setSelectedJobType] = useState("");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryType, setSalaryType] = useState("monthly");
  const [locations, setLocations] = useState([]);
  const [locationError, setLocationError] = useState(false);

  const availableJobTypes = jobTypes?.filter(jt => 
    !applicationData?.some(app => getJobTypeId(app.teacher_job_type) === jt.id && app.status === true)
  ) || [];

  useEffect(() => {
    if (availableJobTypes.length > 0 && !selectedJobType) {
      setSelectedJobType(availableJobTypes[0].id.toString());
    }
  }, [availableJobTypes, selectedJobType]);

  const handleSubmit = (e) => {
    e && e.preventDefault();
    if (!selectedJobType) { toast.error("Select a job type"); return; }
    if (!salaryAmount || parseFloat(salaryAmount) <= 0) { toast.error("Enter valid salary"); return; }
    if (locations.length === 0) { 
      setLocationError(true);
      toast.error("Please add at least one location preference."); 
      return; 
    }

    const existingJobTypes = applicationData?.filter(app => app.status === true).map(app => getJobTypeId(app.teacher_job_type)) || [];
    const allSelectedTypes = [...existingJobTypes, parseInt(selectedJobType)];
    
    const salaryDetails = {};
    applicationData?.forEach(app => {
      const jId = getJobTypeId(app.teacher_job_type);
      if(app.status === true) {
        salaryDetails[jId] = { amount: app.salary_expectation, type: app.salary_type || "monthly" };
      }
    });
    salaryDetails[selectedJobType] = { amount: salaryAmount, type: salaryType };

    const salaryData = {
      teacher_job_type: allSelectedTypes,
      salary_details: salaryDetails,
      job_type_locations: {
        [selectedJobType]: locations
      } 
    };

    onConfirm(salaryData);
  };

  if (availableJobTypes.length === 0) {
    return (
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-sm text-slate-500">You have already applied for all available job types for this subject.</p>
        <button type="button" onClick={onCancel} className="mt-3 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg">Close</button>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
      <h3 className="text-sm font-bold text-slate-800 mb-3">
        Apply for a new Job Type in {subjectName}
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="w-full sm:w-1/3">
           <label className="block text-xs font-semibold text-slate-600 mb-1">Job Type</label>
           <select 
             className="w-full text-sm border-slate-200 rounded-lg py-2 bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
             value={selectedJobType}
             onChange={(e) => setSelectedJobType(e.target.value)}
           >
             {availableJobTypes.map(jt => (
               <option key={jt.id} value={jt.id}>{jt.teacher_job_name}</option>
             ))}
           </select>
        </div>
        <div className="w-full sm:w-1/3">
           <label className="block text-xs font-semibold text-slate-600 mb-1">Expected Salary (₹)</label>
           <input 
             type="number"
             className="w-full text-sm border-slate-200 rounded-lg py-2 bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
             value={salaryAmount}
             onChange={(e) => setSalaryAmount(e.target.value)}
             placeholder="e.g. 5000"
             required min="1"
           />
        </div>
        <div className="w-full sm:w-1/4">
           <label className="block text-xs font-semibold text-slate-600 mb-1">Per</label>
           <select 
             className="w-full text-sm border-slate-200 rounded-lg py-2 bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
             value={salaryType}
             onChange={(e) => setSalaryType(e.target.value)}
           >
             <option value="hourly">Hour</option>
             <option value="daily">Day</option>
             <option value="monthly">Month</option>
             <option value="yearly">Year</option>
           </select>
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <button type="button" onClick={onCancel} className="px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm whitespace-nowrap">Apply</button>
        </div>
      </form>
      <div className={`mt-4 pt-4 border-t border-slate-100 ${locationError ? 'bg-red-50/50 p-3 rounded-lg border border-red-100 -mx-3 px-3' : ''}`}>
        <label className={`block text-xs font-semibold mb-2 ${locationError ? 'text-red-600' : 'text-slate-600'}`}>Specific Locations (Required)</label>
        <div className={locationError ? 'ring-1 ring-red-300 rounded-lg overflow-hidden bg-white' : ''}>
          <JobLocationSelector
            jobType={getJobTypeName(jobTypes, selectedJobType)}
            locations={locations}
            onChange={(locs) => {
              setLocations(locs);
              if (locs.length > 0) setLocationError(false);
            }}
          />
        </div>
        {locationError && (
          <p className="text-xs text-red-600 mt-2 font-semibold flex items-center gap-1.5 animate-in slide-in-from-top-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Location preference is required to apply for this job.
          </p>
        )}
      </div>
    </div>
  );
};


const UpdateApplicationForm = ({ app, jobName, onCancel, onUpdate }) => {
  const [salaryAmount, setSalaryAmount] = useState(app.salary_expectation || "");
  const [salaryType, setSalaryType] = useState(app.salary_type || "monthly");
  const [locations, setLocations] = useState(app.preferred_locations || []);
  const [locationError, setLocationError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!salaryAmount || parseFloat(salaryAmount) <= 0) { toast.error("Enter valid salary"); return; }
    if (locations.length === 0) { 
      setLocationError(true);
      toast.error("Please add at least one location preference."); 
      return; 
    }
    
    onUpdate(app, {
      salary_expectation: salaryAmount,
      salary_type: salaryType,
      preferred_locations: locations
    });
  };

  return (
    <div className="p-4 bg-white border border-teal-200 rounded-lg m-2 shadow-sm relative">
      <h5 className="text-sm font-bold text-teal-800 mb-3 flex items-center gap-2">
        Updating {jobName}
      </h5>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-1/2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Expected Salary (₹)</label>
            <input 
              type="number"
              className="w-full text-sm border-slate-200 rounded-lg py-2 bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
              value={salaryAmount}
              onChange={(e) => setSalaryAmount(e.target.value)}
              placeholder="e.g. 5000"
              required min="1"
            />
          </div>
          <div className="w-full sm:w-1/2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Per</label>
            <select 
              className="w-full text-sm border-slate-200 rounded-lg py-2 bg-slate-50 focus:ring-teal-500 focus:border-teal-500"
              value={salaryType}
              onChange={(e) => setSalaryType(e.target.value)}
            >
              <option value="hourly">Hour</option>
              <option value="daily">Day</option>
              <option value="monthly">Month</option>
              <option value="yearly">Year</option>
            </select>
          </div>
        </div>
        
        <div className={`mt-2 ${locationError ? 'bg-red-50/50 p-2 rounded-lg border border-red-100' : ''}`}>
          <label className={`block text-xs font-semibold mb-2 ${locationError ? 'text-red-600' : 'text-slate-600'}`}>Specific Locations (Required)</label>
          <div className={locationError ? 'ring-1 ring-red-300 rounded-lg overflow-hidden bg-white' : ''}>
            <JobLocationSelector
              jobType={jobName}
              locations={locations}
              onChange={(locs) => {
                setLocations(locs);
                if (locs.length > 0) setLocationError(false);
              }}
            />
          </div>
          {locationError && (
            <p className="text-xs text-red-600 mt-2 font-semibold">⚠️ Location preference is required to apply for this job.</p>
          )}
        </div>

        <div className="flex gap-2 justify-end mt-2">
          <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

const ApplicationSummary = ({ applications, jobTypes, onRevoke, onUpdateSubmit }) => {
  const [editingJobId, setEditingJobId] = useState(null);

  if (!applications || applications.length === 0) return null;

  return (
    <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
      <div className="px-4 py-2 border-b border-slate-100 bg-slate-100/50">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Current Applications
        </h4>
      </div>
      <div className="divide-y divide-slate-100">
        {applications.map((app) => {
          const jobId = getJobTypeId(app.teacher_job_type);
          const jobName = getJobTypeName(jobTypes, jobId);
          
          if (editingJobId === jobId) {
            return (
              <UpdateApplicationForm 
                key={jobId}
                app={app} 
                jobName={jobName} 
                onCancel={() => setEditingJobId(null)}
                onUpdate={(app, updatedData) => {
                  onUpdateSubmit(app, updatedData);
                  setEditingJobId(null);
                }}
              />
            );
          }

          return (
            <div key={jobId} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                  {jobName.charAt(0)}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">{jobName}</h5>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">₹{app.salary_expectation}</span> / {app.salary_type || "monthly"}
                    </p>
                    {app.preferred_locations && app.preferred_locations.length > 0 ? (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        📍 {app.preferred_locations.map(loc => loc.district ? `${loc.district}, ${loc.state}` : loc.state).join(" | ")}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        📍 Default Profile Location
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setEditingJobId(jobId)} 
                  className="px-3 py-1.5 text-xs font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors whitespace-nowrap border border-teal-100"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onRevoke(jobId)} 
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors whitespace-nowrap"
                >
                  Withdraw
                </button>
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
  const { teacherjobRole: jobTypes, status: jobTypesStatus } = useSelector(
    (state) => state.jobProfile,
  );

  useEffect(() => {
    if (!jobTypes || jobTypes.length === 0) {
      dispatch(getTeacherjobType());
    }
  }, [dispatch]);

  const [expandedForm, setExpandedForm] = useState({
    subjectId: null,
    classCategoryId: null,
    isEdit: false,
    applicationData: null,
  });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletErrorMsg, setWalletErrorMsg] = useState("");
  const {
    data: eligibilityData,
    isLoading: isEligibilityLoading,
    error: eligibilityError,
  } = useGetApplyEligibilityQuery();

  const {
    data: jobApply,
    isLoading: isJobApplyLoading,
    error: jobApplyError,
    refetch: refetchJobApply,
  } = useGetJobsApplyDetailsQuery();
  const eligibleExams = eligibilityData?.qualified_list
    ? eligibilityData.qualified_list.filter((exam) => exam.eligible === true)
    : [];
  const handleExpandForm = (
    subjectId,
    classCategoryId,
    isEdit = false,
    applicationData = null,
    subjectName = "",
  ) => {
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
      subjectName: "",
    });
  };
  const handleFormSubmit = async (salaryData) => {
    const { subjectId, classCategoryId, isEdit, subjectName } = expandedForm;
    await handleApply(
      subjectId,
      classCategoryId,
      subjectName,
      false,
      salaryData,
      null,
      isEdit ? "update" : "apply",
    );
    handleCollapseForm();
  };
  
  const handleUpdateSingle = async (app, updatedData) => {
    try {
      await updateJobApply(app.id, {
        class_category: app.class_category?.id || app.class_category || app.class_category_id,
        subject: app.subject?.id || app.subject || app.subject_id,
        teacher_job_type: getJobTypeId(app.teacher_job_type),
        salary_expectation: updatedData.salary_expectation,
        salary_type: updatedData.salary_type,
        status: true,
        preferred_locations: updatedData.preferred_locations.map((loc) => ({
          state: loc.state,
          district: loc.district,
          pincode: loc.pincode,
          post_office: loc.post_office,
          area: loc.area || "",
        })),
      });
      toast.success("Application updated successfully!");
      refetchJobApply();
    } catch (e) {
      toast.error("Failed to update application");
    }
  };

  const handleRevokeSingle = async (subjectId, classCategoryId, subjectName, jobIdToRevoke) => {

    if (window.confirm(`Are you sure you want to withdraw this application?`)) {
      const app = jobApply?.find(a => 
        (a.subject === subjectId || a.subject_id === subjectId || a.subject?.id === subjectId) &&
        (a.class_category === classCategoryId || a.class_category_id === classCategoryId || a.class_category?.id === classCategoryId) &&
        getJobTypeId(a.teacher_job_type) === jobIdToRevoke &&
        a.status === true
      );
      if (app) {
        try {
          await updateJobApply(app.id, {
            class_category: classCategoryId,
            subject: subjectId,
            teacher_job_type: jobIdToRevoke,
            salary_expectation: app.salary_expectation,
            salary_type: app.salary_type || "monthly",
            status: false,
          });
          toast.success("Application withdrawn successfully!");
          refetchJobApply();
        } catch (e) {
          toast.error("Failed to withdraw application");
        }
      }
    }
  };

  const handleRevoke = async (subjectId, classCategoryId, subjectName) => {
    if (
      window.confirm(
        `Are you sure you want to withdraw your application for ${subjectName}? This action cannot be undone immediately.`,
      )
    ) {
      await handleApply(
        subjectId,
        classCategoryId,
        subjectName,
        true,
        null,
        null,
        "revoke",
      );
    }
  };
  const handleApply = async (
    subjectId,
    classCategoryId,
    subjectName,
    currentStatus = false,
    salaryData = null,
    applicationId = null,
    action = "apply",
  ) => {
    try {
      console.log("=== handleApply Sync Debug ===");
      console.log("Action:", action);
      console.log("Salary Data:", salaryData);
      const currentApplications =
        jobApply?.filter((item) => {
          const itemSubjectId =
            item.subject?.id || item.subject || item.subject_id;
          const itemClassId =
            item.class_category?.id ||
            item.class_category ||
            item.class_category_id;
          let isSubjectMatch = itemSubjectId === subjectId;
          if (!isSubjectMatch && item.class_category?.subjects) {
            isSubjectMatch = item.class_category.subjects.some((sub) =>
              typeof sub === "object"
                ? sub.id === subjectId
                : sub === subjectId,
            );
          }

          return isSubjectMatch && itemClassId === classCategoryId;
        }) || [];

      const promises = [];
      const selectedJobTypes = salaryData?.teacher_job_type || [];
      const salaryDetails = salaryData?.salary_details || {};

      console.log(
        "DEBUG: Current Applications:",
        JSON.parse(JSON.stringify(currentApplications)),
      );
      console.log("DEBUG: Selected Job Types:", selectedJobTypes);

      console.log("Current Applications for Subject:", currentApplications);
      if (action === "revoke") {
        currentApplications.forEach((app) => {
          if (app.status === true) {
            const jobId = getJobTypeId(app.teacher_job_type);
            promises.push(
              updateJobApply(app.id, {
                class_category: classCategoryId,
                subject: subjectId,
                teacher_job_type: jobId, // Send as single ID or array depending on backend, keeping consistent
                salary_expectation: app.salary_expectation,
                salary_type: app.salary_type || "monthly",
                status: false,
              }),
            );
          }
        });
      } else {
        selectedJobTypes.forEach((jobId) => {
          const existingApp = currentApplications.find(
            (app) => getJobTypeId(app.teacher_job_type) === jobId,
          );
          console.log(
            `DEBUG: Checking Job ID ${jobId}. Existing App Found:`,
            existingApp ? existingApp.id : "No",
          );

          const salary = salaryDetails[jobId]?.amount || "10000";
          const type = salaryDetails[jobId]?.type || "monthly";

          if (existingApp) {
            const newLocations = salaryData?.job_type_locations?.[jobId] || [];
            const oldLocations = existingApp.preferred_locations || [];
            const isLocationChanged =
              JSON.stringify(newLocations) !== JSON.stringify(oldLocations);

            if (
              existingApp.salary_expectation !== salary ||
              existingApp.salary_type !== type ||
              existingApp.status === false ||
              isLocationChanged
            ) {
              console.log(
                `Updating existing app ${existingApp.id} for job ${jobId}`,
              );
              promises.push(
                updateJobApply(existingApp.id, {
                  class_category: classCategoryId,
                  subject: subjectId,
                  teacher_job_type: jobId,
                  salary_expectation: salary,
                  salary_type: type,
                  status: true,
                  preferred_locations: newLocations.map((loc) => ({
                    state: loc.state,
                    district: loc.district,
                    pincode: loc.pincode,
                    post_office: loc.post_office,
                    area: loc.area || "",
                  })),
                }),
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
              preferred_locations: (
                salaryData?.job_type_locations?.[jobId] || []
              ).map((loc) => ({
                state: loc.state,
                district: loc.district,
                pincode: loc.pincode,
                post_office: loc.post_office,
                area: loc.area || "",
              })),
            };
            promises.push(dispatch(postJobApply(payload)).unwrap());
          }
        });
        currentApplications.forEach((app) => {
          const jobId = getJobTypeId(app.teacher_job_type);
          if (!selectedJobTypes.includes(jobId) && app.status === true) {
            console.log(`Revoking unselected app ${app.id} for job ${jobId}`);
            promises.push(
              updateJobApply(app.id, {
                class_category: classCategoryId,
                subject: subjectId,
                teacher_job_type: jobId,
                salary_expectation: app.salary_expectation,
                salary_type: app.salary_type || "monthly",
                status: false,
              }),
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

      let messageText =
        action === "revoke"
          ? `Cancelled applications for ${subjectName}`
          : `Successfully updated applications for ${subjectName}`;

      toast.success(
        <div>
          <div className="font-bold">Success</div>
          <div className="text-sm">{messageText}</div>
        </div>,
        { position: "top-right", className: "bg-green-50 text-green-800" },
      );
    } catch (error) {
      console.error("❌ Application error:", error);

      let errorMessage = "Please try again";
      if (typeof error === "string") errorMessage = error;
      else if (error?.error) errorMessage = error.error;
      else if (error?.response?.data?.error)
        errorMessage = error.response.data.error;
      else if (error?.message) errorMessage = error.message;

      if (typeof errorMessage === 'string' && errorMessage.includes("job preference location")) {
        toast.error(
          "Please set your job preference location in the application form.",
        );
      } else if (typeof errorMessage === 'string' && errorMessage.includes("Insufficient points")) {
        setWalletErrorMsg(errorMessage);
        setShowWalletModal(true);
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

  if (eligibilityError || jobApplyError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded  border border-dashed border-gray-300 text-center">
          <div className="p-4 bg-red-50 rounded-full mb-4">
            <HiOutlineExclamationTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-500 max-w-md mb-6">
            We couldn't load some required data. Please check your internet
            connection and try again.
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
          <span className="ml-2 text-secondary text-sm font-normal">
            / नौकरी आवेदन
          </span>
        </h1>
        <p className="mt-0 text-sm text-slate-500">
          Apply to eligible subjects by setting your preferences directly below.
        </p>
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
                const applications =
                  jobApply?.filter((item) => {
                    let subjectMatch = false;
                    let categoryMatch = false;
                    if (
                      item.subject === subjectId ||
                      item.subject_id === subjectId ||
                      item.subject?.id === subjectId
                    ) {
                      subjectMatch = true;
                    }
                    if (
                      item.class_category === classCategoryId ||
                      item.class_category_id === classCategoryId ||
                      item.class_category?.id === classCategoryId
                    ) {
                      categoryMatch = true;
                    } else if (item.class_category?.subjects) {
                      const hasSubject = item.class_category.subjects.some(
                        (sub) =>
                          typeof sub === "object"
                            ? sub.id === subjectId
                            : sub === subjectId,
                      );
                      if (
                        hasSubject &&
                        item.class_category.id === classCategoryId
                      ) {
                        subjectMatch = true;
                        categoryMatch = true;
                      }
                    }

                    return subjectMatch && categoryMatch;
                  }) || [];
                const activeApplications = applications.filter(
                  (app) => app.status === true,
                );
                const isApplied = activeApplications.length > 0;

                return (
                  <div
                    key={`${subjectId}-${classCategoryId}-${index}`}
                    className={`group bg-white border border-gray-200 rounded  p-0 hover:border-gray-300 transition-all duration-200 overflow-hidden ${
                      isApplied
                        ? "ring-1 ring-success/50 border-success/30"
                        : ""
                    }`}
                  >
                    {/* Compact Row Header */}
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Icon Placeholder or Status Indicator */}
                        <div
                          className={`h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold ${
                            isApplied
                              ? "bg-success/10 text-success"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
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
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold">
                              {className}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-xs">Eligible</span>
                          </p>
                        </div>
                      </div>

                      {/* Status indicators moved to header on desktop */}
                      {/* Status indicators moved/removed */}
                      {/* Status indicators and Action Button moved to header */}
                      <div className="flex items-center gap-4">
                        {!isApplied &&
                          !(
                            expandedForm.subjectId === subjectId &&
                            expandedForm.classCategoryId === classCategoryId
                          ) && (
                            <button
                              onClick={() =>
                                handleExpandForm(
                                  subjectId,
                                  classCategoryId,
                                  false,
                                  null,
                                  subjectName,
                                )
                              }
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
                      {isApplied &&
                        activeApplications.length > 0 &&
                        !(
                          expandedForm.subjectId === subjectId &&
                          expandedForm.classCategoryId === classCategoryId
                        ) && (
                          <ApplicationSummary
                            applications={activeApplications}
                            jobTypes={jobTypes}
                            onRevoke={(jobId) => handleRevokeSingle(subjectId, classCategoryId, subjectName, jobId)}
                            onUpdateSubmit={handleUpdateSingle}
                          />
                        )}

                      {/* Form or Buttons */}
                      {expandedForm.subjectId === subjectId &&
                      expandedForm.classCategoryId === classCategoryId && (
                        <ApplicationForm
                          isEdit={expandedForm.isEdit}
                          applicationData={expandedForm.applicationData}
                          subjectName={subjectName}
                          onConfirm={handleFormSubmit}
                          onCancel={handleCollapseForm}
                          jobTypes={jobTypes}
                          jobTypesStatus={jobTypesStatus}
                        />
                      )}

                      {/* Mobile Apply Button when form not expanded and not applied */}
                      {!isApplied &&
                        !(
                          expandedForm.subjectId === subjectId &&
                          expandedForm.classCategoryId === classCategoryId
                        ) && (
                          <div className="sm:hidden mt-4 border-t border-gray-100 pt-4">
                            <button
                              onClick={() =>
                                handleExpandForm(
                                  subjectId,
                                  classCategoryId,
                                  false,
                                  null,
                                  subjectName,
                                )
                              }
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
          <div className="p-12 bg-white rounded  border border-slate-200 text-center shadow-sm">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="p-4 bg-yellow-50 rounded-full mb-6">
                <HiOutlineInformationCircle
                  className="h-10 w-10 text-yellow-600"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">
                No eligible subjects found
                <span className="block mt-1 text-base font-normal text-slate-500">
                  कोई पात्र विषय नहीं
                </span>
              </h3>
              <p className="text-slate-600 leading-relaxed">
                You don't have any eligible subjects to apply for at the moment.
                Please update your qualifications in your profile to become
                eligible for job applications.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Recharge Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 transform transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <HiOutlineExclamationTriangle className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 text-center mb-2">Insufficient Points</h3>
            <p className="text-slate-600 text-center mb-6 leading-relaxed">
              {walletErrorMsg || "You don't have enough points to apply for this job. Please recharge your wallet to continue."}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/teacher/wallet"
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Go to Wallet to Recharge
              </Link>
              <button
                onClick={() => setShowWalletModal(false)}
                className="w-full flex items-center justify-center px-6 py-3 border border-slate-300 rounded-lg shadow-sm text-base font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JobApply;

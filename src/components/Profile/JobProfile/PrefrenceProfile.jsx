import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  getClassCategory,
  getJob,
  getPrefrence,
  getSubject,
  postPrefrence,
  getTeacherjobType,
} from "../../../features/jobProfileSlice";
import { updateTeacherPrefrence } from "../../../services/jobProfileService";
import { HiExclamationCircle, HiPencil, HiArrowRight, HiArrowLeft, HiCheck } from "react-icons/hi";
import { FiX } from "react-icons/fi";
import Loader from "../../Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getLevels } from "../../../features/examQuesSlice";

const PrefrenceProfile = ({ forceEdit = false }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [displayedJobTypes, setDisplayedJobTypes] = useState([]);

  useEffect(() => {
    dispatch(getClassCategory());
    dispatch(getJob());
    dispatch(getTeacherjobType());
    dispatch(getPrefrence());
  }, [dispatch]);

  const category = useSelector((state) => state?.jobProfile?.classCategories);
  const jobRole = useSelector((state) => state?.jobProfile?.jobRole);
  const teacherjobRole = useSelector((state) => state.jobProfile.teacherjobRole);
  const teacherprefrence = useSelector((state) => state.jobProfile?.prefrence);
  const { error } = useSelector((state) => state.jobProfile);

  const [isEditingPrefrence, setIsEditingPrefrence] = useState(forceEdit);

  // Update displayed job types when they're loaded or when step changes
  useEffect(() => {
    if (currentStep >= 3 && teacherjobRole && teacherjobRole.length > 0) {
      setDisplayedJobTypes(teacherjobRole);
    }
  }, [currentStep, teacherjobRole]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      class_category: [],
      job_role: ["4"], // Teacher ID as string
      prefered_subject: [],
      teacher_job_type: [],
    },
    mode: "onChange",
  });

  // Ensure Teacher is always included when form values change
  const jobRoles = watch("job_role");
  useEffect(() => {
    const teacherId = "4";
    if (!jobRoles.includes(teacherId)) {
      setValue("job_role", [...jobRoles, teacherId]);
    }
  }, [jobRoles, setValue]);

  // Update form with fetched preferences
  useEffect(() => {
    if (teacherprefrence) {
      const previousJobRoles = (teacherprefrence.job_role || []).map(item => String(item.id));
      // Ensure Teacher (ID: 4) is always included
      const updatedJobRoles = previousJobRoles.includes("4") 
        ? previousJobRoles 
        : [...previousJobRoles, "4"];

      reset({
        class_category: (teacherprefrence.class_category || []).map(item => String(item.id)),
        job_role: updatedJobRoles,
        prefered_subject: (teacherprefrence.prefered_subject || []).map(item => String(item.id)),
        teacher_job_type: (teacherprefrence.teacher_job_type || []).map(item => String(item.id)),
      });
    }
  }, [teacherprefrence, reset]);

  // Show validation errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((error) => {
        if (error.message) {
          toast.error(error.message);
        }
      });
    }
  }, [errors]);

  // Handle subjects based on selected categories
  const selectedClassCategories = watch("class_category") || [];
  const filteredSubjects = selectedClassCategories.flatMap((catId) => {
    const categoryObj = category?.find((cat) => cat?.id === Number(catId));
    return categoryObj ? categoryObj.subjects : [];
  });

  useEffect(() => {
    const currentSubjects = getValues("prefered_subject");
    const validSubjects = currentSubjects.filter((subId) =>
      filteredSubjects.some((sub) => sub?.id === Number(subId))
    );
    setValue("prefered_subject", validSubjects);
  }, [filteredSubjects, getValues, setValue]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const fetchPreferences = () => {
    dispatch(getPrefrence());
  };

  const validateStep = async () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = await trigger("class_category");
        if (!isValid) toast.error("Please select at least one class category / कम से कम एक कक्षा श्रेणी चुनें");
        break;
      case 2:
        isValid = await trigger("prefered_subject");
        if (!isValid) toast.error("Please select at least one subject / कम से कम एक विषय चुनें");
        break;
      case 3:
        isValid = await trigger("job_role");
        break;
      case 4:
        isValid = true; // Teacher job type is optional
        break;
      default:
        isValid = true;
    }
    
    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data) => {
    const isValid = await validateStep();
    if (!isValid) return;

    setIsLoading(true);
    try {
      const teacherId = "4";
      const submitData = {
        ...data,
        job_role: data.job_role.includes(teacherId) 
          ? data.job_role 
          : [...data.job_role, teacherId], // Ensure Teacher is always included
      };

      await updateTeacherPrefrence(submitData);
      dispatch(postPrefrence(submitData));
      fetchPreferences();
      setIsEditingPrefrence(false);
      setCurrentStep(1); // Reset to first step
      toast.success("Job preferences updated successfully! / नौकरी की प्राथमिकताएं सफलतापूर्वक अपडेट की गईं!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update preferences / प्राथमिकताओं को अपडेट करने में विफल";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100">
      <ToastContainer 
        position="top-right" 
        autoClose={1000} 
        closeButton={true}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {isLoading && <Loader />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-gradient-to-r from-teal-200 to-cyan-200">
        <div className="mb-2 sm:mb-0">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            Teaching Preferences / शिक्षण प्राथमिकताएं
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage your teaching preferences / अपनी शिक्षण प्राथमिकताओं को प्रबंधित करें
          </p>
        </div>
        {!forceEdit && (
          !isEditingPrefrence ? (
            <button
              className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => setIsEditingPrefrence(true)}
            >
              <HiPencil className="w-4 h-4" />
              <span>Edit / संपादित करें</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditingPrefrence(false);
                setCurrentStep(1);
              }}
              className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <FiX className="w-4 h-4" />
              <span>Close / बंद करें</span>
            </button>
          )
        )}
      </div>

      <div className="mb-4">
        {!isEditingPrefrence && !forceEdit ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                {
                  title: "कक्षा श्रेणी / Class Category",
                  type: "category",
                  icon: "📚",
                  color: "from-blue-50 to-cyan-50",
                  borderColor: "border-blue-200",
                  value:
                    teacherprefrence?.class_category?.length > 0
                      ? teacherprefrence.class_category.map(
                          (class_category) => class_category.name
                        )
                      : ["Not Provided"],
                },
                {
                  title: "नौकरी की भूमिका / Job Role",
                  type: "role",
                  icon: "👔",
                  color: "from-purple-50 to-pink-50",
                  borderColor: "border-purple-200",
                  value:
                    teacherprefrence?.job_role?.length > 0
                      ? teacherprefrence.job_role.map(
                          (jobrole) => jobrole.jobrole_name
                        )
                      : ["Teacher"],
                },
                {
                  title: "विषय / Subject",
                  type: "subject",
                  icon: "📖",
                  color: "from-green-50 to-emerald-50",
                  borderColor: "border-green-200",
                  value:
                    teacherprefrence?.prefered_subject?.length > 0
                      ? (teacherprefrence.class_category || []).map(
                          (category) => ({
                            categoryName: category.name,
                            subjects: teacherprefrence.prefered_subject
                              .filter((subject) =>
                                category.subjects?.some(
                                  (catSubject) => catSubject.id === subject.id
                                )
                              )
                              .map((subject) => subject.subject_name),
                          })
                        )
                      : [
                          {
                            categoryName: "No Category",
                            subjects: ["Not Provided"],
                          },
                        ],
                },
                {
                  title: "नौकरी का प्रकार / Job Type",
                  type: "jobtype",
                  icon: "💼",
                  color: "from-orange-50 to-amber-50",
                  borderColor: "border-orange-200",
                  value:
                    teacherprefrence?.teacher_job_type?.length > 0
                      ? teacherprefrence.teacher_job_type.map(
                          (jobtype) => jobtype.teacher_job_name
                        )
                      : ["Not Provided"],
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${item.color} p-4 sm:p-5 rounded-xl border-2 ${item.borderColor} shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="text-sm sm:text-base font-bold text-gray-800">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    {item.type === "subject" ? (
                      item.value.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-2">
                          <h4 className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                            {category.categoryName}
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {category.subjects.map(
                              (subjectName, subjectIndex) => (
                                <span
                                  key={subjectIndex}
                                  className="px-2 py-0.5 bg-white text-teal-700 border border-teal-300 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-shadow"
                                >
                                  {subjectName}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {item.value.map((val, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-white text-teal-700 border border-teal-300 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-shadow"
                          >
                            {val}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Stepper Header */}
              <div className="bg-gradient-to-r from-white via-teal-50 to-white p-4 sm:p-5 rounded-xl border-2 border-teal-200 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  {[1, 2, 3, 4].map((step) => (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-base font-bold transition-all duration-300 transform ${
                            currentStep > step
                              ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg scale-105"
                              : currentStep === step
                              ? "bg-gradient-to-br from-teal-500 to-cyan-500 text-white ring-4 ring-teal-200 shadow-xl scale-110"
                              : "bg-gray-200 text-gray-500 shadow-sm"
                          }`}
                        >
                          {currentStep > step ? <HiCheck className="w-6 h-6" /> : step}
                        </div>
                        <span className={`text-xs mt-1.5 font-medium hidden sm:block transition-colors ${
                          currentStep === step ? "text-teal-700 font-bold" : currentStep > step ? "text-green-600" : "text-gray-500"
                        }`}>
                          {step === 1 && "Class"}
                          {step === 2 && "Subject"}
                          {step === 3 && "Role"}
                          {step === 4 && "Job Type"}
                        </span>
                      </div>
                      {step < 4 && (
                        <div className={`flex-1 h-1.5 mx-2 sm:mx-3 rounded-full transition-all duration-500 ${
                          currentStep > step ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm" : "bg-gray-300"
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                  <div 
                    className="bg-gradient-to-r from-teal-500 via-cyan-500 to-green-500 h-1.5 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
                
                {/* Mobile Step Labels */}
                <div className="block sm:hidden text-center">
                  <p className="text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1.5 rounded-full inline-block">
                    Step {currentStep} of {totalSteps}:{" "}
                    {currentStep === 1 && "Class / कक्षा"}
                    {currentStep === 2 && "Subject / विषय"}
                    {currentStep === 3 && "Role / भूमिका"}
                    {currentStep === 4 && "Job Type / नौकरी"}
                  </p>
                </div>
              </div>

              {/* Step Content */}
              <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl border-2 border-gray-200 shadow-lg min-h-[360px]">
                {/* Step 1: Class Category */}
                {currentStep === 1 && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl">📚</span>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                          Select Class Category / कक्षा श्रेणी चुनें
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 ml-11">
                        Choose the educational levels / शिक्षा के स्तर का चयन करें
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-h-[240px] overflow-y-auto p-1.5 pr-2 custom-scrollbar">
                      {category?.map((cat) => (
                        <label
                          key={cat.id}
                          className="flex items-center space-x-2 p-3 sm:p-4 bg-white rounded-lg hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 border-2 border-gray-200 hover:border-teal-400 transition-all cursor-pointer shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                          <input
                            type="checkbox"
                            {...register("class_category", {
                              required: "Please select at least one class category / कम से कम एक कक्षा श्रेणी चुनें",
                            })}
                            value={cat.id}
                            className="h-4 w-4 text-teal-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-teal-500 transition-all"
                          />
                          <span className="text-xs sm:text-sm text-gray-800 font-semibold">
                            {cat.name}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.class_category && (
                      <div className="text-red-500 text-sm flex items-center mt-2">
                        <HiExclamationCircle className="mr-1.5 h-4 w-4" />
                        {errors.class_category.message}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Preferred Subjects */}
                {currentStep === 2 && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl">📖</span>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                          Select Preferred Subjects / पसंदीदा विषय चुनें
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 ml-11">
                        Choose subjects you can teach / जो विषय आप पढ़ा सकते हैं उन्हें चुनें
                      </p>
                    </div>
                    <div className="space-y-3 max-h-[240px] overflow-y-auto p-1.5 pr-2 custom-scrollbar">
                      {selectedClassCategories.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-5xl mb-2">📚</div>
                          <p className="text-xs sm:text-sm text-gray-500 font-medium">
                            Please select class categories first / पहले कक्षा श्रेणी का चयन करें
                          </p>
                        </div>
                      ) : (
                        selectedClassCategories.map((catId) => {
                          const categoryObj = category?.find(
                            (c) => c.id === Number(catId)
                          );
                          if (!categoryObj) return null;

                          return (
                            <div key={categoryObj.id} className="space-y-2 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border-2 border-green-200">
                              <h4 className="text-xs sm:text-sm font-bold text-green-800 mb-2 pb-1.5 border-b-2 border-green-300 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                {categoryObj.name}
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {categoryObj.subjects?.map((sub) => (
                                  <label
                                    key={sub.id}
                                    className="flex items-center space-x-2 p-2.5 sm:p-3 bg-white rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 border-2 border-gray-200 hover:border-green-400 transition-all cursor-pointer shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                  >
                                    <input
                                      type="checkbox"
                                      {...register("prefered_subject", {
                                        required: "Please select at least one subject / कम से कम एक विषय चुनें",
                                      })}
                                      value={sub.id}
                                      className="h-4 w-4 text-green-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-green-500 transition-all"
                                    />
                                    <span className="text-xs sm:text-sm text-gray-800 font-medium">
                                      {sub.subject_name}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {errors.prefered_subject && (
                      <div className="text-red-500 text-sm flex items-center mt-2">
                        <HiExclamationCircle className="mr-1.5 h-4 w-4" />
                        {errors.prefered_subject.message}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Job Role */}
                {currentStep === 3 && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl">👔</span>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                          Select Job Role / नौकरी की भूमिका चुनें
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 ml-11">
                        Teacher is required, can add additional roles / शिक्षक आवश्यक है, अतिरिक्त भूमिकाएं जोड़ सकते हैं
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-h-[240px] overflow-y-auto p-1.5 pr-2 custom-scrollbar">
                      {jobRole
                        ?.slice()
                        .sort((a, b) =>
                          a.jobrole_name.localeCompare(b.jobrole_name)
                        )
                        ?.map((role) => (
                          <label
                            key={role.id}
                            className={`flex items-center space-x-2 p-3 sm:p-4 rounded-lg border-2 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                              role.id === 4
                                ? "bg-gradient-to-r from-purple-100 to-pink-100 border-purple-400 cursor-not-allowed"
                                : "bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border-gray-200 hover:border-purple-400 cursor-pointer"
                            }`}
                          >
                            <input
                              type="checkbox"
                              {...register("job_role")}
                              value={role.id}
                              className="h-4 w-4 text-purple-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 transition-all"
                              disabled={role.id === 4}
                            />
                            <span className="text-xs sm:text-sm text-gray-800 font-semibold">
                              {role.jobrole_name}
                              {role.id === 4 && (
                                <span className="ml-1.5 text-xs text-purple-700 font-bold bg-purple-200 px-1.5 py-0.5 rounded-full">
                                  Required / आवश्यक ✓
                                </span>
                              )}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Teacher Job Type */}
                {currentStep === 4 && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl">💼</span>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                          Select Job Type / नौकरी का प्रकार चुनें
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 ml-11">
                        Choose preferred employment type <span className="text-orange-600 font-semibold">(Optional / वैकल्पिक)</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-h-[240px] overflow-y-auto p-1.5 pr-2 custom-scrollbar">
                      {displayedJobTypes.length > 0 ? (
                        displayedJobTypes.map((role) => (
                          <label
                            key={role.id}
                            className="flex items-center space-x-2 p-3 sm:p-4 bg-white rounded-lg hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                          >
                            <input
                              type="checkbox"
                              {...register("teacher_job_type")}
                              value={role.id}
                              className="h-4 w-4 text-orange-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-orange-500 transition-all"
                            />
                            <span className="text-xs sm:text-sm text-gray-800 font-semibold">
                              {role.teacher_job_name}
                            </span>
                          </label>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8">
                          <div className="text-5xl mb-2">⏳</div>
                          <p className="text-xs sm:text-sm text-gray-500 font-medium">Loading... / लोड हो रहा है...</p>
                        </div>
                      )}
                    </div>
                    {errors.teacher_job_type && (
                      <div className="text-red-500 text-sm flex items-center mt-2">
                        <HiExclamationCircle className="mr-1.5 h-4 w-4" />
                        {errors.teacher_job_type.message}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 shadow-sm">
                {!forceEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPrefrence(false);
                      setCurrentStep(1);
                      fetchPreferences();
                    }}
                    className="order-3 sm:order-1 w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow-md"
                  >
                    Cancel / रद्द करें
                  </button>
                )}

                <div className="order-1 sm:order-2 flex gap-2 w-full sm:w-auto">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-teal-700 bg-white border-2 border-teal-600 rounded-lg hover:bg-teal-50 hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      <HiArrowLeft className="w-4 h-4" />
                      <span>Back / पीछे</span>
                    </button>
                  )}

                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      <span>Next / आगे</span>
                      <HiArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      <HiCheck className="w-4 h-4" />
                      <span>Save / सहेजें</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrefrenceProfile;
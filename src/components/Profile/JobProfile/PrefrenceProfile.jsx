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
import { HiOutlineExclamationCircle, HiOutlinePencil, HiOutlineArrowRight, HiOutlineArrowLeft, HiOutlineCheck, HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineUserGroup } from "react-icons/hi";
import { HiOutlineXMark } from "react-icons/hi2";
import Loader from "../../Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getLevels } from "../../../features/examQuesSlice";

const PrefrenceProfile = ({ forceEdit = false }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    dispatch(getClassCategory());
    dispatch(getJob());
    dispatch(getPrefrence());
  }, [dispatch]);

  const category = useSelector((state) => state?.jobProfile?.classCategories);
  const jobRole = useSelector((state) => state?.jobProfile?.jobRole);
  const teacherprefrence = useSelector((state) => state.jobProfile?.prefrence);
  const { error } = useSelector((state) => state.jobProfile);

  const [isEditingPrefrence, setIsEditingPrefrence] = useState(forceEdit);

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
        const jobRoleValues = getValues("job_role");
        if (!jobRoleValues || jobRoleValues.length === 0) {
          toast.error("Please select at least one job role / कम से कम एक नौकरी की भूमिका चुनें");
          isValid = false;
        } else {
          isValid = true;
        }
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
      const submitData = {
        ...data,
        job_role: data.job_role.includes("4") 
          ? data.job_role 
          : [...data.job_role, "4"], // Ensure Teacher is always included
      };
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
    <div className="bg-white rounded-xl border border-gray-200">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-gray-200 px-4 pt-4">
        <div className="sm:mb-0">
          <h2 className="text-2xl font-bold text-text flex items-center gap-3">
            <HiOutlineAcademicCap className="w-7 h-7 text-text" />
            Teaching Preferences / शिक्षण प्राथमिकताएं
          </h2>
          <p className="text-xs sm:text-sm text-secondary ml-9">
            Manage your teaching preferences / अपनी शिक्षण प्राथमिकताओं को प्रबंधित करें
          </p>
        </div>
        {!forceEdit && (
          !isEditingPrefrence ? (
            <button
              className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all"
              onClick={() => setIsEditingPrefrence(true)}
            >
              <HiOutlinePencil className="w-4 h-4" />
              <span>Edit / संपादित करें</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditingPrefrence(false);
                setCurrentStep(1);
              }}
              className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-text bg-white border-2 border-gray-300 hover:border-gray-400 rounded-lg transition-all"
            >
              <HiOutlineXMark className="w-4 h-4" />
              <span>Close / बंद करें</span>
            </button>
          )
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="mb-3">
        {!isEditingPrefrence && !forceEdit ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                {
                  title: "कक्षा श्रेणी / Class Category",
                  type: "category",
                  icon: HiOutlineAcademicCap,
                  color: "from-[#3E98C7]/10 to-[#67B3DA]/10",
                  borderColor: "border-[#3E98C7]/30",
                  value:
                    teacherprefrence?.class_category?.length > 0
                      ? teacherprefrence.class_category.map(
                          (class_category) => class_category.name + " class"
                        )
                      : ["Not Provided"],
                },
               
                {
                  title: "विषय / Subject",
                  type: "subject",
                  icon: HiOutlineBookOpen,
                  color: "from-[#3E98C7]/10 to-[#67B3DA]/10",
                  borderColor: "border-[#3E98C7]/30",
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
                  title: "नौकरी की भूमिका / Job Role",
                  type: "role",
                  icon: HiOutlineUserGroup,
                  color: "from-[#3E98C7]/10 to-[#67B3DA]/10",
                  borderColor: "border-[#3E98C7]/30",
                  value:
                    teacherprefrence?.job_role?.length > 0
                      ? teacherprefrence.job_role.map(
                          (jobrole) => jobrole.jobrole_name
                        )
                      : ["Teacher"],
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-background p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-accent/50 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <item.icon className="w-6 h-6 text-accent" />
                    <h3 className="text-sm sm:text-base font-bold text-text">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    {item.type === "subject" ? (
                      item.value.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-2">
                          <h4 className="text-xs font-semibold text-secondary mb-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                            {category.categoryName}
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {category.subjects.map(
                              (subjectName, subjectIndex) => (
                                <span
                                  key={subjectIndex}
                                  className="px-2 py-1 bg-white text-primary border border-gray-200 rounded-md text-xs font-medium hover:border-accent transition-colors"
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
                            className="px-2 py-1 bg-white text-primary border border-gray-200 rounded-md text-xs font-medium hover:border-accent transition-colors"
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
            <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }} className="space-y-4">
              {/* Stepper Header */}
              <div className="bg-background p-3 sm:p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-base font-bold transition-all ${
                            currentStep > step
                              ? "bg-success text-white"
                              : currentStep === step
                              ? "bg-primary text-white ring-4 ring-primary/20"
                              : "bg-gray-200 text-secondary"
                          }`}
                        >
                          {currentStep > step ? <HiOutlineCheck className="w-6 h-6" /> : step}
                        </div>
                        <span className={`text-xs mt-1.5 font-medium hidden sm:block transition-colors ${
                          currentStep === step ? "text-primary font-bold" : currentStep > step ? "text-success" : "text-secondary"
                        }`}>
                          {step === 1 && "Class"}
                          {step === 2 && "Subject"}
                          {step === 3 && "Role"}
                        </span>
                      </div>
                      {step < totalSteps && (
                        <div className={`flex-1 h-1.5 mx-2 sm:mx-3 rounded-full transition-all duration-500 ${
                          currentStep > step ? "bg-success" : "bg-gray-300"
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
                
                {/* Mobile Step Labels */}
                <div className="block sm:hidden text-center">
                  <p className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg inline-block">
                    Step {currentStep} of {totalSteps}:{" "}
                    {currentStep === 1 && "Class / कक्षा"}
                    {currentStep === 2 && "Subject / विषय"}
                    {currentStep === 3 && "Role / भूमिका"}
                  </p>
                </div>
              </div>

              {/* Step Content */}
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 min-h-[280px]">
                {currentStep === 1 && (
                  <div className="space-y-2 animate-fadeIn">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <HiOutlineAcademicCap className="w-7 h-7 text-primary" />
                        <h3 className="text-lg sm:text-xl font-bold text-text">
                          Select Class Category / कक्षा श्रेणी चुनें
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-secondary ml-9">
                        Choose the educational levels / शिक्षा के स्तर का चयन करें
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-h-[240px] overflow-y-auto p-1.5 pr-2 custom-scrollbar">
                      {category?.map((cat) => (
                        <label
                          key={cat.id}
                          className="flex items-center space-x-2 p-2.5 sm:p-3 bg-white rounded-lg hover:bg-primary/5 border border-gray-200 hover:border-primary transition-all cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            {...register("class_category", {
                              required: "Please select at least one class category / कम से कम एक कक्षा श्रेणी चुनें",
                            })}
                            value={cat.id}
                            className="h-4 w-4 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary transition-all"
                          />
                          <span className="text-xs sm:text-sm text-text font-semibold">
                            {cat.name}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.class_category && (
                      <div className="text-red-500 text-sm flex items-center mt-2">
                        <HiOutlineExclamationCircle className="mr-1.5 h-4 w-4" />
                        {errors.class_category.message}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Preferred Subjects */}
                {currentStep === 2 && (
                  <div className="space-y-2 animate-fadeIn">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <HiOutlineBookOpen className="w-7 h-7 text-primary" />
                        <h3 className="text-lg sm:text-xl font-bold text-text">
                          Select Preferred Subjects / पसंदीदा विषय चुनें
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-secondary ml-9">
                        Choose subjects you can teach / जो विषय आप पढ़ा सकते हैं उन्हें चुनें
                      </p>
                    </div>
                    <div className="space-y-3 max-h-[240px] overflow-y-auto p-1.5 pr-2 custom-scrollbar">
                      {selectedClassCategories.length === 0 ? (
                        <div className="text-center py-8">
                          <HiOutlineAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-secondary font-medium">
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
                            <div key={categoryObj.id} className="space-y-2 bg-background p-2.5 rounded-lg border border-gray-200">
                              <h4 className="text-xs sm:text-sm font-bold text-primary mb-2 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                                {categoryObj.name}
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {categoryObj.subjects?.map((sub) => (
                                  <label
                                    key={sub.id}
                                    className="flex items-center space-x-2 p-2 sm:p-2.5 bg-white rounded-lg hover:bg-primary/5 border border-gray-200 hover:border-primary transition-all cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      {...register("prefered_subject", {
                                        required: "Please select at least one subject / कम से कम एक विषय चुनें",
                                      })}
                                      value={sub.id}
                                      className="h-4 w-4 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary transition-all"
                                    />
                                    <span className="text-xs sm:text-sm text-text font-medium">
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
                        <HiOutlineExclamationCircle className="mr-1.5 h-4 w-4" />
                        {errors.prefered_subject.message}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Job Role */}
                {currentStep === 3 && (
                  <div className="space-y-2 animate-fadeIn">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <HiOutlineUserGroup className="w-7 h-7 text-primary" />
                        <h3 className="text-lg sm:text-xl font-bold text-text">
                          Select Job Role / नौकरी की भूमिका चुनें
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-secondary ml-9">
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
                            className={`flex items-center space-x-2 p-2.5 sm:p-3 rounded-lg border transition-all "bg-white hover:bg-primary/5 border-gray-200 hover:border-primary cursor-pointer"
                            `}
                          >
                            <input
                              type="checkbox"
                              {...register("job_role")}
                              value={role.id}
                              className="h-4 w-4 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary transition-all"
                            />
                            <span className="text-xs sm:text-sm text-text font-semibold">
                              {role.jobrole_name}
                              
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
                {currentStep === 3 && errors.job_role && (
                  <div className="text-red-500 text-sm flex items-center mt-2">
                    <HiOutlineExclamationCircle className="mr-1.5 h-4 w-4" />
                    {errors.job_role.message}
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 p-2 sm:p-3 bg-background rounded-lg border border-gray-200">
                {!forceEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPrefrence(false);
                      setCurrentStep(1);
                      fetchPreferences();
                    }}
                    className="order-3 sm:order-1 w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold text-text bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    Cancel / रद्द करें
                  </button>
                )}

                <div className="order-1 sm:order-2 flex gap-2 w-full sm:w-auto">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-primary bg-white border-2 border-primary rounded-lg hover:bg-primary/5 transition-all"
                    >
                      <HiOutlineArrowLeft className="w-4 h-4" />
                      <span>Back / पीछे</span>
                    </button>
                  )}

                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all"
                    >
                      <span>Next / आगे</span>
                      <HiOutlineArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-success hover:bg-success/90 rounded-lg transition-all"
                    >
                      <HiOutlineCheck className="w-4 h-4" />
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
    </div>
  );
};

export default PrefrenceProfile;
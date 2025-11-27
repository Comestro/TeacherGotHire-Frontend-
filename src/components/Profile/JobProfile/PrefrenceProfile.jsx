import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  getClassCategory,
  getJob,
  getPrefrence,
  postPrefrence,
} from "../../../features/jobProfileSlice";
import {
  HiOutlineExclamationCircle,
  HiOutlinePencil,
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineCheck,
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineUserGroup,
  HiOutlineXMark
} from "react-icons/hi2";
import Loader from "../../Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import ErrorMessage from "../../ErrorMessage";

const PrefrenceProfile = ({ forceEdit = false }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formError, setFormError] = useState(null);
  const totalSteps = 2;

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
      job_role: [],
      prefered_subject: [],
    },
    mode: "onChange",
  });

  // Update form with fetched preferences
  useEffect(() => {
    if (teacherprefrence) {
      const previousJobRoles = (teacherprefrence.job_role || []).map(item => String(item.id));

      reset({
        class_category: (teacherprefrence.class_category || []).map(item => String(item.id)),
        job_role: previousJobRoles,
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

  const filteredSubjects = useMemo(() => {
    return selectedClassCategories.flatMap((catId) => {
      const categoryObj = category?.find((cat) => cat?.id === Number(catId));
      return categoryObj ? categoryObj.subjects : [];
    });
  }, [selectedClassCategories, category]);

  useEffect(() => {
    const currentSubjects = getValues("prefered_subject");
    const validSubjects = currentSubjects.filter((subId) =>
      filteredSubjects.some((sub) => sub?.id === Number(subId))
    );

    // Only update if the length differs to avoid infinite loop
    if (validSubjects.length !== currentSubjects.length) {
      setValue("prefered_subject", validSubjects);
    }
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
      case 1:
        isValid = await trigger("class_category");
        if (!isValid) setFormError("Please select at least one class category");
        break;
      case 2:
        isValid = await trigger("prefered_subject");
        if (!isValid) setFormError("Please select at least one subject");
        break;

      default:
        isValid = true;
    }

    return isValid;
  };

  const [isNavigating, setIsNavigating] = useState(false);

  const handleNext = async (e) => {
    e?.preventDefault();
    if (isNavigating) return;

    setIsNavigating(true);
    const isValid = await validateStep();
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
    setIsNavigating(false);
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep <= totalSteps) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data) => {
    const isValid = await validateStep();
    if (!isValid) return;

    // Filter out class categories that don't have any selected subjects
    const filteredClassCategories = data.class_category.filter(catId => {
      const categoryObj = category?.find(c => c.id === Number(catId));
      if (!categoryObj) return false;

      // Check if any subject from this category is selected
      const hasSelectedSubject = categoryObj.subjects?.some(sub =>
        data.prefered_subject.includes(String(sub.id))
      );

      return hasSelectedSubject;
    });

    // Update data with filtered categories
    const finalData = {
      ...data,
      class_category: filteredClassCategories
    };

    setIsLoading(true);
    try {
      await dispatch(postPrefrence(finalData)).unwrap();
      fetchPreferences();
      setIsEditingPrefrence(false);
      setCurrentStep(1);
      toast.success("Job preferences updated successfully!");

    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update preferences";
      setFormError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, title: "Class Category", icon: HiOutlineAcademicCap, desc: "Select levels" },
    { id: 2, title: "Subjects", icon: HiOutlineBookOpen, desc: "Choose subjects" },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {isLoading && <Loader />}

      {/* Header */}
      <div className="bg-white p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <HiOutlineAcademicCap className="w-6 h-6 text-primary" />
            Teaching Preferences
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your teaching profile and preferences
          </p>
        </div>
        {!forceEdit && (
          !isEditingPrefrence ? (
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
              onClick={() => setIsEditingPrefrence(true)}
            >
              <HiOutlinePencil className="w-4 h-4" />
              <span>Edit Preferences</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditingPrefrence(false);
                setCurrentStep(1);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
            >
              <HiOutlineXMark className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )
        )}
      </div>

      <div className="p-5">
        {!isEditingPrefrence && !forceEdit ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: "Class Categories",
                icon: HiOutlineAcademicCap,
                value: teacherprefrence?.class_category?.length > 0
                  ? teacherprefrence.class_category.map(c => c.name)
                  : ["Not Provided"],
                type: "tags"
              },
              {
                title: "Preferred Subjects",
                icon: HiOutlineBookOpen,
                value: teacherprefrence?.prefered_subject?.length > 0
                  ? (teacherprefrence.class_category || []).map(cat => ({
                    category: cat.name,
                    subjects: teacherprefrence.prefered_subject
                      .filter(sub => cat.subjects?.some(s => s.id === sub.id))
                      .map(s => s.subject_name)
                  }))
                  : [],
                type: "grouped"
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                  <item.icon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-gray-800 text-sm">{item.title}</h3>
                </div>

                <div className="space-y-2">
                  {item.type === "grouped" ? (
                    item.value.length > 0 ? (
                      item.value.map((group, i) => (
                        <div key={i} className="mb-2 last:mb-0">
                          <div className="text-xs font-semibold text-gray-500 mb-1.5">
                            {group.category}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {group.subjects.map((sub, j) => (
                              <span key={j} className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs font-medium text-gray-700">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">No preferences set</p>
                    )
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {item.value.map((val, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-medium text-gray-700">
                          {val}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
              <ErrorMessage
                message={formError}
                onDismiss={() => setFormError(null)}
                className="mb-6"
              />
              {/* Stepper */}
              <div className="mb-6 border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between max-w-2xl mx-auto relative">
                  <div className="absolute left-0 top-4 w-full h-0.5 bg-gray-200 -z-10" />

                  {steps.map((step) => (
                    <div key={step.id} className="flex flex-col items-center bg-white px-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${currentStep >= step.id
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-gray-300 text-gray-400"
                          }`}
                      >
                        {currentStep > step.id ? (
                          <HiOutlineCheck className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">{step.id}</span>
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p className={`text-xs font-semibold ${currentStep >= step.id ? "text-primary" : "text-gray-500"
                          }`}>
                          {step.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <div className="min-h-[350px] flex flex-col">
                <div className="flex-1 mb-6">
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Select Class Categories</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                          {category?.map((cat) => (
                            <label
                              key={cat.id}
                              className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${watch("class_category")?.includes(String(cat.id))
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                              <input
                                type="checkbox"
                                {...register("class_category", { required: "Select at least one category" })}
                                value={cat.id}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                              />
                              <span className="ml-3 text-sm font-medium text-gray-700">{cat.name}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Select Subjects</h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                          {selectedClassCategories.map((catId) => {
                            const categoryObj = category?.find(c => c.id === Number(catId));
                            if (!categoryObj) return null;
                            return (
                              <div key={categoryObj.id} className="border border-gray-200 rounded-md p-3">
                                <h4 className="font-semibold text-gray-800 mb-2 text-sm bg-gray-50 p-2 rounded">
                                  {categoryObj.name}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {categoryObj.subjects?.map((sub) => (
                                    <label
                                      key={sub.id}
                                      className={`flex items-center p-2 rounded border cursor-pointer transition-colors ${watch("prefered_subject")?.includes(String(sub.id))
                                        ? "border-primary bg-primary/5"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                      <input
                                        type="checkbox"
                                        {...register("prefered_subject", { required: "Select at least one subject" })}
                                        value={sub.id}
                                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                      />
                                      <span className="ml-2 text-sm text-gray-700">{sub.subject_name}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}


                  </AnimatePresence>
                </div>

                {/* Footer / Navigation */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={currentStep === 1 ? () => setIsEditingPrefrence(false) : handleBack}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <HiOutlineArrowLeft className="w-4 h-4" />
                    {currentStep === 1 ? "Cancel" : "Back"}
                  </button>

                  <div className="flex gap-3">
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={isNavigating}
                        className={`px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md shadow-sm transition-colors flex items-center gap-2 ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isNavigating ? '...' : 'Next'}
                        {!isNavigating && <HiOutlineArrowRight className="w-4 h-4" />}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm transition-colors flex items-center gap-2"
                      >
                        {isLoading ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <HiOutlineCheck className="w-4 h-4" />
                            Save
                          </>
                        )}
                      </button>
                    )}
                  </div>
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

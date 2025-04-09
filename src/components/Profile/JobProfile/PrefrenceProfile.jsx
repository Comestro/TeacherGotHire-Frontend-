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
import { HiExclamationCircle, HiPencil } from "react-icons/hi";
import Loader from "../../Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PrefrenceProfile = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

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

  const [isEditingPrefrence, setIsEditingPrefrence] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
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

  const onSubmit = async (data) => {
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
      toast.success("Job preferences updated successfully!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update preferences";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl">
      <ToastContainer position="top-right" autoClose={3000} />
      {isLoading && <Loader />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between md:gap-10 mb-6 pb-4 border-b border-gray-200">
        <div className="mb-3 sm:mb-0">
          <h2 className="text-2xl text-gray-900">Teaching Preferences</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your teaching preferences including subjects, grade levels,
            and job types
          </p>
        </div>
        {!isEditingPrefrence ? (
          <button
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] rounded-lg shadow-sm hover:shadow-md transition-all"
            onClick={() => setIsEditingPrefrence(true)}
          >
            <HiPencil className="size-5" />
            Edit Preferences
          </button>
        ) : (
          <button
            onClick={() => setIsEditingPrefrence(false)}
            className="text-md px-4 py-2 border border-gray-300 rounded-lg"
          >
            close
          </button>
        )}
      </div>

      <div className="mb-4 md:px-2">
        {!isEditingPrefrence ? (
          <div className="">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {[
                {
                  title: "Class Category",
                  value:
                    teacherprefrence?.class_category?.length > 0
                      ? teacherprefrence.class_category.map(
                          (class_category) => class_category.name
                        )
                      : ["Not Provided"],
                },
                {
                  title: "Job Role",
                  value:
                    teacherprefrence?.job_role?.length > 0
                      ? teacherprefrence.job_role.map(
                          (jobrole) => jobrole.jobrole_name
                        )
                      : ["Teacher"],
                },
                {
                  title: "Subject",
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
                  title: "Teacher Job Type",
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
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {item.title === "Subject" ? (
                      item.value.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-2">
                          <h4 className="text-sm font-medium text-gray-600 mb-1">
                            {category.categoryName}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {category.subjects.map(
                              (subjectName, subjectIndex) => (
                                <span
                                  key={subjectIndex}
                                  className="px-3 py-1 bg-[#F5F8FA] text-[#3E98C7] border border-[#3E98C7] rounded-full text-sm"
                                >
                                  {subjectName}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {item.value.map((val, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-[#F5F8FA] text-[#3E98C7] border border-[#3E98C7] rounded-full text-sm"
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
          <div className="">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-8 bg-white p-8 rounded-lg border border-gray-300"
            >
              <div className="pb-4 border-b border-gray-200">
                <p className="mt-2 text-sm text-gray-600">
                  Please update your teaching preferences below. This
                  information helps us match you with ideal opportunities.
                  Fields marked with <span className="text-red-500">*</span> are
                  required.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Class Category Section */}
                <div className="space-y-4">
                  <div className="mb-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Class Category
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Select the educational levels you're comfortable teaching
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 h-44 max-h-44 overflow-y-auto p-4 border border-gray-200 rounded-lg">
                    {category?.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          {...register("class_category", {
                            required: "Please select at least one category",
                          })}
                          value={cat.id}
                          className="h-5 w-5 text-teal-600 border-2 border-gray-300 rounded-md focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">
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

                {/* Job Role Section */}
                <div className="space-y-4">
                  <div className="mb-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Job Role
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      "Teacher" is required. Add additional roles if desired
                      (sorted alphabetically)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 h-44 max-h-44 p-4 overflow-y-auto border border-gray-200 rounded-lg">
                    {jobRole
                      ?.slice()
                      .sort((a, b) =>
                        a.jobrole_name.localeCompare(b.jobrole_name)
                      )
                      ?.map((role) => (
                        <label
                          key={role.id}
                          className={`flex items-center space-x-3 p-2 bg-gray-50 rounded-md ${
                            role.id === 4 ? "" : "hover:bg-gray-100"
                          } transition-colors cursor-pointer`}
                        >
                          <input
                            type="checkbox"
                            {...register("job_role")}
                            value={role.id}
                            className="h-5 w-5 text-teal-600 border-2 border-gray-300 rounded-md focus:ring-teal-500"
                            disabled={role.id === 4} // Teacher can't be unchecked
                          />
                          <span className="text-sm text-gray-700">
                            {role.jobrole_name}
                            {role.id === 4 && (
                              <span className="ml-2 text-xs text-gray-500">
                                (Required)
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>

                {/* Preferred Subjects Section */}
                <div className="space-y-4">
                  <div className="mb-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Preferred Subjects
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Select subjects you're qualified to teach
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 h-44 max-h-44 overflow-y-auto p-4 border border-gray-200 rounded-lg">
                    {selectedClassCategories.length === 0 ? (
                      <div className="text-sm text-gray-500 p-2">
                        {category?.length === 0
                          ? "Loading subjects..."
                          : "Select class categories to view available subjects"}
                      </div>
                    ) : (
                      selectedClassCategories.map((catId) => {
                        const categoryObj = category?.find(
                          (c) => c.id === Number(catId)
                        );
                        if (!categoryObj) return null;

                        return (
                          <div key={categoryObj.id} className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">
                              {categoryObj.name} Subjects
                            </h4>
                            {categoryObj.subjects?.map((sub) => (
                              <label
                                key={sub.id}
                                className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  {...register("prefered_subject", {
                                    required: "Please select at least one subject",
                                  })}
                                  value={sub.id}
                                  className="h-5 w-5 text-teal-600 border-2 border-gray-300 rounded-md focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {sub.subject_name}
                                </span>
                              </label>
                            ))}
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

                {/* Teacher Job Type Section */}
                <div className="space-y-4">
                  <div className="mb-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Teacher Job Type
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose your preferred employment type(s)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-1 h-44 max-h-44 overflow-y-auto p-4 border border-gray-200 rounded-lg">
                    {teacherjobRole?.map((role) => (
                      <label
                        key={role.id}
                        className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          {...register("teacher_job_type", {
                            
                          })}
                          value={role.id}
                          className="h-5 w-5 text-teal-600 border-2 border-gray-300 rounded-md focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">
                          {role.teacher_job_name}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.teacher_job_type && (
                    <div className="text-red-500 text-sm flex items-center mt-2">
                      <HiExclamationCircle className="mr-1.5 h-4 w-4" />
                      {errors.teacher_job_type.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="sm:mr-auto">
                  <p className="text-xs text-gray-500">
                    Unsaved changes will be lost. Review all sections before
                    submitting.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPrefrence(false);
                    fetchPreferences();
                  }}
                  className="px-6 py-2.5 text-sm font-medium text-[#3E98C7] transition-colors rounded-lg hover:bg-gray-50"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-[#3E98C7] rounded-lg shadow-sm transform transition-transform duration-200"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrefrenceProfile;
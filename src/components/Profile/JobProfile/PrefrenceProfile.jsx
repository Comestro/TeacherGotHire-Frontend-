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
import { IoMdAddCircleOutline } from "react-icons/io";
import Loader from "../../Loader";

const PrefrenceProfile = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);


  // Fetch Data on Component Mount
  useEffect(() => {
    dispatch(getClassCategory());
    dispatch(getJob());
    dispatch(getSubject());
    dispatch(getTeacherjobType());
    dispatch(getPrefrence());
  }, [dispatch]);

  const category = useSelector((state) => state?.jobProfile?.classCategories);
  const jobRole = useSelector((state) => state?.jobProfile?.jobRole);
  const subject = useSelector((state) => state?.jobProfile?.subject);
  const teacherjobRole = useSelector(
    (state) => state.jobProfile.teacherjobRole
  );
  const teacherprefrence = useSelector((state) => state.jobProfile?.prefrence);

  const [isEditingPrefrence, setIsEditingPrefrence] = useState(false);

  const [error, setError] = useState("");

  console.log("category", category);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (teacherprefrence) {
      Object.entries(teacherprefrence).forEach(([key, value]) => {
        if (
          key === "job_role" ||
          key === "prefered_subject" ||
          key === "teacher_job_type"
        ) {
          setValue(
            key,
            value.map((item) => item.id)
          );
        } else {
          setValue(key, value?.id || value);
        }
      });
    }
  }, [teacherprefrence, setValue]);

  // Fetch Preferences again after update
  const fetchPreferences = () => {
    dispatch(getPrefrence());
  };

  // Form Submission Handler
  const onSubmit = async (data) => {
    setIsLoading(true); // Show loader

    try {
      await updateTeacherPrefrence(data);
      dispatch(postPrefrence(data));
      fetchPreferences();
      setIsEditingPrefrence(false);
      setIsLoading(false); // Hide loader

    } catch (err) {
      setIsLoading(false); // Hide loader on error
      setError("Failed to update preferences. Please try again.");
    }
  };

  return (
    <div className="p-4 border rounded-xl">
       {isLoading && (<Loader/>)}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="mb-3 sm:mb-0">
          <h2 className="text-2xl font-bold text-gray-900">
            Teaching Preferences
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your teaching preferences including subjects, grade levels,
            and job types
          </p>
        </div>
        {!isEditingPrefrence && (
          <button
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] rounded-lg shadow-sm hover:shadow-md transition-all"
            onClick={() => setIsEditingPrefrence(true)}
          >
            <HiPencil className="size-5" />
            Edit Preferences
          </button>
        )}
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4 md:px-2 ">
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
                      : ["Not Provided"],
                },
                {
                  title: "Subject",
                  value:
                    teacherprefrence?.prefered_subject?.length > 0
                      ? teacherprefrence.prefered_subject.map(
                          (subject) => subject.subject_name
                        )
                      : ["Not Provided"],
                },
                {
                  title: "Preferred Job",
                  value:
                    teacherprefrence?.teacher_job_type?.length > 0
                      ? teacherprefrence.teacher_job_type.map(
                          (jobrole) => jobrole.teacher_job_name
                        )
                      : ["Not Provided"],
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 flex items-start gap-4 transition"
                >
                  {/* Icon Placeholder */}
                  <div className="flex-shrink-0 w-12 h-12 bg-[#E6F4FA] flex items-center justify-center rounded-md">
                    <span className="text-[#3E98C7] font-bold text-lg">
                      {item.title.charAt(0)}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="flex flex-col w-full">
                    <h3 className="text-sm font-semibold text-[#3E98C7] uppercase tracking-wide">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.value.map((val, i) => (
                        <span
                          key={i}
                          className="bg-[#E6F4FA] text-[#3E98C7] text-xs font-medium py-1 px-3 rounded-full"
                        >
                          {val}
                        </span>
                      ))}
                    </div>
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
              {/* Form Header */}
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
                  <div className="grid grid-cols-1 gap-3  h-44 max-h-44 overflow-y-auto p-4 border border-gray-200 rounded-lg">
                    {category?.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          {...register("class_category", { required: true })}
                          value={cat.id}
                          className="h-5 w-5 text-teal-600 border-2 border-gray-300 rounded-md focus:ring-teal-500"
                          defaultChecked={teacherprefrence?.class_category?.some(
                            (item) => item.id === cat.id
                          )}
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
                      Please select at least one category
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
                      Choose positions you're interested in (sorted
                      alphabetically)
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
                          className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            {...register("job_role", { required: true })}
                            value={role.id}
                            className="h-5 w-5 text-teal-600 border-2 border-gray-300 rounded-md focus:ring-teal-500"
                            defaultChecked={teacherprefrence?.job_role?.some(
                              (item) => item.id === role.id
                            )}
                          />
                          <span className="text-sm text-gray-700">
                            {role.jobrole_name}
                          </span>
                        </label>
                      ))}
                  </div>
                  {errors.job_role && (
                    <div className="text-red-500 text-sm flex items-center mt-2">
                      <HiExclamationCircle className="mr-1.5 h-4 w-4" />
                      Please select at least one role
                    </div>
                  )}
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
                    {subject?.map((sub) => (
                      <label
                        key={sub.id}
                        className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          {...register("prefered_subject", { required: true })}
                          value={sub.id}
                          className="h-5 w-5 text-teal-600 border-2 border-gray-300 rounded-md focus:ring-teal-500"
                          defaultChecked={teacherprefrence?.prefered_subject?.some(
                            (item) => item.id === sub.id
                          )}
                        />
                        <span className="text-sm text-gray-700">
                          {sub.subject_name}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.prefered_subject && (
                    <div className="text-red-500 text-sm flex items-center mt-2">
                      <HiExclamationCircle className="mr-1.5 h-4 w-4" />
                      Please select at least one subject
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
                          {...register("teacher_job_type", { required: true })}
                          value={role.id}
                          className="h-5 w-5 text-teal-600 border-2 border-gray-300 rounded-md focus:ring-teal-500"
                          defaultChecked={teacherprefrence?.teacher_job_type?.some(
                            (item) => item.id === role.id
                          )}
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
                      Please select at least one job type
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Action Buttons Section */}
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
                  className="px-6 py-2.5 text-sm font-medium text-[#3E98C7]  transition-colors rounded-lg hover:bg-gray-50"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-[#3E98C7]  rounded-lg shadow-sm transform transition-transform duration-200"
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

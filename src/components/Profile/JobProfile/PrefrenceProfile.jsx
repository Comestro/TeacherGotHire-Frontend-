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
import { HiPencil } from "react-icons/hi";

const PrefrenceProfile = () => {
  const dispatch = useDispatch();

  

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
  const teacherjobRole = useSelector((state) => state.jobProfile.teacherjobRole);
  const teacherprefrence = useSelector((state) => state.jobProfile?.prefrence);

  const [isEditingPrefrence, setIsEditingPrefrence] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (teacherprefrence) {
      Object.entries(teacherprefrence).forEach(([key, value]) => {
        if (key === "job_role" || key === "prefered_subject" || key === "teacher_job_type") {
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
    try {
      await updateTeacherPrefrence(data);
      dispatch(postPrefrence(data));
      fetchPreferences();
      setIsEditingPrefrence(false);
    } catch (err) {
      setError("Failed to update preferences. Please try again.");
    }
  };

  return (
    <div className="px-2 py-2 ">
      <div className="flex  mb-4 items-center justify-between">
        <h2 className="text-xl font-bold text-gray-600">
          Preference Information
        </h2>
        {!isEditingPrefrence && (
          <button
            className="text-sm font-medium px-6 py-2 bg-[#3E98C7] text-white rounded-md shadow-md transition flex items-center gap-1"
            onClick={() => setIsEditingPrefrence(true)}
          >
            Edit
            <HiPencil className="size-5 " />
          </button>
        )}
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4 px-2">
        {!isEditingPrefrence ? (
          <div className="">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {[
                {
                  title: "Class Category",
                  value:
                    teacherprefrence?.class_category?.name || "Not Provided",
                },
                {
                  title: "Job Role",
                  value:
                    teacherprefrence?.job_role?.length > 0
                      ? teacherprefrence.job_role
                        .map((jobrole) => jobrole.jobrole_name)
                        .join(", ")
                      : "Not Provided",
                },
                {
                  title: "Subject",
                  value:
                    teacherprefrence?.prefered_subject?.length > 0
                      ? teacherprefrence.prefered_subject
                        .map((subject) => subject.subject_name)
                        .join(", ")
                      : "Not Provided",
                },
                {
                  title: "Preferred Job",
                  value:
                    teacherprefrence?.teacher_job_type?.length > 0
                      ? teacherprefrence.teacher_job_type
                        .map((jobrole) => jobrole.teacher_job_name)
                        .join(", ")
                      : "Not Provided",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-50 rounded-lg shadow p-4 flex items-start gap-4 transition"
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
                    <p className="text-gray-500 font-medium text-sm mt-1">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 bg-white p-5 rounded-md shadow-sm border"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Class Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Category
                </label>
                <select
                  {...register("class_category", { required: true })}
                  className="border border-gray-300 rounded-md px-2 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-300"
                  defaultValue={teacherprefrence?.class_category?.id || ""}
                >
                  <option value="">Select a category</option>
                  {category?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {errors.class_category && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>

              {/* Job Role */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Job Role
                </label>
                <select
                  {...register("job_role", { required: true })}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  multiple
                  defaultValue={teacherprefrence?.job_role?.map((role) => role.id) || []}
                >
                  {jobRole?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.jobrole_name}
                    </option>
                  ))}
                </select>
                {errors.job_role && (
                  <span className="text-red-500 text-sm">This field is required</span>
                )}
              </div>


              {/* Preferred Subjects */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Subject
                </label>
                <div className="space-y-3">
                {subject?.map((sub) => (
                    <div key={sub.id} className="flex items-center">
                      <input
                        type="checkbox"
                        {...register("prefered_subject", { required: true })}
                        value={sub.id}
                        id={`subject-${sub.id}`}
                        // defaultChecked={teacherprefrence?.prefered_subject?.some(
                        //   (selectedSub) => selectedSub.id === sub.id
                        // )}
                        className="h-4 w-4 text-teal-500 border-gray-300 focus:ring-teal-500"
                        defaultChecked={teacherprefrence?.prefered_subject?.some(
                          (item) => item.id === sub.id
                        )}
                      />
                      <label
                        htmlFor={`subject-${sub.id}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {sub.subject_name}
                      </label>
                    </div>
                  ))}

                </div>
                {errors.prefered_subject && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>

              {/* Teacher Job Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher Job Type
                </label>
                <div className="space-y-3">
                  {teacherjobRole?.map((role) => (
                    <div key={role.id} className="flex items-center">
                      <input
                        type="checkbox"
                        {...register("teacher_job_type", { required: true })}
                        value={role.id}
                        id={role.id}
                        className="h-4 w-4 text-teal-500 border-gray-300 focus:ring-teal-500"
                      />
                      <label
                        htmlFor={`teacherjobRole-${role.id}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {role.teacher_job_name}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.teacher_job_type && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsEditingPrefrence(false);
                  fetchPreferences();
                }}
                className="py-2 px-5 text-sm font-medium text-[#3E98C7] border border-[#3E98C7] rounded-lg hover:bg-blue-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-7 text-sm font-medium text-white bg-[#3E98C7] rounded-lg transition"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PrefrenceProfile;

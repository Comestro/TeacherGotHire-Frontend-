import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../Button";
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

const PrefrenceProfile = () => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    dispatch(getClassCategory());
    dispatch(getJob());
    dispatch(getSubject());
    dispatch(getTeacherjobType());
    dispatch(getPrefrence());
  }, []);

  const category = useSelector((state) => state?.jobProfile?.classCategories);
  const jobRole = useSelector((state) => state?.jobProfile?.jobRole);
  const subject = useSelector((state) => state?.jobProfile?.subject);
  const teacherjobRole = useSelector(
    (state) => state?.jobProfile?.teacherjobRole
  );
  const teacherprefrence = useSelector((state) => state?.jobProfile?.prefrence);

  console.log("teacherprefrence", teacherprefrence);
  console.log("Role:", teacherprefrence.teacher_job_type);

  const [isEditingPrefrence, setIsEditingPrefrence] = useState(false);
  const [error, setError] = useState("");

  const fetchPreferences = () => {
    dispatch(getPrefrence());
  };
  useEffect(() => {
    if (teacherprefrence) {
      Object.entries(teacherprefrence).forEach(([key, value]) =>
        setValue(key, value)
      );
    }
  }, [teacherprefrence, setValue]);

  const onSubmit = async (data) => {
    try {
      console.log("form data", data);
      await updateTeacherPrefrence(data);
      dispatch(postPrefrence(data));
      fetchPreferences();
      setIsEditingPrefrence(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="">
      <h2 className="text-xl font-bold mb-6 text-gray-600">
        Prefrence Information
      </h2>
      <div className="mb-4 pl-2">
        {!isEditingPrefrence ? (
          <div className="">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {/* Class Category */}
              <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                <h3 className="text-xs font-semibold text-teal-700 uppercase tracking-wide">
                  Class Category
                </h3>
                <p className="text-gray-800 text-sm font-medium mt-1">
                  {(teacherprefrence.class_category &&
                    teacherprefrence.class_category.name) ||
                    "N/A"}
                </p>
              </div>

              {/* Job Role */}
              <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                <h3 className="text-xs font-semibold text-teal-700 uppercase tracking-wide">
                  Job Role
                </h3>
                <p className="text-gray-800 text-sm font-medium mt-1">
                  {(teacherprefrence.job_role &&
                    teacherprefrence.job_role.jobrole_name) ||
                    "N/A"}
                </p>
              </div>

              {/* Subject */}
              <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                <h3 className="text-xs font-semibold text-teal-700 uppercase tracking-wide">
                  Subject
                </h3>
                <p className="text-gray-800 text-sm font-medium mt-1">
                  {teacherprefrence.prefered_subject &&
                  teacherprefrence.prefered_subject.length > 0
                    ? teacherprefrence.prefered_subject
                        .map((subject) => subject.subject_name)
                        .join(", ")
                    : "N/A"}
                </p>
              </div>

              {/* Preferred Job */}
              <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                <h3 className="text-xs font-semibold text-teal-700 uppercase tracking-wide">
                  Preferred Job
                </h3>
                <p className="text-gray-800 text-sm font-medium mt-1">
                  {teacherprefrence.teacher_job_type &&
                  teacherprefrence.teacher_job_type.length > 0
                    ? teacherprefrence.teacher_job_type
                        .map((jobrole) => jobrole.teacher_job_name)
                        .join(", ")
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 flex justify-end">
              <button
                className="text-sm font-medium px-5 py-2 bg-[#3E98C7] text-white rounded-md shadow transition-all"
                onClick={() => setIsEditingPrefrence(true)}
              >
                Edit Preferences
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Class Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Class Category
                  </label>
                  <select
                    {...register("class_category", { required: true })}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select a category</option>
                    {category?.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
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
                  >
                    <option value="">Select a job role</option>
                    {jobRole?.map((role) => (
                      <option key={role.id} value={role.jobrole_name}>
                        {role.jobrole_name}
                      </option>
                    ))}
                  </select>
                  {errors.jobRole && (
                    <span className="text-red-500 text-sm">
                      This field is required
                    </span>
                  )}
                </div>

                {/* Preferred Subjects */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
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
                          className="h-4 w-4 text-teal-500 border-gray-300 focus:ring-teal-500"
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
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Teacher Job Type
                  </label>
                  <div className="space-y-3">
                    {teacherjobRole?.map((role) => (
                      <div key={role.id} className="flex items-center">
                        <input
                          type="checkbox"
                          {...register("teacher_job_type", { required: true })}
                          value={role.id}
                          id={`teacherjobRole-${role.id}`}
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
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditingPrefrence(false)}
                  className="py-2 px-5 text-sm font-medium text-[#3E98C7] bg-white border border-[#3E98C7] rounded-lg hover:bg-teal-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-7 text-sm font-medium text-white bg-[#3E98C7] rounded-lg hover:bg-teal-700 transition"
                >
                  Save
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

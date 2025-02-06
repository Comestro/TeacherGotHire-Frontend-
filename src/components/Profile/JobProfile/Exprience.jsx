import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  getJob,
  putExprienceProfile,
  getExprienceProfile,
  postExprienceProfile,
  delExprienceProfile,
} from "../../../features/jobProfileSlice";
import { IoMdAddCircleOutline } from "react-icons/io";
import { HiOutlineBriefcase, HiOutlineTrash, HiPencil } from "react-icons/hi";
import moment from "moment";
import Loader from "../../Loader";

const formatDate = (date) => {
  if (!date) return "N/A";
  return moment(date).format("MMMM D, YYYY"); // Example: January 19, 2025
};
const Experience = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Assuming you use navigate elsewhere

  // Selectors
  const experienceData = useSelector(
    (state) => state?.jobProfile?.exprienceData || []
  );

  const jobRole = useSelector((state) => state?.jobProfile?.jobRole);
  console.log("job", jobRole);

  // State Variables
  const [isEndDateDisabled, setIsEndDateDisabled] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null); // Tracks the index being edited
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors: formErrors },
  } = useForm();

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getJob());
    dispatch(getExprienceProfile());
  }, [dispatch]);


  // Refetch profile data
  const fetchProfile = () => {
    dispatch(getExprienceProfile());
  };

  // Form Submission Handler
  const onSubmit = async (data) => {
    try {
      setLoading(true); // Optionally add a loading state while submitting
      const payload = {
        institution: data.institution,
        // achievements: data.achievements,
        role: data.job_role, // Updated field name
        description: data.description,
        start_date: data.start_date,
        // end_date: data.end_date,
        ...(data.end_date && { end_date: data.end_date }),
        ...(data.achievements && { achievements: data.achievements }),
      };

      if (editingIndex !== null) {
        const id = experienceData[editingIndex].id;

        await dispatch(putExprienceProfile({ payload, id })).unwrap();
        fetchProfile();
      } else {
        await dispatch(postExprienceProfile(payload)).unwrap(); // Dispatch with new data
        fetchProfile();
      }

      // Reset form and editing state
      setEditingIndex(null);
      setIsEditing(false);
      reset();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.warn(err);
      setErrors(err);
    }
  };

  // Edit Handler
  const handleEdit = (index) => {
    setEditingIndex(index);
    setIsEditing(true);
    setErrors({});
    setError("");
    const experience = experienceData[index];
    // Populate form fields with existing data
    Object.keys(experience).forEach((key) => {
      // Adjust the role field to match the select's expected value
      if (key === "role" && experience[key].id) {
        setValue("job_role", experience[key].id);
      } else {
        setValue(key, experience[key]);
      }
    });
  };

  // Delete Handler
  const handleDelete = async (index) => {
    try {
      const id = experienceData[index].id;
      await dispatch(delExprienceProfile({ id: id })).unwrap();
      fetchProfile();
    } catch (err) {
      setError(err.message);
    }
  };

  // Cancel Editing Handler
  const handleCancel = () => {
    setEditingIndex(null);
    setIsEditing(false);
    reset();
    setError("");
  };

  return (
    <div className="px-4 sm:px-6 mt-8 py-6 rounded-xl bg-white border border-gray-200">
      {/* Enhanced Header */}
      {loading && (<Loader/>)}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="mb-3 sm:mb-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Professional Experience
          </h2>
          <p className="text-sm text-gray-500">
            Manage your teaching positions and institutional experience
          </p>
        </div>
        {!isEditing && (
          <button
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] transition-colors rounded-lg shadow-sm hover:shadow-md"
            onClick={() => {
              reset();
              setIsEditing(true);
              setEditingIndex(null);
            }}
          >
            <IoMdAddCircleOutline className="size-5" />
            Add Experience
          </button>
        )}
      </div>

      {/* No Data State */}
      {experienceData.length < 1 && !isEditing && (
        <div className="p-6 text-center rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
          <HiOutlineBriefcase className="mx-auto size-12 text-gray-400 mb-3" />
          <h3 className="text-gray-500 font-medium">No experience added yet</h3>
          <p className="text-sm text-gray-400 mt-1">
            Click 'Add Experience' to get started
          </p>
        </div>
      )}

      {/* Experience List */}
      {!isEditing ? (
        <div className="space-y-4">
          {experienceData.map((experience, index) => (
            <div
              key={index}
              className="group relative p-5 rounded-xl border border-gray-200 hover:border-[#3E98C7]/30 transition-all duration-200 bg-white hover:shadow-sm"
            >
              {/* Action Buttons */}
              <div className="absolute bottom-2 right-4 flex gap-2 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(index)}
                  className="p-1.5 text-gray-500 hover:text-[#3E98C7] rounded-lg hover:bg-gray-100"
                >
                  <HiPencil className="size-5" />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="p-1.5 text-gray-500 hover:text-red-500 rounded-lg hover:bg-gray-100"
                >
                  <HiOutlineTrash className="size-5" />
                </button>
              </div>

              <div className="flex items-start gap-4">
                {/* Institution Logo */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#3E98C7] to-[#67B3DA] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                  {experience.institution?.[0] || "N/A"}
                </div>

                {/* Experience Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {experience.institution || "N/A"}
                      </h3>
                      <p className="text-sm text-[#3E98C7] font-medium">
                        {experience.role?.jobrole_name || "N/A"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(experience.start_date)} –{" "}
                      {formatDate(experience.end_date)}
                    </p>
                  </div>

                  {/* Description & Achievements */}
                  <div className="space-y-2">
                    {experience.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {experience.description}
                      </p>
                    )}
                    {/* {experience.achievements && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-gray-500">
                          ACHIEVEMENTS:
                        </span>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {experience.achievements}
                        </p>
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-lg space-y-4 border mb-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Institution Field */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Institution <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Institution"
                className="w-full border-b border-gray-300 p-2 focus:outline-none focus:ring-blue-400"
                {...register("institution", {
                  required: "Institution is required",
                })}
              />
              {/* Display form validation errors */}
              {formErrors.institution && (
                <span className="text-sm text-red-500">
                  {formErrors.institution.message}
                </span>
              )}
              {/* Display API errors */}
              {errors.institution && (
                <span className="text-sm text-red-500">
                  {errors.institution}
                </span>
              )}
            </div>

            {/* Job Role Field */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Job Role <span className="text-red-500">*</span>
              </label>
              <select
                {...register("job_role", { required: "Job Role is required" })}
                className="border-b border-gray-300 px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                defaultValue=""
              >
                <option value="" disabled>
                  Select a job role
                </option>
                {jobRole?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.jobrole_name}
                  </option>
                ))}
              </select>
              {/* Display form validation errors */}
              {formErrors.job_role && (
                <span className="text-red-500 text-sm">
                  {formErrors.job_role.message}
                </span>
              )}
              {/* Display API errors */}
              {errors.job_role && (
                <span className="text-sm text-red-500">{errors.job_role}</span>
              )}
            </div>

            {/* Start Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border-b border-gray-300 p-2 focus:outline-none focus:ring-blue-400"
                {...register("start_date", {
                  required: "Start Date is required",
                })}
              />
              {/* Display form validation errors */}
              {formErrors.start_date && (
                <span className="text-sm text-red-500">
                  {formErrors.start_date.message}
                </span>
              )}
              {/* Display API errors */}
              {errors.start_date && (
                <span className="text-sm text-red-500">
                  {errors.start_date}
                </span>
              )}
            </div>

            {/* End Date Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="end_date"
                  className="text-sm font-medium text-gray-700"
                >
                  End Date <span className="text-red-500">*</span>
                </label>
                <label className="flex items-center text-sm text-gray-500 hover:text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[#3E98C7] border-gray-300 rounded focus:ring-[#3E98C7] mr-2"
                    onChange={(e) => setIsEndDateDisabled(e.target.checked)}
                  />
                  <span className="whitespace-nowrap">
                    Currently Working Here
                  </span>
                </label>
              </div>

              <div className="relative">
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  className={`w-full px-4 py-2.5 border-b border-gray-300 focus:ring-2 ${
                    isEndDateDisabled
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 focus:ring-[#3E98C7]"
                  } transition-colors`}
                  {...register("end_date")}
                  disabled={isEndDateDisabled}
                />

                {/* Error Messages */}
                <div className="mt-1">
                  {formErrors.end_date && (
                    <span className="text-sm text-red-500">
                      {formErrors.end_date.message}
                    </span>
                  )}
                  {errors.end_date && (
                    <span className="text-sm text-red-500">
                      {errors.end_date}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Achievements Field */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Achievements
              </label>
              <textarea
                rows="3"
                placeholder="Enter Achievements"
                className="w-full border-b border-gray-300 p-2 focus:outline-none focus:ring-blue-400"
                {...register("achievements")}
              ></textarea>
              {/* Display form validation errors */}
              {formErrors.achievements && (
                <span className="text-sm text-red-500">
                  {formErrors.achievements.message}
                </span>
              )}
              {/* Display API errors */}
              {errors.achievements && (
                <span className="text-sm text-red-500">
                  {errors.achievements}
                </span>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="3"
                placeholder="Enter Description"
                className="w-full border-b border-gray-300 p-2 focus:outline-none focus:ring-blue-400"
                {...register("description", {
                  required: "Description is required",
                })}
              ></textarea>
              {/* Display form validation errors */}
              {formErrors.description && (
                <span className="text-sm text-red-500">
                  {formErrors.description.message}
                </span>
              )}
              {/* Display API errors */}
              {errors.description && (
                <span className="text-sm text-red-500">
                  {errors.description}
                </span>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 items-center mt-2">
            <button
              type="button"
              className="border border-[#3E98C7] text-[#3E98C7] py-1.5 px-5 rounded-lg"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              Save
            </button>
          </div>

          {/* Display Error Message if Any */}
          {error && (
            <div className="text-red-500 text-center mt-2">{error}</div>
          )}
          {errors.non_field_errors && (
            <div className="text-red-500 text-center mt-2">
              {errors.non_field_errors}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default Experience;

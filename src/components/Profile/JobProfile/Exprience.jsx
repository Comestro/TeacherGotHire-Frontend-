import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Input from "../../Input";
import Button from "../../Button";
import {
  getJob,
  putExprienceProfile,
  getExprienceProfile,
  postExprienceProfile,
  delExprienceProfile,
} from "../../../features/jobProfileSlice";
import { IoMdAddCircleOutline } from "react-icons/io";
import { HiOutlineTrash, HiPencil } from "react-icons/hi";
import moment from "moment";

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
  const [isEndDateDisabled, setIsEndDateDisabled] = useState(false)
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

  // Loader Component
  const Loader = () => (
    <div className="flex justify-center items-center py-4">
      <div className="loader border-t-[#3E98C7] border-4 w-8 h-8 rounded-full animate-spin"></div>
    </div>
  );

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
    <div className="px-5 mt-8 py-4 rounded-lg bg-gray-50 shadow">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-600">Teacher Experience</h2>
        {loading && <Loader />}
        {!isEditing && (
          <button
            className="text-white flex items-center bg-[#3E98C7] transition-colors px-4 py-2 rounded-md text-sm font-medium"
            onClick={() => {
              reset();
              setIsEditing(true);
              setEditingIndex(null); // Reset editingIndex when adding
            }}
          >
            Add <IoMdAddCircleOutline className="size-4 ml-1 mt-1" />
          </button>
        )}
      </div>

      {/* Display "No data available" when there's no experience and not editing */}
      {experienceData.length < 1 && !isEditing && (
        <div className="px-4 ">
          <h1 className="text-gray-500 pb-2">No data available</h1>
        </div>
      )}

      {/* Display Existing Experiences */}
      {!isEditing ? (
        <div className="border-b border-gray-300 px-2 pb-2  mb-4">
          <div className="flex flex-col gap-4  ">
            {experienceData &&
              experienceData.map((experience, index) => (
                <div
                  key={index}
                  className=" group transition-shadow mb-6 bg-white rounded-lg p-5 shadow-sm relative"
                >
                  {/* Edit and Delete Buttons */}
                  <div className="absolute top-3 right-3 flex space-x-3 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <HiPencil className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <HiOutlineTrash className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="flex items-start">
                    {/* Institution Logo or Placeholder */}
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-xl">
                        {experience.institution?.[0] || "N/A"}
                      </span>
                    </div>
                    <div className="flex-1">
                      {/* Job Details */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {experience.institution || "N/A"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            <strong>
                              {experience.role?.jobrole_name || "N/A"}
                            </strong>
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          <p>
                            {formatDate(experience.start_date)} -{" "}
                            {formatDate(experience.end_date)}
                          </p>
                        </div>
                      </div>

                      {/* Conditionally Render Achievements */}
                      {experience.achievements &&
                        experience.achievements !== "" && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <strong>Achievements:</strong>{" "}
                              {experience.achievements}
                            </p>
                          </div>
                        )}

                      {/* Conditionally Render Description */}
                      {experience.description &&
                        experience.description !== "" && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <strong>Description:</strong>{" "}
                              {experience.description}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        /* Experience Form */
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
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            <div className="flex flex-col space-y-2">
                {/* Checkbox to disable End Date */}
                <label className="flex items-center text-sm font-medium text-gray-600">
                  <input
                    type="checkbox"
                    className="mr-2"
                    onChange={(e) => setIsEndDateDisabled(e.target.checked)}
                  />
                  Till Now
                </label>

                {/* End Date Label */}
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-600">
                  End Date <span className="text-red-500">*</span>
                </label>

                {/* End Date Input */}
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  className="w-full border-b border-gray-300 p-2 focus:outline-none focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  {...register("end_date")}
                  disabled={isEndDateDisabled}
                />

                {/* Display form validation errors */}
                {formErrors.end_date && (
                  <span className="text-sm text-red-500">
                    {formErrors.end_date.message}
                  </span>
                )}

                {/* Display API errors */}
                {errors.end_date && (
                  <span className="text-sm text-red-500">{errors.end_date}</span>
                )}
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
              className="bg-[#3E98C7] text-white py-1.5 px-7 rounded-lg"
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

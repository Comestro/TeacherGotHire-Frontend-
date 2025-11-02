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
import { HiOutlinePlusCircle } from "react-icons/hi2";
import { HiOutlineBriefcase, HiOutlineTrash, HiOutlinePencil } from "react-icons/hi";
import moment from "moment";
import Loader from "../../Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        toast.success("Experience updated successfully!");
      } else {
        await dispatch(postExprienceProfile(payload)).unwrap(); // Dispatch with new data
        fetchProfile();
        toast.success("Experience added successfully!");
      }

      // Reset form and editing state
      setEditingIndex(null);
      setIsEditing(false);
      reset();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      
      setErrors(err);
      toast.error(err.response?.data?.message || "Failed to save experience");
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
      toast.success("Experience deleted successfully!");
    } catch (err) {
      setError(err.message);
      toast.error(err.response?.data?.message || "Failed to delete experience");
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
    <div className="bg-gradient-to-br from-white to-background/30 rounded-xl border border-secondary/30 p-6 md:p-8 shadow-sm">
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
      {/* Enhanced Header */}
      {loading && (<Loader/>)}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-secondary/20">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-bold text-text mb-2 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HiOutlineBriefcase className="text-2xl text-primary" aria-hidden="true" />
            </div>
            Professional Experience
            <span className="ml-2 text-secondary text-sm font-normal">/ पेशेवर अनुभव</span>
          </h2>
          <p className="text-sm text-secondary ml-14">
            Manage your teaching positions and institutional experience
          </p>
        </div>
        {!isEditing && (
          <button
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => {
              reset();
              setIsEditing(true);
              setEditingIndex(null);
            }}
          >
            <HiOutlinePlusCircle className="h-5 w-5" aria-hidden="true" />
            Add Experience
          </button>
        )}
      </div>

      {/* No Data State */}
      {experienceData.length < 1 && !isEditing && (
        <div className="p-8 text-center rounded-xl bg-background border-2 border-dashed border-secondary/30">
          <div className="p-4 bg-primary/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <HiOutlineBriefcase className="h-10 w-10 text-primary" aria-hidden="true" />
          </div>
          <h3 className="text-text font-bold text-lg mb-1">No experience added yet</h3>
          <p className="text-sm text-secondary">
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
              className="group relative p-6 rounded-xl border border-secondary/30 hover:border-primary/40 transition-all duration-200 bg-gradient-to-br from-white to-background/30 hover:shadow-md"
            >
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleEdit(index)}
                  className="p-2 text-secondary hover:text-primary hover:bg-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary transition-all duration-200"
                  aria-label="Edit experience"
                >
                  <HiOutlinePencil className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="p-2 text-error hover:text-error/80 hover:bg-error/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-error transition-all duration-200"
                  aria-label="Delete experience"
                >
                  <HiOutlineTrash className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-start gap-4">
                {/* Institution Logo */}
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                  {experience.institution?.[0] || "N/A"}
                </div>

                {/* Experience Details */}
                <div className="flex-1 min-w-0 pr-20">
                  <h3 className="text-lg font-bold text-text mb-1">
                    {experience.institution || "N/A"}
                  </h3>
                  <p className="text-sm text-primary font-semibold mb-2">
                    {experience.role?.jobrole_name || "N/A"}
                  </p>
                  <p className="text-sm text-secondary mb-3">
                    {formatDate(experience.start_date)} – {formatDate(experience.end_date)}
                  </p>

                  {experience.description && (
                    <p className="text-sm text-text/70 line-clamp-2">
                      {experience.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-xl space-y-6 border-2 border-[#3E98C7]/20 mb-4 mx-6 shadow-lg"
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
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3E98C7] focus:border-[#3E98C7] transition-all"
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
                className="border-2 border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#3E98C7] focus:border-[#3E98C7] transition-all"
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
                  className={`w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 ${
                    isEndDateDisabled
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 focus:ring-[#3E98C7] focus:border-[#3E98C7]"
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
          <div className="flex justify-end gap-4 items-center mt-6 pt-4 border-t-2 border-[#3E98C7]/20">
            <button
              type="button"
              className="border-2 border-[#3E98C7] text-[#3E98C7] py-2 px-6 rounded-lg hover:bg-[#3E98C7]/10 transition-all transform hover:scale-105"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] hover:from-[#2A6476] hover:to-[#3E98C7] text-white font-medium rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
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

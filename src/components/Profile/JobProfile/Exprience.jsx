import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
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
  const [editingIndex, setEditingIndex] = useState(null); // Tracks the index being edited
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
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
      console.log("Form Data:", data);
      if (editingIndex !== null) {
        const id = experienceData[editingIndex].id;
        const payload = {
          institution: data.institution,
          achievements: data.achievements,
          role: data.job_role, // Updated field name
          description: data.description,
          start_date: data.start_date,
          end_date: data.end_date,
        };
        console.log("Update Payload:", payload, id);

        await dispatch(putExprienceProfile({ payload, id })).unwrap();
        fetchProfile();
      } else {
        console.log("New Experience Data:", data);
        await dispatch(postExprienceProfile(data)).unwrap(); // Dispatch with new data
        fetchProfile();
      }

      // Reset form and editing state
      setEditingIndex(null);
      setIsEditing(false);
      reset();
    } catch (err) {
      setError(err.message);
    }
  };

  // Edit Handler
  const handleEdit = (index) => {
    setEditingIndex(index);
    setIsEditing(true);
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
    <div className="px-5 mt-8">
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
            Add Experience <IoMdAddCircleOutline className="size-4 ml-1 mt-1" />
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
                <div key={index} className="transition-shadow px-4">
                  <div className="relative ">
                    {/* Edit and Delete Buttons */}
                    <div className="absolute top-2 right-2 flex space-x-4 items-center">
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <HiPencil className="h-6 w-6 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <HiOutlineTrash className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-1 pb-3">
                    <p className="text-sm text-gray-500">
                      <strong className="text-lg">
                        {experience.institution || "N/A"}
                      </strong>{" "}
                      served as a{" "}
                      <strong>{experience.role?.jobrole_name || "N/A"}</strong>{" "}
                      from <strong>{experience.start_date || "N/A"}</strong> to{" "}
                      <strong>{experience.end_date || "N/A"}</strong>.
                    </p>
                    <p className="text-sm text-gray-500">
                      Achievements: {experience.achievements || "N/A"}.
                    </p>
                    <p className="text-sm text-gray-500">
                      Description: {experience.description || "N/A"}.
                    </p>
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
                {...register("institution", { required: "Institution is required" })}
              />
              {errors.institution && (
                <span className="text-sm text-red-500">
                  {errors.institution.message}
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
              {errors.job_role && (
                <span className="text-red-500 text-sm">
                  {errors.job_role.message}
                </span>
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
                {...register("start_date", { required: "Start Date is required" })}
              />
              {errors.start_date && (
                <span className="text-sm text-red-500">
                  {errors.start_date.message}
                </span>
              )}
            </div>

            {/* End Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border-b border-gray-300 p-2 focus:outline-none focus:ring-blue-400"
                {...register("end_date", { required: "End Date is required" })}
              />
              {errors.end_date && (
                <span className="text-sm text-red-500">
                  {errors.end_date.message}
                </span>
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
              {errors.achievements && (
                <span className="text-sm text-red-500">
                  {errors.achievements.message}
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
                {...register("description", { required: "Description is required" })}
              ></textarea>
              {errors.description && (
                <span className="text-sm text-red-500">
                  {errors.description.message}
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
        </form>
      )}
    </div>
  );
};

export default Experience;
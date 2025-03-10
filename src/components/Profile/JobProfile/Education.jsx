import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  getEducationProfile,
  getQualification,
  postEducationProfile,
  putEducationProfile,
  delEducationProfile,
  resetError,
} from "../../../features/jobProfileSlice";
import { HiOutlineAcademicCap, HiOutlineTrash, HiPencil } from "react-icons/hi";
import { IoMdAddCircleOutline } from "react-icons/io";
import Loader from "../../Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Education = () => {
  const dispatch = useDispatch();
  const qualification = useSelector(
    (state) => state?.jobProfile?.qualification
  );

  const { error, educationData } = useSelector(
    (state) => state.jobProfile || []
  );
  console.log("Education Data", educationData);
  console.log("Error:", error);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch education data on component mount
  useEffect(() => {
    dispatch(getQualification());
    dispatch(getEducationProfile());
  }, []);

  const fetchProfile = () => {
    dispatch(getEducationProfile());
  };

  // Handle saving or updating education data
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (editingIndex !== null) {
        const id = educationData[editingIndex].id;
        const payload = {
          institution: data.institution,
          qualification: data.qualification,
          year_of_passing: data.year_of_passing,
          grade_or_percentage: data.grade_or_percentage,
        };
        await dispatch(putEducationProfile({ payload, id })).unwrap();
        fetchProfile();
        toast.success("Education details updated successfully!");
      } else {
        await dispatch(postEducationProfile(data)).unwrap();
        fetchProfile();
        toast.success("Education details added successfully!");
      }

      setIsEditing(false);
      setEditingIndex(null);
      reset();
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.message || "Failed to save education details");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setIsEditing(true);
    const experience = educationData[index];
    Object.keys(experience).forEach((key) => {
      setValue(key, experience[key]);
    });
  };

  const handleDelete = async (index) => {
    try {
      const id = educationData[index].id;
      await dispatch(delEducationProfile({ id: id })).unwrap();
      fetchProfile();
      toast.success("Education details deleted successfully!");
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.message || "Failed to delete education details");
    }
  };

  return (
    <div className="px-4 sm:px-6 mt-8 py-6 rounded-xl bg-white  border border-gray-200">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Enhanced Header */}
      {loading && <Loader />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="mb-3 sm:mb-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Education Background
          </h2>
          <p className="text-sm text-gray-500">
            Manage your academic qualifications and educational history
          </p>
        </div>
        {!isEditing && (
          <button
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] transition-colors rounded-lg shadow-sm hover:shadow-md"
            onClick={() => {
              reset();
              setIsEditing(true);
            }}
          >
            <IoMdAddCircleOutline className="size-5" />
            Add Education
          </button>
        )}
      </div>

      {/* No Data State */}
      {educationData.length < 1 && !isEditing && (
        <div className="p-6 text-center rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
          <HiOutlineAcademicCap className="mx-auto size-12 text-gray-400 mb-3" />
          <h3 className="text-gray-500 font-medium">No education added yet</h3>
          <p className="text-sm text-gray-400 mt-1">
            Click 'Add Education' to get started
          </p>
        </div>
      )}

      {/* Education List */}
      {!isEditing ? (
        <div className="space-y-4">
          {educationData.map((experience, index) => (
            <div
              key={index}
              className="group relative p-5 rounded-xl border border-gray-200 hover:border-[#3E98C7]/30 transition-all duration-200 bg-white hover:shadow-sm"
            >
              <div className="absolute bottom-4 right-4 flex gap-2  group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    handleEdit(index);
                    setIsEditing(true);
                    setEditingRowIndex(index);
                  }}
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
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#3E98C7] to-[#67B3DA] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                  {experience.qualification?.name?.[0] || "E"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {experience.qualification?.name || "N/A"}
                      </h3>
                      <p className="text-sm text-[#3E98C7] font-medium">
                        {experience.institution || "N/A"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 whitespace-nowrap">
                      Passing Year : {experience.year_of_passing || "N/A"}
                    </p>
                  </div>

                  <div className="">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">
                        {/^[A-Da-d]$/.test(experience.grade_or_percentage)
                          ? "Grade:"
                          : "Percentage:"}
                      </span>{" "}
                      {experience.grade_or_percentage || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="University Name"
                className="w-full px-4 py-2.5 border-b border-gray-300 focus:ring-2 focus:ring-[#3E98C7]"
                {...register("institution", {
                  required: "Institution is required",
                })}
              />
              {errors.institution && (
                <span className="text-red-500 text-sm">
                  {errors.institution.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualification <span className="text-red-500">*</span>
              </label>
              <select
                {...register("qualification", {
                  required: "Qualification is required",
                })}
                className="w-full px-4 py-2.5 border-b border-gray-300 focus:ring-2 focus:ring-[#3E98C7] bg-white"
              >
                <option value="" disabled>
                  Select qualification
                </option>
                {qualification.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.qualification && (
                <span className="text-red-500 text-sm">
                  {errors.qualification.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year of Passing <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="YYYY"
                className="w-full px-4 py-2.5 border-b border-gray-300 focus:ring-2 focus:ring-[#3E98C7]"
                maxLength={4}
                {...register("year_of_passing", {
                  required: "Year is required",
                  pattern: {
                    value: /^\d{4}$/,
                    message: "Please enter a valid 4-digit year (e.g., 2023)",
                  },
                  validate: (value) => {
                    const currentYear = new Date().getFullYear();
                    if (value < 1900 || value > currentYear) {
                      return `Year must be between 1900 and ${currentYear}`;
                    }
                    return true;
                  },
                })}
              />
              {errors.year_of_passing && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.year_of_passing.message}
                </p>
              )}
              {error && <span className="text-red-500 text-sm">{error}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade/Percentage
              </label>
              <input
                type="text"
                placeholder="Enter grade or percentage"
                className="w-full px-4 py-2.5 border-b border-gray-300 focus:ring-2 focus:ring-[#3E98C7]"
                {...register("grade_or_percentage", {
                  required: "Grade or percentage is required",
                  validate: (value) => {
                    const isGrade = /^[A-Da-d]$/.test(value);
                    const isPercentage = /^\d{1,3}%?$/.test(value);

                    if (isGrade) {
                      return true;
                    } else if (isPercentage) {
                      const numericValue = parseFloat(value.replace("%", ""));
                      if (numericValue >= 0 && numericValue <= 100) {
                        return true;
                      }
                      return "Percentage must be between 0% and 100%";
                    }
                    return "Please enter a valid grade (A, B, C, D) or a percentage (0-100%)";
                  },
                })}
              />
              {errors.grade_or_percentage && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.grade_or_percentage.message}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row-reverse sm:justify-start gap-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              Save Education
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                reset();
                dispatch(resetError());
              }}
              className="border border-[#3E98C7] text-[#3E98C7] py-1.5 px-5 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Education;

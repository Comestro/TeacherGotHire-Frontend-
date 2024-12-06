import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { FiEdit2 } from "react-icons/fi";
import Input from "../../Input";
import {  updateExprienceProfile } from "../../../services/jobProfileService";
import { getExprienceProfile,postExprienceProfile} from "../../../features/jobProfileSlice"; // Replace with actual Redux action


const Experience = () => {
  const dispatch = useDispatch();
  const experienceData = useSelector((state) => state || []); // Adjust state selector as needed
  
  const [editingIndex, setEditingIndex] = useState(null); // Track which education record is being edited
  const [error, setError] = useState("");

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  // Fetch education data on component mount
  useEffect(() => {
    dispatch(getExprienceProfile());
  }, [dispatch]);

  // Handle saving or updating education data
  const onSubmit = async (data) => {
    try {
      if (editingIndex !== null) {
        // Update existing education record
        const updatedData = [...experienceData];
        updatedData[editingIndex] = data;
        await updateExprienceProfile(data); // Call API for update
        dispatch(postExprienceProfile(updatedData)); // Dispatch updated data
      } else {
        // Add new education record
        await updateExprienceProfile(data); // Call API to save
        dispatch(postExprienceProfile([...xperienceDat, data])); // Dispatch with new data
      }
      setEditingIndex(null); // Exit editing mode
      reset(); // Reset form
    } catch (err) {
      setError(err.message);
    }
  };

  // Set form values for editing
  const handleEdit = (index) => {
    setEditingIndex(index);
    const selectedExperience = experienceData[index];
    Object.keys(selectedExperience).forEach((key) => setValue(key, selectedExperience[key]));
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingIndex(null);
    reset();
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Manage Experience</h3>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-100 p-4 rounded-md shadow-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label=""
              className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
              placeholder="Enter Qualification"
              type="text"
              {...register("qualification", { required: true })}
            />
            {errors.qualification && <span className="text-red-500 text-sm">{errors.qualification.message}</span>}
          </div>
          <div>
            <Input
              label="Institution"
              className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
              placeholder="Enter Institution"
              type="text"
              {...register("institution", { required: true })}
            />
            {errors.institution && <span className="text-red-500 text-sm">{errors.institution.message}</span>}
          </div>
          <div>
            <Input
              label="Year of Passing"
              className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
              placeholder="Enter Year of Passing"
              type="text"
              {...register("year_of_passing", { required: true })}
            />
            {errors.year_of_passing && <span className="text-red-500 text-sm">{errors.year_of_passing.message}</span>}
          </div>
          <div>
            <Input
              label="Grade or Percentage"
              className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
              placeholder="Enter Grade or Percentage"
              type="text"
              {...register("grade_or_percentage")}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          {editingIndex !== null && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editingIndex !== null ? "Update" : "Save"}
          </button>
        </div>
      </form>

      {/* Existing Education Records */}
      <div className="mt-6 space-y-4">
        {experienceData && experienceData.length > 0 ? (
          experienceData.map((education, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-white p-4 rounded-md shadow-md border"
            >
              <div>
                <p><strong>Qualification:</strong> {education.qualification}</p>
                <p><strong>Institution:</strong> {education.institution}</p>
                <p><strong>Year of Passing:</strong> {education.year_of_passing}</p>
                <p><strong>Grade/Percentage:</strong> {education.grade_or_percentage}</p>
              </div>
              <button
                onClick={() => handleEdit(index)}
                className="text-blue-500 hover:text-blue-700"
              >
                <FiEdit2 size={20} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No education records added yet.</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-4">
          Error: {error}
        </p>
      )}
    </div>
  );
};

export default Experience;

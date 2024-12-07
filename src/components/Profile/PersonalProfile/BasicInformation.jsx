import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { FiEdit2 } from "react-icons/fi";
import Input from "../../Input";
import {  updateBasicProfile } from "../../../services/profileServices";
import { getBasic,postBasic} from "../../../features/personalProfileSlice"; // Replace with actual Redux action



const BasicInformation = () => {
  const dispatch = useDispatch();
  const basicData = useSelector((state) => state || []); // Adjust state selector as needed
  
  const [editingIndex, setEditingIndex] = useState(null); // Track which education record is being edited
  const [error, setError] = useState("");

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  // Fetch education data on component mount
  useEffect(() => {
    dispatch(getBasic());
  }, [dispatch]);

  // Handle saving or updating education data
  const onSubmit = async (data) => {
    try {
      if (editingIndex !== null) {
        // Update existing basic record
        const updatedData = [...basicData];
        updatedData[editingIndex] = data;
        await updateBasicProfile(data); // Call API for update
        dispatch(postBasic(updatedData)); // Dispatch updated data
      } else {
        // Add new education record
        await updateBasicProfile(data); // Call API to save
        dispatch(postBasic([...basicData, data])); // Dispatch with new data
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
    const selectedBasicData = basicData[index];
    Object.keys(selectedBasicData).forEach((key) => setValue(key, selectedBasicData[key]));
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingIndex(null);
    reset();
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4"> Basic Information</h3>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-100 p-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Name"
              className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
              placeholder="Enter Name"
              type="text"
              {...register("name", { required: true })}
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
          </div>
          <div>
            <Input
              label="Email"
              className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
              placeholder="Enter Email"
              type="text"
              {...register("email", { required: true })}
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>
          <div>
            <Input
              label="Phone Number"
              className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
              placeholder="Phone Number"
              type="text"
              {...register("phone_no", { required: true })}
            />
            {errors.phone_no && <span className="text-red-500 text-sm">{errors.phone_no.message}</span>}
          </div>
          <div>
            <Input
              label="Location"
              className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
              placeholder="Enter Location"
              type="text"
              {...register("location")}
            />
            {errors.location && <span className="text-red-500 text-sm">{errors.location.message}</span>}
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
            className="bg-black text-white px-5 py-2 rounded hover:bg-gray-900 w-32"
          >
            {editingIndex !== null ? "Update" : "Save"}
          </button>
        </div>
      </form>

      {/* Existing Education Records */}
      <div className="mt-6 space-y-4">
        {basicData.length > 0 ? (
          basicData.map((basicData, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-white p-4 rounded-md shadow-md border"
            >
              <div>
                <p><strong>Name:</strong> {basicData.name }</p>
                <p><strong>Email:</strong> {basicData.email }</p>
                <p><strong>Phone:</strong> {basicData.phone }</p>
                <p><strong>Location:</strong> {basicData.location}</p>
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
          <p className="text-gray-500 text-sm">No basic records added yet.</p>
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

export default BasicInformation;

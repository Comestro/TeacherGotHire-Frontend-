import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import Input from "../../Input";
import Button from "../../Button";
import {  updateExprienceProfile } from "../../../services/jobProfileService";
import { getExprienceProfile,postExprienceProfile} from "../../../features/jobProfileSlice"; // Replace with actual Redux action


const Experience = () => {
  const dispatch = useDispatch();
  const experienceData = useSelector((state) => state.jobProfile.exprienceData || []); // Adjust state selector as needed
  console.log("expreienceData",experienceData)
  const jobRole = useSelector((state) => state?.jobProfile?.jobRole);

  const [editingIndex, setEditingIndex] = useState(null); // Track which education record is being edited
  const [isEditingExprience, setIsEditingExprience] = useState(false);
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

  return (
    <div className="max-w-3xl px-5 mt-auto">
    <h2 className="text-xl font-bold mb-6 text-gray-700 text-center underline">
      Teacher Exprience
    </h2>
    <div className="mb-4 pl-2">
      <p className="text-gray-700 font-semibold mb-2">Exprience</p>
      {!isEditingExprience ? (
        <div className="border border-gray-300 rounded-lg shadow-sm p-4 bg-white">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div>
              <h3 className="text-sm font-semibold text-teal-600 uppercase">
               Achievenments
              </h3>
              <p className="text-gray-700 text-md">
                {experienceData && experienceData.achievements || 'N/A'}
              </p>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-teal-600 uppercase">
                  Description
                </h3>
                <p className="text-gray-700 text-md">
                  {experienceData && experienceData.description || 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-teal-600 uppercase">
                  Start_Date
                </h3>
                <p className="text-gray-700 text-md">
                  {experienceData && experienceData.start_date || 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-teal-600 uppercase">
                  End_Date
                </h3>
                <p className="text-gray-700 text-md">
                  {experienceData && experienceData.end_date || 'N/A'}
                </p>
              </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              className="text-white bg-teal-600 hover:bg-teal-700 transition-colors px-6 py-2 rounded-md text-sm font-medium"
              onClick={() => setIsEditingExprience(true)}
            >
              Edit Preferences
            </button>
          </div>
        </div>
)  : (
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-100 p-4 rounded-md shadow-md">
      <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Role
                </label>
                <select
                  {...register("job_role", { required: true })}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {jobRole.map((jobRole) => (
                    <option
                      key={jobRole.id}
                      value={jobRole.jobrole_name}
                      label={jobRole.jobrole_name}
                    ></option>
                  ))}
                </select>

                {errors.jobRole && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>
      
         <div>
           <Input
            label="Start-date"
            className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
            placeholder="Enter Grade or Percentage"
            type="date"
            {...register("start_date")}
          />
          {errors.Start_date && <span className="text-red-500 text-sm">{errors.Start_date.message}</span>}
        </div>
         <div>
           <Input
            label="Last-date"
            className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
            placeholder="Enter Grade or Percentage"
            type="date"
            {...register("end_date")}
          />
          {errors.Last_date && <span className="text-red-500 text-sm">{errors.Last_date.message}</span>}
        </div>
        <div>
          <Input
            label="Achivements"
            className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
            placeholder="Enter your Role"
            type="text"
            {...register("achievements", { required: true })}
          />
          {errors.achivements && <span className="text-red-500 text-sm">{errors.achivements.message}</span>}
        </div>
        <div>
          <Input
            label="Discription"
            className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
            placeholder="Enter your Role"
            type="text"
            {...register("description", { required: true })}
          />
          {errors.discription && <span className="text-red-500 text-sm">{errors.discription.message}</span>}
        </div>
      </div>
      <Button
            onClick={() => {
              setIsEditingExprience(false);
            }}
            type="button"
            className="w-full bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"
          >
            Cancle
          </Button>
          <Button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"
          >
            Save
          </Button>
    </form>   
      )}
    </div>
    <hr className="mb-4" />
  </div>
  );
};

export default Experience;

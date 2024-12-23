import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { getJobPrefrence, getPrefrence } from "../../../features/jobProfileSlice";
import { updateTeacherJobPrefrenceLocation } from "../../../services/jobProfileService";
import axios from "axios";
import { getPincodeUrl } from "../../../store/configue"; // Pincode API URL from config

const JobPrefrenceLocation = () => {
  const dispatch = useDispatch();
  const teacherprefrence = useSelector((state) => state?.jobProfile.prefrence);
  console.log("teacherprefrence",teacherprefrence)
  const jobLocations = useSelector(
    (state) => state.jobProfile.prefrenceLocation || []
  ); // Redux state
  const [isEditing, setIsEditing] = useState(false); // Edit mode
  const [editIndex, setEditIndex] = useState(null); // Index for editing
 
  const [isFormVisible, setIsFormVisible] = useState(false); 
   const [apiError, setApiError] = useState(""); // API error messages

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch initial job preferences on component mount
  useEffect(() => {
    dispatch(getPrefrence());
    dispatch(getJobPrefrence()); // Fetch job preferences from Redux store
  }, [dispatch]);

  // Handle Pincode Change
  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    if (pincode.length === 6) {
      try {
        setApiError("");
        const response = await axios.get(`${getPincodeUrl()}${pincode}`);
        if (response.data && response.data[0].Status === "Success") {
          const postOffice = response.data[0].PostOffice[0];
          setValue("state", postOffice.State);
          setValue("district", postOffice.District);
        } else {
          setApiError("Invalid Pincode or no data found");
          setValue("state", "");
          setValue("district", "");
        }
      } catch (error) {
        setApiError("Failed to fetch pincode details");
      }
    }
  };


const onSubmit = async (data) => {
    try {
      // Add preference_id to the data
      const locationData = {
        ...data,
        preference: teacherprefrence?.id, // Add the preference ID from Redux state
      };
  
      if (isEditing) {
        // Update existing location
        locationData.id = jobLocations[editIndex].id; // Include location ID for updates
      }
      console.log("Dispatching location data:", locationData);
      await dispatch(updateTeacherJobPrefrenceLocation(locationData)).unwrap();
      
     // await dispatch(updateTeacherJobPrefrenceLocation(locationData)).unwrap(); // Dispatch action
    //   reset(); // Reset the form
      setIsEditing(false); // Exit editing mode
      setEditIndex(null); // Clear edit index
      setIsFormVisible(false); // Close the form
    } catch (err) {
      console.error("Error saving location:", err);
      setApiError("Failed to save location. Please try again.");
    }
  };
  

  // Handle Edit Button Click
  const handleEdit = (index) => {
    const location = jobLocations[index];
    setValue("pincode", location.pincode);
    setValue("state", location.state);
    setValue("district", location.district);
    setValue("block", location.block);
    setValue("area", location.area);
    setIsEditing(true);
    setEditIndex(index);
  };

  //Handle Delete Button Click Later I will implemet
    const handleDelete = async(index) => {
      try {
        const locationToDelete = jobLocations[index];
        await dispatch(updateJobPrefrenceLocation({ id: locationToDelete.id, delete: true })).unwrap(); // Pass a delete flag or action
       await dispatch(updateTeacherJobPrefrenceLocation());
      } catch (err) {
        console.error("Error deleting location:", err);
        setApiError("Failed to delete location. Please try again.");
      }
    };

  return (
    <div className="mt-5">
      <h2 className="text-xl font-bold mb-4 text-gray-600 ">
        Job Preference Locations
      </h2>

      {/* Display Locations in a Table */}
      {jobLocations.length > 0 && (
        <table className="min-w-full border-collapse border border-gray-300 mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Pincode</th>
              <th className="border border-gray-300 px-4 py-2">State</th>
              <th className="border border-gray-300 px-4 py-2">District</th>
              <th className="border border-gray-300 px-4 py-2">Block</th>
              <th className="border border-gray-300 px-4 py-2">Area</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobLocations.map((location, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {location.pincode}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {location.state}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {location.district}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {location.block}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {location.area}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded mr-2"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Form to Add/Edit Loca
       <div className="space-y-4">
      {/* Add button to open form */}
      {!isFormVisible && (
        <button
          onClick={() => {
            setIsFormVisible(true);
            setIsEditing(false); // Reset editing state
          }}
          className="px-4 py-2 text-sm text-white bg-[#3E98C7] rounded hover:bg-blue-500"
        >
          Add Location
        </button>
      )}

      {/* Form section */}
      {isFormVisible && (
        <div className="border p-4 rounded">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            {isEditing ? "Edit Location" : "Add Location"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  {...register("pincode", { required: true })}
                  onChange={handlePincodeChange}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
                {errors.pincode && (
                  <p className="text-red-500 text-sm mt-1">Pincode is required.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  {...register("state")}
                  readOnly
                  className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  {...register("district")}
                  readOnly
                  className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block
                </label>
                <input
                  type="text"
                  {...register("block")}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area
                </label>
                <input
                  type="text"
                  {...register("area")}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
            <button
                type="button"
                onClick={() => setIsFormVisible(false)} // Close form
                className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-[#3E98C7] rounded"
              >
                {isEditing ? "Update Location" : "Add Location"}
              </button>
              
            </div>
          </form>
        </div>
      )}

      {apiError && <p className="text-red-500 mt-4">{apiError}</p>}
    
    </div>
 
     
    
    
  );
};

export default JobPrefrenceLocation;

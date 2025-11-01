import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  getJobPrefrence,
  getPrefrence,
  postJobPrefrence,
  editJobPrefrence,
  deleteJobPrefrence,
} from "../../../features/jobProfileSlice";
import axios from "axios";
import { getPincodeUrl } from "../../../store/configue";
import { IoLocationSharp } from "react-icons/io5";
import { HiOutlineTrash, HiPencil } from "react-icons/hi";
import { toast } from "react-toastify";

const JobPrefrenceLocation = ({ onLocationSuccess }) => {
  const dispatch = useDispatch();
  const teacherprefrence = useSelector((state) => state?.jobProfile.prefrence);
  console.log("teacherprefrence", teacherprefrence);
  const jobLocations = useSelector(
    (state) => state.jobProfile.prefrenceLocation || []
  );
  const { attempts, interview } = useSelector((state) => state.examQues);
  const {userData} = useSelector((state)=>state.auth)
  console.log("interview",attempts );

  const passedOfflineExam =  attempts?.some(
    (attempt) => attempt?.isqualified === true && attempt?.exam?.type === "offline"
  );

  const gradeCheck = interview;

  const bothConditonCheck = passedOfflineExam || gradeCheck;

  const [isEditing, setIsEditing] = useState(false); // Edit mode
  const [editIndex, setEditIndex] = useState(); // Index for editing
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [postOffices, setPostOffices] = useState([]);

  const [apiError, setApiError] = useState(""); // API error messages
  const [fieldErrors, setFieldErrors] = useState({}); // Field-specific errors

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

  const fetchjobrefrence = () => {
    dispatch(getJobPrefrence());
  };

  // Function to reset form completely
  const resetFormCompletely = () => {
    reset({
      pincode: "",
      state: "",
      city: "",
      block: "",
      area: "",
      post_office: ""
    });
    setPostOffices([]);
    setApiError("");
    setFieldErrors({}); // Clear field errors
  };

  // Function to handle showing add form
  const handleShowAddForm = () => {
    resetFormCompletely(); // Reset form completely
    setIsFormVisible(true);
    setIsEditing(false);
    setEditIndex(null);
    setEditingRowIndex(null);
  };

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    // Clear area error when pincode changes (new location)
    if (fieldErrors.area) {
      setFieldErrors(prev => ({ ...prev, area: null }));
    }
    
    if (pincode.length === 6) {
      try {
        setApiError("");
        const response = await axios.get(`${getPincodeUrl()}${pincode}`);
        console.log("response", response);

        if (response.data && response.data[0].Status === "Success") {
          const postOffices = response.data[0].PostOffice; // Array of post offices

          if (postOffices && postOffices.length > 0) {
            setValue("state", postOffices[0].State);
            setValue("city", postOffices[0].District);
            setValue("post_office", ""); // Clear any previous value
            setPostOffices(postOffices); // Set post offices for dropdown
          } else {
            setApiError("No post offices found for the given pincode.");
            setValue("state", "");
            setValue("city", "");
            setPostOffices([]); // Clear dropdown
          }
        } else {
          setApiError("Invalid Pincode or no data found.");
          setValue("state", "");
          setValue("city", "");
          setPostOffices([]);
        }
      } catch (error) {
        console.error("Error fetching pincode details:", error);
        setApiError("Failed to fetch pincode details.");
      }
    } else {
      // Clear fields if pincode is not 6 digits
      setValue("state", "");
      setValue("city", "");
      setPostOffices([]);
    }
  };

  // Function to handle area input change
  const handleAreaChange = (e) => {
    // Clear area error when user starts typing
    if (fieldErrors.area) {
      setFieldErrors(prev => ({ ...prev, area: null }));
    }
  };

  const onSubmit = async (data) => {
    try {
      // Clear previous errors
      setApiError("");
      setFieldErrors({});
      
      // Add preference_id to the data
      const locationData = {
        ...data,
        user: userData?.id, // Add the preference ID from Redux state
      };
      if (isEditing) {
        // Update existing location
        const locationForEdit = jobLocations[editIndex].id;
        const editData = {
          ...data,
        };

        await dispatch(
          editJobPrefrence({ editData, id: locationForEdit })
        ).unwrap();
        fetchjobrefrence();
      } else {
        console.log("Dispatching location data:", locationData);
        await dispatch(postJobPrefrence(locationData)).unwrap();
        fetchjobrefrence();
        
        // Call the success callback if provided
        if (onLocationSuccess) {
          onLocationSuccess();
        }
      }
      
      // Reset form and close
      resetFormCompletely();
      setIsEditing(false);
      setEditIndex(null);
      setIsFormVisible(false);
      setEditingRowIndex(null);
    } catch (err) {
      console.error("Complete error object structure:");
      console.error(err);
      console.error("Stringified error:", JSON.stringify(err, null, 2));
      
      // Most aggressive approach - check every possible path
      let errorFound = false;
      
      // All possible paths where the error could be nested
      const errorPaths = [
        err,
        err?.response,
        err?.response?.data,
        err?.data,
        err?.payload,
        err?.error,
        err?.message,
        err?.response?.data?.response,
        err?.response?.data?.data,
        err?.data?.response,
        err?.data?.data,
        err?.payload?.response,
        err?.payload?.data
      ];
      
      // Check each path for area error
      for (const path of errorPaths) {
        if (path && typeof path === 'object') {
          if (path.area) {
            let areaError = path.area;
            if (Array.isArray(areaError)) {
              areaError = areaError[0];
            }
            console.log("Found area error:", areaError);
            setFieldErrors({ area: areaError });
            errorFound = true;
            
            // Also show toast
            toast.error(`Area Error: ${areaError}`, {
              position: "top-right",
              autoClose: 3000,
            });
            break;
          }
        }
      }
      
      // If still not found, search the stringified version
      if (!errorFound) {
        const errorStr = JSON.stringify(err);
        
        // Look for the exact pattern in the string
        const patterns = [
          /"area":\s*\[\s*"([^"]+)"/,
          /"area":\s*"([^"]+)"/,
          /area.*?already exists/i,
          /This area name already exists/i
        ];
        
        for (const pattern of patterns) {
          const match = errorStr.match(pattern);
          if (match) {
            const message = match[1] || "This area name already exists.";
            console.log("Found area error via regex:", message);
            setFieldErrors({ area: message });
            
            toast.error(`Area Error: ${message}`, {
              position: "top-right",
              autoClose: 3000,
            });
            errorFound = true;
            break;
          }
        }
      }
      
      // If still nothing found, show generic error but check for specific strings
      if (!errorFound) {
        const errorStr = JSON.stringify(err).toLowerCase();
        
        if (errorStr.includes("area") && errorStr.includes("exist")) {
          setFieldErrors({ area: "This area name already exists." });
          toast.error("Area Error: This area name already exists.", {
            position: "top-right",
            autoClose: 3000,
          });
        } else if (errorStr.includes("preference") || errorStr.includes("location")) {
          setApiError("You can add only 5 preference locations");
        } else {
          setApiError("An error occurred. Please try again.");
          
          // Show detailed error in toast for debugging
          toast.error(`Debug: ${JSON.stringify(err)}`, {
            position: "top-right",
            autoClose: 10000,
          });
        }
      }
    }
  };

  // Handle Edit Button Click
  const handleEdit = async (index) => {
    const location = jobLocations[index];
    
    // First reset the form
    resetFormCompletely();
    
    // Then set the values for editing
    setValue("pincode", location.pincode);
    setValue("state", location.state);
    setValue("city", location.city);
    setValue("block", location.block);
    setValue("area", location.area);
    setValue("post_office", location.post_office);
    
    // Set post offices if we have the pincode
    if (location.pincode && location.pincode.length === 6) {
      try {
        const response = await axios.get(`${getPincodeUrl()}${location.pincode}`);
        if (response.data && response.data[0].Status === "Success") {
          const postOffices = response.data[0].PostOffice;
          if (postOffices && postOffices.length > 0) {
            setPostOffices(postOffices);
          }
        }
      } catch (error) {
        console.error("Error fetching pincode details for edit:", error);
      }
    }
    
    setIsEditing(true);
    setEditIndex(index);
    setIsFormVisible(true);
    setEditingRowIndex(index);
  };

  const handleDelete = async (index) => {
    try {
      console.log("index", index);
      const locationToDelete = jobLocations[index].id;
      console.log("locationid", locationToDelete);
      await dispatch(
        deleteJobPrefrence({ id: locationToDelete, delete: true })
      ).unwrap();

      fetchjobrefrence();
    } catch (err) {
      console.error("Error deleting location:", err);
      setApiError("Failed to delete location. Please try again.");
    }
  };

  // Handle form cancel
  const handleCancel = () => {
    resetFormCompletely();
    setIsFormVisible(false);
    setIsEditing(false);
    setEditIndex(null);
    setEditingRowIndex(null);
  };

  return (
    <>
      {bothConditonCheck ? (
        <div className="px-5 mt-5 ">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold  text-gray-600">
              Job Preference Locations
            </h2>
            {!isFormVisible && (
              <button
                onClick={handleShowAddForm}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#3E98C7] rounded flex items-center gap-1"
              >
                Add
                <IoLocationSharp className="size-4 mt-1" />
              </button>
            )}
          </div>
          
          {jobLocations.length > 0 && !isFormVisible && (
            <div className="px-5 gap-4 ">
              {jobLocations.map((location, index) => (
                <div key={index} className=" p-4 transition-shadow border-b">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-medium text-gray-700">
                      {location.area}
                    </h2>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-gray-500 hover:text-gray-600"
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
                  </div>
                  <div className="text-sm text-gray-700">
                    <p>
                      {`${location.block}, ${location.city}, ${location.state},  ${location.pincode}, Postoffice: ${location.post_office}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {jobLocations.length == 0 && !isFormVisible && (
            <div className="text-center py-8 border bg-slate-50 border-gray-200 rounded-md mt-2">
              <p className="text-gray-600 text-xl font-semibold">
                You haven't added any job preference locations yet!
              </p>
              <p className="text-gray-500 mt-2">
                Choose up to{" "}
                <span className="font-bold text-[#3E98C7]">
                  5 preferred locations
                </span>{" "}
                to find jobs tailored to your choices.
              </p>
            </div>
          )}

          {/* Form section */}
          {isFormVisible && (
            <div className="bg-white border border-gray-200 p-6 rounded-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                {isEditing ? "Edit Location" : "Add New Location"}
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("pincode", { required: true })}
                      onChange={handlePincodeChange}
                      className={`w-full px-4 py-2 border-b focus:outline-none focus:ring-[#3E98C7] focus:border-[#3E98C7] ${
                        fieldErrors.pincode ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter pincode"
                    />
                    {errors.pincode && (
                      <p className="text-red-500 text-xs mt-2">
                        Pincode is required.
                      </p>
                    )}
                    {fieldErrors.pincode && (
                      <p className="text-red-500 text-xs mt-2">
                        {fieldErrors.pincode}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      {...register("state")}
                      readOnly
                      placeholder="Auto Filled"
                      className="w-full px-4 py-2 border-b text-gray-600 focus:outline-none focus:ring-[#3E98C7] focus:border-[#3E98C7]"
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      District
                    </label>
                    <input
                      type="text"
                      {...register("city")}
                      readOnly
                      placeholder="Auto Filled"
                      className="w-full px-4 py-2 border-b text-gray-600 focus:outline-none focus:ring-[#3E98C7] focus:border-[#3E98C7]"
                    />
                  </div>

                  {/* Block */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Block
                    </label>
                    <input
                      type="text"
                      {...register("block")}
                      className="w-full px-4 py-2 border-b focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter block"
                    />
                  </div>

                  {/* Post Office */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Post Office <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("post_office", { required: true })}
                      className={`w-full px-4 py-2 border-b focus:outline-none focus:ring-[#3E98C7] focus:border-[#3E98C7] ${
                        fieldErrors.post_office ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select a Post Office</option>
                      {postOffices.map((office, index) => (
                        <option key={index} value={office.Name}>
                          {office.Name}
                        </option>
                      ))}
                    </select>
                    {errors.post_office && (
                      <p className="text-red-500 text-xs mt-2">
                        Post office selection is required.
                      </p>
                    )}
                    {fieldErrors.post_office && (
                      <p className="text-red-500 text-xs mt-2">
                        {fieldErrors.post_office}
                      </p>
                    )}
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Area
                    </label>
                    <input
                      type="text"
                      {...register("area")}
                      onChange={handleAreaChange}
                      className={`w-full px-4 py-2 border-b focus:outline-none focus:ring-[#3E98C7] focus:border-[#3E98C7] ${
                        fieldErrors.area ? 'border-red-500 border-2' : ''
                      }`}
                      placeholder="Enter area"
                    />
                    {fieldErrors.area && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        ⚠️ {fieldErrors.area}
                      </p>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end items-center space-x-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 text-sm font-medium text-white bg-gray-500 rounded-lg shadow "
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-[#3E98C7] rounded-lg shadow focus:ring-4 focus:ring-teal-300"
                  >
                    {isEditing ? "Update Location" : "Add Location"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Display API errors */}
          {apiError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{apiError}</p>
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default JobPrefrenceLocation;

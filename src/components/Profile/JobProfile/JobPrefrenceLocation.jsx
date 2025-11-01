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
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
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
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text">
                Job Preference Locations
                <span className="ml-2 text-secondary text-sm font-normal">/ नौकरी की पसंदीदा स्थान</span>
              </h2>
              <p className="text-sm text-secondary mt-1">
                {jobLocations.length} of 5 locations added
              </p>
            </div>
            {!isFormVisible && jobLocations.length < 5 && (
              <button
                onClick={handleShowAddForm}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary hover:opacity-90 transition-opacity"
                aria-label="Add new location"
              >
                <IoLocationSharp className="h-5 w-5" aria-hidden="true" />
                Add Location
              </button>
            )}
          </div>
          
          {jobLocations.length > 0 && !isFormVisible && (
            <div className="space-y-3 mb-6">
              {jobLocations.map((location, index) => (
                <div key={index} className="p-5 border border-secondary/30 rounded-lg bg-white hover:border-primary/40 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <IoLocationSharp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <h3 className="text-base font-semibold text-text">
                          {location.area || 'Area not specified'}
                        </h3>
                      </div>
                      <p className="text-sm text-secondary leading-relaxed">
                        {location.block && `${location.block}, `}{location.city}, {location.state} - {location.pincode}
                      </p>
                      <p className="text-xs text-secondary mt-1">
                        Post Office: {location.post_office}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(index)}
                        className="p-2 text-secondary hover:text-primary hover:bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary transition-colors"
                        aria-label={`Edit location ${location.area || 'unnamed'}`}
                      >
                        <HiPencil className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-2 text-error hover:text-error/80 hover:bg-error-light rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-error transition-colors"
                        aria-label={`Delete location ${location.area || 'unnamed'}`}
                      >
                        <HiOutlineTrash className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {jobLocations.length == 0 && !isFormVisible && (
            <div className="text-center py-12 border bg-background border-secondary/30 rounded-lg">
              <IoLocationSharp className="h-16 w-16 text-secondary mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-text text-xl font-semibold mb-2">
                No locations added yet
                <span className="ml-2 text-secondary text-sm font-normal">/ कोई स्थान नहीं जोड़ा गया</span>
              </h3>
              <p className="text-secondary mt-2 max-w-md mx-auto">
                Add up to <span className="font-semibold text-primary">5 preferred locations</span> to help us match you with relevant job opportunities in your desired areas.
              </p>
            </div>
          )}

          {/* Form section */}
          {isFormVisible && (
            <div className="bg-white border border-secondary/30 p-6 rounded-lg">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text">
                  {isEditing ? 'Edit Location' : 'Add New Location'}
                  <span className="ml-2 text-secondary text-sm font-normal">
                    {isEditing ? '/ स्थान संपादित करें' : '/ नया स्थान जोड़ें'}
                  </span>
                </h3>
                <p className="text-sm text-secondary mt-1">Fill in the location details below</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Pincode <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("pincode", { required: true })}
                      onChange={handlePincodeChange}
                      className={`w-full px-3 py-2 border ${fieldErrors.pincode ? 'border-error' : 'border-secondary/30'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder="Enter pincode"
                    />
                    {errors.pincode && (
                      <p className="text-error text-xs mt-2" aria-live="polite">
                        Pincode is required.
                      </p>
                    )}
                    {fieldErrors.pincode && (
                      <p className="text-error text-xs mt-2" aria-live="polite">
                        {fieldErrors.pincode}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      {...register("state")}
                      readOnly
                      placeholder="Auto Filled"
                      className="w-full px-3 py-2 border border-secondary/30 rounded-md bg-background text-secondary focus:outline-none"
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      District
                    </label>
                    <input
                      type="text"
                      {...register("city")}
                      readOnly
                      placeholder="Auto Filled"
                      className="w-full px-3 py-2 border border-secondary/30 rounded-md bg-background text-secondary focus:outline-none"
                    />
                  </div>

                  {/* Block */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Block
                    </label>
                    <input
                      type="text"
                      {...register("block")}
                      className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter block"
                    />
                  </div>

                  {/* Post Office */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Post Office <span className="text-error">*</span>
                    </label>
                    <select
                      {...register("post_office", { required: true })}
                      className={`w-full px-3 py-2 border ${fieldErrors.post_office ? 'border-error' : 'border-secondary/30'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                    >
                      <option value="">Select a Post Office</option>
                      {postOffices.map((office, index) => (
                        <option key={index} value={office.Name}>
                          {office.Name}
                        </option>
                      ))}
                    </select>
                    {errors.post_office && (
                      <p className="text-error text-xs mt-2" aria-live="polite">
                        Post office selection is required.
                      </p>
                    )}
                    {fieldErrors.post_office && (
                      <p className="text-error text-xs mt-2" aria-live="polite">
                        {fieldErrors.post_office}
                      </p>
                    )}
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Area
                    </label>
                    <input
                      type="text"
                      {...register("area")}
                      onChange={handleAreaChange}
                      className={`w-full px-3 py-2 border ${fieldErrors.area ? 'border-error' : 'border-secondary/30'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder="Enter area"
                    />
                    {fieldErrors.area && (
                      <div className="flex items-start gap-2 text-error text-sm mt-2" aria-live="polite">
                        <HiOutlineExclamationTriangle className="h-4 w-4 mt-0.5" aria-hidden="true" />
                        <span>{fieldErrors.area}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2.5 text-sm font-medium text-secondary border border-secondary/40 rounded-md bg-transparent hover:bg-background focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary hover:opacity-90 transition-opacity"
                  >
                    {isEditing ? "Update Location" : "Add Location"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Display API errors */}
          {apiError && (
            <div className="mt-4 p-4 bg-error-light border border-error/30 rounded-lg">
              <div className="flex items-start gap-2">
                <HiOutlineExclamationTriangle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-error text-sm" aria-live="polite">{apiError}</p>
              </div>
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

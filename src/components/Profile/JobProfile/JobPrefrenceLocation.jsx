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
import { HiOutlineExclamationTriangle, HiOutlineMapPin } from "react-icons/hi2";
import { toast } from "react-toastify";

const JobPrefrenceLocation = ({ onLocationSuccess }) => {
  const dispatch = useDispatch();
  const teacherprefrence = useSelector((state) => state?.jobProfile.prefrence);

  const jobLocations = useSelector(
    (state) => state.jobProfile.prefrenceLocation || []
  );
  const { attempts, interview } = useSelector((state) => state.examQues);
  const { userData } = useSelector((state) => state.auth)


  const passedOfflineExam = attempts?.some(
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

      }
    }

    setIsEditing(true);
    setEditIndex(index);
    setIsFormVisible(true);
    setEditingRowIndex(index);
  };

  const handleDelete = async (index) => {
    try {

      const locationToDelete = jobLocations[index].id;

      await dispatch(
        deleteJobPrefrence({ id: locationToDelete, delete: true })
      ).unwrap();

      fetchjobrefrence();
    } catch (err) {

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
        <div className="space-y-4 flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">
                  Job Locations
                  <span className="ml-2 text-slate-400 text-xs font-normal">/ नौकरी स्थान</span>
                </h3>
                <span className="px-2 py-0.5 bg-teal-50 text-teal-600 text-xs font-medium rounded-full border border-teal-100">
                  {jobLocations.length}/5
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Preferred work locations</p>
            </div>
            {!isFormVisible && jobLocations.length < 5 && (
              <button
                onClick={handleShowAddForm}
                className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-md flex items-center gap-1.5 hover:bg-teal-700 transition-all shadow-sm shadow-teal-200"
              >
                <IoLocationSharp className="h-3.5 w-3.5" />
                Add Job Location
              </button>
            )}
          </div>

          {/* Locations List */}
          {jobLocations.length > 0 && !isFormVisible && (
            <div className="grid grid-cols-1 gap-3">
              {jobLocations.map((location, index) => (
                <div key={index} className="group border border-slate-200 rounded-lg bg-white hover:border-teal-300 transition-all p-3 hover:shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate mb-1">
                        {location.area || 'Area not specified'}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        {location.city}, {location.state}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(index)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-all"
                        title="Edit"
                      >
                        <HiPencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                        title="Delete"
                      >
                        <HiOutlineTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs pt-2 border-t border-slate-50">
                    <span className="flex items-center gap-1 text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded">
                      <HiOutlineMapPin className="w-3 h-3" />
                      {location.pincode}
                    </span>
                    <span className="text-slate-400 truncate">{location.post_office}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {jobLocations.length === 0 && !isFormVisible && (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-slate-100">
                <IoLocationSharp className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">No locations added</p>
              <p className="text-xs text-slate-500 mt-1">Add up to 5 preferred locations</p>
            </div>
          )}

          {/* Compact Form */}
          {isFormVisible && (
            <div className="border border-slate-200 rounded-lg bg-slate-50/50 p-4">
              <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                {isEditing ? 'Edit Location' : 'Add Location'}
              </h4>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      {...register("pincode", { required: true })}
                      onChange={handlePincodeChange}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${fieldErrors.pincode ? 'border-red-300 focus:ring-red-200' : 'border-slate-300'
                        }`}
                      placeholder="Pincode *"
                    />
                    {(errors.pincode || fieldErrors.pincode) && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.pincode || 'Required'}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      {...register("state")}
                      readOnly
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      {...register("city")}
                      readOnly
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                      placeholder="District"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      {...register("block")}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      placeholder="Block"
                    />
                  </div>

                  <div>
                    <select
                      {...register("post_office", { required: true })}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white ${fieldErrors.post_office ? 'border-red-300 focus:ring-red-200' : 'border-slate-300'
                        }`}
                    >
                      <option value="">Post Office *</option>
                      {postOffices.map((office, index) => (
                        <option key={index} value={office.Name}>
                          {office.Name}
                        </option>
                      ))}
                    </select>
                    {(errors.post_office || fieldErrors.post_office) && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.post_office || 'Required'}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      {...register("area")}
                      onChange={handleAreaChange}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${fieldErrors.area ? 'border-red-300 focus:ring-red-200' : 'border-slate-300'
                        }`}
                      placeholder="Area"
                    />
                    {fieldErrors.area && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.area}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-200 mt-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-all shadow-sm shadow-teal-200"
                  >
                    {isEditing ? "Update Location" : "Add Location"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Error Display */}
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
              <HiOutlineExclamationTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{apiError}</p>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
};

export default JobPrefrenceLocation;

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
import ErrorMessage from "../../ErrorMessage";

const BIHAR_DISTRICTS = [
  "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar",
  "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur",
  "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger",
  "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur",
  "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"
];

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
  const [successMessage, setSuccessMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({}); // Field-specific errors

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      state: "Bihar",
      city: "",
      pincode: "",
      post_office: "",
      area: ""
    }
  });

  const selectedState = watch("state");
  const selectedCity = watch("city");
  const pincodeValue = watch("pincode");
  useEffect(() => {
    dispatch(getPrefrence());
    dispatch(getJobPrefrence()); // Fetch job preferences from Redux store
  }, [dispatch]);

  const fetchjobrefrence = () => {
    dispatch(getJobPrefrence());
  };
  const resetFormCompletely = () => {
    reset({
      state: "Bihar",
      city: "",
      pincode: "",
      post_office: "",
      area: ""
    });
    setPostOffices([]);
    setApiError("");
    setFieldErrors({}); // Clear field errors
  };
  const handleShowAddForm = () => {
    resetFormCompletely(); // Reset form completely
    setIsFormVisible(true);
    setIsEditing(false);
    setEditIndex(null);
    setEditingRowIndex(null);
  };

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    setValue("pincode", pincode); // Update form value manually to trigger watch if needed
    if (fieldErrors.area) {
      setFieldErrors(prev => ({ ...prev, area: null }));
    }

    if (pincode.length === 6) {
      try {
        setApiError("");
        const response = await axios.get(`${getPincodeUrl()}${pincode}`);


        if (response.data && response.data[0].Status === "Success") {
          const fetchedPostOffices = response.data[0].PostOffice; // Array of post offices

          if (fetchedPostOffices && fetchedPostOffices.length > 0) {
            setPostOffices(fetchedPostOffices); // Set post offices for dropdown
            setValue("post_office", ""); // Clear previous selection
          } else {
            setApiError("No post offices found for the given pincode.");
            setPostOffices([]); // Clear dropdown
          }
        } else {
          setApiError("Invalid Pincode or no data found.");
          setPostOffices([]);
        }
      } catch (error) {

        setApiError("Failed to fetch pincode details.");
      }
    } else {
      setPostOffices([]);
    }
  };
  const handleAreaChange = (e) => {
    if (fieldErrors.area) {
      setFieldErrors(prev => ({ ...prev, area: null }));
    }
  };

  const onSubmit = async (data) => {
    try {
      setApiError("");
      setSuccessMessage(null);
      setFieldErrors({});
      const locationData = {
        ...data,
        user: userData?.id, // Add the preference ID from Redux state
      };
      if (isEditing) {
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
        if (onLocationSuccess) {
          onLocationSuccess();
        }
        setSuccessMessage("Location added successfully!");
      }

      if (isEditing) {
        setSuccessMessage("Location updated successfully!");
      }
      resetFormCompletely();
      setIsEditing(false);
      setEditIndex(null);
      setIsFormVisible(false);
      setEditingRowIndex(null);
    } catch (err) {
      let errorFound = false;
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
      for (const path of errorPaths) {
        if (path && typeof path === 'object') {
          if (path.area) {
            let areaError = path.area;
            if (Array.isArray(areaError)) {
              areaError = areaError[0];
            }

            setFieldErrors({ area: areaError });
            errorFound = true;
            break;
          }
        }
      }
      if (!errorFound) {
        const errorStr = JSON.stringify(err);
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
            errorFound = true;
            break;
          }
        }
      }
      if (!errorFound) {
        const errorStr = JSON.stringify(err).toLowerCase();

        if (errorStr.includes("area") && errorStr.includes("exist")) {
          setFieldErrors({ area: "This area name already exists." });
        } else if (errorStr.includes("preference") || errorStr.includes("location")) {
          setApiError("You can add only 5 preference locations");
        } else {
          setApiError("An error occurred. Please try again.");
        }
      }
    }
  };
  const handleEdit = async (index) => {
    const location = jobLocations[index];
    resetFormCompletely();
    setValue("state", location.state || "Bihar");
    setValue("city", location.city);
    setValue("pincode", location.pincode);
    setValue("post_office", location.post_office);
    setValue("area", location.area);
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
        console.error("Failed to fetch post offices for edit", error);
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
      setSuccessMessage("Location deleted successfully!");
    } catch (err) {

      setApiError("Failed to delete location. Please try again.");
    }
  };
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
          <ErrorMessage
            message={apiError}
            onDismiss={() => setApiError(null)}
            className="mb-4"
          />

          <ErrorMessage
            message={successMessage}
            type="success"
            onDismiss={() => setSuccessMessage(null)}
            className="mb-4"
          />
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
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
          </div>

          {/* Locations List with Fixed 5 Slots */}
          {!isFormVisible && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => {
                const location = jobLocations[index];
                const isEmpty = !location;

                return (
                  <div
                    key={index}
                    onClick={() => isEmpty ? handleShowAddForm() : null}
                    className={`relative flex items-center p-4 rounded-xl border transition-all duration-200 group ${isEmpty
                      ? "border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-teal-400 cursor-pointer"
                      : "border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-teal-200"
                      }`}
                  >
                    {/* Slot Number */}
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-4 ${isEmpty
                      ? "bg-slate-200 text-slate-400 group-hover:bg-teal-100 group-hover:text-teal-600"
                      : "bg-teal-100 text-teal-700"
                      }`}>
                      {index + 1}
                    </div>

                    {isEmpty ? (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-400 group-hover:text-teal-600 transition-colors">
                          Add Preference {index + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-teal-400 group-hover:text-teal-600 transition-all">
                          <IoLocationSharp className="w-4 h-4" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-800 text-sm truncate">
                              {location.area || 'Area not specified'}
                            </h4>
                            {
                                location.city && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100 uppercase tracking-wide">
                                  {location.city}
                                </span>
                              )
                            }
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                          {
                            location.pincode && (
                              <span className="flex items-center gap-1">
                                <HiOutlineMapPin className="w-3 h-3" />
                                {location.pincode}
                              </span>
                            )
                          }
                            {
                              location.post_office && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span>{location.post_office}</span>
                                </>
                              )
                            }
                            {
                              location.state && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span>{location.state}</span>
                                </>
                              ) 
                            }
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 ml-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(index); }}
                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                            title="Edit Location"
                          >
                            <HiPencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(index); }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Location"
                          >
                            <HiOutlineTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
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

                  {/* State Selection */}
                  <div>
                    <select
                      {...register("state", { required: "State is required" })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="Bihar">Bihar</option>
                    </select>
                    {errors.state && (
                      <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
                    )}
                  </div>

                  {/* City/District Selection */}
                  <div>
                    <select
                      {...register("city")}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select District</option>
                      {BIHAR_DISTRICTS.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pincode Input */}
                  <div>
                    <input
                      type="text"
                      {...register("pincode")}
                      onChange={handlePincodeChange}
                      maxLength={6}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${fieldErrors.pincode ? 'border-red-300 focus:ring-red-200' : 'border-slate-300'
                        }`}
                      placeholder="Pincode"
                    />
                    {fieldErrors.pincode && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.pincode}</p>
                    )}
                  </div>

                  {/* Post Office Selection */}
                  <div>
                    <select
                      {...register("post_office")}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white ${fieldErrors.post_office ? 'border-red-300 focus:ring-red-200' : 'border-slate-300'
                        }`}
                      disabled={postOffices.length === 0}
                    >
                      <option value="">Select Post Office</option>
                      {postOffices.map((office, index) => (
                        <option key={index} value={office.Name}>
                          {office.Name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Area Input */}
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      {...register("area")}
                      onChange={handleAreaChange}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${fieldErrors.area ? 'border-red-300 focus:ring-red-200' : 'border-slate-300'
                        }`}
                      placeholder="Area / Locality"
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

          {/* Error Display - Removed as ErrorMessage is used at top */}
        </div>
      ) : null}
    </>
  );
};

export default JobPrefrenceLocation;

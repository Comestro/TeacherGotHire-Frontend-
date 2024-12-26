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

const JobPrefrenceLocation = () => {
  const dispatch = useDispatch();
  const teacherprefrence = useSelector((state) => state?.jobProfile.prefrence);
  console.log("teacherprefrence", teacherprefrence);
  const jobLocations = useSelector(
    (state) => state.jobProfile.prefrenceLocation || []
  ); // Redux state

  // const jobLocationsId = useSelector(
  //   (state) => state.jobProfile.prefrenceLocation[0].id || []
  // );

  // console.log("joblocationid",jobLocationsId);
  const [isEditing, setIsEditing] = useState(false); // Edit mode
  const [editIndex, setEditIndex] = useState(); // Index for editing
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [postOffices, setPostOffices] = useState([]);

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

  const fetchjobrefrence = () => {
    dispatch(getJobPrefrence());
  };

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
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
        //locationData= jobLocations[].id; // Include location ID for updates
        const locationForEdit = jobLocations[editIndex].id;
        const editData = {
          ...data,
        };
        console.log("edit data", editData);
        console.log("locatikmlmonedit", locationForEdit);
        await dispatch(
          editJobPrefrence({ editData, id: locationForEdit })
        ).unwrap();
        fetchjobrefrence();
      } else {
        console.log("Dispatching location data:", locationData);
        await dispatch(postJobPrefrence(locationData)).unwrap();
        fetchjobrefrence();
      }
      // await dispatch(updateTeacherJobPrefrenceLocation(locationData)).unwrap(); // Dispatch action
      //   reset(); // Reset the form
      setIsEditing(false); // Exit editing mode
      setEditIndex(null); // Clear edit index
      setIsFormVisible(false); // Close the form
    } catch (err) {
      console.error("Error saving location:", err);
      setApiError("You can Add only 5 prefrence location"); //here I can add the msg that first fill prefrece Id
    }
  };

  // Handle Edit Button Click
  const handleEdit = async (index) => {
    const location = jobLocations[index];
    setValue("pincode", location.pincode);
    setValue("state", location.state);
    setValue("city", location.city);
    setValue("block", location.block);
    setValue("area", location.area);
    setValue("post_office", location.post_office);
    setIsEditing(true);
    setEditIndex(index);
  };

  const handleDelete = async (index) => {
    try {
      console.log("index", index);
      const locationToDelete = jobLocations[index].id;
      console.log("locationid", locationToDelete);
      await dispatch(
        deleteJobPrefrence({ id: locationToDelete, delete: true })
      ).unwrap();

      // await dispatch(postJobPrefrence()).unwrap();
      fetchjobrefrence();
    } catch (err) {
      console.error("Error deleting location:", err);
      setApiError("Failed to delete location. Please try again.");
    }
  };

  return (
    <div className="px-5">
      <h2 className="text-xl font-bold mb-6 text-gray-600">
        Job Preference Locations
      </h2>
      {jobLocations.length > 0 ? (
        <table className="min-w-full border-collapse border border-gray-300 mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Pincode</th>
              <th className="border border-gray-300 px-4 py-2">State</th>
              <th className="border border-gray-300 px-4 py-2">District</th>
              <th className="border border-gray-300 px-4 py-2">Block</th>
              <th className="border border-gray-300 px-4 py-2">Area</th>
              <th className="border border-gray-300 px-4 py-2">Postoffice</th>
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
                  {location.post_office}
                  {
                    <button
                      onClick={() => {
                        handleEdit(index);
                        setIsFormVisible(true);
                        setIsEditing(true); // Reset editing state
                        setEditingRowIndex(index);
                      }}
                      className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                  }

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
      ) : (
        <div className="text-center py-8 border border-gray-200 rounded">
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
          <div className="flex justify-center items-center">
            <button
              onClick={() => {
                setIsFormVisible(true);
                setIsEditing(false); // Reset editing state
              }}
              className="mt-4 px-6 py-2 text-white bg-[#3E98C7] rounded shadow-md"
            >
              Add Your Preferred Locations
            </button>
          </div>
        </div>
      )}
      {/* Add button to open form */}
      {/* {!isFormVisible && (
        <div className="flex justify-center items-center">
          <button
            onClick={() => {
              setIsFormVisible(true);
              setIsEditing(false); // Reset editing state
            }}
            className="mt-4 px-6 py-2 text-white bg-teal-500 hover:bg-teal-600 rounded shadow-md"
          >
            Add Your Preferred Locations
          </button>
        </div>
      )} */}

      {/* Form section */}
      {isFormVisible && (
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {isEditing ? "Edit Location" : "Add Location"}
          </h2>
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
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter pincode"
                />
                {errors.pincode && (
                  <p className="text-red-500 text-xs mt-2">
                    Pincode is required.
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
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 shadow-sm"
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
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 shadow-sm"
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
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter block"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Area
                </label>
                <input
                  type="text"
                  {...register("area")}
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter area"
                />
              </div>
            </div>

            {/* Post Office */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Post Office <span className="text-red-500">*</span>
              </label>
              <select
                {...register("post_office", { required: true })}
                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="" disabled>
                  Select a Post Office
                </option>
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
            </div>

            {/* Buttons */}
            <div className="flex justify-end items-center space-x-4">
            <button
                type="button"
                onClick={() => setIsFormVisible(false)}
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

      {apiError && <p className="text-red-500 mt-4">{apiError}</p>}
    </div>
  );
};

export default JobPrefrenceLocation;

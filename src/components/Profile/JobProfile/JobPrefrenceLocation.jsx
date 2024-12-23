import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { getJobPrefrence, getPrefrence ,postJobPrefrence,editJobPrefrence,deleteJobPrefrence} from "../../../features/jobProfileSlice";
import axios from "axios";
import { getPincodeUrl } from "../../../store/configue"; // Pincode API URL from config

const JobPrefrenceLocation = () => {
  const dispatch = useDispatch();
  const teacherprefrence = useSelector((state) => state?.jobProfile.prefrence);
  console.log("teacherprefrence",teacherprefrence)
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

  const fetchjobrefrence=()=>{
    dispatch(getJobPrefrence());
  }

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
        const editData ={
          ...data
        }
        console.log("edit data",editData)
        console.log("locatikmlmonedit",locationForEdit)
        await dispatch(editJobPrefrence({editData,id: locationForEdit})).unwrap();  
        fetchjobrefrence();
      }else{
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
      setApiError("You can Add only 5 prefrence location");//here I can add the msg that first fill prefrece Id 
    }
  };
  

  // Handle Edit Button Click
  const handleEdit = async(index) => {
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

      const handleDelete = async(index) => {
      try {
        console.log("index",index)
        const locationToDelete = jobLocations[index].id;
        console.log("locationid",locationToDelete)
        await dispatch(deleteJobPrefrence({ id: locationToDelete, delete: true })).unwrap(); 
        
        // await dispatch(postJobPrefrence()).unwrap();
        fetchjobrefrence();
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
          <td className="border border-gray-300 px-4 py-2">{location.pincode}</td>
          <td className="border border-gray-300 px-4 py-2">{location.state}</td>
          <td className="border border-gray-300 px-4 py-2">{location.district}</td>
          <td className="border border-gray-300 px-4 py-2">{location.block}</td>
          <td className="border border-gray-300 px-4 py-2">{location.area}</td>
          <td className="border border-gray-300 px-4 py-2">{location.post_office}
             { (
              <button
                onClick={() => {
                  handleEdit(index)
                  setIsFormVisible(true);
                  setIsEditing(true); // Reset editing state
                  setEditingRowIndex(index);
                }}
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Edit
              </button>
            )}

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
  <div className="text-center py-8">
  <p className="text-gray-700 text-lg font-semibold">
    You haven't added any job preference locations yet!
  </p>
  <p className="text-gray-500 mt-2">
    Choose up to <span className="font-bold text-blue-600">5 preferred locations</span> to find jobs tailored to your choices.
  </p>
  {/* <button
    onClick={() => setIsFormVisible(true)} // Opens the form to add locations
    className="mt-4 px-6 py-2 text-white bg-teal-500 hover:bg-teal-600 rounded shadow-md"
  >
    Add Your Preferred Locations
  </button> */}
</div>

)}
      {/* Add button to open form */}
      {!isFormVisible && (
        <div className="flex justify-center items-center h-full">
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
                  {...register("city")}
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
            <div>
           
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Post Office
            </label>
            <select
              {...register("post_office", { required: true })}
              className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              <p className="text-red-500 text-sm mt-1">Post office selection is required.</p>
            )}
          </div>
                {errors.category && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
              >
                {isEditing ? "Update Location" : "Add Location"}
              </button>
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

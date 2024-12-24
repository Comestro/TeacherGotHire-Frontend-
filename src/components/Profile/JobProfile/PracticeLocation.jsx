
import React, { useState } from "react";

const PracticalLocation = () => {
  const [locations, setLocations] = useState([]); // Array to store multiple locations
  const [formData, setFormData] = useState({
    pincode: "",
    state: "",
    district: "",
    blockVillage: "",
  }); // State for form data
  const [isFormVisible, setIsFormVisible] = useState(false); // Toggle form visibility
  const [isEditing, setIsEditing] = useState(false); // Track if editing
  const [editIndex, setEditIndex] = useState(null); // Index of location being edited

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Function to handle form submission
  const handleFormSubmit = () => {
    if (isEditing) {
      // Update the existing location
      const updatedLocations = [...locations];
      updatedLocations[editIndex] = formData;
      setLocations(updatedLocations);
    } else {
      // Add a new location
      setLocations([...locations, formData]);
    }

    // Reset the form and close it
    setFormData({
      pincode: "",
      state: "",
      district: "",
      blockVillage: "",
    });
    setIsFormVisible(false);
    setIsEditing(false);
    setEditIndex(null);
  };

  // Function to handle edit button click
  const handleEdit = (index) => {
    setFormData(locations[index]); // Pre-fill the form with data to be edited
    setIsFormVisible(true);
    setIsEditing(true);
    setEditIndex(index);
  };

  // Function to handle Add button click
  const handleAddButtonClick = () => {
    setFormData({
      pincode: "",
      state: "",
      district: "",
      blockVillage: "",
    }); // Clear the form
    setIsFormVisible(true);
    setIsEditing(false);
    setEditIndex(null);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Job Preference Locations</h2>

      {/* Display Table of Added Locations */}
      {locations.length > 0 && (
        <table className="min-w-full border-collapse border border-gray-300 mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Pincode</th>
              <th className="border border-gray-300 px-4 py-2">State</th>
              <th className="border border-gray-300 px-4 py-2">District</th>
              <th className="border border-gray-300 px-4 py-2">Block/Village</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location, index) => (
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
                  {location.blockVillage}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Location Button */}
      {!isFormVisible && (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleAddButtonClick}
        >
          Add Location
        </button>
      )}

      {/* Form to Add/Edit Locations */}
      {isFormVisible && (
        <div className="border border-gray-300 p-4 rounded mt-4">
          <h3 className="text-lg font-bold mb-2">
            {isEditing ? "Edit Location" : "Add Location"}
          </h3>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">District</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              Block/Village
            </label>
            <input
              type="text"
              name="blockVillage"
              value={formData.blockVillage}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mt-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
              onClick={handleFormSubmit}
            >
              {isEditing ? "Update" : "Submit"}
            </button>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={() => setIsFormVisible(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticalLocation;

// import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useDispatch, useSelector } from "react-redux";
// import { getJobPrefrence, postJobPrefrence } from "../../../features/jobProfileSlice";
// import { updateTeacherJobPrefrenceLocation } from "../../../services/jobProfileService";
// import axios from "axios";
// import { getPincodeUrl } from "../../../store/configue"; // Pincode API URL from config

// const jobPrefrenceLocation= () => {
//   const dispatch = useDispatch();
//   const jobLocation = useSelector((state) => state.jobProfile || {});
  
//   console.log("jobLocation",jobLocation);

//   const [isEditingAddress, setIsEditingAddress] = useState(false);
//   const [apiError, setApiError] = useState("");

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//   } = useForm();

//  const fetchJobAddress=()=>{
//   dispatch(getJobPrefrence())
//   }
//   useEffect(() => {
//     dispatch(getJobPrefrence())
//   }, []);

// //   useEffect(() => {
// //     if (addressData) {
// //       // Use a condition to prevent redundant updates
// //       Object.entries(addressData).forEach(([key, value]) => {
// //         if (value !== undefined && value !== "") {
// //           setValue(key, value); // Update only if necessary
// //         }
// //       });
// //     }
// //   }, [addressData, setValue]);

//   // Handle pincode API fetch and auto-fill
//   const handlePincodeChange = async (e) => {
//     const pincode = e.target.value;
//     if (pincode.length === 6) {
//       try {
//         setApiError("");
//         const response = await axios.get(`${getPincodeUrl()}${pincode}`);
//         if (response.data && response.data[0].Status === "Success") {
//           const postOffice = response.data[0].PostOffice[0];
//           setValue("state", postOffice.State);
//           setValue("district", postOffice.District);
//         } else {
//           setApiError("Invalid Pincode or no data found");
//           setValue("state", "");
//           setValue("district", "");
//         }
//       } catch (error) {
//         setApiError("Failed to fetch pincode details");
//         //console.error("API Error:", error);
//       }
//     }
//   };

//   // Submit form and update Redux state + backend
//   const onSubmit = async (data) => {
//     try {
//       await updateTeacherJobPrefrenceLocation(data); // Update backend
//       dispatch(getJobPrefrence(data)); // Update Redux state
//       fetchJobAddress();
//       setIsEditingAddress(false);
//     } catch (err) {
//       //console.error("Error updating address:", err);
//       setApiError("Failed to save address. Please try again.");
//     }
//   };

//   return (
//     <div className="px-5 mt-auto">
//       <h2 className="text-xl font-bold mb-6 text-gray-700 text-center underline">
//         Job Prefrence Location
//       </h2>
//       <div className="mb-4 pl-2">
//         <p className="text-gray-700 font-semibold mb-2">Address</p>
//         {!isEditingAddress ? (
//           <div className="border border-gray-300 rounded-lg shadow-sm p-4 bg-white">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <h3 className="text-sm font-semibold text-teal-600 uppercase">
//                   Pincode
//                 </h3>
//                 {/* <p className="text-gray-700 text-md">
//                   {addressData?.pincode || "N/A"}
//                 </p> */}
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-teal-600 uppercase">
//                   State
//                 </h3>
//                 {/* <p className="text-gray-700 text-md">{addressData?.state || "N/A"}</p> */}
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-teal-600 uppercase">
//                   District
//                 </h3>
//                 <p className="text-gray-700 text-md">
//                   {/* {addressData?.district || "N/A"} */}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-teal-600 uppercase">
//                   Block
//                 </h3>
//                 {/* <p className="text-gray-700 text-md">{addressData?.block || "N/A"}</p> */}
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-teal-600 uppercase">
//                   Area
//                 </h3>
//                 {/* <p className="text-gray-700 text-md">{addressData?.area || "N/A"}</p> */}
//               </div>
//             </div>
//             <div className="mt-4 flex justify-end">
//               <button
//                 className="text-white bg-teal-600 hover:bg-teal-700 transition-colors px-6 py-2 rounded-md text-sm font-medium"
//                 onClick={() => setIsEditingAddress(true)}
//               >
//                 Edit Address
//               </button>
//             </div>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Pincode
//                 </label>
//                 <input
//                   type="text"
//                   {...register("pincode", { required: true })}
//                   onChange={handlePincodeChange}
//                   className="border border-gray-300 rounded px-3 py-2 w-full"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   State
//                 </label>
//                 <input
//                   type="text"
//                   {...register("state")}
//                   readOnly
//                   className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   District
//                 </label>
//                 <input
//                   type="text"
//                   {...register("district")}
//                   readOnly
//                   className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Block
//                 </label>
//                 <input
//                   type="text"
//                   {...register("block")}
//                   className="border border-gray-300 rounded px-3 py-2 w-full"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Area
//                 </label>
//                 <input
//                   type="text"
//                   {...register("area")}
//                   className="border border-gray-300 rounded px-3 py-2 w-full"
//                 />
//               </div>
//             </div>
//             <div className="flex space-x-4">
//               <button
//                 type="button"
//                 onClick={() => setIsEditingAddress(false)}
//                 className="px-4 py-2 text-sm text-gray-700 border rounded hover:bg-gray-100"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
//               >
//                 Save
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
//  };

//  export default jobPrefrenceLocation;


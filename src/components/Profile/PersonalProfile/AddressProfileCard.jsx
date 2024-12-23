// import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useDispatch, useSelector } from "react-redux";
// import { getAddress, postAddress } from "../../../features/personalProfileSlice";
// import { updateAddressProfile } from "../../../services/profileServices";
// import axios from "axios";
// import { getPincodeUrl } from "../../../store/configue"; // Pincode API URL from config

// const AddressProfileCard = () => {
//   const dispatch = useDispatch();
//   const personalProfile = useSelector((state) => state.personalProfile.address || {});
//   const addressData = personalProfile.current_address || {};
//   const permanentData = personalProfile.current_address || {};

//   const [isEditingAddress, setIsEditingAddress] = useState(false);
//   const [apiError, setApiError] = useState("");

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//   } = useForm();

//  const fetchAddress=()=>{
//   dispatch(getAddress())
//   }
//   useEffect(() => {
//     dispatch(getAddress())
//   }, []);

//   useEffect(() => {
//     if (addressData) {
//       // Use a condition to prevent redundant updates
//       Object.entries(addressData).forEach(([key, value]) => {
//         if (value !== undefined && value !== "") {
//           setValue(key, value); // Update only if necessary
//         }
//       });
//     }
//   }, [addressData, setValue]);

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
//       await updateAddressProfile(data); // Update backend
//       dispatch(postAddress(data)); // Update Redux state
//       fetchAddress();
//       setIsEditingAddress(false);
//     } catch (err) {
//       //console.error("Error updating address:", err);
//       setApiError("Failed to save address. Please try again.");
//     }
//   };

//   return (
//     <div className="px-5 mt-auto">
//       <h2 className="text-xl font-bold mb-6 text-gray-700 text-center underline">
//         Address Information
//       </h2>
//       <div className="mb-4 pl-2">
//         <p className="text-gray-700 font-semibold mb-2">Address</p>
//         {!isEditingAddress ? (
//           <div className="border border-gray-300 rounded-lg shadow-sm p-4 bg-white">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <h3 className="text-sm font-semibold text-teal-600 uppercase">
//                   Address Type
//                 </h3>
//                 <p className="text-gray-700 text-md">
//                   {addressData?.address_type || "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-teal-600 uppercase">
//                   Pincode
//                 </h3>
//                 <p className="text-gray-700 text-md">
//                   {addressData?.pincode || "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-teal-600 uppercase">
//                   State
//                 </h3>
//                 <p className="text-gray-700 text-md">{addressData?.state || "N/A"}</p>
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-teal-600 uppercase">
//                   District
//                 </h3>
//                 <p className="text-gray-700 text-md">
//                   {addressData?.district || "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-teal-600 uppercase">
//                   Block
//                 </h3>
//                 <p className="text-gray-700 text-md">{addressData?.block || "N/A"}</p>
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-teal-600 uppercase">
//                   Village
//                 </h3>
//                 <p className="text-gray-700 text-md">{addressData?.village || "N/A"}</p>
//               </div>
//               <div>
//                 <h3 className="text-sm font-semibold text-teal-600 uppercase">
//                   Area
//                 </h3>
//                 <p className="text-gray-700 text-md">{addressData?.area || "N/A"}</p>
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
//                   Address Type
//                 </label>
//                 <select
//                   {...register("address_type", { required: true })}
//                   className="border border-gray-300 rounded px-3 py-2 w-full"
//                 >
//                   <option value="current">Current Address</option>
//                   <option value="permanent">Permanent Address</option>
//                 </select>
//               </div>
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
//                   Village
//                 </label>
//                 <input
//                   type="text"
//                   {...register("village")}
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
// };

// export default AddressProfileCard;
// import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useDispatch, useSelector } from "react-redux";
// import { getAddress, postAddress, putAddress } from "../../../features/personalProfileSlice";
// import { updateAddressProfile } from "../../../services/profileServices";
// import axios from "axios";
// import { getPincodeUrl } from "../../../store/configue";

// const AddressProfileCard = () => {
//   const dispatch = useDispatch();

//   // Fetch current and permanent address data
//   const personalProfile = useSelector((state) => state.personalProfile.address || {});
//   const currentAddress = personalProfile.current_address || {};
//   const permanentAddress = personalProfile.permanent_address || {};

//   const [editingType, setEditingType] = useState(null); // 'current' or 'permanent'
//   const [apiError, setApiError] = useState("");

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     reset,
//     formState: { errors },
//   } = useForm();

//   // Fetch addresses on load
//   useEffect(() => {
//     dispatch(getAddress());
//   }, [dispatch]);

//   // Load address data into the form when editing starts
//   useEffect(() => {
//     if (editingType) {
//       const data = editingType === "current" ? currentAddress : permanentAddress;
//       reset(data); // Pre-fill the form with address data
//     }
//   }, [editingType, currentAddress, permanentAddress, reset]);

//   // Handle Pincode Change
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
//           setApiError("Invalid Pincode");
//           setValue("state", "");
//           setValue("district", "");
//         }
//       } catch {
//         setApiError("Failed to fetch Pincode details");
//       }
//     }
//   };

//   // Submit Logic
//   const onSubmit = async (data) => {
//     const payload = { [`${editingType}_address`]: data };

//     try {
//       if (personalProfile[`${editingType}_address`]) {
//         // PUT: Update existing address
//         await updateAddressProfile(payload);
//         dispatch(putAddress(payload));
//       } else {
//         // POST: Add new address
//         dispatch(postAddress(payload));
//       }

//       dispatch(getAddress()); // Refresh data
//       setEditingType(null); // Exit editing mode
//     } catch {
//       setApiError("Failed to save address. Please try again.");
//     }
//   };

//   const renderAddressSection = (type, addressData) => (
//     <div className="p-6 border rounded shadow bg-white">
//       <h3 className="font-bold text-lg text-teal-600 mb-3 capitalize">
//         {type} Address
//       </h3>
//       {editingType !== type ? (
//         <>
//           <p className="text-gray-700">Pincode: {addressData.pincode || "N/A"}</p>
//           <p className="text-gray-700">State: {addressData.state || "N/A"}</p>
//           <p className="text-gray-700">District: {addressData.district || "N/A"}</p>
//           <p className="text-gray-700">Area: {addressData.area || "N/A"}</p>
//           <p className="text-gray-700">Village: {addressData.village || "N/A"}</p>
//           <p className="text-gray-700">Block: {addressData.block || "N/A"}</p>
//           <button
//             onClick={() => setEditingType(type)}
//             className="mt-4 px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded hover:bg-teal-600"
//           >
//             Edit
//           </button>
//         </>
//       ) : (
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium">Pincode</label>
//               <input
//                 {...register("pincode", { required: true })}
//                 onChange={handlePincodeChange}
//                 className="w-full border rounded px-3 py-2"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">State</label>
//               <input
//                 {...register("state")}
//                 readOnly
//                 className="w-full border bg-gray-100 px-3 py-2"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">District</label>
//               <input
//                 {...register("district")}
//                 readOnly
//                 className="w-full border bg-gray-100 px-3 py-2"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Area</label>
//               <input {...register("area")} className="w-full border px-3 py-2" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Village</label>
//               <input {...register("village")} className="w-full border px-3 py-2" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Block</label>
//               <input {...register("block")} className="w-full border px-3 py-2" />
//             </div>
//           </div>
//           <div className="flex space-x-4 mt-4">
//             <button
//               type="button"
//               onClick={() => setEditingType(null)}
//               className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 text-white bg-teal-500 rounded hover:bg-teal-600"
//             >
//               Save
//             </button>
//           </div>
//         </form>
//       )}
//     </div>
//   );

//   return (
//     <div className="p-6 bg-gray-50">
//       <h2 className="text-2xl font-bold mb-6 text-center text-gray-700 underline">
//         Address Information
//       </h2>
//       <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
//         {renderAddressSection("current", currentAddress)}
//         {renderAddressSection("permanent", permanentAddress)}
//       </div>
//     </div>
//   );
// };

// export default AddressProfileCard;

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  getAddress,
  postAddress,
  putAddress,
} from "../../../features/personalProfileSlice";
import {
  updateAddressProfile,
  addAddressProfile,
} from "../../../services/profileServices";
import axios from "axios";
import { getPincodeUrl } from "../../../store/configue";

const AddressProfileCard = () => {
  const dispatch = useDispatch();

  // Fetching current and permanent address data
  const personalProfile = useSelector(
    (state) => state.personalProfile.address || {}
  );
  console.log("presonalProfile", personalProfile);
  const currentAddress = personalProfile.current_address || {};
  const permanentAddress = personalProfile.permanent_address || {};

  const [isEditingType, setIsEditingType] = useState(null); // 'current' or 'permanent'
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isEditingType) {
      const data =
        isEditingType === "current" ? currentAddress : permanentAddress;
      if (data) reset(data); // Avoid resetting if data is undefined or null
    }
  }, [isEditingType]); // Minimized dependencies

  useEffect(() => {
    dispatch(getAddress()); // Fetch address data only once
  }, []);

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
          setApiError("Invalid Pincode");
          setValue("state", "");
          setValue("district", "");
        }
      } catch {
        setApiError("Failed to fetch Pincode details");
      }
    }
  };

  // Submit Logic: POST or PUT for the selected address type
  const onSubmit = async (data) => {
    console.log("new data", data);
    const payload = { ...data, address_type: isEditingType };
    //I am giving type of address here for calling Api A/C to that
    //  console.log("payload",payload)
    //console.log("Key being checked:", `${isEditingType}_address`);
    //console.log("Value in personalProfile:", personalProfile?.[`${isEditingType}_address`]);

    try {
      if (
        personalProfile?.[`${isEditingType}_address`] !== null &&
        personalProfile?.[`${isEditingType}_address`] !== undefined
      ) {
        // PUT if address exists (value is not null or undefined)
        console.log(
          "Address exists:",
          personalProfile[`${isEditingType}_address`]
        );
        await updateAddressProfile(payload);
        dispatch(putAddress(payload));
      } else {
        // POST if address does not exist (value is null or undefined)
        console.log("Address does not exist, creating new:", payload);
        await addAddressProfile(payload);
        console.log("Address does not exist, creating new:", payload);
        dispatch(postAddress(payload));
      }

      dispatch(getAddress()); // Refresh address data
      setIsEditingType(null); // Exit edit mode
    } catch (err) {
      setApiError("Failed to save address. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-700 mt-2">
        Address Information
      </h2>

      {/* Render Both Current and Permanent Address */}
      <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
        {/* Current Address */}
        <div className="px-4 py-2 border rounded ">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-teal-600">Current Address</h3>
            <button
              onClick={() => setIsEditingType("current")}
              className="px-4 py-1 bg-teal-500 text-white rounded"
            >
              Edit
            </button>
          </div>
          {!isEditingType || isEditingType !== "current" ? (
            <>
              <div className="flex flex-col gap-2 ">
                <p className="font-semibold text-gray-600">
                  Pincode:{" "}
                  <span className="ml-2 text-md font-normal text-gray-500">
                    {currentAddress.pincode || "Not Provided"}
                  </span>
                </p>
                <p className="font-semibold text-gray-600">
                  State:{" "}
                  <span className="ml-2 text-md font-normal text-gray-500">
                    {currentAddress.state || "Not Provided"}
                  </span>
                </p>
                <p className="font-semibold text-gray-600">
                  District:{" "}
                  <span className="ml-2 text-md font-normal text-gray-500">
                    {currentAddress.district || "Not Provided"}
                  </span>
                </p>
                <p className="font-semibold text-gray-600">
                  Area:{" "}
                  <span className="ml-2 text-md font-normal text-gray-500">
                    {currentAddress.area || "Not Provided"}
                  </span>
                </p>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input
                {...register("pincode", { required: true })}
                placeholder="Pincode"
                onChange={handlePincodeChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                {...register("state")}
                placeholder="State"
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
              <input
                {...register("district")}
                placeholder="District"
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
              <input
                {...register("area")}
                placeholder="Area"
                className="w-full border rounded px-3 py-2"
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingType(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Permanent Address */}
        <div className="p-4 border rounded">
          <h3 className="font-bold text-teal-600 mb-2">Permanent Address</h3>
          {!isEditingType || isEditingType !== "permanent" ? (
            <>
              <p>Pincode: {permanentAddress.pincode || "N/A"}</p>
              <p>State: {permanentAddress.state || "N/A"}</p>
              <p>District: {permanentAddress.district || "N/A"}</p>
              <p>Area: {permanentAddress.area || "N/A"}</p>
              <button
                onClick={() => setIsEditingType("permanent")}
                className="mt-2 px-4 py-2 bg-teal-500 text-white rounded"
              >
                Edit
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input
                {...register("pincode", { required: true })}
                placeholder="Pincode"
                onChange={handlePincodeChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                {...register("state")}
                placeholder="State"
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
              <input
                {...register("district")}
                placeholder="District"
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
              <input
                {...register("area")}
                placeholder="Area"
                className="w-full border rounded px-3 py-2"
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingType(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressProfileCard;

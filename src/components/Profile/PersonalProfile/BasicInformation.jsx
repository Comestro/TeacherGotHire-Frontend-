import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { FiEdit2 } from "react-icons/fi";
import Input from "../../Input";
import { updateBasicProfile } from "../../../services/profileServices";
import { getBasic, postBasic,setShowForm } from "../../../features/personalProfileSlice"; // Replace with actual Redux action

const BasicInformation = () => {
  const dispatch = useDispatch();
  const basicData = useSelector(
    (state) => state.personalProfile.basicData || {}
  ); // Adjust state selector as needed

  const [showForm, setShowForm] = useState(true); // Toggle between form and display mode
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // Fetch the basic data only once when the component mounts
    dispatch(getBasic());
    dispatch(setShowForm(true));
  }, []);


  console.log("Redux State - Basic Data:", basicData);
  useEffect(() => {
    // Pre-fill the form only if basicData is updated and exists
    if (basicData) {  
      Object.entries(basicData).forEach(([key, value]) => setValue(key, value)); // Pre-fill the form
    }
  }, [basicData, setValue]);

  const onSubmit = async (data) => {
    try {
      console.log("kamna",data);
      await updateBasicProfile(data); // Save or update data via API
      dispatch(postBasic(data)); // Update Redux store
      setShowForm(false); // Switch to display mode
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = () => {
    setShowForm(true); // Switch back to form mode

  };

  // for testing purpose
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingGender, setIsEditingGender] = useState(false);

  const [name, setName] = useState("ROYAL GAMERS");
  const [tempName, setTempName] = useState(name);

  const [email, setEmail] = useState("rahul@gmail.com");
  const [tempEmail, setTempEmail] = useState(email);

  const [contact, setContact] = useState("123-456-7890");
  const [tempContact, setTempContact] = useState(contact);

  const [address, setAddress] = useState("2024-12-20");
  const [tempAddress, setTempAddress] = useState(address);

  const [gender, setGender] = useState("Male");
  const [tempGender, setTempGender] = useState(gender);

  return (
    <div className="max-w-3xl px-5 mt-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-700">
        Basic Information
      </h2>

      {/* Profile Photo Section */}
      <h1 className="text-md font-semibold text-gray-700 mb-2">
        Profile Photo
      </h1>
      <div className="flex items-center justify-between mb-4 pl-2">
        <div className="w-16 h-16 rounded-full overflow-hidden">
          <img
            src="https://via.placeholder.com/64"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-4">
          <button className="text-blue-700 text-md mr-3">Remove photo</button>
          <button className="text-gray-800 px-4 py-2 border border-1 border-gray-300 rounded-md text-sm">
            Change photo
          </button>
        </div>
      </div>
      <hr className="mb-4" />

      {/* Name Section */}
      <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Name</p>
        {!isEditingName ? (
          <div className="flex justify-between items-center">
            <p className="text-gray-500">{name}</p>
            <button
              className="text-gray-700 border border-1 border-gray-400 px-8 py-2 rounded-md text-sm"
              onClick={() => setIsEditingName(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={() => {
                setTempName(name); 
                setIsEditingName(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setName(tempName); 
                setIsEditingName(false);
              }}
              className="px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <hr className="mb-4" />

      {/* Email Section */}
      <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Email Address</p>
        {!isEditingEmail ? (
          <div className="flex justify-between items-center">
            <p className="text-gray-500">{email}</p>
            <button
              className="text-gray-700 border border-1 border-gray-400 px-8 py-2 rounded-md text-sm"
              onClick={() => setIsEditingEmail(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <input
              type="email"
              value={tempEmail}
              onChange={(e) => setTempEmail(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={() => {
                setTempEmail(email); // Revert changes
                setIsEditingEmail(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setEmail(tempEmail); // Save changes
                setIsEditingEmail(false);
              }}
              className="px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <hr className="mb-4" />
      {/* Contact Number Section */}
      <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Contact Number</p>
        {!isEditingContact ? (
          <div className="flex justify-between items-center">
            <p className="text-gray-500">{contact}</p>
            <button
              className="text-gray-700 border border-1 border-gray-400 px-8 py-2 rounded-md text-sm"
              onClick={() => setIsEditingContact(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={tempContact}
              onChange={(e) => setTempContact(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => {
                setTempContact(contact); // Revert changes
                setIsEditingContact(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setContact(tempContact); // Save changes
                setIsEditingContact(false);
              }}
              className="px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
            >
              Save
            </button>
          </div>
        )}
      </div>

      <hr className="mb-4" />
      {/* Address Section */}
      <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Date of Birth</p>
        {!isEditingAddress ? (
          <div className="flex justify-between items-center">
            <p className="text-gray-500">{address}</p>
            <button
              className="text-gray-700 border border-1 border-gray-400 px-8 py-2 rounded-md text-sm"
              onClick={() => setIsEditingAddress(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={tempAddress}
              onChange={(e) => setTempAddress(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={() => {
                setTempAddress(address);
                setIsEditingAddress(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setAddress(tempAddress);
                setIsEditingAddress(false);
              }}
              className="px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
            >
              Save
            </button>
          </div>
        )}
      </div>

      <hr className="mb-4" />

      {/* Gender Section */}
      <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Gender</p>
        {!isEditingGender ? (
          <div className="flex justify-between items-center">
            <p className="text-gray-600 font-medium">{gender}</p>
            <button
              className="text-gray-700 border border-1 border-gray-400 px-8 py-2 rounded-md text-sm"
              onClick={() => setIsEditingGender(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="flex justify-between space-y-3">
            <div className="flex space-x-3">
              <button
                onClick={() => setTempGender("Male")}
                className={`px-4 py-1 rounded-md text-sm ${
                  tempGender === "Male"
                    ? "bg-teal-500 text-white"
                    : "border border-gray-300 text-gray-700"
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setTempGender("Female")}
                className={`px-4 py-1 rounded-md text-sm ${
                  tempGender === "Female"
                    ? "bg-teal-500 text-white"
                    : "border border-gray-300 text-gray-700"
                }`}
              >
                Female
              </button>
              <button
                onClick={() => setTempGender("Other")}
                className={`px-4 py-1 rounded-md text-sm ${
                  tempGender === "Other"
                    ? "bg-teal-500 text-white"
                    : "border border-gray-300 text-gray-700"
                }`}
              >
                Other
              </button>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setTempGender(gender);
                  setIsEditingGender(false);
                }}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setGender(tempGender);
                  setIsEditingGender(false);
                }}
                className="px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    // <div className="p-5 bg-red-200">
    //   <h3 className="text-xl font-semibold mb-4">Basic Information</h3>

    //   {showForm ? (
    //     // Form Mode
    //     <form
    //       onSubmit={handleSubmit(onSubmit)}
    //       className="space-y-4 bg-gray-100 p-4 rounded-md"
    //     >
    //       <div className="grid grid-cols-2 gap-4">
    //         <Input
    //           label="Name"
    //           className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
    //           placeholder="Enter Name"
    //           type="text"
    //           {...register("name", { required: "Name is required" })}
    //         />
    //         {errors.name && (
    //           <span className="text-red-500 text-sm">{errors.name.message}</span>
    //         )}

    //         <Input
    //           label="Email"
    //           className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
    //           placeholder="Enter Email"
    //           type="email"
    //           {...register("email", { required: "Email is required" })}
    //         />
    //         {errors.email && (
    //           <span className="text-red-500 text-sm">{errors.email.message}</span>
    //         )}

    //         <Input
    //           label="Phone Number"
    //           className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
    //           placeholder="Enter Phone Number"
    //           type="text"
    //           {...register("mobile", { required: "Phone number is required" })}
    //         />
    //         {errors.phone_no && (
    //           <span className="text-red-500 text-sm">
    //             {errors.phone_no.message}
    //           </span>
    //         )}

    //         <Input
    //           label="Location"
    //           className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
    //           placeholder="Enter Location"
    //           type="text"
    //           {...register("location")}
    //         />
    //       </div>

    //       <div className="flex justify-end space-x-4 mt-4">
    //         <button
    //           type="submit"
    //           className="bg-black text-white px-5 py-2 rounded hover:bg-gray-900 w-32"
    //         >
    //           Save
    //         </button>
    //       </div>
    //     </form>
    //   ) : (
    //     // Display Mode
    //     <div className="bg-white p-4 rounded-md shadow-md">
    //       <div className="mb-4">
    //         <p>
    //           <strong>Name:</strong> {basicData.name }
    //         </p>
    //         <p>
    //           <strong>Email:</strong> {basicData.email }
    //         </p>
    //         <p>
    //           <strong>Phone:</strong> {basicData.mobile }
    //         </p>
    //         <p>
    //           <strong>Location:</strong> {basicData.location }
    //         </p>
    //       </div>
    //       <button
    //         onClick={handleEdit}
    //         className="text-blue-500 hover:text-blue-700 flex items-center space-x-2"
    //       >
    //         <FiEdit2 size={20} />
    //         <span>Edit</span>
    //       </button>
    //     </div>
    //   )}

    //   {/* Error Message */}
    //   {error && (
    //     <p className="text-red-500 text-sm mt-4">
    //       Error: {error}
    //     </p>
    //   )}
    // </div>
  );
};

export default BasicInformation;

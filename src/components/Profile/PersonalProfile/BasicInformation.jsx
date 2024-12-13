import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateBasicProfile } from "../../../services/profileServices";
import { getBasic, postBasic } from "../../../features/personalProfileSlice";

const BasicInformation = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getBasic()).then((response) => {
      console.log('Responseghjk:', response);
    }).catch((error) => {
      console.error('Error:', error);
    });
  }, [dispatch]);

  const basicData = useSelector((state) => state?.personalProfile?.basicData);

  console.log("Basic Information", basicData);
  const profile = useSelector(
    (state) => state?.auth?.userData || {}
  );
  const [error, setError] = useState("");

  // useEffect (()=>{
  //   dispatch(getBasic());
  // },[dispatch]);

  
  
  const onSubmit = async (data) => {
    try {
      await updateBasicProfile(data);
      dispatch(postBasic(data));
    } catch (error) {
      setError(error.message);
    }
  };

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingLanguage, setIsEditingLanguage] = useState(false);
  const [isEditingMarital_status, setIsEditingMarital_status] = useState(false);
  const [isEditingReligion, setIsEditingReligion] = useState(false);
  //const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [tempName, setTempName] = useState(profile.Fname);
  const [tempEmail, setTempEmail] = useState(profile.email);
  const [phone_number, setphone_number] = useState(basicData.phone_number);
  const [language, setlanguage] = useState(basicData.language);
  const [marital_status, setMaritalStatus] = useState(basicData.marital_status);
  const [religion, setReligion] = useState(basicData.religion);
  // const [tempAddress, setTempAddress] = useState(address);

  return (
    <div className="max-w-3xl px-5 mt-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-700">
        Basic Information
      </h2>

      {/* Profile Photo Section */}
      {/* <h1 className="text-md font-semibold text-gray-700 mb-2">
        Profile Photo
      </h1> */}

      {/* Name Section */}

      <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Name</p>
        {!isEditingName ? (
          <div className="flex justify-between items-center">
            <p className="text-gray-600 font-medium">{profile.Fname}</p>
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
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => {
                setTempName(profile.Fname);
                setIsEditingName(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSubmit({ tempName });
                setIsEditingName(false);
              }}
              className="px-4 py-2 text-sm text-white bg-purple-500 rounded hover:bg-purple-600"
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
            <p className="text-gray-600 font-medium">{profile.email}</p>
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
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => {
                onSubmit(tempEmail);
                setIsEditingEmail(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setEmail(tempEmail);
                setIsEditingEmail(false);
              }}
              className="px-4 py-2 text-sm text-white bg-purple-500 rounded hover:bg-purple-600"
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
            <p className="text-gray-600 font-medium">
              {basicData?.data?.data?.phone_number}
            </p>

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
              value={phone_number}
              onChange={(e) => setphone_number(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => {
                setphone_number(basicData.phone_number);
                setIsEditingContact(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSubmit({ phone_number });
                setIsEditingContact(false);
              }}
              className="px-4 py-2 text-sm text-white bg-purple-500 rounded hover:bg-purple-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <hr className="mb-4" />

      {/* language */}

      <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Language</p>
        {!isEditingLanguage ? (
          <div className="flex justify-between items-center">
            <p className="text-gray-600 font-medium">
              {basicData.data?.data?.language}
            </p>
            <button
              className="text-gray-700 border border-1 border-gray-400 px-8 py-2 rounded-md text-sm"
              onClick={() => setIsEditingLanguage(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={language}
              onChange={(e) => setlanguage(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => {
                setlanguage(basicData.language);
                setIsEditingLanguage(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSubmit({ language });
                setIsEditingLanguage(false);
              }}
              className="px-4 py-2 text-sm text-white bg-purple-500 rounded hover:bg-purple-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <hr className="mb-4" />

      {/* Maritial Status */}
      <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Marital Status</p>
        {!isEditingMarital_status ? (
          <div className="flex justify-between items-center">
            <p className="text-gray-600 font-medium">
              {basicData?.data?.data?.marital_status}
            </p>
            <button
              className="text-gray-700 border border-1 border-gray-400 px-8 py-2 rounded-md text-sm"
              onClick={() => setIsEditingMarital_status(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <select
              value={marital_status}
              onChange={(e) => setMaritalStatus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="single">Single</option>
              <option value="married">Married</option>
            </select>
            <button
              onClick={() => {
                setMaritalStatus(basicData.marital_status);
                setIsEditingMarital_status(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSubmit({ marital_status });
                setIsEditingMarital_status(false);
              }}
              className="px-4 py-2 text-sm text-white bg-purple-500 rounded hover:bg-purple-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <hr className="mb-4" />

      {/* Religion */}

      <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Religion</p>
        {!isEditingReligion ? (
          <div className="flex justify-between items-center">
            <p className="text-gray-600 font-medium">
              {basicData?.data?.data?.religion}
            </p>

            <button
              className="text-gray-700 border border-1 border-gray-400 px-8 py-2 rounded-md text-sm"
              onClick={() => setIsEditingReligion(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => {
                setReligion(basicData.religion);
                setIsEditingReligion(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSubmit({ religion });
                setIsEditingReligion(false);
              }}
              className="px-4 py-2 text-sm text-white bg-purple-500 rounded hover:bg-purple-600"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Address Section */}
      {/* <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Address</p>
        {!isEditingAddress ? (
          <div className="flex justify-between items-center">
            <p className="text-gray-600 font-medium">{address}</p>
            <button
              className="text-gray-700 border border-1 border-gray-400 px-8 py-2 rounded-md text-sm"
              onClick={() => setIsEditingAddress(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            <select
              value={tempAddress}
              onChange={(e) => setTempAddress(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Current Address">Current Address</option>
              <option value="Permanent Address">Permanent Address</option>
            </select>
            <div className="flex space-x-4">
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
                className="px-4 py-2 text-sm text-white bg-purple-500 rounded hover:bg-purple-600"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div> */}
    </div>
  );
};

export default BasicInformation;

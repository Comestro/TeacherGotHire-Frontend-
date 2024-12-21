import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateBasicProfile } from "../../../services/profileServices";
import { getBasic, postBasic } from "../../../features/personalProfileSlice";
import { HiCheck, HiPencil, HiX } from "react-icons/hi";

const BasicInformation = () => {
  const dispatch = useDispatch();
  const fetchBasicData = () => {
    dispatch(getBasic());
  };

  useEffect(() => {
    dispatch(getBasic())
      .then((response) => {
        console.log("Responseghjk:", response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  const profile = useSelector((state) => state?.auth?.userData || {});
  const [error, setError] = useState("");

  const personalProfile = useSelector((state) => state?.personalProfile);
  const basicData = personalProfile?.basicData;
  console.log("Basic Information", basicData);

  const onSubmit = async (data) => {
    try {
      await updateBasicProfile(data);
      dispatch(postBasic(data));
      fetchBasicData();
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
    <div className=" md:px-5 mt-auto flex flex-col gap-3">
      <h2 className="text-xl font-bold mb-6 text-gray-700">
        Basic Information
      </h2>

      {/* Name section */}
      <div>
        {!isEditingName ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-5">
              <p className="text-gray-700 font-semibold">Name : </p>
              <p className="text-gray-600 ">{profile.Fname}</p>
            </div>
            <button
              className="text-gray-500 px-5 py-1  hover:bg-slate-200 rounded-md text-sm"
              onClick={() => setIsEditingName(true)}
            >
              <HiPencil className="size-5" />
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
              <HiX />
            </button>
            <button
              onClick={() => {
                onSubmit({ tempName });
                fetchBasicData();
                setIsEditingName(false);
              }}
              className="px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
            >
              <HiCheck />
            </button>
          </div>
        )}
      </div>
      <hr/>

      {/* Email Section */}
      <div>
        {!isEditingEmail ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-5">
              <p className="text-gray-700 font-semibold">Email Address :</p>
              <p className="text-gray-500 ">{profile.email}</p>
            </div>
            
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
                fetchBasicData();
                setIsEditingEmail(false);
              }}
              className="px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <hr/>

      {/* Contact Number Section */}
      <div>
        {!isEditingContact ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-5">
              <p className="text-gray-700 font-semibold">Contact Number :</p>
              <p className="text-gray-600 font-medium">
                {basicData?.phone_number}
              </p>
            </div>

            <button
              className="text-gray-500 hover:bg-slate-200  px-5 py-1  rounded-md text-sm"
              onClick={() => setIsEditingContact(true)}
            >
              <HiPencil className="size-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={phone_number}
              onChange={(e) => setphone_number(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                fetchBasicData();
                setIsEditingContact(false);
              }}
              className="px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <hr/>

      {/* language */}
      <div>
        {!isEditingLanguage ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-5">
              <p className="text-gray-700 font-semibold">Language :</p>
              <p className="text-gray-600 font-medium">{basicData?.language}</p>
            </div>
            <button
              className="text-gray-500 hover:bg-slate-200  px-5 py-1  rounded-md text-sm"
              onClick={() => setIsEditingLanguage(true)}
            >
              <HiPencil className="size-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={language}
              onChange={(e) => setlanguage(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                fetchBasicData();
                setIsEditingLanguage(false);
              }}
              className="px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <hr/>

      {/* Maritial Status */}
      <div>
        {!isEditingMarital_status ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-5">
              <p className="text-gray-700 font-semibold">Marital Status :</p>
              <p className="text-gray-600 font-medium">
                {basicData.marital_status}
              </p>
            </div>
            <button
              className="text-gray-500 px-5 py-1 hover:bg-slate-200  rounded-md text-sm"
              onClick={() => setIsEditingMarital_status(true)}
            >
              <HiPencil className="size-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <select
              value={marital_status}
              onChange={(e) => setMaritalStatus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="unmarried">UnMarried</option>
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
                fetchBasicData();
                setIsEditingMarital_status(false);
              }}
              className="px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <hr/>

      {/* Religion */}
      <div>
        {!isEditingReligion ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-5">
              <p className="text-gray-700 font-semibold">Religion :</p>
              <p className="text-gray-600 font-medium">{basicData.religion}</p>
            </div>

            <button
              className="text-gray-500 hover:bg-slate-200 px-5 py-1  rounded-md text-sm"
              onClick={() => setIsEditingReligion(true)}
            >
              <HiPencil className="size-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                fetchBasicData();
                setIsEditingReligion(false);
              }}
              className="px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <hr/>

    </div>
  );
};

export default BasicInformation;

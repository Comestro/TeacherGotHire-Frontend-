import React, { useEffect, useRef, useState } from "react";
import { CiCircleCheck, CiCirclePlus } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import {
  getBasic,
  getProfilCompletion,
} from "../../../features/personalProfileSlice";
import { Link } from "react-router-dom";
import AddressProfileCard from "../../Profile/PersonalProfile/AddressProfileCard";
import PrefrenceProfile from "../../Profile/JobProfile/PrefrenceProfile";
import Education from "../../Profile/JobProfile/Education";
import JobPrefrenceLocation from "../../Profile/JobProfile/JobPrefrenceLocation";
import Modal from "./Modal";

const TeacherDashboardCard = () => {
  // Add state for modal and selected detail
  const [showModal, setShowModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // New state for image upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getBasic()).catch((error) => console.error("Error:", error));
    dispatch(getProfilCompletion()).catch((error) =>
      console.error("Error:", error)
    );
  }, [dispatch]);

  const personalProfile = useSelector((state) => state?.personalProfile);
  const basicData = personalProfile?.basicData || {};

  // calling percentage
  const percentage = useSelector((state) => {
    const profileCompleted =
      state.personalProfile?.completionData?.profile_completed;
    return Array.isArray(profileCompleted) && profileCompleted.length > 0
      ? profileCompleted[0]
      : 0;
  });

  // calling missing details
  const missingDetails = useSelector((state) => {
    const profileCompleted =
      state.personalProfile?.completionData?.profile_completed;
    return Array.isArray(profileCompleted) && profileCompleted.length >= 2
      ? profileCompleted[1]
      : [];
  });

  console.log("missingDetails", missingDetails);

  // Determine which form to show based on the error message
  const getFormComponent = () => {
    switch (selectedDetail) {
      case "Add Address":
        return <AddressProfileCard onSuccess={handleFormSuccess} />;
      case "Add Job Preferences":
        return <PrefrenceProfile onSuccess={handleFormSuccess} />;
      case "Add Qualification":
        return <Education onSuccess={handleFormSuccess} />;
      // case "Add Job Preference Location":
      //   return <JobPrefrenceLocation onSuccess={handleFormSuccess} />;
      default:
        return null;
    }
  };

  // Handle modal open for first missing detail
  const handleAddMissingDetails = () => {
    if (missingDetails.length > 0) {
      setSelectedDetail(missingDetails[0]);
      setShowModal(true);
    }
  };

  // Refresh data after successful form submission
  const handleFormSuccess = () => {
    setShowModal(false);
    dispatch(getProfilCompletion()); // Refresh completion data
    dispatch(getBasic()); // Refresh basic data if needed
  };

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setProgress(percentage);
    }, 300);
  }, [percentage]);

  // Calculate stroke values for animated progress ring
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const fileInputRef = useRef(null);

  const handleEditProfileClick = (e) => {
    e.preventDefault(); // Prevent default link behavior
    fileInputRef.current.click();
  };

  return (
    <div className="relative overflow-hidden flex flex-col md:flex-row items-center justify-between w-full bg-[#E5F1F9] px-4 md:px-6 py-1 pb-2 md:py-4 rounded-lg border border-[#D6F7DE] transition-shadow duration-300 md:mt-2">
      <div className="hidden md:block absolute h-full w-[80%] md:w-[70%] bg-[#c7e4f794] left-0 top-0 z-0"></div>
      <div className="absolute hidden md:block md:h-96 h-full w-[45%] md:w-[35%] bg-[#a1d8f6] md:rounded-l-full right-0 z-0"></div>

      {/* Profile Section */}
      <div className=" flex-col items-center mb-4 md:mb-0 z-10 w-full md:w-auto hidden md:block">
        <div className="relative w-16 h-16 md:w-28 md:h-28">
          {" "}
          {/* Smaller on mobile */}
          <svg
            className="absolute inset-0 w-16 h-16 md:w-28 md:h-28 transform -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Circles remain same */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="6 md:stroke-width-8"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#3E98C7"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <img
            src={basicData?.profile_picture || "/images/profile.jpg"}
            alt="Profile"
            className="w-12 h-12 md:w-24 md:h-24 rounded-full object-cover border-4 border-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-[2px]"
          />
        </div>
        <div className="text-[#2A6F97] font-semibold text-xs md:text-sm mt-2 md:mt-0 flex flex-col items-center space-y-1">
          <div className="text-center">
            <Link
              to="#"
              className="text-gray-600 cursor-pointer hover:text-gray-800 text-sm md:text-base"
              onClick={handleEditProfileClick}
            >
              Edit Profile
            </Link>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => console.log("Selected file:", e.target.files[0])}
            />
          </div>
          <span className="text-xs md:text-sm">{progress}% Completed</span>
        </div>
      </div>

      {/* profile for mobile */}
      <div className="md:hidden flex items-center w-full mb-4 z-10">
        <div className="relative w-16 h-16 mr-4">
          <svg
            className="absolute inset-0 w-16 h-16 transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#3E98C7"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <img
            src={basicData?.profile_picture || "/images/profile.jpg"}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover border-4 border-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-[2px]"
          />
        </div>
        <div className="flex flex-col ml-2">
          <Link
            to="#"
            className="text-gray-600 cursor-pointer hover:text-gray-800 text-sm"
            onClick={handleEditProfileClick}
          >
            Edit Profile
          </Link>
          <span className="text-xs text-[#2A6F97] font-semibold">
            {progress}% Completed
          </span>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="flex-1 px-2 md:px-6 md:pl-10 text-left z-10 mt-3 md:mt-0 hidden md:block">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">
          Welcome to Your Teacher Dashboard!
        </h2>
        <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2">
          Dear Teacher, we’re excited to have you on board! 🎉 To get started:
        </p>
        <ul className="mt-1 md:mt-3 text-xs md:text-sm text-left font-semibold text-gray-700 space-y-1">
          <li className="flex items-center justify-start">
            <span className="mr-1 md:mr-2">1️⃣</span> Complete Your Profile
          </li>
          <li className="flex items-center justify-start">
            <span className="mr-1 md:mr-2">2️⃣</span> Attempt the Online Exam
          </li>
          <li className="flex items-center justify-start">
            <span className="mr-1 md:mr-2">3️⃣</span> Unlock Teaching
            Opportunities
          </li>
        </ul>
      </div>

      {/* Missing Details Section */}
      <div className="w-full md:w-auto mt-2 md:mt-0 p-3 border border-gray-200 rounded-lg bg-gray-50 z-10">
        {missingDetails.length > 0 ? (
          <>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Add Missing Details:
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {missingDetails.map((message, index) => (
                <li key={index} className="flex items-center">
                  <CiCirclePlus className="w-5 h-5 mr-2 text-[#3E98C7]" />
                  <span className="truncate">{message}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleAddMissingDetails}
              className="mt-3 w-full px-4 py-2 text-sm font-semibold text-white bg-[#3E98C7] rounded-md"
            >
              Add Missing Details
            </button>
          </>
        ) : (
          <div className="w-full">
            <div className="flex flex-col items-center text-center p-2">
              <div className="mb-2 p-2 bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] rounded-full">
                <CiCircleCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                Ready to Shine! 🌟
              </h3>
              <p className="text-xs text-gray-600">
                All requirements completed! Ready for exam.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal for missing details */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedDetail}
      >
        {getFormComponent()}
      </Modal>
    </div>
  );
};

export default TeacherDashboardCard;

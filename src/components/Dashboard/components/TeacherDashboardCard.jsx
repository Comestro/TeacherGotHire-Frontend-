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
import { motion } from "framer-motion";
import { FiArrowRight, FiEdit2, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const TeacherDashboardCard = () => {
  // Add state for modal and selected detail
  const [showModal, setShowModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [modalKey, setModalKey] = useState(0); // Add a key for modal re-render

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getBasic()).catch((error) => console.error("Error:", error));
    dispatch(getProfilCompletion()).catch((error) =>
      console.error("Error:", error)
    );
  }, [dispatch, showModal]);

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

  // Determine which form to show based on the error message
  const getFormComponent = () => {
    switch (selectedDetail) {
      case "Add Address":
        return <AddressProfileCard onSuccess={handleFormSuccess} />;
      case "Add Job Preferences":
        return <PrefrenceProfile onSuccess={handleFormSuccess} />;
      case "Add Qualification":
        return <Education onSuccess={handleFormSuccess} />;
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

  // Get status color based on progress
  const getStatusColor = () => {
    if (progress < 30) return "text-red-500";
    if (progress < 70) return "text-amber-500";
    return "text-green-500";
  };

  // Get progress ring color based on progress
  const getProgressColor = () => {
    if (progress < 30) return "#EF4444";
    if (progress < 70) return "#F59E0B";
    return "#10B981";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100"
    >
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {/* Profile & Progress Section */}
          <div className="p-6 flex flex-col items-center text-center bg-gradient-to-b from-blue-50 to-white">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={getProgressColor()}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={basicData?.profile_picture || "/images/profile.jpg"}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800">
                {basicData?.user?.Fname || "User"} {basicData?.user?.Lname}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{basicData?.user?.email}</p>
            </div>
            
            <div className="mt-4 flex items-center gap-1.5">
              <span className={`text-xl font-bold ${getStatusColor()}`}>{progress}%</span>
              <span className="text-sm text-gray-500">Profile Complete</span>
            </div>
            
            <div className="mt-4 w-full">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ backgroundColor: getProgressColor() }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Welcome & Steps Section */}
          <div className="col-span-2 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Welcome to Your Teacher Dashboard
              </h2>
              {missingDetails.length === 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <FiCheckCircle className="w-3.5 h-3.5 mr-1" />
                  Profile Complete
                </span>
              )}
            </div>
            
            <p className="text-gray-600 mb-6">
              Follow these steps to start your teaching journey and access opportunities that match your qualifications.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`rounded-lg p-4 ${progress >= 33 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium ${progress >= 33 ? 'text-green-800' : 'text-gray-500'}`}>Step 1</span>
                  {progress >= 33 ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                      <FiCheckCircle className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-xs font-bold">
                      1
                    </span>
                  )}
                </div>
                <h3 className={`font-medium ${progress >= 33 ? 'text-green-700' : 'text-gray-700'}`}>Complete Profile</h3>
                <p className="text-xs text-gray-500 mt-1">Build your professional profile</p>
              </div>
              
              <div className={`rounded-lg p-4 ${progress >= 66 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium ${progress >= 66 ? 'text-green-800' : 'text-gray-500'}`}>Step 2</span>
                  {progress >= 66 ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                      <FiCheckCircle className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-xs font-bold">
                      2
                    </span>
                  )}
                </div>
                <h3 className={`font-medium ${progress >= 66 ? 'text-green-700' : 'text-gray-700'}`}>Pass Exams</h3>
                <p className="text-xs text-gray-500 mt-1">Qualify through assessments</p>
              </div>
              
              <div className={`rounded-lg p-4 ${progress >= 100 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium ${progress >= 100 ? 'text-green-800' : 'text-gray-500'}`}>Step 3</span>
                  {progress >= 100 ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                      <FiCheckCircle className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-xs font-bold">
                      3
                    </span>
                  )}
                </div>
                <h3 className={`font-medium ${progress >= 100 ? 'text-green-700' : 'text-gray-700'}`}>Get Hired</h3>
                <p className="text-xs text-gray-500 mt-1">Apply for teaching positions</p>
              </div>
            </div>
            
            {/* Missing Details */}
            {missingDetails.length > 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FiAlertCircle className="text-amber-500 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800 mb-2">Complete Your Profile</h4>
                    <ul className="space-y-2">
                      {missingDetails.map((message, index) => (
                        <li key={index} className="flex items-center text-sm text-amber-700">
                          <CiCirclePlus className="w-4 h-4 mr-2 text-amber-600" />
                          <span>{message}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={handleAddMissingDetails}
                      className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors"
                    >
                      Complete Profile <FiArrowRight className="ml-1.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <div className="p-2 bg-green-500 rounded-full mr-3">
                  <CiCircleCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-green-800">Profile Complete!</h4>
                  <p className="text-sm text-green-700 mt-1">You've completed all requirements.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={getProgressColor()}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <img
                src={basicData?.profile_picture || "/images/profile.jpg"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-gray-800">
                {basicData?.user?.Fname || "User"} {basicData?.user?.Lname}
              </h2>
              <p className="text-xs text-gray-600 truncate">
                {basicData?.user?.email || "user@example.com"}
              </p>
              <div className="flex items-center mt-1">
                <span className={`text-sm font-bold ${getStatusColor()}`}>{progress}%</span>
                <span className="text-xs text-gray-500 ml-1">Complete</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 h-1.5 w-full bg-white/50 rounded-full overflow-hidden">
            <motion.div 
              className="h-full rounded-full"
              style={{ backgroundColor: getProgressColor() }}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Your Progress</h3>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${progress >= 33 ? "bg-green-500" : "bg-gray-200"}`}>
                  {progress >= 33 ? "✓" : "1"}
                </div>
                <span className="text-sm">Complete Profile</span>
              </div>
              <span className={`text-xs font-medium ${progress >= 33 ? "text-green-600" : "text-gray-500"}`}>
                {progress >= 33 ? "Completed" : "Pending"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${progress >= 66 ? "bg-green-500" : "bg-gray-200"}`}>
                  {progress >= 66 ? "✓" : "2"}
                </div>
                <span className="text-sm">Pass Exams</span>
              </div>
              <span className={`text-xs font-medium ${progress >= 66 ? "text-green-600" : "text-gray-500"}`}>
                {progress >= 66 ? "Completed" : "Pending"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${progress >= 100 ? "bg-green-500" : "bg-gray-200"}`}>
                  {progress >= 100 ? "✓" : "3"}
                </div>
                <span className="text-sm">Start Teaching</span>
              </div>
              <span className={`text-xs font-medium ${progress >= 100 ? "text-green-600" : "text-gray-500"}`}>
                {progress >= 100 ? "Completed" : "Pending"}
              </span>
            </div>
          </div>

          {/* Mobile Missing Details */}
          {missingDetails.length > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-amber-800 flex items-center mb-2">
                <FiAlertCircle className="mr-1.5 text-amber-500" />
                {missingDetails.length} items pending
              </h4>
              <div className="space-y-1.5 mb-3">
                {missingDetails.map((detail, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-amber-700">
                    <CiCirclePlus className="text-amber-600 flex-shrink-0" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddMissingDetails}
                className="w-full flex justify-center items-center px-3 py-2 text-xs font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors"
              >
                Complete Now
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <CiCircleCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-green-800">Profile Complete!</h4>
              <p className="text-xs text-green-700 mt-1">You're ready for the next steps</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for missing details (same for both views) */}
      <Modal
        key={modalKey}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedDetail}
      >
        {getFormComponent()}
      </Modal>
    </motion.div>
  );
};

export default TeacherDashboardCard;

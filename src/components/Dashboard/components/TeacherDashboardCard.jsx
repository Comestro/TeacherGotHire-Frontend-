import React, { useEffect, useRef, useState } from "react";
import { CiCircleCheck, CiCirclePlus } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import {
  getBasic,
  getProfilCompletion,
} from "../../../features/personalProfileSlice";
import AddressProfileCard from "../../Profile/PersonalProfile/AddressProfileCard";
import PrefrenceProfile from "../../Profile/JobProfile/PrefrenceProfile";
import Education from "../../Profile/JobProfile/Education";
import Modal from "./Modal";
import { motion } from "framer-motion";
import { FiArrowRight, FiCheckCircle, FiAlertCircle, FiUser, FiCalendar, FiList, FiChevronRight } from "react-icons/fi";

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

  // Get background gradient based on progress
  const getProgressGradient = () => {
    if (progress < 30) return "from-red-50 to-rose-50";
    if (progress < 70) return "from-amber-50 to-orange-50";
    return "from-emerald-50 to-teal-50";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border overflow-hidden"
    >
      {/* Desktop Layout - Compact & Modern */}
      <div className="hidden md:block">
        <div className="flex items-stretch">
          {/* Profile & Progress Section */}
          <div className="w-1/4 bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center border-r border-gray-100 relative overflow-hidden">
            {/* Decorative circles in background */}
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-blue-100 opacity-30 -mr-8 -mt-8"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 rounded-full bg-indigo-100 opacity-30 -ml-6 -mb-6"></div>
            
            <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={40}
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={40}
                  fill="transparent"
                  stroke={getProgressColor()}
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - progress / 100)}
                  strokeLinecap="round"
                >
                  <animate 
                    attributeName="stroke-dashoffset" 
                    from={2 * Math.PI * 40} 
                    to={2 * Math.PI * 40 * (1 - progress / 100)} 
                    dur="1s" 
                    fill="freeze" 
                    calcMode="spline"
                    keySplines="0.42 0 0.58 1"
                  />
                </circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img
                    src={basicData?.profile_picture || "/images/profile.jpg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-2 text-center z-10">
              <h3 className="font-semibold text-gray-800 text-sm truncate max-w-[150px]">
                {basicData?.user?.Fname || "User"} {basicData?.user?.Lname}
              </h3>
              <div className="mt-1 flex items-center justify-center gap-1">
                <span className={`text-lg font-bold ${getStatusColor()}`}>{progress}%</span>
                <span className="text-xs text-gray-500 truncate">Complete</span>
              </div>
            </div>
          </div>

          {/* Middle Section - Progress Steps */}
          <div className="w-2/5 p-4 flex flex-col justify-center">
            <div className="flex items-center mb-3">
              <h2 className="text-base font-bold text-gray-800">Your Progress</h2>
              {missingDetails.length === 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <FiCheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </span>
              )}
            </div>
            
            <div className="space-y-3 ">
              {/* Progress step 1 */}
              <div className="relative">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 33 ? "bg-gradient-to-br from-green-400 to-green-500 text-white" : "bg-gray-200 text-gray-500"} shadow-sm z-10`}>
                    {progress >= 33 ? <FiCheckCircle className="w-3 h-3" /> : "1"}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-medium ${progress >= 33 ? "text-green-600" : "text-gray-600"}`}>Profile</span>
                      <span className={`text-xs ${progress >= 33 ? "text-green-500 font-medium" : "text-gray-400"}`}>
                        {progress >= 33 ? "Completed" : "Pending"}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full">
                      <motion.div 
                        className={`h-full rounded-full ${progress >= 33 ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gray-300"}`}
                        initial={{ width: "0%" }}
                        animate={{ width: progress >= 33 ? "100%" : `${(progress/33)*100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
                {/* Vertical connector line */}
                <div className="absolute left-[11px] top-6 h-5 w-0.5 bg-gray-200 z-0"></div>
              </div>
              
              {/* Progress step 2 */}
              <div className="relative">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 66 ? "bg-gradient-to-br from-green-400 to-green-500 text-white" : "bg-gray-200 text-gray-500"} shadow-sm z-10`}>
                    {progress >= 66 ? <FiCheckCircle className="w-3 h-3" /> : "2"}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-medium ${progress >= 66 ? "text-green-600" : "text-gray-600"}`}>Exams</span>
                      <span className={`text-xs ${progress >= 66 ? "text-green-500 font-medium" : "text-gray-400"}`}>
                        {progress >= 66 ? "Completed" : "Pending"}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full">
                      <motion.div 
                        className={`h-full rounded-full ${progress >= 66 ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gray-300"}`}
                        initial={{ width: "0%" }}
                        animate={{ width: progress >= 66 ? "100%" : progress <= 33 ? "0%" : `${((progress-33)/33)*100}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      />
                    </div>
                  </div>
                </div>
                {/* Vertical connector line */}
                <div className="absolute left-[11px] top-6 h-5 w-0.5 bg-gray-200 z-0"></div>
              </div>
              
              {/* Progress step 3 */}
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 100 ? "bg-gradient-to-br from-green-400 to-green-500 text-white" : "bg-gray-200 text-gray-500"} shadow-sm`}>
                  {progress >= 100 ? <FiCheckCircle className="w-3 h-3" /> : "3"}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-medium ${progress >= 100 ? "text-green-600" : "text-gray-600"}`}>Hiring</span>
                    <span className={`text-xs ${progress >= 100 ? "text-green-500 font-medium" : "text-gray-400"}`}>
                      {progress >= 100 ? "Ready" : "Pending"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full">
                    <motion.div 
                      className={`h-full rounded-full ${progress >= 100 ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gray-300"}`}
                      initial={{ width: "0%" }}
                      animate={{ width: progress >= 100 ? "100%" : progress <= 66 ? "0%" : `${((progress-66)/34)*100}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Action Items */}
          <div className="w-1/3 bg-gradient-to-br from-gray-50 to-gray-100 p-4 border-l border-gray-100">
            {missingDetails.length > 0 ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                    <FiAlertCircle className="mr-1.5 text-amber-500" />
                    <span>Complete Your Profile</span>
                  </h3>
                  <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    {missingDetails.length} items
                  </span>
                </div>
                
                <div className="mt-2 flex-1 overflow-y-auto max-h-28 pr-1 custom-scrollbar">
                  <ul className="space-y-1.5">
                    {missingDetails.map((message, index) => (
                      <li key={index} className="flex items-center text-xs text-gray-600 py-1 px-2 rounded-md hover:bg-white/60 transition-colors">
                        <CiCirclePlus className="w-3.5 h-3.5 mr-1.5 text-amber-500 flex-shrink-0" />
                        <span className="truncate">{message}</span>
                        <div className="ml-auto">
                          <FiChevronRight className="w-3 h-3 text-amber-400" />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button
                  onClick={handleAddMissingDetails}
                  className="mt-auto w-full flex justify-center items-center px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-md hover:from-amber-600 hover:to-amber-700 transition-colors shadow-sm"
                >
                  Complete Now <FiArrowRight className="ml-1.5" />
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center">
                <div className="p-2.5 bg-gradient-to-br from-green-400 to-green-500 rounded-full shadow-sm mb-3">
                  <CiCircleCheck className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-green-800">Profile Complete!</h4>
                <p className="text-xs text-green-600 mt-1 text-center">You're ready for the next steps</p>
                
                <div className="mt-3 w-24 h-1 rounded-full bg-gradient-to-r from-green-200 to-green-300"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout - Compact & Stylish */}
      <div className="md:hidden p-4 outline-none">
        <div className="bg-gradient-to-r from-teal-500 to-[#3E98C7] p-3 rounded-t-md flex items-center gap-3 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white/10 -mr-8 -mt-8"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 rounded-full bg-white/10 -ml-6 -mb-6"></div>
          
          {/* Profile Image with Progress Ring */}
          <div className="relative z-10">
            <svg className="w-14 h-14" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="transparent"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="transparent"
                stroke="white"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img
                  src={basicData?.profile_picture || "/images/profile.jpg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* User Info & Progress */}
          <div className="flex-1 text-white z-10">
            <h2 className="text-sm font-semibold truncate">
              {basicData?.user?.Fname || "User"} {basicData?.user?.Lname}
            </h2>
            <div className="flex items-center justify-between">
              <p className="text-xs text-blue-100 truncate max-w-[140px]">
                {basicData?.user?.email || "user@example.com"}
              </p>
              <span className="text-xs font-bold bg-white/20 rounded-full px-2 py-0.5">
                {progress}% Complete
              </span>
            </div>
          </div>
        </div>
        
        {/* Progress Tabs - Stylish Pills */}
        <div className="flex justify-between p-2 bg-gray-50 mb-2">
          <div className={`flex flex-col items-center ${progress >= 33 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full mb-0.5 flex items-center justify-center 
              ${progress >= 33 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {progress >= 33 ? <FiCheckCircle className="w-3 h-3" /> : <FiUser className="w-3 h-3" />}
            </div>
            <span className="text-[10px] font-medium">Profile</span>
          </div>
          
          <div className="w-[30%] h-[2px] bg-gray-200 mt-3 relative">
            <div className={`h-full ${progress >= 33 ? 'bg-green-500' : 'bg-gray-300'}`} 
              style={{ width: progress >= 33 ? '100%' : `${(progress/33)*100}%` }}></div>
          </div>
          
          <div className={`flex flex-col items-center ${progress >= 66 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full mb-0.5 flex items-center justify-center 
              ${progress >= 66 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {progress >= 66 ? <FiCheckCircle className="w-3 h-3" /> : <FiCalendar className="w-3 h-3" />}
            </div>
            <span className="text-[10px] font-medium">Exams</span>
          </div>
          
          <div className="w-[30%] h-[2px] bg-gray-200 mt-3 relative">
            <div className={`h-full ${progress >= 66 ? 'bg-green-500' : 'bg-gray-300'}`} 
              style={{ width: progress >= 66 ? '100%' : progress <= 33 ? '0%' : `${((progress-33)/33)*100}%` }}></div>
          </div>
          
          <div className={`flex flex-col items-center ${progress >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full mb-0.5 flex items-center justify-center 
              ${progress >= 100 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {progress >= 100 ? <FiCheckCircle className="w-3 h-3" /> : <FiList className="w-3 h-3" />}
            </div>
            <span className="text-[10px] font-medium">Hiring</span>
          </div>
        </div>
        
        {/* Action Section */}
        {missingDetails.length > 0 ? (
          <div className="p-3 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-amber-800 flex items-center">
                <FiAlertCircle className="mr-1 text-amber-500 w-3.5 h-3.5" />
                <span>Complete Your Profile</span>
              </h4>
              <button
                onClick={handleAddMissingDetails}
                className="text-xs px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-md hover:from-amber-600 hover:to-amber-700 transition-colors flex items-center shadow-sm"
              >
                Start <FiArrowRight className="ml-1 w-3 h-3" />
              </button>
            </div>
            
            <div className="mt-2 overflow-hidden">
              <div className="flex gap-1">
                {missingDetails.slice(0, 1).map((detail, index) => (
                  <div key={index} className="flex items-center gap-1 text-[10px] bg-white/50 text-amber-700 rounded-md px-2 py-1 border border-amber-200 flex-shrink-0">
                    <CiCirclePlus className="text-amber-500 flex-shrink-0 w-3 h-3" />
                    <span className="truncate max-w-[200px]">{detail}</span>
                  </div>
                ))}
                {missingDetails.length > 1 && (
                  <div className="text-[10px] text-amber-700 bg-white/50 rounded-md px-2 py-1 border border-amber-200 whitespace-nowrap">
                    +{missingDetails.length - 1} more
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 p-2 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
            <CiCircleCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-green-700">Ready for next steps!</span>
          </div>
        )}
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

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.03);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.15);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.25);
        }
      `}</style>
    </motion.div>
  );
};

export default TeacherDashboardCard;

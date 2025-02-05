import React, { useEffect, useRef, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { getBasic, getProfilCompletion } from "../../../features/personalProfileSlice";
import { Link } from "react-router-dom";

const TeacherDashboardCard = ({ teacher }) => {
  const { missingDetails } = teacher;

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getBasic()).catch((error) => console.error("Error:", error));
    dispatch(getProfilCompletion()).catch((error) => console.error("Error:", error));
  }, [dispatch]);

  const personalProfile = useSelector((state) => state?.personalProfile);
  const basicData = personalProfile?.basicData || {};

  const emptydetailsValue = useSelector(
    (state) => state.personalProfile?.completionData?.profile_completed || 0
  );

  const percentage = useSelector((state) => {
    const profileCompleted = state.personalProfile?.completionData?.profile_completed;
    return Array.isArray(profileCompleted) && profileCompleted.length > 0 ? profileCompleted[0] : 0
  });

  console.log("Empty Details Value", emptydetailsValue);
 

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate the progress ring on mount
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
    <div className="relative overflow-hidden flex flex-col md:flex-row items-center justify-between w-full bg-white px-4 md:px-6 py-3 md:py-4 rounded-lg border border-[#D6F7DE] transition-shadow duration-300 mt-2">
      <div className="absolute h-full w-[80%] md:w-[70%] bg-[#c7e4f794] left-0 top-0 z-0"></div>
      <div className="absolute md:h-96 h-full w-[45%] md:w-[35%] bg-[#a1d8f6] md:rounded-l-full right-0 z-0"></div>

      {/* Profile Section */}
      <div className="flex flex-col items-center mb-4 md:mb-0 z-10">
        <div className="relative w-20 h-20 md:w-28 md:h-28">
          <svg
            className="absolute inset-0 w-20 h-20 md:w-28 md:h-28 transform -rotate-90"
            viewBox="0 0 100 100"
          >
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
            className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover border-4 border-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-[2px]"
          />
        </div>
        <div className="text-[#2A6F97] font-semibold text-xs md:text-sm mt-1 md:mt-0 flex flex-col items-center">
          <div className="">
            <Link
              to="#"
              className="text-gray-600 cursor-pointer hover:text-gray-800"
              onClick={handleEditProfileClick}
            >
              Edit Profile
            </Link>
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => console.log("Selected file:", e.target.files[0])}
            />
          </div>
          <span>{progress}% Completed</span>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="flex-1 px-2 md:px-6 md:pl-10 text-center md:text-left z-10 mt-3 md:mt-0">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">
          Welcome to Your Teacher Dashboard!
        </h2>
        <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2">
          Dear Teacher, we’re excited to have you on board! 🎉 To get started:
        </p>
        <ul className="mt-1 md:mt-3 text-xs md:text-sm font-semibold text-gray-700 space-y-1">
          <li className="flex items-center justify-center md:justify-start">
            <span className="mr-1 md:mr-2">1️⃣</span> Complete Your Profile
          </li>
          <li className="flex items-center justify-center md:justify-start">
            <span className="mr-1 md:mr-2">2️⃣</span> Attempt the Online Exam
          </li>
          <li className="flex items-center justify-center md:justify-start">
            <span className="mr-1 md:mr-2">3️⃣</span> Unlock Teaching
            Opportunities
          </li>
        </ul>
      </div>

      {/* Missing Details Section */}
      <div className="w-full md:w-auto mt-4 md:mt-0 p-3 md:p-4 border border-gray-200 rounded-lg bg-gray-50 z-10 md:mr-5">
        <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
          Add Missing Details:
        </h3>
        <ul className="text-xs md:text-sm text-gray-600 space-y-1">
          {missingDetails.map((detail, index) => (
            <li key={index} className="flex items-center">
              <span className="mr-1 md:mr-2">
                <CiCirclePlus className="w-4 h-4 md:w-5 md:h-5" />
              </span>
              <span className="truncate">{detail}</span>
            </li>
          ))}
        </ul>
        <button className="mt-2 md:mt-3 w-full md:w-auto px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-white bg-[#3E98C7] rounded-md transition-colors duration-200">
          Add Missing Details
        </button>
      </div>
    </div>
  );
};

export default TeacherDashboardCard;

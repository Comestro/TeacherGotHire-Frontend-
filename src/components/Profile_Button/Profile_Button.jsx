import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProfileButton = () => {
   const profile = useSelector((state) => state.profile);
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const calculateCompletion = () => {
    const totalFields = 5 + profile.skills.length + profile.experience.length + profile.education.length;
    const filledFields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.address,
      profile.profileImage,
      ...profile.skills,
      ...profile.experience,
      ...profile.education,
    ].filter(Boolean).length;

    return Math.round((filledFields / totalFields) * 100);
  };

  // Sample data for marks and results
  const examResults = [
    { exam: "Math", marks: 85, result: "Pass" },
    { exam: "Science", marks: 90, result: "Pass" },
    { exam: "English", marks: 78, result: "Pass" },
    { exam: "History", marks: 65, result: "Pass" },
    { exam: "Geography", marks: 70, result: "Pass" },
  ];
  // I will get from Api

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative inline-block text-left">
      {/* Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center px-4 py-2 bg-teal-600 hover:bg-gray-200 rounded-2xl focus:outline-none"
      >
        <img
          src={profile.profileImage || "https://via.placeholder.com/150"} // I will get from API
          alt="Profile"
          className="w-8 h-8 rounded-full mr-2"
        />
        <span className="text-sm font-medium">My Profile</span>
      </button>

      {/* Pop-up */}
      <div
        className={`fixed top-0 right-0 h-full w-1/4 bg-gray-100 text-black shadow-lg transform transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Profile</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-red-500 hover:text-red-700"
          >
            Close
          </button>
        </div>

        {/* Profile Section */}
        <div className="p-4">
          <div className="flex items-center mb-4 gap-8">
          <div className="relative w-16 h-16 mr-4">
              {/* Completion Border */}
              <div
                className="absolute inset-0 w-full h-full rounded-full border-4 border-blue-500 z-0"
                style={{
                  clipPath: `circle(${calculateCompletion()}% at 50% 50%)`,
                }}
              ></div>
              {/* Profile Image */}
              <img
                src={profile.profileImage || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-gray-300 z-10"
              />
            </div>

          
            <div>
              <h3 className="text-lg font-semibold">{profile.name || 'your name'}</h3>
              <p className="text-sm text-gray-600">{profile.email || "youremail@gmail.com"}</p>
            </div>
          </div>

          {/* Exam Results Section */}
          <div>
            <h3 className="text-md font-semibold mb-2">Exam Results</h3>
            <ul className="space-y-2">
              {examResults.map((result, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span className="text-sm">{result.exam}</span>
                  <span className="text-sm">
                    Marks: {result.marks} ({result.result})
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* View Profile Button */}
          <div className="mt-6">
            <button
              className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700"
              onClick={() => navigate("/profile")}
            >
              View/Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileButton;


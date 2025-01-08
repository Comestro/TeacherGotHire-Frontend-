import React, { useState, useEffect } from "react";

const CircularLoader = () => {
  const [completion, setCompletion] = useState(0);

  // Simulate API call to fetch profile completion percentage
  useEffect(() => {
    const fetchData = async () => {
      // Simulate API delay
      setTimeout(() => {
        const profileCompletion = 78; // Replace this with actual API response
        setCompletion(profileCompletion);
      }, 1000);
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="relative">
        {/* Circle Background */}
        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
          <svg
            className="w-full h-full"
            viewBox="0 0 36 36"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="stroke-gray-300"
              strokeWidth="4"
              fill="none"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="stroke-blue-500 transition-all duration-500 ease-out"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${completion}, 100`}
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>

        {/* Percentage Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold text-gray-700">
            {completion}%
          </span>
        </div>
      </div>

      {/* Label */}
      <p className="text-sm text-gray-500 mt-4">Profile Completion</p>
    </div>
  );
};

export default CircularLoader;

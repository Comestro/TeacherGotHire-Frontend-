import React from "react";
import { IoMdSettings, IoIosNotifications, IoMdMenu } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { useSelector } from "react-redux";

const DashboardHeader = ({ isOpen, setIsOpen }) => {

  const profile = useSelector((state) => state.auth.userData || {});

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#3E98C7] text-white shadow-md -z-10 md:z-0">
      {/* Drawer Toggle Button */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-md bg-white bg-opacity-20 hover:bg-opacity-30 transition md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <IoMdMenu className="text-white text-xl" />
        </button>
        <h1 className="text-lg font-semibold hidden md:block">
          Teacher Dashboard
        </h1>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6">
        <button
          className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition"
          aria-label="Settings"
        >
          <IoMdSettings className="text-xl" />
        </button>
        <button
          className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition"
          aria-label="Notifications"
        >
          <IoIosNotifications className="text-xl" />
        </button>
        <div className="mr-2">
          <button
            className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 focus:outline-none transition border border-gray-200 px-3 py-1 rounded-full"
          >
            <FaUserCircle className="w-8 h-8 text-white" />
            <div className="hidden md:flex flex-col items-start ">
              <span className="font-medium text-white">{profile.Fname} {profile.Lname}</span>
              <span className="text-sm text-gray-200 -mt-1">
                {profile.email}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

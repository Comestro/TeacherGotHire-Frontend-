import React from "react";
import { IoMdSettings, IoIosNotifications, IoMdMenu } from "react-icons/io";
import Dropdown from "./DropDown";

const DashboardHeader = ({ isOpen, setIsOpen }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#3E98C7] text-white shadow-md">
      {/* Drawer Toggle Button */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-md bg-white bg-opacity-20 hover:bg-opacity-30 transition md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <IoMdMenu className="text-white text-xl" />
        </button>
        <h1 className="text-lg font-semibold hidden md:block">Teacher Dashboard</h1>
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
        <div>
          <Dropdown />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

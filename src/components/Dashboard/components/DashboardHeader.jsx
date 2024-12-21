import React, { useState, Suspense, lazy } from "react";
import { IoMdSettings, IoIosNotifications, IoMdMenu } from "react-icons/io";

const Dropdown = lazy(() => import("./Dropdown"));

const DashboardHeader = ({ isOpen, setIsOpen }) => {
  return (
    <div className="flex items-center justify-between md:justify-end px-4 md:px-2 bg-[#3E98C7] py-2 text-white">
      {/* Drawer Toggle Button */}
      <button
        className="bg-blue-400 p-1 rounded-md md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <IoMdMenu className="size-6 " />
      </button>
      <div className="flex items-center gap-7">
        <button>
          <IoMdSettings className="size-7" />
        </button>
        <Suspense fallback={<div>Loading...</div>}>
          <Dropdown />
        </Suspense>
      </div>
    </div>
  );
};

export default DashboardHeader;
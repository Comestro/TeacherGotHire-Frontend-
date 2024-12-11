import React from "react";
import { IoSearchOutline } from "react-icons/io5";
import { MdNotificationsNone } from "react-icons/md";

const ExamNavbar = () => {
  return (
    <header className="bg-teal-600 text-white flex items-center justify-end px-4 py-4 fixed w-full shadow-md">
      

      {/* Right Icons */}
      <div className="flex items-center space-x-4">
        <button className="text-white">
        <IoSearchOutline className="" />
        </button>
        <button className="text-white">
        <MdNotificationsNone className="" />
        </button>
        <div className="flex items-center">
          <span className="text-md font-bold">Sarita Kumari</span>
          <div className="ml-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
            {/* User Avatar */}
            <img src="user.jpg" className="w-10 h-4 rounded-full" alt="" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ExamNavbar;

import React, { useState } from "react";
import Sidebar from "./Dashboard/DashboardSidebar";
import { Outlet } from "react-router-dom";
import { IoMdSettings, IoIosNotifications, IoMdMenu } from "react-icons/io";
import { GoChevronDown } from "react-icons/go";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-gradient-to-b from-teal-100 to-gray-100">
      <div className="w-full max-w-screen-2xl mx-auto">
        <div className="flex bg-gradient-to-b from-teal-100 to-gray-100">
          {/* Sidebar Drawer */}
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

          {/* Right section */}
          <div className={`w-full ${isOpen ? "ml-0" : "md:ml-72"} transition-all`}>
            <div className="flex-1">
              {/* Teacher Dashboard Header */}
              <div className="flex items-center justify-between md:justify-end px-4 md:px-2 bg-[#21897e] py-2 text-white">
                {/* Drawer Toggle Button */}
                <button
                  className="bg-teal-600 p-1 rounded-md md:hidden"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <IoMdMenu className="size-7" />
                </button>
                <div className="flex items-center gap-7">
                  <button>
                    <IoMdSettings className="size-7" />
                  </button>
                  <button>
                    <IoIosNotifications className="size-7" />
                  </button>
                  <button className="py-1 font-semibold flex items-center gap-2">
                    <div className="w-10 h-10">
                      <img
                        src={"https://via.placeholder.com/200"}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover border-2 border-teal-600 shadow-md"
                      />
                    </div>
                    Rahul Kumar
                    <GoChevronDown className="-ml-1 mt-1" />
                  </button>
                </div>
              </div>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;

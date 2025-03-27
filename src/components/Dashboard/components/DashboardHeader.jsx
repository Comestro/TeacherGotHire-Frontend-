import React, { useState } from "react";
import { IoMdSettings, IoIosNotifications, IoMdMenu } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { motion } from "framer-motion";

const DashboardHeader = ({ isOpen, setIsOpen }) => {
  const profile = useSelector((state) => state.auth.userData || {});
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Mock notifications - in a real app, this would come from your state/API
  const notifications = [
    { id: 1, message: "Your exam has been scheduled", read: false, time: "2 hours ago" },
    { id: 2, message: "Profile completion reminder", read: true, time: "1 day ago" },
    { id: 3, message: "New teaching opportunity available", read: false, time: "3 days ago" },
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#3E98C7] to-[#2A6F97] text-white shadow-md -z-10 md:z-0">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition duration-200 md:hidden focus:outline-none focus:ring-2 focus:ring-white/50"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <IoMdMenu className="text-white text-xl" />
        </button>
        <h1 className="text-lg font-semibold hidden md:block">
          Teacher Dashboard
        </h1>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Home"
        >
          <IoMdHome className="text-xl" />
        </Link>
        
        {/* Notifications Button with Badge */}
        <div className="relative">
          <button
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <IoIosNotifications className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <motion.div 
              className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-medium text-blue-600">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition duration-150 ${!notification.read ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`rounded-full h-2 w-2 mt-1.5 flex-shrink-0 ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div>
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>No notifications</p>
                  </div>
                )}
              </div>
              
              <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View all notifications
                </button>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2">
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="font-medium text-white text-sm leading-tight">
              {profile.Fname} {profile.Lname}
            </span>
            <span className="text-xs text-blue-100 leading-tight">
              {profile.email}
            </span>
          </div>
          <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
            <FaUserCircle className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

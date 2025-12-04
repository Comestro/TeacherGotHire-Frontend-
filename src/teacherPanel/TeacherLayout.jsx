import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiViewGrid,
  HiUser,
  HiBriefcase,
  HiOutlineLogin,
  HiMenuAlt2,
  HiX,
  HiChevronDown,
  HiOutlineClipboard
} from 'react-icons/hi';
import { HiMiniEye } from "react-icons/hi2";
import { IoMdSettings } from "react-icons/io";
import { BsPerson } from "react-icons/bs";
import { getUserData } from '../features/authSlice';
import { handleLogout } from '../services/authUtils';

const SidebarItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === '/teacher' || to === '/teacher/'}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
        ? 'bg-teal-600 text-white'
        : 'text-slate-600 hover:bg-slate-50 hover:text-teal-600'
      }`
    }
  >
    <Icon className="text-xl" />
    <span className="font-medium">{label}</span>
  </NavLink>
);

const TeacherLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useSelector((state) => state.auth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast here
  };

  useEffect(() => {
    dispatch(getUserData());
  }, [dispatch]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Area */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">PTPI</h1>
            <p className="text-lg text-slate-500 font-medium">Teacher Profile</p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="px-4 py-4">
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
            <BsPerson size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-slate-800 truncate">
              {userData?.Fname || 'Teacher'}
            </h3>
            <p className="text-xs text-slate-500 truncate">
              {userData?.email || 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2 custom-scrollbar">
        <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        <SidebarItem to="/teacher" icon={HiViewGrid} label="Dashboard" />
        <SidebarItem to="/teacher/personal-profile" icon={HiUser} label="Personal Details" />
        <SidebarItem to="view-attempts" icon={HiMiniEye} label="View Attempts" />
        <SidebarItem to="job-apply" icon={HiBriefcase} label="Job Applications" />

        <div className="px-4 py-2 mt-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          System
        </div>
        <SidebarItem to="/teacher/setting" icon={IoMdSettings} label="Settings" />
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => handleLogout(dispatch, navigate)}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <HiOutlineLogin className="text-xl group-hover:scale-110 transition-transform" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-700">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 lg:pl-72 min-h-screen flex flex-col`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {isSidebarOpen ? <HiX size={24} /> : <HiMenuAlt2 size={24} />}
              </button>

              {/* Breadcrumb / Page Title Placeholder */}
              {/* You can add dynamic breadcrumbs here if needed */}
              <h2 className="font-semibold text-slate-800 flex">
                <span className='hidden sm:block'>Welcome back, </span> <span className='block sm:hidden'>Hi, </span>{" "}{userData?.Fname?.split(' ')[0] || 'Teacher'}!
              </h2>
            </div>

            <div className="flex items-center gap-4" ref={profileRef}>
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="h-9 w-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm border border-teal-200 shadow-sm">
                    {userData?.Fname?.[0] || 'T'}
                  </div>
                  <HiChevronDown className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50"
                    >
                      {/* Dropdown Header */}
                      <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-12 w-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                            {userData?.Fname?.[0] || 'T'}
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="font-bold text-slate-800 truncate">
                              {userData?.Fname || 'Teacher'}
                            </h3>
                            <p className="text-xs text-slate-500 truncate">
                              {userData?.email || 'Loading...'}
                            </p>
                          </div>
                        </div>
                        {userData?.user_code && (
                          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                            <div className="text-xs">
                              <span className="text-slate-400 font-medium mr-2">ID:</span>
                              <span className="font-mono font-semibold text-slate-700">{userData.user_code}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(userData.user_code)}
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                              title="Copy ID"
                            >
                              <HiOutlineClipboard size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Dropdown Actions */}
                      <div className="p-2">
                        <button
                          onClick={() => {
                            navigate('/teacher/personal-profile');
                            setIsProfileOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 hover:text-teal-600 transition-colors"
                        >
                          <HiUser className="text-lg" />
                          My Profile
                        </button>
                        <button
                          onClick={() => {
                            navigate('/teacher/setting');
                            setIsProfileOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 hover:text-teal-600 transition-colors"
                        >
                          <IoMdSettings className="text-lg" />
                          Settings
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          onClick={() => handleLogout(dispatch, navigate)}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        >
                          <HiOutlineLogin className="text-lg" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 max-w-8xl mx-auto w-full px-4 sm:px-6 pt-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;

import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiViewGrid,
  HiUser,
  HiBriefcase,
  HiOutlineLogin,
  HiMenuAlt2,
  HiX
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
            <p className="text-xs text-slate-500 font-medium">Teacher Panel</p>
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
        <SidebarItem to="/teacher/job-profile" icon={HiBriefcase} label="Job Details" />
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
              <h2 className="font-semibold text-slate-800 hidden sm:block">
                Welcome back, {userData?.Fname?.split(' ')[0] || 'Teacher'}!
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {userData?.user_code && (
                <span className="hidden md:inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200">
                  ID: {userData.user_code}
                </span>
              )}
              {/* Add notifications or other header items here if needed */}
              <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm border border-teal-200">
                {userData?.Fname?.[0] || 'T'}
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

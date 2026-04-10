import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiBriefcase,
  FiUser,
  FiSettings,
  FiLogOut,
  FiUserPlus,
  FiChevronDown,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { userLogout, getUserData } from "../../features/authSlice";
import { FaUserCircle, FaChalkboardTeacher } from "react-icons/fa";
import { HiMenuAlt2 } from "react-icons/hi";

const UniversalHeader = ({ onToggleSidebar, isSidebarPresent = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profile = useSelector((state) => state.auth.userData || {});
  const navRef = useRef(null);

  const role = profile.role;
  const hiddenPaths = ["/signin", "/signup/teacher", "/signup/recruiter"];
  const shouldHideButtons = hiddenPaths.includes(location.pathname);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && !profile.email) {
      dispatch(getUserData());
    }

    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsProfileOpen(false);
        setIsRegisterOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch, profile.email]);

  const handleLogout = () => {
    dispatch(userLogout());
    setIsProfileOpen(false);
    navigate("/");
  };

  const dashboardPath = role === "teacher" ? "/teacher" : role === "recruiter" ? "/recruiter" : "/admin/dashboard";

  return (
    <header 
      ref={navRef}
      className="sticky top-0 z-50 w-full bg-white border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Left Section: Logo & Mobile Toggle */}
          <div className="flex items-center gap-2">
            {isSidebarPresent && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Toggle Sidebar"
              >
                <HiMenuAlt2 size={24} />
              </button>
            )}
            
            <Link to="/" className="flex items-center gap-1.5 text-lg sm:text-xl font-bold text-slate-800">
              <span className="text-teal-600">PTP</span> 
              <span className="hidden sm:inline">INSTITUTE</span>
              <span className="sm:hidden text-slate-400 font-medium">I</span>
            </Link>
          </div>

          {/* Center/Right Section: Universal Actions */}
          <div className="flex items-center gap-1.5 sm:gap-4">
            
            {/* Search Teacher Button (Universal) */}
            {!shouldHideButtons && (
              <Link
                to="/get-preferred-teacher"
                className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-4 sm:py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-colors"
                title="शिक्षक खोजें"
              >
                <FiBriefcase className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-2 text-sm font-bold">शिक्षक खोजें</span>
              </Link>
            )}

            {/* User Logic */}
            {profile.email ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 border border-teal-200">
                    <FiUser size={16} />
                  </div>
                  <div className="hidden md:flex flex-col items-start pr-2">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {profile.Fname}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">
                      {role || 'User'}
                    </span>
                  </div>
                  <FiChevronDown className={`w-4 h-4 text-slate-400 mr-1 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-bold uppercase mb-1">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{profile.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to={dashboardPath}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiUser className="text-lg" />
                        Go to Dashboard
                      </Link>
                      {role === "teacher" && (
                        <Link
                          to="/teacher/setting"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FiSettings className="text-lg" />
                          Settings
                        </Link>
                      )}
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut className="text-lg" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              !shouldHideButtons && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    to="/signin"
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-teal-600 border border-teal-200 rounded-xl hover:bg-teal-50 bg-white"
                  >
                    <HiMenuAlt2 className="sm:hidden" />
                    <span className="hidden sm:inline">Login</span>
                    <span className="sm:hidden">Login</span>
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setIsRegisterOpen(!isRegisterOpen)}
                      className="flex items-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 shadow-sm"
                    >
                      <span>Join</span>
                      <FiChevronDown className={isRegisterOpen ? 'rotate-180' : ''} />
                    </button>
                    {isRegisterOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                        <Link
                          to="/signup/teacher"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                          onClick={() => setIsRegisterOpen(false)}
                        >
                          <FiUser className="text-teal-600" /> As Teacher
                        </Link>
                        <Link
                          to="/signup/recruiter"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                          onClick={() => setIsRegisterOpen(false)}
                        >
                          <FiBriefcase className="text-teal-600" /> As Recruiter
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {/* Mobile Menu Toggle (Only if Sidebar NOT present) */}
            {!isSidebarPresent && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu (Overlay) - Only if Sidebar NOT present */}
      {isMobileMenuOpen && !isSidebarPresent && (
        <div className="lg:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-xl">
           <Link
                to="/get-preferred-teacher"
                className="flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-3 rounded-xl font-bold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiBriefcase /> शिक्षक खोजें
            </Link>
            {!profile.email && (
              <div className="grid grid-cols-2 gap-3">
                 <Link
                    to="/signin"
                    className="flex justify-center py-3 text-sm font-bold text-teal-600 border border-teal-200 rounded-xl"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup/teacher"
                    className="flex justify-center py-3 text-sm font-bold text-white bg-teal-600 rounded-xl"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Join Now
                  </Link>
              </div>
            )}
        </div>
      )}
    </header>
  );
};

export default UniversalHeader;

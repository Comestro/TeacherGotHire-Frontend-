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
  FiGrid,
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
      className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 h-14 sm:h-16"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between h-full items-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isSidebarPresent && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-1.5 text-slate-800 hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors"
                aria-label="Toggle Sidebar"
              >
                <HiMenuAlt2 size={20} />
              </button>
            )}
            
            <Link to="/" className="flex items-center gap-1 font-black text-slate-900 tracking-tighter sm:text-lg">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-slate-900 text-white flex items-center justify-center rounded text-xs sm:text-sm">P</div>
              <span className="flex flex-col leading-none">
                 <span className="text-teal-600">PTP</span>
                 <span className="text-[7px] sm:text-[9px] text-slate-400 font-black tracking-[0.2em] uppercase">Institute</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            
            {/* शिक्षक खोजें Button */}
            {!shouldHideButtons && (
              <Link
                to="/get-preferred-teacher"
                className="flex items-center justify-center h-8 sm:h-10 px-2 sm:px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg border border-teal-700/10 transition-colors"
              >
                <FiBriefcase className="w-4 h-4" />
                <span className="hidden md:inline ml-2 text-[10px] sm:text-xs font-black uppercase tracking-widest">शिक्षक खोजें</span>
              </Link>
            )}

            {/* Auth/User Logic */}
            {profile.email ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1 sm:gap-2 p-1 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                    <FiUser size={14} />
                  </div>
                  <FiChevronDown size={12} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-3 bg-slate-50 border-b border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Identity</p>
                      <p className="text-[10px] font-black text-slate-800 truncate uppercase mt-0.5">{profile.email}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => { navigate(dashboardPath); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-teal-600"
                      >
                        <FiGrid size={12} /> Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50"
                      >
                        <FiLogOut size={12} /> Terminate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              !shouldHideButtons && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    to="/signin"
                    className="flex items-center px-2.5 sm:px-4 h-8 sm:h-10 text-[10px] sm:text-xs font-black uppercase tracking-widest text-teal-600 border border-teal-100 rounded-lg hover:bg-teal-50"
                  >
                    Login
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setIsRegisterOpen(!isRegisterOpen)}
                      className="flex items-center gap-1 px-2.5 sm:px-4 h-8 sm:h-10 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white bg-slate-900 rounded-lg hover:bg-teal-600 transition-colors"
                    >
                      Join
                      <FiChevronDown size={10} />
                    </button>
                    {isRegisterOpen && (
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <Link
                          to="/signup/teacher"
                          className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-teal-600"
                          onClick={() => setIsRegisterOpen(false)}
                        >
                          <FiUser size={12} /> As Teacher
                        </Link>
                        <Link
                          to="/signup/recruiter"
                          className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-teal-600"
                          onClick={() => setIsRegisterOpen(false)}
                        >
                          <FiBriefcase size={12} /> As Recruiter
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {!isSidebarPresent && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 text-slate-800 border border-slate-100 rounded-lg hover:bg-slate-50"
              >
                {isMobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Actions Drawer */}
      {isMobileMenuOpen && !isSidebarPresent && (
        <div className="lg:hidden bg-white border-t border-slate-100 p-2 space-y-1 shadow-sm">
           <Link
                to="/get-preferred-teacher"
                className="flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiBriefcase size={12} /> शिक्षक खोजें
            </Link>
            {!profile.email && (
              <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    to="/signup/teacher"
                    className="flex justify-center py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Teacher Join
                  </Link>
                  <Link
                    to="/signup/recruiter"
                    className="flex justify-center py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-slate-800 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Recruiter Join
                  </Link>
              </div>
            )}
        </div>
      )}
    </header>
  );
};

export default UniversalHeader;

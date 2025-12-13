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
import { userLogout } from "../../features/authSlice";
import { TeacherEnquiry } from "../enquiry/TeacherEnquiry";
import { FaSignInAlt } from "react-icons/fa";

const Navbar = ({ links }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const profile = useSelector((state) => state.auth.userData || {});


  const role = profile.role;

  const [showEnquiry, setShowEnquiry] = useState(false);
  const navRef = useRef(null);

  const handleTeacherSearch = () => {
    navigate('/get-preferred-teacher');
    setShowEnquiry(false); // Close enquiry if open
    setIsMobileOpen(false); // Close mobile menu if open
  };

  const hiddenPaths = ["/signin", "/signup/teacher"];
  const shouldHide = hiddenPaths.includes(location.pathname);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsMobileOpen(false);
        setIsProfileOpen(false);
        setIsRegisterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(userLogout());
    setIsProfileOpen(false);
  };

  const UserDropdown = ({ isMobile = false }) => (
    <div
      className={`${isMobile ? "w-full" : "absolute right-0 mt-3 w-48"
        } bg-white z-50 rounded-xl border border-slate-100 ${!isMobile && "shadow-sm"}`}
    >
      <Link
        to={role === "teacher" ? "/teacher" : "/recruiter"}
        className="flex items-center px-4 py-3 hover:bg-slate-50 text-slate-700 transition-colors rounded-t-xl"
        onClick={() => setIsProfileOpen(false)}
      >
        <FiUser className="mr-3" /> Dashboard
      </Link>
      {role === "teacher" && (
        <Link
          to="/teacher/setting"

          className="flex items-center px-4 py-3 hover:bg-slate-50 text-slate-700 transition-colors"
          onClick={() => setIsProfileOpen(false)}
        >
          <FiSettings className="mr-3" /> Settings
        </Link>
      )}
      <button
        onClick={handleLogout}
        className="w-full flex items-center px-4 py-3 hover:bg-slate-50 text-slate-700 transition-colors rounded-b-xl"
      >
        <FiLogOut className="mr-3" /> Logout
      </button>
    </div>
  );

  const RegisterDropdown = ({ isMobile = false }) => (
    <div
      className={`${isMobile ? "w-full pl-4 mt-2" : "absolute right-0 mt-3 w-56"
        } bg-white z-50 rounded-xl border border-slate-100 ${!isMobile && "shadow-sm"}`}
    >
      <Link
        to="/signup/teacher"
        className="flex items-center px-4 py-3 hover:bg-slate-50 text-slate-700 transition-colors rounded-t-xl"
        onClick={() => { setIsRegisterOpen(false); setIsMobileOpen(false); }}
      >
        <FiUserPlus className="mr-3 text-teal-600" /> As Teacher
      </Link>
      <Link
        to="/signup/recruiter"
        className="flex items-center px-4 py-3 hover:bg-slate-50 text-slate-700 transition-colors rounded-b-xl"
        onClick={() => { setIsRegisterOpen(false); setIsMobileOpen(false); }}
      >
        <FiBriefcase className="mr-3 text-teal-600" /> As Recruiter
      </Link>
    </div>
  );

  return (
    <nav ref={navRef} className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left Section */}
          <div className="flex items-center">
            <button
              className="md:hidden p-2 text-slate-600 hover:text-teal-600 transition-colors"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <Link to="/" className="text-xl font-bold text-slate-800">
              PTP <span className="text-teal-600">INSTITUTE</span>
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={handleTeacherSearch}
              className="group relative overflow-hidden bg-gradient-to-r from-teal-500 via-teal-600 to-teal-500 bg-[length:200%_auto] transition-all 
                duration-500 hover:bg-right-bottom px-3 py-2 rounded-xl font-semibold text-white
                hover:-translate-y-0.5 transform"
            >
              {/* Content */}
              <span className="relative flex items-center justify-center gap-2">
                <FiBriefcase className="w-4 h-4 transition-transform group-hover:rotate-12" />
                <span className="bg-gradient-to-r from-white/90 to-white bg-clip-text text-transparent relative animate-pulse">
                  शिक्षक खोजें
                </span>
              </span>

              {/* Shine effect */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 translate-x-full animate-[shine_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </div>

              {/* Hover border animation */}
              <div className="absolute inset-0 rounded-xl border-2 border-white/30 transition-all duration-500 group-hover:border-white/50 group-hover:scale-[0.98]"></div>

              {/* Glow effect */}
              <div className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-teal-500/20 blur group-hover:animate-pulse -z-10"></div>

              {/* Ripple effect on hover */}
              <div className="absolute inset-0 rounded-xl group-hover:animate-[ripple_1s_ease-in-out_infinite] bg-gradient-to-r from-teal-400/0 via-teal-400/30 to-teal-400/0 opacity-0 group-hover:opacity-100"></div>
            </button>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-3">
            {!shouldHide && (
              <button
                onClick={handleTeacherSearch}

                className="group relative overflow-hidden bg-gradient-to-r from-teal-500 via-teal-600 to-teal-500 bg-[length:200%_auto] transition-all 
                duration-500 hover:bg-right-bottom px-6 py-3 rounded-xl font-semibold text-white
                hover:-translate-y-0.5 transform"
              >
                {/* Content */}
                <span className="relative flex items-center justify-center gap-2">
                  <FiBriefcase className="w-5 h-5 transition-transform group-hover:rotate-12" />
                  <span className="bg-gradient-to-r from-white/90 to-white bg-clip-text text-transparent relative animate-pulse">
                    शिक्षक खोजें
                  </span>
                </span>

                {/* Shine effect */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 translate-x-full animate-[shine_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>

                {/* Hover border animation */}
                <div className="absolute inset-0 rounded-xl border-2 border-white/30 transition-all duration-500 group-hover:border-white/50 group-hover:scale-[0.98]"></div>

                {/* Glow effect */}
                <div className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-teal-500/20 blur group-hover:animate-pulse -z-10"></div>

                {/* Ripple effect on hover */}
                <div className="absolute inset-0 rounded-xl group-hover:animate-[ripple_1s_ease-in-out_infinite] bg-gradient-to-r from-teal-400/0 via-teal-400/30 to-teal-400/0 opacity-0 group-hover:opacity-100"></div>
              </button>
            )}

            {profile.email ? (
              <div className="relative ml-4 z-10">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors bg-slate-50 hover:bg-slate-100"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center shadow-sm transition-all hover:bg-slate-200">
                    <FiUser className="text-slate-600 text-sm" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-teal-700">
                      {profile.Fname} {profile.Lname}
                    </span>
                    <p className="text-xs text-slate-500">{profile.email}</p>
                  </div>
                </button>
                {isProfileOpen && <UserDropdown />}
              </div>
            ) : (
              !shouldHide && (
                <div className="flex gap-2">
                  <Link
                    to="/signin"
                    className="flex items-center gap-2 px-5 py-2.5 font-medium text-teal-600 transition-all duration-300 border border-teal-200 rounded-xl hover:bg-teal-50 hover:border-teal-300"
                  >
                    <FiUser className="w-5 h-5" />
                    <span>Login</span>
                  </Link>

                  <div className="relative">
                    <button
                      onClick={() => setIsRegisterOpen(!isRegisterOpen)}
                      className="flex items-center gap-2 px-5 py-2.5 font-medium text-white transition-all duration-300 bg-teal-600 rounded-xl hover:bg-teal-700"
                    >
                      <FiUserPlus className="w-5 h-5" />
                      <span>Register</span>
                      <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${isRegisterOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isRegisterOpen && <RegisterDropdown />}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-800">
              PTP <span className="text-teal-600">INSTITUTE</span>
            </span>
            <button
              className="p-2 text-slate-600 hover:text-teal-600"
              onClick={() => setIsMobileOpen(false)}
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {profile.email ? (
            <>
              <div className="pt-4 ">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                    <FiUser className="text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {profile.Fname} {profile.Lname}
                    </p>
                    <p className="text-sm text-slate-600">{profile.email}</p>
                  </div>
                </div>
                <UserDropdown isMobile={true} />
              </div>
            </>
          ) : (
            !shouldHide && (
              <div className="space-y-3">
                <Link
                  to="/signin"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2 w-full px-4 py-3 font-medium text-teal-600 transition-all duration-300 border border-teal-200 rounded-xl hover:bg-teal-50 justify-center"
                >
                  <FiUser className="w-5 h-5" />
                  <span>Login</span>
                </Link>

                <div className="space-y-2">
                  <button
                    onClick={() => setIsRegisterOpen(!isRegisterOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 font-medium text-slate-700 transition-all duration-300 bg-slate-50 rounded-xl hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <FiUserPlus className="w-5 h-5 text-teal-600" />
                      <span>Register</span>
                    </div>
                    <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${isRegisterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isRegisterOpen && (
                    <div className="pl-4 space-y-2 border-l-2 border-slate-100 ml-4">
                      <Link
                        to="/signup/teacher"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-slate-600 hover:text-teal-600 transition-colors"
                      >
                        <span>As Teacher</span>
                      </Link>
                      <Link
                        to="/signup/recruiter"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-slate-600 hover:text-teal-600 transition-colors"
                      >
                        <span>As Recruiter</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <TeacherEnquiry showModal={showEnquiry} setShowModal={setShowEnquiry} />
      <style>{`
        @keyframes shine {
          from {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          to {
            transform: translateX(100%);
          }
        }

        @keyframes ripple {
          from {
            transform: scale(1);
            opacity: 1;
          }
          to {
            transform: scale(1.05);
            opacity: 0;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

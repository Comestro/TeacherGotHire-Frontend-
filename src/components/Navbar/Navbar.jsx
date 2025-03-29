import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiBriefcase,
  FiUser,
  FiSettings,
  FiLogOut,
  FiUserPlus,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { userLogout } from "../../features/authSlice";
import { TeacherEnquiry } from "../enquiry/TeacherEnquiry";
import { FaSignInAlt } from "react-icons/fa";

const Navbar = ({ links }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profile = useSelector((state) => state.auth.userData || {});

  console.log("Profile menu: ", profile);
  const role = profile.role;
  console.log("Role: ", role);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const navRef = useRef(null);

  const hiddenPaths = ["/signin", "/signup/teacher"];
  const shouldHide = hiddenPaths.includes(location.pathname);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsMobileOpen(false);
        setIsProfileOpen(false);
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
      className={`${
        isMobile ? "w-full" : "absolute right-0 mt-3 w-48"
      } bg-white z-50`}
    >
      <Link
        to={role === "teacher" ? "/teacher" : "/recruiter"}
        className="flex items-center px-2 py-3 hover:bg-gray-50"
        onClick={() => setIsProfileOpen(false)}
      >
        <FiUser className="mr-2" /> Dashboard
      </Link>
      {role === "teacher" && (
        <Link
          to="/teacher/setting"
          
          className="flex items-center px-2 py-3 hover:bg-gray-50"
          onClick={() => setIsProfileOpen(false)}
        >
          <FiSettings className="mr-2" /> Settings
        </Link>
      )}
      <button
        onClick={handleLogout}
        className="w-full flex items-center px-2 py-3 hover:bg-gray-50 rounded-b-lg"
      >
        <FiLogOut className="mr-2" /> Logout
      </button>
    </div>
  );

  return (
    <nav ref={navRef} className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left Section */}
          <div className="flex items-center">
            <button
              className="md:hidden p-2 text-gray-600 hover:text-teal-600 transition-colors"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <Link to="/" className="text-xl font-bold text-gray-800">
              PTP <span className="text-teal-600">INSTITUTE</span>
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setShowEnquiry(true)}
              className="group relative overflow-hidden bg-gradient-to-r from-teal-500 via-teal-600 to-teal-500 bg-[length:200%_auto] transition-all 
                duration-500 hover:bg-right-bottom hover:shadow-2xl px-3 py-2 rounded-xl font-semibold text-white
                hover:-translate-y-0.5 transform shadow-lg hover:shadow-teal-500/30"
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
                onClick={() => setShowEnquiry(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-teal-500 via-teal-600 to-teal-500 bg-[length:200%_auto] transition-all 
                duration-500 hover:bg-right-bottom hover:shadow-2xl px-6 py-3 rounded-xl font-semibold text-white
                hover:-translate-y-0.5 transform shadow-lg hover:shadow-teal-500/30"
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
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors bg-gray-50 hover:bg-gray-100"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center shadow-sm transition-all hover:bg-gray-200">
                    <FiUser className="text-gray-600 text-sm" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-teal-700">
                      {profile.Fname} {profile.Lname}
                    </span>
                    <p className="text-xs text-gray-500">{profile.email}</p>
                  </div>
                </button>
                {isProfileOpen && <UserDropdown />}
              </div>
            ) : (
              !shouldHide && (
                <div className="flex gap-2">
                  <Link
                    to="/signin"
                    className="flex items-center gap-2 px-3 py-2.5 font-medium text-teal-600 transition-all duration-300 border-2 border-teal-500 rounded-lg hover:bg-purple-50 hover:shadow-md"
                  >
                    <FiUser className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup/teacher"
                    className="flex items-center gap-2 px-3 py-2.5 font-medium text-teal-600 transition-all duration-300 border-2 border-teal-500 rounded-lg hover:bg-purple-50 hover:shadow-md"
                  >
                    <FiUserPlus className="w-5 h-5" />
                    <span>Register as a Teacher</span>
                  </Link>
                  <Link
                    to="/signup/recruiter"
                    className="flex items-center gap-2 px-3 py-2.5 font-medium text-teal-600 transition-all duration-300 border-2 border-teal-500 rounded-lg hover:bg-blue-50 hover:shadow-md"
                  >
                    <FiUserPlus className="w-5 h-5" />
                    <span>Recruiter Sign Up</span>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-800">
              PTP <span className="text-teal-600">INSTITUTE</span>
            </span>
            <button
              className="p-2 text-gray-600 hover:text-teal-600"
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
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <FiUser className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {profile.Fname} {profile.Lname}
                    </p>
                    <p className="text-sm text-gray-600">{profile.email}</p>
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
                  className="flex items-center gap-2 w-full px-4 py-2.5 font-medium text-teal-600 transition-all duration-300 border-2 border-teal-500 rounded-lg hover:bg-purple-50 hover:shadow-md justify-center"
                >
                  <FiUser className="w-5 h-5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup/teacher"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 font-medium text-teal-600 transition-all duration-300 border-2 border-teal-500 rounded-lg hover:bg-purple-50 hover:shadow-md justify-center"
                >
                  <FiUserPlus className="w-5 h-5" />
                  <span>Register as a Teacher</span>
                </Link>
                <Link
                  to="/signup/recruiter"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 font-medium text-teal-600 transition-all duration-300 border-2 border-teal-500 rounded-lg hover:bg-blue-50 hover:shadow-md justify-center"
                >
                  <FiUserPlus className="w-5 h-5" />
                  <span>Recruiter Sign Up</span>
                </Link>
              </div>
            )
          )}
        </div>
      </div>

      <TeacherEnquiry showModal={showEnquiry} setShowModal={setShowEnquiry} />
      <style jsx>{`
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

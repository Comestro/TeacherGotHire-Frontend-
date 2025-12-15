import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { handleLogout } from "../../../services/authUtils";
import { getUserData } from "../../../features/authSlice";
import { FiAlignLeft } from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";
import {
  getClassCategory,
  getTeacherjobType,
} from "../../../features/jobProfileSlice";
const TeacherRecruiterHeader = ({ isOpen, setIsOpen }) => {
  const { classCategories, teacherjobRole } = useSelector(
    (state) => state.jobProfile
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector((state) => state.auth.userData || {});
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    dispatch(getUserData());
    dispatch(getClassCategory());
    dispatch(getTeacherjobType());
  }, [dispatch]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Mobile Menu Button and Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              className="md:hidden text-text hover:text-primary focus:outline-none p-2 hover:bg-background rounded-lg transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle sidebar"
            >
              <FiAlignLeft size={22} />
            </button>

            {/* Logo - Visible on all screens */}

            <Link
              to="/recruiter"
              className="flex items-center gap-2 text-lg sm:text-xl font-bold text-primary hover:text-accent transition-colors"
            >
              <FaChalkboardTeacher className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="xs:inline sm:inline">PTPI</span>
            </Link>
          </div>

          {/* Right Section: Request Button and Profile */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Post Job Requirement Button - Visible on all screens */}
            <Link
              to="/get-preferred-teacher"
              className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-md shadow-teal-500/20 transition-all hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5"
            >
              <FaChalkboardTeacher className="w-4 h-4" />
              <span className="hidden sm:inline">शिक्षक खोजें</span>
              <span className="sm:hidden">शिक्षक खोजें</span>
            </Link>

            {/* Profile Dropdown or Login Button */}
            {profile && profile.id ? (
              <div className="relative" ref={menuRef}>
                <button
                  className="flex items-center gap-3 text-text hover:text-primary focus:outline-none transition-colors p-2 hover:bg-background rounded-lg"
                  onClick={toggleProfileMenu}
                  aria-label="Profile menu"
                >
                  <div className="flex items-center gap-2">
                    <FaUserCircle className="w-8 h-8 text-primary" />
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-semibold text-text leading-tight">
                        {profile?.Fname} {profile?.Lname}
                      </span>
                      <span className="text-xs text-secondary leading-tight">
                        Recruiter
                      </span>
                    </div>
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-14 w-64 bg-white border border-gray-200 rounded-lg overflow-hidden animate-fade-in shadow-lg">
                    {/* Profile Info */}
                    <div className="px-4 py-3 bg-background border-b border-gray-200">
                      <p className="text-xs text-secondary uppercase font-semibold mb-1">
                        Account Details
                      </p>
                      <p className="text-sm font-semibold text-text">
                        {profile?.Fname} {profile?.Lname}
                      </p>
                      <p className="text-xs text-secondary truncate mt-0.5">
                        {profile?.email}
                      </p>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-secondary">Recruiter Code</p>
                        <p className="text-sm font-medium text-primary">
                          {profile?.user_code}
                        </p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => handleLogout(dispatch, navigate)}
                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-text hover:bg-background hover:text-primary transition-colors font-medium"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/signin"
                  className="text-sm font-medium text-text hover:text-primary px-3 py-2 transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TeacherRecruiterHeader;

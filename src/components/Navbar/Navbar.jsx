import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoMdClose, IoMdMenu } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import { logout } from "../../services/authServices";
import { FiSearch } from "react-icons/fi";
import { userLogout } from "../../features/authSlice";

const Navbar = ({ links }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profile = useSelector((state) => state.auth.userData || {});

  const hideLinksPaths = ["/signin", "/signup/teacher"];
  const shouldHideLinks = hideLinksPaths.includes(location.pathname);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(userLogout())
      .unwrap()
      .then(() => {
        console.log("Logout successful!");
      })
      .catch((error) => {
        console.error("Logout failed:", error);
      });
    setIsDropdownOpen(false);
  };

  return (
    <nav className="flex items-center justify-between shadow py-2 px-6 md:px-10 bg-white">
      {/* Logo */}
      <button
        className="block md:hidden text-2xl focus:outline-none mr-2"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? (
          <IoMdClose className="size-6 text-gray-700" />
        ) : (
          <IoMdMenu className="size-6 text-gray-700" />
        )}
      </button>
      <h1 className="text-2xl md:text-2xl font-bold text-gray-800 w-full">
        PTP INSTITUTE
      </h1>

      {/* Mobile Menu Button */}
      {profile.email && (
        <div className="relative md:hidden" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 px-3 py-1 rounded-full"
          >
            <FaUserCircle className="w-7 h-7 md:w-8 md:h-8" />
            <div className="hidden md:flex flex-col items-start">
              <span>
                {profile.Fname} {profile.Lname}
              </span>
              <span className="text-xs text-gray-500 -mt-1">
                {profile.email}
              </span>
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <Link
                to="/teacher"
                className="block px-4 py-3 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-3 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-b-lg"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <div
        className={`absolute top-16 left-0 w-full h-screen md:h-auto bg-white/90 md:bg-transparent md:static md:flex md:items-center md:gap-6 ${
          isMenuOpen ? "block" : "hidden"
        } md:block transition-all`}
      >
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-end gap-4 md:gap-2 w-full py-4 md:py-0">
          {/* Find Tutor Link (Always visible except on auth pages) */}
          {!shouldHideLinks && (
           
            <Link
              to="/signup/recruiter"
              onClick={() => setIsMenuOpen(false)}
              className="group relative flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold hover:from-teal-400 hover:to-teal-300 transition-all duration-300 hover:shadow-lg hover:shadow-teal-100/50 active:scale-95"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 to-teal-300 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              <FiSearch className="mr-2 text-teal-100 text-lg transition-transform duration-300 group-hover:text-white group-hover:scale-110" />
              Hire Teacher
              <span className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-teal-200/50 transition-all duration-300"></span>
            </Link>
          )}

          {/* Conditional Auth Links / User Dropdown */}
          {profile?.email ? (
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 px-3 py-1 rounded-full"
              >
                <FaUserCircle className="w-7 h-7 md:w-8 md:h-8" />
                <div className="hidden md:flex flex-col items-start">
                  <span>
                    {profile.Fname} {profile.Lname}
                  </span>
                  <span className="text-xs text-gray-500 -mt-1">
                    {profile.email}
                  </span>
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <Link
                    to="/teacher"
                    className="block px-4 py-3 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-3 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-b-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            !shouldHideLinks && (
              <Link
                to="/signin"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-100 hover:shadow-md font-medium text-gray-600"
              >
                Login/Signup
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

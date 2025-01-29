import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const TeacherRecruiterHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <header className="bg-white shadow fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-teal-500">
          Teacher Recruiter
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link
            to="/"
            className="text-gray-700 hover:text-teal-500 font-medium"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-gray-700 hover:text-teal-500 font-medium"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className="text-gray-700 hover:text-teal-500 font-medium"
          >
            Contact
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
          <input
            type="text"
            placeholder="Search jobs, schools..."
            className="bg-gray-100 focus:outline-none w-60"
          />
          <button className="text-teal-500 hover:text-teal-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M16.5 10.5a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
          </button>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center space-x-4">
            <button
              className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 focus:outline-none transition border border-gray-200 px-3 py-1 rounded-full"
              onClick={toggleProfileMenu}
            >
              <FaUserCircle className="w-8 h-8 text-teal-600" />
              <div className="hidden md:flex flex-col items-start ">
                <span className="font-medium">Rahul Kumar</span>
                <span className="text-sm text-gray-500 -mt-1">
                  rahulkumar@gmail.com
                </span>
              </div>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-14 w-56 bg-white border border-gray-200 shadow-lg rounded-md py-2 animate-fade-in">
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-gray-700 hover:bg-teal-100 hover:text-teal-600 transition"
                >
                  Settings
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-teal-100 hover:text-teal-600 transition"
                >
                  Profile
                </Link>
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-teal-100 hover:text-teal-600 transition">
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-teal-500 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TeacherRecruiterHeader;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const CenterHeader = ({name = "Exam Center Dashboard"}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm fixed w-full z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="#"
          className="text-2xl text-teal-600 transition pl-4"
        >
          {name}
        </Link>

        {/* for laptop */}
        <nav className="hidden md:flex space-x-8">
          <Link
            to="/"
            className="text-gray-700 hover:text-teal-600 font-medium transition"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-gray-700 hover:text-teal-600 font-medium transition"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className="text-gray-700 hover:text-teal-600 font-medium transition"
          >
            Contact
          </Link>
        </nav>

        {/* Profile Section */}
        <div className="relative flex items-center space-x-4">
          <button
            className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 focus:outline-none transition border border-gray-200 px-3 py-1 rounded-full"
            onClick={toggleProfileMenu}
          >
            <FaUserCircle className="w-8 h-8 text-teal-600" />
            <div className="hidden md:flex flex-col items-start ">
              <span className="font-medium">Rahul Kumar</span>
              <span className="text-sm text-gray-500 -mt-1">rahulkumar@gmail.com</span>
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
      </div>

      {/* Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg">
          <nav className="flex flex-col space-y-4 px-6 py-4">
            <Link
              to="/"
              className="text-gray-700 hover:text-teal-600 font-medium transition"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-teal-600 font-medium transition"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-teal-600 font-medium transition"
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default CenterHeader;

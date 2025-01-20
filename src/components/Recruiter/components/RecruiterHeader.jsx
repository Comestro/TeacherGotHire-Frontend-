import React, { useState } from "react";

const TeacherRecruiterHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="text-2xl font-bold text-teal-500">
          TeacherRecruiter
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <a href="/" className="text-gray-700 hover:text-teal-500 font-medium">
            Home
          </a>
          <a
            href="/jobs"
            className="text-gray-700 hover:text-teal-500 font-medium"
          >
            Jobs
          </a>
          <a
            href="/about"
            className="text-gray-700 hover:text-teal-500 font-medium"
          >
            About Us
          </a>
          <a
            href="/contact"
            className="text-gray-700 hover:text-teal-500 font-medium"
          >
            Contact
          </a>
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
          <a
            href="/login"
            className="hidden md:inline-block px-4 py-2 text-sm text-teal-500 border border-teal-500 rounded hover:bg-teal-500 hover:text-white transition"
          >
            Login
          </a>
          <a
            href="/register"
            className="hidden md:inline-block px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600 transition"
          >
            Register
          </a>

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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-100 shadow">
          <nav className="flex flex-col space-y-2 px-4 py-2">
            <a
              href="/"
              className="text-gray-700 hover:text-teal-500 font-medium"
            >
              Home
            </a>
            <a
              href="/jobs"
              className="text-gray-700 hover:text-teal-500 font-medium"
            >
              Jobs
            </a>
            <a
              href="/about"
              className="text-gray-700 hover:text-teal-500 font-medium"
            >
              About Us
            </a>
            <a
              href="/contact"
              className="text-gray-700 hover:text-teal-500 font-medium"
            >
              Contact
            </a>
            <a
              href="/login"
              className="block px-4 py-2 text-teal-500 border border-teal-500 rounded hover:bg-teal-500 hover:text-white transition"
            >
              Login
            </a>
            <a
              href="/register"
              className="block px-4 py-2 text-white bg-teal-500 rounded hover:bg-teal-600 transition"
            >
              Register
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default TeacherRecruiterHeader;

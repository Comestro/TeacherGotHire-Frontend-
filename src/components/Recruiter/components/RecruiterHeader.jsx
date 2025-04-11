import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { handleLogout } from "../../../services/authUtils";
import { getUserData } from "../../../features/authSlice";
import { FiAlignLeft } from "react-icons/fi";
import {
  fetchTeachers,
  searchTeachers,
} from "../../../features/teacherFilterSlice";

const TeacherRecruiterHeader = ({ isOpen, setIsOpen }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector((state) => state.auth.userData || {});
  console.log("Profile menu: ", profile);

  useEffect(() => {
    dispatch(getUserData());
  }, [dispatch]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // search work
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchValue.trim()) {
        dispatch(searchTeachers(searchValue));
      } else {
        dispatch(fetchTeachers());
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchValue, dispatch]);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (searchValue.trim()) {
      dispatch(searchTeachers(searchValue));
    }
  };

  return (
    <header className="bg-white shadow fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* Mobile Menu Button - Move to left */}
        <div className="flex items-center gap-2">
          <button
            className="md:hidden text-gray-700 hover:text-teal-500 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <FiAlignLeft size={20} />
          </button>

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-teal-500">
            Teacher Recruiter
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link
            to="/"
            className="text-gray-700 hover:text-teal-500 font-medium"
          >
            Home
          </Link>
          <Link
            
            className="text-gray-700 hover:text-teal-500 font-medium"
          >
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
          <input
            type="text"
            placeholder="Search teachers..."
            className="bg-gray-100 focus:outline-none w-60"
            value={searchValue}
            onChange={handleSearchChange}
            onClick={() => handleSearchSubmit()}
          />
          <button
            className="text-teal-500 hover:text-teal-600"
            onClick={() => alert("Search")}
          >
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
                <span className="font-medium">
                  {profile?.Fname} {profile?.Lname}
                </span>
                <span className="text-sm text-gray-500 -mt-1">
                  {profile?.email}
                </span>
              </div>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-14 w-56 bg-white border border-gray-200 shadow-lg rounded-md py-2 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm text-gray-500">Recruiter Code</p>
                  <p className="text-sm font-medium text-gray-700">{profile?.user_code}</p>
                </div>
                <button
                  onClick={() => handleLogout(dispatch, navigate)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-teal-100 hover:text-teal-600 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TeacherRecruiterHeader;

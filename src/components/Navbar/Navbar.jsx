import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoMdClose, IoMdMenu, IoMdArrowDropdown } from "react-icons/io";
import { useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import { logout } from "../../services/authServices";

const Navbar = ({ links, variant, externalComponent: ExternalComponent }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profile = useSelector((state) => state.auth.userData || {});
  console.log("profile", profile);

  const hideLinksPaths = ["/signin", "/signup/teacher"];
  const showSpecialLinksPaths = ["/signin", "/signup/teacher"];
  const shouldHideLinks = hideLinksPaths.includes(location.pathname);
  const shouldShowSpecialLinks = showSpecialLinksPaths.includes(
    location.pathname
  );

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
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <nav
      className={`flex items-center justify-between shadow py-2 px-6 md:px-10 ${
        variant === "light" ? "bg-white" : "bg-white-500"
      }`}
    >
      <div className="text-3xl font-bold text-gray-800">PTPI.COM</div>

      <button
        className="block md:hidden text-2xl focus:outline-none"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <IoMdClose /> : <IoMdMenu />}
      </button>

      <div
        className={`absolute top-16 left-0 w-full bg-white md:bg-transparent md:static md:flex md:items-center md:gap-6 ${
          isMenuOpen ? "block" : "hidden"
        } md:block transition-all`}
      >
        <div className="flex flex-col md:flex-row items-center md:gap-6 w-full justify-end">
          <Link
            to="/"
            className="items-center gap-4 p-3 rounded-md hover:bg-gray-100 transition font-medium text-teal-900"
          >
            Home
          </Link>

          {!shouldHideLinks &&
            links.map((link) => (
              <Link
                key={link.id}
                to={link.to}
                className="items-center gap-4 p-3 rounded-md hover:bg-gray-100 transition font-medium text-teal-900"
              >
                {link.label}
              </Link>
            ))}

          {profile?.email ? (
            <div className="relative" ref={dropdownRef}>
              <div className="mr-2">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 focus:outline-none transition border border-gray-200 px-3 py-1 rounded-full"
                >
                  <FaUserCircle className="w-8 h-8 " />
                  <div className="hidden md:flex flex-col items-start ">
                    <span className="font-medium ">
                      {profile.Fname} {profile.Lname}
                    </span>
                    <span className="text-sm  -mt-1">{profile.email}</span>
                  </div>
                </button>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-3 hover:bg-gray-100 text-gray-700 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-3 hover:bg-gray-100 text-gray-700 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700 transition-colors rounded-b-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            shouldShowSpecialLinks && (
              <>
                <Link
                  to="/signin"
                  className="items-center gap-4 p-3 rounded-md hover:bg-gray-100 transition font-medium text-teal-900"
                >
                  Login
                </Link>
                <Link
                  to="/signup/teacher"
                  className="items-center gap-4 p-3 rounded-md hover:bg-gray-100 transition font-medium text-teal-900"
                >
                  Become a Teacher
                </Link>
              </>
            )
          )}
        </div>

        {ExternalComponent && (
          <div className="mt-4 md:mt-0 md:ml-4">
            <ExternalComponent />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

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

const Navbar = ({ links }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profile = useSelector((state) => state.auth.userData || {});
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

  const UserDropdown = () => (
    <div className="absolute right-0 mt-3 bg-white rounded-lg shadow-lg border w-48">
      <Link
        to="/teacher"
        className="flex items-center px-4 py-3 hover:bg-gray-50"
        onClick={() => setIsProfileOpen(false)}
      >
        <FiUser className="mr-2" /> Dashboard
      </Link>
      <Link
        to="/settings"
        className="flex items-center px-4 py-3 hover:bg-gray-50"
        onClick={() => setIsProfileOpen(false)}
      >
        <FiSettings className="mr-2" /> Settings
      </Link>
      <button
        onClick={handleLogout}
        className="w-full flex items-center px-4 py-3 hover:bg-gray-50 rounded-b-lg"
      >
        <FiLogOut className="mr-2" /> Logout
      </button>
    </div>
  );

  return (
    <nav ref={navRef} className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center">
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <Link to="/" className="text-xl font-semibold text-gray-800">
              PTP INSTITUTE
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-4">
            {!shouldHide && (
             <button
             onClick={() => setShowEnquiry(true)}
             className="group relative overflow-hidden bg-gradient-to-r from-teal-500 via-teal-600 to-teal-500 bg-size-200 transition-all 
             duration-300 hover:bg-right-bottom hover:shadow-2xl px-6 py-3 rounded-xl font-semibold text-white
             hover:-translate-y-0.5 transform shadow-lg hover:shadow-teal-500/30"
           >
             {/* Content */}
             <span className="relative flex items-center justify-center gap-2">
               <FiBriefcase className="w-5 h-5  duration-300" />
               <span className="bg-gradient-to-r from-white/80 to-white bg-clip-text text-transparent">
                 Hire Teacher
               </span>
             </span>
           
             {/* Hover border animation */}
             <div className="absolute inset-0 rounded-xl border-2 border-white/20 transition-all duration-500 group-hover:border-white/40 group-hover:scale-[0.98]" />
           </button>
            )}

            {profile.email ? (
              <div className="relative ml-4">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                >
                  <span className="mr-2">
                    {profile.Fname} {profile.Lname}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <FiUser className="text-gray-600" />
                  </div>
                </button>
                {isProfileOpen && <UserDropdown />}
              </div>
            ) : (
              !shouldHide && (
                <Link
                  to="/signin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-5 py-2.5 font-medium text-teal-600 transition-all duration-300 border-2 border-teal-500 rounded-lg hover:bg-purple-50 hover:shadow-md"
                >
                  <FiUserPlus className="w-5 h-5" />
                  <span>Register as Teacher</span>
                </Link>
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
          <span className="text-lg font-semibold">Menu</span>
        </div>

        <div className="p-4 space-y-4">
          {!shouldHide && (
            <button
              onClick={() => {
                setShowEnquiry(true);
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center bg-teal-600 text-white px-4 py-2 rounded-lg"
            >
              <FiBriefcase className="mr-2" /> Hire Teacher
            </button>
          )}

          {profile.email ? (
            <>
              <div className="pt-4 border-t">
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
                <UserDropdown />
              </div>
            </>
          ) : (
            !shouldHide && (
              <Link
                to="/signin"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-5 py-2.5 font-medium text-teal-600 transition-all duration-300 border-2 border-teal-500 rounded-lg hover:bg-purple-50 hover:shadow-md"
              >
                <FiUserPlus className="w-5 h-5" />
                <span>Register as Teacher</span>
              </Link>
            )
          )}
        </div>
      </div>

      <TeacherEnquiry showModal={showEnquiry} setShowModal={setShowEnquiry} />
    </nav>
  );
};

export default Navbar;

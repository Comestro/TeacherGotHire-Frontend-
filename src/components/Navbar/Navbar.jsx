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
import { userLogout, getUserData } from "../../features/authSlice";
import { TeacherEnquiry } from "../enquiry/TeacherEnquiry";
import { FaSignInAlt, FaListAlt } from "react-icons/fa";
import axios from "axios";
import { getApiUrl } from "../../store/configue";

const Navbar = ({ links }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const profile = useSelector((state) => state.auth.userData || {});


  const role = profile.role;

  const [showEnquiry, setShowEnquiry] = useState(false);
  const navRef = useRef(null);

  const handleTeacherSearch = () => {
    navigate('/get-preferred-teacher');
    setShowEnquiry(false); // Close enquiry if open
    setIsMobileOpen(false); // Close mobile menu if open
  };

  const hiddenPaths = ["/signin", "/signup/teacher", "/signup/recruiter"];
  const shouldHide = hiddenPaths.includes(location.pathname);

  useEffect(() => {
    const fetchWallet = async () => {
      const token = localStorage.getItem("access_token");
      if (token && (role === "teacher" || role === "recruiter")) {
        try {
          const res = await axios.get(`${getApiUrl()}/api/wallet/`, {
            headers: { Authorization: `Token ${token}` }
          });
          setWalletBalance(res.data?.wallet?.balance || 0);
        } catch (e) {
          console.error("Failed to fetch wallet", e);
        }
      }
    };
    fetchWallet();
    window.addEventListener("walletUpdated", fetchWallet);
    return () => window.removeEventListener("walletUpdated", fetchWallet);
  }, [role, location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && !profile.email) {
      dispatch(getUserData());
    }

    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsMobileOpen(false);
        setIsProfileOpen(false);
        setIsRegisterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch, profile.email]);

  const handleLogout = () => {
    dispatch(userLogout());
    setIsProfileOpen(false);
  };

  const getDashboardLink = () => {
    switch (role) {
      case "teacher": return "/teacher";
      case "recruiter": return "/recruiter";
      case "centeruser": return "/examcenter";
      case "questionuser": return "/manage-exam";
      case "interviewer": return "/interviewer/dashboard";
      case "admin": return "/admin/dashboard";
      default: return "/admin/dashboard";
    }
  };

  const UserDropdown = ({ isMobile = false }) => (
    <div
      className={`${isMobile ? "w-full" : "absolute right-0 mt-3 w-48"
        } bg-white z-50 rounded-xl border border-slate-100 ${!isMobile && "shadow-sm"}`}
    >
      <Link
        to={getDashboardLink()}
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
      
      {role === "recruiter" && (
        <Link
          to="/recruiter/hire-requests"
          className="flex items-center px-4 py-3 hover:bg-slate-50 text-slate-700 transition-colors"
          onClick={() => setIsProfileOpen(false)}
        >
          <FaListAlt className="mr-3" /> Hire Requests
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
        <FiUserPlus className="mr-3 text-teal-600" /> As a Teacher
      </Link>
      <Link
        to="/signup/recruiter"
        className="flex items-center px-4 py-3 hover:bg-slate-50 text-slate-700 transition-colors rounded-b-xl"
        onClick={() => { setIsRegisterOpen(false); setIsMobileOpen(false); }}
      >
        <FiBriefcase className="mr-3 text-teal-600" /> As a Recruiter
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
              className="bg-teal-600 px-3 py-2 rounded-xl font-semibold text-white"
            >
              <span className="flex items-center justify-center gap-2">
                <FiBriefcase className="w-4 h-4" />
                <span className="text-white">
                  शिक्षक खोजें
                </span>
              </span>
            </button>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-3">
            {!shouldHide && (
              <button
                onClick={handleTeacherSearch}
                className="bg-teal-600 px-6 py-3 rounded-xl font-semibold text-white"
              >
                <span className="flex items-center justify-center gap-2">
                  <FiBriefcase className="w-5 h-5" />
                  <span className="text-white">
                    शिक्षक खोजें
                  </span>
                </span>


              </button>
            )}

            {profile.email ? (
              <div className="flex items-center gap-2 z-10">
                {(role === "teacher" || role === "recruiter") && walletBalance !== null && (
                  <div className="group relative ml-4 hidden sm:block">
                    <Link to={role === "teacher" ? "/teacher/wallet" : "/recruiter/wallet"} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full transition-all hover:bg-indigo-100 hover:shadow-sm cursor-pointer">
                      <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold font-serif">P</div>
                      <span className="text-indigo-800 font-bold text-sm">{walletBalance} <span className="font-medium text-xs opacity-80">Points</span></span>
                    </Link>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-3 py-1.5 bg-indigo-800 text-white text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg">
                      Add Fund
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-800 rotate-45"></div>
                    </div>
                  </div>
                )}
              <div className="relative ml-4">
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
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200
        ${isMobileOpen ? "block" : "hidden"}`}
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
                {(role === "teacher" || role === "recruiter") && walletBalance !== null && (
                  <Link to={role === "teacher" ? "/teacher/wallet" : "/recruiter/wallet"} className="flex items-center justify-between px-4 py-3 mb-4 bg-indigo-50 rounded-xl border border-indigo-100" onClick={() => setIsMobileOpen(false)}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold font-serif">P</div>
                      <span className="font-medium text-indigo-900">Wallet Balance</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-indigo-700">{walletBalance} <span className="text-xs font-medium opacity-80">Pts</span></span>
                      <span className="text-xs text-indigo-500 font-medium hover:underline cursor-pointer">Add Fund</span>
                    </div>
                  </Link>
                )}
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
                        <span>As a Teacher</span>
                      </Link>
                      <Link
                        to="/signup/recruiter"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-slate-600 hover:text-teal-600 transition-colors"
                      >
                        <span>As a Recruiter</span>
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

    </nav>
  );
};

export default Navbar;

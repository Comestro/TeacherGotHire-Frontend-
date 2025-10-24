import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiChevronDown, FiBell, FiUser, FiSettings } from 'react-icons/fi';
import { handleLogout } from '../../../services/authUtils';
import { getSetterInfo } from '../../../features/examQuesSlice';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Example notification count
  const dropdownRef = useRef(null);
  const setterUser = useSelector((state) => state.examQues.setterInfo);
  const user = setterUser?.[0]?.user;

  // Close dropdown when clicking outside
  useEffect(() => {
    dispatch(getSetterInfo());
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with enhanced styling */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full opacity-80"></div>
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  PTP INSTITUTE
                </span>
                <div className="text-xs text-gray-500 font-medium">Learning Excellence</div>
              </div>
            </Link>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell with modern styling */}
            <div className="relative">
              <button className="relative p-2.5 text-gray-600 hover:text-teal-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 group">
                <FiBell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                    {notificationCount}
                  </span>
                )}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </div>

            {/* User Profile Dropdown with enhanced design */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 group"
              >
                <div className="flex-shrink-0 relative">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-white font-semibold text-sm">
                      {user.Fname[0]}{user.Lname[0]}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-gray-800">
                    {user.Fname} {user.Lname}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mr-1.5"></div>
                    Subject Expert
                  </div>
                </div>
                <FiChevronDown className={`w-4 h-4 text-gray-500 transition-all duration-300 ${dropdownOpen ? 'transform rotate-180 text-teal-600' : ''}`} />
              </button>

              {/* Enhanced Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white backdrop-blur-md rounded-2xl shadow-xl py-2 border border-gray-200/50 animate-in slide-in-from-top-2 duration-200">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.Fname[0]}{user.Lname[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {user.Fname} {user.Lname}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      to="profile"
                      className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 transition-all duration-200 group"
                    >
                      <div className="relative">
                        <FiUser className="w-4 h-4 mr-3" />
                        <div className="absolute inset-0 rounded bg-teal-500/20 opacity-0 transition-opacity duration-200"></div>
                      </div>
                      <span className="font-medium">View Profile</span>
                    </Link>
                    
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={() => handleLogout(dispatch, navigate)}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 transition-all duration-200 group"
                  >
                    <div className="relative">
                      <FiLogOut className="w-4 h-4 mr-3" />
                      <div className="absolute inset-0 rounded bg-red-500/20 opacity-0  transition-opacity duration-200"></div>
                    </div>
                    <span className="font-medium">Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
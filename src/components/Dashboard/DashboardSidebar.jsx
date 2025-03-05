import React, { useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  HiViewGrid,
  HiUser,
  HiBriefcase,
  HiOutlineLogin,
} from "react-icons/hi";
import { HiMiniEye } from "react-icons/hi2";
import { getUserData, userLogout } from "../../features/authSlice";
import { IoMdSettings } from "react-icons/io";
import { BsPerson } from "react-icons/bs";
import { handleLogout } from "../../services/authUtils";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.auth.userData || {});

  useEffect(() => {
    dispatch(getUserData());
  }, [dispatch]);

  return (
    <>
      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72   bg-slate-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 z-50" : "-translate-x-full"
        } md:translate-x-0 md:fixed`}
      >
        {/* Profile Section */}
        <div className="flex flex-col h-screen bg-white">
          <div className="flex flex-col justify-center py-2 border-b-2 border-white">
            <h1 className="font-bold text-2xl text-gray-700 text-center">
              PTPI
            </h1>
            <p className="text-sm text-center text-[#3E98C7] font-semibold mb-2">
              Private Teacher Provider Institute.
            </p>
          </div>
          {/* profiel section */}
          <div className="flex items-center gap-3 py-3 bg-[#F5F8FA] px-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              {/* User Icon */}
              <div className="p-2 bg-[#E5F1F9] rounded-full">
              <BsPerson className="size-6 text-blue-400 font-semibold"/>
              </div>
              {/* Profile Info */}
              <div className="flex flex-col">
                <h2 className="text-md font-semibold text-gray-800">
                  {profile.Fname || "Your Name"}
                </h2>
                <p className="text-sm text-gray-600 truncate">
                  {profile.email || "email@example.com"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-1 justify-between">
            <nav className="w-full mt-1">
              <NavLink
                to="/teacher/"
                onClick={() => setIsOpen(false)}
                end
                className={({ isActive }) =>
                  `block py-3 px-4  ${
                    isActive
                      ? "bg-[#E5F1F9] text-[#3E98C7] font-semibold"
                      : "text-gray-500"
                  } hover:bg-[#F5F8FA] transition flex items-center gap-1`
                }
              >
                <HiViewGrid className="size-5" />
                Dashboard
              </NavLink>
              <NavLink
                to="/teacher/personal-profile"
                onClick={() => setIsOpen(false)}
                end
                className={({ isActive }) =>
                  `block py-3 px-4 ${
                    isActive
                      ? "bg-[#E5F1F9] text-[#3E98C7] font-semibold"
                      : "text-gray-500"
                  } hover:bg-[#F5F8FA] transition flex items-center gap-1`
                }
              >
                <HiUser className="size-5" />
                Personal Details
              </NavLink>
              <NavLink
                to="/teacher/job-profile"
                onClick={() => setIsOpen(false)}
                end
                className={({ isActive }) =>
                  `block py-3 px-4 ${
                    isActive
                      ? "bg-[#E5F1F9] text-[#3E98C7] font-semibold"
                      : "text-gray-500"
                  } hover:bg-[#F5F8FA] transition flex items-center gap-2`
                }
              >
                <HiBriefcase className="size-5" />
                Job Details
              </NavLink>
              <NavLink
                to="view-attempts"
                onClick={() => setIsOpen(false)}
                end
                className={({ isActive }) =>
                  `block py-3 px-4 ${
                    isActive
                      ? "bg-[#E5F1F9] text-[#3E98C7] font-semibold"
                      : "text-gray-500"
                  } hover:bg-[#F5F8FA] transition flex items-center gap-2`
                }
              >
                <HiMiniEye className="size-5 mt-1"/>
                View Attempts
              </NavLink>

              <NavLink
                to="job-apply"
                onClick={() => setIsOpen(false)}
                end
                className={({ isActive }) =>
                  `block py-3 px-4 ${
                    isActive
                      ? "bg-[#E5F1F9] text-[#3E98C7] font-semibold"
                      : "text-gray-500"
                  } hover:bg-[#F5F8FA] transition flex items-center gap-2`
                }
              >
                <HiBriefcase className="size-5" />
                Job Apply
              </NavLink>
              
              
            </nav>
            <div className="flex flex-col">
              <div className="border-t border-gray-200">
                <Link onClick={() => setIsOpen(false)} to='/teacher/setting' className="flex items-center gap-1 text-md text-gray-500 py-2 px-4">
                  <IoMdSettings className="size-5" /> Setting
                </Link>
              </div>
              <div className="border-t border-gray-200">
                <button
                  onClick={() => handleLogout(dispatch, navigate)}
                  className="flex items-center gap-1 text-md text-red-500 py-2 px-4"
                >
                  <HiOutlineLogin className="size-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;

import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../services/authServices";
import {
  HiViewGrid,
  HiUser,
  HiBriefcase,
  HiOutlineLogin,
} from "react-icons/hi";
import { getUserData } from "../../features/authSlice";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.auth.userData || {});

  useEffect(() => {
    dispatch(getUserData());
  }, [dispatch]);

  return (
    <>
      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72  bg-slate-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:fixed`}
      >
        {/* Profile Section */}
        <div className="flex flex-col h-screen bg-white">
          <div className="flex flex-col justify-center py-2 border-b-2 border-white">
            <h1 className="font-bold text-2xl text-teal-800 text-center">
              PTPI
            </h1>
            <p className="text-sm text-center text-gray-600 font-semibold mb-2">
              Private Teacher Provider Institute.
            </p>
          </div>
          {/* profiel section */}
          <div className="flex items-center gap-2 py-3 bg-[#F5F8FA] px-2">
            <div className="px-2 flex items-center gap-2">
              <div className="w-12 h-12">
                <img
                  src={profile.profileImage || ""}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-white shadow-md"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-md font-semibold text-gray-600">
                  {profile.Fname || "Your Name"}
                </h2>
                <p className="text-sm text-teal-600 truncate">
                  {profile.email || "email@example.com"}
                </p>
              </div>
            </div>
          </div>
          {/* Navigation Links */}
          <nav className="w-full mt-1">
            <NavLink
              to="/teacher/"
              end
              className={({ isActive }) =>
                `block py-3 px-4  ${
                  isActive
                    ? "bg-[#E5F1F9] text-teal-600 font-semibold"
                    : "text-gray-500 font-semibold"
                } hover:bg-[#F5F8FA] transition flex items-center gap-1`
              }
            >
              <HiViewGrid />
              Dashboard
            </NavLink>
            <NavLink
              to="/teacher/personal-profile"
              end
              className={({ isActive }) =>
                `block py-3 px-4 ${
                  isActive
                    ? "bg-[#E5F1F9] text-teal-600 font-semibold"
                    : "text-gray-500 font-semibold"
                } hover:bg-[#F5F8FA] transition flex items-center gap-1`
              }
            >
              <HiUser />
              Personal Details
            </NavLink>
            <NavLink
              to="/teacher/job-profile"
              end
              className={({ isActive }) =>
                `block py-3 px-4 ${
                  isActive
                    ? "bg-[#E5F1F9] text-white font-semibold"
                    : "text-gray-500 font-semibold"
                } hover:bg-[#F5F8FA] transition flex items-center gap-2`
              }
            >
              <HiBriefcase />
              Job Details
            </NavLink>
            {/* <button
              onClick={logout}
              className="inline-flex  items-center py-1 px-5 mt-4 rounded-md border-2 border-teal-600 hover:bg-teal-600 text-gray-600 hover:text-white font-semibold transition"
            >
              <HiOutlineLogin className="mr-2" />
              Logout
            </button> */}
          </nav>
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

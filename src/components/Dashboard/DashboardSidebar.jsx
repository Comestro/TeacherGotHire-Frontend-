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
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 z-50 max-h-screen" : "-translate-x-full z-50"
        } md:translate-x-0 md:fixed md:z-40`}
      >
        {/* Profile Section */}
        <div className="flex flex-col h-screen bg-white">
          <div className="flex flex-col justify-center py-4 border-b border-gray-200">
            <h1 className="font-bold text-2xl text-primary text-center">
              PTPI
            </h1>
            <p className="text-sm text-center text-accent font-medium mb-2">
              Private Teacher Provider Institute.
            </p>
          </div>
          {/* profile section */}
          <div className="flex items-center gap-3 py-3 bg-background px-4 mx-3 my-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 min-w-0">
              {/* User Icon */}
              <div className="p-2 bg-accent/10 rounded-full flex-shrink-0">
                <BsPerson className="size-6 text-accent font-semibold"/>
              </div>
              {/* Profile Info */}
              <div className="flex flex-col min-w-0">
                <h2 className="text-md font-semibold text-text truncate">
                  {profile.Fname || "Your Name"}
                </h2>
                <p className="text-sm text-secondary truncate overflow-hidden text-ellipsis whitespace-nowrap">
                  {profile.email || "email@example.com"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-1 justify-between">
            <nav className="w-full mt-1 space-y-1">
              <NavLink
                to="/teacher/"
                onClick={() => setIsOpen(false)}
                end
                className={({ isActive }) =>
                  `block py-3 px-4 mx-2 rounded-lg ${
                    isActive
                      ? "bg-primary text-white font-semibold"
                      : "text-secondary"
                  } hover:bg-primary hover:text-white transition flex items-center gap-2`
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
                  `block py-3 px-4 mx-2 rounded-lg ${
                    isActive
                      ? "bg-primary text-white font-semibold"
                      : "text-secondary"
                  } hover:bg-primary hover:text-white transition flex items-center gap-2`
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
                  `block py-3 px-4 mx-2 rounded-lg ${
                    isActive
                      ? "bg-primary text-white font-semibold"
                      : "text-secondary"
                  } hover:bg-primary hover:text-white transition flex items-center gap-2`
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
                  `block py-3 px-4 mx-2 rounded-lg ${
                    isActive
                      ? "bg-primary text-white font-semibold"
                      : "text-secondary"
                  } hover:bg-primary hover:text-white transition flex items-center gap-2`
                }
              >
                <HiMiniEye className="size-5"/>
                View Attempts
              </NavLink>

              <NavLink
                to="job-apply"
                onClick={() => setIsOpen(false)}
                end
                className={({ isActive }) =>
                  `block py-3 px-4 mx-2 rounded-lg ${
                    isActive
                      ? "bg-primary text-white font-semibold"
                      : "text-secondary"
                  } hover:bg-primary hover:text-white transition flex items-center gap-2`
                }
              >
                <HiBriefcase className="size-5" />
                Job Apply
              </NavLink>
              
              
            </nav>
            <div className="flex flex-col">
              <div className="border-t border-gray-200">
                <Link onClick={() => setIsOpen(false)} to='/teacher/setting' className="flex items-center gap-2 text-md text-secondary hover:text-primary py-3 px-4 mx-2 rounded-lg hover:bg-primary/5 transition">
                  <IoMdSettings className="size-5" /> Setting
                </Link>
              </div>
              <div className="border-t border-gray-200">
                <button
                  onClick={() => handleLogout(dispatch, navigate)}
                  className="flex items-center gap-2 text-md text-error hover:text-error/80 py-3 px-4 mx-2 rounded-lg hover:bg-error/5 transition w-full"
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

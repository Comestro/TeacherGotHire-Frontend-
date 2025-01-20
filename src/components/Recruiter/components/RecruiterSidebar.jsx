import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../services/authServices";
import { getUserData } from "../../../features/authSlice";
import { HiViewGrid, HiUser, HiBriefcase, HiOutlineLogin, HiEye } from "react-icons/hi";
import { IoMdSettings } from "react-icons/io";

const RecruiterSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.auth.userData || {});

  const [isOpen, setIsOpen] = useState(true); // Added state for sidebar toggle

  useEffect(() => {
    dispatch(getUserData());
  }, [dispatch]);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  // Toggle the sidebar visibility
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div
        className={`fixed top-15 left-0 w-72 z-50 p-1 sticky border h-screen bg-white shadow-md ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex flex-col justify-center py-2 border-b-2 border-white">
            <h1 className="font-bold text-2xl text-gray-700 text-center">PTPI</h1>
            <p className="text-sm text-center text-teal-500 font-semibold mb-2">
              Private Teacher Provider Institute.
            </p>
          </div>
          <div className="flex flex-col flex-1 justify-between">
            <nav className="w-full mt-1">
              <NavLink
                to="/recruiter/"
                end
                className={({ isActive }) =>
                  `block py-3 px-4  ${isActive
                    ? "bg-[#E5F1F9] text-[#3E98C7] font-semibold"
                    : "text-gray-500 font-semibold"
                  } hover:bg-[#F5F8FA] transition flex items-center gap-1`
                }
              >
                <HiViewGrid className="size-5" />
                Dashboard
              </NavLink>             
              <NavLink
                to="/recruiter/personal-profile/"
                end
                className={({ isActive }) =>
                  `block py-3 px-4  ${isActive
                    ? "bg-[#E5F1F9] text-[#3E98C7] font-semibold"
                    : "text-gray-500 font-semibold"
                  } hover:bg-[#F5F8FA] transition flex items-center gap-1`
                }
              >
                <HiUser className="size-5" />
                Profile
              </NavLink>
              <NavLink
                to="/recruiter/teacher-recruiter/"
                end
                className={({ isActive }) =>
                  `block py-3 px-4  ${isActive
                    ? "bg-[#E5F1F9] text-[#3E98C7] font-semibold"
                    : "text-gray-500 font-semibold"
                  } hover:bg-[#F5F8FA] transition flex items-center gap-1`
                }
              >
                <HiViewGrid className="size-5" />
                FindTeacher
              </NavLink>
              {/* <NavLink
                to="/teacher/personal-profile"
                end
                className={({ isActive }) =>
                  `block py-3 px-4 ${isActive
                    ? "bg-[#E5F1F9] text-[#3E98C7] font-semibold"
                    : "text-gray-500 font-semibold"
                  } hover:bg-[#F5F8FA] transition flex items-center gap-1`
                }
              > */}
                {/* <HiUser className="size-5" />
                Personal Details
              </NavLink>
              <NavLink
                to="/teacher/job-profile"
                end
                className={({ isActive }) =>
                  `block py-3 px-4 ${isActive
                    ? "bg-[#E5F1F9] text-[#3E98C7] font-semibold"
                    : "text-gray-500 font-semibold"
                  } hover:bg-[#F5F8FA] transition flex items-center gap-2`
                }
              >
                <HiBriefcase className="size-5" />
                Job Details
              </NavLink>
              <NavLink
                to="view-attempts"
                end
                className={({ isActive }) =>
                  `block py-3 px-4 ${isActive
                    ? "bg-[#E5F1F9] text-[#3E98C7] font-semibold"
                    : "text-gray-500 font-semibold"
                  } hover:bg-[#F5F8FA] transition flex items-center gap-2`
                }
              >
                <HiEye className="size-5 mt-1" />
                View Attempts
              </NavLink> */}
            </nav>
            <div className="flex flex-col">
              <div className="border-t border-gray-200">
                <button className="flex items-center gap-1 text-md font-semibold text-gray-500 py-2 px-4">
                  <IoMdSettings className="size-5" /> Setting
                </button>
              </div>
              <div className="border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-md font-semibold text-gray-500 py-2 px-4"
                >
                  <HiOutlineLogin className="size-5" />
                  Logout
                </button>
              </div>
              <div className="copyright flex justify-center w-full border-t border-gray-200">
                <p className="text-gray-500 text-center p-1 text-sm font-semibold ">
                  Designed by Comestro
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecruiterSidebar;

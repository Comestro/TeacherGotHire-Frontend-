import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch} from "react-redux";
import { logout } from "../../services/authServices";
import {
  HiViewGrid,
  HiUser,
  HiBriefcase,
  HiOutlineLogin,
} from "react-icons/hi";

  // useEffect(()=>{

  // },[])
  // console.log("ghdkfjlg",profile)
import { getUserData } from "../../features/authSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const profile = useSelector(
    (state) => state.auth.userData || {}
  );

  useEffect(()=>{
   dispatch(getUserData());
  },[])
  //console.log("ghdkfjlg",profile)

  return (
    <div className="flex flex-col items-center py-6 h-screen">
      {/* Profile Section */}
      <div className="flex mb-10 items-center gap-4  border-2 border-teal-600 rounded-md p-2">
        <div className="w-16 h-16">
          <img
            src={profile.profileImage || ""}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border-2 border-gray-300 shadow-md"
          />
        </div>
        <div className="flex flex-col">
          <h2 className="text-md font-bold text-gray-700">
            {profile.Fname || "Your Name"}
          </h2>
          <p className="text-md text-gray-700">
            {profile.email || "email@example.com"}
          </p>
        </div>
      </div>
      
      <hr />  

      {/* Navigation Links */}
      <nav className="w-full px-7 space-y-2">
        <NavLink
          to="/teacher/"
          end
          className={({ isActive }) =>
            `block py-2 px-4 rounded-md  ${
              isActive
                ? "bg-[#21897e] text-white font-semibold"
                : "text-gray-600 font-semibold"
            } hover:bg-teal-600 hover:text-white transition flex items-center gap-1`
          }
        >
          <HiViewGrid />
          Dashboard
        </NavLink>
        <NavLink
          to="/teacher/personal-profile"
          end
          className={({ isActive }) =>
            `block py-2 px-4 rounded-md ${
              isActive
                ? "bg-[#21897e] text-white font-semibold"
                : "text-gray-600 font-semibold"
            } hover:bg-teal-600 hover:text-white transition flex items-center gap-1`
          }
        >
          <HiUser />
          Personal Details
        </NavLink>
        <NavLink
          to="/teacher/job-profile"
          end
          className={({ isActive }) =>
            `block py-2 px-4 rounded-md ${
              isActive
                ? "bg-[#21897e] text-white font-semibold"
                : "text-gray-600 font-semibold"
            } hover:bg-teal-600 hover:text-white transition flex items-center gap-2`
          }
        >
          <HiBriefcase />
          Job Details
        </NavLink>
        <div className="flex">
        <button
          onClick={logout}
          className="inline-flex items-center py-1 px-5 rounded-md border-2 border-teal-600 hover:bg-teal-600 text-gray-600 hover:text-white font-semibold transition fixed bottom-5"
        >
          <HiOutlineLogin className="mr-2" />
          Logout
        </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;

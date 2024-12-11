import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { logout } from "../../services/authServices";

const Sidebar = () => {
  const profile = useSelector(
    (state) => state.personalProfile.profileData || {}
  );

  return (
    <div className="fixed w-56 h-screen flex flex-col items-center py-6 ">
      {/* Profile Section */}
      <div className="text-center mb-8">
        <div className="relative w-24 h-24 mx-auto">
          <img
            src={profile.profileImage || "https://via.placeholder.com/200"}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border-2 border-gray-300 shadow-md"
          />
        </div>
        <h2 className="text-xl font-semibold mt-4 text-gray-800">
          {profile.fullname || "Your Name"}
        </h2>
        <p className="text-md text-gray-700">
          {profile.email || "email@example.com"}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="w-full px-4 space-y-2">
        <NavLink
          to="/teacher/"
          end
          className={({ isActive }) =>
            `block py-2 px-4 rounded-md  ${
              isActive
                ? "bg-teal-700 text-white font-semibold"
                : "text-gray-600 font-semibold"
            } hover:bg-teal-600 hover:text-white transition`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/teacher/edit-profile"
          end
          className={({ isActive }) =>
            `block py-2 px-4 rounded-md ${
              isActive
                ? "bg-teal-700 text-white font-semibold"
                : "text-gray-600 font-semibold"
            } hover:bg-teal-600 hover:text-white transition`
          }
        >
          Personal Details
        </NavLink>
        <NavLink
          to="/teacher/job-profile"
          end
          className={({ isActive }) =>
            `block py-2 px-4 rounded-md ${
              isActive
                ? "bg-teal-700 text-white font-semibold"
                : "text-gray-600 font-semibold"
            } hover:bg-teal-600 hover:text-white transition`
          }
        >
          Job Details
        </NavLink>
        <button
          onClick={logout}
          className={`block py-2 px-4 rounded-md self-end bg-slate-600 hover:bg-slate-800 text-white transition`}
        >
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;

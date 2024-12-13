import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch} from "react-redux";
import { logout } from "../../services/authServices";
import { getUserData } from "../../features/authSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const profile = useSelector(
    (state) => state.auth.userData || {}
  );

  useEffect(()=>{
   dispatch(getUserData());
  },[])
  console.log("ghdkfjlg",profile)

  return (
    <div className="fixed w-56 h-screen flex flex-col items-center py-6 ">
      {/* Profile Section */}
      <div className="text-center mb-8">
        <div className="relative w-24 h-24 mx-auto">
          <img
            src={profile.profileImage || ""}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border-2 border-gray-300 shadow-md"
          />
        </div>
        <h2 className="text-xl font-semibold mt-4 text-gray-800">
          {profile.Fname || "Your Name"}
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
          to="/teacher/personal-profile"
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

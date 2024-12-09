import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const profile = useSelector(
    (state) => state.personalProfile.profileData || []
  );
  
  return (
    <div className="fixed w-64 bg-gray-900 text-white h-screen flex flex-col items-center py-6 shadow-lg">
      {/* Profile Section */}
      <div className="text-center mb-8">
        <div className="relative w-20 h-20 mx-auto">
          <img
            src={profile.profileImage || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border-2 border-gray-700 shadow-md"
          />
        </div>
        <h2 className="text-lg font-semibold mt-4">
          {profile.fullname || "Your Name"}
        </h2>
        <p className="text-sm text-gray-400">{profile.email || "email@example.com"}</p>
      </div>

      {/* Navigation Links */}
      <nav className="w-full px-4 space-y-4">
        <NavLink
          to="/teacher/"
          end
          className={({ isActive }) =>
            `block py-2 px-4 rounded-md text-sm ${
              isActive ? "bg-gray-300 text-black" : "text-gray-400"
            } hover:bg-blue-600 hover:text-white transition`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/teacher/edit-profile"
          end
          className={({ isActive }) =>
            `block py-2 px-4 rounded-md text-sm ${
              isActive ? "bg-gray-300 text-black" : "text-gray-400"
            } hover:bg-blue-600 hover:text-white transition`
          }
        >
          Personal deatails
        </NavLink>
        <NavLink
          to="/teacher/job-profile"
          end
          className={({ isActive }) =>
            `block py-2 px-4 rounded-md text-sm ${
              isActive ? "bg-gray-300 text-black" : "text-gray-400"
            } hover:bg-blue-600 hover:text-white transition`
          }
        >
          Job deatails
        </NavLink>

        </nav>
    </div>
  );
};

export default Sidebar;

        {/* Edit Profile */}
        {/* <div>
          <button
            onClick={toggleEditProfileSubList}
            className="w-full flex justify-between items-center py-2 px-4 rounded-md text-sm text-gray-400 hover:bg-blue-600 hover:text-white transition"
          >
            Personal Profile
          </button>
        </div> */}
          {/* {showEditProfileSubList && (
            <div className="pl-6 mt-2 space-y-3">
              <NavLink
                to="edit-profile/basic-info"
                className={({ isActive }) =>
                  `block text-sm ${
                    isActive ? "text-blue-400" : "text-gray-400"
                  } hover:text-blue-400 transition`
                }
              >
                Basic Details
              </NavLink>
              <NavLink
                to="edit-profile/address"
                className={({ isActive }) =>
                  `block text-sm ${
                    isActive ? "text-blue-400" : "text-gray-400"
                  } hover:text-blue-400 transition`
                }
              >
                Address Details
              </NavLink>
              <NavLink
                to="edit-profile/personal-info"
                className={({ isActive }) =>
                  `block text-sm ${
                    isActive ? "text-blue-400" : "text-gray-400"
                  } hover:text-blue-400 transition`
                }
              >
                Personal Details
              </NavLink>
            </div>
          )} */}
       

        {/* Job Profile */}
        {/* <div>
          <button
            onClick={toggleJobProfileSubList}
            className="w-full flex justify-between items-center py-2 px-4 rounded-md text-sm text-gray-400 hover:bg-blue-600 hover:text-white transition"
          >
            Job Profile
          </button>
          {showJobProfileSubList && (
            <div className="pl-6 mt-2 space-y-3">
              <NavLink
                to="job-profile/education"
                className={({ isActive }) =>
                  `block text-sm ${
                    isActive ? "text-blue-400" : "text-gray-400"
                  } hover:text-blue-400 transition`
                }
              >
                Educational Details
              </NavLink>
              <NavLink
                to="job-profile/experience"
                className={({ isActive }) =>
                  `block text-sm ${
                    isActive ? "text-blue-400" : "text-gray-400"
                  } hover:text-blue-400 transition`
                }
              >
                Experience Details
              </NavLink>
              <NavLink
                to="job-profile/skills"
                className={({ isActive }) =>
                  `block text-sm ${
                    isActive ? "text-blue-400" : "text-gray-400"
                  } hover:text-blue-400 transition`
                }
              >
                Skills
              </NavLink>
            </div>
          )}
        </div> */}
     

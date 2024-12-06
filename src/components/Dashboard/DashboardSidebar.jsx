import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const profile = useSelector((state) => state.personalProfile.profileData || []);
  const [showEditProfileSubList, setShowEditProfileSubList] = useState(false);
  const [showJobProfileSubList, setShowJobProfileSubList] = useState(false);

  const toggleEditProfileSubList = () => {
    setShowEditProfileSubList(!showEditProfileSubList);
  };

  const toggleJobProfileSubList = () => {
    setShowJobProfileSubList(!showJobProfileSubList);
  };

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen flex flex-col items-center py-8 shadow-lg overflow-hidden">
      {/* Profile Section */}
      <div className="flex-grow w-full overflow-y-auto ">
      <div>
        {profile && profile.length > 0 ? (
          profile.map((profile, index) => (
            <div key={index} className="text-center mb-8">
              <div className="relative w-28 h-28 mx-auto mb-4">
                <img
                  src={profile.profileImage || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>

              {/* Name and Contact Info */}
              <h2 className="text-lg font-semibold text-gray-100">
                {profile.fullname || "Your Name"}
              </h2>
              <p className="text-sm text-gray-300">
                {profile.email || "your-email@example.com"}
              </p>
              <p className="text-sm text-gray-300 mb-4">
                {profile.phone || "your-phone-number"}
              </p>
            </div>
    ))
  ) : (
    <div className="text-center text-gray-300">
      <div className="relative w-28 h-28 mx-auto mb-4">
        <img
          src="https://via.placeholder.com/150"
          alt="Default Profile"
          className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
        />
      </div>

      {/* Default Fallback Data */}
      <h2 className="text-lg font-semibold text-gray-100">Your Name</h2>
      <p className="text-sm text-gray-300">your-email@example.com</p>
      <p className="text-sm text-gray-300 mb-4">your-phone-number</p>
    </div>
  )}
</div>

        {/* Navigation Links */}
        <nav className="space-y-6 w-full px-6">
          <NavLink
            to="/teacher"
            end
            className={({ isActive }) =>
              `flex items-center space-x-4 py-2 px-4 rounded-md ${
                isActive ? "bg-blue-700 text-white" : "text-gray-300"
              } hover:bg-blue-700 hover:text-white transition`
            }
          >
            <span className="text-lg">📊</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/personal-info"
            className={({ isActive }) =>
              `flex items-center space-x-4 py-2 px-4 rounded-md ${
                isActive ? "bg-blue-700 text-white" : "text-gray-300"
              } hover:bg-blue-700 hover:text-white transition`
            }
          >
            <span className="text-lg">👤</span>
            <span>View Profile</span>
          </NavLink>

          {/* Edit Profile with Sub-list */}
          <div>
            <div
              onClick={toggleEditProfileSubList}
              className="flex items-center justify-between py-2 px-4 rounded-md cursor-pointer hover:bg-blue-700 hover:text-white transition"
            >
              <div className="flex items-center space-x-4">
                <span className="text-lg">✏️</span>
                <span>Edit Profile</span>
              </div>
              <span>{showEditProfileSubList ? "▲" : "▼"}</span>
            </div>
            {showEditProfileSubList && (
              <div className="ml-8 mt-2 space-y-2">
                <NavLink
                  to="edit-profile/basic-info"
                  className={({ isActive }) =>
                    `block py-1 text-sm ${
                      isActive ? "text-blue-300" : "text-gray-400"
                    } hover:text-blue-300 transition`
                  }
                >
                  Basic Information
                </NavLink>
                <NavLink
                  to="edit-profile/address"
                  className={({ isActive }) =>
                    `block py-1 text-sm ${
                      isActive ? "text-blue-300" : "text-gray-400"
                    } hover:text-blue-300 transition`
                  }
                >
                  Address
                </NavLink>
                <NavLink
                  to="edit-profile/personal-info"
                  className={({ isActive }) =>
                    `block py-1 text-sm ${
                      isActive ? "text-blue-300" : "text-gray-400"
                    } hover:text-blue-300 transition`
                  }
                >
                  Personal Information
                </NavLink>
              </div>
            )}
          </div>

          {/* Edit Job Profile with Sub-list */}
          <div>
            <div
              onClick={toggleJobProfileSubList}
              className="flex items-center justify-between py-2 px-4 rounded-md cursor-pointer hover:bg-blue-700 hover:text-white transition"
            >
              <div className="flex items-center space-x-4">
                <span className="text-lg">💼</span>
                <span>Edit Job Profile</span>
              </div>
              <span>{showJobProfileSubList ? "▲" : "▼"}</span>
            </div>
            {showJobProfileSubList && (
              <div className="ml-8 mt-2 space-y-2">
                <NavLink
                  to="job-profile/education"
                  className={({ isActive }) =>
                    `block py-1 text-sm ${
                      isActive ? "text-blue-300" : "text-gray-400"
                    } hover:text-blue-300 transition`
                  }
                >
                  Education
                </NavLink>
                <NavLink
                  to="job-profile/experience"
                  className={({ isActive }) =>
                    `block py-1 text-sm ${
                      isActive ? "text-blue-300" : "text-gray-400"
                    } hover:text-blue-300 transition`
                  }
                >
                  Experience
                </NavLink>
                <NavLink
                  to="job-profile/skills"
                  className={({ isActive }) =>
                    `block py-1 text-sm ${
                      isActive ? "text-blue-300" : "text-gray-400"
                    } hover:text-blue-300 transition`
                  }
                >
                  Skills
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;

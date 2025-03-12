import { useState } from "react";
import {
  MdAccountCircle,
  MdPhotoCamera,
  MdEmail,
  MdWork,
} from "react-icons/md";
import { FiUser, FiBriefcase, FiLock, FiSave } from "react-icons/fi";

export default function SettingsPage() {
  const [userData, setUserData] = useState({
    name: "Rahul",
    email: "rahul@gmail.com",
    bio: "Front-end developer passionate about creating beautiful user experiences",
    profilePhoto: "",
    jobTitle: "Kumar",
    company: "Tech Corp",
  });

  const handleInputChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserData({
        ...userData,
        profilePhoto: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Updated data:', userData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-5 px-4 sm:px-6 lg:px-6">
      <div className="mx-auto">
        <h1 className="text-2xl text-gray-900 mb-5 flex items-center gap-3">
          <FiUser className="w-6 h-6 text-indigo-600" />
          <span>Account Settings</span>
        </h1>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-md p-6 sm:p-8">
          {/* Profile Section */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative group">
                {userData.profilePhoto ? (
                  <img
                    src={userData.profilePhoto}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <MdAccountCircle className="w-24 h-24 text-gray-400" />
                )}
                <label
                  htmlFor="profile-photo"
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <MdPhotoCamera className="w-8 h-8 text-white" />
                </label>
                <input
                  id="profile-photo"
                  type="file"
                  className="hidden"
                  onChange={handlePhotoChange}
                  accept="image/*"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{userData.name}</h2>
                <p className="text-gray-600">{userData.jobTitle}</p>
              </div>
            </div>
          </div>

          {/* Form Sections */}
          <div className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-indigo-600" />
                Personal Information
              </h3>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={userData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={userData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    placeholder="Enter your job title"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    name="bio"
                    value={userData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiBriefcase className="w-5 h-5 text-indigo-600" />
                Company Information
              </h3>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={userData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    placeholder="Enter company name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Work email</label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 cursor-not-allowed"
                    placeholder="Enter work email"
                  />
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiLock className="w-5 h-5 text-indigo-600" />
                Security
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Current password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">New password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3E98C7] text-white rounded-lg font-medium flex items-center gap-2 transition-transform hover:scale-[1.02]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
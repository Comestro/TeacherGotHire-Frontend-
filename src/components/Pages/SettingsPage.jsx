import { useEffect, useState } from "react";
import {
  MdAccountCircle,
  MdPhotoCamera,
  MdEmail,
  MdWork,
} from "react-icons/md";
import { FiUser, FiBriefcase, FiLock, FiSave } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { postBasic } from "../../features/personalProfileSlice";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { basicData } = useSelector((state) => state.personalProfile || {});
  const [userData, setUserData] = useState({
    user: {
      Fname: "",
      Lname: "",
      email: "",
    },
    phone_number: "",
    bio: "",
    profile_picture: null,
    date_of_birth: "",
    marital_status: "",
    gender: "",
    language: "",
  });

  // Initialize form data when basicData is available
  useEffect(() => {
    if (basicData) {
      setUserData({
        user: {
          id: basicData.user?.id || "",
          Fname: basicData.user?.Fname || "",
          Lname: basicData.user?.Lname || "",
          email: basicData.user?.email || "",
        },
        phone_number: basicData.phone_number || "",
        bio: basicData.bio || "",
        profile_picture: basicData.profile_picture,
        date_of_birth: basicData.date_of_birth || "",
        marital_status: basicData.marital_status || "",
        gender: basicData.gender || "",
        language: basicData.language || "",
      });
    }
  }, [basicData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested user object fields
    if (name.startsWith("user.")) {
      const userField = name.split(".")[1];
      setUserData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          [userField]: value
        }
      }));
    } else {
      setUserData({
        ...userData,
        [name]: value
      });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserData(prev => ({
        ...prev,
        profile_picture: file,
        profilePicturePreview: URL.createObjectURL(file), 
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
  
    formData.append("user.Fname", userData.user.Fname);
    formData.append("user.Lname", userData.user.Lname);
  
    formData.append("phone_number", userData.phone_number);
    formData.append("bio", userData.bio);
    formData.append("date_of_birth", userData.date_of_birth);
    formData.append("marital_status", userData.marital_status);
    formData.append("gender", userData.gender);
    formData.append("language", userData.language);
  
    if (userData.profile_picture instanceof File) {
      formData.append("profile_picture", userData.profile_picture);
    } else if (typeof userData.profile_picture === "string") {
      // formData.append("profile_picture", userData.profile_picture);
    }
  
    try {
      const result = await dispatch(postBasic(formData)).unwrap();
      console.log("Success:", result);
    } catch (error) {
      console.error("Error:", error);
    }
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
                {userData.profile_picture ? (
                  <img
                    src={userData.profile_picture}
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
                <h2 className="text-xl font-semibold text-gray-900">
                  {`${userData.user.Fname} ${userData.user.Lname}`}
                </h2>
                <p className="text-gray-600">{userData.user.email}</p>
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
                  <input
                    type="text"
                    name="user.Fname"
                    value={userData.user.Fname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="user.Lname"
                    value={userData.user.Lname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    placeholder="Enter your last name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={userData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={userData.date_of_birth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
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

            {/* Additional Fields */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiBriefcase className="w-5 h-5 text-indigo-600" />
                Additional Information
              </h3>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={userData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Marital Status</label>
                  <select
                    name="marital_status"
                    value={userData.marital_status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  >
                    <option value="">Select Marital Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Language</label>
                  <input
                    type="text"
                    name="language"
                    value={userData.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    placeholder="Preferred language"
                  />
                </div>
              </div>
            </div>

            {/* Security Section (keep as is) */}
            {/* ... existing security section ... */}
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
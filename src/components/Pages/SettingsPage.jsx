import { useEffect, useState } from "react";
import { MdAccountCircle, MdPhotoCamera } from "react-icons/md";
import { FiUser, FiBriefcase } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { getBasic, postBasic } from "../../features/personalProfileSlice";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { basicData, loading, error } = useSelector((state) => state.personalProfile || {});

  const [userData, setUserData] = useState({
    Fname: "",
    Lname: "",
    bio: "",
    phone_number: "",
    religion: "",
    profile_picture: null,
    marital_status: "",
    date_of_birth: "",
    gender: "",
    language: "",
  });

  useEffect(() => {
    dispatch(getBasic());
  }, [dispatch])


  useEffect(() => {
    if (basicData) {
      setUserData({
        Fname: basicData.user?.Fname || "",
        Lname: basicData.user?.Lname || "",
        email: basicData.user?.email || "",
        bio: basicData?.bio || "",
        phone_number: basicData?.phone_number || "",
        religion: basicData?.religion || "",
        profile_picture: basicData?.profile_picture || null,
        marital_status: basicData?.marital_status || "",
        date_of_birth: basicData?.date_of_birth || "",
        gender: basicData?.gender || "",
        language: basicData?.language || "",
      });
    }
  }, [basicData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserData((prev) => ({
        ...prev,
        profile_picture: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (key === "profile_picture" && value instanceof File) {
        formData.append(key, value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    try {
      const data = await dispatch(postBasic(formData)).unwrap();
      dispatch(getBasic());
    } catch (err) {
      console.log("error", err)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-5 px-4 sm:px-6 lg:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl text-gray-900 mb-5 flex items-center gap-3">
          <FiUser className="w-6 h-6 text-indigo-600" />
          <span>Account Settings</span>
        </h1>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-md p-6 sm:p-8">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative group">
                {userData.profile_picture ? (
                  <img
                    src={
                      userData.profile_picture instanceof File
                        ? URL.createObjectURL(userData.profile_picture)
                        : userData.profile_picture
                    }
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
                  {`${userData.Fname} ${userData.Lname}`}
                </h2>
                <p className="text-gray-500">{userData.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-indigo-600" />
                Personal Information
              </h3>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="Fname"
                    value={userData.Fname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="Lname"
                    value={userData.Lname}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Religion</label>
                  <input
                    type="text"
                    name="religion"
                    value={userData.religion}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                    placeholder="Your religion"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#3E98C7] text-white rounded-lg font-medium flex items-center gap-2 transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
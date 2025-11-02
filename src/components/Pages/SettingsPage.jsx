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
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 py-8 px-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-8xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#3E98C7]/10 to-[#67B3DA]/10 rounded-xl border border-[#3E98C7]/20">
            <FiUser className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Account Settings</h1>
          </div>
        </div>

        {error && (
          <div className="text-error mb-4">
            {typeof error === "string"
              ? error
              : error?.message || JSON.stringify(error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white  rounded-2xl p-8">
          <div className="mb-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-[#67B3DA] p-1 flex items-center justify-center">
                  {userData.profile_picture ? (
                    <img
                      src={
                        userData.profile_picture instanceof File
                          ? URL.createObjectURL(userData.profile_picture)
                          : userData.profile_picture
                      }
                      alt="Profile"
                      className="w-26 h-26 rounded-full object-cover border-4 border-white "
                    />
                  ) : (
                    <MdAccountCircle className="w-26 h-26 text-gray-300" />
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
                <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2  border-2 border-white">
                  <MdPhotoCamera className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text">
                  {`${userData.Fname} ${userData.Lname}`}
                </h2>
                <p className="text-secondary">{userData.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <FiUser className="w-5 h-5 text-primary" />
                Personal Information
              </h3>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary">First Name</label>
                  <input
                    type="text"
                    name="Fname"
                    value={userData.Fname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary transition-all outline-none text-sm"
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary">Last Name</label>
                  <input
                    type="text"
                    name="Lname"
                    value={userData.Lname}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary transition-all outline-none text-sm"
                    placeholder="Enter your last name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={userData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary transition-all outline-none text-sm"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={userData.date_of_birth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary transition-all outline-none text-sm"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-semibold text-secondary">Bio</label>
                  <textarea
                    name="bio"
                    value={userData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary transition-all outline-none text-sm"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <FiBriefcase className="w-5 h-5 text-primary" />
                Additional Information
              </h3>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary">Gender</label>
                  <select
                    name="gender"
                    value={userData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary transition-all outline-none text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary">Marital Status</label>
                  <select
                    name="marital_status"
                    value={userData.marital_status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary transition-all outline-none text-sm"
                  >
                    <option value="">Select Marital Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary">Language</label>
                  <input
                    type="text"
                    name="language"
                    value={userData.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary transition-all outline-none text-sm"
                    placeholder="Preferred language"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary">Religion</label>
                  <input
                    type="text"
                    name="religion"
                    value={userData.religion}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary transition-all outline-none text-sm"
                    placeholder="Your religion"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-2 border border-secondary/30 text-secondary hover:bg-secondary/10 font-medium rounded-lg transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg  transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
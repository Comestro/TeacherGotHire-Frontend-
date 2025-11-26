import { useEffect, useState, useRef } from "react";
import { MdAccountCircle, MdPhotoCamera, MdSave, MdCancel } from "react-icons/md";
import { FiUser, FiBriefcase, FiSettings, FiPhone, FiCalendar, FiGlobe, FiLock } from "react-icons/fi";
import { HiOutlineX, HiChevronDown } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { getBasic, postBasic } from "../../features/personalProfileSlice";
import { changePassword } from "../../services/authServices";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MultiSelect = ({ options, value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedValues = Array.isArray(value) ? value : (value ? String(value).split(',').map(v => v.trim()) : []);

  const handleSelect = (optionValue) => {
    if (!selectedValues.includes(optionValue)) {
      onChange([...selectedValues, optionValue]);
    }
    setIsOpen(false);
  };

  const handleRemove = (optionValue, e) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== optionValue));
  };

  return (
    <div className={`relative w-full ${className || ''}`} ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[42px] border border-slate-300 bg-white rounded-lg px-3 py-2 cursor-pointer flex flex-wrap gap-2 items-center hover:border-teal-500 transition-colors focus-within:ring-2 focus-within:ring-teal-500/20"
      >
        {selectedValues.length > 0 ? (
          selectedValues.map((val) => (
            <span
              key={val}
              className="bg-teal-50 text-teal-700 text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 border border-teal-100"
            >
              {val}
              <button
                type="button"
                onClick={(e) => handleRemove(val, e)}
                className="hover:text-teal-900 focus:outline-none"
              >
                <HiOutlineX className="w-3 h-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-slate-400 text-sm">Select languages...</span>
        )}
        <div className="ml-auto text-slate-400">
          <HiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options
            .filter((opt) => !selectedValues.includes(opt.value))
            .map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 cursor-pointer transition-colors"
              >
                {option.label}
              </div>
            ))}
          {options.filter((opt) => !selectedValues.includes(opt.value)).length === 0 && (
            <div className="px-3 py-2 text-sm text-slate-400 italic">
              No more options
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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
    language: [],
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const parseLanguage = (val) => {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      return [String(parsed)];
    } catch (e) {
      return String(val).split(',').map(v => v.trim());
    }
  };

  useEffect(() => {
    dispatch(getBasic());
  }, [dispatch]);

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
        language: parseLanguage(basicData?.language),
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

  const handleLanguageChange = (newLanguages) => {
    setUserData((prev) => ({
      ...prev,
      language: newLanguages,
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (key === "profile_picture" && value instanceof File) {
        formData.append(key, value);
      } else if (key === "language") {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    try {
      await dispatch(postBasic(formData)).unwrap();
      dispatch(getBasic());
      toast.success("Profile updated successfully");
    } catch (err) {
      console.log("error", err);
      toast.error("Failed to update profile");
    }
  };

  const languageOptions = [
    { value: "English", label: "English" },
    { value: "Hindi", label: "Hindi" },
    { value: "Bengali", label: "Bengali" },
    { value: "Telugu", label: "Telugu" },
    { value: "Tamil", label: "Tamil" },
    { value: "Urdu", label: "Urdu" },
    { value: "Other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-4xl mx-auto z-[999]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="p-2 bg-teal-100 rounded-lg text-teal-600">
              <FiSettings className="w-8 h-8" />
            </span>
            Account Settings
          </h1>
          <p className="mt-2 text-slate-500 ml-14">Manage your personal information and profile details.</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium"
          >
            {typeof error === "string" ? error : error?.message || "An error occurred"}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-teal-400 to-emerald-400">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white bg-slate-100 relative">
                    {userData.profile_picture ? (
                      <img
                        src={
                          userData.profile_picture instanceof File
                            ? URL.createObjectURL(userData.profile_picture)
                            : userData.profile_picture
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <MdAccountCircle className="w-full h-full" />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <label
                      htmlFor="profile-photo"
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <MdPhotoCamera className="w-8 h-8 text-white" />
                    </label>
                  </div>
                </div>
                <input
                  id="profile-photo"
                  type="file"
                  className="hidden"
                  onChange={handlePhotoChange}
                  accept="image/*"
                />
                <div className="absolute bottom-1 right-1 bg-teal-600 text-white p-2 rounded-full border-2 border-white shadow-sm">
                  <MdPhotoCamera className="w-4 h-4" />
                </div>
              </div>

              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-bold text-slate-800">
                  {userData.Fname || userData.Lname ? `${userData.Fname} ${userData.Lname}` : "Your Name"}
                </h2>
                <p className="text-slate-500 font-medium mb-4">{userData.email || "email@example.com"}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wide">
                    Teacher Account
                  </span>
                  {userData.language && Array.isArray(userData.language) && userData.language.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-1.5 bg-white border border-slate-200 rounded-lg text-teal-600 shadow-sm">
                <FiUser className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
            </div>

            <div className="p-6 sm:p-8 grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">First Name</label>
                <input
                  type="text"
                  name="Fname"
                  value={userData.Fname}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  placeholder="Enter first name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Last Name</label>
                <input
                  type="text"
                  name="Lname"
                  value={userData.Lname}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  placeholder="Enter last name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FiPhone className="w-4 h-4 text-slate-400" /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={userData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-slate-400" /> Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={userData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-sm text-slate-700"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Bio</label>
                <textarea
                  name="bio"
                  value={userData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-sm text-slate-700 placeholder:text-slate-400 resize-none"
                  placeholder="Tell us a bit about yourself..."
                />
                <p className="text-xs text-slate-400 text-right">Max 500 characters</p>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-1.5 bg-white border border-slate-200 rounded-lg text-teal-600 shadow-sm">
                <FiLock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Change Password</h3>
            </div>

            <div className="p-6 sm:p-8 grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  placeholder="Enter current password"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="button"
                  onClick={handlePasswordSubmit}
                  disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                >
                  {passwordLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FiLock className="w-4 h-4" />
                  )}
                  Update Password
                </button>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-1.5 bg-white border border-slate-200 rounded-lg text-teal-600 shadow-sm">
                <FiBriefcase className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Additional Details</h3>
            </div>

            <div className="p-6 sm:p-8 grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Gender</label>
                <div className="relative">
                  <select
                    name="gender"
                    value={userData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-sm text-slate-700 appearance-none bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Marital Status</label>
                <div className="relative">
                  <select
                    name="marital_status"
                    value={userData.marital_status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-sm text-slate-700 appearance-none bg-white"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FiGlobe className="w-4 h-4 text-slate-400" /> Language
                </label>
                <MultiSelect
                  className="z-[999]"
                  options={languageOptions}
                  value={userData.language}
                  onChange={handleLanguageChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Religion</label>
                <input
                  type="text"
                  name="religion"
                  value={userData.religion}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  placeholder="e.g. Hindu, Muslim, Christian"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              className="px-6 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-xl transition-all text-sm flex items-center gap-2"
            >
              <MdCancel className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <MdSave className="w-4 h-4" />
              )}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
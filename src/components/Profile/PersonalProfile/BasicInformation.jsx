import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateBasicProfile } from "../../../services/profileServices";
import { getBasic } from "../../../features/personalProfileSlice";
import { getUserData } from "../../../features/authSlice";
import Loader from "../../Loader";
import { HiOutlineUser, HiOutlinePencilAlt, HiOutlineCheck, HiOutlineX, HiChevronDown, HiCamera } from "react-icons/hi";
import ErrorMessage from "../../ErrorMessage";

// English -> Hindi label map
const hiLabels = {
  "Profile Picture": "प्रोफ़ाइल चित्र",
  "Basic Information": "मूलभूत जानकारी",
  "Full Name": "पूरा नाम",
  "Email Address": "ईमेल पता",
  "Contact No": "संपर्क नंबर",
  "Languages you can speek": "भाषाएँ जो आप बोल सकते हैं",
  "Gender": "लिंग",
  "Marital Status": "वैवाहिक स्थिति",
  "Religion": "धर्म",
  "Edit Profile": "प्रोफ़ाइल संपादित करें",
  "Save Changes": "परिवर्तन सहेजें",
  "Cancel": "रद्द करें",
  "Male": "पुरुष",
  "Female": "महिला",
  "Other": "अन्य",
  "Single": "अविवाहित",
  "Married": "विवाहित",
  "Divorced": "तलाकशुदा",
  "Widowed": "विधवा/विधुर",
  "English": "अंग्रेज़ी",
  "Hindi": "हिंदी",
};

const bi = (en) => (hiLabels[en] ? `${en} / ${hiLabels[en]}` : en);

const MultiSelect = ({ options, value, onChange, disabled }) => {
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
    if (!disabled) {
      onChange(selectedValues.filter((v) => v !== optionValue));
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`min-h-[42px] border rounded-lg px-3 py-2 flex flex-wrap gap-2 items-center transition-all ${disabled
          ? "bg-slate-50 border-slate-200 cursor-default"
          : "bg-white border-slate-300 cursor-pointer hover:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20"
          }`}
      >
        {selectedValues.length > 0 ? (
          selectedValues.map((val) => (
            <span
              key={val}
              className={`text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 border ${disabled
                ? "bg-slate-200 text-slate-600 border-slate-300"
                : "bg-teal-50 text-teal-700 border-teal-100"
                }`}
            >
              {val}
              {!disabled && (
                <button
                  onClick={(e) => handleRemove(val, e)}
                  className="hover:text-teal-900 focus:outline-none"
                >
                  <HiOutlineX className="w-3 h-3" />
                </button>
              )}
            </span>
          ))
        ) : (
          <span className="text-slate-400 text-sm">Select languages...</span>
        )}
        {!disabled && (
          <div className="ml-auto text-slate-400">
            <HiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fadeIn">
          {options
            .filter((opt) => !selectedValues.includes(opt.value))
            .map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 cursor-pointer transition-colors"
              >
                {bi(option.label)}
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

const BasicInformation = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state?.auth?.userData || {});
  const personalProfile = useSelector((state) => state?.personalProfile);
  const basicData = personalProfile?.basicData || {};

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [formData, setFormData] = useState({
    profile_picture: null,
    Fname: "",
    phone_number: "",
    language: [],
    gender: "",
    marital_status: "",
    religion: "",
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getBasic());
        setDataLoaded(true);
      } catch (error) {
        console.error("Error:", error);
        setDataLoaded(true);
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (dataLoaded) {
      setFormData({
        profile_picture: basicData.profile_picture,
        Fname: `${profile.Fname || ""} ${profile.Lname || ""}`.trim(),
        phone_number: basicData.phone_number || "",
        language: parseLanguage(basicData.language),
        gender: basicData.gender || "",
        marital_status: basicData.marital_status || "",
        religion: basicData.religion || "",
      });
      setPreviewImage(basicData.profile_picture);
    }
  }, [basicData, profile, dataLoaded]);

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profile_picture: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setGeneralError(null);
    setSuccessMessage(null);

    // Validation
    if (formData.phone_number && String(formData.phone_number).length !== 10) {
      setGeneralError("Please enter a valid 10-digit phone number / कृपया मान्य 10-अंकों का मोबाइल नंबर दर्ज करें");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();

      // Only append profile picture if it's a File object (newly uploaded)
      if (formData.profile_picture instanceof File) {
        data.append("profile_picture", formData.profile_picture);
      }

      const nameParts = formData.Fname.trim().split(/\s+/);
      data.append("Fname", nameParts[0] || "");
      data.append("Lname", nameParts.slice(1).join(" ") || "");

      data.append("phone_number", formData.phone_number);
      data.append("language", JSON.stringify(formData.language));
      data.append("gender", formData.gender);
      data.append("marital_status", formData.marital_status);
      data.append("religion", formData.religion);

      await updateBasicProfile(data);
      await dispatch(getBasic());
      await dispatch(getUserData());

      setSuccessMessage("Profile updated successfully! / प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!");
      setIsEditing(false);
    } catch (error) {
      const msg = error.response?.data?.message || "An error occurred. Please try again. / कोई त्रुटि हुई। कृपया पुनः प्रयास करें।";
      setGeneralError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setGeneralError(null);
    // Reset form data
    setFormData({
      profile_picture: basicData.profile_picture,
      Fname: `${profile.Fname || ""} ${profile.Lname || ""}`.trim(),
      phone_number: basicData.phone_number || "",
      language: parseLanguage(basicData.language),
      gender: basicData.gender || "",
      marital_status: basicData.marital_status || "",
      religion: basicData.religion || "",
    });
    setPreviewImage(basicData.profile_picture);
  };

  if (!dataLoaded) return <Loader />;

  return (
    <div className="w-full mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {loading && <Loader />}

      {/* Header */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
            <HiOutlineUser className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{bi("Basic Information")}</h2>
            <p className="text-slate-500 text-xs">Manage your personal details</p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-all text-sm font-medium shadow-sm"
          >
            <HiOutlinePencilAlt className="w-4 h-4" />
            {bi("Edit Profile")}
          </button>
        )}
      </div>

      <div className="p-6 sm:p-8">
        <ErrorMessage
          message={generalError}
          onDismiss={() => setGeneralError(null)}
          className="mb-6"
        />

        <ErrorMessage
          message={successMessage}
          type="success"
          onDismiss={() => setSuccessMessage(null)}
          className="mb-6"
        />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-1 ring-slate-100">
                <img
                  src={previewImage || "/images/profile.jpg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 p-2 bg-teal-600 text-white rounded-full cursor-pointer hover:bg-teal-700 shadow-md transition-transform hover:scale-105">
                  <HiCamera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            {isEditing && (
              <p className="text-xs text-slate-400 text-center max-w-[150px]">
                Click the camera icon to update your photo
              </p>
            )}
          </div>

          {/* Form Fields */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {bi("Full Name")}
              </label>
              <input
                type="text"
                value={formData.Fname}
                disabled={!isEditing}
                onChange={(e) => handleInputChange("Fname", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all ${isEditing
                  ? "bg-white border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  : "bg-slate-50 border-slate-200 text-slate-600 cursor-default"
                  }`}
                placeholder="Enter your full name"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {bi("Contact No")}
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                disabled={!isEditing}
                onChange={(e) => handleInputChange("phone_number", e.target.value.replace(/\D/g, "").slice(0, 10))}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all ${isEditing
                  ? "bg-white border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  : "bg-slate-50 border-slate-200 text-slate-600 cursor-default"
                  }`}
                placeholder="10-digit mobile number"
              />
            </div>

            {/* Email (Read Only) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {bi("Email Address")}
              </label>
              <input
                type="email"
                value={profile.email || ""}
                disabled={true}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed text-sm"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {bi("Gender")}
              </label>
              <select
                value={formData.gender}
                disabled={!isEditing}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all appearance-none ${isEditing
                  ? "bg-white border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  : "bg-slate-50 border-slate-200 text-slate-600 cursor-default"
                  }`}
              >
                <option value="">Select Gender</option>
                <option value="male">{bi("Male")}</option>
                <option value="female">{bi("Female")}</option>
                <option value="other">{bi("Other")}</option>
              </select>
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {bi("Marital Status")}
              </label>
              <select
                value={formData.marital_status}
                disabled={!isEditing}
                onChange={(e) => handleInputChange("marital_status", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all appearance-none ${isEditing
                  ? "bg-white border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  : "bg-slate-50 border-slate-200 text-slate-600 cursor-default"
                  }`}
              >
                <option value="">Select Status</option>
                <option value="single">{bi("Single")}</option>
                <option value="married">{bi("Married")}</option>
                <option value="divorced">{bi("Divorced")}</option>
                <option value="widowed">{bi("Widowed")}</option>
              </select>
            </div>

            {/* Religion */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {bi("Religion")}
              </label>
              <select
                value={formData.religion}
                disabled={!isEditing}
                onChange={(e) => handleInputChange("religion", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all appearance-none ${isEditing
                  ? "bg-white border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  : "bg-slate-50 border-slate-200 text-slate-600 cursor-default"
                  }`}
              >
                <option value="">Select Religion</option>
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Christian">Christian</option>
                <option value="Sikh">Sikh</option>
                <option value="Buddhist">Buddhist</option>
                <option value="Other">{bi("Other")}</option>
              </select>
            </div>

            {/* Languages */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {bi("Languages you can speek")} 
              </label>
              <MultiSelect
                value={formData.language}
                onChange={(val) => handleInputChange("language", val)}
                disabled={!isEditing}
                options={[
                  { value: "English", label: "English" },
                  { value: "Hindi", label: "Hindi" },
                  { value: "Bengali", label: "Bengali" },
                  { value: "Telugu", label: "Telugu" },
                  { value: "Tamil", label: "Tamil" },
                  { value: "Urdu", label: "Urdu" },
                  { value: "Other", label: "Other" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3 animate-fadeIn">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              {bi("Cancel")}
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all hover:-translate-y-0.5"
            >
              {bi("Save Changes")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInformation;

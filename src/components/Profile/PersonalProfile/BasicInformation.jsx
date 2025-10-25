import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateBasicProfile } from "../../../services/profileServices";
import { getBasic, postBasic } from "../../../features/personalProfileSlice";
import { getUserData } from "../../../features/authSlice";
import Loader from "../../Loader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HiOutlineUser, HiOutlinePencilAlt, HiOutlineCheck, HiOutlineX } from "react-icons/hi";

// English -> Hindi label map
const hiLabels = {
  Profile: "प्रोफ़ाइल",
  "Basic Information": "मूलभूत जानकारी",
  Name: "नाम",
  "Email Address": "ईमेल पता",
  "Contact No": "संपर्क नंबर",
  Language: "भाषा",
  Gender: "लिंग",
  "Marital Status": "वैवाहिक स्थिति",
  Religion: "धर्म",
  Edit: "संपादित करें",
  Cancel: "रद्द करें",
  Save: "सहेजें",
  "Edit Profile": "प्रोफ़ाइल संपादित करें",
  Male: "पुरुष",
  Female: "महिला",
  Other: "अन्य",
  Single: "अविवाहित",
  Married: "विवाहित",
  Unmarried: "अनविवाहित",
  English: "अंग्रेज़ी",
  Hindi: "हिंदी",
};

const bi = (en) => (hiLabels[en] ? `${en} / ${hiLabels[en]}` : en);

const EditableField = ({
  label,
  value,
  isEditing,
  onToggleEdit,
  onSave,
  field,
  inputType = "text",
  options = [],
  error,
}) => {
  const [tempValue, setTempValue] = useState(value || "");

  useEffect(() => {
    setTempValue(value || "");
  }, [value]);

  const handleCancel = () => {
    setTempValue(value || "");
    onToggleEdit(false);
  };

  const handleSave = () => {
    if (field === "phone_number" && tempValue && String(tempValue).length !== 10) {
      toast.error(
        "Please enter a valid 10-digit phone number / कृपया मान्य 10-अंकों का मोबाइल नंबर दर्ज करें"
      );
      return;
    }
    onSave(tempValue);
  };

  const renderValue = () => {
    if (inputType === "file") {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex flex-col items-center sm:flex-row sm:items-center">
            <img
              src={value || "/images/profile.jpg"}
              alt="Profile"
              className="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200"
            />
            <button
              onClick={() => onToggleEdit(true)}
              className="mt-2 sm:mt-0 sm:ml-3 text-sm text-[#3E98C7] bg-transparent hover:underline sm:hidden font-medium"
            >
              {bi("Edit Profile")}
            </button>
          </div>
        </div>
      );
    }
    return <p className="text-gray-700 text-sm sm:text-base break-words">{value || "N/A"}</p>;
  };

  const renderEditor = () => {
    if (inputType === "select") {
      return (
        <select
          value={tempValue || ""}
          onChange={(e) => setTempValue(e.target.value)}
          className="border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3E98C7] focus:border-[#3E98C7] w-full sm:w-64 lg:w-80 text-sm sm:text-base"
        >
          <option value="">{`Select ${bi(label)}`}</option>
          {(options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {bi(option.label)}
            </option>
          ))}
        </select>
      );
    }
    if (inputType === "file") {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setTempValue(e.target.files && e.target.files[0])}
            className="border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3E98C7] focus:border-[#3E98C7] w-full sm:w-64 lg:w-80 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#3E98C7]/10 file:text-[#2E87A7] hover:file:bg-[#3E98C7]/20"
          />
          {tempValue && tempValue instanceof File && (
            <div className="flex items-center gap-2">
              <img
                src={URL.createObjectURL(tempValue)}
                alt="Preview"
                className="w-12 h-12 rounded-full object-cover border-2 border-teal-200"
              />
              <span className="text-xs text-gray-500">{tempValue.name}</span>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="flex flex-col w-full sm:w-auto">
        <input
          type={inputType}
          value={tempValue || ""}
          placeholder={`Enter ${label} / ${hiLabels[label] || ""}`}
          onChange={(e) => {
            if (field === "phone_number") {
              setTempValue(e.target.value.replace(/\D/g, "").slice(0, 10));
            } else {
              setTempValue(e.target.value);
            }
          }}
          className={`border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3E98C7] focus:border-[#3E98C7] w-full sm:w-64 lg:w-80 text-sm sm:text-base ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
        {error && <p className="text-red-500 text-xs sm:text-sm mt-1">{error}</p>}
      </div>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-4 gap-3 sm:gap-0">
      <div className="flex flex-col sm:flex-row sm:items-center flex-1 min-w-0">
        <div className="flex items-center mb-2 sm:mb-0">
          <p className="text-gray-700 font-medium w-full sm:w-48 lg:w-64 text-sm sm:text-base truncate">
            {bi(label)}:
          </p>
        </div>
        {!isEditing ? renderValue() : renderEditor()}
      </div>
      {field !== "email" && (
        <div className="flex justify-end sm:justify-start space-x-2 mt-2 sm:mt-0">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-3 py-2 text-xs sm:text-sm text-gray-700 font-semibold bg-white border-2 border-gray-300 hover:border-gray-400 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                <HiOutlineX className="w-4 h-4" />
                {bi("Cancel")}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] hover:from-[#2A6476] hover:to-[#3E98C7] rounded-lg shadow-md hover:shadow-xl transition-all flex items-center gap-2"
              >
                <HiOutlineCheck className="w-4 h-4" />
                {bi("Save")}
              </button>
            </>
          ) : (
            <button
              onClick={() => onToggleEdit(true)}
              className="text-gray-700 font-medium text-xs sm:text-sm px-3 sm:px-4 border-2 border-gray-200 py-1.5 sm:py-1 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <HiOutlinePencilAlt className="w-4 h-4" />
              {label === "Profile" ? bi("Edit Profile") : bi("Edit")}
            </button>
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

  const [errors, setErrors] = useState({});
  const [editingFields, setEditingFields] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(getBasic()).catch((error) => console.error("Error:", error));
  }, [dispatch]);

  const toggleEditingField = (field, state) => {
    setEditingFields((prev) => ({ ...prev, [field]: state }));
    if (!state) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async (field, value) => {
    setLoading(true);
    setErrors((prev) => ({ ...prev, [field]: "" }));

    try {
      const data = new FormData();
      if (field === "profile_picture" && value instanceof File) {
        data.append(field, value);
      } else if (field === "Fname") {
        // Split full name into first and last name
        const nameParts = value.trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        data.append("Fname", firstName);
        data.append("Lname", lastName);
      } else {
        data.append(field, value);
      }

      await updateBasicProfile(data);

      // Refetch data to ensure consistency
      await dispatch(getBasic());
      
      // If name was updated, refresh user data from auth
      if (field === "Fname") {
        await dispatch(getUserData());
      }

      toast.success("Updated successfully! / सफलतापूर्वक अपडेट किया गया!");
      toggleEditingField(field, false);
    } catch (error) {
      if (error.response?.data?.[field]) {
        const fieldError = Array.isArray(error.response.data[field])
          ? error.response.data[field][0]
          : error.response.data[field];
        setErrors((prev) => ({ ...prev, [field]: fieldError }));
        toast.error(fieldError);
      } else {
        toast.error(
          "An error occurred. Please try again. / कोई त्रुटि हुई। कृपया पुनः प्रयास करें।"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      label: "Profile",
      field: "profile_picture",
      inputType: "file",
      value: basicData.profile_picture,
    },
    {
      label: "Name",
      field: "Fname",
      value: `${profile.Fname || ""} ${profile.Lname || ""}`.trim(),
    },
    {
      label: "Email Address",
      field: "email",
      value: profile.email,
      inputType: "email",
    },
    {
      label: "Contact No",
      field: "phone_number",
      value: basicData.phone_number,
      inputType: "tel",
    },
    {
      label: "Language",
      field: "language",
      value: basicData.language,
      inputType: "select",
      options: [
        { value: "English", label: "English" },
        { value: "Hindi", label: "Hindi" },
      ],
    },
    {
      label: "Gender",
      field: "gender",
      value: basicData.gender,
      inputType: "select",
      options: [
        { label: "Select Gender", value: "" },
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
      ],
    },
    {
      label: "Marital Status",
      field: "marital_status",
      value: basicData.marital_status,
      inputType: "select",
      options: [
        { label: "Select Category", value: "" },
        { label: "Single", value: "single" },
        { label: "Married", value: "married" },
        { label: "Unmarried", value: "unmarried" },
      ],
    },
    {
      label: "Religion",
      field: "religion",
      inputType: "select",
      value: basicData.religion,
      options: [
        { label: "Select Category", value: "" },
        { label: "Hindu", value: "Hindu" },
        { label: "Muslim", value: "Muslim" },
        { label: "Sikh", value: "Sikh" },
        { label: "Christian", value: "Christian" },
        { label: "Other", value: "Other" },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
      <ToastContainer
        position="top-right"
        autoClose={1000}
        closeButton={true}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {loading && <Loader />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b-2 border-[#3E98C7]/20 px-6 pt-6">
        <div className="mb-2 sm:mb-0">
          <h2 className="text-xl sm:text-2xl font-bold text-[#3E98C7] flex items-center gap-2">
            <HiOutlineUser className="w-7 h-7 text-[#3E98C7]" />
            {bi("Basic Information")}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage your basic profile details / अपनी बुनियादी प्रोफ़ाइल जानकारी प्रबंधित करें
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-1">
        {fields.map((f) => (
          <React.Fragment key={f.field}>
            <EditableField
              label={f.label}
              field={f.field}
              value={f.value}
              isEditing={!!editingFields[f.field]}
              onToggleEdit={(state) => toggleEditingField(f.field, state)}
              onSave={(v) => handleSave(f.field, v)}
              inputType={f.inputType}
              options={f.options}
              error={errors[f.field]}
            />
            <hr className="border-[#3E98C7]/10" />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BasicInformation;

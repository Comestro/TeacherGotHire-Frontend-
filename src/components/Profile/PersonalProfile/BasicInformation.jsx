import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateBasicProfile } from "../../../services/profileServices";
import { getBasic } from "../../../features/personalProfileSlice";
import { getUserData } from "../../../features/authSlice";
import Loader from "../../Loader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HiOutlineUser, HiOutlinePencilAlt, HiOutlineCheck, HiOutlineX, HiChevronDown } from "react-icons/hi";
import ErrorMessage from "../../ErrorMessage";

// English -> Hindi label map
const hiLabels = {
  "Profile Picture": "प्रोफ़ाइल चित्र",
  "Basic Information": "मूलभूत जानकारी",
  Name: "नाम",
  "Email Address": "ईमेल पता",
  "Contact No": "संपर्क नंबर",
  "Languages you speak/understand": "भाषाएँ जो आप बोल/समझ सकते हैं",
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

const MultiSelect = ({ options, value, onChange }) => {
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
    <div className="relative w-full sm:w-64" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[38px] border border-slate-300 bg-white rounded-lg px-2 py-1.5 cursor-pointer flex flex-wrap gap-2 items-center hover:border-teal-500 transition-colors"
      >
        {selectedValues.length > 0 ? (
          selectedValues.map((val) => (
            <span
              key={val}
              className="bg-teal-50 text-teal-700 text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 border border-teal-100"
            >
              {val}
              <button
                onClick={(e) => handleRemove(val, e)}
                className="hover:text-teal-900 focus:outline-none"
              >
                <HiOutlineX className="w-3 h-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-slate-400 text-sm px-1">Select languages...</span>
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
        <div className="flex items-center gap-4">
          <img
            src={value || "/images/profile.jpg"}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border border-slate-200"
          />
          <button
            onClick={() => onToggleEdit(true)}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium sm:hidden"
          >
            {bi("Edit Profile")}
          </button>
        </div>
      );
    }
    if (inputType === "multi-select") {
      const vals = Array.isArray(value) ? value : (value ? String(value).split(',') : []);
      return (
        <div className="flex flex-wrap gap-2">
          {vals.length > 0 ? vals.map((v, i) => (
            <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md border border-slate-200">
              {v.trim()}
            </span>
          )) : <span className="text-slate-400 text-sm">N/A</span>}
        </div>
      );
    }
    return <p className={`text-slate-700 text-sm sm:text-base ${label !== "Email Address" ? "capitalize" : ""}`}>{value || "N/A"}</p>;
  };

  const renderEditor = () => {
    if (inputType === "multi-select") {
      return (
        <MultiSelect
          options={options}
          value={tempValue}
          onChange={setTempValue}
        />
      );
    }
    if (inputType === "select") {
      return (
        <select
          value={tempValue || ""}
          onChange={(e) => setTempValue(e.target.value)}
          className="border border-slate-300 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-full sm:w-64 text-sm"
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
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
          />
          {tempValue && tempValue instanceof File && (
            <div className="flex items-center gap-2">
              <img
                src={URL.createObjectURL(tempValue)}
                alt="Preview"
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <span className="text-xs text-slate-500 truncate max-w-[150px]">{tempValue.name}</span>
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
          className={`border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-full sm:w-64 text-sm ${error ? "border-red-500" : "border-slate-300"
            }`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-colors hover:bg-slate-50">
      <div className="flex flex-col sm:flex-row sm:items-center flex-1 min-w-0 gap-2 sm:gap-4">
        <div className="w-full sm:w-48 lg:w-64 shrink-0">
          <p className="text-slate-500 font-medium text-sm uppercase tracking-wide">
            {bi(label)}
          </p>
        </div>
        <div className="flex-1">
          {!isEditing ? renderValue() : renderEditor()}
        </div>
      </div>

      {field !== "email" && (
        <div className="flex justify-end sm:justify-start shrink-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title={bi("Cancel")}
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                title={bi("Save")}
              >
                <HiOutlineCheck className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onToggleEdit(true)}
              className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              title={label === "Profile" ? bi("Edit Profile") : bi("Edit")}
            >
              <HiOutlinePencilAlt className="w-5 h-5" />
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
  const [dataLoaded, setDataLoaded] = useState(false);
  const [generalError, setGeneralError] = useState(null);

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
    return () => {
      setEditingFields({});
    };
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      setEditingFields({});
    }
  }, [basicData, dataLoaded]);

  const toggleEditingField = (field, state) => {
    setEditingFields((prev) => ({ ...prev, [field]: state }));
    if (!state) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async (field, value) => {
    setLoading(true);
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setGeneralError(null);

    try {
      const data = new FormData();
      if (field === "profile_picture" && value instanceof File) {
        data.append(field, value);
      } else if (field === "Fname") {
        const nameParts = value.trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        data.append("Fname", firstName);
        data.append("Lname", lastName);
      } else if (field === "language" && Array.isArray(value)) {
        // Store as JSON string
        data.append(field, JSON.stringify(value));
      } else {
        data.append(field, value);
      }

      await updateBasicProfile(data);
      await dispatch(getBasic());

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
        const msg = "An error occurred. Please try again. / कोई त्रुटि हुई। कृपया पुनः प्रयास करें।";
        setGeneralError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const parseLanguage = (val) => {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      return [String(parsed)];
    } catch (e) {
      // Fallback to comma-separated
      return String(val).split(',').map(v => v.trim());
    }
  };

  const fields = [
    {
      label: "Profile Picture",
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
      label: "Contact No",
      field: "phone_number",
      value: basicData.phone_number,
      inputType: "tel",
    },
    {
      label: "Languages you speak/understand",
      field: "language",
      value: parseLanguage(basicData.language),
      inputType: "multi-select",
      options: [
        { value: "English", label: "English" },
        { value: "Hindi", label: "Hindi" },
        { value: "Bengali", label: "Bengali" },
        { value: "Telugu", label: "Telugu" },
        { value: "Tamil", label: "Tamil" },
        { value: "Urdu", label: "Urdu" },
        { value: "Other", label: "Other" },
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
        { label: "Divorced", value: "divorced" },
        { label: "Widowed", value: "widowed" },
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
        { label: "Christian", value: "Christian" },
        { label: "Sikh", value: "Sikh" },
        { label: "Buddhist", value: "Buddhist" },
        { label: "Other", value: "Other" },
      ],
    },
  ];

  if (!dataLoaded) {
    return <Loader />;
  }

  return (
    <div className="w-full mx-auto">
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
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
          <span className="p-2 bg-teal-50 rounded-lg text-teal-600">
            <HiOutlineUser className="w-6 h-6" />
          </span>
          {bi("Basic Information")}
        </h2>
        <p className="text-slate-500 ml-12 text-sm">
          Manage your basic profile details / अपनी बुनियादी प्रोफ़ाइल जानकारी प्रबंधित करें
        </p>
      </div>

      <ErrorMessage
        message={generalError}
        onDismiss={() => setGeneralError(null)}
        className="mb-6"
      />

      <div className="space-y-4">
        {fields.map((f) => (
          <EditableField
            key={f.field}
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
        ))}
      </div>
    </div>
  );
};

export default BasicInformation;

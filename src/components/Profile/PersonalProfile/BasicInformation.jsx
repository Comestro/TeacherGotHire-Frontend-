import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateBasicProfile } from "../../../services/profileServices";
import { getBasic, postBasic } from "../../../features/personalProfileSlice";
import { BsFillPersonFill } from "react-icons/bs";
import Loader from "../../Loader";
import Heading from "../../commons/Heading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    if (field === "phone_number" && tempValue && tempValue.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    onSave(tempValue);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-4 gap-3 sm:gap-0">
      <div className="flex flex-col sm:flex-row sm:items-center flex-1 min-w-0">
        {label !== "Profile" && (
          <div className="flex items-center mb-2 sm:mb-0">
            <p className="text-gray-700 font-medium w-full sm:w-32 lg:w-40 text-sm sm:text-base truncate">
              {label}:
            </p>
          </div>
        )}
        {field === "profile_picture" && (
          <div className="hidden sm:block sm:mr-4">
            <p className="text-gray-700 font-medium w-32 lg:w-40 truncate">
              {label}:
            </p>
          </div>
        )}
        {!isEditing ? (
          inputType === "file" ? (
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
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-sm sm:text-base break-words">{value || "N/A"}</p>
          )
        ) : inputType === "select" ? (
          <select
            value={tempValue || ""}
            onChange={(e) => setTempValue(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-full sm:w-64 lg:w-80 text-sm sm:text-base"
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : inputType === "file" ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setTempValue(e.target.files[0])}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-full sm:w-64 lg:w-80 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
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
        ) : (
          <div className="flex flex-col w-full sm:w-auto">
            <input
              type={inputType}
              value={tempValue || ""}
              placeholder={`Enter ${label}`}
              onChange={(e) => {
                if (field === "phone_number") {
                  setTempValue(e.target.value.replace(/\D/g, '').slice(0, 10));
                } else {
                  setTempValue(e.target.value);
                }
              }}
              className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-full sm:w-64 lg:w-80 text-sm sm:text-base ${
                error ? "border-red-500" : "border-gray-300"
              }`}
            />
            {error && <p className="text-red-500 text-xs sm:text-sm mt-1">{error}</p>}
          </div>
        )}
      </div>
      {field !== "email" && field !== "Fname" && (
        <div className="flex justify-end sm:justify-start space-x-2 mt-2 sm:mt-0">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-3 py-2 text-xs sm:text-sm text-gray-700 font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-xs sm:text-sm text-white bg-[#3E98C7] rounded-lg hover:bg-[#2E87A7] transition-colors font-medium"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => onToggleEdit(true)}
              className="text-gray-500 rounded-full hover:bg-gray-50 transition-colors"
            >
              {label === "Profile" ? (
                <div className="text-[#3E98C7] hover:bg-none mr-4 hidden sm:block font-medium text-sm">
                  edit profile
                </div>
              ) : (
                <div className="flex items-center justify-center text-gray-700 font-medium text-xs sm:text-sm px-3 sm:px-4 border-2 border-gray-200 py-1.5 sm:py-1 rounded-lg hover:bg-gray-50 transition-colors">
                  Edit
                </div>
              )}
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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    dispatch(getBasic()).catch((error) => console.error("Error:", error));
  }, [dispatch, refreshKey]);

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
      if (field === "profile_image" && value instanceof File) {
        data.append(field, value);
      } else {
        data.append(field, value);
      }

      await updateBasicProfile(data);
      
      // Update local state immediately for better UX
      dispatch(postBasic({ [field]: value }));
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refetch data to ensure consistency
      await dispatch(getBasic());
      
      // Force component refresh
      setRefreshKey(prev => prev + 1);
      
      toast.success("Updated successfully!");
      toggleEditingField(field, false);
    } catch (error) {
      if (error.response?.data?.[field]) {
        const fieldError = Array.isArray(error.response.data[field])
          ? error.response.data[field][0]
          : error.response.data[field];
        setErrors((prev) => ({ ...prev, [field]: fieldError }));
        toast.error(fieldError);
      } else {
        toast.error("An error occurred. Please try again.");
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
      value: profile.Fname + " " + profile.Lname,
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
    <div className="p-4 sm:p-6 mt-2 bg-white border border-gray-200 rounded-xl shadow-sm">
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
      <div className="mb-6">
        <Heading icons={<BsFillPersonFill />} title="Basic Information" />
      </div>
      <div className="space-y-1">
        {fields.map((field) => (
          <React.Fragment key={field.field}>
            <EditableField
              label={field.label}
              field={field.field}
              value={field.value}
              isEditing={editingFields[field.field]}
              onToggleEdit={(state) => toggleEditingField(field.field, state)}
              onSave={(value) => handleSave(field.field, value)}
              inputType={field.inputType}
              options={field.options}
              error={errors[field.field]}
            />
            <hr className="border-gray-100" />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BasicInformation;

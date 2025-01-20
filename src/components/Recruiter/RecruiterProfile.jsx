import React, { useEffect, useState } from "react";
import { HiCheck, HiPencil, HiX } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { getBasic, postBasic } from "../../features/personalProfileSlice";
// import { updateAddressProfile } from "../../services/profileServices";

const EditableField = ({
  label,
  value,
  isEditing,
  onToggleEdit,
  onSave,
  field,
  inputType = "text",
  options = [],
}) => {
  const [tempValue, setTempValue] = useState(value);

  const handleCancel = () => {
    setTempValue(value);
    onToggleEdit(false);
  };

  const handleSave = () => {
    onSave(tempValue);
    onToggleEdit(false);
  };

  const handleFileChange = (e) => {
    setTempValue(e.target.files[0]);
  };

  return (
    <div className="flex justify-between items-center py-2">
      <div className="flex flex-col md:flex-row md:items-center gap-6 ">
        <p className="text-gray-700 font-medium w-32">{label}:</p>
        {!isEditing ? (
          <p className="text-gray-600">{value || "N/A"}</p>
        ) : inputType === "select" ? (
          <select
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : inputType === "file" ? (
          <input
            type="file"
            onChange={handleFileChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        ) : (
          <input
            type={inputType}
            value={tempValue}
            placeholder={"Type " + label}
            onChange={(e) => setTempValue(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        )}
      </div>
      {field !== "email" && field !== "Fname" && (
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-5 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
              >
                <HiX />
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
              >
                <HiCheck />
              </button>
            </>
          ) : (
            <button
              onClick={() => onToggleEdit(true)}
              className="text-gray-500 p-2 hover:bg-[#E5F1F9] rounded-full"
            >
              <HiPencil className="size-5 text-[#3E98C7]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const RecruiterProfile = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state?.auth?.userData || {});
  const personalProfile = useSelector((state) => state?.personalProfile);
  const basicData = personalProfile?.basicData || {};

  const [error, setError] = useState("");
  const [editingFields, setEditingFields] = useState({});

  useEffect(() => {
    dispatch(getBasic()).catch((error) => console.log("error", error));
  }, [dispatch]);

  const toggleEditingField = (field, state) => {
    setEditingFields((prev) => ({ ...prev, [field]: state }));
  };

  const handleSave = async (field, newValue) => {
    try {
      if (field === "profile_image" && newValue instanceof File) {
        // Handle file upload separately if it's the profile image
        // Call the appropriate service to handle file upload.
        // updateProfileImage(newValue);
      } else {        
        dispatch(postBasic({ [field]: newValue }));
        dispatch(getBasic());
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const fields = [
    {
      label: "Name",
      field: "Fname",
      value: profile.Fname + " " + profile.Lname,
    },
    {
      label: "Email address",
      field: "email",
      value: profile.email,
      inputType: "email",
    },
    {
      label: "Contact Number",
      field: "phone_number",
      value: basicData.phone_number,
    },
    {
      label: "Language",
      field: "language",
      value: basicData.language,
      inputType: "select",
      options: [
        { label: "Hindi", value: "hindi" },
        { label: "English", value: "english" },
        { label: "Other", value: "other" },
      ],
    },
    {
      label: "Marital Status",
      field: "marital_status",
      value: basicData.marital_status,
      inputType: "select",
      options: [
        { label: "Single", value: "single" },
        { label: "Married", value: "married" },
        { label: "Unmarried", value: "unmarried" },
      ],
    },
    {
      label: "Religion",
      field: "religion",
      value: basicData.religion,
      inputType: "select",
      options: [
        { label: "Hindu", value: "hindu" },
        { label: "Muslim", value: "muslim" },
        { label: "Sikh", value: "sikh" },
        { label: "Christian", value: "christian" },
        { label: "Other", value: "other" },
      ],
    },
    {
      label: "Profile Image",
      field: "profile_image",
      inputType: "file",
      value: basicData.profile_image || "",
    },
  ];

  return (
    <div className="px-14 py-6 w-full">
      <div className="md:px-5 mt-2 flex flex-col gap-1">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Recruiter Profile</h2>
        {error && <div className="text-red-500">{error}</div>}
        <div className="space-y-2">
          {fields.map(({ label, field, value, inputType, options }) => (
            <React.Fragment key={field}>
              <EditableField
                key={field}
                label={label}
                field={field}
                value={value}
                isEditing={editingFields[field]}
                onToggleEdit={(state) => toggleEditingField(field, state)}
                onSave={(newValue) => handleSave(field, newValue)}
                inputType={inputType}
                options={options}
              />
              <hr />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfile;

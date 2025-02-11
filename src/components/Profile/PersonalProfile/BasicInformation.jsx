import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateBasicProfile } from "../../../services/profileServices";
import { getBasic, postBasic } from "../../../features/personalProfileSlice";
import { BsFillPersonFill } from "react-icons/bs";

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

  return (
    <div className="flex justify-between items-center py-2 ">
      <div className="flex  md:items-center">
        {label !== "Profile" && (
          <div className="flex items-center">
            <p className="text-gray-700 font-medium w-24 md:w-40 truncate">
              {label}:
            </p>
          </div>
        )}
        {field === "profile_picture" && (
          <div className="hidden md:block">
            <p className="text-gray-700 font-medium w-24 md:w-40 truncate">
              {label}:
            </p>
          </div>
        )}
        {!isEditing ? (
          inputType === "file" ? (
            <div className="flex flex-col items-center md:flex-row md:items-start w-80 mt-1 mb-3 md:mb-1">
              <div className=""> 
                <img
                  src={value || "/images/profile.jpg"}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <button
                  onClick={() => onToggleEdit(true)}
                  className="mt-2 text-sm text-[#3E98C7] bg-transparent hover:underline md:hidden"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">{value || "N/A"}</p>
          )
        ) : inputType === "select" ? (
          <select
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500  md:min-w-60"
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
            accept="image/*"
            onChange={(e) => setTempValue(e.target.files[0])}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 w-60 md:w-full"
          />
        ) : (
          <input
            type={inputType}
            value={tempValue}
            placeholder={"Type " + label}
            onChange={(e) => setTempValue(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 w-60"
          />
        )}
      </div>
      {field !== "email" && field !== "Fname" && (
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm text-gray-700 font-semibold border-[1.5px] border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 text-sm text-white bg-[#3E98C7] rounded"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => onToggleEdit(true)}
              className="text-gray-500 rounded-full"
            >
              {label === "Profile" ? (
                <div className="text-[#3E98C7] hover:bg-none mr-4 hidden md:block">
                  edit profile
                </div>
              ) : (
                <div className="flex items-center justify-center text-gray-700 font-medium text-sm px-4 border-[1.5px] border-gray-200 py-1 rounded-lg md:mr-4">
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

  const [error, setError] = useState("");
  const [editingFields, setEditingFields] = useState({});

  useEffect(() => {
    dispatch(getBasic()).catch((error) => console.error("Error:", error));
  }, [dispatch]);

  const toggleEditingField = (field, state) => {
    setEditingFields((prev) => ({ ...prev, [field]: state }));
  };

  const handleSave = async (field, value) => {
    try {
      const data = new FormData();
      if (field === "profile_image" && value instanceof File) {
        data.append(field, value);
      } else {
        data.append(field, value);
      }

      console.log("checking for file upload", data);
      await updateBasicProfile(data);
      dispatch(postBasic({ [field]: value }));
      dispatch(getBasic());
    } catch (error) {
      setError(error.message);
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
      label: "Email Adds",
      field: "email",
      value: profile.email,
      inputType: "email",
    },
    {
      label: "Contact No",
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
        { label: "English", value: "English" },
        { label: "Other", value: "Other" },
      ],
    },
    {
      label: "Status",
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
    <div className="md:px-5 mt-2 flex flex-col gap-1">
      <h2 className="text-[20px] font-bold mb-4 text-[#3E98C7] flex items-center gap-1">
        <BsFillPersonFill /> Basic Information
      </h2>
      {fields.map(({ label, field, value, inputType, options }) => (
        <React.Fragment key={field}>
          <EditableField
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
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default BasicInformation;

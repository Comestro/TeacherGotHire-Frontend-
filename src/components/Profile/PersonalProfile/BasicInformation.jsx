import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateBasicProfile } from "../../../services/profileServices";
import { getBasic, postBasic } from "../../../features/personalProfileSlice";
import { HiCheck, HiPencil, HiX } from "react-icons/hi";

const EditableField = ({
  label,
  value,
  isEditing,
  onToggleEdit,
  onSave,
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
    <div className="flex justify-between items-center py-3">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
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
        ) : (
          <input
            type={inputType}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        )}
      </div>
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
            className="text-gray-500 px-2 py-1 hover:bg-slate-200 rounded-md"
          >
            <HiPencil />
          </button>
        )}
      </div>
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
      await updateBasicProfile({ [field]: value });
      dispatch(postBasic({ [field]: value }));
      dispatch(getBasic());
    } catch (error) {
      setError(error.message);
    }
  };

  const fields = [
    { label: "Name", field: "Fname", value: profile.Fname },
    {
      label: "Email Address",
      field: "email",
      value: profile.email,
      inputType: "email",
    },
    {
      label: "Contact Number",
      field: "phone_number",
      value: basicData.phone_number,
    },
    { label: "Language", field: "language", value: basicData.language },
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
    { label: "Religion", field: "religion", value: basicData.religion },
  ];

  return (
    <div className="md:px-5 mt-2 flex flex-col gap-1">
      <h2 className="text-xl font-bold mb-4 text-gray-700">
        Basic Information
      </h2>
      {fields.map(({ label, field, value, inputType, options }) => (
        <React.Fragment key={field}>
          <EditableField
            label={label}
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

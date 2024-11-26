

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addEducation, updateEducation, removeEducation } from "../store/jobProfileSlice";
import { FiEdit2 } from "react-icons/fi";

const Education = () => {
  const education = useSelector((state) => state.profile.education); // Redux education state
  const dispatch = useDispatch();

  const [newEducation, setNewEducation] = useState({ degree: "", institution: "", year: "" });
  const [editingIndex, setEditingIndex] = useState(null); // Track index being edited
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility

  // Open modal and set data for editing (or reset for new entry)
  const handleOpenModal = (index = null) => {
    if (index !== null) {
      setNewEducation(education[index]);
      setEditingIndex(index);
    } else {
      
      setNewEducation({ degree: "", institution: "", year: "" });
      setEditingIndex(null);
    }
    setIsModalOpen(true);
  };

  // Save education details
  const handleSaveEducation = () => {
    if (editingIndex !== null) {
      dispatch(updateEducation({ index: editingIndex, data: newEducation }));
    } else {
      dispatch(addEducation(newEducation));
    }
    setIsModalOpen(false); // Close modal
  };

  // Remove an education entry
  const handleRemoveEducation = (index) => {
    dispatch(removeEducation(index));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Education</h3>
        <button
          onClick={() => handleOpenModal()} // Open modal for adding new education
          className="text-blue-500 hover:underline text-sm flex items-center gap-1"
        >
          <FiEdit2 />
          Add Education
        </button>
      </div>

      {/* Education Cards */}
      <div className="space-y-4">
        {education.length > 0 ? (
          education.map((edu, index) => (
            <div key={index} className="border p-4 rounded-lg shadow-sm bg-gray-100">
              <p>
                <strong>Degree:</strong> {edu.degree}
              </p>
              <p>
                <strong>Institution:</strong> {edu.institution}
              </p>
              <p>
                <strong>Year:</strong> {edu.year}
              </p>
              <div className="mt-2 space-x-4">
                <button
                  onClick={() => handleOpenModal(index)} // Open modal for editing
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRemoveEducation(index)} // Remove education
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No education added yet.</p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingIndex !== null ? "Edit Education" : "Add Education"}
            </h3>

            {/* Input Fields */}
            <div className="space-y-3">
              <input
                type="text"
                value={newEducation.degree}
                onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                placeholder="Degree"
                className="w-full border px-3 py-2 rounded-lg focus:outline-blue-500"
              />
              <input
                type="text"
                value={newEducation.institution}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, institution: e.target.value })
                }
                placeholder="Institution"
                className="w-full border px-3 py-2 rounded-lg focus:outline-blue-500"
              />
              <input
                type="text"
                value={newEducation.year}
                onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                placeholder="Year of Completion"
                className="w-full border px-3 py-2 rounded-lg focus:outline-blue-500"
              />
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)} // Close modal
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEducation} // Save or update education
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Education;


import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addEducation, updateEducation, removeEducation } from "../store/profileSlice";

const Education = () => {
  const education = useSelector((state) => state.profile.education);
  const dispatch = useDispatch();
  const [newEducation, setNewEducation] = useState({ degree: "", institution: "", year: "" });
  const [editingIndex, setEditingIndex] = useState(null);

  const handleSaveEducation = () => {
    if (editingIndex !== null) {
      dispatch(updateEducation({ index: editingIndex, data: newEducation }));
    } else {
      dispatch(addEducation(newEducation));
    }
    setNewEducation({ degree: "", institution: "", year: "" });
    setEditingIndex(null);
  };

  const handleEditEducation = (index) => {
    setEditingIndex(index);
    setNewEducation(education[index]);
  };

  const handleRemoveEducation = (index) => {
    dispatch(removeEducation(index));
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Education</h3>
      <div className="space-y-4">
        {education.length > 0 ? (
          education.map((edu, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <p><strong>Degree:</strong> {edu.degree}</p>
              <p><strong>Institution:</strong> {edu.institution}</p>
              <p><strong>Year:</strong> {edu.year}</p>
              <div className="mt-2 space-x-4">
                <button
                  onClick={() => handleEditEducation(index)}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRemoveEducation(index)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No education added yet.</p>
        )}
      </div>
      <div className="mt-4 space-y-2">
        <input
          type="text"
          value={newEducation.degree}
          onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
          placeholder="Degree"
          className="w-full border px-3 py-2 rounded-lg"
        />
        <input
          type="text"
          value={newEducation.institution}
          onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
          placeholder="Institution"
          className="w-full border px-3 py-2 rounded-lg"
        />
        <input
          type="text"
          value={newEducation.year}
          onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
          placeholder="Year of Completion"
          className="w-full border px-3 py-2 rounded-lg"
        />
        <button
          onClick={handleSaveEducation}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mt-2"
        >
          {editingIndex !== null ? "Update" : "Add"} Education
        </button>
      </div>
    </div>
  );
};

export default Education;

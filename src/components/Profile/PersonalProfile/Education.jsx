import React, { useState } from "react";

const Education = () => {
  const [education, setEducation] = useState([]);
  const [newEducation, setNewEducation] = useState({ degree: "", institution: "", year: "" });
  const [editingIndex, setEditingIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleSaveEducation = () => {
    if (editingIndex !== null) {
      const updatedEducation = [...education];
      updatedEducation[editingIndex] = newEducation;
      setEducation(updatedEducation);
    } else {
      setEducation([...education, newEducation]);
    }
    setIsModalOpen(false);
  };

  const handleRemoveEducation = (index) => {
    const updatedEducation = education.filter((_, i) => i !== index);
    setEducation(updatedEducation);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Education</h3>
        <button
          onClick={() => handleOpenModal()}
          className="text-blue-500 hover:underline text-sm flex items-center gap-1"
        >
          Add Education
        </button>
      </div>

      <div className="space-y-4">
        {education.length > 0 ? (
          education.map((edu, index) => (
            <div key={index} className="border p-4 rounded-lg shadow-sm bg-gray-100">
              <p><strong>Degree:</strong> {edu.degree}</p>
              <p><strong>Institution:</strong> {edu.institution}</p>
              <p><strong>Year:</strong> {edu.year}</p>
              <div className="mt-2 space-x-4">
                <button
                  onClick={() => handleOpenModal(index)}
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
          <p className="text-gray-500">No education added yet.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingIndex !== null ? "Edit Education" : "Add Education"}
            </h3>

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

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEducation}
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

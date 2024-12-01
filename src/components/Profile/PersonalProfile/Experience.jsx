import React, { useState } from "react";

const Experience = () => {
  const [experiences, setExperiences] = useState([]); // Start with an empty array
  const [newExperience, setNewExperience] = useState({ title: "", company: "", duration: "" });
  const [editingIndex, setEditingIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Open modal to add new or edit experience
  const handleOpenModal = (index = null) => {
    if (index !== null) {
      setNewExperience(experiences[index]);
      setEditingIndex(index);
    } else {
      setNewExperience({ title: "", company: "", duration: "" });
      setEditingIndex(null);
    }
    setIsModalOpen(true);
  };

  // Save or update experience
  const handleSaveExperience = () => {
    if (editingIndex !== null) {
      const updatedExperiences = [...experiences];
      updatedExperiences[editingIndex] = newExperience;
      setExperiences(updatedExperiences);
    } else {
      setExperiences((prevExperiences) => [...prevExperiences, newExperience]);
    }
    setNewExperience({ title: "", company: "", duration: "" });
    setEditingIndex(null);
    setIsModalOpen(false);
  };

  // Remove experience from list
  const handleRemoveExperience = (index) => {
    const updatedExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(updatedExperiences);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md border-0 rounded-3xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Experience</h3>
        <button
          onClick={() => handleOpenModal()}
          className="text-blue-500 hover:underline text-sm font-bold flex items-center gap-1"
        >
          Add 
        </button>
      </div>

      {/* Experience Cards */}
      <div className="space-y-4">
        {experiences.length > 0 ? (
          experiences.map((exp, index) => (
            <div key={index} className="border p-4 rounded-lg shadow-sm bg-gray-100">
              <p>
                <strong>Title:</strong> {exp.title}
              </p>
              <p>
                <strong>Company:</strong> {exp.company}
              </p>
              <p>
                <strong>Duration:</strong> {exp.duration}
              </p>
              <div className="mt-2 space-x-4">
                <button
                  onClick={() => handleOpenModal(index)}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRemoveExperience(index)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No experiences added yet.</p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingIndex !== null ? "Edit Experience" : "Add Experience"}
            </h3>

            {/* Input Fields */}
            <div className="space-y-3">
              <input
                type="text"
                value={newExperience.title}
                onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                placeholder="Job Title"
                className="w-full border px-3 py-2 rounded-lg focus:outline-blue-500"
              />
              <input
                type="text"
                value={newExperience.company}
                onChange={(e) =>
                  setNewExperience({ ...newExperience, company: e.target.value })
                }
                placeholder="Company"
                className="w-full border px-3 py-2 rounded-lg focus:outline-blue-500"
              />
              <input
                type="text"
                value={newExperience.duration}
                onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
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
                onClick={handleSaveExperience} // Save or update experience
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

export default Experience;

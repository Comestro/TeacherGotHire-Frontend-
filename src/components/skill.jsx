import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addSkill, removeSkill } from "../store/profileSlice";
import { FiEdit2 } from "react-icons/fi";

const Skills = () => {
  const skills = useSelector((state) => state.profile.skills); // Redux skills state
  const dispatch = useDispatch();

  const [newSkill, setNewSkill] = useState(""); // Input for new skill
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
  const [tempSkills, setTempSkills] = useState([]); // Temporary skills for the modal

  // Open modal and sync temporary skills with Redux state
  const openModal = () => {
    setTempSkills([...skills]); // Sync temp state with Redux
    setIsModalOpen(true); // Open modal
  };

  

  // Add a new skill to temporary state
  const handleAddSkill = () => {
    if (newSkill.trim() && !tempSkills.includes(newSkill.trim())) {
      setTempSkills((prevSkills) => [...prevSkills, newSkill.trim()]);
      setNewSkill(""); // Clear input field
    }
  };

  // Remove a skill from the temporary state
  const handleRemoveTempSkill = (skill) => {
    setTempSkills((prevSkills) => prevSkills.filter((s) => s !== skill));
  };

  // Save skills to Redux store and close modal
  const handleSaveSkills = () => {
    // Remove all current skills and re-add updated list
    skills.forEach((skill) => dispatch(removeSkill(skill)));
    tempSkills.forEach((skill) => dispatch(addSkill(skill)));

    setIsModalOpen(false); // Close modal
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Key Skills</h3>
        <button
          onClick={openModal}
          className="text-blue-500 hover:underline text-sm flex items-center gap-1"
        >
          <FiEdit2 />
          Edit
        </button>
      </div>

      {/* Skills Chips */}
      <div className="flex flex-wrap gap-3 mb-4">
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-1 rounded-full"
            >
              {skill}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No skills added yet.</p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Skills</h3>

            {/* Temporary Skills List */}
            <div className="mb-4 space-y-2">
              {tempSkills.length > 0 ? (
                tempSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-md"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleRemoveTempSkill(skill)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No skills added yet.</p>
              )}
            </div>

            {/* Add New Skill */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter a skill"
                className="flex-grow border px-3 py-2 rounded-lg focus:outline-blue-500"
              />
              <button
                onClick={handleAddSkill}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)} // Cancel button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSkills} // Save skills and close modal
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

export default Skills;

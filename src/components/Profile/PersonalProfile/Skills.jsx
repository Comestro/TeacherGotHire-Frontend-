import React, { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

const Skills = () => {
  const [skills, setSkills] = useState(["JavaScript", "React", "CSS"]); 
  const [newSkill, setNewSkill] = useState(""); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [tempSkills, setTempSkills] = useState([]); 

  const openModal = () => {
    setTempSkills([...skills]); 
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

  // Save skills to the local state and close modal
  const handleSaveSkills = () => {
    setSkills([...tempSkills]); // Update the skills with temporary skills
    setIsModalOpen(false); // Close modal
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-3xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg  font-bold text-gray-600 mb-3">Key Skills</h3>
        <button
          onClick={openModal}
          className="text-blue-500 hover:underline text-sm flex items-center font-bold gap-1"
        >
          {/* <FiEdit2 /> */}
          Add
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
          <div className="bg-white p-6  w-full max-w-3xl rounded-3xl shadow-lg">
            <h3 className="text-lg font-semibold">Edit Skills</h3>
            <p className="text-sm font-bold text-gray-400 mb-4">Add skills that best define your expertise, for e.g, Direct Marketing, Oracle, Java, etc. (Minimum 1)</p>

            {/* Temporary Skills List */}
            <div className="mb-4 flex space-x-2">
              {tempSkills.length > 0 ? (
                tempSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 px-2 py-1 rounded-3xl border flex justify-center items-center w-28"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleRemoveTempSkill(skill)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <RxCross2 />

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
                placeholder="Add skills"
                className="flex-grow border px-3 py-2 rounded-lg focus:outline-blue-500"
              />
              <button
                onClick={handleAddSkill}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>
             <div className="flex flex-col">
                <p>Or you can select from the suggested set of skills</p>
                <div className="bg-gray-100 rounded-3xl border px-4 py-1 w-28">
                    <button className=" flex justify-center items-center">
                        <span>JavaScript</span>
                        <RxCross2 />
                    </button>
                </div>
             </div>

            {/* Modal Buttons */}
            <div className="flex justify-end gap-2">
              {/* <button
                onClick={() => setIsModalOpen(false)} 
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button> */}
              <button
                onClick={handleSaveSkills} 
                className="bg-green-500 text-white px-4 py-2 text-sm font-bold rounded-3xl hover:bg-green-600"
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

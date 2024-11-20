import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addSkill, removeSkill } from "../store/profileSlice";
import { FiEdit2 } from "react-icons/fi";

const Skills = () => {
  const skills = useSelector((state) => state.profile.skills);
  const dispatch = useDispatch();
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      dispatch(addSkill(newSkill.trim()));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill) => {
    dispatch(removeSkill(skill));
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Skills</h3>
      <div className="space-y-2">
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-800">{skill}</span>
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p>No skills added yet.</p>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add a new skill"
          className="flex-grow border px-3 py-2 rounded-lg"
        />
        <button
          onClick={handleAddSkill}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <FiEdit2 />
        </button>
      </div>
    </div>
  );
};

export default Skills;

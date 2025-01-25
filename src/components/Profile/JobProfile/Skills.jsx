import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  getAllSkills,
  postSkillsProfile,
  getSkillsProfile,
  delSkillProfile,
} from "../../../features/jobProfileSlice";

const Skills = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [showForm, setShowForm] = useState(false); // State to toggle form visibility
  const dispatch = useDispatch();

  const skillsData = useSelector((state) => state.jobProfile.allSkill || []);
  const teacherSkill = useSelector((state) => state.jobProfile.teacherSkill || []);

  const { handleSubmit, register, watch, setValue } = useForm();
  const inputValue = watch("skillInput", "");

  // Fetch skills on component mount
  useEffect(() => {
    dispatch(getAllSkills());
    dispatch(getSkillsProfile());
  }, [dispatch]);

  // Filter suggestions to exclude already selected skills
  useEffect(() => {
    if (inputValue) {
      const filteredSuggestions = skillsData.filter(
        (skill) =>
          skill.name.toLowerCase().includes(inputValue.toLowerCase()) &&
          !teacherSkill.some((item) => item.skill.id === skill.id)
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, skillsData, teacherSkill]);

  const handleSuggestionClick = async (skill) => {
    try {
      if (teacherSkill.find((item) => item.skill.id === skill.id)) {
        return; // Skill already added
      }
      await dispatch(postSkillsProfile({ skill: skill.id })).unwrap();
      dispatch(getSkillsProfile());
      setValue("skillInput", "");
      setSuggestions([]);
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  const handleRemoveSelectedSkill = async (skillToRemove) => {
    try {
      await dispatch(delSkillProfile(skillToRemove)).unwrap();
      dispatch(getSkillsProfile());
    } catch (error) {
      console.error("Error removing skill:", error);
    }
  };

  const handleInputFocus = () => {
    if (inputValue === "") {
      const filteredSuggestions = skillsData.filter(
        (skill) => !teacherSkill.some((item) => item.skill.id === skill.id)
      );
      setSuggestions(filteredSuggestions);
    }
  };

  const onSubmit = async () => {
    setValue("skillInput", "");
    setSuggestions([]);
    setShowForm(false); // Hide form after submission
  };

  return (
    <div className="bg-slate-50 rounded-lg mx-auto px-5 py-4 mt-4 shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-600">Manage Your Skills</h2>
        <button
          className="text-sm font-medium px-6 py-2 bg-[#3E98C7] text-white rounded-md shadow-md transition flex items-center gap-1"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Add Skill"}
        </button>
      </div>

      {showForm && (
        <div className="mb-5 px-4">
          <form onSubmit={handleSubmit(onSubmit)} className="relative flex">
            <input
              type="text"
              {...register("skillInput")}
              placeholder="Type a skill..."
              className="w-full border border-gray-300 rounded-s-lg px-4 py-2 focus:outline-none"
              onFocus={handleInputFocus}
            />
            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow max-h-40 overflow-y-auto z-10">
                {suggestions.map((skill, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(skill)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                  >
                    {skill.name}
                  </li>
                ))}
              </ul>
            )}
            <button
              type="submit"
              className=" bg-green-600 text-white px-4 py-2 rounded-e-lg hover:bg-green-700 transition"
            >
              Submit
            </button>
          </form>
        </div>
      )}

      <div className="">
        <h2 className="text-lg font-medium text-gray-700 mb-2">Your Skills</h2>
        {teacherSkill.length === 0 ? (
          <p className="text-gray-500 px-4">No skills added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {teacherSkill.map((skill, index) => (
              <div
                key={index}
                className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full shadow"
              >
                <span className="mr-2">{skill.skill.name}</span>
                <button
                  onClick={() => handleRemoveSelectedSkill(skill)}
                  className="text-red-500 hover:text-red-600 focus:outline-none"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Skills;

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
  const dispatch = useDispatch();

  const skillsData = useSelector((state) => state.jobProfile.allSkill || []);
  const teacherSkill = useSelector(
    (state) => state.jobProfile.teacherSkill || []
  );

  const [teacherSkills, setTeacherSkills] = useState(teacherSkill || []);
  const { handleSubmit, register, watch, setValue } = useForm();

  const inputValue = watch("skillInput", "");

  // Fetch skills on component mount
  useEffect(() => {
    dispatch(getAllSkills());
    dispatch(getSkillsProfile());
  }, [dispatch]);

  // Update suggestions when input value changes
  useEffect(() => {
    if (inputValue) {
      const filteredSuggestions = skillsData.filter((skill) =>
        skill.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, skillsData]);

  const handleSuggestionClick = async (skill) => {
    try {
      if (teacherSkills.find((item) => item.skill.id === skill.id)) {
        return; // Skill already added
      }
      await dispatch(postSkillsProfile({ skill: skill.id })).unwrap();
      setTeacherSkills([...teacherSkills, { skill }]);
      setValue("skillInput", "");
      setSuggestions([]);
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  const handleRemoveSelectedSkill = async (skillToRemove) => {
    try {
      await dispatch(delSkillProfile(skillToRemove)).unwrap();
      setTeacherSkills(
        teacherSkills.filter(
          (skill) => skill.skill.id !== skillToRemove.skill.id
        )
      );
    } catch (error) {
      console.error("Error removing skill:", error);
    }
  };

  const onSubmit = async () => {
    setValue("skillInput", "");
    setSuggestions([]);
  };

  return (
    <div className="container mx-auto p-4 mt-4">
      <h1 className="text-xl font-bold mb-4 text-gray-600">Add Your Skills</h1>

      <div className="px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="mb-2">
          <input
            type="text"
            {...register("skillInput")}
            placeholder="Type a skill..."
            className="border-b border-gray-300 w-full p-2 mb-2 focus:outline-none"
          />
          {suggestions.length > 0 && (
            <ul className="border border-gray-300 rounded max-h-40 mb-1 absolute z-10 bg-white md:w-96">
              {suggestions.map((skill, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(skill)}
                  className="cursor-pointer px-2 py-1.5"
                >
                  {skill.name}
                </li>
              ))}
            </ul>
          )}
        </form>
      </div>

      <div className="mb-4 px-4">
        <h3 className="font-semibold mb-2 text-gray-600">Selected Skills:</h3>
        {teacherSkills.length === 0 ? (
          <p className="text-gray-500">No skills added yet</p>
        ) : (
          <div className="flex flex-wrap">
            {teacherSkills.map((skill, index) => (
              <div
                key={index}
                className="bg-[#E5F1F9] text-[#3E98C7] flex items-center px-3 py-1 rounded-full mr-2 mb-2"
              >
                <span className="mr-2">{skill.skill.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSelectedSkill(skill)}
                  className="text-red-600 font-semibold hover:text-red-700 focus:outline-none"
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

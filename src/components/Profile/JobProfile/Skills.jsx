import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  getAllSkills,
  postSkillsProfile,
  getSkillsProfile,
  delSkillProfile,
} from "../../../features/jobProfileSlice";
import {
  HiOutlineClipboardList,
  HiPlusCircle,
  HiTag,
  HiX,
  HiXCircle,
} from "react-icons/hi";
import { HiCheckBadge } from "react-icons/hi2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Skills = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [showForm, setShowForm] = useState(false); // State to toggle form visibility
  const dispatch = useDispatch();
  const skillsData = useSelector((state) => state.jobProfile.allSkill || []);
  const teacherSkill = useSelector(
    (state) => state.jobProfile.teacherSkill || []
  );

  const { handleSubmit, register, watch, setValue } = useForm();
  const inputValue = watch("skillInput", "");

  // Fetch skills on component mount
  useEffect(() => {
    console.log("skill", skillsData);
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
        toast.warning("This skill is already added");
        return;
      }
      await dispatch(postSkillsProfile({ skill: skill.id })).unwrap();
      dispatch(getSkillsProfile());
      setValue("skillInput", "");
      setSuggestions([]);
      toast.success("Skill added successfully!");
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error(error.response?.data?.message || "Failed to add skill");
    }
  };

  const handleRemoveSelectedSkill = async (skillToRemove) => {
    try {
      await dispatch(delSkillProfile(skillToRemove)).unwrap();
      dispatch(getSkillsProfile());
      toast.success("Skill removed successfully!");
    } catch (error) {
      console.error("Error removing skill:", error);
      toast.error(error.response?.data?.message || "Failed to remove skill");
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
    <div className="bg-white rounded-xl mx-4 sm:mx-0 p-6 border border-gray-200 mt-8">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-gray-200">
        <div className="mb-3 sm:mb-0">
          <h2 className="text-2xl font-bold text-gray-900">
            Skills & Expertise
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Showcase your core competencies and technical abilities
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] rounded-lg shadow-sm hover:shadow-md transition-all"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <>
              <HiX className="size-5" />
              Cancel
            </>
          ) : (
            <>
              <HiPlusCircle className="size-5" />
              Add Skill
            </>
          )}
        </button>
      </div>

      {/* Skill Input Form */}
      {showForm && (
        <div className="mb-6 px-2">
          <form onSubmit={handleSubmit(onSubmit)} className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                {...register("skillInput")}
                placeholder="Search skills..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3E98C7] focus:border-[#3E98C7] transition-all"
                onFocus={handleInputFocus}
              />
              <button
                type="submit"
                className="px-6 bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] text-white font-medium rounded-lg hover:shadow-md transition-shadow"
              >
                Add
              </button>
            </div>

            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-10">
                {suggestions.map((skill, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(skill)}
                    className="px-4 py-3 hover:bg-[#F0F9FF] cursor-pointer transition-colors text-sm text-gray-700 flex items-center gap-2"
                  >
                    <HiTag className="text-[#3E98C7] size-4" />
                    {skill.name}
                  </li>
                ))}
              </ul>
            )}
          </form>
        </div>
      )}

      {/* Skills List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Current Skills
        </h3>
        {teacherSkill.length === 0 ? (
          <div className="p-4 text-center rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
            <HiOutlineClipboardList className="mx-auto size-8 text-gray-400 mb-2" />
            <p className="text-gray-500">No skills added yet</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {teacherSkill.map((skill, index) => (
              <div
                key={index}
                className="flex items-center bg-[#F0F9FF] text-[#2A6476] px-4 py-2 rounded-full border border-[#D4EEFC] hover:border-[#3E98C7]/40 transition-colors"
              >
                <HiCheckBadge className="size-5 mr-2 text-[#3E98C7]" />
                <span className="text-sm font-medium">{skill.skill.name}</span>
                <button
                  onClick={() => handleRemoveSelectedSkill(skill)}
                  className="ml-2 text-gray-400 hover:text-red-500 rounded-full p-1 transition-colors"
                >
                  <HiXCircle className="size-5" />
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

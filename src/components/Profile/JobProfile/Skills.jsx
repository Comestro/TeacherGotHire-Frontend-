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
  HiOutlinePlus,
  HiOutlineTag,
  HiOutlineXMark,
  HiOutlineCheckBadge,
  HiOutlineClipboardDocumentList,
  HiMagnifyingGlass
} from "react-icons/hi2";
import ErrorMessage from "../../ErrorMessage";

const Skills = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [showForm, setShowForm] = useState(false); // State to toggle form visibility
  const dispatch = useDispatch();
  const skillsData = useSelector((state) => state.jobProfile.allSkill || []);
  const teacherSkill = useSelector(
    (state) => state.jobProfile.teacherSkill || []
  );
  const [generalError, setGeneralError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { handleSubmit, register, watch, setValue } = useForm();
  const inputValue = watch("skillInput", "");
  useEffect(() => {
    dispatch(getAllSkills());
    dispatch(getSkillsProfile());
  }, [dispatch]);
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
      setGeneralError(null);
      setSuccessMessage(null);
      if (teacherSkill.find((item) => item.skill.id === skill.id)) {
        setGeneralError("This skill is already added");
        return;
      }
      await dispatch(postSkillsProfile({ skill: skill.id })).unwrap();
      dispatch(getSkillsProfile());
      setValue("skillInput", "");
      setSuggestions([]);
      setSuccessMessage("Skill added successfully!");
    } catch (error) {
      setGeneralError(error.response?.data?.message || "Failed to add skill");
    }
  };

  const handleRemoveSelectedSkill = async (skillToRemove) => {
    try {
      setGeneralError(null);
      setSuccessMessage(null);
      await dispatch(delSkillProfile(skillToRemove)).unwrap();
      dispatch(getSkillsProfile());
      setSuccessMessage("Skill removed successfully!");
    } catch (error) {
      setGeneralError(error.response?.data?.message || "Failed to remove skill");
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
    <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
      <ErrorMessage
        message={generalError}
        onDismiss={() => setGeneralError(null)}
        className="mb-6"
      />

      <ErrorMessage
        message={successMessage}
        type="success"
        onDismiss={() => setSuccessMessage(null)}
        className="mb-6"
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-slate-100">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 rounded-md text-teal-600">
              <HiOutlineClipboardDocumentList className="w-5 h-5" />
            </span>
            Skills & Expertise
          </h2>
          <p className="text-sm text-slate-500 mt-1 ml-9">
            Showcase your core skills
          </p>
        </div>
        <button
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${showForm
            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
            : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-200"
            }`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <>
              <HiOutlineXMark className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <HiOutlinePlus className="h-4 w-4" />
              Add Skill
            </>
          )}
        </button>
      </div>

      {/* Skill Input Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <form onSubmit={handleSubmit(onSubmit)} className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiMagnifyingGlass className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  {...register("skillInput")}
                  placeholder="Search skills..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                  onFocus={handleInputFocus}
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-teal-200 transition-all"
              >
                Add
              </button>
            </div>

            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                {suggestions.map((skill, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(skill)}
                    className="px-4 py-2.5 hover:bg-teal-50 cursor-pointer transition-colors text-sm text-slate-700 flex items-center gap-2 border-b border-slate-50 last:border-0"
                  >
                    <HiOutlineTag className="text-teal-500 w-4 h-4" />
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
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Current Skills
        </h3>
        {teacherSkill.length === 0 ? (
          <div className="py-12 text-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
              <HiOutlineClipboardDocumentList className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-slate-700 font-medium text-sm mb-1">No skills added yet</h3>
            <p className="text-xs text-slate-500">Add skills to showcase your expertise</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {teacherSkill.map((skill, index) => (
              <div
                key={index}
                className="flex items-center bg-white text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all group"
              >
                <HiOutlineCheckBadge className="h-4 w-4 mr-1.5 text-teal-500" />
                <span className="text-sm font-medium">{skill.skill.name}</span>
                <button
                  onClick={() => handleRemoveSelectedSkill(skill)}
                  className="ml-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-all opacity-0 group-hover:opacity-100"
                  aria-label={`Remove ${skill.skill.name}`}
                >
                  <HiOutlineXMark className="h-4 w-4" />
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

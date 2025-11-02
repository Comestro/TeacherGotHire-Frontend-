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
} from "react-icons/hi2";
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
      
      toast.error(error.response?.data?.message || "Failed to add skill");
    }
  };

  const handleRemoveSelectedSkill = async (skillToRemove) => {
    try {
      await dispatch(delSkillProfile(skillToRemove)).unwrap();
      dispatch(getSkillsProfile());
      toast.success("Skill removed successfully!");
    } catch (error) {
      
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
    <div className="bg-gradient-to-br from-white to-background/30 rounded-xl border border-secondary/30 p-6 md:p-8 shadow-sm">
       <ToastContainer 
        position="top-right" 
        autoClose={1000} 
        closeButton={true}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-secondary/20">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-bold text-text mb-2 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HiOutlineClipboardDocumentList className="text-2xl text-primary" aria-hidden="true" />
            </div>
            Skills & Expertise
            <span className="ml-2 text-secondary text-sm font-normal">/ कौशल और विशेषज्ञता</span>
          </h2>
          <p className="text-sm text-secondary ml-14">
            Showcase your core competencies and technical abilities
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <>
              <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
              Cancel
            </>
          ) : (
            <>
              <HiOutlinePlus className="h-5 w-5" aria-hidden="true" />
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3E98C7] focus:border-[#3E98C7] transition-all"
                onFocus={handleInputFocus}
              />
              <button
                type="submit"
                className="px-6 bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] hover:from-[#2A6476] hover:to-[#3E98C7] text-white font-medium rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
              >
                Add
              </button>
            </div>

            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-2 bg-white border-2 border-[#3E98C7]/30 rounded-lg shadow-xl overflow-hidden z-10">
                {suggestions.map((skill, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(skill)}
                    className="px-4 py-3 hover:bg-[#3E98C7]/10 cursor-pointer transition-colors text-sm text-gray-700 flex items-center gap-2"
                  >
                    <HiOutlineTag className="text-[#3E98C7] size-4" />
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
        <h3 className="text-sm font-semibold text-text/70 uppercase tracking-wide">
          Current Skills
        </h3>
        {teacherSkill.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-background border-2 border-dashed border-secondary/30">
            <div className="p-4 bg-primary/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <HiOutlineClipboardDocumentList className="h-10 w-10 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-text font-bold text-lg mb-1">No skills added yet</h3>
            <p className="text-sm text-secondary">Add skills to showcase your expertise</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {teacherSkill.map((skill, index) => (
              <div
                key={index}
                className="flex items-center bg-primary/10 text-primary px-4 py-2.5 rounded-full border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/15 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <HiOutlineCheckBadge className="h-5 w-5 mr-2 text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold">{skill.skill.name}</span>
                <button
                  onClick={() => handleRemoveSelectedSkill(skill)}
                  className="ml-3 text-error hover:text-error/80 rounded-full p-1 transition-all hover:bg-error/10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-error"
                  aria-label={`Remove ${skill.skill.name}`}
                >
                  <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
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

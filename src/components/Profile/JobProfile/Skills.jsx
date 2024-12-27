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
  const [skills, setSkills] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const dispatch = useDispatch();

  const skillsData = useSelector((state) => state.jobProfile.allSkill || []);
  const teacherSkill = useSelector(
    (state) => state.jobProfile.teacherSkill || []
  );

  console.log("teacherSkill", teacherSkill);

  const [teacherSkills, setTeacherSkills] = useState(teacherSkill || []);
  console.log("skill", teacherSkills);
  // useForm hook from react-hook-form
  const { handleSubmit, register, watch, setValue } = useForm();

  const inputValue = watch("skillInput", "");

  // Fetch skills when the modal opens
  useEffect(() => {
    if (isModalOpen) {
      dispatch(getAllSkills());
      dispatch(getSkillsProfile());
    }
  }, [isModalOpen]);

  // Update suggestions when input value changes
  //  useEffect(() => {
  //   if (inputValue) {
  //     const filteredSuggestions = skillsData.filter((skill) =>
  //       skill.toLowerCase().includes(inputValue.toLowerCase())
  //     );
  //     setSuggestions(filteredSuggestions);
  //   } else {
  //     setSuggestions(skillsData);
  //   }
  // }, [inputValue]);

  const handleInputFocus = () => {
    if (inputValue === "") {
      setSuggestions(skillsData);
    }
  };

  const handleSuggestionClick = async (skill) => {
    console.log("data", skill);
    //    Check if the skill is already selected
    try {
      setSkills(skill);
      setSuggestions([]);
      await dispatch(postSkillsProfile({ skill: skill.id })).unwrap(); // Post the selected skill to the backend
      setSkills({});
    } catch (error) {
      console.error("Error posting skill:", error);
    }
  };

  const handleRemoveSelectedSkill = async (skillToRemove) => {
    console.log("vhbjnkm", skillToRemove);
    console.log("archu", teacherSkill);
    // const skill = teacherSkill.
    setTeacherSkills(
      teacherSkills.filter((skill) => skill.id !== skillToRemove.id)
    );
    await dispatch(delSkillProfile(skillToRemove)).unwrap();

    console.log("archu", teacherSkills);
  };

  const onSubmit = async (data) => {
    //setSkills(selectedSkills);
    setIsModalOpen(false);
    setSelectedSkills([]);
    setValue("skillInput", "");
  };

  return (
    <div className=" mt-5 p-6 bg-white shadow-md rounded-md">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg  font-bold text-gray-600 mb-3">Key Skills</h3>
        <button
          onClick={isModalOpen}
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
              className="bg-blue-500 text-white px-3 py-1 rounded-full mr-2 mb-2"
            >
              {skill.skill.name}
            </div>
          )) 
      ) : null}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mr-2"
      >
        Edit
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96 relative">
            <h2 className="text-xl font-semibold mb-4">Edit Skills</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                type="text"
                {...register("skill")}
                onFocus={handleInputFocus}
                value={skills ? skills.name : ""}
                placeholder="Type a skill..."
                className="border border-gray-300 rounded w-full p-2 mb-2"
              />
              {suggestions.length > 0 && (
                <ul className="border border-gray-300 rounded max-h-40 overflow-y-auto mb-2 absolute z-10 bg-white w-11/12">
                  {suggestions.map((skill, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(skill)}
                      className="cursor-pointer hover:bg-gray-200 p-2"
                    >
                      {skill.name}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Selected Skills:</h3>
                {teacherSkills.length === 0 ? (
                  <p className="text-gray-500">No skills selected</p>
                ) : (
                  <div className="flex flex-wrap">
                    {teacherSkills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-blue-500 text-white flex items-center px-3 py-1 rounded-full mr-2 mb-2"
                      >
                        <span className="mr-2">{skill.skill.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSelectedSkill(skill)}
                          className="text-white hover:text-gray-300 focus:outline-none"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedSkills([]);
                    setValue("skillInput", "");
                    setSuggestions([]);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default Skills;

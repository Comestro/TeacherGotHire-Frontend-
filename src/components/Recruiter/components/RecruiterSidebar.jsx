import React, { useEffect, useState } from "react";
import {
  BsGeoAlt,
  BsPersonWorkspace,
  BsBriefcase,
  BsCode,
} from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { MdExpandMore, MdExpandLess, MdSchool } from "react-icons/md";
import { fetchTeachers } from "../../../services/teacherFilterService";
import { useSelector } from "react-redux";

const RecruiterSidebar = () => {
  const [filters, setFilters] = useState({
    district: [],
    pincode: [],
    block: [],
    village: "",
    qualification: [],
    experience: "",
    skill: [],
  });

  const [quealificationData, setQuealificationData] = useState([]);
  const [skillData, setSkillData] = useState([]);

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);

  const { qualification, allSkill } = useSelector((state) => state.jobProfile);

  useEffect(() => {
    setQuealificationData(qualification);
    setSkillData(allSkill);
  }, [qualification, allSkill]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching teachers with filters:", filters);
        const data = await fetchTeachers(filters); // Fetch filtered teachers whenever filters change
        console.log("Filtered teachers data", data);
      } catch (error) {
        console.error("Error fetching filtered teachers:", error);
      }
    };

    // Only fetch data when filters have changed
    fetchData();
  }, [filters]); // Dependency on filters state

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const updatedFilters = { ...prev, [name]: value };
      return updatedFilters;
    });
  };

  const handleSkillToggle = (skillName) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skillName)) {
        // Remove the skill if already selected
        return prev.filter((skill) => skill !== skillName);
      } else {
        // Add the skill if not already selected
        return [...prev, skillName];
      }
    });
  };

  useEffect(() => {
    // Update filters when skills are selected/deselected
    setFilters((prev) => ({ ...prev, skill: selectedSkills }));
  }, [selectedSkills]);

  const handleQualificationToggle = (qualificationName) => {
    setSelectedQualifications((prev) => {
      if (prev.includes(qualificationName)) {
        // Remove the qualification name if already selected
        return prev.filter((name) => name !== qualificationName);
      } else {
        // Add the qualification name if not already selected
        return [...prev, qualificationName];
      }
    });
  };

  useEffect(() => {
    // Update filters when qualifications are selected/deselected
    setFilters((prev) => ({ ...prev, qualification: selectedQualifications }));
  }, [selectedQualifications]);

  const [expandedSections, setExpandedSections] = useState({
    location: false,
    education: false,
    experience: false,
    skills: false,
  });

  const [searchSkill, setSearchSkill] = useState("");

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleClear = () => {
    setFilters({
      district: "",
      pincode: [],
      block: "",
      village: "",
      qualification: [],
      experience: "",
      skill: [],
    });
    setSelectedSkills([]);
    setSelectedQualifications([]);
    setExpandedSections({
      location: false,
      education: false,
      experience: false,
      skills: false,
    });
    // Fetch all teachers with no filters
    fetchTeachers({});
  };

  return (
    <div className="fixed left-0 top-16 h-screen w-72 bg-white shadow-lg overflow-y-auto p-4 hidden md:block">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
        <button
          onClick={handleClear}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          aria-label="Clear all filters"
        >
          <IoMdClose className="w-4 h-4" />
          Clear All
        </button>
      </div>

      {/* Location Section */}
      <div className="mb-6 border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection("location")}
          className="flex items-center justify-between w-full mb-3"
          aria-expanded={expandedSections.location}
        >
          <div className="flex items-center gap-2">
            <BsGeoAlt className="text-teal-600" />
            <span className="font-semibold text-gray-800">Location</span>
          </div>
          {expandedSections.location ? <MdExpandLess /> : <MdExpandMore />}
        </button>
        {expandedSections.location && (
          <div className="space-y-2 px-2">
            {["pincode", "district", "block", "village"].map((field) => (
              <div className="flex flex-col py-2" key={field}>
                <input
                  id={field}
                  name={field}
                  type="text"
                  value={filters[field]}
                  onChange={handleInputChange}
                  placeholder={`Search by ${field}`}
                  className="border-b pb-1 px-2 outline-none focus:outline-none placeholder:text-[16px] text-gray-600"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Education Section */}
      <div className="mb-6 border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection("education")}
          className="flex items-center justify-between w-full mb-3"
          aria-expanded={expandedSections.education}
        >
          <div className="flex items-center gap-2">
            <MdSchool className="text-teal-600" />
            <span className="font-semibold text-gray-800">Education</span>
          </div>
          {expandedSections.education ? <MdExpandLess /> : <MdExpandMore />}
        </button>
        <div>
          {expandedSections.education && (
            <div className="space-y-2 px-4">
              {quealificationData.map((qualification) => (
                <div key={qualification.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`qualification-${qualification.id}`}
                    value={qualification.name}
                    checked={selectedQualifications.includes(
                      qualification.name
                    )}
                    onChange={() =>
                      handleQualificationToggle(qualification.name)
                    }
                  />
                  <label
                    htmlFor={`qualification-${qualification.id}`}
                    className="ml-2"
                  >
                    {qualification.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Experience Section */}
      <div className="mb-6 border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection("experience")}
          className="flex items-center justify-between w-full mb-3"
          aria-expanded={expandedSections.experience}
        >
          <div className="flex items-center gap-2">
            <BsBriefcase className="text-teal-600" />
            <span className="font-semibold text-gray-800">Experience</span>
          </div>
          {expandedSections.experience ? <MdExpandLess /> : <MdExpandMore />}
        </button>
        {expandedSections.experience && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Min</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      experience: { ...prev.experience, min: e.target.value },
                    }))
                  }
                  className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Max</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      experience: { ...prev.experience, max: e.target.value },
                    }))
                  }
                  className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Skills Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("skills")}
          className="flex items-center justify-between w-full mb-3"
          aria-expanded={expandedSections.skills}
        >
          <div className="flex items-center gap-2">
            <BsCode className="text-teal-600" />
            <span className="font-semibold text-gray-800">Skills</span>
          </div>
          {expandedSections.skills ? <MdExpandLess /> : <MdExpandMore />}
        </button>
        {expandedSections.skills && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search skills..."
              value={searchSkill}
              onChange={(e) => setSearchSkill(e.target.value)}
              className="w-full pb-1 border-b border-gray-300 focus:outline-none"
            />
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {skillData
                .filter((skill) =>
                  skill.name.toLowerCase().includes(searchSkill.toLowerCase())
                )
                .map((skill) => (
                  <div key={skill.id} className="flex items-center pl-4">
                    <input
                      type="checkbox"
                      id={`skill-${skill.id}`}
                      value={skill.name}
                      checked={selectedSkills.includes(skill.name)}
                      onChange={() => handleSkillToggle(skill.name)}
                    />
                    <label htmlFor={`skill-${skill.id}`} className="ml-2">
                      {skill.name}
                    </label>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterSidebar;

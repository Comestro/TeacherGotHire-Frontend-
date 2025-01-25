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
    district: "",
    pincode: "",
    block: "",
    village: "",
  });

  const [quealificationData, setQuealificationData] = useState([]);
  const [selectedQualification, setSelectedQualification] = useState(null);

  const { qualification } = useSelector((state) => state.jobProfile);

  useEffect(() => {
    setQuealificationData(qualification);
    console.log("qualification", qualification);
  });

  const handleSelection = (id) => {
    setSelectedQualification(id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const updatedFilters = { ...prev, [name]: value };
      fetchTeachers(updatedFilters);
      return updatedFilters;
    });
  };

  const [expandedSections, setExpandedSections] = useState({
    location: true,
    education: true,
    experience: true,
    skills: true,
  });

  const [searchSkill, setSearchSkill] = useState("");

  const skillsList = [
    "React",
    "JavaScript",
    "Python",
    "Java",
    "Node.js",
    "SQL",
    "AWS",
  ];

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleClear = () => {
    setFilters({
      district: "",
      pincode: "",
      block: "",
      village: "",
    });
    fetchFilteredTeachers({}); // Fetch all teachers
  };

  const handleExperienceChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [`experience_${type}`]: value,
    }));
    // Dispatch updated filters if needed
  };

  const filteredSkills = skillsList.filter((skill) =>
    skill.toLowerCase().includes(searchSkill.toLowerCase())
  );

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
          <div className="space-y-2 pl-4">
            {["pincode", "district", "block", "village"].map((field) => (
              <div className="flex flex-col" key={field}>
                <label htmlFor={field}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}:
                </label>
                <input
                  id={field}
                  name={field}
                  type="text"
                  value={filters[field]}
                  onChange={handleInputChange}
                  placeholder={`Search by ${field}`}
                  className="border-b pb-2 pl-2 outline-none focus:outline-none"
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
        {expandedSections.education && (
          <div className="space-y-2 px-4">
            <form>
              {quealificationData.map((qualification) => (
                <div key={qualification.id}>
                  <input
                    type="radio"
                    id={`qualification-${qualification.id}`}
                    name="qualification"
                    value={qualification.id}
                    checked={selectedQualification === qualification.id}
                    onChange={() => handleSelection(qualification.id)}
                  />
                  <label htmlFor={`qualification-${qualification.id}`}>
                    {qualification.name}
                  </label>
                </div>
              ))}
            </form>
          </div>
        )}
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
                    handleExperienceChange("min", e.target.value)
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
                    handleExperienceChange("max", e.target.value)
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
              className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filteredSkills.map((skill) => (
                <div key={skill} className="text-sm text-gray-700">
                  {skill}
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

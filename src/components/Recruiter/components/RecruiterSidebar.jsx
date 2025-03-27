import React, { useEffect, useRef, useState } from "react";
import {
  BsGeoAlt,
  BsPersonWorkspace,
  BsCode,
} from "react-icons/bs";
import { BsCheck } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { MdExpandMore, MdExpandLess, MdSchool } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllSkills,
  getQualification,
  getClassCategory,
} from "../../../features/jobProfileSlice";
import { fetchTeachers } from "../../../features/teacherFilterSlice";

const RecruiterSidebar = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  console.log("Sidebar isOpen: ", isOpen);

  const [filters, setFilters] = useState({
    district: [],
    pincode: [],
    block: [],
    village: [],
    qualification: [],
    skill: [],
    class_category: [],
    subject: [],
  });

  const { qualification, allSkill, classCategories } = useSelector(
    (state) => state.jobProfile
  );
  const getFilteredSubjects = () => {
    if (selectedClassCategories.length === 0) return [];
    
    const selectedCategories = classCategories.filter(category =>
      selectedClassCategories.includes(category.name)
    );
    
    const allSubjects = selectedCategories.flatMap(category => 
      category.subjects.map(sub => sub.subject_name)
    );
    
    return [...new Set(allSubjects)];
  };

  useEffect(() => {
    dispatch(getAllSkills());
    dispatch(getQualification());
    dispatch(getClassCategory());
  }, []);

  const [qualificationData, setQualificationData] = useState([]);
  const [skillData, setSkillData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    setQualificationData(qualification);
    setSkillData(allSkill);
    setCategoryData(classCategories);
  }, [qualification, allSkill, classCategories]);

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [selectedClassCategories, setSelectedClassCategories] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Handlers for toggling selections
  const handleSkillToggle = (skillName) => {
    setSelectedSkills((prev) =>
      prev.includes(skillName)
        ? prev.filter((skill) => skill !== skillName)
        : [...prev, skillName]
    );
  };

  const handleQualificationToggle = (qualificationName) => {
    setSelectedQualifications((prev) =>
      prev.includes(qualificationName)
        ? prev.filter((name) => name !== qualificationName)
        : [...prev, qualificationName]
    );
  };

  const handleClassCategoryToggle = (categoryName) => {
    setSelectedClassCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleSubjectToggle = (subjectName) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectName)
        ? prev.filter((subject) => subject !== subjectName)
        : [...prev, subjectName]
    );
  };

  // Update filters when selections change
  useEffect(() => {
    setFilters((prev) => ({ ...prev, skill: selectedSkills }));
  }, [selectedSkills]);
  useEffect(() => {
    setFilters((prev) => ({ ...prev, qualification: selectedQualifications }));
  }, [selectedQualifications]);
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      class_category: selectedClassCategories,
    }));
  }, [selectedClassCategories]);
  useEffect(() => {
    setFilters((prev) => ({ ...prev, subject: selectedSubjects }));
  }, [selectedSubjects]);

  // Location handling
  const [inputValues, setInputValues] = useState({
    pincode: "",
    district: "",
    block: "",
    village: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddValue = (field) => {
    if (inputValues[field].trim()) {
      setFilters((prev) => ({
        ...prev,
        [field]: [...prev[field], inputValues[field].trim()],
      }));
      setInputValues((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRemoveValue = (field, index) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    dispatch(fetchTeachers(filters));
  }, [dispatch, filters]);

  // Section toggle state
  const [expandedSections, setExpandedSections] = useState({
    location: false,
    education: false,
    experience: false,
    classCategory: false,
    subjects: false,
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
      district: [],
      pincode: [],
      block: [],
      village: [],
      qualification: [],
      experience: "",
      skill: [],
      class_category: [],
      subject: [],
    });

    setSelectedSkills([]);
    setSelectedQualifications([]);
    setSelectedClassCategories([]);
    setSelectedSubjects([]);

    setExpandedSections({
      location: false,
      education: false,
      experience: false,
      classCategory: false,
      subjects: false,
      skills: false,
    });
  };

  return (
    <div 
    ref={sidebarRef}
    className={`fixed left-0 top-16 h-screen bg-white shadow-lg overflow-y-auto p-4
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      transition-transform duration-300 ease-in-out
      md:translate-x-0 md:block md:w-72
      w-[280px] z-[100]`}
    >

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
        <button
          onClick={handleClear}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
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
        >
          <div className="flex items-center gap-2">
            <BsGeoAlt className="text-teal-600" />
            <span className="font-semibold text-gray-800">Location</span>
          </div>
          {expandedSections.location ? <MdExpandLess /> : <MdExpandMore />}
        </button>
        {expandedSections.location && (
          <div className="space-y-4 px-2">
            {["pincode", "district", "block", "village"].map((field) => (
              <div className="flex flex-col py-2" key={field}>
                <div className="flex space-x-2">
                  <input
                    id={field}
                    name={field}
                    type="text"
                    value={inputValues[field]}
                    onChange={handleInputChange}
                    placeholder={`Enter ${field}`}
                    className="border-b pb-1 px-2 outline-none focus:outline-none placeholder:text-[16px] text-gray-600 flex-1"
                  />
                  <button
                    onClick={() => handleAddValue(field)}
                    className="px-4 py-1 border rounded-md"
                  >
                    <BsCheck />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {filters[field].map((value, index) => (
                    <div
                      key={index}
                      className="flex justify-center bg-teal-50 border border-teal-300 hover:border-teal-400 text-teal-700 px-3 py-1 rounded-full shadow-sm"
                    >
                      <span>{value}</span>
                      <button
                        onClick={() => handleRemoveValue(field, index)}
                        className="text-red-600 ml-2 h-2 w-2 flex rounded-full"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
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
        >
          <div className="flex items-center gap-2">
            <MdSchool className="text-teal-600" />
            <span className="font-semibold text-gray-800">Education</span>
          </div>
          {expandedSections.education ? <MdExpandLess /> : <MdExpandMore />}
        </button>
        {expandedSections.education && (
          <div className="space-y-2 px-4">
            {qualificationData.map((qualification) => (
              <div key={qualification.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`qualification-${qualification.id}`}
                  value={qualification.name}
                  checked={selectedQualifications.includes(qualification.name)}
                  onChange={() => handleQualificationToggle(qualification.name)}
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

      {/* Class Category Section */}
      <div className="mb-6 border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection("classCategory")}
          className="flex items-center justify-between w-full mb-3"
        >
          <div className="flex items-center gap-2">
            <BsPersonWorkspace className="text-teal-600" />
            <span className="font-semibold text-gray-800">Class Category</span>
          </div>
          {expandedSections.classCategory ? <MdExpandLess /> : <MdExpandMore />}
        </button>
        {expandedSections.classCategory && (
          <div className="space-y-2 px-4">
            {categoryData.map((category) => (
              <div key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`classCategory-${category.id}`}
                  value={category.name}
                  checked={selectedClassCategories.includes(category.name)}
                  onChange={() => handleClassCategoryToggle(category.name)}
                />
                <label
                  htmlFor={`classCategory-${category.id}`}
                  className="ml-2"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subjects Section */}
      <div className="mb-6 border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection("subjects")}
          className="flex items-center justify-between w-full mb-3"
        >
          <div className="flex items-center gap-2">
            <BsPersonWorkspace className="text-teal-600" />
            <span className="font-semibold text-gray-800">Subjects</span>
          </div>
          {expandedSections.subjects ? <MdExpandLess /> : <MdExpandMore />}
        </button>
        {expandedSections.subjects && (
          <div className="space-y-2 px-4">
            {getFilteredSubjects().map((subject, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`subject-${index}`}
                  value={subject}
                  checked={selectedSubjects.includes(subject)}
                  onChange={() => handleSubjectToggle(subject)}
                />
                <label htmlFor={`subject-${index}`} className="ml-2">
                  {subject}
                </label>
              </div>
            ))}
            {selectedClassCategories.length === 0 && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Select class categories to view subjects
              </p>
            )}
          </div>
        )}
      </div>

      {/* Skills Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("skills")}
          className="flex items-center justify-between w-full mb-3"
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

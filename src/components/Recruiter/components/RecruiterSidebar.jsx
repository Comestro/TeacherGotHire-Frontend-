import React, { useEffect, useRef, useState } from "react";
import { BsGeoAlt, BsPersonWorkspace, BsCode, BsCheck, BsSearch, BsBriefcase } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { MdExpandMore, MdExpandLess, MdSchool, MdFilterAlt, MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllSkills,
  getQualification,
  getClassCategory,
} from "../../../features/jobProfileSlice";
import { fetchTeachers } from "../../../features/teacherFilterSlice";
import { motion, AnimatePresence } from "framer-motion";

const RecruiterSidebar = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);

  // State for filters
  const [filters, setFilters] = useState({
    district: [],
    pincode: [],
    block: [],
    village: [],
    state: [],
    qualification: [],
    skill: [],
    class_category: [],
    subject: [],
    experience_years: { min: "", max: "" },
    gender: [],
    exam_status: [],
    job_role: [],
    religion: [],
    marital_status: [],
    language: [],
    total_marks: { min: "", max: "" },
  });

  // State for screen size detection
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  // Get data from redux store
  const { qualification, allSkill, classCategories } = useSelector(
    (state) => state.jobProfile
  );

  // State for local data
  const [qualificationData, setQualificationData] = useState([]);
  const [skillData, setSkillData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [selectedClassCategories, setSelectedClassCategories] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [searchSkill, setSearchSkill] = useState("");

  // Location input state
  const [inputValues, setInputValues] = useState({
    pincode: "",
    district: "",
    block: "",
    village: "",
  });

  // Section toggle state
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    education: false,
    experience: false,
    classCategory: false,
    subjects: false,
    skills: false,
    gender: false,
    examStatus: false,
    jobRole: false,
    religion: false,
    maritalStatus: false,
    language: false,
    totalMarks: false,
  });

  // Initial data fetch
  useEffect(() => {
    dispatch(getAllSkills());
    dispatch(getQualification());
    dispatch(getClassCategory());
  }, [dispatch]);

  // Update local data when redux data changes
  useEffect(() => {
    setQualificationData(qualification);
    setSkillData(allSkill);
    setCategoryData(classCategories);
  }, [qualification, allSkill, classCategories]);

  // Handle clicks outside sidebar to close on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Filter subjects based on selected class categories
  const getFilteredSubjects = () => {
    if (selectedClassCategories.length === 0) return [];

    return classCategories
      .filter((category) => selectedClassCategories.includes(category.name))
      .map((category) => ({
        categoryName: category.name,
        subjects: [
          ...new Set(category.subjects.map((sub) => sub.subject_name)),
        ],
      }));
  };

  // Toggle handlers for selections
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

  const handleSubjectToggle = (categoryName, subjectName) => {
    setSelectedSubjects((prev) => {
      const categorySubjects = prev[categoryName] || [];
      return {
        ...prev,
        [categoryName]: categorySubjects.includes(subjectName)
          ? categorySubjects.filter((sub) => sub !== subjectName)
          : [...categorySubjects, subjectName],
      };
    });
  };

  // Location input handlers
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

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      handleAddValue(field);
    }
  };

  const handleRemoveValue = (field, index) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Section toggle handler
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Clear all filters
  const handleClear = () => {
    setFilters({
      district: [],
      pincode: [],
      block: [],
      village: [],
      state: [],
      qualification: [],
      skill: [],
      class_category: [],
      subject: [],
      experience_years: { min: "", max: "" },
      gender: [],
      exam_status: [],
      job_role: [],
      religion: [],
      marital_status: [],
      language: [],
      total_marks: { min: "", max: "" },
    });

    setSelectedSkills([]);
    setSelectedQualifications([]);
    setSelectedClassCategories([]);
    setSelectedSubjects({});
    setSearchSkill("");

    setExpandedSections({
      location: true,
      education: false,
      experience: false,
      classCategory: false,
      subjects: false,
      skills: false,
      gender: false,
      examStatus: false,
      jobRole: false,
      religion: false,
      maritalStatus: false,
      language: false,
      totalMarks: false,
    });
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
    const allSubjects = Object.values(selectedSubjects).flat();
    setFilters((prev) => ({ ...prev, subject: allSubjects }));
  }, [selectedSubjects]);

  // Fetch teachers when filters change
  useEffect(() => {
    dispatch(fetchTeachers(filters));
  }, [dispatch, filters]);

  // Animation variants for framer-motion
  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  // Component rendering
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed left-0 top-20 bg-white z-30 p-3 rounded-r-lg"
        aria-label="Open filters"
      >
        <MdFilterAlt className="text-primary text-xl" />
      </button>

      {/* Sidebar - Flipkart Style */}
      <motion.div
        ref={sidebarRef}
        className=" left-0 top-16 bg-white overflow-y-auto
            w-[85vw] max-w-[350px] z-50 md:z-30 md:translate-x-0 md:w-[350px] border-r"
        variants={sidebarVariants}
        initial={isDesktop ? "open" : "closed"}
        animate={(isOpen || isDesktop) ? "open" : "closed"}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b px-4 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-text uppercase">Filters</h2>
            <button
              onClick={handleClear}
              className="text-xs text-primary hover:text-accent font-semibold uppercase"
              aria-label="Clear all filters"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="divide-y">
          {/* Location Filter */}
          <div className="border-b">
            <button
              onClick={() => toggleSection("location")}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-2">
                <BsGeoAlt className="text-text" size={16} />
                <span className="font-semibold text-text uppercase text-sm">Location</span>
              </div>
              {expandedSections.location ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {expandedSections.location && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    {["state", "district", "block", "village", "pincode"].map((field) => (
                      <div className="space-y-2" key={field}>
                        <label htmlFor={field} className="text-xs font-medium text-secondary uppercase">
                          {field}
                        </label>
                        <div className="flex space-x-2">
                          <input
                            id={field}
                            name={field}
                            type="text"
                            value={inputValues[field] || ""}
                            onChange={handleInputChange}
                            onKeyDown={(e) => handleKeyDown(e, field)}
                            placeholder={`Enter ${field}`}
                            className="border rounded px-3 py-1.5 w-full text-sm focus:outline-none focus:border-primary"
                          />
                          <button
                            onClick={() => handleAddValue(field)}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                            aria-label={`Add ${field}`}
                          >
                            <BsCheck className="w-5 h-5" />
                          </button>
                        </div>

                        {filters[field] && filters[field].length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {filters[field].map((value, index) => (
                              <div
                                key={index}
                                className="flex items-center bg-background text-text px-2 py-1 rounded text-xs"
                              >
                                <span>{value}</span>
                                <button
                                  onClick={() => handleRemoveValue(field, index)}
                                  className="ml-1 hover:text-primary"
                                  aria-label={`Remove ${value}`}
                                >
                                  <IoMdClose className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Education Filter */}
          <div className="border-b">
            <button
              onClick={() => toggleSection("education")}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-2">
                <MdSchool className="text-text" size={16} />
                <span className="font-semibold text-text uppercase text-sm">Education</span>
              </div>
              {expandedSections.education ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {expandedSections.education && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2 max-h-60 overflow-y-auto">
                    {qualificationData.map((qualification) => (
                      <label
                        key={qualification.id}
                        className="flex items-center py-1 cursor-pointer group"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            id={`qualification-${qualification.id}`}
                            className="sr-only"
                            checked={selectedQualifications.includes(qualification.name)}
                            onChange={() => handleQualificationToggle(qualification.name)}
                          />
                          {selectedQualifications.includes(qualification.name) ? (
                            <MdCheckBox className="text-primary w-6 h-5" />
                          ) : (
                            <MdCheckBoxOutlineBlank className="text-secondary w-5 h-5 group-hover:text-primary" />
                          )}
                        </div>
                        <span className="ml-2 text-sm text-text">
                          {qualification.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Experience Filter */}
          <div className="border-b">
            <button
              onClick={() => toggleSection("experience")}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-2">
                <BsBriefcase className="text-text" size={16} />
                <span className="font-semibold text-text uppercase text-sm">Experience</span>
              </div>
              {expandedSections.experience ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {expandedSections.experience && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.experience_years.min}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          experience_years: { ...prev.experience_years, min: e.target.value }
                        }))}
                        className="border rounded px-3 py-1.5 w-full text-sm focus:outline-none focus:border-primary"
                      />
                      <span className="text-secondary">to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.experience_years.max}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          experience_years: { ...prev.experience_years, max: e.target.value }
                        }))}
                        className="border rounded px-3 py-1.5 w-full text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <p className="text-xs text-secondary mt-2">Years of experience</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Gender Filter */}
          <div className="border-b">
            <button
              onClick={() => toggleSection("gender")}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-background transition-colors"
            >
              <span className="font-semibold text-text uppercase text-sm">Gender</span>
              {expandedSections.gender ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {expandedSections.gender && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                      { label: "Other", value: "other" }
                    ].map((gender) => (
                      <label
                        key={gender.value}
                        className="flex items-center py-1 cursor-pointer group"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={filters.gender.includes(gender.value)}
                            onChange={() => {
                              setFilters(prev => ({
                                ...prev,
                                gender: prev.gender.includes(gender.value)
                                  ? prev.gender.filter(g => g !== gender.value)
                                  : [...prev.gender, gender.value]
                              }));
                            }}
                          />
                          {filters.gender.includes(gender.value) ? (
                            <MdCheckBox className="text-primary w-5 h-5" />
                          ) : (
                            <MdCheckBoxOutlineBlank className="text-secondary w-5 h-5 group-hover:text-primary" />
                          )}
                        </div>
                        <span className="ml-2 text-sm text-text">{gender.label}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Job Role Filter */}
          <div className="border-b">
            <button
              onClick={() => toggleSection("jobRole")}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-2">
                <BsBriefcase className="text-text" size={16} />
                <span className="font-semibold text-text uppercase text-sm">Job Role</span>
              </div>
              {expandedSections.jobRole ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {expandedSections.jobRole && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2 max-h-60 overflow-y-auto">
                    {["Principal", "Teacher", "Warden( Hostel )", "Assistant Teacher"].map((role) => (
                      <label
                        key={role}
                        className="flex items-center py-1 cursor-pointer group"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={filters.job_role.includes(role)}
                            onChange={() => {
                              setFilters(prev => ({
                                ...prev,
                                job_role: prev.job_role.includes(role)
                                  ? prev.job_role.filter(r => r !== role)
                                  : [...prev.job_role, role]
                              }));
                            }}
                          />
                          {filters.job_role.includes(role) ? (
                            <MdCheckBox className="text-primary w-5 h-5" />
                          ) : (
                            <MdCheckBoxOutlineBlank className="text-secondary w-5 h-5 group-hover:text-primary" />
                          )}
                        </div>
                        <span className="ml-2 text-sm text-text">{role}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Class Category Filter */}
          <div className="border-b">
            <button
              onClick={() => toggleSection("classCategory")}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-2">
                <BsPersonWorkspace className="text-text" size={16} />
                <span className="font-semibold text-text uppercase text-sm">Class Category</span>
              </div>
              {expandedSections.classCategory ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {expandedSections.classCategory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2 max-h-60 overflow-y-auto">
                    {categoryData.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center py-1 cursor-pointer group"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={selectedClassCategories.includes(category.name)}
                            onChange={() => handleClassCategoryToggle(category.name)}
                          />
                          {selectedClassCategories.includes(category.name) ? (
                            <MdCheckBox className="text-primary w-5 h-5" />
                          ) : (
                            <MdCheckBoxOutlineBlank className="text-secondary w-5 h-5 group-hover:text-primary" />
                          )}
                        </div>
                        <span className="ml-2 text-sm text-text">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subjects Filter */}
          <div className="border-b">
            <button
              onClick={() => toggleSection("subjects")}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-background transition-colors"
            >
              <span className="font-semibold text-text uppercase text-sm">Subjects</span>
              {expandedSections.subjects ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {expandedSections.subjects && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 max-h-72 overflow-y-auto">
                    {getFilteredSubjects().length > 0 ? (
                      getFilteredSubjects().map((categoryGroup, index) => (
                        <div key={index} className="mb-3">
                          <h4 className="text-xs font-bold text-secondary mb-2 uppercase">
                            {categoryGroup.categoryName}
                          </h4>
                          <div className="space-y-2 pl-2">
                            {categoryGroup.subjects.map((subject, subIndex) => (
                              <label
                                key={subIndex}
                                className="flex items-center py-1 cursor-pointer group"
                              >
                                <div className="relative flex items-center">
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={(selectedSubjects[categoryGroup.categoryName] || []).includes(subject)}
                                    onChange={() => handleSubjectToggle(categoryGroup.categoryName, subject)}
                                  />
                                  {(selectedSubjects[categoryGroup.categoryName] || []).includes(subject) ? (
                                    <MdCheckBox className="text-primary w-5 h-5" />
                                  ) : (
                                    <MdCheckBoxOutlineBlank className="text-secondary w-5 h-5 group-hover:text-primary" />
                                  )}
                                </div>
                                <span className="ml-2 text-sm text-text">{subject}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-secondary">
                          Select class categories first
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Skills Filter */}
          <div className="border-b">
            <button
              onClick={() => toggleSection("skills")}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-2">
                <BsCode className="text-text" size={16} />
                <span className="font-semibold text-text uppercase text-sm">Skills</span>
              </div>
              {expandedSections.skills ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {expandedSections.skills && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search skills..."
                        value={searchSkill}
                        onChange={(e) => setSearchSkill(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border rounded text-sm focus:outline-none focus:border-primary"
                      />
                      <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={14} />
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {skillData
                        .filter((skill) =>
                          skill.name.toLowerCase().includes(searchSkill.toLowerCase())
                        )
                        .map((skill) => (
                          <label
                            key={skill.id}
                            className="flex items-center py-1 cursor-pointer group"
                          >
                            <div className="relative flex items-center">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={selectedSkills.includes(skill.name)}
                                onChange={() => handleSkillToggle(skill.name)}
                              />
                              {selectedSkills.includes(skill.name) ? (
                                <MdCheckBox className="text-primary w-5 h-5" />
                              ) : (
                                <MdCheckBoxOutlineBlank className="text-secondary w-5 h-5 group-hover:text-primary" />
                              )}
                            </div>
                            <span className="ml-2 text-sm text-text">{skill.name}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Exam Status Filter */}
          <div className="border-b">
            <button
              onClick={() => toggleSection("examStatus")}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-background transition-colors"
            >
              <span className="font-semibold text-text uppercase text-sm">Exam Status</span>
              {expandedSections.examStatus ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {expandedSections.examStatus && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {["Qualified", "Not Qualified", "Pending"].map((status) => (
                      <label
                        key={status}
                        className="flex items-center py-1 cursor-pointer group"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={filters.exam_status.includes(status)}
                            onChange={() => {
                              setFilters(prev => ({
                                ...prev,
                                exam_status: prev.exam_status.includes(status)
                                  ? prev.exam_status.filter(s => s !== status)
                                  : [...prev.exam_status, status]
                              }));
                            }}
                          />
                          {filters.exam_status.includes(status) ? (
                            <MdCheckBox className="text-primary w-5 h-5" />
                          ) : (
                            <MdCheckBoxOutlineBlank className="text-secondary w-5 h-5 group-hover:text-primary" />
                          )}
                        </div>
                        <span className="ml-2 text-sm text-text">{status}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Religion Filter */}
          <div className="border-b">
            <button
              onClick={() => toggleSection("religion")}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-background transition-colors"
            >
              <span className="font-semibold text-text uppercase text-sm">Religion</span>
              {expandedSections.religion ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {expandedSections.religion && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Other"].map((religion) => (
                      <label
                        key={religion}
                        className="flex items-center py-1 cursor-pointer group"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={filters.religion.includes(religion)}
                            onChange={() => {
                              setFilters(prev => ({
                                ...prev,
                                religion: prev.religion.includes(religion)
                                  ? prev.religion.filter(r => r !== religion)
                                  : [...prev.religion, religion]
                              }));
                            }}
                          />
                          {filters.religion.includes(religion) ? (
                            <MdCheckBox className="text-primary w-5 h-5" />
                          ) : (
                            <MdCheckBoxOutlineBlank className="text-secondary w-5 h-5 group-hover:text-primary" />
                          )}
                        </div>
                        <span className="ml-2 text-sm text-text">{religion}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Marital Status Filter */}
          <div className="border-b">
            <button
              onClick={() => toggleSection("maritalStatus")}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-background transition-colors"
            >
              <span className="font-semibold text-text uppercase text-sm">Marital Status</span>
              {expandedSections.maritalStatus ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {expandedSections.maritalStatus && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {["single", "married", "divorced", "widowed"].map((status) => (
                      <label
                        key={status}
                        className="flex items-center py-1 cursor-pointer group"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={filters.marital_status.includes(status)}
                            onChange={() => {
                              setFilters(prev => ({
                                ...prev,
                                marital_status: prev.marital_status.includes(status)
                                  ? prev.marital_status.filter(s => s !== status)
                                  : [...prev.marital_status, status]
                              }));
                            }}
                          />
                          {filters.marital_status.includes(status) ? (
                            <MdCheckBox className="text-primary w-5 h-5" />
                          ) : (
                            <MdCheckBoxOutlineBlank className="text-secondary w-5 h-5 group-hover:text-primary" />
                          )}
                        </div>
                        <span className="ml-2 text-sm text-text capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Language Filter */}
          <div className="border-b">
            <button
              onClick={() => toggleSection("language")}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-background transition-colors"
            >
              <span className="font-semibold text-text uppercase text-sm">Language</span>
              {expandedSections.language ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {expandedSections.language && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {["Hindi", "English", "Bengali", "Telugu", "Tamil", "Urdu", "Other"].map((language) => (
                      <label
                        key={language}
                        className="flex items-center py-1 cursor-pointer group"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={filters.language.includes(language)}
                            onChange={() => {
                              setFilters(prev => ({
                                ...prev,
                                language: prev.language.includes(language)
                                  ? prev.language.filter(l => l !== language)
                                  : [...prev.language, language]
                              }));
                            }}
                          />
                          {filters.language.includes(language) ? (
                            <MdCheckBox className="text-primary w-5 h-5" />
                          ) : (
                            <MdCheckBoxOutlineBlank className="text-secondary w-5 h-5 group-hover:text-primary" />
                          )}
                        </div>
                        <span className="ml-2 text-sm text-text">{language}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Total Marks Filter */}
          <div className="border-b">
            <button
              onClick={() => toggleSection("totalMarks")}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-2">
                <MdSchool className="text-text" size={16} />
                <span className="font-semibold text-text uppercase text-sm">Total Marks</span>
              </div>
              {expandedSections.totalMarks ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {expandedSections.totalMarks && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.total_marks.min}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          total_marks: { ...prev.total_marks, min: e.target.value }
                        }))}
                        className="border rounded px-3 py-1.5 w-full text-sm focus:outline-none focus:border-primary"
                      />
                      <span className="text-secondary">to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.total_marks.max}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          total_marks: { ...prev.total_marks, max: e.target.value }
                        }))}
                        className="border rounded px-3 py-1.5 w-full text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <p className="text-xs text-secondary mt-2">Exam marks range</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default RecruiterSidebar;
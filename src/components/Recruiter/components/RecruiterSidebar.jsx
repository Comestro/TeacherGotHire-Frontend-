import React, { useEffect, useRef, useState } from "react";
import { BsGeoAlt, BsPersonWorkspace, BsCode, BsCheck, BsSearch } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { MdExpandMore, MdExpandLess, MdSchool, MdFilterAlt } from "react-icons/md";
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
    qualification: [],
    skill: [],
    class_category: [],
    subject: [],
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
    location: false,
    education: false,
    experience: false,
    classCategory: false,
    subjects: false,
    skills: false,
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
      qualification: [],
      skill: [],
      class_category: [],
      subject: [],
    });

    setSelectedSkills([]);
    setSelectedQualifications([]);
    setSelectedClassCategories([]);
    setSelectedSubjects({});
    setSearchSkill("");

    setExpandedSections({
      location: false,
      education: false,
      experience: false,
      classCategory: false,
      subjects: false,
      skills: false,
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
        className="md:hidden fixed left-0 top-20 bg-white shadow-md z-30 p-3 rounded-r-lg"
        aria-label="Open filters"
      >
        <MdFilterAlt className="text-teal-600 text-xl" />
      </button>

      {/* Sidebar */}
      <motion.div
        ref={sidebarRef}
        className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg overflow-y-auto
            w-[85vw] max-w-[320px] z-50 md:z-30 md:translate-x-0 md:w-72"
        variants={sidebarVariants}
        initial={isDesktop ? "open" : "closed"}
        animate={(isOpen || isDesktop) ? "open" : "closed"}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 shadow-sm px-4 py-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <MdFilterAlt className="text-teal-600 mr-2" />
              Filters
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClear}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                aria-label="Clear all filters"
              >
                <IoMdClose className="w-4 h-4" />
                Clear
              </button>
              <button
                className="md:hidden text-gray-500"
                onClick={() => setIsOpen(false)}
                aria-label="Close sidebar"
              >
                <IoMdClose className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Location Section */}
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("location")}
              className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BsGeoAlt className="text-teal-600" />
                <span className="font-medium text-gray-800">Location</span>
              </div>
              {expandedSections.location ? <MdExpandLess /> : <MdExpandMore />}
            </button>

            <AnimatePresence>
              {expandedSections.location && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-4">
                    {["pincode", "district", "block", "village"].map((field) => (
                      <div className="space-y-2" key={field}>
                        <label htmlFor={field} className="text-sm font-medium text-gray-700 capitalize">
                          {field}
                        </label>
                        <div className="flex space-x-2">
                          <input
                            id={field}
                            name={field}
                            type="text"
                            value={inputValues[field]}
                            onChange={handleInputChange}
                            onKeyDown={(e) => handleKeyDown(e, field)}
                            placeholder={`Enter ${field}`}
                            className="border rounded-md px-3 py-2 w-full text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => handleAddValue(field)}
                            className="p-2 bg-teal-100 text-teal-600 rounded-md hover:bg-teal-200 transition-colors"
                            aria-label={`Add ${field}`}
                          >
                            <BsCheck className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {filters[field].map((value, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-teal-50 border border-teal-200 text-teal-700 px-2 py-1 rounded-full text-sm"
                            >
                              <span>{value}</span>
                              <button
                                onClick={() => handleRemoveValue(field, index)}
                                className="ml-1 p-0.5 rounded-full hover:bg-teal-200 text-teal-700"
                                aria-label={`Remove ${value}`}
                              >
                                <IoMdClose className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Education Section */}
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("education")}
              className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MdSchool className="text-teal-600" />
                <span className="font-medium text-gray-800">Education</span>
              </div>
              {expandedSections.education ? <MdExpandLess /> : <MdExpandMore />}
            </button>

            <AnimatePresence>
              {expandedSections.education && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                    {qualificationData.map((qualification) => (
                      <label
                        key={qualification.id}
                        className="flex items-center p-1.5 rounded hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          id={`qualification-${qualification.id}`}
                          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          checked={selectedQualifications.includes(qualification.name)}
                          onChange={() => handleQualificationToggle(qualification.name)}
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {qualification.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Class Category Section */}
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("classCategory")}
              className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BsPersonWorkspace className="text-teal-600" />
                <span className="font-medium text-gray-800">Class Category</span>
              </div>
              {expandedSections.classCategory ? <MdExpandLess /> : <MdExpandMore />}
            </button>

            <AnimatePresence>
              {expandedSections.classCategory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                    {categoryData.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center p-1.5 rounded hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          id={`classCategory-${category.id}`}
                          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          checked={selectedClassCategories.includes(category.name)}
                          onChange={() => handleClassCategoryToggle(category.name)}
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subjects Section */}
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("subjects")}
              className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BsPersonWorkspace className="text-teal-600" />
                <span className="font-medium text-gray-800">Subjects</span>
              </div>
              {expandedSections.subjects ? <MdExpandLess /> : <MdExpandMore />}
            </button>

            <AnimatePresence>
              {expandedSections.subjects && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 max-h-72 overflow-y-auto">
                    {getFilteredSubjects().length > 0 ? (
                      getFilteredSubjects().map((categoryGroup, index) => (
                        <div key={index} className="mb-3">
                          <h4 className="text-sm font-semibold text-teal-700 mb-2 bg-teal-50 p-2 rounded">
                            {categoryGroup.categoryName}
                          </h4>
                          <div className="space-y-1 ml-2">
                            {categoryGroup.subjects.map((subject, subIndex) => (
                              <label
                                key={subIndex}
                                className="flex items-center p-1.5 rounded hover:bg-gray-50"
                              >
                                <input
                                  type="checkbox"
                                  id={`subject-${index}-${subIndex}`}
                                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                  checked={(selectedSubjects[categoryGroup.categoryName] || []).includes(subject)}
                                  onChange={() => handleSubjectToggle(categoryGroup.categoryName, subject)}
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  {subject}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">
                          Please select class categories first to view subjects
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Skills Section */}
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("skills")}
              className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BsCode className="text-teal-600" />
                <span className="font-medium text-gray-800">Skills</span>
              </div>
              {expandedSections.skills ? <MdExpandLess /> : <MdExpandMore />}
            </button>

            <AnimatePresence>
              {expandedSections.skills && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BsSearch className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search skills..."
                        value={searchSkill}
                        onChange={(e) => setSearchSkill(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    {selectedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 py-2 border-b border-gray-100">
                        {selectedSkills.map((skill, idx) => (
                          <div key={idx} className="flex items-center bg-teal-50 border border-teal-200 text-teal-700 px-2 py-1 rounded-full text-sm">
                            <span>{skill}</span>
                            <button
                              onClick={() => handleSkillToggle(skill)}
                              className="ml-1 p-0.5 rounded-full hover:bg-teal-200 text-teal-700"
                            >
                              <IoMdClose className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {skillData
                        .filter((skill) =>
                          skill.name.toLowerCase().includes(searchSkill.toLowerCase())
                        )
                        .map((skill) => (
                          <label
                            key={skill.id}
                            className="flex items-center p-1.5 rounded hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              id={`skill-${skill.id}`}
                              className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              checked={selectedSkills.includes(skill.name)}
                              onChange={() => handleSkillToggle(skill.name)}
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {skill.name}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="md:hidden py-4">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default RecruiterSidebar;
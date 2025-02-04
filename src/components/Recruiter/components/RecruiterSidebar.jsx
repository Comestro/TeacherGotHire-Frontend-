import React, { useEffect, useState } from "react";
import {
  BsGeoAlt,
  BsPersonWorkspace,
  BsBriefcase,
  BsCode,
} from "react-icons/bs";
import { BsCheck } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { MdExpandMore, MdExpandLess, MdSchool } from "react-icons/md";
import { fetchTeachers } from "../../../services/teacherFilterService";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllSkills,
  getQualification,
  getClassCategory,
} from "../../../features/jobProfileSlice";

const RecruiterSidebar = () => {
  const dispatch = useDispatch();

  const [filters, setFilters] = useState({
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

  const { qualification, allSkill, classCategories, subject } = useSelector(
    (state) => state.jobProfile
  );

  console.log("Subject in Filter sidebar", subject);

  useEffect(() => {
    dispatch(getAllSkills());
    dispatch(getQualification());
    dispatch(getClassCategory());
  }, []);

  const [qualificationData, setQualificationData] = useState([]);
  const [skillData, setSkillData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // set all the slice value in my local state
  useEffect(() => {
    setQualificationData(qualification);
    setSkillData(allSkill);
    setCategoryData(classCategories);
  }, [qualification, allSkill, classCategories]);

  // this is the local state for selected skills, qualification and class category
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [selectedClassCategories, setSelectedClassCategories] = useState([]);


  // function for update selected skills, qualification and class category
  // for skills
  const handleSkillToggle = (skillName) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skillName)) {
        return prev.filter((skill) => skill !== skillName);
      } else {
        return [...prev, skillName];
      }
    });
  };

  // for qualification
  const handleQualificationToggle = (qualificationName) => {
    setSelectedQualifications((prev) => {
      if (prev.includes(qualificationName)) {
        return prev.filter((name) => name !== qualificationName);
      } else {
        return [...prev, qualificationName];
      }
    });
  };

  // for class category
  const handleClassCategoryToggle = (categoryName) => {
    setSelectedClassCategories((prev) => {
      if (prev.includes(categoryName)) {
        return prev.filter((name) => name !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };


// update the filters when selected skills, qualification and class category change
  useEffect(() => {
    setFilters((prev) => ({ ...prev, skill: selectedSkills }));
  }, [selectedSkills]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, qualification: selectedQualifications }));
  }, [selectedQualifications]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, class_category: selectedClassCategories }));
  }, [selectedClassCategories]);

  // location work
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
    const fetchData = async () => {
      try {
        const data = await fetchTeachers(filters);
        console.log("api response for teacher", data);
      } catch (error) {
        console.error("Error fetching filtered teachers:", error);
      }
    };

    fetchData();
  }, [filters]);



  const [expandedSections, setExpandedSections] = useState({
    location: false,
    education: false,
    experience: false,
    classCategory: false,
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
      classCategory: [],
    });

    setSelectedSkills([]);
    setSelectedQualifications([]);
    setSelectedClassCategories([]);

    setExpandedSections({
      location: false,
      education: false,
      experience: false,
      skills: false,
      classCategory: false,
    });
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
                      <span className="">{value}</span>
                      <button
                        onClick={() => handleRemoveValue(field, index)}
                        className="text-red-600  ml-2 h-2 w-2 flex rounded-full"
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
              {qualificationData.map((qualification) => (
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

      <div className="mb-6 border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection("classCategory")}
          className="flex items-center justify-between w-full mb-3"
          aria-expanded={expandedSections.classCategory}
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
          <div className="space-y-3 ">
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
// import React, { useEffect, useState, useCallback } from "react";
// import {
//   BsGeoAlt,
//   BsPersonWorkspace,
//   BsBriefcase,
//   BsCode,
// } from "react-icons/bs";
// import { IoMdClose } from "react-icons/io";
// import { MdExpandMore, MdExpandLess, MdSchool } from "react-icons/md";
// import { useSelector } from "react-redux";
// import debounce from "lodash.debounce";

// const RecruiterSidebar = ({ onFilterChange }) => {
//   const [filters, setFilters] = useState({
//     district: "",
//     pincode: "",
//     block: "",
//     village: "",
//     qualification: [],
//     experience: { min: "", max: "" },
//     skill: [],
//     classCategory: [],
//   });

//   const [qualificationData, setQualificationData] = useState([]);
//   const [skillData, setSkillData] = useState([]);
//   const [categoryData, setCategoryData] = useState([]);

//   const [selectedSkills, setSelectedSkills] = useState([]);
//   const [selectedQualifications, setSelectedQualifications] = useState([]);
//   const [selectedClassCategories, setSelectedClassCategories] = useState([]);

//   const {
//     qualification,
//     allSkill,
//     classCategories,
//   } = useSelector((state) => state.jobProfile);

//   useEffect(() => {
//     setQualificationData(qualification || []);
//     setSkillData(allSkill || []);
//     setCategoryData(classCategories || []);
//   }, [qualification, allSkill, classCategories]);

//   // Debounced filter change
//   const debouncedFilterChange = useCallback(
//     debounce((updatedFilters) => {
//       onFilterChange(updatedFilters);
//     }, 500),
//     [onFilterChange]
//   );

//   const updateFilters = (updatedFilters) => {
//     setFilters(updatedFilters);
//     debouncedFilterChange(updatedFilters);
//   };

//   // Handle input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     updateFilters({
//       ...filters,
//       [name]: value,
//     });
//   };

//   // Handle skill toggle
//   const handleSkillToggle = (skillName) => {
//     const updatedSkills = selectedSkills.includes(skillName)
//       ? selectedSkills.filter((skill) => skill !== skillName)
//       : [...selectedSkills, skillName];

//     setSelectedSkills(updatedSkills);
//   };

//   useEffect(() => {
//     updateFilters({ ...filters, skill: selectedSkills });
//   }, [selectedSkills]);

//   // Handle qualification toggle
//   const handleQualificationToggle = (qualificationName) => {
//     const updatedQualifications = selectedQualifications.includes(
//       qualificationName
//     )
//       ? selectedQualifications.filter((name) => name !== qualificationName)
//       : [...selectedQualifications, qualificationName];

//     setSelectedQualifications(updatedQualifications);
//   };

//   useEffect(() => {
//     updateFilters({ ...filters, qualification: selectedQualifications });
//   }, [selectedQualifications]);

//   // Handle class category toggle
//   const handleClassCategoryToggle = (categoryName) => {
//     const updatedCategories = selectedClassCategories.includes(categoryName)
//       ? selectedClassCategories.filter((name) => name !== categoryName)
//       : [...selectedClassCategories, categoryName];

//     setSelectedClassCategories(updatedCategories);
//   };

//   useEffect(() => {
//     updateFilters({ ...filters, classCategory: selectedClassCategories });
//   }, [selectedClassCategories]);

//   // Handle experience change
//   const handleExperienceChange = (e) => {
//     const { name, value } = e.target;
//     updateFilters({
//       ...filters,
//       experience: {
//         ...filters.experience,
//         [name]: value,
//       },
//     });
//   };

//   const [expandedSections, setExpandedSections] = useState({
//     location: false,
//     education: false,
//     experience: false,
//     classCategory: false,
//     skills: false,
//   });

//   const [searchSkill, setSearchSkill] = useState("");

//   const toggleSection = (section) => {
//     setExpandedSections((prev) => ({
//       ...prev,
//       [section]: !prev[section],
//     }));
//   };

//   const handleClear = () => {
//     setFilters({
//       district: "",
//       pincode: "",
//       block: "",
//       village: "",
//       qualification: [],
//       experience: { min: "", max: "" },
//       skill: [],
//       classCategory: [],
//     });
//     setSelectedSkills([]);
//     setSelectedQualifications([]);
//     setSelectedClassCategories([]);
//     setExpandedSections({
//       location: false,
//       education: false,
//       experience: false,
//       skills: false,
//       classCategory: false,
//     });
//     onFilterChange({});
//   };

//   return (
//     <div className="fixed left-0 top-16 h-screen w-72 bg-white shadow-lg overflow-y-auto p-4 hidden md:block">
//      <div className="flex justify-between items-center mb-6">        <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
//         <button
//           onClick={handleClear}
//           className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
//           aria-label="Clear all filters"
//         >
//           <IoMdClose className="w-4 h-4" />
//           Clear All
//         </button>
//       </div>

//       {/* Location Section */}
//       <div className="mb-6 border-b border-gray-200 pb-4">
//         <button
//           onClick={() => toggleSection("location")}
//           className="flex items-center justify-between w-full mb-3"
//           aria-expanded={expandedSections.location}
//         >
//           <div className="flex items-center gap-2">
//             <BsGeoAlt className="text-teal-600" />
//             <span className="font-semibold text-gray-800">Location</span>
//           </div>
//           {expandedSections.location ? <MdExpandLess /> : <MdExpandMore />}
//         </button>
//         {expandedSections.location && (
//           <div className="space-y-2 px-2">
//             {["pincode", "district", "block", "village"].map((field) => (
//               <div className="flex flex-col py-2" key={field}>
//                 <input
//                   id={field}
//                   name={field}
//                   type="text"
//                   value={filters[field]}
//                   onChange={handleInputChange}
//                   placeholder={`Search by ${field}`}
//                   className="border-b pb-1 px-2 outline-none focus:outline-none placeholder:text-[16px] text-gray-600"
//                 />
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Education Section */}
//       <div className="mb-6 border-b border-gray-200 pb-4">
//         <button
//           onClick={() => toggleSection("education")}
//           className="flex items-center justify-between w-full mb-3"
//           aria-expanded={expandedSections.education}
//         >
//           <div className="flex items-center gap-2">
//             <MdSchool className="text-teal-600" />
//             <span className="font-semibold text-gray-800">Education</span>
//           </div>
//           {expandedSections.education ? <MdExpandLess /> : <MdExpandMore />}
//         </button>
//         <div>
//           {expandedSections.education && (
//             <div className="space-y-2 px-4">
//               {quealificationData.map((qualification) => (
//                 <div key={qualification.id} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id={`qualification-${qualification.id}`}
//                     value={qualification.name}
//                     checked={selectedQualifications.includes(
//                       qualification.name
//                     )}
//                     onChange={() =>
//                       handleQualificationToggle(qualification.name)
//                     }
//                   />
//                   <label
//                     htmlFor={`qualification-${qualification.id}`}
//                     className="ml-2"
//                   >
//                     {qualification.name}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="mb-6 border-b border-gray-200 pb-4">
//         <button
//           onClick={() => toggleSection("classCategory")}
//           className="flex items-center justify-between w-full mb-3"
//           aria-expanded={expandedSections.classCategory}
//         >
//           <div className="flex items-center gap-2">
//             <BsPersonWorkspace className="text-teal-600" />
//             <span className="font-semibold text-gray-800">Class Category</span>
//           </div>
//           {expandedSections.classCategory ? <MdExpandLess /> : <MdExpandMore />}
//         </button>
//         {expandedSections.classCategory && (
//           <div className="space-y-2 px-4">
//             {categoryData.map((category) => (
//               <div key={category.id} className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id={`classCategory-${category.id}`}
//                   value={category.name}
//                   checked={selectedClassCategories.includes(category.name)}
//                   onChange={() => handleClassCategoryToggle(category.name)}
//                 />
//                 <label
//                   htmlFor={`classCategory-${category.id}`}
//                   className="ml-2"
//                 >
//                   {category.name}
//                 </label>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Experience Section */}
//       <div className="mb-6 border-b border-gray-200 pb-4">
//         <button
//           onClick={() => toggleSection("experience")}
//           className="flex items-center justify-between w-full mb-3"
//           aria-expanded={expandedSections.experience}
//         >
//           <div className="flex items-center gap-2">
//             <BsBriefcase className="text-teal-600" />
//             <span className="font-semibold text-gray-800">Experience</span>
//           </div>
//           {expandedSections.experience ? <MdExpandLess /> : <MdExpandMore />}
//         </button>
//         {expandedSections.experience && (
//           <div className="space-y-4">
//             <div className="flex gap-4">
//               <div className="flex-1">
//                 <label className="block text-sm text-gray-600 mb-1">Min</label>
//                 <input
//                   type="number"
//                   min="0"
//                   max="15"
//                   onChange={(e) =>
//                     setFilters((prev) => ({
//                       ...prev,
//                       experience: { ...prev.experience, min: e.target.value },
//                     }))
//                   }
//                   className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//               <div className="flex-1">
//                 <label className="block text-sm text-gray-600 mb-1">Max</label>
//                 <input
//                   type="number"
//                   min="0"
//                   max="15"
//                   onChange={(e) =>
//                     setFilters((prev) => ({
//                       ...prev,
//                       experience: { ...prev.experience, max: e.target.value },
//                     }))
//                   }
//                   className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Skills Section */}
//       <div className="mb-6">
//         <button
//           onClick={() => toggleSection("skills")}
//           className="flex items-center justify-between w-full mb-3"
//           aria-expanded={expandedSections.skills}
//         >
//           <div className="flex items-center gap-2">
//             <BsCode className="text-teal-600" />
//             <span className="font-semibold text-gray-800">Skills</span>
//           </div>
//           {expandedSections.skills ? <MdExpandLess /> : <MdExpandMore />}
//         </button>
//         {expandedSections.skills && (
//           <div className="space-y-3">
//             <input
//               type="text"
//               placeholder="Search skills..."
//               value={searchSkill}
//               onChange={(e) => setSearchSkill(e.target.value)}
//               className="w-full pb-1 border-b border-gray-300 focus:outline-none"
//             />
//             <div className="space-y-2 max-h-40 overflow-y-auto">
//               {skillData
//                 .filter((skill) =>
//                   skill.name.toLowerCase().includes(searchSkill.toLowerCase())
//                 )
//                 .map((skill) => (
//                   <div key={skill.id} className="flex items-center pl-4">
//                     <input
//                       type="checkbox"
//                       id={`skill-${skill.id}`}
//                       value={skill.name}
//                       checked={selectedSkills.includes(skill.name)}
//                       onChange={() => handleSkillToggle(skill.name)}
//                     />
//                     <label htmlFor={`skill-${skill.id}`} className="ml-2">
//                       {skill.name}
//                     </label>
//                   </div>
//                 ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RecruiterSidebar;
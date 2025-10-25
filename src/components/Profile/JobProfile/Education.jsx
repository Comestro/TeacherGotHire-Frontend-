import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  getEducationProfile,
  getQualification,
  postEducationProfile,
  putEducationProfile,
  delEducationProfile,
  resetError,
} from "../../../features/jobProfileSlice";
import { HiOutlineAcademicCap, HiOutlineTrash, HiOutlinePencil, HiOutlineBookOpen, HiOutlinePresentationChartBar, HiOutlineClipboard } from "react-icons/hi";
import { HiOutlinePlusCircle, HiOutlineXMark, HiOutlineXCircle } from "react-icons/hi2";
import { HiOutlineCheck } from "react-icons/hi";
import Loader from "../../Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Education = () => {
  const dispatch = useDispatch();
  const qualification = useSelector(
    (state) => state?.jobProfile?.qualification
  );


  const { error, educationData } = useSelector(
    (state) => state.jobProfile || []
  );
  console.log("Education Data", educationData);
  console.log("Error:", error);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedDegreeType, setSelectedDegreeType] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  // Add new state for subject selections
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [subjectInput, setSubjectInput] = useState({ name: '', marks: '' });

  // Define streams for Intermediate
  const intermediateStreams = [
    { value: "Science", label: "I.Sc - Intermediate Science" },
    { value: "Commerce", label: "I.Com - Intermediate Commerce" },
    { value: "Arts", label: "I.A - Intermediate Arts" },
  ];

  // Define degree types for Bachelor's
  const bachelorDegrees = [
    { value: "B.A", label: "B.A - Bachelor of Arts" },
    { value: "B.Sc", label: "B.Sc - Bachelor of Science" },
    { value: "B.Com", label: "B.Com - Bachelor of Commerce" },
    { value: "BCA", label: "BCA - Bachelor of Computer Applications" },
    { value: "BBA", label: "BBA - Bachelor of Business Administration" },
    { value: "B.Tech", label: "B.Tech - Bachelor of Technology" },
    { value: "B.E", label: "B.E - Bachelor of Engineering" },
    { value: "LLB", label: "LLB - Bachelor of Laws" },
    { value: "Other", label: "Other" },
  ];

  // Define degree types for Master's
  const masterDegrees = [
    { value: "M.A", label: "M.A - Master of Arts" },
    { value: "M.Sc", label: "M.Sc - Master of Science" },
    { value: "M.Com", label: "M.Com - Master of Commerce" },
    { value: "MCA", label: "MCA - Master of Computer Applications" },
    { value: "MBA", label: "MBA - Master of Business Administration" },
    { value: "M.Tech", label: "M.Tech - Master of Technology" },
    { value: "M.E", label: "M.E - Master of Engineering" },
    { value: "LLM", label: "LLM - Master of Laws" },
    { value: "Other", label: "Other" },
  ];

  // Define common subjects for Matriculation
  const matricSubjects = [
    "Mathematics", "Science", "English", "Hindi", "Social Science",
    "Sanskrit", "Computer Science", "Physical Education"
  ];

  // Define the qualification order mapping - moved to component level so it can be reused
  const qualificationOrder = {
    "Matriculation": 1,
    "Matric": 1,
    "SSC": 1,
    "10th": 1,
    "Intermediate": 2,
    "HSSC": 2,
    "Inter": 2,
    "12th": 2,
    "Associate": 3,
    "Bachelor": 3,
    "Bachelor's": 3,
    "BS": 3,
    "BSc": 3,
    "BA": 3,
    "BBA": 3,
    "B.Tech": 3,
    "Master": 4,
    "Master's": 4,
    "MS": 4,
    "MSc": 4,
    "MA": 4,
    "MBA": 4,
    "M.Tech": 4,
    "M.Phil": 5,
    "MPhil": 5,
    "PhD": 6,
    "Doctorate": 6,
    "Post Doctorate": 7,
    "Diploma": 8,
    "Certificate": 9,
  };

  // Add handler for adding subject with marks
  const handleAddSubject = () => {
    if (subjectInput.name && subjectInput.marks) {
      const percentage = parseFloat(subjectInput.marks);
      if (percentage >= 0 && percentage <= 100) {
        setSelectedSubjects(prev => [...prev, { ...subjectInput }]);
        setSubjectInput({ name: '', marks: '' }); // Reset input
      } else {
        toast.error("Percentage must be between 0 and 100 / प्रतिशत 0 से 100 के बीच होना चाहिए");
      }
    }
  };

  // Fix handleRemoveSubject function syntax
  const handleRemoveSubject = (index) => {
    setSelectedSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleQualificationChange = (e) => {
    const value = e.target.value;
    setSelectedQualification(value);
    setValue("qualification", value);
    
    // Reset dependent selections
    setSelectedStream("");
    setSelectedDegreeType("");
    setSelectedSubjects([]);
  };

  // Fetch education data on component mount
  useEffect(() => {
    dispatch(getQualification());
    dispatch(getEducationProfile());
  }, []);

  const fetchProfile = () => {
    dispatch(getEducationProfile());
  };

  // Add this function to determine the next allowed qualification levels
  const getNextAllowedQualificationLevels = (existingEducations) => {
    // If no education exists yet, allow all education levels to start with
    if (!existingEducations || existingEducations.length === 0) {
      return Object.values(qualificationOrder); // Allow all qualification levels initially
    }
    
    // Track which levels already exist in the user's education
    const existingLevels = new Set();
    
    // Get all qualification levels that the user already has
    existingEducations.forEach(education => {
      let qualName = "";
      
      // Extract qualification name
      if (education.qualification?.name) {
        qualName = education.qualification.name;
      } else if (typeof education.qualification === 'string') {
        qualName = education.qualification;
      } else {
        qualName = education.qualification_name || "";
      }
      
      // Get the level for this qualification
      const level = qualificationOrder[qualName] || 0;
      
      // Add to existing levels
      if (level > 0) {
        existingLevels.add(level);
      }
    });
    
    // Convert to array for easier checking
    const existingLevelsArray = Array.from(existingLevels);
    
    // Allow any qualification level that doesn't already exist
    return Object.values(qualificationOrder).filter(level => !existingLevels.has(level));
  };

  // Function to sort qualifications for the dropdown
  const getSortedQualifications = (qualifications) => {
    if (!qualifications || qualifications.length === 0) {
      return [];
    }
    
    // Get the allowed qualification levels for new entries
    const allowedLevels = getNextAllowedQualificationLevels(educationData);
    
    // Filter and sort qualifications
    return [...qualifications]
      .filter(qual => {
        const level = qualificationOrder[qual.name] || 100;
        return allowedLevels.includes(level);
      })
      .sort((a, b) => {
        const orderA = qualificationOrder[a.name] || 100;
        const orderB = qualificationOrder[b.name] || 100;
        return orderA - orderB;
      });
  };

  // Function to sort education data by qualification level
  const getSortedEducationData = (data) => {
    if (!data || data.length === 0) {
      return [];
    }
    
    // Create a copy of the data to avoid mutating the original
    const sorted = [...data].sort((a, b) => {
      // First try to get the qualification name from the object structure
      let qualA = a.qualification?.name;
      let qualB = b.qualification?.name;
      
      // If qualification is just a string (not an object)
      if (typeof a.qualification === 'string') {
        qualA = a.qualification;
      }
      
      if (typeof b.qualification === 'string') {
        qualB = b.qualification;
      }
      
      // If we still don't have qualification names, try backup properties
      qualA = qualA || a.qualification_name || "";
      qualB = qualB || b.qualification_name || "";
      
      // Get the order values, default to a high number if not found
      const orderA = qualificationOrder[qualA] || 100;
      const orderB = qualificationOrder[qualB] || 100;
      
      // If order is the same, sort by year of passing (newest first)
      if (orderA === orderB) {
        const yearA = parseInt(a.year_of_passing) || 0;
        const yearB = parseInt(b.year_of_passing) || 0;
        return yearB - yearA; // Newest first
      }
      
      return orderA - orderB;
    });
    
    return sorted;
  };

  // Handle saving or updating education data
  const onSubmit = async (data) => {
    try {
      console.log("data", data);
      setLoading(true);
      
      // Send only base qualification to API
      // Store stream/degree info separately for display purposes
      let qualificationName = selectedQualification;
      let streamOrDegree = "";
      
      if (selectedQualification === "Intermediate" && selectedStream) {
        streamOrDegree = selectedStream;
      } else if (selectedQualification === "Bachelor" && selectedDegreeType) {
        streamOrDegree = selectedDegreeType === "Other" 
          ? data.customDegree || "" 
          : selectedDegreeType;
      } else if (selectedQualification === "Master" && selectedDegreeType) {
        streamOrDegree = selectedDegreeType === "Other" 
          ? data.customDegree || "" 
          : selectedDegreeType;
      }
      
      const payload = {
        institution: data.institution,
        qualification: qualificationName, // Send only base qualification
        year_of_passing: data.year_of_passing,
        grade_or_percentage: data.grade_or_percentage,
        session: data.session || "",
        board_or_university: data.board_or_university || "",
        stream_or_degree: streamOrDegree, // Add stream/degree as separate field
        subjects: selectedSubjects.map(subject => ({
          name: subject.name,
          marks: parseFloat(subject.marks)
        }))
      };

      if (editingIndex !== null) {
        const id = educationData[editingIndex].id;
        await dispatch(putEducationProfile({ payload, id })).unwrap();
        fetchProfile();
        toast.success("Education details updated successfully! / शिक्षा विवरण सफलतापूर्वक अपडेट किया गया!");
      } else {
        await dispatch(postEducationProfile(payload)).unwrap();
        fetchProfile();
        toast.success("Education details added successfully! / शिक्षा विवरण सफलतापूर्वक जोड़ा गया!");
      }

      setIsEditing(false);
      setEditingIndex(null);
      setSelectedSubjects([]);
      setSelectedStream("");
      setSelectedDegreeType("");
      reset();
    } catch (err) {
      console.error("Error:", err);
      // Handle different error formats
      let errorMessage = "Failed to save education details / शिक्षा विवरण सहेजने में विफल";
      
      if (err?.error) {
        errorMessage = err.error;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage, {
        autoClose: 3000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setIsEditing(true);
    const education = educationData[index];
  
    // Set form values
    Object.keys(education).forEach((key) => {
      setValue(key, education[key]);
    });
    
    // Set selected qualification for the dropdown
    if (education.qualification && education.qualification.name) {
      setSelectedQualification(education.qualification.name);
    }
  
    // Populate selectedSubjects with existing subjects
    setSelectedSubjects(education.subjects || []);
  };

  const handleDelete = async (index) => {
    try {
      const id = educationData[index].id;
      await dispatch(delEducationProfile({ id: id })).unwrap();
      fetchProfile();
      toast.success("Education details deleted successfully!");
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.message || "Failed to delete education details");
    }
  };

  return (
    <div className="px-2 sm:px-4 lg:px-6 mt-4 sm:mt-8 py-4 sm:py-6 rounded-2xl bg-white border border-gray-100">
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
      {/* Enhanced Header */}
      {loading && <Loader />}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[#3E98C7]/15">
        <div className="mb-0">
          <h2 className="text-xl sm:text-2xl font-bold text-[#3E98C7] mb-1 flex items-center gap-2">
            <HiOutlineAcademicCap className="text-2xl" />
            Education Background
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Manage your academic qualifications and educational history
          </p>
        </div>
        {!isEditing && (
          <button
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] hover:from-[#2A6476] hover:to-[#3E98C7] transition-all rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
            onClick={() => {
              reset();
              setIsEditing(true);
            }}
          >
            <HiOutlinePlusCircle className="size-4 sm:size-5" />
            <span className="whitespace-nowrap">Add Education</span>
          </button>
        )}
      </div>

      {/* No Data State */}
      {educationData.length < 1 && !isEditing && (
        <div className="p-4 sm:p-6 text-center rounded-xl bg-[#3E98C7]/5 border border-dashed border-[#3E98C7]/25">
          <HiOutlineAcademicCap className="mx-auto size-10 sm:size-12 text-[#3E98C7]/60 mb-2 sm:mb-3" />
          <h3 className="text-[#3E98C7] font-medium text-sm sm:text-base">No education added yet</h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Click 'Add Education' to get started
          </p>
        </div>
      )}

      {/* Education Table - Desktop */}
      {!isEditing && educationData.length > 0 && (
        <>
          {/* Mobile Cards View */}
          <div className="block lg:hidden space-y-4">
            {getSortedEducationData(educationData).map((education, index) => (
              <div key={index} className="bg-[#3E98C7]/5 rounded-xl p-4 border border-[#3E98C7]/20 hover:border-[#3E98C7]/30 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {education.qualification?.name || "N/A"}
                    </h3>
                    {education.stream_or_degree && (
                      <span className="inline-block mt-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 text-purple-800 rounded-full text-xs font-semibold">
                        {education.stream_or_degree}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => {
                        handleEdit(index);
                        setIsEditing(true);
                        setEditingRowIndex(index);
                      }}
                      className="p-1.5 text-gray-500 hover:text-[#3E98C7] rounded-lg hover:bg-[#3E98C7]/10 transition-all"
                    >
                      <HiOutlinePencil className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-1.5 text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <HiOutlineTrash className="size-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500">Session:</span>
                      <p className="font-medium text-gray-700">{education.session || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Year:</span>
                      <p className="font-medium text-gray-700">{education.year_of_passing || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Institution:</span>
                    <p className="font-medium text-gray-700 break-words">{education.institution || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Board/University:</span>
                    <p className="font-medium text-gray-700 break-words">{education.board_or_university || "N/A"}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Grade/Marks:</span>
                    <p className="font-medium text-gray-700">{education.grade_or_percentage || "N/A"}</p>
                  </div>
                  
                  {education.subjects && education.subjects.length > 0 && (
                    <div>
                      <span className="text-gray-500">Subjects:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {education.subjects.map((subject, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between px-3 py-2 bg-white/80 border border-[#3E98C7]/20 rounded-lg min-w-[100px] shadow-sm"
                          >
                            <span className="text-xs font-semibold text-[#3E98C7] mr-2">
                              {subject.name}
                            </span>
                            <span className="text-xs font-bold text-white bg-[#3E98C7] px-2 py-1 rounded-full">
                              {subject.marks}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#3E98C7]/8">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Course Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Stream/Degree</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Session</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Passing Year</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Institution</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Board/University</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Subjects</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Result/Marks(%)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getSortedEducationData(educationData).map((education, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b text-sm">
                      <span className="font-semibold text-gray-900">
                        {education.qualification?.name || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b text-sm">
                      {education.stream_or_degree ? (
                        <span className="inline-block px-3 py-1 bg-[#3E98C7]/15 text-[#3E98C7] rounded-full text-xs font-semibold">
                          {education.stream_or_degree}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-b text-sm">
                      <span className="font-medium text-gray-700">
                        {education.session || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b text-sm">
                      {education.year_of_passing || "N/A"}
                    </td>
                    <td className="px-4 py-3 border-b text-sm">
                      {education.institution || "N/A"}
                    </td>
                    <td className="px-4 py-3 border-b text-sm">
                      {education.board_or_university || "N/A"}
                    </td>
                    <td className="px-4 py-3 border-b text-sm">
                      <div className="flex flex-col gap-2 max-w-xs">
                        {education.subjects && education.subjects.length > 0 ? (
                          education.subjects.map((subject, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between px-3 py-2 bg-white/90 border border-[#3E98C7]/20 rounded-lg min-w-[120px] shadow-sm"
                            >
                              <span className="text-xs font-semibold text-[#3E98C7]">
                                {subject.name}
                              </span>
                              <span className="text-xs font-bold text-white bg-[#3E98C7] px-2 py-1 rounded-full ml-2">
                                {subject.marks}%
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">No subjects added</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b text-sm">
                      {education.grade_or_percentage || "N/A"}
                    </td>
                    <td className="px-4 py-3 border-b text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleEdit(index);
                            setIsEditing(true);
                            setEditingRowIndex(index);
                          }}
                          className="p-1.5 text-gray-500 hover:text-[#3E98C7] rounded-lg hover:bg-[#3E98C7]/10 transition-all"
                        >
                          <HiOutlinePencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="p-1.5 text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                        >
                          <HiOutlineTrash className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Form */}
      {isEditing && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-3 sm:p-6 rounded-2xl border border-[#3E98C7]/15"
        >
          {/* Step 1: Select Qualification Level */}
          <div className="mb-6 sm:mb-8 p-3 sm:p-5 bg-[#3E98C7]/5 rounded-xl border border-[#3E98C7]/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <HiOutlineAcademicCap className="w-7 h-7 sm:w-8 sm:h-8 text-[#3E98C7]" />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Step 1: Select Qualification Level</h3>
                <p className="text-xs sm:text-sm text-gray-600">Choose your education level / शिक्षा स्तर चुनें</p>
              </div>
            </div>
            
            <select
              value={selectedQualification}
              onChange={handleQualificationChange}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base font-medium"
            >
              <option value="" disabled>
                Select Qualification Level / योग्यता स्तर चुनें
              </option>
              {qualification.map((role) => {
                const qualLevel = qualificationOrder[role.name] || 100;
                const allowedLevels = getNextAllowedQualificationLevels(educationData);
                const alreadyAdded = educationData.some(edu => 
                  (edu.qualification?.name === role.name) || 
                  (typeof edu.qualification === 'string' && edu.qualification === role.name)
                );
                const isDisabled = alreadyAdded && 
                  (editingIndex === null || educationData[editingIndex]?.qualification?.name !== role.name);
                const isCurrentlyEditing = editingIndex !== null && 
                  educationData[editingIndex]?.qualification?.name === role.name;
                const isEnabled = isCurrentlyEditing || (allowedLevels.includes(qualLevel) && !isDisabled);
                
                return (
                  <option 
                    key={role.id} 
                    value={role.name}
                    disabled={!isEnabled}
                    className={!isEnabled ? "text-gray-400" : ""}
                  >
                    {role.name} {alreadyAdded ? "(Already added / पहले से जोड़ा गया)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedQualification && (
            <>
              {/* Step 2: Stream/Degree Type Selection (for Intermediate, Bachelor, Master) */}
              {selectedQualification === "Intermediate" && (
                <div className="mb-6 sm:mb-8 p-3 sm:p-5 bg-green-50/50 rounded-xl border border-green-200/60 animate-fadeIn">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <HiOutlineBookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Step 2: Select Stream</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Choose your intermediate stream / अपनी स्ट्रीम चुनें</p>
                    </div>
                  </div>
                  
                  <select
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm sm:text-base font-medium"
                    required
                  >
                    <option value="">Select Stream / स्ट्रीम चुनें</option>
                    {intermediateStreams.map((stream) => (
                      <option key={stream.value} value={stream.value}>
                        {stream.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedQualification === "Bachelor" && (
                <div className="mb-6 sm:mb-8 p-3 sm:p-5 bg-purple-50/50 rounded-xl border border-purple-200/60 animate-fadeIn">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <HiOutlineAcademicCap className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Step 2: Select Degree Type</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Choose your bachelor's degree / स्नातक डिग्री चुनें</p>
                    </div>
                  </div>
                  
                  <select
                    value={selectedDegreeType}
                    onChange={(e) => setSelectedDegreeType(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm sm:text-base font-medium"
                    required
                  >
                    <option value="">Select Degree / डिग्री चुनें</option>
                    {bachelorDegrees.map((degree) => (
                      <option key={degree.value} value={degree.value}>
                        {degree.label}
                      </option>
                    ))}
                  </select>
                  
                  {selectedDegreeType === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter your degree name / अपनी डिग्री का नाम दर्ज करें"
                      className="w-full mt-2 sm:mt-3 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                      {...register("customDegree", { 
                        required: selectedDegreeType === "Other" ? "Please enter degree name" : false 
                      })}
                    />
                  )}
                </div>
              )}

              {selectedQualification === "Master" && (
                <div className="mb-6 sm:mb-8 p-3 sm:p-5 bg-orange-50/50 rounded-xl border border-orange-200/60 animate-fadeIn">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <HiOutlineAcademicCap className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" />
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Step 2: Select Degree Type</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Choose your master's degree / मास्टर डिग्री चुनें</p>
                    </div>
                  </div>
                  
                  <select
                    value={selectedDegreeType}
                    onChange={(e) => setSelectedDegreeType(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-sm sm:text-base font-medium"
                    required
                  >
                    <option value="">Select Degree / डिग्री चुनें</option>
                    {masterDegrees.map((degree) => (
                      <option key={degree.value} value={degree.value}>
                        {degree.label}
                      </option>
                    ))}
                  </select>
                  
                  {selectedDegreeType === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter your degree name / अपनी डिग्री का नाम दर्ज करें"
                      className="w-full mt-2 sm:mt-3 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                      {...register("customDegree", { 
                        required: selectedDegreeType === "Other" ? "Please enter degree name" : false 
                      })}
                    />
                  )}
                </div>
              )}

              {/* Step 3: Basic Information */}
              <div className="mb-6 sm:mb-8 p-3 sm:p-5 bg-teal-50/50 rounded-xl border border-teal-200/60 animate-fadeIn">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <HiOutlineClipboard className="w-7 h-7 sm:w-8 sm:h-8 text-teal-600" />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      Step {selectedQualification === "Intermediate" || selectedQualification === "Bachelor" || selectedQualification === "Master" ? "3" : "2"}: Basic Information
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">Enter your academic details / अपनी शैक्षणिक जानकारी दर्ज करें</p>
                  </div>
                </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Institution <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Institution Name / संस्थान का नाम"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                  {...register("institution", {
                    required: "Institution is required / संस्थान आवश्यक है",
                  })}
                />
                {errors.institution && (
                  <span className="text-red-500 text-xs sm:text-sm">
                    {errors.institution.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Board/University
                </label>
                <input
                  type="text"
                  placeholder="Enter board or university name / बोर्ड या विश्वविद्यालय का नाम"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                  {...register("board_or_university")}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Session
                </label>
                <input
                  type="text"
                  placeholder="YYYY-YY (e.g., 2020-22)"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                  {...register("session")}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Year of Passing <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="YYYY"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                  maxLength={4}
                  {...register("year_of_passing", {
                    required: "Year is required / वर्ष आवश्यक है",
                    pattern: {
                      value: /^\d{4}$/,
                      message: "Please enter a valid 4-digit year (e.g., 2023)",
                    },
                    validate: (value) => {
                      const currentYear = new Date().getFullYear();
                      if (value < 1900 || value > currentYear) {
                        return `Year must be between 1900 and ${currentYear}`;
                      }
                      return true;
                    },
                  })}
                />
                {errors.year_of_passing && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {errors.year_of_passing.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Grade/Percentage <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter grade or percentage / ग्रेड या प्रतिशत"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                  {...register("grade_or_percentage", {
                    required: "Grade or percentage is required",
                    validate: (value) => {
                      const isGrade = /^[A-Da-d]$/.test(value);
                      const isPercentage = /^\d{1,3}%?$/.test(value);

                      if (isGrade) {
                        return true;
                      } else if (isPercentage) {
                        const numericValue = parseFloat(value.replace("%", ""));
                        if (numericValue >= 0 && numericValue <= 100) {
                          return true;
                        }
                        return "Percentage must be between 0% and 100%";
                      }
                      return "Please enter a valid grade (A, B, C, D) or a percentage (0-100%)";
                    },
                  })}
                />
                {errors.grade_or_percentage && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {errors.grade_or_percentage.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          </div>

          {/* Step 4: Add Subjects with Percentage */}
          <div className="mb-6 sm:mb-8 p-3 sm:p-5 bg-[#3E98C7]/8 rounded-xl border border-[#3E98C7]/25 animate-fadeIn">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <HiOutlinePresentationChartBar className="w-7 h-7 sm:w-8 sm:h-8 text-[#3E98C7]" />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Step {selectedQualification === "Intermediate" || selectedQualification === "Bachelor" || selectedQualification === "Master" ? "4" : "3"}: Add Subjects & Percentage
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">Add subjects with their percentage / विषय और प्रतिशत जोड़ें</p>
              </div>
            </div>
            
            {/* Quick Add for Matric Subjects */}
            {selectedQualification === "Matriculation" && (
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Quick Select Common Subjects / सामान्य विषय चुनें:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {matricSubjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => {
                        if (!selectedSubjects.find(s => s.name === subject)) {
                          setSubjectInput({ name: subject, marks: '' });
                        }
                      }}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-all"
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="text"
                  placeholder="Subject Name / विषय का नाम"
                  value={subjectInput.name}
                  onChange={(e) => setSubjectInput(prev => ({ ...prev, name: e.target.value }))}
                  className="md:w-3/6 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3E98C7] focus:border-[#3E98C7] text-sm sm:text-base"
                />
                <input
                  type="number"
                  placeholder="Percentage % / प्रतिशत"
                  value={subjectInput.marks}
                  onChange={(e) => setSubjectInput(prev => ({ ...prev, marks: e.target.value }))}
                  min="0"
                  max="100"
                  className="md:w-2/6 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3E98C7] focus:border-[#3E98C7] text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={handleAddSubject}
                  disabled={!subjectInput.name || !subjectInput.marks}
                  className="md:w-1/6 sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] hover:from-[#2A6476] hover:to-[#3E98C7] text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 text-sm sm:text-base"
                >
                  Add / जोड़ें
                </button>
              </div>
              
              {/* Selected Subjects List */}
              {selectedSubjects.length > 0 && (
                <div className="mt-3 sm:mt-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Added Subjects / जोड़े गए विषय ({selectedSubjects.length}):</p>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {selectedSubjects.map((subject, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/90 border border-[#3E98C7]/25 rounded-lg shadow-sm hover:shadow-md transition-all"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-[#3E98C7]">
                          {subject.name}
                        </span>
                        <span className="text-xs bg-[#3E98C7] text-white px-2 py-1 rounded-full font-bold">
                          {subject.marks}%
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-all transform hover:scale-110"
                        >
                          <HiOutlineXMark className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          </>
          )}

          {/* Form Actions */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[#3E98C7]/15 flex flex-col sm:flex-row-reverse sm:justify-start gap-2 sm:gap-3">
            <button
              type="submit"
              disabled={!selectedQualification}
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] hover:from-[#2A6476] hover:to-[#3E98C7] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 order-2 sm:order-1"
            >
              <div className="flex items-center justify-center gap-2">
                <HiOutlineCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Save Education / शिक्षा सहेजें</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setSelectedQualification("");
                setSelectedStream("");
                setSelectedDegreeType("");
                setSelectedSubjects([]);
                reset();
                dispatch(resetError());
              }}
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border border-[#3E98C7] text-[#3E98C7] hover:bg-[#3E98C7]/10 font-semibold rounded-xl transition-all text-sm sm:text-base order-1 sm:order-2"
            >
              <div className="flex items-center justify-center gap-2">
                <HiOutlineXCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Cancel / रद्द करें</span>
              </div>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Education;
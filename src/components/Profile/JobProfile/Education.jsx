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
import { HiOutlineCheck, HiOutlineEye } from "react-icons/hi";
import Loader from "../../Loader";
import ErrorMessage from "../../ErrorMessage";

const Education = () => {
  const dispatch = useDispatch();
  const qualification = useSelector(
    (state) => state?.jobProfile?.qualification
  );


  const { error, educationData } = useSelector(
    (state) => state.jobProfile || []
  );



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
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState(null);
  const [generalError, setGeneralError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Define streams for Intermediate
  const intermediateStreams = [
    { value: "Science", label: "I.Sc - Intermediate Science" },
    { value: "Commerce", label: "I.Com - Intermediate Commerce" },
    { value: "Arts", label: "I.A - Intermediate Arts" },
    { value: "Other", label: "Other" },
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
        setGeneralError("Percentage must be between 0 and 100 / प्रतिशत 0 से 100 के बीच होना चाहिए");
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
    // If no education exists yet, only allow level 1 (Matriculation)
    if (!existingEducations || existingEducations.length === 0) {
      return [1]; // Only allow Matriculation to start
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

    // Get the maximum level the user has
    const maxLevel = existingLevels.size > 0 ? Math.max(...Array.from(existingLevels)) : 0;

    // For adding new education:
    // 1. Can add the next level only (maxLevel + 1)
    // 2. Can also add any missing levels before maxLevel
    const allowedLevels = [];

    // Add all missing levels from 1 to maxLevel
    for (let i = 1; i <= maxLevel; i++) {
      if (!existingLevels.has(i)) {
        allowedLevels.push(i);
      }
    }

    // Add the next level if it's within our defined range (1-6)
    if (maxLevel < 6 && !allowedLevels.includes(maxLevel + 1)) {
      allowedLevels.push(maxLevel + 1);
    }

    return allowedLevels;
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

      setLoading(true);
      setGeneralError(null);
      setSuccessMessage(null);

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
        await dispatch(putEducationProfile({ payload, id })).unwrap();
        fetchProfile();
        setSuccessMessage("Education details updated successfully! / शिक्षा विवरण सफलतापूर्वक अपडेट किया गया!");
      } else {
        await dispatch(postEducationProfile(payload)).unwrap();
        fetchProfile();
        setSuccessMessage("Education details added successfully! / शिक्षा विवरण सफलतापूर्वक जोड़ा गया!");
      }

      setIsEditing(false);
      setEditingIndex(null);
      setSelectedSubjects([]);
      setSelectedStream("");
      setSelectedDegreeType("");
      reset();
    } catch (err) {

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

      setGeneralError(errorMessage);
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
      // Get the qualification level of the education being deleted
      const educationToDelete = educationData[index];
      let qualName = "";

      if (educationToDelete.qualification?.name) {
        qualName = educationToDelete.qualification.name;
      } else if (typeof educationToDelete.qualification === 'string') {
        qualName = educationToDelete.qualification;
      } else {
        qualName = educationToDelete.qualification_name || "";
      }

      const levelToDelete = qualificationOrder[qualName] || 0;

      // Check if there are any higher level qualifications
      const hasHigherLevels = educationData.some((edu, idx) => {
        if (idx === index) return false; // Skip the one being deleted

        let eduQualName = "";
        if (edu.qualification?.name) {
          eduQualName = edu.qualification.name;
        } else if (typeof edu.qualification === 'string') {
          eduQualName = edu.qualification;
        } else {
          eduQualName = edu.qualification_name || "";
        }

        const eduLevel = qualificationOrder[eduQualName] || 0;
        return eduLevel > levelToDelete;
      });

      // If there are higher levels, prevent deletion
      if (hasHigherLevels) {
        setGeneralError(
          "Cannot delete this qualification! Please delete higher level qualifications first. / इस योग्यता को हटाया नहीं जा सकता! कृपया पहले उच्च स्तर की योग्यता हटाएं।"
        );
        return;
      }

      const id = educationData[index].id;
      await dispatch(delEducationProfile({ id: id })).unwrap();
      fetchProfile();
      await dispatch(delEducationProfile({ id: id })).unwrap();
      fetchProfile();
      setSuccessMessage("Education details deleted successfully! / शिक्षा विवरण सफलतापूर्वक हटाया गया!");
    } catch (err) {

      setGeneralError(err.response?.data?.message || "Failed to delete education details / शिक्षा विवरण हटाने में विफल");
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-background/30 rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm">
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
      {/* Enhanced Header */}
      {loading && <Loader />}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-secondary/20">
        <div className="mb-0">
          <h2 className="text-lg md:text-2xl font-bold text-text flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg">
              <HiOutlineAcademicCap className="text-2xl text-primary" aria-hidden="true" />
            </div>
            Education Background
            <span className="ml-2 text-secondary text-sm font-normal">/ शैक्षिक पृष्ठभूमि</span>
          </h2>
          <p className="text-sm text-secondary ml-9">
            Manage your academic qualifications and educational history
          </p>
        </div>
        {!isEditing && (
          <button
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary w-full sm:w-auto"
            onClick={() => {
              reset();
              setIsEditing(true);
            }}
          >
            <HiOutlinePlusCircle className="h-5 w-5" aria-hidden="true" />
            <span className="whitespace-nowrap">Add Education</span>
          </button>
        )}
      </div>
      {/* No Data State */}
      {educationData.length < 1 && !isEditing && (
        <div className="p-8 text-center rounded-xl bg-background border-2 border-dashed border-secondary/10">
          <div className="p-4 bg-primary/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <HiOutlineAcademicCap className="h-10 w-10 text-primary" aria-hidden="true" />
          </div>
          <h3 className="text-text font-bold text-lg mb-1">No education added yet</h3>
          <p className="text-sm text-secondary mb-3">
            Click 'Add Education' to get started
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <HiOutlineAcademicCap className="h-5 w-5" />
            <span className="font-medium">Start with Matriculation / मैट्रिक से शुरू करें</span>
          </div>
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

                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedEducation(education);
                        setViewDetailsModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#3E98C7]/10 hover:bg-[#3E98C7]/20 text-[#3E98C7] rounded-lg transition-all font-medium text-xs"
                    >
                      <HiOutlineEye className="size-4" />
                      View Full Details
                    </button>
                  </div>
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
                        <button
                          onClick={() => {
                            setSelectedEducation(education);
                            setViewDetailsModal(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-[#3E98C7] rounded-lg hover:bg-[#3E98C7]/10 transition-all"
                          title="View Full Details"
                        >
                          <HiOutlineEye className="size-4" />
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
          className="bg-gradient-to-br from-white to-background/20 p-4 rounded-xl border border-secondary/30 shadow-sm"
        >
          {/* Step 1: Select Qualification Level */}
          <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <HiOutlineAcademicCap className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-text">Step 1: Qualification Level <span className="text-secondary font-normal">/ योग्यता स्तर</span></h3>
              </div>
            </div>

            <select
              value={selectedQualification}
              onChange={handleQualificationChange}
              className="w-full px-3 py-2 border border-secondary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white text-sm font-medium transition-all"
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

                // Helper to get disabled reason
                const getDisabledReason = () => {
                  if (alreadyAdded) return " (Already added / पहले से जोड़ा गया)";
                  if (!allowedLevels.includes(qualLevel)) {
                    if (educationData.length === 0 && qualLevel !== 1) {
                      return " (Add Matriculation first / पहले मैट्रिक जोड़ें)";
                    }
                    if (qualLevel > Math.max(...allowedLevels)) {
                      return " (Complete previous levels first / पहले पिछला स्तर पूरा करें)";
                    }
                  }
                  return "";
                };

                return (
                  <option
                    key={role.id}
                    value={role.name}
                    disabled={!isEnabled}
                    className={!isEnabled ? "text-gray-400" : ""}
                  >
                    {role.name}{getDisabledReason()}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedQualification && (
            <>
              {/* Step 2: Stream/Degree Type Selection (for Intermediate, Bachelor, Master) */}
              {selectedQualification === "Intermediate" && (
                <div className="mb-4 p-4 bg-accent/5 rounded-lg border border-accent/20 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-accent/10 rounded-lg">
                      <HiOutlineBookOpen className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-sm font-bold text-text">Step 2: Select Stream <span className="text-secondary font-normal">/ स्ट्रीम चुनें</span></h3>
                  </div>

                  <select
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary/30 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-white text-sm font-medium transition-all"
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
                <div className="mb-4 p-4 bg-accent/5 rounded-lg border border-accent/20 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-accent/10 rounded-lg">
                      <HiOutlineAcademicCap className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-sm font-bold text-text">Step 2: Select Degree <span className="text-secondary font-normal">/ डिग्री चुनें</span></h3>
                  </div>

                  <select
                    value={selectedDegreeType}
                    onChange={(e) => setSelectedDegreeType(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary/30 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-white text-sm font-medium transition-all"
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
                      placeholder="Enter degree name / डिग्री का नाम"
                      className="w-full mt-2 px-3 py-2 border border-secondary/30 rounded-lg focus:ring-2 focus:ring-accent text-sm transition-all"
                      {...register("customDegree", {
                        required: selectedDegreeType === "Other" ? "Please enter degree name" : false
                      })}
                    />
                  )}
                </div>
              )}

              {selectedQualification === "Master" && (
                <div className="mb-4 p-4 bg-accent/5 rounded-lg border border-accent/20 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-accent/10 rounded-lg">
                      <HiOutlineAcademicCap className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-sm font-bold text-text">Step 2: Select Degree <span className="text-secondary font-normal">/ डिग्री चुनें</span></h3>
                  </div>

                  <select
                    value={selectedDegreeType}
                    onChange={(e) => setSelectedDegreeType(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary/30 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-white text-sm font-medium transition-all"
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
                      placeholder="Enter degree name / डिग्री का नाम"
                      className="w-full mt-2 px-3 py-2 border border-secondary/30 rounded-lg focus:ring-2 focus:ring-accent text-sm transition-all"
                      {...register("customDegree", {
                        required: selectedDegreeType === "Other" ? "Please enter degree name" : false
                      })}
                    />
                  )}
                </div>
              )}

              {/* Step 3: Basic Information */}
              <div className="mb-4 p-4 bg-secondary/5 rounded-lg border border-secondary/20 animate-fadeIn">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-secondary/10 rounded-lg">
                    <HiOutlineClipboard className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="text-sm font-bold text-text">
                    Step {selectedQualification === "Intermediate" || selectedQualification === "Bachelor" || selectedQualification === "Master" ? "3" : "2"}: Basic Information
                    <span className="text-secondary font-normal ml-1">/ जानकारी</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text mb-1">
                        Institution <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Institution Name"
                        className="w-full px-3 py-2 border border-secondary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all"
                        {...register("institution", {
                          required: "Institution is required",
                        })}
                      />
                      {errors.institution && (
                        <span className="text-error text-xs mt-0.5 block">
                          {errors.institution.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text mb-1">
                        Board/University
                      </label>
                      <input
                        type="text"
                        placeholder="Board/University Name"
                        className="w-full px-3 py-2 border border-secondary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all"
                        {...register("board_or_university")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text mb-1">
                        Session
                      </label>
                      <input
                        type="text"
                        placeholder="2020-22"
                        className="w-full px-3 py-2 border border-secondary/30 rounded-lg focus:ring-2 focus:ring-primary text-sm transition-all"
                        {...register("session")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text mb-1">
                        Year <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="YYYY"
                        className="w-full px-3 py-2 border border-secondary/30 rounded-lg focus:ring-2 focus:ring-primary text-sm transition-all"
                        maxLength={4}
                        {...register("year_of_passing", {
                          required: "Year is required",
                          pattern: {
                            value: /^\d{4}$/,
                            message: "Valid 4-digit year",
                          },
                          validate: (value) => {
                            const currentYear = new Date().getFullYear();
                            if (value < 1900 || value > currentYear) {
                              return `Year: 1900-${currentYear}`;
                            }
                            return true;
                          },
                        })}
                      />
                      {errors.year_of_passing && (
                        <p className="text-error text-xs mt-0.5">
                          {errors.year_of_passing.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text mb-1">
                        Grade/% <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Grade or %"
                        className="w-full px-3 py-2 border border-secondary/30 rounded-lg focus:ring-2 focus:ring-primary text-sm transition-all"
                        {...register("grade_or_percentage", {
                          required: "Required",
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
                              return "0-100%";
                            }
                            return "Grade (A-D) or %";
                          },
                        })}
                      />
                      {errors.grade_or_percentage && (
                        <p className="text-error text-xs mt-0.5">
                          {errors.grade_or_percentage.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Add Subjects with Percentage */}
              <div className="mb-4 p-4 bg-success/5 rounded-lg border border-success/20 animate-fadeIn">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-success/10 rounded-lg">
                    <HiOutlinePresentationChartBar className="w-5 h-5 text-success" />
                  </div>
                  <h3 className="text-sm font-bold text-text">
                    Step {selectedQualification === "Intermediate" || selectedQualification === "Bachelor" || selectedQualification === "Master" ? "4" : "3"}: Subjects
                    <span className="text-secondary font-normal ml-1">/ विषय (Optional)</span>
                  </h3>
                </div>

                {/* Quick Add for Matric Subjects */}
                {selectedQualification === "Matriculation" && (
                  <div className="mb-3 p-2.5 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-xs font-medium text-text mb-2">Quick Select:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {matricSubjects.map((subject) => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => {
                            if (!selectedSubjects.find(s => s.name === subject)) {
                              setSubjectInput({ name: subject, marks: '' });
                            }
                          }}
                          className="px-2 py-1 text-xs bg-white border border-primary/30 text-primary rounded hover:bg-primary/10 transition-all"
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Subject Name"
                      value={subjectInput.name}
                      onChange={(e) => setSubjectInput(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-secondary/30 rounded-lg focus:ring-2 focus:ring-success text-sm transition-all"
                    />
                    <input
                      type="number"
                      placeholder="%"
                      value={subjectInput.marks}
                      onChange={(e) => setSubjectInput(prev => ({ ...prev, marks: e.target.value }))}
                      min="0"
                      max="100"
                      className="w-20 px-3 py-2 border border-secondary/30 rounded-lg focus:ring-2 focus:ring-success text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubject}
                      disabled={!subjectInput.name || !subjectInput.marks}
                      className="px-4 py-2 bg-success hover:bg-success/90 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                    >
                      Add
                    </button>
                  </div>

                  {/* Selected Subjects List */}
                  {selectedSubjects.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-text mb-2">Added ({selectedSubjects.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSubjects.map((subject, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-success/30 rounded-lg shadow-sm hover:shadow transition-all"
                          >
                            <span className="text-xs font-semibold text-text">
                              {subject.name}
                            </span>
                            <span className="text-xs bg-success text-white px-2 py-0.5 rounded-full font-bold">
                              {subject.marks}%
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSubject(index)}
                              className="text-error hover:text-error/80 rounded-full p-0.5 transition-all"
                            >
                              <HiOutlineXMark className="h-3.5 w-3.5" />
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
          <div className="mt-4 pt-4 border-t border-secondary/20 flex flex-col-reverse sm:flex-row gap-2">
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
              className="flex-1 sm:flex-none px-4 py-2.5 border border-secondary/30 text-secondary hover:bg-secondary/10 font-medium rounded-lg transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedQualification}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <div className="flex items-center justify-center gap-2">
                <HiOutlineCheck className="w-4 h-4" />
                <span>Save Education</span>
              </div>
            </button>
          </div>
        </form>
      )}
      {/* View Details Modal */}
      {viewDetailsModal && selectedEducation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewDetailsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <HiOutlineAcademicCap className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Education Details</h3>
                    <p className="text-sm text-white/80">Complete qualification information</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewDetailsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <HiOutlineXMark className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Qualification Header */}
              <div className="bg-gradient-to-br from-[#3E98C7]/10 to-purple-50 p-4 rounded-xl border border-[#3E98C7]/20">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedEducation.qualification?.name || "N/A"}
                    </h4>
                    {selectedEducation.stream_or_degree && (
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 text-purple-800 rounded-full text-sm font-semibold">
                        {selectedEducation.stream_or_degree}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Year of Passing</div>
                    <div className="text-xl font-bold text-[#3E98C7]">{selectedEducation.year_of_passing}</div>
                  </div>
                </div>
              </div>

              {/* Basic Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlineBookOpen className="h-5 w-5 text-[#3E98C7]" />
                    <span className="text-sm font-semibold text-gray-600">Institution</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedEducation.institution || "N/A"}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlineAcademicCap className="h-5 w-5 text-[#3E98C7]" />
                    <span className="text-sm font-semibold text-gray-600">Board/University</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedEducation.board_or_university || "N/A"}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlineClipboard className="h-5 w-5 text-[#3E98C7]" />
                    <span className="text-sm font-semibold text-gray-600">Session</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedEducation.session || "N/A"}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlinePresentationChartBar className="h-5 w-5 text-[#3E98C7]" />
                    <span className="text-sm font-semibold text-gray-600">Grade/Percentage</span>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedEducation.grade_or_percentage || "N/A"}</p>
                </div>
              </div>

              {/* Subjects Section */}
              {selectedEducation.subjects && selectedEducation.subjects.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <HiOutlinePresentationChartBar className="h-6 w-6 text-[#3E98C7]" />
                    <h5 className="text-lg font-bold text-gray-900">Subjects & Percentage</h5>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedEducation.subjects.map((subject, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-4 py-3 bg-white border border-[#3E98C7]/30 rounded-lg shadow-sm hover:shadow-md transition-all"
                      >
                        <span className="text-sm font-semibold text-gray-700">
                          {subject.name}
                        </span>
                        <span className="text-sm font-bold text-white bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] px-3 py-1.5 rounded-full">
                          {subject.marks}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!selectedEducation.subjects || selectedEducation.subjects.length === 0) && (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <HiOutlinePresentationChartBar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No subjects added for this qualification</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={() => setViewDetailsModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] hover:from-[#2A6476] hover:to-[#3E98C7] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Education;
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
import { HiOutlineAcademicCap, HiOutlineTrash, HiPencil } from "react-icons/hi";
import { IoMdAddCircleOutline } from "react-icons/io";
import { IoClose } from "react-icons/io5";
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
      setSelectedSubjects(prev => [...prev, { ...subjectInput }]);
      setSubjectInput({ name: '', marks: '' }); // Reset input
    }
  };

  // Fix handleRemoveSubject function syntax
  const handleRemoveSubject = (index) => {
    setSelectedSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleQualificationChange = (e) => {
    setSelectedQualification(e.target.value);
    // Update the form value when selection changes
    setValue("qualification", e.target.value);
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
      const payload = {
        institution: data.institution,
        qualification: selectedQualification, // Use the selected qualification state
        year_of_passing: data.year_of_passing,
        grade_or_percentage: data.grade_or_percentage,
        session: data.session || "",
        board_or_university: data.board_or_university || "", // Changed from board to board_or_university
        subjects: selectedSubjects.map(subject => ({
          name: subject.name,
          marks: parseFloat(subject.marks)
        }))
      };

      if (editingIndex !== null) {
        const id = educationData[editingIndex].id;
        await dispatch(putEducationProfile({ payload, id })).unwrap();
        fetchProfile();
        toast.success("Education details updated successfully!");
      } else {
        await dispatch(postEducationProfile(payload)).unwrap();
        fetchProfile();
        toast.success("Education details added successfully!");
      }

      setIsEditing(false);
      setEditingIndex(null);
      setSelectedSubjects([]); // Reset subjects after successful save
      reset();
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.message || "Failed to save education details");
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
    <div className="px-4 sm:px-6 mt-8 py-6 rounded-xl bg-white border border-gray-200">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="mb-3 sm:mb-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Education Background
          </h2>
          <p className="text-sm text-gray-500">
            Manage your academic qualifications and educational history
          </p>
        </div>
        {!isEditing && (
          <button
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] transition-colors rounded-lg shadow-sm hover:shadow-md"
            onClick={() => {
              reset();
              setIsEditing(true);
            }}
          >
            <IoMdAddCircleOutline className="size-5" />
            Add Education
          </button>
        )}
      </div>

      {/* No Data State */}
      {educationData.length < 1 && !isEditing && (
        <div className="p-6 text-center rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
          <HiOutlineAcademicCap className="mx-auto size-12 text-gray-400 mb-3" />
          <h3 className="text-gray-500 font-medium">No education added yet</h3>
          <p className="text-sm text-gray-400 mt-1">
            Click 'Add Education' to get started
          </p>
        </div>
      )}

      {/* Education Table */}
      {!isEditing && educationData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Course Name</th>
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
                    {education.qualification?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    {education.session || "N/A"}
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
                    <div className="flex flex-wrap gap-1">
                      {education.subjects?.map((subject, idx) => (
                        <span 
                          key={idx} 
                          className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md"
                        >
                          {subject.name}
                        </span>
                      ))}
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
                        className="p-1.5 text-gray-500 hover:text-[#3E98C7] rounded-lg hover:bg-gray-100"
                      >
                        <HiPencil className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-1.5 text-gray-500 hover:text-red-500 rounded-lg hover:bg-gray-100"
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
      ) : (
        // Form remains unchanged
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="University Name"
                className="w-full px-4 py-2.5 border-b border-gray-300 focus:ring-2 focus:ring-[#3E98C7]"
                {...register("institution", {
                  required: "Institution is required",
                })}
              />
              {errors.institution && (
                <span className="text-red-500 text-sm">
                  {errors.institution.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualification <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedQualification}
                onChange={handleQualificationChange}
                className="w-full px-4 py-2.5 border-b border-gray-300 focus:ring-2 focus:ring-[#3E98C7] bg-white"
              >
                <option value="" disabled>
                  Select qualification
                </option>
                {qualification.map((role) => {
                  // Get the level for this qualification
                  const qualLevel = qualificationOrder[role.name] || 100;
                  
                  // Get all allowed levels
                  const allowedLevels = getNextAllowedQualificationLevels(educationData);
                  
                  // Check if this qualification is already added
                  const alreadyAdded = educationData.some(edu => 
                    (edu.qualification?.name === role.name) || 
                    (typeof edu.qualification === 'string' && edu.qualification === role.name)
                  );
                  
                  // Disable if already added, unless we're editing this specific qualification
                  const isDisabled = alreadyAdded && 
                    (editingIndex === null || educationData[editingIndex]?.qualification?.name !== role.name);
                  
                  // If editing, enable the qualification that's being edited
                  const isCurrentlyEditing = editingIndex !== null && 
                    educationData[editingIndex]?.qualification?.name === role.name;
                  
                  // Enable if it's allowed or if it's the one being edited
                  const isEnabled = isCurrentlyEditing || (allowedLevels.includes(qualLevel) && !isDisabled);
                  
                  return (
                    <option 
                      key={role.id} 
                      value={role.name}
                      disabled={!isEnabled}
                      className={!isEnabled ? "text-gray-400" : ""}
                    >
                      {role.name} {alreadyAdded ? "(Already added)" : ""}
                    </option>
                  );
                })}
              </select>
              {errors.qualification && (
                <span className="text-red-500 text-sm">
                  {errors.qualification.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session
              </label>
              <input
                type="text"
                placeholder="YYYY-YY (e.g., 2020-22)"
                className="w-full px-4 py-2.5 border-b border-gray-300 focus:ring-2 focus:ring-[#3E98C7]"
                {...register("session")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year of Passing <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="YYYY"
                className="w-full px-4 py-2.5 border-b border-gray-300 focus:ring-2 focus:ring-[#3E98C7]"
                maxLength={4}
                {...register("year_of_passing", {
                  required: "Year is required",
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.year_of_passing.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Board/University
              </label>
              <input
                type="text"
                placeholder="Enter board or university name"
                className="w-full px-4 py-2.5 border-b border-gray-300 focus:ring-2 focus:ring-[#3E98C7]"
                {...register("board_or_university")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade/Percentage
              </label>
              <input
                type="text"
                placeholder="Enter grade or percentage"
                className="w-full px-4 py-2.5 border-b border-gray-300 focus:ring-2 focus:ring-[#3E98C7]"
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.grade_or_percentage.message}
                </p>
              )}
            </div>
          </div>
          {/* Add Subject Selection Section */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Subjects with Marks</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={subjectInput.name}
                  onChange={(e) => setSubjectInput(prev => ({ ...prev, name: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-[#3E98C7]"
                />
                <input
                  type="number"
                  placeholder="Marks"
                  value={subjectInput.marks}
                  onChange={(e) => setSubjectInput(prev => ({ ...prev, marks: e.target.value }))}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-md focus:ring-[#3E98C7]"
                />
                <button
                  type="button"
                  onClick={handleAddSubject}
                  disabled={!subjectInput.name || !subjectInput.marks}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
                >
                  Add Subject
                </button>
              </div>
              {/* Selected Subjects List */}
              {selectedSubjects.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedSubjects.map((subject, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-full"
                      >
                        <span className="text-sm text-teal-800">
                          {subject.name} ({subject.marks} marks)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(index)}
                          className="text-teal-600 hover:text-teal-800"
                        >
                          <IoClose className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Form Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row-reverse sm:justify-start gap-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              Save Education
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                reset();
                dispatch(resetError());
              }}
              className="border border-[#3E98C7] text-[#3E98C7] py-1.5 px-5 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Education;
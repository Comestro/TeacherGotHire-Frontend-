import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { getInterview, postInterview } from "../../../features/examQuesSlice";
import { 
  FaCalendarAlt, FaBook, FaGraduationCap, FaChalkboardTeacher, 
  FaCheck, FaClock, FaFilter, FaTimes, FaChevronDown, 
  FaVideo, FaInfoCircle, FaCheckCircle, FaHistory, 
  FaExclamationCircle, FaCalendarCheck, FaClipboardList,
  FaLayerGroup
} from "react-icons/fa";

const InterviewCard = () => {
  const dispatch = useDispatch();
  const interviewData = useSelector((state) => state.examQues.interview);
  const interview = Array.isArray(interviewData) ? interviewData : [];
  const attempts = useSelector((state) => state.examQues.attempts);

  // Get qualified exams for Level 2
  const filteredExams = attempts?.filter(
    (item) => item?.exam?.level_code === 2 && item?.isqualified === true
  ) || [];
  
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [selectedExam, setSelectedExam] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // New state for simplified date/time picker
  const [selectedDay, setSelectedDay] = useState(null); // Date object
  const [selectedTime, setSelectedTime] = useState(null); // 'HH:MM'
  
  // Filter states
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classCategoryFilter, setClassCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("qualified"); // "qualified" or "interviews"
  
  // Extract unique subjects and class categories for filter dropdowns
  const uniqueSubjects = [...new Set(filteredExams.map(item => 
    item?.exam?.subject_name
  ))].sort();
  
  const uniqueClassCategories = [...new Set(filteredExams.map(item => 
    item?.exam?.class_category_name
  ))].sort();
  
  // For interviews filtering
  const interviewUniqueSubjects = [...new Set(interview.map(item => 
    item?.subject?.subject_name
  ).filter(Boolean))].sort();
  
  const interviewUniqueClassCategories = [...new Set(interview.map(item => 
    item?.class_category?.name
  ).filter(Boolean))].sort();
  
  // Apply filters to the exams
  const applyExamFilters = (exams) => {
    return exams.filter(item => {
      const subjectMatch = subjectFilter === "all" || item?.exam?.subject_name === subjectFilter;
      const classCategoryMatch = classCategoryFilter === "all" || item?.exam?.class_category_name === classCategoryFilter;
      return subjectMatch && classCategoryMatch;
    });
  };
  
  // Apply filters to interviews
  const applyInterviewFilters = (interviewsArray) => {
    if (!Array.isArray(interviewsArray)) return [];
    return interviewsArray.filter(item => {
      const subjectMatch = subjectFilter === "all" || item?.subject?.subject_name === subjectFilter;
      const classCategoryMatch = classCategoryFilter === "all" || item?.class_category?.name === classCategoryFilter;
      const statusMatch = statusFilter === "all" || item?.status === statusFilter;
      return subjectMatch && classCategoryMatch && statusMatch;
    });
  };
  
  // Group exams by subject for better organization
  const filteredAndGroupedExams = applyExamFilters(filteredExams);
  const subjectGroups = filteredAndGroupedExams.reduce((groups, item) => {
    const subject = item?.exam?.subject_name;
    if (subject && !groups[subject]) {
      groups[subject] = [];
    }
    if (subject) {
      groups[subject].push(item);
    }
    return groups;
  }, {});
  
  // Group interviews by subject
  const filteredInterviews = applyInterviewFilters(interview);
  const interviewSubjectGroups = filteredInterviews.reduce((groups, item) => {
    const subject = item?.subject?.subject_name || "Unknown Subject";
    if (!groups[subject]) {
      groups[subject] = [];
    }
    groups[subject].push(item);
    return groups;
  }, {});
  
  const qualifiedSubjects = Object.keys(subjectGroups);
  const interviewSubjects = Object.keys(interviewSubjectGroups);
  
  // Reset filters
  const resetFilters = () => {
    setSubjectFilter("all");
    setClassCategoryFilter("all");
    setStatusFilter("all");
  };

  useEffect(() => {
    dispatch(getInterview());
  }, [dispatch]);

  useEffect(() => {
    // Reset selectedExam if it's filtered out
    if (selectedExam && !filteredAndGroupedExams.some(item => item?.exam?.name === selectedExam)) {
      setSelectedExam(null);
    }
  }, [subjectFilter, classCategoryFilter, selectedExam, filteredAndGroupedExams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);
    
    try {
      const selectedExamData = filteredExams.find(item => 
        item?.exam?.name === selectedExam && 
        item?.isqualified
      );
      
      if (!selectedExamData) {
        throw new Error("Selected exam data not found");
      }
  
      const payload = {
        subject: selectedExamData?.exam?.subject_id,
        class_category: selectedExamData?.exam?.class_category_id,
        level: selectedExamData?.exam?.level_code,
        time: selectedDateTime,
        exam_id: selectedExamData?.exam?.id
      };
  
      await dispatch(postInterview(payload)).unwrap();
      
      setNotification({
        type: 'success',
        message: 'Interview scheduled successfully! You will receive confirmation soon.'
      });
      
      // Reset form after successful submission
      setSelectedExam(null);
      setSelectedDateTime("");
      setSelectedDay(null);
      setSelectedTime(null);
      setIsModalOpen(false);
      
      // Refetch interviews
      dispatch(getInterview());
      
    } catch (error) {
      
      
      // Handle specific error cases with user-friendly messages
      if (error?.message && error.message?.includes("time slot")) {
        setNotification({
          type: 'error',
          message: 'This time slot is no longer available. Please choose another time.'
        });
      } else if (error?.message && error.message?.includes("conflict")) {
        setNotification({
          type: 'error',
          message: 'You already have an interview scheduled at this time.'
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to schedule interview. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString) => {
    try {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      };
      return new Date(dateString).toLocaleString(undefined, options);
    } catch (error) {
      return dateString;
    }
  };
  
  const handleExamSelect = (examName) => {
    setSelectedExam(examName);
    setIsModalOpen(true);
  };
  
  // Get the status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fulfilled':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'requested':
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'scheduled':
        return <FaCalendarCheck className="mr-1.5" />;
      case 'fulfilled':
        return <FaCheckCircle className="mr-1.5" />;
      case 'requested':
      case 'pending':
        return <FaClock className="mr-1.5" />;
      case 'cancelled':
        return <FaTimes className="mr-1.5" />;
      default:
        return <FaInfoCircle className="mr-1.5" />;
    }
  };

  // Format a level value for display - NEW HELPER FUNCTION
  const formatLevel = (level) => {
    if (level === null || level === undefined) return "Not specified";
    // If it's a simple number or string, just return it
    if (typeof level === 'number' || typeof level === 'string') return level;
    // If it's an object with a name property, return that
    if (level?.name) return level.name;
    // Fallback: stringify but with a clean format
    return `Level ${level?.level_code || ""}`;
  };

  // Helper: Build local datetime string YYYY-MM-DD HH:MM:SS
  const formatLocalDateTime = (dateObj, timeStr) => {
    if (!dateObj || !timeStr) return "";
    const [hh, mm] = timeStr.split(":").map((s) => parseInt(s, 10));
    const d = new Date(dateObj);
    d.setHours(hh, mm, 0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const HH = pad(d.getHours());
    const Min = pad(d.getMinutes());
    return `${yyyy}-${MM}-${DD} ${HH}:${Min}:00`;
  };

  const isSameDay = (a, b) => (
    a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const generateNextDays = (count = 14) => {
    const days = [];
    const today = startOfDay(new Date());
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const label = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      days.push({ date, label, isToday: i === 0 });
    }
    return days;
  };

  const generateTimeSlots = (dateObj) => {
    const slots = [];
    const day = dateObj ? new Date(dateObj) : null;
    const now = new Date();
    for (let h = 9; h <= 18; h++) {
      for (let m of [0, 30]) {
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        let disabled = true;
        if (day) {
          const slotDate = new Date(day);
          slotDate.setHours(h, m, 0, 0);
          disabled = slotDate.getTime() <= now.getTime();
        }
        slots.push({ time: timeStr, disabled });
      }
    }
    return slots;
  };

  // Validate if a datetime string is in the past (local time)
  const isInPast = (dtStr) => {
    if (!dtStr) return true;
    try {
      const [datePart, timePart] = dtStr.split(' ');
      const [y, mo, d] = datePart.split('-').map(Number);
      const [hh, mm, ss] = (timePart || '').split(':').map(Number);
      const dt = new Date(y, (mo || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0, 0);
      return dt.getTime() <= Date.now();
    } catch (_) {
      return false;
    }
  };

  // Precompute selections on each render (fast enough)
  const days = generateNextDays(14);
  const timeSlots = generateTimeSlots(selectedDay);

  return (
    <div className="w-full bg-gray-50 p-3">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-md border ${ // Use rounded-md and border
              notification.type === 'success' 
                ? 'bg-green-50 border-green-300 text-green-800' 
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
            role="alert" // Add role for accessibility
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <FaCheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" /> // Use CheckCircle
                ) : (
                  <FaExclamationCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button" // Add type
                    onClick={() => setNotification(null)}
                    className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notification.type === 'success' 
                        ? 'text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50' 
                        : 'text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50'
                    }`}
                    aria-label="Dismiss notification" // Add aria-label
                  >
                    <FaTimes className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header with bilingual title */}
      <div className="mb-6 p-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center">
          <FaVideo className="mr-2 sm:mr-3 text-gray-500" />
          <span>इंटरव्यू प्रबंधन | Interview Management</span>
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">
          <span className="font-medium text-gray-700">अपना शिक्षण योग्यता इंटरव्यू शेड्यूल करें और स्कूल/संस्थान में नौकरी के लिए आवेदन करें।</span>
          <br className="hidden sm:block" />
        </p>
      </div>
      
      {/* Tab Navigation */}
        <div className="flex space-x-2 sm:space-x-4 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("qualified")}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center whitespace-nowrap ${
              activeTab === "qualified"
                ? "bg-white text-cyan-600 shadow-sm border border-cyan-200"
                : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
            }`}
            role="tab"
            aria-selected={activeTab === "qualified"}
          >
            <FaGraduationCap className={`mr-2 ${activeTab === "qualified" ? "text-cyan-500" : "text-gray-400"}`} aria-hidden="true" />
            Qualified for Interview
          </button>

          <button
            onClick={() => setActiveTab("interviews")}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center whitespace-nowrap relative ${
              activeTab === "interviews"
                ? "bg-white text-cyan-600 shadow-sm border border-cyan-200"
                : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
            }`}
            role="tab"
            aria-selected={activeTab === "interviews"}
          >
            <FaCalendarAlt className={`mr-2 ${activeTab === "interviews" ? "text-cyan-500" : "text-gray-400"}`} aria-hidden="true" />
            My Interviews
            {interview?.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-500 text-white">
                {interview.length}
              </span>
            )}
          </button>
        </div>
      
      {/* QUALIFIED EXAMS TAB */}
      {activeTab === "qualified" && (
        <div>
          {qualifiedSubjects.length > 0 ? (
            <>
                <div className="divide-y divide-gray-200">
                  {qualifiedSubjects.map((subject, index) => (
                    <div key={index} className=" py-4">
                      <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-2"> {/* Adjust gap */}
                        {subjectGroups[subject].map((item, examIndex) => (
                          <motion.button // Change to button for accessibility
                            key={examIndex}
                            whileHover={{ scale: 1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleExamSelect(item.exam.name)}
                            className={`p-3  sm:p-4 border border-success rounded-lg text-left w-full transition-all ${ // Use button styles, focus ring
                              selectedExam === item.exam.name
                                ? 'border-cyan-500 bg-white focus:ring-cyan-500'
                                : 'border-success hover:border-success hover:bg-success/30 focus:ring-success'
                            }`}
                            aria-pressed={selectedExam === item.exam.name} // Add aria-pressed
                          >
                            <div className="flex items-start">
                            
                              
                              <div className="ml-3 flex-1">
                                <div className="font-medium text-sm sm:text-base text-gray-800">{item.exam.class_category_name} - {item.exam.subject_name}</div>
                                <div className="text-xs sm:text-sm text-gray-500 flex items-center mt-1">
                                  <FaGraduationCap className="mr-1 text-xs" aria-hidden="true" />
                                   Class : {item.exam.class_category_name}
                                </div>
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    <FaCheckCircle className="mr-1 text-xs" aria-hidden="true" />
                                    Level 2 Qualified
                                  </span>
                                </div>
                              </div>
                              
                              {selectedExam === item.exam.name && (
                                <div className="bg-success rounded-full p-1 ml-auto flex-shrink-0"> {/* Add flex-shrink-0 */}
                                  <FaCheck className="text-white text-xs" aria-hidden="true" />
                                </div>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              
              {/* Modal for Schedule Interview Form */}
              <AnimatePresence>
                {isModalOpen && selectedExam && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-primary text-white rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <h2 className="text-base sm:text-lg font-medium flex items-center">
                            <FaCalendarAlt className="mr-2" aria-hidden="true" />
                            Schedule Interview
                          </h2>
                          <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="text-white/80 hover:text-white p-1 rounded focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Close scheduling form"
                          >
                            <FaTimes aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                        <div className="mb-4 sm:mb-6 bg-primary/10 p-3 sm:p-4 rounded-lg border border-primary/20">
                          <div className="flex items-start">
                            <FaChalkboardTeacher className="text-primary text-lg sm:text-xl mr-3 mt-1 flex-shrink-0" aria-hidden="true" />
                            <div>
                              <h4 className="font-medium text-sm sm:text-base text-gray-800">Selected Exam:</h4>
                              <p className="text-primary font-semibold text-sm sm:text-base">{selectedExam}</p>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                Select a date and time for your virtual interview.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Date selection */}
                        <div className="mb-4 sm:mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Pick a date</label>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {days.map(({ date, label, isToday }, idx) => {
                              const isSelected = selectedDay && isSameDay(selectedDay, date);
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setSelectedDay(date);
                                    setSelectedTime(null);
                                    setSelectedDateTime('');
                                  }}
                                  className={`${isSelected ? 'bg-primary text-white border border-primary' : 'bg-white text-gray-700 border border-gray-300'} px-3 py-2 rounded-md whitespace-nowrap hover:bg-primary hover:text-white transition-colors`}
                                  aria-pressed={isSelected}
                                >
                                  <span className="text-sm font-medium">{label}</span>
                                  {isToday && <span className="ml-2 text-xs opacity-90">Today</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Time selection */}
                        <div className="mb-4 sm:mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Pick a time</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {timeSlots.map(({ time, disabled }, i) => {
                              const isSelected = selectedTime === time;
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => {
                                    if (disabled) return;
                                    setSelectedTime(time);
                                    if (selectedDay) {
                                      setSelectedDateTime(formatLocalDateTime(selectedDay, time));
                                    }
                                  }}
                                  className={`px-3 py-2 rounded-md border text-sm font-medium ${
                                    disabled
                                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                      : isSelected
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-primary hover:text-white'
                                  }`}
                                >
                                  {time}
                                </button>
                              );
                            })}
                          </div>
                          {selectedDay && timeSlots.every(s => s.disabled) && (
                            <p className="text-xs text-amber-600 mt-2">No slots left today. Please choose another date.</p>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <button
                            type="submit"
                            disabled={!selectedDateTime || isSubmitting || isInPast(selectedDateTime)}
                            className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-md font-medium flex items-center justify-center transition-all duration-200 ${
                              selectedDateTime && !isSubmitting && !isInPast(selectedDateTime)
                                ? 'bg-primary hover:opacity-90 text-white border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
                            }`}
                          >
                            {isSubmitting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              <>
                                <FaCalendarCheck className="mr-2" aria-hidden="true" />
                                Schedule Interview
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : filteredExams.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center"> {/* Adjust padding */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4"> {/* Adjust size */}
                <FaFilter className="text-cyan-500 text-lg sm:text-xl" aria-hidden="true" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No Results Found</h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-4">
                No exams match your current filter criteria. Try adjusting your filters or check if you have any qualified Level 2 exams.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500" // Add focus
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center"> {/* Adjust padding */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"> {/* Adjust size */}
                <FaGraduationCap className="text-gray-400 text-lg sm:text-xl" aria-hidden="true" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No Qualified Exams</h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                You need to pass Level 2 online exams to qualify for interview scheduling. Complete your assessments to become eligible.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* INTERVIEWS TAB */}
      {activeTab === "interviews" && (
        <div>
          {interviewSubjects.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4"> {/* Adjust padding */}
                <h2 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
                  <FaCalendarAlt className="mr-2 text-cyan-600" aria-hidden="true" />
                  My Interviews
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage your scheduled interviews
                </p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {interviewSubjects.map((subject, index) => (
                  <div key={index} className="px-4 sm:px-6 py-4"> {/* Adjust padding */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm sm:text-md font-semibold text-gray-800 flex items-center">
                        <FaBook className="mr-2 text-cyan-500" aria-hidden="true" />
                        {subject}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                        {interviewSubjectGroups[subject].length} {interviewSubjectGroups[subject].length === 1 ? 'interview' : 'interviews'}
                      </span>
                    </div>
                    
                    <div className="space-y-4 mt-2">
                      {interviewSubjectGroups[subject].map((item, interviewIndex) => (
                        <motion.div
                          key={interviewIndex}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: interviewIndex * 0.05 }}
                          className={`border rounded-lg overflow-hidden ${ // Use rounded-lg
                            item.status === "scheduled" 
                              ? "border-green-300" 
                              : item.status === "fulfilled"
                                ? "border-sky-300"
                                : item.status === "cancelled"
                                  ? "border-red-300"
                                  : "border-amber-300" // Use darker border for contrast
                          }`}
                        >
                          {/* Status badge - Keep as is, looks okay */}
                          <div className="relative overflow-hidden">
                            <div className="absolute top-0 right-0">
                              <div className={`text-xs font-bold py-1 px-3 rounded-bl-lg ${
                                item.status === "scheduled"
                                  ? "bg-green-500 text-white"
                                  : item.status === "fulfilled"
                                    ? "bg-sky-500 text-white"
                                    : item.status === "cancelled"
                                      ? "bg-red-500 text-white"
                                      : "bg-amber-500 text-white"
                              }`}>
                                {item.status === "requested" 
                                  ? "PENDING" 
                                  : item.status === "scheduled" 
                                    ? "SCHEDULED" 
                                    : item.status === "fulfilled"
                                      ? "COMPLETED"
                                      : "CANCELLED"}
                              </div>
                            </div>

                            <div className="p-4 sm:p-6"> {/* Adjust padding */}
                              <div className="flex flex-col sm:flex-row"> {/* Stack on mobile */}
                                <div className={`p-3 rounded-lg mb-3 sm:mb-0 sm:mr-4 flex-shrink-0 ${ // Adjust margin, size
                                  item.status === "requested"
                                    ? "bg-amber-100 text-amber-600"
                                    : item.status === "scheduled"
                                      ? "bg-green-100 text-green-600"
                                      : item.status === "fulfilled"
                                        ? "bg-sky-100 text-sky-600"
                                        : "bg-red-100 text-red-600"
                                }`}>
                                  {item.status === "requested" && <FaClock className="h-6 w-6" />}
                                  {item.status === "scheduled" && <FaCalendarCheck className="h-6 w-6" />}
                                  {item.status === "fulfilled" && <FaCheckCircle className="h-6 w-6" />}
                                  {item.status === "cancelled" && <FaTimes className="h-6 w-6" />}
                                </div>

                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row flex-wrap items-start justify-between gap-2 mb-3"> {/* Adjust layout */}
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 order-1 sm:order-none">
                                      {item?.class_category?.name} - {item?.subject?.subject_name}
                                    </h3>
                                    
                                    
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4"> {/* Adjust gap */}
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start">
                                      <FaCalendarAlt className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" /> {/* Add flex-shrink-0 */}
                                      <div>
                                        <div className="text-xs text-gray-500 font-medium">Date & Time</div>
                                        <div className="font-medium text-sm sm:text-base text-gray-800">{formatDate(item.time)}</div>
                                      </div>
                                    </div>
                                    
                                    {item?.level && (
                                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start">
                                        <FaLayerGroup className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" /> {/* Add flex-shrink-0 */}
                                        <div>
                                          <div className="text-xs text-gray-500 font-medium">Level</div>
                                          <div className="font-medium text-sm sm:text-base text-gray-800">
                                            Level {formatLevel(item?.level)}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Conditional actions based on status */}
                                  <div className="mt-4 flex flex-wrap gap-2 sm:gap-3"> {/* Adjust gap */}
                                    {item?.status === "scheduled" && item?.link && (
                                      <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md border border-transparent transition-all text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" // Adjust padding, add focus
                                      >
                                        <FaVideo className="mr-2" aria-hidden="true" />
                                        Join Interview
                                      </a>
                                    )}
                                    
                                
                                    
                                    {item?.status === "requested" && (
                                      <div className="flex items-center text-gray-600 text-sm p-2 bg-amber-50 rounded-md border border-amber-200"> {/* Add background/border */}
                                        <FaInfoCircle className="mr-2 text-amber-500 flex-shrink-0" aria-hidden="true" />
                                        Awaiting administrator approval
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredInterviews.length === 0 && interview.length > 0 ? (
             <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center"> {/* Adjust padding */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4"> {/* Adjust size */}
                <FaFilter className="text-cyan-500 text-lg sm:text-xl" aria-hidden="true" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No Matching Interviews</h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-4">
                No interviews match your current filter criteria. Try adjusting your filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500" // Add focus
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center"> {/* Adjust padding */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"> {/* Adjust size */}
                <FaCalendarAlt className="text-gray-400 text-lg sm:text-xl" aria-hidden="true" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No Interviews Scheduled</h3>
              <p className="text-sm sm:text-base text-gray-400  mx-auto mb-4">
                You haven't scheduled any interviews yet. Select a qualified exam from the Qualified Exams tab to schedule.
              </p>
              <button
                onClick={() => setActiveTab("qualified")}
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500" // Remove shadow, add focus
              >
                Go to Qualified Exams
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewCard;

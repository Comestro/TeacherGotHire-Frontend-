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
    switch (status) {
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
    switch (status) {
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
                  (<FaCheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />) // Use CheckCircle
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
                    className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${notification.type === 'success'
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <FaVideo size={24} />
          </div>
          <span>Interview Management / इंटरव्यू प्रबंधन</span>
        </h1>
        <p className="text-gray-600 mt-2 ml-14">
          Schedule and manage your interviews for qualified subjects.
          <br />
          योग्य विषयों के लिए अपने इंटरव्यू शेड्यूल और प्रबंधित करें।
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex p-1 space-x-1 bg-gray-100/80 rounded-xl mb-6 border border-gray-200">
        <button
          onClick={() => setActiveTab("qualified")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === "qualified"
            ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
        >
          <FaGraduationCap className={activeTab === "qualified" ? "text-primary" : "text-gray-400"} />
          <span>Schedule New Interview</span>
        </button>

        <button
          onClick={() => setActiveTab("interviews")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === "interviews"
            ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
        >
          <FaCalendarAlt className={activeTab === "interviews" ? "text-primary" : "text-gray-400"} />
          <span>My Interviews</span>
          {interview?.length > 0 && (
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${activeTab === "interviews" ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-600"
              }`}>
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
              <div className="space-y-6">
                {qualifiedSubjects.map((subject, index) => (
                  <div key={index}>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-1">
                      {subject}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {subjectGroups[subject].map((item, examIndex) => (
                        <motion.div
                          key={examIndex}
                          whileHover={{ y: -2 }}
                          className={`relative bg-white rounded-xl border transition-all duration-200 overflow-hidden ${selectedExam === item.exam.name
                            ? 'border-primary ring-1 ring-primary shadow-md'
                            : 'border-gray-200 shadow-sm hover:shadow-md hover:border-primary/50'
                            }`}
                        >
                          <div className="p-5 flex flex-col sm:flex-row gap-4">
                            <div className="shrink-0">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedExam === item.exam.name ? 'bg-primary text-white' : 'bg-green-100 text-green-600'
                                }`}>
                                <FaCheckCircle size={20} />
                              </div>
                            </div>

                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                <h4 className="text-lg font-bold text-gray-900">
                                  {item.exam.class_category_name}
                                </h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                  <FaCheckCircle className="mr-1.5" size={12} />
                                  Level 2 Qualified
                                </span>
                              </div>

                              <p className="text-gray-600 text-sm mb-4">
                                You have successfully qualified Level 2 (Exam from home) for <span className="font-semibold text-gray-900">{item.exam.subject_name}</span>.
                                You are now eligible to schedule your interview.
                              </p>

                              <button
                                onClick={() => handleExamSelect(item.exam.name)}
                                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${selectedExam === item.exam.name
                                  ? 'bg-primary text-white shadow-sm'
                                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                  }`}
                              >
                                {selectedExam === item.exam.name ? (
                                  <>
                                    <FaCheck className="mr-2" /> Selected
                                  </>
                                ) : (
                                  <>
                                    <FaCalendarAlt className="mr-2" /> Schedule Interview
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
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
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 20 }}
                      className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Modal Header */}
                      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FaCalendarAlt className="text-primary" />
                            Schedule Interview
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            Select a suitable time slot for your interview
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <FaTimes size={20} />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="p-6 overflow-y-auto custom-scrollbar">
                        <form onSubmit={handleSubmit}>
                          {/* Selected Exam Info */}
                          <div className="mb-8 bg-primary/5 rounded-xl p-4 border border-primary/10 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-lg shadow-sm text-primary">
                              <FaChalkboardTeacher size={24} />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Selected Exam</h4>
                              <p className="text-lg font-bold text-gray-900">{selectedExam}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Please ensure you are available for the entire duration of the interview.
                              </p>
                            </div>
                          </div>

                          {/* Date Selection */}
                          <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-900 mb-3">Select Date</label>
                            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
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
                                    className={`flex-shrink-0 min-w-[100px] p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                        : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                      }`}
                                  >
                                    <span className="block text-xs font-semibold uppercase opacity-70 mb-1">{isToday ? 'Today' : label.split(' ')[0]}</span>
                                    <span className="block text-lg font-bold">{label.split(' ')[1]} {label.split(' ')[2]}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Time Selection */}
                          <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-900 mb-3">Select Time</label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
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
                                    className={`py-2.5 px-2 rounded-lg text-sm font-semibold transition-all duration-200 ${disabled
                                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed decoration-slice'
                                        : isSelected
                                          ? 'bg-primary text-white shadow-md transform scale-105'
                                          : 'bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                                      }`}
                                  >
                                    {time}
                                  </button>
                                );
                              })}
                            </div>
                            {selectedDay && timeSlots.every(s => s.disabled) && (
                              <p className="text-sm text-amber-600 mt-3 flex items-center bg-amber-50 p-3 rounded-lg">
                                <FaExclamationCircle className="mr-2" />
                                No slots available for this date. Please try another day.
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => setIsModalOpen(false)}
                              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={!selectedDateTime || isSubmitting || isInPast(selectedDateTime)}
                              className={`flex-1 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-primary/30 flex items-center justify-center transition-all duration-200 ${selectedDateTime && !isSubmitting && !isInPast(selectedDateTime)
                                  ? 'bg-primary hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5'
                                  : 'bg-gray-300 cursor-not-allowed shadow-none'
                                }`}
                            >
                              {isSubmitting ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Scheduling...
                                </>
                              ) : (
                                <>
                                  <FaCalendarCheck className="mr-2" />
                                  Confirm Schedule
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : filteredExams.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <FaFilter size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                No exams match your current filter criteria. Try adjusting your filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <FaGraduationCap size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Qualified Exams Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                You need to pass Level 2 online exams to qualify for interview scheduling.
                Complete your assessments to become eligible.
              </p>
            </div>
          )}
        </div>
      )}
      {/* INTERVIEWS TAB */}
      {activeTab === "interviews" && (
        <div>
          {interviewSubjects.length > 0 ? (
            <div className="space-y-8">
              {interviewSubjects.map((subject, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-4 ml-1">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      {subject}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {interviewSubjectGroups[subject].length} {interviewSubjectGroups[subject].length === 1 ? 'Interview' : 'Interviews'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {interviewSubjectGroups[subject].map((item, interviewIndex) => (
                      <motion.div
                        key={interviewIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: interviewIndex * 0.05 }}
                        className={`bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-md ${item.status === "scheduled"
                          ? "border-green-200 shadow-sm"
                          : "border-gray-200 shadow-sm"
                          }`}
                      >
                        <div className="p-5">
                          <div className="flex flex-col sm:flex-row gap-5">
                            {/* Status Icon Column */}
                            <div className="shrink-0">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.status === "scheduled" ? "bg-green-100 text-green-600" :
                                item.status === "fulfilled" ? "bg-blue-100 text-blue-600" :
                                  item.status === "cancelled" ? "bg-red-100 text-red-600" :
                                    "bg-amber-100 text-amber-600"
                                }`}>
                                {getStatusIcon(item.status)}
                              </div>
                            </div>

                            {/* Content Column */}
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <h4 className="text-lg font-bold text-gray-900">
                                  {item?.class_category?.name}
                                </h4>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(item.status)}`}>
                                  {item.status === "requested" ? "Pending Approval" : item.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-start gap-3">
                                  <FaCalendarAlt className="text-gray-400 mt-1" />
                                  <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Date & Time</p>
                                    <p className="text-gray-900 font-medium">
                                      {item.time ? formatDate(item.time) : "To be scheduled"}
                                    </p>
                                  </div>
                                </div>

                                {item?.level && (
                                  <div className="flex items-start gap-3">
                                    <FaLayerGroup className="text-gray-400 mt-1" />
                                    <div>
                                      <p className="text-xs text-gray-500 font-semibold uppercase">Level</p>
                                      <p className="text-gray-900 font-medium">
                                        Level {formatLevel(item?.level)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                                {item?.status === "scheduled" && item?.link && (
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                                  >
                                    <FaVideo className="mr-2" />
                                    Join Interview
                                  </a>
                                )}

                                {item?.status === "requested" && (
                                  <div className="text-sm text-amber-700 flex items-center bg-amber-50 px-3 py-2 rounded-lg">
                                    <FaInfoCircle className="mr-2" />
                                    Waiting for administrator approval
                                  </div>
                                )}
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
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <FaCalendarAlt size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Interviews Scheduled</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                You haven't scheduled any interviews yet. Go to the "Schedule New Interview" tab to get started.
              </p>
              <button
                onClick={() => setActiveTab("qualified")}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium"
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

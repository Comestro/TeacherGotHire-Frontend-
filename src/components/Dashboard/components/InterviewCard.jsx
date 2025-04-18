import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { getInterview, postInterview } from "../../../features/examQuesSlice";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { 
  FaCalendarAlt, FaBook, FaGraduationCap, FaChalkboardTeacher, 
  FaCheck, FaClock, FaFilter, FaTimes, FaChevronDown, 
  FaVideo, FaInfoCircle, FaCheckCircle, FaHistory, 
  FaExclamationCircle, FaCalendarCheck, FaClipboardList,
  FaLayerGroup
} from "react-icons/fa";

const InterviewCard = () => {
  const dispatch = useDispatch();
  const { interview, attempts } = useSelector((state) => state.examQues);

  // Get qualified exams for Level 2
  const filteredExams = attempts?.filter(
    (item) => item?.exam?.level_code === 2 && item?.isqualified === true
  ) || [];
  
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [selectedExam, setSelectedExam] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Filter states
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classCategoryFilter, setClassCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [activeTab, setActiveTab] = useState("qualified"); // "qualified" or "interviews"
  
  // Extract unique subjects and class categories for filter dropdowns
  const uniqueSubjects = [...new Set(filteredExams.map(item => 
    item?.exam?.subject_name
  ))].sort();
  
  const uniqueClassCategories = [...new Set(filteredExams.map(item => 
    item?.exam?.class_category_name
  ))].sort();
  
  // For interviews filtering
  const interviewUniqueSubjects = [...new Set(interview?.map(item => 
    item?.subject?.subject_name
  ).filter(Boolean))].sort();
  
  const interviewUniqueClassCategories = [...new Set(interview?.map(item => 
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
  const applyInterviewFilters = (interviews) => {
    return interviews.filter(item => {
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
  const filteredInterviews = applyInterviewFilters(interview || []);
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
      setShowScheduleForm(false);
      
      // Refetch interviews
      dispatch(getInterview());
      
    } catch (error) {
      console.error("Failed to schedule interview:", error);
      
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
        minute: "2-digit"
      };
      return new Date(dateString).toLocaleString(undefined, options);
    } catch (error) {
      return dateString;
    }
  };
  
  const handleExamSelect = (examName) => {
    setSelectedExam(examName);
    setShowScheduleForm(true);
    
    // Smooth scroll to schedule form
    setTimeout(() => {
      const scheduleForm = document.getElementById('schedule-form');
      if (scheduleForm) {
        scheduleForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  
  // Get the status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fulfilled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
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

  return (
    <div className="w-full bg-gray-50 p-6 rounded-xl">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg ${
              notification.type === 'success' 
                ? 'bg-green-100 border-l-4 border-green-500 text-green-700' 
                : 'bg-red-100 border-l-4 border-red-500 text-red-700'
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <FaCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <FaExclamationCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setNotification(null)}
                    className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notification.type === 'success' 
                        ? 'text-green-500 hover:bg-green-200 focus:ring-green-600' 
                        : 'text-red-500 hover:bg-red-200 focus:ring-red-600'
                    }`}
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaVideo className="mr-3 text-indigo-600" />
          Interview Management
        </h1>
        <p className="text-gray-600 mt-1">
          Schedule and manage your teaching qualification interviews
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("qualified")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === "qualified"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FaGraduationCap className={`mr-2 ${activeTab === "qualified" ? "text-indigo-500" : "text-gray-400"}`} />
            Qualified Exams
          </button>
          
          <button
            onClick={() => setActiveTab("interviews")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === "interviews"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FaCalendarAlt className={`mr-2 ${activeTab === "interviews" ? "text-indigo-500" : "text-gray-400"}`} />
            My Interviews
            {interview?.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                {interview.length}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <FaFilter className="text-sm mr-2 text-gray-500" />
            Filters
          </h2>
          <button
            onClick={resetFilters}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
            disabled={subjectFilter === "all" && classCategoryFilter === "all" && statusFilter === "all"}
          >
            <FaTimes size={12} className="mr-1" />
            Reset All
          </button>
        </div>
        
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Subjects</option>
              {activeTab === "qualified" 
                ? uniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))
                : interviewUniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))
              }
            </select>
          </div>
          
          {/* Class Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Category
            </label>
            <select
              value={classCategoryFilter}
              onChange={(e) => setClassCategoryFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Classes</option>
              {activeTab === "qualified" 
                ? uniqueClassCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))
                : interviewUniqueClassCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))
              }
            </select>
          </div>
          
          {/* Status Filter - Only for interviews tab */}
          {activeTab === "interviews" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="requested">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="fulfilled">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>
        
        {/* Active Filters */}
        {(subjectFilter !== "all" || classCategoryFilter !== "all" || statusFilter !== "all") && (
          <div className="mt-3 flex flex-wrap gap-2">
            {subjectFilter !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Subject: {subjectFilter}
                <button
                  type="button"
                  onClick={() => setSubjectFilter("all")}
                  className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-200 focus:text-indigo-500"
                >
                  <span className="sr-only">Remove subject filter</span>
                  <FaTimes className="h-2 w-2" />
                </button>
              </span>
            )}
            
            {classCategoryFilter !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Class: {classCategoryFilter}
                <button
                  type="button"
                  onClick={() => setClassCategoryFilter("all")}
                  className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-200 focus:text-blue-500"
                >
                  <span className="sr-only">Remove class category filter</span>
                  <FaTimes className="h-2 w-2" />
                </button>
              </span>
            )}
            
            {statusFilter !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none focus:bg-green-200 focus:text-green-500"
                >
                  <span className="sr-only">Remove status filter</span>
                  <FaTimes className="h-2 w-2" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* QUALIFIED EXAMS TAB */}
      {activeTab === "qualified" && (
        <div>
          {qualifiedSubjects.length > 0 ? (
            <>
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden mb-6">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FaGraduationCap className="mr-2 text-indigo-600" />
                    Qualified Exams
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Select an exam to schedule your interview
                  </p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {qualifiedSubjects.map((subject, index) => (
                    <div key={index} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-md font-semibold text-gray-800 flex items-center">
                          <FaBook className="mr-2 text-indigo-500" />
                          {subject}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {subjectGroups[subject].length} {subjectGroups[subject].length === 1 ? 'exam' : 'exams'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                        {subjectGroups[subject].map((item, examIndex) => (
                          <motion.div
                            key={examIndex}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleExamSelect(item.exam.name)}
                            className={`p-4 border rounded-xl cursor-pointer transition-all ${
                              selectedExam === item.exam.name
                                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                            }`}
                          >
                            <div className="flex items-start">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                selectedExam === item.exam.name
                                  ? 'bg-indigo-100 text-indigo-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                <FaGraduationCap className="text-lg" />
                              </div>
                              
                              <div className="ml-3 flex-1">
                                <div className="font-medium text-gray-800">{item.exam.name}</div>
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                  <FaGraduationCap className="mr-1 text-xs" />
                                  {item.exam.class_category_name}
                                </div>
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    <FaCheckCircle className="mr-1 text-xs" />
                                    Level 2 Qualified
                                  </span>
                                </div>
                              </div>
                              
                              {selectedExam === item.exam.name && (
                                <div className="bg-indigo-500 rounded-full p-1 ml-auto">
                                  <FaCheck className="text-white text-xs" />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Schedule Form */}
              <AnimatePresence>
                {showScheduleForm && selectedExam && (
                  <motion.div
                    id="schedule-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden mb-6"
                  >
                    <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium flex items-center">
                          <FaCalendarAlt className="mr-2" />
                          Schedule Interview
                        </h2>
                        <button
                          onClick={() => setShowScheduleForm(false)}
                          className="text-white hover:text-gray-200 p-1"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6">
                      <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                        <div className="flex">
                          <FaChalkboardTeacher className="text-indigo-500 text-xl mr-3 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-800">Selected Exam:</h4>
                            <p className="text-indigo-600 font-semibold">{selectedExam}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Select a date and time when you'll be available for a virtual interview.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-1">
                          Interview Date & Time
                        </label>
                        <div className="relative">
                          <Flatpickr
                            options={{
                              enableTime: true,
                              dateFormat: "Y-m-d H:i:S",
                              time_24hr: true,
                              minDate: "today",
                              minTime: new Date().getHours() + ":" + new Date().getMinutes(),
                            }}
                            value={selectedDateTime}
                            onChange={([date]) => {
                              const formatted = date
                                .toISOString()
                                .replace("T", " ")
                                .replace(/\.\d+Z/, "");
                              setSelectedDateTime(formatted);
                            }}
                            className="block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                            placeholder="Select date and time"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <FaCalendarAlt className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <button
                          type="submit"
                          disabled={!selectedDateTime || isSubmitting}
                          className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center ${
                            selectedDateTime && !isSubmitting
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
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
                              <FaCalendarCheck className="mr-2" />
                              Schedule Interview
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setShowScheduleForm(false)}
                          className="ml-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : filteredExams.length > 0 ? (
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFilter className="text-indigo-500 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Results Found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                No exams match your current filter criteria. Try adjusting your filters or check if you have any qualified Level 2 exams.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGraduationCap className="text-gray-400 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Qualified Exams</h3>
              <p className="text-gray-600 max-w-md mx-auto">
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
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FaCalendarAlt className="mr-2 text-indigo-600" />
                  My Interviews
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage your scheduled interviews
                </p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {interviewSubjects.map((subject, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-md font-semibold text-gray-800 flex items-center">
                        <FaBook className="mr-2 text-indigo-500" />
                        {subject}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
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
                          className={`border rounded-xl overflow-hidden shadow-sm ${
                            item.status === "scheduled" 
                              ? "border-green-200" 
                              : item.status === "fulfilled"
                                ? "border-blue-200"
                                : item.status === "cancelled"
                                  ? "border-red-200"
                                  : "border-amber-200"
                          }`}
                        >
                          {/* Status badge */}
                          <div className="relative overflow-hidden">
                            <div className="absolute top-0 right-0">
                              <div className={`text-xs font-bold py-1 px-3 rounded-bl-lg ${
                                item.status === "scheduled"
                                  ? "bg-green-500 text-white"
                                  : item.status === "fulfilled"
                                    ? "bg-blue-500 text-white"
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

                            <div className="p-6">
                              <div className="flex">
                                <div className={`p-3 rounded-xl ${
                                  item.status === "requested"
                                    ? "bg-amber-100 text-amber-600"
                                    : item.status === "scheduled"
                                      ? "bg-green-100 text-green-600"
                                      : item.status === "fulfilled"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-red-100 text-red-600"
                                }`}>
                                  {item.status === "requested" && <FaClock className="h-6 w-6" />}
                                  {item.status === "scheduled" && <FaCalendarCheck className="h-6 w-6" />}
                                  {item.status === "fulfilled" && <FaCheckCircle className="h-6 w-6" />}
                                  {item.status === "cancelled" && <FaTimes className="h-6 w-6" />}
                                </div>

                                <div className="ml-4 flex-1">
                                  <div className="flex flex-wrap items-start justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                      {item?.class_category?.name} - {item?.subject?.subject_name}
                                    </h3>
                                    
                                    <div className={`flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full mt-1 sm:mt-0 ${getStatusColor(item.status)}`}>
                                      {getStatusIcon(item.status)}
                                      <span>
                                        {item.status === "requested"
                                          ? "Pending Approval"
                                          : item.status === "scheduled"
                                            ? "Scheduled"
                                            : item.status === "fulfilled"
                                              ? "Completed"
                                              : "Cancelled"}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start">
                                      <FaCalendarAlt className="text-gray-500 mr-2 mt-0.5" />
                                      <div>
                                        <div className="text-xs text-gray-500 font-medium">Date & Time</div>
                                        <div className="font-medium text-gray-800">{formatDate(item.time)}</div>
                                      </div>
                                    </div>
                                    
                                    {item?.level && (
                                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start">
                                        <FaLayerGroup className="text-gray-500 mr-2 mt-0.5" />
                                        <div>
                                          <div className="text-xs text-gray-500 font-medium">Level</div>
                                          <div className="font-medium text-gray-800">Level {item?.level}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Conditional actions based on status */}
                                  <div className="mt-4 flex flex-wrap gap-3">
                                    {item?.status === "scheduled" && item?.link && (
                                      <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all text-sm"
                                      >
                                        <FaVideo className="mr-2" />
                                        Join Interview
                                      </a>
                                    )}
                                    
                                    {item?.status === "scheduled" && (
                                      <button
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all text-sm"
                                      >
                                        <FaCalendarAlt className="mr-2 text-gray-500" />
                                        Add to Calendar
                                      </button>
                                    )}
                                    
                                    {item?.status === "fulfilled" && (
                                      <button
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-all text-sm"
                                      >
                                        <FaClipboardList className="mr-2" />
                                        View Feedback
                                      </button>
                                    )}
                                    
                                    {item?.status === "requested" && (
                                      <div className="flex items-center text-gray-600 text-sm">
                                        <FaInfoCircle className="mr-2 text-amber-500" />
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
          ) : filteredInterviews.length === 0 && interview?.length > 0 ? (
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFilter className="text-indigo-500 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Matching Interviews</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                No interviews match your current filter criteria. Try adjusting your filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt className="text-gray-400 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Interviews Scheduled</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                You haven't scheduled any interviews yet. Select a qualified exam from the Qualified Exams tab to schedule your interview.
              </p>
              <button
                onClick={() => setActiveTab("qualified")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
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

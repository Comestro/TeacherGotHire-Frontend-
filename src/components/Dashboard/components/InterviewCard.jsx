import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { getInterview, postInterview } from "../../../features/examQuesSlice";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { FaCalendarAlt, FaBook, FaGraduationCap, FaChalkboardTeacher, FaCheck, FaClock, FaFilter, FaTimes } from "react-icons/fa";

const InterviewCard = () => {
  const dispatch = useDispatch();
  const { interview, attempts } = useSelector((state) => state.examQues);

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Extract unique subjects and class categories for filter dropdowns
  const uniqueSubjects = [...new Set(filteredExams.map(item => 
    item?.exam?.subject_name
  ))].sort();
  
  const uniqueClassCategories = [...new Set(filteredExams.map(item => 
    item?.exam?.class_category_name
  ))].sort();
  
  // Apply filters to the exams
  const applyFilters = (exams) => {
    return exams.filter(item => {
      const subjectMatch = subjectFilter === "all" || item?.exam?.subject_name === subjectFilter;
      const classCategoryMatch = classCategoryFilter === "all" || item?.exam?.class_category_name === classCategoryFilter;
      return subjectMatch && classCategoryMatch;
    });
  };
  
  // Group exams by subject for better organization
  const filteredAndGroupedExams = applyFilters(filteredExams);
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
  
  const qualifiedSubjects = Object.keys(subjectGroups);
  
  // Reset filters
  const resetFilters = () => {
    setSubjectFilter("all");
    setClassCategoryFilter("all");
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

  return (
    <div className="w-full">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-4 p-4 rounded-lg ${
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
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm">{notification.message}</p>
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
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Qualified Subjects Section */}
        <div className="lg:col-span-5">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden h-full"
          >
            <div className="h-full flex flex-col">
              <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Qualified Subjects</h2>
                  <div className="flex items-center space-x-2">
                    <span className="bg-white text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                      LEVEL 2
                    </span>
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="p-1.5 bg-blue-700 rounded-full hover:bg-blue-900 transition-colors"
                      aria-label="Toggle filters"
                    >
                      <FaFilter size={14} className="text-white" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-blue-100">
                  Select a subject to schedule your interview
                </p>
              </div>
              
              {/* Filter Section */}
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-700">Filter Options</h3>
                        <button
                          onClick={resetFilters}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                          disabled={subjectFilter === "all" && classCategoryFilter === "all"}
                        >
                          <FaTimes size={12} className="mr-1" />
                          Reset
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Subject Filter */}
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Subject
                          </label>
                          <select
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="all">All Subjects</option>
                            {uniqueSubjects.map(subject => (
                              <option key={subject} value={subject}>{subject}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Class Category Filter */}
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Class Category
                          </label>
                          <select
                            value={classCategoryFilter}
                            onChange={(e) => setClassCategoryFilter(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="all">All Classes</option>
                            {uniqueClassCategories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {/* Active filters display */}
                      {(subjectFilter !== "all" || classCategoryFilter !== "all") && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {subjectFilter !== "all" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Subject: {subjectFilter}
                              <button
                                type="button"
                                onClick={() => setSubjectFilter("all")}
                                className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-200 focus:text-blue-500"
                              >
                                <span className="sr-only">Remove subject filter</span>
                                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                  <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                </svg>
                              </button>
                            </span>
                          )}
                          
                          {classCategoryFilter !== "all" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              Class: {classCategoryFilter}
                              <button
                                type="button"
                                onClick={() => setClassCategoryFilter("all")}
                                className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-200 focus:text-indigo-500"
                              >
                                <span className="sr-only">Remove class category filter</span>
                                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                  <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                </svg>
                              </button>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {qualifiedSubjects.length > 0 ? (
                <div className="flex-grow overflow-auto p-4">
                  <div className="space-y-3">
                    {qualifiedSubjects.map((subject, index) => (
                      <div key={index} className="mb-4">
                        <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2 px-1">
                          {subject}
                        </h3>
                        
                        <div className="space-y-2">
                          {subjectGroups[subject].map((item, examIndex) => (
                            <div
                              key={examIndex}
                              onClick={() => setSelectedExam(item.exam.name)}
                              className={`p-3 border rounded-xl cursor-pointer transition-all flex items-center ${
                                selectedExam === item.exam.name
                                  ? 'border-blue-500 bg-blue-50 shadow'
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                selectedExam === item.exam.name
                                  ? 'bg-blue-100'
                                  : 'bg-gray-100'
                              }`}>
                                <FaGraduationCap className={`text-lg ${
                                  selectedExam === item.exam.name
                                    ? 'text-blue-600'
                                    : 'text-gray-500'
                                }`} />
                              </div>
                              
                              <div className="ml-3 flex-1">
                                <div className="font-medium text-gray-800">{item.exam.name}</div>
                                <div className="text-sm text-gray-500">
                                  {item.exam.class_category_name}
                                </div>
                              </div>
                              
                              {selectedExam === item.exam.name && (
                                <div className="bg-blue-500 rounded-full p-1 ml-auto">
                                  <FaCheck className="text-white text-xs" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaFilter className="text-gray-400 text-xl" />
                    </div>
                    {filteredExams.length > 0 ? (
                      <>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Matching Results</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">
                          No exams match your current filters. Try adjusting your filter criteria.
                        </p>
                        <button
                          onClick={resetFilters}
                          className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          Clear Filters
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Qualified Exams</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">
                          You need to pass Level 2 online exams to qualify for interview scheduling.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Interview Scheduling & Status Section */}
        <div className="lg:col-span-7">
          <div className="space-y-6">
            {/* Scheduling Form */}
            {selectedExam && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800">Schedule Your Interview</h2>
                  <p className="mt-1 text-gray-500">Choose your preferred date and time</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex">
                        <FaChalkboardTeacher className="text-blue-500 text-xl mr-3 mt-1" />
                        <div>
                          <h4 className="font-medium text-gray-800">Selected Exam:</h4>
                          <p className="text-blue-600 font-semibold">{selectedExam}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="datetime" className="block text-sm font-medium text-gray-700">
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
                          className="block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                          placeholder="Select date and time"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <FaCalendarAlt className="text-gray-400" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Please select a date and time when you'll be available for a video interview.
                      </p>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={!selectedDateTime || isSubmitting}
                      className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center ${
                        selectedDateTime && !isSubmitting
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all'
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
                        'Schedule Interview'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Existing Interview Status Cards */}
            {interview?.length > 0 && (
              <div className="space-y-4">
              { interview?.filter(item => item?.status !== "pending").map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className={`rounded-2xl border shadow-sm ${
                    item.status === "requested"
                      ? "border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/30"
                      : "border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-50/30"
                  }`}
                >
                  {/* Status badge */}
                  <div className="relative overflow-hidden">
                    <div className="absolute top-0 right-0">
                      <div className={`text-xs font-bold py-1 px-3 rounded-bl-lg ${
                        item.status === "requested"
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-500 text-white"
                      }`}>
                        {item.status === "requested" ? "PENDING" : "SCHEDULED"}
                      </div>
                    </div>

                    <div className="p-6 pt-8">
                      <div className="flex">
                        <div className={`p-3 rounded-xl ${
                          item.status === "requested"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-emerald-100 text-emerald-600"
                        }`}>
                          {item.status === "requested" ? (
                            <FaClock className="h-6 w-6" />
                          ) : (
                            <FaCheck className="h-6 w-6" />
                          )}
                        </div>

                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {item?.status === "requested"
                              ? "Interview Request Pending"
                              : "Interview Scheduled"}
                          </h3>
                          
                          <p className="text-sm text-gray-600 mt-1 mb-4">
                            {item.status === "requested"
                              ? "Your request is being reviewed by the administrators."
                              : "Your interview has been approved and scheduled."}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/50 p-3 rounded-lg border border-gray-100 flex items-start">
                              <FaCalendarAlt className={`mt-0.5 mr-2 ${
                                item.status === "requested" ? "text-amber-500" : "text-emerald-500"
                              }`} />
                              <div>
                                <div className="text-xs text-gray-500 font-medium">Date & Time</div>
                                <div className="font-medium">{formatDate(item.time)}</div>
                              </div>
                            </div>
                            
                            {item?.subject && (
                              <div className="bg-white/50 p-3 rounded-lg border border-gray-100 flex items-start">
                                <FaBook className={`mt-0.5 mr-2 ${
                                  item?.status === "requested" ? "text-amber-500" : "text-emerald-500"
                                }`} />
                                <div>
                                  <div className="text-xs text-gray-500 font-medium">Subject</div>
                                  <div className="font-medium">{item?.subject?.subject_name}</div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Class Category info */}
                          {item?.class_category && (
                            <div className="mt-4 bg-white/50 p-3 rounded-lg border border-gray-100 flex items-start">
                              <FaGraduationCap className={`mt-0.5 mr-2 ${
                                item?.status === "requested" ? "text-amber-500" : "text-emerald-500"
                              }`} />
                              <div>
                                <div className="text-xs text-gray-500 font-medium">Class Category</div>
                                <div className="font-medium">{item?.class_category?.name}</div>
                              </div>
                            </div>
                          )}

                          {/* Join link (only for scheduled interviews) */}
                          {item?.status !== "requested" && item?.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-6 inline-flex w-full md:w-auto items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all"
                            >
                              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Join Interview
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {interview?.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCalendarAlt className="text-blue-500 text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Scheduled Interviews</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You don't have any interview requests or scheduled interviews yet. 
                    Select a qualified exam from the left panel to schedule your interview.
                  </p>
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;

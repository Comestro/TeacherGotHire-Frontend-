import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { getInterview, postInterview } from "../../../features/examQuesSlice";
import {
  FaCalendarAlt, FaChalkboardTeacher,
  FaCheck, FaClock, FaTimes,
  FaVideo, FaInfoCircle, FaCheckCircle,
  FaExclamationCircle, FaCalendarCheck,
  FaLayerGroup, FaBriefcase
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
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classCategoryFilter, setClassCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const applyExamFilters = (exams) => {
    return exams.filter(item => {
      const subjectMatch = subjectFilter === "all" || item?.exam?.subject_name === subjectFilter;
      const classCategoryMatch = classCategoryFilter === "all" || item?.exam?.class_category_name === classCategoryFilter;
      return subjectMatch && classCategoryMatch;
    });
  };

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

  const interviewSubjectGroups = interview.reduce((groups, item) => {
    const subject = item?.subject?.subject_name || "Unknown Subject";
    if (!groups[subject]) {
      groups[subject] = [];
    }
    groups[subject].push(item);
    return groups;
  }, {});

  const qualifiedSubjects = Object.keys(subjectGroups);
  const interviewSubjects = Object.keys(interviewSubjectGroups);

  useEffect(() => {
    dispatch(getInterview());
  }, [dispatch]);

  useEffect(() => {
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
        message: 'Interview scheduled successfully.'
      });

      setSelectedExam(null);
      setSelectedDateTime("");
      setSelectedDay(null);
      setSelectedTime(null);
      setIsModalOpen(false);

      dispatch(getInterview());

    } catch (error) {
      if (error?.message && error.message?.includes("time slot")) {
        setNotification({
          type: 'error',
          message: 'This time slot is unavailable. Please select another.'
        });
      } else if (error?.message && error.message?.includes("conflict")) {
        setNotification({
          type: 'error',
          message: 'You have an existing interview at this time.'
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
        month: "short",
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'fulfilled':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'requested':
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <FaCalendarCheck className="mr-1.5" size={14} />;
      case 'fulfilled':
        return <FaCheckCircle className="mr-1.5" size={14} />;
      case 'requested':
      case 'pending':
        return <FaClock className="mr-1.5" size={14} />;
      case 'cancelled':
        return <FaTimes className="mr-1.5" size={14} />;
      default:
        return <FaInfoCircle className="mr-1.5" size={14} />;
    }
  };

  const formatLevel = (level) => {
    if (level === null || level === undefined) return "Not specified";
    if (typeof level === 'number' || typeof level === 'string') return level;
    if (level?.name) return level.name;
    return `${level?.level_code || ""}`;
  };

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

  const days = generateNextDays(14);
  const timeSlots = generateTimeSlots(selectedDay);

  return (
    <div className="w-full font-['Inter',sans-serif]">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mx-3 mb-4 p-3 rounded-lg border ${notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' ? (
                  <FaCheckCircle className="h-4 w-4 text-emerald-600" />
                ) : (
                  <FaExclamationCircle className="h-4 w-4 text-rose-600" />
                )}
              </div>
              <div className="ml-2 flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="ml-auto -mr-1 -mt-1 p-1 rounded hover:bg-white/50 transition-colors"
              >
                <FaTimes className="h-3.5 w-3.5 text-current opacity-60" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="px-3 space-y-3">

        {/* My Interviews Section */}
        { interview?.length > 0 && (
        <div className=" rounded-lg shadow-sm">
          <div className="px-5 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center">
                <FaBriefcase className="text-indigo-600" size={14} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">My Interviews</h2>
                <p className="text-xs text-slate-500 mt-0.5">View and manage scheduled interviews</p>
              </div>
            </div>
            {interview?.length > 0 && (
              <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                {interview.length}
              </span>
            )}
          </div>

          <div className="p-2">
            {interviewSubjects.length > 0 ? (
              <div className="space-y-2.5">
                {interviewSubjects.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    {interviewSubjectGroups[subject].map((item, interviewIndex) => (
                      <div
                        key={interviewIndex}
                        className={`border rounded-lg p-4 bg-white hover:shadow-sm transition-all ${item.status === "scheduled"
                          ? "border-emerald-200 bg-emerald-50/30"
                          : "border-slate-200"
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${item.status === "scheduled" ? "bg-emerald-100 text-emerald-700" :
                            item.status === "fulfilled" ? "bg-indigo-100 text-indigo-700" :
                              item.status === "cancelled" ? "bg-rose-100 text-rose-700" :
                                "bg-amber-100 text-amber-700"
                            }`}>
                            {getStatusIcon(item.status)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <h4 className="font-semibold text-slate-900 text-sm truncate">
                                {item?.subject?.subject_name}
                              </h4>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                                {item.status === "requested" ? "Pending" : item.status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 mb-2">
                              {item?.class_category?.name} • Level {formatLevel(item?.level)}
                            </p>

                            {item.time && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium bg-slate-50 px-2 rounded-md inline-flex">
                                <FaCalendarAlt className="text-slate-400" size={12} />
                                {formatDate(item.time)}
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                              {item?.status === "scheduled" && item?.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors"
                                >
                                  <FaVideo className="mr-1.5" size={12} />
                                  Join Interview
                                </a>
                              )}
                             
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FaCalendarAlt size={20} className="text-slate-400" />
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">No Scheduled Interviews</p>
                <p className="text-xs text-slate-500">Schedule an interview from your qualified exams</p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Qualified Exams Section */}
        <div className="rounded-lg shadow-sm">
          <div className="px-5 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center">
                <FaCheckCircle className="text-emerald-600" size={14} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Qualified for Interview</h2>
                <p className="text-xs text-slate-500 mt-0.5">Level 2 (Exam from Center) qualified subjects</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {qualifiedSubjects.length > 0 ? (
              <div className="space-y-2.5">
                {qualifiedSubjects.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    {subjectGroups[subject].map((item, examIndex) => (
                      <div
                        key={examIndex}
                        className={`border bg-green-300/10 rounded-lg p-4 hover:shadow-sm transition-all ${selectedExam === item.exam.name
                          ? 'bg-green-50/30'
                          : 'hover:border-slate-300'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${selectedExam === item.exam.name ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            <FaCheckCircle size={16} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 text-sm mb-1">
                              {item.exam.subject_name}
                            </h4>
                            <p className="text-xs text-slate-600 mb-3">
                              {item.exam.class_category_name} • Level 2 (from Exam Center)
                            </p>

                            <button
                              onClick={() => handleExamSelect(item.exam.name)}
                              className={`w-full sm:w-auto inline-flex items-center justify-center px-3.5 py-2 rounded-md text-xs font-semibold transition-all border ${selectedExam === item.exam.name
                                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                                }`}
                            >
                             
                                  <FaCalendarAlt className="mr-1.5" size={12} /> Schedule Interview
                              
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FaChalkboardTeacher size={20} className="text-slate-400" />
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">No Qualified Exams</p>
                <p className="text-xs text-slate-500">Complete Level 2 exams to unlock interview scheduling</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Schedule Interview */}
      <AnimatePresence>
        {isModalOpen && selectedExam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Schedule Interview</h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Select a suitable date and time slot
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  {/* Selected Exam Info */}
                  <div className="mb-6 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                        <FaChalkboardTeacher size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-0.5">Selected Exam</h4>
                        <p className="text-sm font-semibold text-slate-900">{selectedExam}</p>
                      </div>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-slate-700 mb-2.5 uppercase tracking-wider">Select Date</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
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
                            className={`flex-shrink-0 min-w-[90px] p-2.5 rounded-lg border transition-all ${isSelected
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                          >
                            <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-0.5">{isToday ? 'Today' : label.split(' ')[0]}</span>
                            <span className="block text-sm font-bold">{label.split(' ')[1]} {label.split(' ')[2]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-slate-700 mb-2.5 uppercase tracking-wider">Select Time</label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
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
                            className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all ${disabled
                              ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                              : isSelected
                                ? 'bg-indigo-600 text-white shadow-sm border border-indigo-600'
                                : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
                              }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                    {selectedDay && timeSlots.every(s => s.disabled) && (
                      <p className="text-xs text-amber-700 mt-3 flex items-center bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        <FaExclamationCircle className="mr-1.5" size={12} />
                        No available time slots for this date
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedDateTime || isSubmitting || isInPast(selectedDateTime)}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center transition-all ${selectedDateTime && !isSubmitting && !isInPast(selectedDateTime)
                        ? 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
                        : 'bg-slate-300 cursor-not-allowed'
                        }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <FaCalendarCheck className="mr-2" size={14} />
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
    </div>
  );
};

export default InterviewCard;

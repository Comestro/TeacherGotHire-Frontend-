import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { getInterview, postInterview } from "../../../features/examQuesSlice";
import {
  FaCalendarAlt, FaChalkboardTeacher,
  FaCheck, FaClock, FaTimes,
  FaVideo, FaInfoCircle, FaCheckCircle,
  FaExclamationCircle, FaCalendarCheck,
  FaLayerGroup, FaBriefcase, FaArrowRight, FaSpinner
} from "react-icons/fa";

const InterviewCard = ({ selectedSubject, selectedCategory }) => {
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getInterview());
  }, [dispatch]);

  // Identify the specific interview and qualified exam based on props
  const currentInterview = useMemo(() => {
    if (!selectedSubject || !selectedCategory) return null;
    return interview.find(i =>
      (i?.subject?.id === selectedSubject.id || i?.subject?.subject_name === selectedSubject.subject_name) &&
      (i?.class_category?.id === selectedCategory.id || i?.class_category?.name === selectedCategory.name)
    );
  }, [interview, selectedSubject, selectedCategory]);

  const currentQualifiedExam = useMemo(() => {
    if (!selectedSubject || !selectedCategory) return null;
    return filteredExams.find(item =>
      item?.exam?.subject_id === selectedSubject.id &&
      item?.exam?.class_category_id === selectedCategory.id
    );
  }, [filteredExams, selectedSubject, selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    try {
      // Use currentQualifiedExam if available, otherwise fallback to finding by name
      const examData = currentQualifiedExam || filteredExams.find(item =>
        item?.exam?.name === selectedExam &&
        item?.isqualified
      );

      if (!examData) {
        throw new Error("Selected exam data not found");
      }

      const payload = {
        subject: examData?.exam?.subject_id,
        class_category: examData?.exam?.class_category_id,
        level: examData?.exam?.level_code,
        time: selectedDateTime,
        exam_id: examData?.exam?.id
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

  const handleCancelInterview = () => {
    // Placeholder for cancel action
    alert("Cancel functionality is not yet implemented.");
  };

  const formatDate = (dateString) => {
    try {
      const options = {
        weekday: 'short',
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

  const handleScheduleClick = () => {
    if (currentQualifiedExam) {
      setSelectedExam(currentQualifiedExam.exam.name);
      setIsModalOpen(true);
    }
  };

  const handleReschedule = () => {
    if (currentQualifiedExam) {
      setSelectedExam(currentQualifiedExam.exam.name);
      setIsModalOpen(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'fulfilled': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'requested':
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
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

  // If no subject selected, return null or empty (as per request "i already select subject")
  if (!selectedSubject || !selectedCategory) {
    return <div className="p-4 text-center text-slate-500">Please select a subject to view interview details.</div>;
  }

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

      <div className="p-4">
        {currentInterview ? (
          // Scheduled View
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Interview Scheduled</h2>
                  <p className="text-sm text-slate-500">Your interview is confirmed.</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(currentInterview.status)}`}>
                  {currentInterview.status}
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <FaCalendarAlt size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Date & Time</p>
                      <p className="font-semibold">{currentInterview.time ? formatDate(currentInterview.time) : "Time not set"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <FaVideo size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Meeting Link</p>
                      {currentInterview.link ? (
                        <a href={currentInterview.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">
                          Join Meeting
                        </a>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Link will be available soon</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-end gap-3">
                  {/* Reschedule Button - Only for requested/pending */}
                  {(currentInterview.status === 'requested' || currentInterview.status === 'pending') && (
                    <button
                      onClick={handleReschedule}
                      className="w-full py-2.5 px-4 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <FaClock /> Reschedule
                    </button>
                  )}

                  {(currentInterview.status === 'requested' || currentInterview.status === 'pending') && (
                    <button
                      onClick={handleCancelInterview}
                      className="w-full py-2.5 px-4 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <FaTimes /> Cancel Interview
                    </button>
                  )}
                  {currentInterview.link && (
                    <a
                      href={currentInterview.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <FaVideo /> Join Now
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : currentQualifiedExam ? (
          // Not Scheduled but Qualified View
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <FaCheckCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">You are Qualified!</h3>
                <p className="text-slate-600 text-sm mt-1">
                  Congratulations on passing Level 2. You can now schedule your interview.
                </p>
              </div>
            </div>
            <button
              onClick={handleScheduleClick}
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <FaCalendarAlt /> Schedule Interview
            </button>
          </div>
        ) : (
          // Not Qualified View
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <FaInfoCircle size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">Not Eligible Yet</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
              You need to complete and qualify Level 2 exam for this subject to schedule an interview.
            </p>
          </div>
        )}
      </div>

      {/* Modal for Schedule Interview */}
      <AnimatePresence>
        {isModalOpen && (
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
                        <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-0.5">Selected Subject</h4>
                        <p className="text-sm font-semibold text-slate-900">{selectedSubject?.subject_name}</p>
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
                          <FaSpinner className="animate-spin mr-2" />
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

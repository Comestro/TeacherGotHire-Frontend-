import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaGraduationCap,
  FaBriefcase,
  FaLightbulb,
  FaChalkboardTeacher,
  FaMapMarkerAlt,
  FaUserCog,
  FaBuilding,
  FaStar,
  FaClock,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchSingleTeacherById } from "../../services/apiService";

export default function TeacherViewPageFull() {
  const { id } = useParams();
  const navigate = useNavigate();
  console.log("Fetched teacher data:", id);
  const [teacher, setTeacher] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("qualifications");
  const [stickyTabs, setStickyTabs] = useState(false);
  const tabsRef = useRef(null);

  const [openRequestModal, setOpenRequestModal] = useState(false);
  const [classCategories, setClassCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedClassCategory, setSelectedClassCategory] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const requestTeacher = async (payload) => {
    await new Promise((r) => setTimeout(r, 700));
    return { success: true, job_id: "JOB-12345" };
  };
  const maskPhoneNumber = (phone) => {
    if (!phone || phone.length < 6) return phone;
    return phone.slice(0, 4) + "****" + phone.slice(-2);
  };
  const maskEmail = (email) => {
    if (!email) return email;
    const [local, domain] = email.split("@");
    if (!domain || local.length <= 2) return email;
    return local.slice(0, 2) + "***@" + domain;
  };

  const calculateDuration = (start, end) => {
    if (!start) return "";
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
    if (months > 0) parts.push(`${months} mo${months > 1 ? "s" : ""}`);

    return parts.length > 0 ? parts.join(" ") : "Less than 1 mo";
  };

  const formatDate = (value, { dateOnly } = { dateOnly: false }) => {
    if (!value) return "";
    try {
      const d = new Date(value);
      if (isNaN(d)) return String(value);
      if (dateOnly) {
        return d.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch (e) {
      return String(value);
    }
  };
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchSingleTeacherById(id);
        if (!mounted) return;
        const teacherData = data?.teacher ? data.teacher : data;
        const attemptsData = data?.attempts ? data.attempts : [];

        setTeacher(teacherData || {});
        setAttempts(attemptsData || []);
        if (teacherData?.preferences?.length > 0) {
          const pref = teacherData.preferences[0];
          setClassCategories(pref.class_category || []);
          const subjFromCategories = (pref.class_category || []).flatMap(
            (c) => c.subjects || []
          );
          const prefered = pref.prefered_subject || subjFromCategories;
          setSubjects(prefered || []);
        }
      } catch (err) {
        setError(err?.message || "Failed to load teacher");
      } finally {
        setLoading(false);
      }
    };

    load();

    const handleScroll = () => {
      if (tabsRef.current) {
        const tabsPosition = tabsRef.current.getBoundingClientRect().top;
        setStickyTabs(tabsPosition <= 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      mounted = false;
      window.removeEventListener("scroll", handleScroll);
    };
  }, [id]);
  const handleRequestTeacher = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.info("Please login to request a teacher");
      navigate("/signin");
      return;
    }
    setOpenRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedClassCategory || !selectedSubject) {
      toast.error("Please select both class category and subject");
      return;
    }
    try {
      setModalLoading(true);
      const payload = {
        teacher_id: teacher.id,
        class_category: [parseInt(selectedClassCategory)],
        subject: [parseInt(selectedSubject)],
      };
      const res = await requestTeacher(payload);
      if (res?.success) {
        setOpenRequestModal(false);
        setSelectedClassCategory("");
        setSelectedSubject("");
        setSuccess(true);
        toast.success("Teacher request sent successfully!");
      } else {
        throw new Error("Request failed");
      }
    } catch (err) {
      toast.error(`Failed to request teacher: ${err?.message || "Unknown"}`);
    } finally {
      setModalLoading(false);
    }
  };
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <div className="h-8 w-48 bg-gray-200 rounded mx-auto animate-pulse"></div>
          <div className="h-64 w-64 rounded-full bg-gray-200 mx-auto animate-pulse"></div>
          <div className="h-6 w-96 bg-gray-200 rounded mx-auto animate-pulse"></div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-red-50 text-red-700 p-6 rounded">Error: {error}</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/recruiter"
            className="inline-flex items-center text-slate-500 hover:text-teal-600 transition-colors font-medium"
          >
            <FaArrowLeft className="mr-2 text-sm" /> Back to Teachers
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Header Hero */}
        {/* Profile Header Hero */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="px-6 pb-6 sm:px-8  relative">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Column */}
              <div className="flex-shrink-0 flex justify-center md:justify-start">
                <div className="relative flex items-center flex-col justify-center gap-4">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 relative z-10">
                    <img
                      src={
                        teacher.profiles?.profile_picture ||
                        "/images/profile.jpg"
                      }
                      alt={`${teacher.Fname} ${teacher.Lname}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={handleRequestTeacher}
                    disabled={success}
                    className={`px-5 py-2 rounded-full text-sm font-semibold shadow-sm transition-all ${
                      success
                        ? "bg-green-100 text-green-700 cursor-default"
                        : "bg-teal-600 text-white hover:bg-teal-700 hover:shadow-md"
                    }`}
                  >
                    {success ? "Request Sent" : "Hire This Teacher"}
                  </button>
                  {/* Rating Badge */}
                  {teacher.ratings && (
                    <div className="absolute bottom-1 right-0 sm:right-2 z-20 bg-white px-2.5 py-1 rounded-full shadow-md border border-slate-100 flex items-center gap-1 text-xs font-bold text-slate-700">
                      <FaStar className="text-amber-400" /> {teacher.ratings}
                    </div>
                  )}
                </div>
              </div>

              {/* Info Column */}
              <div className="flex-1 min-w-0 pt-2 md:pt-14 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                      {teacher.Fname} {teacher.Lname}
                    </h1>
                    <p className="mt-2 text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto md:mx-0">
                      {teacher.profiles?.bio || "No bio available."}
                    </p>
                  </div>

                  {/* Salary Badge (Desktop) */}
                  <div className="hidden md:block flex-shrink-0">
                    <div className="bg-emerald-50 text-emerald-700 px-5 py-3 rounded-xl border border-emerald-100 flex flex-col items-end">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                        Expected Salary
                      </span>
                      <span className="text-xl font-extrabold">
                        {teacher.apply
                          ? teacher.apply[0]?.salary_expectation
                          : "N/A"}
                        <span className="text-sm font-medium opacity-80 ml-1">
                          /{" "}
                          {teacher.apply
                            ? teacher.apply[0]?.salary_type
                            : "month"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Details Grid */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Email */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 flex-shrink-0">
                      <span className="font-bold text-sm">@</span>
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Email
                      </p>
                      <p
                        className="text-sm font-semibold text-slate-700 truncate"
                        title={maskEmail(teacher.email)}
                      >
                        {maskEmail(teacher.email)}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-600 shadow-sm border border-slate-100 flex-shrink-0">
                      <FaUserCog className="text-sm" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Phone
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {maskPhoneNumber(teacher.profiles?.phone_number)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {/* Location */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-sm border border-slate-100 flex-shrink-0">
                      <FaMapMarkerAlt className="text-sm" />
                    </div>
                    <div className="min-w-0 text-left flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                        Location
                      </p>

                      {/* Address Logic */}
                      {(() => {
                        const addr = teacher.teachersaddress;
                        // Check if object with keys
                        const current = addr?.current_address;
                        const permanent = addr?.permanent_address;
                        // Check if array (legacy)
                        const arrayItem =
                          Array.isArray(addr) && addr.length > 0
                            ? addr[0]
                            : null;

                        if (current || permanent) {
                          return (
                            <div className="space-y-2">
                              {current && (
                                <div className="leading-tight">
                                  <p
                                    className="text-sm font-semibold text-slate-700 truncate"
                                    title={`${current.area}, ${current.district}, ${current.state}`}
                                  >
                                    {current.district}, {current.state}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (arrayItem) {
                          return (
                            <p className="text-sm font-semibold text-slate-700 truncate">
                              {arrayItem.area ? `${arrayItem.area}, ` : ""}
                              {arrayItem.state}
                            </p>
                          );
                        }

                        return (
                          <p className="text-sm text-slate-400 italic">
                            No location info
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Mobile Salary Badge */}
                <div className="mt-6 md:hidden">
                  <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 px-5 py-4 rounded-xl border border-emerald-100">
                    <span className="font-bold text-sm uppercase tracking-wide">
                      Expected Salary
                    </span>
                    <span className="font-bold text-lg">
                      {teacher.apply
                        ? teacher.apply[0]?.salary_expectation
                        : "N/A"}{" "}
                      /{" "}
                      {teacher.apply ? teacher.apply[0]?.salary_type : "month"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs & Content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Tabs (Desktop) / Sticky Header (Mobile) */}
          <div
            className={`lg:w-64 flex-shrink-0 w-full z-30 transition-all duration-300 ${
              stickyTabs ? "sticky top-[70px]" : ""
            }`}
          >
            <div
              ref={tabsRef}
              className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible scrollbar-hide">
                {[
                  {
                    key: "qualifications",
                    label: "Qualifications",
                    icon: <FaGraduationCap />,
                  },
                  {
                    key: "experience",
                    label: "Experience",
                    icon: <FaBriefcase />,
                  },
                  { key: "attempts", label: "Attempts", icon: <FaStar /> },
                  { key: "skills", label: "Skills", icon: <FaLightbulb /> },
                ].map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-3 px-5 py-4 text-sm font-medium transition-all whitespace-nowrap lg:whitespace-normal
                               link-tab
                               ${
                                 isActive
                                   ? "bg-teal-50 text-teal-700 border-l-4 border-teal-600"
                                   : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-l-4 border-transparent"
                               }
                            `}
                    >
                      <span
                        className={`text-lg ${
                          isActive ? "text-teal-600" : "text-slate-400"
                        }`}
                      >
                        {tab.icon}
                      </span>
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Card (Desktop) */}
            <div className="hidden lg:block mt-6 bg-slate-900 rounded-xl p-6 text-white text-center shadow-lg">
              <h3 className="font-bold text-lg mb-2">Interested?</h3>
              <p className="text-slate-300 text-sm mb-4">
                Request an interview with this teacher to move forward.
              </p>
              <button
                onClick={handleRequestTeacher}
                disabled={success}
                className="w-full py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-75"
              >
                {success ? "Already Requested" : "Request Interview"}
              </button>
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 min-h-[500px] w-full">
            {/* Qualifications */}
            {activeTab === "qualifications" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                    Academic Qualifications
                  </h2>
                  <span className="text-sm text-slate-400">
                    {teacher.teacherqualifications?.length || 0} Records
                  </span>
                </div>

                {teacher.teacherqualifications?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {teacher.teacherqualifications.map((q, i) => (
                      <div
                        key={i}
                        className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-xl font-bold flex-shrink-0">
                              {q.qualification?.name?.[0] || "Q"}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                                {q.qualification?.name}
                              </h3>
                              <p className="text-slate-500 font-medium">
                                {q.institution}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
                            {q.year_of_passing}
                          </span>
                        </div>
                        {q.subjects?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                              Subjects & Marks
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {q.subjects.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700"
                                >
                                  <span className="font-semibold">
                                    {s.name}
                                  </span>
                                  <span className="w-px h-3 bg-slate-300"></span>
                                  <span className="font-mono text-teal-600 font-bold">
                                    {s.marks}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <FaGraduationCap className="mx-auto text-4xl text-slate-200 mb-3" />
                    <p className="text-slate-500">
                      No qualification details listed.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Experience */}
            {activeTab === "experience" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                    Work Experience
                  </h2>
                </div>

                {teacher.teacherexperiences?.length > 0 ? (
                  <div className="relative border-l-2 border-slate-200 ml-3 md:ml-6 space-y-8 py-2">
                    {teacher.teacherexperiences.map((exp, idx) => (
                      <div key={idx} className="relative pl-8 md:pl-10">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-teal-500 shadow-sm"></div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h3 className="text-lg font-bold text-slate-800">
                              {exp.role?.jobrole_name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                                <FaClock className="text-slate-400" />
                                {exp.start_date
                                  ? formatDate(exp.start_date, {
                                      dateOnly: true,
                                    })
                                  : ""}{" "}
                                —{" "}
                                {exp.end_date
                                  ? formatDate(exp.end_date, { dateOnly: true })
                                  : "Present"}
                              </span>
                              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-md border border-teal-100">
                                {calculateDuration(
                                  exp.start_date,
                                  exp.end_date
                                )}
                              </span>
                            </div>
                          </div>
                          <p className="text-teal-600 font-medium mb-3">
                            {exp.institution}
                          </p>
                          {exp.achievements && (
                            <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                              {exp.achievements}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <FaBriefcase className="mx-auto text-4xl text-slate-200 mb-3" />
                    <p className="text-slate-500">No work experience listed.</p>
                  </div>
                )}
              </div>
            )}

            {/* Attempts */}
            {activeTab === "attempts" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                    Assessment History
                  </h2>
                </div>

                {attempts?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5">
                    {attempts
                      .filter((a) => {
                        const hasNestedInterview =
                          a.interviews &&
                          a.interviews.some((i) => i.status === "fulfilled");
                        const isDirectInterview =
                          a.status === "fulfilled" && a.grade !== undefined;
                        return hasNestedInterview || isDirectInterview;
                      })
                      .map((a, idx) => {
                        // Normalize Data
                        let interview = null;
                        let title = "";
                        let date = "";
                        let subject = "";

                        if (a.interviews && a.interviews.length > 0) {
                          // Nested Structure (ExamResult -> Interviews)
                          interview =
                            a.interviews.find(
                              (i) => i.status === "fulfilled"
                            ) || a.interviews[0];
                          title = a.exam?.name || a.exam_name || "Assessment";
                          date = interview.created_at || a.created_at;
                          subject = a.exam?.subject_name || "";
                        } else {
                          // Flat Structure (Direct Interview Object)
                          interview = a;
                          title = `${a.level?.name || "Level"} | ${
                            a.subject?.subject_name || "Subject"
                          }`;
                          date = a.created_at || a.time;
                          subject = a.subject?.subject_name || "";
                        }

                        if (!interview) return null;

                        return (
                          <div
                            key={idx}
                            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col sm:flex-row"
                          >
                            {/* Left Status Strip */}
                            <div
                              className={`w-full sm:w-2 ${
                                interview.grade >= 6
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            ></div>

                            <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  {subject && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                                      {subject}
                                    </span>
                                  )}
                                  <span className="text-xs font-semibold text-slate-400">
                                    {date ? formatDate(date) : ""}
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-lg">
                                  Level 2 (Interview)
                                </h4>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-sm text-slate-500">
                                    Interview Status:
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                                    {interview.status || "Completed"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 self-stretch sm:self-auto justify-between sm:justify-start">
                                <div className="text-right">
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Score
                                  </p>
                                  <p className="text-2xl font-bold text-teal-600">
                                    {interview.grade
                                      ? (interview.grade * 10).toFixed(0)
                                      : 0}
                                    %
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {/* Empty State if filter returns nothing */}
                    {attempts.filter(
                      (a) =>
                        (a.interviews &&
                          a.interviews.some((i) => i.status === "fulfilled")) ||
                        (a.status === "fulfilled" && a.grade !== undefined)
                    ).length === 0 && (
                      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <FaStar className="mx-auto text-4xl text-slate-200 mb-3" />
                        <p className="text-slate-500">
                          No interview history found.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <FaStar className="mx-auto text-4xl text-slate-200 mb-3" />
                    <p className="text-slate-500">
                      No assessment history available.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Skills */}
            {activeTab === "skills" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                    Professional Skills
                  </h2>
                </div>

                <div className="bg-white p-8 rounded-xl border border-slate-200 min-h-[200px]">
                  {teacher.teacherskill?.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {teacher.teacherskill.map((s) => (
                        <span
                          key={s.skill.id}
                          className="px-4 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-700 text-sm font-semibold hover:border-teal-300 hover:text-teal-600 hover:shadow-md transition-all cursor-default select-none"
                        >
                          {s.skill.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 italic">
                      No skills listed for this profile.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Request Modal - Cleaned up */}
      {openRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl transform transition-all scale-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                Request Interview
              </h3>
              <button
                onClick={() => setOpenRequestModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100 mb-2">
                <div className="w-10 h-10 rounded-full bg-white flex-shrink-0 overflow-hidden border border-teal-200">
                  <img
                    src={
                      teacher.profiles?.profile_picture || "/images/profile.jpg"
                    }
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <div>
                  <p className="text-xs text-teal-600 font-bold uppercase">
                    Candidate
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {teacher.Fname} {teacher.Lname}
                  </p>
                </div>
              </div>

              {classCategories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">
                    This teacher hasn't set teaching preferences yet.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Select Class Category
                    </label>
                    <select
                      value={selectedClassCategory}
                      onChange={(e) => {
                        setSelectedClassCategory(e.target.value);
                        setSelectedSubject("");
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    >
                      <option value="">Choose a category...</option>
                      {classCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Select Subject
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      disabled={!selectedClassCategory}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {selectedClassCategory
                          ? "Choose a subject..."
                          : "Select class category first"}
                      </option>
                      {subjects
                        .filter(
                          (s) =>
                            !selectedClassCategory ||
                            s.class_category === parseInt(selectedClassCategory)
                        )
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.subject_name}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setOpenRequestModal(false)}
                className="px-5 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={
                  modalLoading ||
                  !selectedClassCategory ||
                  !selectedSubject ||
                  classCategories.length === 0
                }
                className="px-6 py-2.5 rounded-lg bg-teal-600 text-white font-semibold shadow-md hover:bg-teal-700 hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {modalLoading ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../Admin/Layout";
import { fetchSingleTeacherById } from "../../services/apiService";
import DataLoader from "../../components/DataLoader";
import {
  FiBook,
  FiBriefcase,
  FiMapPin,
  FiAward,
  FiStar,
  FiActivity,
  FiUser,
  FiArrowLeft,
  FiMoreVertical,
} from "react-icons/fi";

const ViewTeacherAdmin = () => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isMobile = windowWidth < 640;

  const { id } = useParams();
  const [openDeactivateModal, setOpenDeactivateModal] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [teacherData, setTeacherData] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState({
    classCategory: "",
    subjects: [],
    gender: "",
    state: "",
    district: "",
    skills: [],
    qualifications: [],
    experience: [0, 20], // Years range
    status: "all", // 'all', 'active', 'inactive'
    minTestScore: 0,
    searchQuery: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    classCategories: ["Primary", "Middle School", "High School", "College"],
    subjects: [
      "Mathematics",
      "Science",
      "English",
      "History",
      "Computer Science",
    ],
    states: ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu"],
    districts: {
      Delhi: ["New Delhi", "North Delhi", "South Delhi"],
      Maharashtra: ["Mumbai", "Pune", "Nagpur"],
      Karnataka: ["Bangalore", "Mysore", "Hubli"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    },
    skills: [
      "Communication",
      "Leadership",
      "Technology",
      "Classroom Management",
    ],
    qualifications: ["Matric", "Bachelor", "Master", "PhD", "B.Ed"],
    genders: ["Male", "Female", "Other"],
  });
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };
  const handleMultiFilterChange = (event, filterName) => {
    const { value } = event.target;
    setFilters({
      ...filters,
      [filterName]: typeof value === "string" ? value.split(",") : value,
    });
  };
  const handleSliderChange = (event, newValue) => {
    setFilters({
      ...filters,
      experience: newValue,
    });
  };
  const handleResetFilters = () => {
    setFilters({
      classCategory: "",
      subjects: [],
      gender: "",
      state: "",
      district: "",
      skills: [],
      qualifications: [],
      experience: [0, 20],
      status: "all",
      minTestScore: 0,
      searchQuery: "",
    });
  };
  useEffect(() => {
    if (filters.classCategory) {
      const filteredSubjects = filterOptions.subjects.filter((subject) => {
        if (filters.classCategory === "Primary")
          return ["Mathematics", "English"].includes(subject);
        if (filters.classCategory === "Middle School")
          return ["Mathematics", "Science", "English", "History"].includes(
            subject,
          );
        if (filters.classCategory === "High School")
          return [
            "Mathematics",
            "Science",
            "English",
            "History",
            "Computer Science",
          ].includes(subject);
        return true; // For College or if no filtering needed
      });
      setFilterOptions((prev) => ({
        ...prev,
        availableSubjects: filteredSubjects,
      }));
    }
  }, [filters.classCategory]);
  useEffect(() => {
    if (filters.state && filterOptions.districts[filters.state]) {
      if (
        filters.district &&
        !filterOptions.districts[filters.state].includes(filters.district)
      ) {
        setFilters((prev) => ({
          ...prev,
          district: "",
        }));
      }
    }
  }, [filters.state, filterOptions.districts]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchSingleTeacherById(id);
        const raw = response || {};
        const teacher = raw.teacher || raw;
        setTeacherData(teacher || {});
        const attemptsFromResp =
          raw.attempts ||
          raw.attempt_history ||
          raw.attempts_history ||
          teacher.attempts ||
          [];
        setAttempts(Array.isArray(attemptsFromResp) ? attemptsFromResp : []);
        if (teacher?.Fname && teacher?.Lname) {
          document.title = `${teacher.Fname} ${teacher.Lname} | Profile`;
        } else if (teacher?.firstName || teacher?.lastName) {
          document.title = `${teacher.firstName || ""} ${teacher.lastName || ""} | Profile`;
        } else {
          document.title = "Teacher Profile";
        }
      } catch (error) {
        setError("Failed to load teacher data. Please try again later.");
        setTeacherData(null);
        document.title = "Error | Teacher Profile";
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
    return () => {
      document.title = "Teacher Management";
    };
  }, [id]);

  const formatDate = (value, { dateOnly } = { dateOnly: false }) => {
    if (!value) return "";
    try {
      const d = new Date(value);
      if (isNaN(d)) return String(value);
      if (dateOnly)
        return d.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
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

  const formatAvgTime = (seconds) => {
    if (!seconds) return "N/A";
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  };

  const avgTimePerLevel = React.useMemo(() => {
    const levelStats = {};
    attempts.forEach((attempt) => {
      const level = attempt?.exam?.level_name;
      const time = attempt?.time_taken_seconds;
      if (level && typeof time === "number" && time > 0) {
        if (!levelStats[level]) levelStats[level] = { total: 0, count: 0 };
        levelStats[level].total += time;
        levelStats[level].count += 1;
      }
    });

    return Object.fromEntries(
      Object.entries(levelStats).map(([level, data]) => [
        level,
        formatAvgTime(data.total / data.count),
      ]),
    );
  }, [attempts]);

  const jobLocations = (() => {
    const teacher = teacherData || {};
    if (!teacher) return [];
    
    // Check for jobpreferencelocation array
    if (Array.isArray(teacher.jobpreferencelocation) && teacher.jobpreferencelocation.length > 0) {
      return teacher.jobpreferencelocation;
    }
    
    // Fallback to preferences if exists
    if (Array.isArray(teacher.preferences) && teacher.preferences.length > 0) {
      return teacher.preferences;
    }

    return [];
  })();

  const [notificationMessage, setNotificationMessage] = useState({
    type: "success",
    text: "Account deactivated successfully",
  });
  const [openJsonDialog, setOpenJsonDialog] = useState(false);
  const [jsonDialogTitle, setJsonDialogTitle] = useState("");
  const [jsonDialogContent, setJsonDialogContent] = useState(null);

  const handleOpenJsonDialog = (title, value) => {
    setJsonDialogTitle(title);
    setJsonDialogContent(value);
    setOpenJsonDialog(true);
  };

  const handleDeactivate = () => {
    setOpenDeactivateModal(false);
    setNotificationMessage({
      type: "success",
      text: "Account deactivated successfully",
    });
    setOpenSnackbar(true);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  // Helper to group attempts for the analytical table
  const getAnalyticalRows = () => {
    if (!attempts || attempts.length === 0) return [];

    const groupedData = [];

    // The API provides nested exam details in the attempt object
    attempts.forEach((attempt) => {
      const exam = attempt.exam || {};
      // Use the specific fields from the serializer output
      const classCat = exam.class_category_name || "Unknown";
      const subject = exam.subject_name || "Unknown";
      const medium = attempt.language || exam.language || "Unknown";
      const level = exam.level_name || "Unknown";

      let classGroup = groupedData.find((g) => g.name === classCat);
      if (!classGroup) {
        classGroup = { name: classCat, subjects: [], rowCount: 0 };
        groupedData.push(classGroup);
      }

      let subGroup = classGroup.subjects.find((s) => s.name === subject && s.medium === medium);
      if (!subGroup) {
        subGroup = { name: subject, medium: medium, levels: [], rowCount: 0 };
        classGroup.subjects.push(subGroup);
      }

      let levelGroup = subGroup.levels.find((l) => l.name === level);
      if (!levelGroup) {
        levelGroup = { name: level, attempts: [], rowCount: 0 };
        subGroup.levels.push(levelGroup);
      }

      levelGroup.attempts.push(attempt);
      levelGroup.rowCount++;
      subGroup.rowCount++;
      classGroup.rowCount++;
    });

    const rows = [];
    groupedData.forEach((classGroup, cIdx) => {
      classGroup.subjects.forEach((subGroup, sIdx) => {
        subGroup.levels.forEach((levelGroup, lIdx) => {
          levelGroup.attempts.forEach((attempt, aIdx) => {
            const interviews = (attempt.interviews || []).filter(iv => 
              String(iv.status || "").toLowerCase() === "fulfilled" || iv.grade !== "N/A"
            );
            
            const primaryInterview = interviews[0] || {};
            
            // Percentage comes from calculate_percentage in serializer
            const resultVal = attempt.calculate_percentage;
            const resultDisplay = (resultVal !== null && resultVal !== undefined) ? `${resultVal}%` : "-";
            const timeVal = attempt.time_taken_seconds;
            const timeDisplay = (timeVal !== null && timeVal !== undefined && timeVal > 0) ? formatAvgTime(timeVal) : "-";

            rows.push({
              classCat: classGroup.name,
              subject: subGroup.name,
              medium: subGroup.medium,
              level: levelGroup.name,
              attemptNumber: attempt.attempt || (aIdx + 1),
              examResult: resultDisplay,
              examDuration: timeDisplay,
              examDate: attempt.created_at ? formatDate(attempt.created_at, { dateOnly: true }) : "-",
              interviewAttempt: primaryInterview.attempt || "-",
              interviewResult: (primaryInterview.grade !== "N/A" && primaryInterview.grade !== undefined) ? `${primaryInterview.grade}` : "-",
              interviewDate: primaryInterview.created_at ? formatDate(primaryInterview.created_at, { dateOnly: true }) : "-",
              
              // Spans
              classSpan: (sIdx === 0 && lIdx === 0 && aIdx === 0) ? classGroup.rowCount : 0,
              subSpan: (lIdx === 0 && aIdx === 0) ? subGroup.rowCount : 0,
              levelSpan: (aIdx === 0) ? levelGroup.rowCount : 0,
              
              // Total Span for Teacher ID/Name
              totalSpan: rows.length === 0 ? attempts.length : 0
            });
          });
        });
      });
    });

    return rows;
  };

  const analyticalRows = getAnalyticalRows();

  return (
    <Layout>
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <nav className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <Link to="/admin/dashboard" className="hover:text-teal-600">Dashboard</Link>
                <span>/</span>
                <Link to="/admin/manage/teacher" className="hover:text-teal-600">Teachers</Link>
                <span>/</span>
                <span className="text-gray-900 font-bold">Profile</span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Profile</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackClick}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                <FiArrowLeft /> Back
              </button>
              <button
                onClick={() => setOpenDeactivateModal(true)}
                disabled={loading || !teacherData}
                className="inline-flex items-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-sm disabled:opacity-50"
              >
                Deactivate
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg p-12 border border-gray-200 shadow-sm flex justify-center">
              <DataLoader message="Loading profile..." />
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center gap-3">
              <FiActivity className="shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : !teacherData ? (
            <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-500">
              Teacher record not found.
            </div>
          ) : (
            <React.Fragment>
              {/* Primary Info */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
                    <div className="relative">
                      <img
                        src={teacherData?.profiles?.profile_picture || "https://via.placeholder.com/150"}
                        alt="Profile"
                        className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg border border-gray-100"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${teacherData?.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <h2 className="text-2xl font-bold text-gray-900">{teacherData?.Fname} {teacherData?.Lname}</h2>
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded border border-gray-200 uppercase tracking-widest">
                          ID: {teacherData?.user_code || id}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-gray-600 break-all leading-tight">
                          <FiUser className="shrink-0 text-gray-400" />
                          <span className="text-sm font-medium">{teacherData?.email || "No Email"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiActivity className="text-gray-400" />
                          <span className="text-sm font-medium">{teacherData?.profiles?.phone_number || "No Phone"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiActivity className="text-gray-400" />
                          <span className="text-sm font-medium">{teacherData?.is_active ? 'Active' : 'Inactive'} Account</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {teacherData?.teacherclasscategory?.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded border border-gray-200 text-[10px] font-bold">
                            {c.class_category?.name || c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytical Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-teal-600 rounded-full" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Analytical Level & Exam Attempts</h3>
                  </div>
                  {Object.keys(avgTimePerLevel).length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:block">Avg Time:</span>
                      {Object.entries(avgTimePerLevel).map(([lvl, time]) => (
                        <span key={lvl} className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold rounded shadow-sm">
                          {lvl}: {time}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {["Teacher ID", "Category", "Subject", "Medium", "Level", "Exam Attempt", "Exam Result", "Exam Duration", "Exam Date", "Interview Atpt", "Interview Result", "Interview Date"].map((h) => (
                            <th key={h} className="p-3 text-left font-bold text-gray-600 whitespace-nowrap border-r border-gray-200 last:border-r-0">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {analyticalRows.length > 0 ? analyticalRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            {idx === 0 && <td rowSpan={analyticalRows.length} className="p-3 font-bold text-gray-600 border-r border-gray-200 align-top bg-gray-50/50">{teacherData?.user_code || id}</td>}
                            {row.classSpan > 0 && <td rowSpan={row.classSpan} className="p-3 font-bold text-gray-800 border-r border-gray-200 align-top">{row.classCat}</td>}
                            {row.subSpan > 0 && <td rowSpan={row.subSpan} className="p-3 font-semibold text-teal-700 border-r border-gray-200 align-top">{row.subject}</td>}
                            {row.subSpan > 0 && <td rowSpan={row.subSpan} className="p-3 text-gray-600 border-r border-gray-200 align-top">{row.medium}</td>}
                            {row.levelSpan > 0 && <td rowSpan={row.levelSpan} className="p-3 font-medium text-gray-700 border-r border-gray-200 align-top">{row.level}</td>}
                            <td className="p-3 text-gray-600 border-r border-gray-200">{row.attemptNumber}</td>
                            <td className="p-3 border-r border-gray-200">
                              <span className={`font-bold ${parseFloat(row.examResult) >= 60 ? 'text-green-600' : 'text-rose-600'}`}>{row.examResult}</span>
                            </td>
                            <td className="p-3 text-gray-600 border-r border-gray-200 whitespace-nowrap">{row.examDuration}</td>
                            <td className="p-3 text-gray-500 whitespace-nowrap italic border-r border-gray-200">{row.examDate}</td>
                            <td className="p-3 text-gray-600 text-center border-r border-gray-200">{row.interviewAttempt}</td>
                            <td className="p-3 font-bold text-gray-800 text-center border-r border-gray-200">{row.interviewResult}</td>
                            <td className="p-3 text-gray-500 whitespace-nowrap text-center italic">{row.interviewDate}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={12} className="p-8 text-center text-gray-400 italic">No analytical records found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-indigo-600 rounded-full" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Basic Information</h3>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 grid grid-cols-2 gap-4">
                    {[
                      { l: "Gender", v: teacherData?.profiles?.gender },
                      { l: "Marital Status", v: teacherData?.profiles?.marital_status },
                      { l: "Religion", v: teacherData?.profiles?.religion },
                      { l: "Birth Date", v: teacherData?.profiles?.date_of_birth ? formatDate(teacherData.profiles.date_of_birth, { dateOnly: true }) : "—" }
                    ].map((item, i) => (
                      <div key={i} className="space-y-0.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.l}</p>
                        <p className="text-sm font-bold text-gray-800 capitalize transition-all">{item.v || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-pink-600 rounded-full" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Contact Information</h3>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-gray-800 break-all">{teacherData?.email || "—"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                      <p className="text-sm font-bold text-gray-800">{teacherData?.profiles?.phone_number || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-amber-500 rounded-full" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Professional Skills</h3>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                    <div className="flex flex-wrap gap-1.5">
                      {teacherData?.teacherskill?.length > 0 ? teacherData.teacherskill.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold rounded">
                          {s.skill?.name || s.name}
                        </span>
                      )) : <p className="text-xs text-gray-400 italic">No skills listed.</p>}
                    </div>
                  </div>
                </div>

                {/* Subject Preferences */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-teal-500 rounded-full" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Academic Preferences</h3>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3">
                    {teacherData?.preferences?.length > 0 ? teacherData.preferences.map((pref, i) => (
                      <div key={i} className="space-y-3">
                        {pref.class_category?.map((cat, ci) => (
                          <div key={ci} className="p-3 bg-teal-50/30 rounded-lg border border-teal-100/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest bg-teal-100/50 px-2 py-0.5 rounded">Category</span>
                              <h4 className="text-sm font-bold text-teal-900">{cat.name}</h4>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.subjects?.length > 0 ? cat.subjects.map((sub, si) => (
                                <span key={si} className="px-2 py-0.5 bg-white border border-teal-200 text-teal-700 text-[11px] font-semibold rounded-full shadow-sm">
                                  {sub.subject_name || sub.name}
                                </span>
                              )) : <p className="text-[10px] text-teal-400 italic">No subjects selected for this category.</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )) : <p className="text-xs text-gray-400 italic p-2 text-center">No academic preferences saved.</p>}
                  </div>
                </div>
                <div className="space-y-3 lg:col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-600 rounded-full" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Educational Qualifications</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {teacherData?.teacherqualifications?.length > 0 ? teacherData.teacherqualifications.map((q, i) => (
                      <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="w-8 h-8 bg-blue-50 rounded text-blue-600 flex items-center justify-center border border-blue-100">
                            <FiAward size={18} />
                          </div>
                          <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded text-[10px] font-bold border border-teal-100">
                            {q.grade_or_percentage || "—"}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 leading-tight">{q.qualification?.name}</h4>
                          <p className="text-[11px] text-gray-500 font-medium mt-0.5 truncate">{q.institution}</p>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-50 pt-2">{q.year_of_passing}</p>
                      </div>
                    )) : <div className="col-span-full bg-white p-6 rounded-lg border border-gray-200 text-gray-400 text-xs italic text-center">No qualifications listed.</div>}
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-3 lg:col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-purple-600 rounded-full" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Teaching Experience</h3>
                  </div>
                  <div className="space-y-3">
                    {teacherData?.teacherexperiences?.length > 0 ? teacherData.teacherexperiences.map((exp, i) => (
                      <div key={i} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex gap-4">
                        <div className="shrink-0 w-10 h-10 bg-purple-50 rounded flex items-center justify-center text-purple-600 border border-purple-100">
                          <FiBriefcase size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{exp.institution}</h4>
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                              {exp.start_date ? formatDate(exp.start_date, { dateOnly: true }) : ""} - {exp.end_date ? formatDate(exp.end_date, { dateOnly: true }) : "Present"}
                            </span>
                          </div>
                          <p className="text-purple-700 text-xs font-bold mt-0.5">{exp.role?.jobrole_name}</p>
                          {exp.achievements && <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded border border-gray-100 leading-relaxed">{exp.achievements}</p>}
                        </div>
                      </div>
                    )) : <div className="bg-white p-6 rounded-lg border border-gray-200 text-gray-400 text-xs italic text-center">No experience records.</div>}
                  </div>
                </div>

                {/* Locations */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-rose-500 rounded-full" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Preferred Locations</h3>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                    {jobLocations.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {jobLocations.map((loc, i) => (
                          <div key={i} className="flex-1 min-w-[140px] p-3 bg-gray-50 rounded border border-gray-200">
                            <FiMapPin className="text-rose-500 mb-1" size={14} />
                            <p className="text-[9px] font-bold text-gray-400 uppercase">Target Area</p>
                            <p className="text-xs font-bold text-gray-800 truncate">{typeof loc === 'string' ? loc : `${loc.area || ''} ${loc.city || loc.district || ''}`}</p>
                            <p className="text-[10px] text-gray-500 font-medium">{loc.state}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-gray-400 italic">No preferences set.</p>}
                  </div>
                </div>

                {/* Residency */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-gray-700 rounded-full" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Residency</h3>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3">
                    {(() => {
                      const addrObj = teacherData?.teachersaddress;
                      const addresses = [];
                      if (addrObj?.current_address) addresses.push(addrObj.current_address);
                      if (addrObj?.permanent_address) addresses.push(addrObj.permanent_address);
                      
                      if (addresses.length === 0) return <p className="text-xs text-gray-400 italic text-center">No address records.</p>;
                      
                      return addresses.map((addr, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                          <div className="w-7 h-7 bg-white rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                            <FiMapPin className="text-gray-400" size={12} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">{addr.address_type} Address</p>
                            <p className="text-xs font-bold text-gray-800 truncate">{addr.area || addr.village || 'N/A'}</p>
                            <p className="text-[11px] text-gray-500 truncate">{addr.district || addr.city}, {addr.state} {addr.pincode}</p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}
        </div>

        {/* Modals */}
        {openDeactivateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-rose-600">Deactivate Account</h3>
                <button onClick={() => setOpenDeactivateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">Are you sure you want to deactivate <span className="font-bold text-gray-900">{teacherData?.Fname} {teacherData?.Lname}</span>'s account?</p>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setOpenDeactivateModal(false)} className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button onClick={handleDeactivate} className="flex-1 px-3 py-2 bg-rose-600 text-white rounded text-sm font-bold hover:bg-rose-700">Deactivate</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {openSnackbar && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className={`px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white ${notificationMessage.type === 'success' ? 'bg-green-600' : 'bg-rose-600'}`}>
              {notificationMessage.text}
            </div>
          </div>
        )}

        {openJsonDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-sm">{jsonDialogTitle}</h3>
                <button onClick={() => setOpenJsonDialog(false)} className="text-gray-400">✕</button>
              </div>
              <div className="p-4 overflow-auto bg-gray-50">
                <pre className="text-[10px] leading-relaxed font-mono">{JSON.stringify(jsonDialogContent, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ViewTeacherAdmin;

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
  const jobLocations = (() => {
    const teacher = teacherData || {};
    if (!teacher) return [];

    if (teacher.jobpreferencelocation) {
      if (
        Array.isArray(teacher.jobpreferencelocation) &&
        teacher.jobpreferencelocation.length
      ) {
        return teacher.jobpreferencelocation.filter(
          (loc) =>
            !(
              loc &&
              loc.address_type &&
              ["current", "permanent"].includes(
                String(loc.address_type).toLowerCase(),
              )
            ),
        );
      }
      return [teacher.jobpreferencelocation];
    }

    const prefLocations = (teacher.preferences || [])
      .flatMap((p) => {
        const candidates = [];
        if (
          p.preferred_job_locations &&
          Array.isArray(p.preferred_job_locations)
        )
          candidates.push(...p.preferred_job_locations);
        if (p.job_pref_locations && Array.isArray(p.job_pref_locations))
          candidates.push(...p.job_pref_locations);
        if (p.job_pref_location)
          candidates.push(
            ...(Array.isArray(p.job_pref_location)
              ? p.job_pref_location
              : [p.job_pref_location]),
          );
        if (p.job_locations && Array.isArray(p.job_locations))
          candidates.push(...p.job_locations);
        if (p.job_location)
          candidates.push(
            ...(Array.isArray(p.job_location)
              ? p.job_location
              : [p.job_location]),
          );
        if (p.preferred_locations && Array.isArray(p.preferred_locations))
          candidates.push(...p.preferred_locations);
        if (p.job_preferences && Array.isArray(p.job_preferences))
          candidates.push(...p.job_preferences);
        return candidates;
      })
      .filter(Boolean)
      .filter(
        (loc) =>
          !(
            loc &&
            loc.address_type &&
            ["current", "permanent"].includes(
              String(loc.address_type).toLowerCase(),
            )
          ),
      );

    if (prefLocations.length) return prefLocations;

    if (Array.isArray(teacher.job_locations) && teacher.job_locations.length) {
      return teacher.job_locations.filter(
        (loc) =>
          !(
            loc &&
            loc.address_type &&
            ["current", "permanent"].includes(
              String(loc.address_type).toLowerCase(),
            )
          ),
      );
    }
    if (Array.isArray(teacher.joblocations) && teacher.joblocations.length) {
      return teacher.joblocations.filter(
        (loc) =>
          !(
            loc &&
            loc.address_type &&
            ["current", "permanent"].includes(
              String(loc.address_type).toLowerCase(),
            )
          ),
      );
    }

    if (
      Array.isArray(teacher.teachersaddress) &&
      teacher.teachersaddress.length
    ) {
      const others = teacher.teachersaddress.filter(
        (addr) =>
          !(
            addr &&
            addr.address_type &&
            ["current", "permanent"].includes(
              String(addr.address_type).toLowerCase(),
            )
          ),
      );
      return others;
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

    attempts.forEach((attempt) => {
      const exam = attempt.exam || {};
      const classCat = exam.class_category?.name || "Unknown";
      const subject = exam.subject?.subject_name || exam.subject_name || "Unknown";
      const medium = exam.language || "Unknown";
      const level = exam.level?.name || "Unknown";

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
              String(iv.status || "").toLowerCase() === "fulfilled"
            );
            
            // If there are multiple interviews, we might need more rows, 
            // but the image shows interview as part of the attempt row.
            // Let's take the first interview or just map them.
            const primaryInterview = interviews[0] || {};

            rows.push({
              classCat: classGroup.name,
              subject: subGroup.name,
              medium: subGroup.medium,
              level: levelGroup.name,
              attemptNumber: attempt.attempt || (aIdx + 1),
              examResult: attempt.percentage !== null ? `${attempt.percentage}%` : (attempt.correct_answer !== undefined ? `${Math.round((attempt.correct_answer / (attempt.total_questions || 1)) * 100)}%` : "-"),
              examDate: attempt.created_at ? formatDate(attempt.created_at, { dateOnly: true }) : "-",
              interviewAttempt: primaryInterview.attempt || "-",
              interviewResult: primaryInterview.grade !== undefined ? `${Math.round((primaryInterview.grade / (primaryInterview.total || 10)) * 100)}%` : "-",
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
      <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Actions & Breadcrumbs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Link to="/admin/dashboard" className="hover:text-teal-600 transition-colors">Dashboard</Link>
                <span>/</span>
                <Link to="/admin/manage/teacher" className="hover:text-teal-600 transition-colors">Teachers</Link>
                <span>/</span>
                <span className="text-slate-900 font-bold">Profile Details</span>
              </nav>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Teacher Profile
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                <FiArrowLeft /> Back
              </button>
              <button
                onClick={() => setOpenDeactivateModal(true)}
                disabled={loading || !teacherData}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-rose-100 disabled:opacity-50"
              >
                Deactivate
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-20 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center border border-slate-100">
              <DataLoader message="Fetching comprehensive teacher profile..." />
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 shrink-0">
                <FiActivity size={24} />
              </div>
              <div>
                <h4 className="font-bold">Error Loaded</h4>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          ) : !teacherData ? (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 p-8 rounded-2xl text-center">
              No data found for this teacher.
            </div>
          ) : (
            <>
              {/* Primary Information Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-indigo-500/20 rounded-3xl blur opacity-25 transition duration-1000 group-hover:opacity-40"></div>
                <div className="relative bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                  <div className="px-8 py-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-teal-500/10 rounded-full animate-pulse"></div>
                        <img
                          src={teacherData?.profiles?.profile_picture || "https://via.placeholder.com/150"}
                          alt="Teacher"
                          className="relative w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl"
                        />
                        <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${teacherData?.is_active || teacherData?.is_verified ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      </div>
                      
                      <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-col md:flex-row md:items-end gap-3 justify-center md:justify-start">
                          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            {teacherData?.Fname} {teacherData?.Lname}
                          </h2>
                          <div className="px-3 py-1 bg-teal-50 text-teal-700 text-sm font-bold rounded-full border border-teal-100 uppercase tracking-wider">
                            ID: {teacherData?.user_code || id}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                          <div className="flex items-center gap-3 text-slate-600">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 shrink-0 border border-slate-100">
                              <FiUser size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                              <p className="font-semibold text-slate-700">
                                {teacherData?.is_active || teacherData?.is_verified ? "ACTIVE ACCOUNT" : "INACTIVE ACCOUNT"}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-slate-600">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 shrink-0 border border-slate-100">
                              <FiActivity size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                              <p className="font-semibold text-slate-700 truncate max-w-[200px]">{teacherData?.email || "—"}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-slate-600">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 shrink-0 border border-slate-100">
                              <FiActivity size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Mobile Number</p>
                              <p className="font-semibold text-slate-700">{teacherData?.profiles?.phone_number || teacherData?.phone_number || "—"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                          {teacherData?.teacherclasscategory?.map((c, i) => (
                            <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
                              {c.class_category?.name || c.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytical & Exam Attempts Section (As per design) */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-teal-600 rounded-full"></div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Analytical Level & Exam Attempts</h3>
                </div>
                
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="border-b border-r border-slate-200 p-4 font-black text-slate-600 text-left whitespace-nowrap">Teacher ID</th>
                          <th className="border-b border-r border-slate-200 p-4 font-black text-slate-600 text-left whitespace-nowrap">Name or Bio-data</th>
                          <th className="border-b border-r border-slate-200 p-4 font-black text-slate-600 text-left whitespace-nowrap">Class Category</th>
                          <th className="border-b border-r border-slate-200 p-4 font-black text-slate-600 text-left whitespace-nowrap">Subject</th>
                          <th className="border-b border-r border-slate-200 p-4 font-black text-slate-600 text-left whitespace-nowrap">Medium of Subject</th>
                          <th className="border-b border-r border-slate-200 p-4 font-black text-slate-600 text-left whitespace-nowrap">Level</th>
                          <th className="border-b border-r border-slate-200 p-4 font-black text-slate-600 text-left whitespace-nowrap">Exam Attempt</th>
                          <th className="border-b border-r border-slate-200 p-4 font-black text-slate-600 text-left whitespace-nowrap">Exam Result</th>
                          <th className="border-b border-r border-slate-200 p-4 font-black text-slate-600 text-left whitespace-nowrap">Exam Date</th>
                          <th className="border-b border-r border-slate-200 p-4 font-black text-slate-600 text-left whitespace-nowrap">Interview Attempt</th>
                          <th className="border-b border-r border-slate-200 p-4 font-black text-slate-600 text-left whitespace-nowrap">Interview Result</th>
                          <th className="border-b border-slate-200 p-4 font-black text-slate-600 text-left whitespace-nowrap">Interview Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticalRows.length > 0 ? (
                          analyticalRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-teal-50/30 transition-colors">
                              {idx === 0 && (
                                <td rowSpan={analyticalRows.length} className="border-b border-r border-slate-200 p-4 font-bold text-slate-600 align-top bg-slate-50/40">
                                  {teacherData?.user_code || id}
                                </td>
                              )}
                              {idx === 0 && (
                                <td rowSpan={analyticalRows.length} className="border-b border-r border-slate-200 p-4 font-bold text-slate-600 align-top bg-slate-50/40">
                                  {teacherData?.Fname} {teacherData?.Lname}
                                </td>
                              )}
                              {row.classSpan > 0 && (
                                <td rowSpan={row.classSpan} className="border-b border-r border-slate-200 p-4 font-bold text-slate-800 align-top">
                                  {row.classCat}
                                </td>
                              )}
                              {row.subSpan > 0 && (
                                <td rowSpan={row.subSpan} className="border-b border-r border-slate-200 p-4 font-semibold text-teal-700 align-top">
                                  {row.subject}
                                </td>
                              )}
                              {row.subSpan > 0 && (
                                <td rowSpan={row.subSpan} className="border-b border-r border-slate-200 p-4 text-slate-600 align-top">
                                  {row.medium}
                                </td>
                              )}
                              {row.levelSpan > 0 && (
                                <td rowSpan={row.levelSpan} className="border-b border-r border-slate-200 p-4 font-medium text-slate-700 align-top">
                                  {row.level}
                                </td>
                              )}
                              <td className="border-b border-r border-slate-200 p-4 text-slate-600 font-medium">
                                {row.attemptNumber}
                              </td>
                              <td className="border-b border-r border-slate-200 p-4">
                                <span className={`font-bold ${parseFloat(row.examResult) >= 60 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {row.examResult}
                                </span>
                              </td>
                              <td className="border-b border-r border-slate-200 p-4 text-slate-500 whitespace-nowrap font-medium italic">
                                {row.examDate}
                              </td>
                              <td className="border-b border-r border-slate-200 p-4 text-slate-600 text-center font-medium">
                                {row.interviewAttempt}
                              </td>
                              <td className="border-b border-r border-slate-200 p-4 font-bold text-slate-800 text-center">
                                {row.interviewResult}
                              </td>
                              <td className="border-b border-slate-200 p-4 text-slate-500 whitespace-nowrap text-center font-medium italic">
                                {row.interviewDate}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={12} className="p-10 text-center text-slate-400 italic font-medium">
                              No analytical data available for this teacher
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Other Sections (Replacement for Tabs) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Basic Information</h3>
                  </div>
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</p>
                        <p className="font-bold text-slate-800">{teacherData?.Fname} {teacherData?.Lname}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender</p>
                        <p className="font-bold text-slate-800 capitalize">{teacherData?.profiles?.gender || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Marital Status</p>
                        <p className="font-bold text-slate-800 capitalize">{teacherData?.profiles?.marital_status || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Religion</p>
                        <p className="font-bold text-slate-800 capitalize">{teacherData?.profiles?.religion || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills & Experience Summary */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-amber-500 rounded-full"></div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Professional Skills</h3>
                  </div>
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                    <div className="flex flex-wrap gap-3">
                      {teacherData?.teacherskill?.length > 0 ? (
                        teacherData.teacherskill.map((s, i) => (
                          <div key={i} className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-300"></div>
                            <div className="relative px-4 py-2 bg-white border border-amber-100 text-amber-900 rounded-xl text-xs font-black shadow-sm tracking-wide">
                              {s.skill?.name || s.name}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 italic">No skills listed</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Qualifications Section */}
                <div className="space-y-6 lg:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Educational Qualifications</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {teacherData?.teacherqualifications?.length > 0 ? (
                      teacherData.teacherqualifications.map((q, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow space-y-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                             <FiAward size={24} />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-slate-900 leading-tight">{q.qualification?.name}</h4>
                            <p className="text-slate-500 font-medium text-sm mt-1">{q.institution}</p>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{q.year_of_passing}</span>
                            <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold border border-teal-100">
                              {q.grade_or_percentage || "N/A"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full bg-white p-10 rounded-3xl border border-slate-100 shadow flex items-center justify-center text-slate-400 italic">
                        No qualifications found
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience Section */}
                <div className="space-y-6 lg:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-purple-600 rounded-full"></div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Teaching Experience</h3>
                  </div>
                  <div className="space-y-4">
                    {teacherData?.teacherexperiences?.length > 0 ? (
                      teacherData.teacherexperiences.map((exp, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg flex flex-col md:flex-row gap-8">
                          <div className="shrink-0">
                            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100">
                              <FiBriefcase size={32} />
                            </div>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                              <div>
                                <h4 className="text-xl font-black text-slate-900">{exp.institution}</h4>
                                <p className="text-purple-700 font-bold text-sm">{exp.role?.jobrole_name}</p>
                              </div>
                              <div className="px-4 py-2 bg-slate-50 rounded-xl text-slate-500 text-xs font-bold border border-slate-100 whitespace-nowrap">
                                {exp.start_date ? formatDate(exp.start_date, { dateOnly: true }) : ""} - {exp.end_date ? formatDate(exp.end_date, { dateOnly: true }) : "Present"}
                              </div>
                            </div>
                            {exp.achievements && (
                              <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                {exp.achievements}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow flex items-center justify-center text-slate-400 italic">
                        No experience details found
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Locations & Addresses */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-rose-500 rounded-full"></div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Preferred Job Locations</h3>
                  </div>
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-4">
                     {jobLocations.length > 0 ? (
                        <div className="flex flex-wrap gap-4">
                          {jobLocations.map((loc, i) => (
                            <div key={i} className="flex flex-col gap-1 p-4 bg-rose-50 rounded-2xl border border-rose-100 min-w-[200px]">
                              <FiMapPin className="text-rose-500 mb-2" size={20} />
                              <p className="text-xs font-black text-rose-400 uppercase tracking-widest">Target Location</p>
                              <p className="font-bold text-slate-800">{typeof loc === 'string' ? loc : `${loc.area || ''} ${loc.city || loc.district || ''}`}</p>
                              <p className="text-xs text-slate-500 font-bold">{loc.state}</p>
                            </div>
                          ))}
                        </div>
                     ) : (
                        <p className="text-slate-400 italic">No preferred locations listed</p>
                     )}
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-slate-700 rounded-full"></div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Residency Addresses</h3>
                  </div>
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-4">
                    {teacherData?.teachersaddress?.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                         {teacherData.teachersaddress.map((addr, i) => (
                           <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-4">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 shrink-0">
                                 <FiMapPin className="text-slate-400" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{addr.address_type} Address</p>
                                <p className="font-bold text-slate-800">{addr.area}</p>
                                <p className="text-sm text-slate-500 font-medium">
                                  {addr.district}, {addr.state} - <span className="text-teal-600 font-bold">{addr.pincode}</span>
                                </p>
                              </div>
                           </div>
                         ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-center p-4">No residency addresses provided</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Deactivate Modal */}
        {openDeactivateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-red-600">
                  Confirm Deactivation
                </h3>
                <button
                  onClick={() => setOpenDeactivateModal(false)}
                  className="text-gray-500"
                >
                  ✕
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-700">
                This action permanently removes this teacher's access to the
                platform.
              </div>
              <div className="mt-4">
                Are you sure you want to deactivate{" "}
                <strong>
                  {teacherData?.Fname} {teacherData?.Lname}
                </strong>
                's account? This action cannot be undone.
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setOpenDeactivateModal(false)}
                  className="px-3 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  className="px-3 py-2 bg-red-600 text-white rounded"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Snackbar */}
        {openSnackbar && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50">
            <div
              className={`px-4 py-2 rounded shadow ${notificationMessage.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
            >
              {notificationMessage.text}
            </div>
          </div>
        )}

        {/* JSON viewer modal */}
        {openJsonDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg p-4 max-w-3xl w-full max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{jsonDialogTitle}</h3>
                <button
                  onClick={() => setOpenJsonDialog(false)}
                  className="text-gray-500"
                >
                  ✕
                </button>
              </div>
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(jsonDialogContent, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ViewTeacherAdmin;

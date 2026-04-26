import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../Admin/Layout";
import { fetchSingleTeacherById, updateTeacherById } from "../../services/apiService";
import apiService from "../../services/apiService";
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
  FiEdit,
  FiEdit2,
  FiCheck,
  FiX,
  FiCalendar,
  FiClock,
  FiFileText,
  FiAlertCircle,
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
  const [editType, setEditType] = useState(null); // 'basic', 'academic', 'skills', 'education', 'experience', 'address', 'locations'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const [allCategories, setAllCategories] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [allSkills, setAllSkills] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Try both with and without leading slash if one fails, or just use relative
        const catResp = await apiService.getAll("api/admin/classcategory/");
        const subResp = await apiService.getAll("api/admin/subject/");
        const skillResp = await apiService.getAll("api/admin/skill/");
        
        setAllCategories(Array.isArray(catResp) ? catResp : (catResp?.results || []));
        setAllSubjects(Array.isArray(subResp) ? subResp : (subResp?.results || []));
        setAllSkills(Array.isArray(skillResp) ? skillResp : (skillResp?.results || []));
      } catch (err) {
        console.error("Failed to fetch options", err);
      }
    };
    fetchOptions();
  }, []);

  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState({
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

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleMultiFilterChange = (event, filterName) => {
    const { value } = event.target;
    setFilters({
      ...filters,
      [filterName]: typeof value === "string" ? value.split(",") : value,
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

  const openEditModal = (type) => {
    setEditType(type);
    let initialData = {};

    switch (type) {
      case "basic":
        initialData = {
          Fname: teacherData.Fname || "",
          Lname: teacherData.Lname || "",
          email: teacherData.email || "",
          is_active: !!teacherData.is_active,
          is_verified: !!teacherData.is_verified,
          profiles: {
            phone_number: teacherData.profiles?.phone_number || "",
            bio: teacherData.profiles?.bio || "",
            gender: teacherData.profiles?.gender || "",
            marital_status: teacherData.profiles?.marital_status || "",
            religion: teacherData.profiles?.religion || "",
            date_of_birth: teacherData.profiles?.date_of_birth || "",
          }
        };
        break;
      case "address":
        initialData = {
          teachersaddress: {
            current_address: teacherData.teachersaddress?.current_address || {},
            permanent_address: teacherData.teachersaddress?.permanent_address || {}
          }
        };
        break;
      case "academic":
        const pref = teacherData.preferences?.[0] || {};
        initialData = {
          preferences: {
            class_category: pref.class_category?.map(c => c.id) || [],
            prefered_subject: pref.prefered_subject?.map(s => s.id) || []
          }
        };
        break;
      case "skills":
        initialData = {
          teacherskill: teacherData.teacherskill || []
        };
        break;
      case "education":
        initialData = {
          teacherqualifications: teacherData.teacherqualifications || []
        };
        break;
      case "experience":
        initialData = {
          teacherexperiences: teacherData.teacherexperiences || []
        };
        break;
    }

    setEditFormData(initialData);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateTeacherById(id, editFormData);
      await fetchTeacherData();
      setIsEditModalOpen(false);
      setNotificationMessage({
        type: "success",
        text: "Information updated successfully",
      });
      setOpenSnackbar(true);
    } catch (err) {
      setNotificationMessage({
        type: "error",
        text: err.message || "Failed to update information",
      });
      setOpenSnackbar(true);
    } finally {
      setIsUpdating(false);
    }
  };

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
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-sm"
              >
                <FiEdit /> Edit
              </button>
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
                <div className="p-4 md:p-5">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start text-center md:text-left">
                    <div className="relative shrink-0">
                      <img
                        src={teacherData?.profiles?.profile_picture || "https://via.placeholder.com/150"}
                        alt="Profile"
                        className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg border border-gray-100 shadow-sm"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${teacherData?.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900">{teacherData?.Fname} {teacherData?.Lname}</h2>
                        <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-bold rounded border border-gray-200 uppercase tracking-widest">
                          ID: {teacherData?.user_code || id}
                        </span>
                      </div>

                      <div className="flex flex-col xl:flex-row gap-3">
                        {/* Compact Profile Completion */}
                        <div className="flex-1 max-w-sm space-y-1.5 p-2.5 bg-teal-50/30 rounded-lg border border-teal-100/50">
                          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                            <span className="text-teal-700">Completion</span>
                            <span className="text-teal-600 bg-teal-100/50 px-1.5 py-0.5 rounded">{teacherData?.completion_score ?? teacherData?.profile_completed ?? 0}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200 shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                                (teacherData?.completion_score ?? teacherData?.profile_completed ?? 0) < 40 ? 'bg-rose-500' :
                                (teacherData?.completion_score ?? teacherData?.profile_completed ?? 0) < 80 ? 'bg-orange-500' :
                                'bg-teal-500'
                              }`}
                              style={{ width: `${teacherData?.completion_score ?? teacherData?.profile_completed ?? 0}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-gray-500 italic leading-none">Edu, Exp, & Academic Prefs</p>
                        </div>

                        {/* Compact Pending Tasks */}
                        {teacherData?.profile_feedback?.length > 0 && (
                          <div className="flex-1 max-w-sm bg-amber-50/50 border border-amber-100 rounded-lg p-2.5 space-y-1.5">
                            <div className="flex items-center gap-2 text-amber-700">
                              <FiAlertCircle size={12} className="shrink-0" />
                              <span className="text-[9px] font-bold uppercase tracking-wider">Pending ({teacherData.profile_feedback.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                              {teacherData.profile_feedback.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                                  <div className="w-1 h-1 bg-amber-400 rounded-full shrink-0" />
                                  <span>{item.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4">
                        <div className="flex items-center gap-2 text-gray-600 break-all leading-none">
                          <FiUser size={13} className="shrink-0 text-gray-400" />
                          <span className="text-xs font-medium">{teacherData?.email || "No Email"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 leading-none">
                          <FiActivity size={13} className="text-gray-400" />
                          <span className="text-xs font-medium">{teacherData?.profiles?.phone_number || "No Phone"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 leading-none">
                          <FiCheck size={13} className={teacherData?.is_active ? "text-green-500" : "text-gray-400"} />
                          <span className="text-xs font-medium">{teacherData?.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 leading-none">
                          <FiCalendar size={13} className="text-gray-400" />
                          <span className="text-xs font-medium">Joined: {formatDate(teacherData?.date, { dateOnly: true })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 leading-none">
                          <FiClock size={13} className="text-gray-400" />
                          <span className="text-xs font-medium">Last Login: {teacherData?.last_login ? formatDate(teacherData.last_login) : "Never"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 leading-none">
                          <FiCheck size={13} className={teacherData?.is_verified ? "text-green-500" : "text-gray-400"} />
                          <span className="text-xs font-medium">{teacherData?.is_verified ? 'Verified' : 'Unverified'}</span>
                        </div>
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

              {/* Profile Details Container */}
              <div className="space-y-6 mt-6">
                {/* Basic & Contact Information Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-indigo-600 rounded-full" />
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Basic Information</h3>
                      </div>
                      <button onClick={() => openEditModal('basic')} className="p-1.5 hover:bg-gray-200 rounded text-teal-600 transition-colors">
                        <FiEdit size={14} />
                      </button>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      {[
                        { label: "Gender", value: teacherData?.profiles?.gender },
                        { label: "Marital Status", value: teacherData?.profiles?.marital_status },
                        { label: "Religion", value: teacherData?.profiles?.religion },
                        { label: "Birth Date", value: teacherData?.profiles?.date_of_birth ? formatDate(teacherData.profiles.date_of_birth, { dateOnly: true }) : "—" }
                      ].map((item, i) => (
                        <div key={i} className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{item.label}</p>
                          <p className="text-xs font-bold text-gray-800 capitalize">{item.value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-pink-600 rounded-full" />
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Contact Information</h3>
                      </div>
                      <button onClick={() => openEditModal('basic')} className="p-1.5 hover:bg-gray-200 rounded text-teal-600 transition-colors">
                        <FiEdit size={14} />
                      </button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center text-pink-600">
                          <FiUser size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                          <p className="text-xs font-bold text-gray-800 break-all">{teacherData?.email || "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600">
                          <FiActivity size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Phone Number</p>
                          <p className="text-xs font-bold text-gray-800">{teacherData?.profiles?.phone_number || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Professional Skills */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-orange-500 rounded-full" />
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Professional Skills</h3>
                      </div>
                      <button onClick={() => openEditModal('skills')} className="p-1.5 hover:bg-gray-200 rounded text-teal-600 transition-colors">
                        <FiEdit2 size={14} />
                      </button>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex flex-wrap gap-2">
                        {teacherData?.teacherskill?.length > 0 ? (
                          teacherData.teacherskill.map((s, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-orange-50 text-orange-700 text-[11px] font-bold rounded border border-orange-100 uppercase tracking-tight">
                              {s.skill?.name || s.skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-[11px] text-gray-400 italic">No skills listed.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Academic Preferences */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-teal-500 rounded-full" />
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Academic Preferences</h3>
                      </div>
                      <button onClick={() => openEditModal('academic')} className="p-1.5 hover:bg-gray-200 rounded text-teal-600 transition-colors">
                        <FiEdit2 size={14} />
                      </button>
                    </div>
                    <div className="p-4 flex-1 space-y-3">
                      {teacherData?.preferences?.length > 0 ? (
                        teacherData.preferences.map((pref, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              {pref.class_category?.map((cat, cidx) => (
                                <span key={cidx} className="px-2 py-0.5 bg-teal-100/50 text-teal-700 text-[10px] font-bold rounded border border-teal-200 uppercase">
                                  {cat.name}
                                </span>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {pref.prefered_subject?.map((sub, sidx) => (
                                <span key={sidx} className="px-2 py-0.5 bg-white text-blue-700 text-[10px] font-bold rounded border border-blue-200">
                                  {sub.subject_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-gray-400 italic">No preferences saved.</p>
                      )}
                    </div>
                  </div>

                  {/* Education Card (Full Width inside Grid) */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden lg:col-span-2">
                    <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-600 rounded-full" />
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Educational Qualifications</h3>
                      </div>
                      <button onClick={() => openEditModal('education')} className="p-1.5 hover:bg-gray-200 rounded text-teal-600 transition-colors">
                        <FiEdit2 size={14} />
                      </button>
                    </div>
                    <div className="p-4">
                      {teacherData?.teacherqualifications?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {teacherData.teacherqualifications.map((edu, idx) => (
                            <div key={idx} className="p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors group">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">{edu.qualification?.name || "Matric"}</span>
                                <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{edu.year_of_passing}</span>
                              </div>
                              <p className="text-xs font-bold text-gray-800 line-clamp-1 mb-1">{edu.institution}</p>
                              <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                                <span>Grade: <span className="text-blue-600">{edu.grade_or_percentage}</span></span>
                                {edu.stream_or_degree && <span className="italic">{edu.stream_or_degree}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 italic text-center py-4">No qualifications listed.</p>
                      )}
                    </div>
                  </div>

                  {/* Experience Card (Full Width inside Grid) */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden lg:col-span-2">
                    <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-purple-600 rounded-full" />
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Teaching Experience</h3>
                      </div>
                      <button onClick={() => openEditModal('experience')} className="p-1.5 hover:bg-gray-200 rounded text-teal-600 transition-colors">
                        <FiEdit2 size={14} />
                      </button>
                    </div>
                    <div className="p-4">
                      {teacherData?.teacherexperiences?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {teacherData.teacherexperiences.map((exp, idx) => (
                            <div key={idx} className="p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors group">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest">
                                  {typeof exp.role === 'object' ? exp.role?.jobrole_name : exp.role}
                                </span>
                                <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{exp.years_of_experience || 0} yrs</span>
                              </div>
                              <p className="text-xs font-bold text-gray-800 line-clamp-1 mb-1">{exp.institution}</p>
                              {exp.description && <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{exp.description}</p>}
                              {exp.achievements && <p className="text-[9px] text-purple-400 mt-1 italic">★ {exp.achievements}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 italic text-center py-4">No experience records.</p>
                      )}
                    </div>
                  </div>

                  {/* Preferred Locations */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-rose-500 rounded-full" />
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Preferred Locations</h3>
                      </div>
                      <button onClick={() => openEditModal('address')} className="p-1.5 hover:bg-gray-200 rounded text-teal-600 transition-colors">
                        <FiEdit2 size={14} />
                      </button>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex flex-wrap gap-2">
                        {teacherData?.jobpreferencelocation?.length > 0 ? (
                          teacherData.jobpreferencelocation.map((loc, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-rose-50 text-rose-700 text-[11px] font-bold rounded border border-rose-100 tracking-tight uppercase">
                              {loc.location}
                            </span>
                          ))
                        ) : (
                          <p className="text-[11px] text-gray-400 italic">No preferences set.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Residency (Detailed) */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-slate-700 rounded-full" />
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Residency</h3>
                      </div>
                      <button onClick={() => openEditModal('address')} className="p-1.5 hover:bg-gray-200 rounded text-teal-600 transition-colors">
                        <FiEdit2 size={14} />
                      </button>
                    </div>
                    <div className="p-4 flex-1">
                      {teacherData?.teachersaddress ? (
                        <div className="space-y-4">
                          {[
                            { type: "Current", data: teacherData.teachersaddress.current_address },
                            { type: "Permanent", data: teacherData.teachersaddress.permanent_address }
                          ].map((addr, idx) => addr.data && (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                                <FiMapPin className="text-gray-400" size={14} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1.5">{addr.type} Address</p>
                                <p className="text-xs font-bold text-gray-800 truncate">{addr.data.area || addr.data.village || 'N/A'}</p>
                                <p className="text-[11px] text-gray-500 truncate">{addr.data.district || addr.data.city}, {addr.data.state} {addr.data.pincode}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 italic">No address records.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Applied Jobs History */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-orange-500 rounded-full" />
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Applied Jobs / Hiring History</h3>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                          <th className="p-3 text-left font-bold">Category</th>
                          <th className="p-3 text-left font-bold">Subject</th>
                          <th className="p-3 text-left font-bold">Job Type</th>
                          <th className="p-3 text-left font-bold">Location</th>
                          <th className="p-3 text-left font-bold">Exp. Salary</th>
                          <th className="p-3 text-left font-bold">Status</th>
                          <th className="p-3 text-left font-bold">Applied On</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {teacherData?.apply?.length > 0 ? teacherData.apply.map((app, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3 font-semibold text-gray-700">{app.class_category?.name || "—"}</td>
                            <td className="p-3 font-medium text-teal-700">{app.subject?.name || "—"}</td>
                            <td className="p-3 text-gray-600">{app.teacher_job_type?.teacher_job_name || "—"}</td>
                            <td className="p-3 text-gray-500">
                              {app.preferred_locations?.length > 0 
                                ? app.preferred_locations.map(l => l.area || l.city).join(", ") 
                                : "—"}
                            </td>
                            <td className="p-3 text-gray-700 font-bold">₹{app.expected_salary || "—"}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                String(app.status).toLowerCase() === 'accepted' ? 'bg-green-100 text-green-700 border border-green-200' :
                                String(app.status).toLowerCase() === 'rejected' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                'bg-orange-100 text-orange-700 border border-orange-200'
                              }`}>
                                {app.status || "Pending"}
                              </span>
                            </td>
                            <td className="p-3 text-gray-500 italic whitespace-nowrap">{formatDate(app.created_at, { dateOnly: true })}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={7} className="p-8 text-center text-gray-400 italic">No job applications found for this teacher.</td></tr>
                        )}
                      </tbody>
                    </table>
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

        {/* Dynamic Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8 overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                    <FiEdit size={18} />
                  </div>
                  <h3 className="font-bold text-gray-800">
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Edit {editType.charAt(0).toUpperCase() + editType.slice(1)}</h2>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-0.5">Teacher Profile Management</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                  <FiX className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                {editType === 'basic' && (
                  <React.Fragment>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">First Name</label>
                        <input
                          type="text"
                          value={editFormData.Fname || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, Fname: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Name</label>
                        <input
                          type="text"
                          value={editFormData.Lname || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, Lname: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                        <input
                          type="email"
                          value={editFormData.email || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date of Birth</label>
                        <input
                          type="date"
                          value={editFormData.profiles?.date_of_birth || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, profiles: { ...editFormData.profiles, date_of_birth: e.target.value } })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </React.Fragment>
                )}

                {editType === 'academic' && (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 p-2 rounded">Select Preferred Subjects</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      {allSubjects
                        .filter(sub => {
                          const selectedCats = editFormData.preferences?.class_category || [];
                          if (selectedCats.length === 0) return true;
                          return selectedCats.includes(sub.class_category);
                        })
                        .map(sub => (
                        <label key={sub.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors group border border-gray-100">
                          <input
                            type="checkbox"
                            checked={editFormData.preferences?.prefered_subject?.includes(sub.id)}
                            onChange={() => {
                              const current = editFormData.preferences?.prefered_subject || [];
                              const updated = current.includes(sub.id) ? current.filter(i => i !== sub.id) : [...current, sub.id];
                              setEditFormData({ ...editFormData, preferences: { ...editFormData.preferences, prefered_subject: updated } });
                            }}
                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                          />
                          <span className="text-[11px] font-bold text-gray-700 group-hover:text-indigo-700 line-clamp-1">{sub.subject_name || sub.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {editType === 'education' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 p-2 rounded">Educational Qualifications</h4>
                      <button type="button" onClick={() => setEditFormData({ ...editFormData, teacherqualifications: [...(editFormData.teacherqualifications || []), { qualification: 1, institution: '', year_of_passing: '', grade_or_percentage: '', stream_or_degree: '' }] })} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">
                        <FiPlus /> Add New
                      </button>
                    </div>
                    <div className="space-y-4">
                      {(editFormData.teacherqualifications || []).map((edu, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                          <button type="button" onClick={() => {
                            const updated = editFormData.teacherqualifications.filter((_, i) => i !== idx);
                            setEditFormData({ ...editFormData, teacherqualifications: updated });
                          }} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                            <FiTrash2 size={14} />
                          </button>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase">Level</label>
                              <select 
                                value={edu.qualification?.id || edu.qualification} 
                                onChange={(e) => {
                                  const updated = [...editFormData.teacherqualifications];
                                  updated[idx].qualification = parseInt(e.target.value);
                                  setEditFormData({ ...editFormData, teacherqualifications: updated });
                                }}
                                className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                              >
                                <option value="1">Matric</option>
                                <option value="2">Intermediate</option>
                                <option value="3">Graduation</option>
                                <option value="4">Post Graduation</option>
                                <option value="5">Other</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase">Year</label>
                              <input 
                                placeholder="YYYY" 
                                value={edu.year_of_passing || ''} 
                                onChange={(e) => {
                                  const updated = [...editFormData.teacherqualifications];
                                  updated[idx].year_of_passing = e.target.value;
                                  setEditFormData({ ...editFormData, teacherqualifications: updated });
                                }}
                                className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs" 
                              />
                            </div>
                          </div>
                          <div className="space-y-1 mb-3">
                            <label className="text-[9px] font-bold text-gray-400 uppercase">Institution</label>
                            <input 
                              placeholder="School / University Name" 
                              value={edu.institution || ''} 
                              onChange={(e) => {
                                const updated = [...editFormData.teacherqualifications];
                                updated[idx].institution = e.target.value;
                                setEditFormData({ ...editFormData, teacherqualifications: updated });
                              }}
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs" 
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input 
                              placeholder="Stream / Degree" 
                              value={edu.stream_or_degree || ''} 
                              onChange={(e) => {
                                const updated = [...editFormData.teacherqualifications];
                                updated[idx].stream_or_degree = e.target.value;
                                setEditFormData({ ...editFormData, teacherqualifications: updated });
                              }}
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs" 
                            />
                            <input 
                              placeholder="Grade / %" 
                              value={edu.grade_or_percentage || ''} 
                              onChange={(e) => {
                                const updated = [...editFormData.teacherqualifications];
                                updated[idx].grade_or_percentage = e.target.value;
                                setEditFormData({ ...editFormData, teacherqualifications: updated });
                              }}
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {editType === 'experience' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest bg-purple-50 p-2 rounded">Professional Experience</h4>
                      <button type="button" onClick={() => setEditFormData({ ...editFormData, teacherexperiences: [...(editFormData.teacherexperiences || []), { role: 1, institution: '', start_date: '', end_date: '', description: '', achievements: '' }] })} className="text-[10px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg">
                        <FiPlus /> Add New
                      </button>
                    </div>
                    <div className="space-y-4">
                      {(editFormData.teacherexperiences || []).map((exp, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                          <button type="button" onClick={() => {
                            const updated = editFormData.teacherexperiences.filter((_, i) => i !== idx);
                            setEditFormData({ ...editFormData, teacherexperiences: updated });
                          }} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                            <FiTrash2 size={14} />
                          </button>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase">Role Type</label>
                              <select 
                                value={exp.role?.id || exp.role} 
                                onChange={(e) => {
                                  const updated = [...editFormData.teacherexperiences];
                                  updated[idx].role = parseInt(e.target.value);
                                  setEditFormData({ ...editFormData, teacherexperiences: updated });
                                }}
                                className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                              >
                                <option value="1">Mathematics</option>
                                <option value="2">Science</option>
                                <option value="3">English</option>
                                <option value="4">Social Science</option>
                                <option value="5">Other</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase">Institution</label>
                              <input 
                                placeholder="School / Coaching Name" 
                                value={exp.institution || ''} 
                                onChange={(e) => {
                                  const updated = [...editFormData.teacherexperiences];
                                  updated[idx].institution = e.target.value;
                                  setEditFormData({ ...editFormData, teacherexperiences: updated });
                                }}
                                className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs" 
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase">Start Date</label>
                              <input 
                                type="date"
                                value={exp.start_date || ''} 
                                onChange={(e) => {
                                  const updated = [...editFormData.teacherexperiences];
                                  updated[idx].start_date = e.target.value;
                                  setEditFormData({ ...editFormData, teacherexperiences: updated });
                                }}
                                className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase">End Date</label>
                              <input 
                                type="date"
                                value={exp.end_date || ''} 
                                onChange={(e) => {
                                  const updated = [...editFormData.teacherexperiences];
                                  updated[idx].end_date = e.target.value;
                                  setEditFormData({ ...editFormData, teacherexperiences: updated });
                                }}
                                className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs" 
                                placeholder="Leave blank for Present"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <textarea 
                              placeholder="Role Description" 
                              value={exp.description || ''} 
                              onChange={(e) => {
                                const updated = [...editFormData.teacherexperiences];
                                updated[idx].description = e.target.value;
                                setEditFormData({ ...editFormData, teacherexperiences: updated });
                              }}
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs h-16 resize-none" 
                            />
                            <input 
                              placeholder="Key Achievements" 
                              value={exp.achievements || ''} 
                              onChange={(e) => {
                                const updated = [...editFormData.teacherexperiences];
                                updated[idx].achievements = e.target.value;
                                setEditFormData({ ...editFormData, teacherexperiences: updated });
                              }}
                              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs italic" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-50 shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isUpdating ? <FiClock className="animate-spin" /> : <FiCheck />}
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ViewTeacherAdmin;

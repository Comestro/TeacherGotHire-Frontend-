import React, { useEffect, useMemo, useState, useCallback } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {
  FiRefreshCw,
  FiEye,
  FiClock,
  FiX,
  FiCheck,
  FiDownload,
  FiList,
  FiBarChart2,
  FiFilter,
  FiSearch,
  FiExternalLink,
  FiPlus,
  FiAlertCircle,
} from "react-icons/fi";
import Layout from "../Admin/Layout";
import {
  getInterview,
  updateInterview,
  createInterview,
  getReadyForInterview,
} from "../../services/adminInterviewApi";
import debounce from "lodash/debounce";

dayjs.extend(isBetween);

const stringToColor = (string = "") => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

const ErrorMessage = ({ message, type = "error", onClose }) => {
  if (!message) return null;
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 animate-fade-in-up px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
        type === "success" ? "bg-teal-600 text-white" : "bg-red-500 text-white"
      }`}
    >
      {type === "success" ? <FiCheck /> : <FiAlertCircle />}
      <p className="text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <FiX size={14} />
        </button>
      )}
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
        {footer && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default function InterviewManagementRedesign() {
  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table");

  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "",
    teacherName: "",
    classCategory: "",
    subject: "",
    level: "",
    attempt: "",
    dateFrom: "",
    dateTo: "",
  });

  const [detailsModal, setDetailsModal] = useState({ open: false, data: null });
  const [scheduleModal, setScheduleModal] = useState({
    open: false,
    data: null,
  });
  const [rejectModal, setRejectModal] = useState({ open: false, data: null });
  const [completeModal, setCompleteModal] = useState({
    open: false,
    data: null,
  });
  const [createModal, setCreateModal] = useState(false);
  const [readyUsers, setReadyUsers] = useState([]);
  const [readyLoading, setReadyLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    user: "",
    subject: "",
    level: "",
    class_category: "",
    time: "",
    link: "",
    status: "requested",
    reject_reason: "",
    grade: "",
    attempt: 1,
  });

  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingLinkError, setMeetingLinkError] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [interviewScore, setInterviewScore] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10 });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "success" }),
      4000
    );
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const determineStatus = useCallback((interview) => {
    if (typeof interview.status === "string") {
      switch (interview.status) {
        case "fulfilled":
          return "Completed";
        case "requested":
          return "Pending";
        case "scheduled":
          return "Scheduled";
        case "rejected":
          return "Rejected";
        default:
          return interview.status;
      }
    }
    if (interview.grade != null) return "Completed";
    if (interview.status && interview.link) return "Scheduled";
    if (interview.rejectionReason) return "Rejected";
    return "Pending";
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const resp = await getInterview();
      const data = (Array.isArray(resp) ? resp : []).map((item) => {
        const status = determineStatus(item);
        return {
          id: item.id,
          name: `${item.user?.Fname || ""} ${item.user?.Lname || ""}`.trim(),
          userId: item.user?.id,
          email: item.user?.email,
          profilePicture: item.user?.profile_picture,
          classCategory: item.class_category?.name || "Unknown",
          subjectName: item.subject?.subject_name || "Unknown",
          level: item.level?.name || "Unknown",
          levelCode: item.level?.level_code,
          score: item.grade != null ? item.grade : "Not graded",
          status,
          apiStatus: item.status,
          desiredDateTime: item.time
            ? dayjs(item.time).format("YYYY-MM-DD HH:mm")
            : "—",
          scheduledDate:
            (item.status === "scheduled" || item.status === "fulfilled") &&
            item.time
              ? dayjs(item.time).format("YYYY-MM-DD HH:mm")
              : null,
          rejectionReason: item.rejectionReason || null,
          link: item.link,
          attempt: item.attempt,
          createdAt: item.created_at
            ? dayjs(item.created_at).format("YYYY-MM-DD HH:mm")
            : "—",
          mergedSubject: `${item.subject?.subject_name || ""} (${
            item.class_category?.name || ""
          })`,
          original: item,
        };
      });
      setInterviewData(data);
      setFilteredTeachers(data);
    } catch (err) {
      showNotification(err?.message || "Failed to fetch interviews", "error");
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => setFilters((f) => ({ ...f, searchTerm: value })), 250),
    []
  );

  useEffect(() => {
    applyFilters();
  }, [filters, interviewData]);

  const applyFilters = () => {
    let out = [...interviewData];
    const q = (filters.searchTerm || "").toLowerCase().trim();

    if (filters.status) out = out.filter((t) => t.status === filters.status);
    if (filters.teacherName)
      out = out.filter((t) =>
        t.name.toLowerCase().includes(filters.teacherName.toLowerCase())
      );
    if (filters.classCategory)
      out = out.filter((t) => t.classCategory === filters.classCategory);
    if (filters.subject)
      out = out.filter((t) => t.subjectName === filters.subject);
    if (filters.level) out = out.filter((t) => t.level === filters.level);
    if (filters.attempt)
      out = out.filter((t) => String(t.attempt) === String(filters.attempt));

    if (filters.dateFrom && filters.dateTo) {
      out = out.filter((t) => {
        if (!t.desiredDateTime || t.desiredDateTime === "—") return false;
        const d = dayjs(t.desiredDateTime);
        const from = dayjs(filters.dateFrom);
        const to = dayjs(filters.dateTo);
        return (
          (d.isAfter(from) || d.isSame(from, "day")) &&
          (d.isBefore(to) || d.isSame(to, "day"))
        );
      });
    }

    if (q) {
      out = out.filter((t) =>
        Object.values(t).some((v) => String(v).toLowerCase().includes(q))
      );
    }

    setFilteredTeachers(out);
    setPagination((p) => ({ ...p, page: 0 }));
  };

  const resetFilters = () =>
    setFilters({
      searchTerm: "",
      status: "",
      teacherName: "",
      classCategory: "",
      subject: "",
      level: "",
      attempt: "",
      dateFrom: "",
      dateTo: "",
    });

  const exportCsv = () => {
    const headers = [
      "Teacher Name",
      "Email",
      "Subject (Class)",
      "Status",
      "Score",
      "Desired Date/Time",
      "Scheduled Date",
    ];
    const rows = filteredTeachers.map((t) =>
      [
        t.name,
        t.email,
        t.mergedSubject,
        `${t.status}`,
        t.score,
        t.desiredDateTime,
        t.scheduledDate || "Not scheduled",
      ]
        .map((cell) => `"${String(cell || "")?.replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.join("\n");
    const encoded = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute(
      "download",
      `teacher_interviews_${dayjs().format("YYYY-MM-DD")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openSchedule = (row) => {
    setScheduleModal({ open: true, data: row });
    setSelectedDateTime(
      row.desiredDateTime !== "—"
        ? dayjs(row.desiredDateTime).format("YYYY-MM-DDTHH:mm")
        : dayjs().format("YYYY-MM-DDTHH:mm")
    );
    setMeetingLink(row.link || "");
    setMeetingLinkError(false);
  };

  const scheduleInterview = async () => {
    if (!meetingLink.trim()) {
      setMeetingLinkError(true);
      return;
    }
    setActionLoading(true);
    try {
      await updateInterview(scheduleModal.data.id, {
        status: "scheduled",
        time: dayjs(selectedDateTime).format("YYYY-MM-DD HH:mm:ss"),
        link: meetingLink,
      });
      showNotification("Interview scheduled successfully", "success");
      setScheduleModal({ open: false, data: null });
      fetchInterviews();
    } catch (err) {
      showNotification(
        err?.response?.data?.message || err?.message || "Failed to schedule",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openReject = (row) => {
    setRejectModal({ open: true, data: row });
    setRejectionReason("");
  };

  const rejectInterview = async () => {
    if (!rejectionReason.trim()) {
      showNotification("Rejection reason required", "error");
      return;
    }
    setActionLoading(true);
    try {
      await updateInterview(rejectModal.data.id, {
        status: "rejected",
        rejectionReason,
      });
      showNotification("Interview rejected", "success");
      setRejectModal({ open: false, data: null });
      fetchInterviews();
    } catch (err) {
      showNotification(
        err?.response?.data?.message || err?.message || "Failed to reject",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openComplete = (row) => {
    setCompleteModal({ open: true, data: row });
    setInterviewScore("");
  };

  const completeInterview = async () => {
    const score = Number(interviewScore);
    if (isNaN(score) || score < 0 || score > 10) {
      showNotification("Score must be 0-10", "error");
      return;
    }
    setActionLoading(true);
    try {
      await updateInterview(completeModal.data.id, {
        status: "fulfilled",
        grade: score,
      });
      showNotification("Interview marked complete", "success");
      setCompleteModal({ open: false, data: null });
      fetchInterviews();
    } catch (err) {
      showNotification(
        err?.response?.data?.message || err?.message || "Failed to complete",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateInterview = async () => {
    setActionLoading(true);
    try {
      const payload = {
        ...createForm,
        time: createForm.time
          ? dayjs(createForm.time).format("YYYY-MM-DDTHH:mm:ss[Z]")
          : null,
        grade: createForm.grade ? Number(createForm.grade) : null,
        user: Number(createForm.user),
        subject: Number(createForm.subject),
        level: Number(createForm.level),
        class_category: Number(createForm.class_category),
        attempt: Number(createForm.attempt),
      };
      await createInterview(payload);
      showNotification("Interview created successfully", "success");
      setCreateModal(false);
      setCreateForm({
        user: "",
        subject: "",
        level: "",
        class_category: "",
        time: "",
        link: "",
        status: "requested",
        reject_reason: "",
        grade: "",
        attempt: 1,
      });
      fetchInterviews();
    } catch (err) {
      showNotification(
        err?.response?.data?.message || err?.message || "Failed to create",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCreate = async () => {
    setCreateModal(true);
    setReadyLoading(true);
    try {
      const resp = await getReadyForInterview();
      setReadyUsers(resp.teachers || []);
    } catch (err) {
      console.error("Failed to load ready users", err);
      showNotification("Failed to load candidates", "warning");
    } finally {
      setReadyLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "Scheduled":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const displayedData = useMemo(() => {
    const start = pagination.page * pagination.pageSize;
    return filteredTeachers.slice(start, start + pagination.pageSize);
  }, [filteredTeachers, pagination]);

  const totalPages = Math.ceil(filteredTeachers.length / pagination.pageSize);

  return (
    <Layout>
      <div className="p-2 md:p-4 bg-gray-50 min-h-screen font-sans">
        {notification.show && (
          <ErrorMessage
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ ...notification, show: false })}
          />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiBarChart2 className="text-teal-600" /> Interview Management
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Streamline your teacher assessment process
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchInterviews}
              className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm shadow-sm transition-colors"
            >
              <FiPlus /> Add Interview
            </button>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 ${
                  viewMode === "table"
                    ? "bg-teal-50 text-teal-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <FiList />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 ${
                  viewMode === "card"
                    ? "bg-teal-50 text-teal-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <FiBarChart2 />
              </button>
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                filtersOpen
                  ? "bg-teal-50 border-teal-200 text-teal-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FiFilter /> Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {filtersOpen && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-1 relative">
                <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.searchTerm}
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none bg-white"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
              <input
                type="text"
                placeholder="Teacher Name"
                value={filters.teacherName}
                onChange={(e) =>
                  setFilters({ ...filters, teacherName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
              />
              <input
                type="text"
                placeholder="Subject"
                value={filters.subject}
                onChange={(e) =>
                  setFilters({ ...filters, subject: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
              />

              <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={resetFilters}
                  className="text-red-500 text-sm hover:underline px-3"
                >
                  Reset Filters
                </button>
                <button
                  onClick={exportCsv}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                >
                  <FiDownload /> Export CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl shadow-sm">
            <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading interviews...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiSearch className="text-gray-400 text-xl" />
            </div>
            <h3 className="text-gray-900 font-medium">No interviews found</h3>
            <p className="text-gray-500 text-sm mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : viewMode === "table" ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3">Subject (Class)</th>
                    <th className="px-4 py-3">Desired Time</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Scheduled</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {displayedData.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase"
                            style={{ backgroundColor: stringToColor(row.name) }}
                          >
                            {row.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {row.name}
                            </p>
                            <p className="text-xs text-gray-500">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {row.mergedSubject}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {row.desiredDateTime}
                      </td>
                      <td className="px-4 py-3">
                        {row.score !== "Not graded" ? (
                          <span className="font-bold text-gray-800">
                            {row.score}/10
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(
                            row.status
                          )}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {row.scheduledDate || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              setDetailsModal({ open: true, data: row })
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:shadow-sm ring-1 ring-inset ring-indigo-100 transition-all"
                            title="View"
                          >
                            <FiEye size={16} />
                          </button>
                          {row.apiStatus === "requested" && (
                            <>
                              <button
                                onClick={() => openSchedule(row)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-sm ring-1 ring-inset ring-blue-100 transition-all"
                                title="Schedule"
                              >
                                <FiClock size={16} />
                              </button>
                              <button
                                onClick={() => openReject(row)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-sm ring-1 ring-inset ring-red-100 transition-all"
                                title="Reject"
                              >
                                <FiX size={16} />
                              </button>
                            </>
                          )}
                          {row.apiStatus === "scheduled" && (
                            <>
                              <button
                                onClick={() => openComplete(row)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:shadow-sm ring-1 ring-inset ring-green-100 transition-all"
                                title="Complete"
                              >
                                <FiCheck size={16} />
                              </button>
                              {row.link && (
                                <button
                                  onClick={() =>
                                    window.open(row.link, "_blank")
                                  }
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 hover:shadow-sm ring-1 ring-inset ring-purple-100 transition-all"
                                  title="Link"
                                >
                                  <FiExternalLink size={16} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedData.map((row) => (
              <div
                key={row.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white uppercase"
                      style={{ backgroundColor: stringToColor(row.name) }}
                    >
                      {row.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{row.name}</p>
                      <p className="text-xs text-gray-500">{row.email}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span>Subject:</span>{" "}
                    <span className="font-medium">{row.mergedSubject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Desired:</span> <span>{row.desiredDateTime}</span>
                  </div>
                  {row.scheduledDate && (
                    <div className="flex justify-between text-blue-600">
                      <span>Scheduled:</span> <span>{row.scheduledDate}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setDetailsModal({ open: true, data: row })}
                    className="text-xs font-medium text-gray-500 hover:text-gray-900"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredTeachers.length > 0 && viewMode === "table" && (
          <div className="mt-4 flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-xs text-gray-500">
              Page {pagination.page + 1} of {totalPages || 1}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPagination({ ...pagination, page: i })}
                  className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium ${
                    pagination.page === i
                      ? "bg-teal-600 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <Modal
        isOpen={detailsModal.open}
        onClose={() => setDetailsModal({ open: false, data: null })}
        title="Interview Details"
        footer={
          <button
            onClick={() => setDetailsModal({ open: false, data: null })}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        }
      >
        {detailsModal.data && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white uppercase"
                style={{
                  backgroundColor: stringToColor(detailsModal.data.name),
                }}
              >
                {detailsModal.data.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">
                  {detailsModal.data.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {detailsModal.data.email}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase">
                  Subject
                </label>
                <p>{detailsModal.data.mergedSubject}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase">
                  Status
                </label>
                <p>{detailsModal.data.status}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase">
                  Desired Time
                </label>
                <p>{detailsModal.data.desiredDateTime}</p>
              </div>
              {detailsModal.data.scheduledDate && (
                <div>
                  <label className="block text-xs font-bold text-blue-400 uppercase">
                    Scheduled
                  </label>
                  <p className="font-medium text-blue-600">
                    {detailsModal.data.scheduledDate}
                  </p>
                </div>
              )}
              {detailsModal.data.rejectionReason && (
                <div className="col-span-2 bg-red-50 p-3 rounded border border-red-100">
                  <label className="block text-xs font-bold text-red-500 uppercase">
                    Rejection Reason
                  </label>
                  <p className="text-red-700">
                    {detailsModal.data.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={scheduleModal.open}
        onClose={() => setScheduleModal({ open: false, data: null })}
        title="Schedule Interview"
        footer={
          <>
            <button
              onClick={() => setScheduleModal({ open: false, data: null })}
              className="px-4 py-2 text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={scheduleInterview}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {actionLoading ? "Scheduling..." : "Schedule"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time
            </label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={selectedDateTime}
              onChange={(e) => setSelectedDateTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Link
            </label>
            <input
              type="text"
              className={`w-full border rounded-lg px-3 py-2 ${
                meetingLinkError ? "border-red-500" : "border-gray-300"
              }`}
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, data: null })}
        title="Reject Interview"
        footer={
          <>
            <button
              onClick={() => setRejectModal({ open: false, data: null })}
              className="px-4 py-2 text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={rejectInterview}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {actionLoading ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            rows="3"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason for rejection..."
          ></textarea>
        </div>
      </Modal>

      <Modal
        isOpen={completeModal.open}
        onClose={() => setCompleteModal({ open: false, data: null })}
        title="Complete Interview"
        footer={
          <>
            <button
              onClick={() => setCompleteModal({ open: false, data: null })}
              className="px-4 py-2 text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={completeInterview}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {actionLoading ? "Saving..." : "Mark Complete"}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Score (0-10)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            value={interviewScore}
            onChange={(e) => setInterviewScore(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Record"
        footer={
          <>
            <button
              onClick={() => setCreateModal(false)}
              className="px-4 py-2 text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateInterview}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {actionLoading ? "Creating..." : "Create"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500">Candidate</label>
            {readyLoading ? (
              <div className="text-xs text-gray-400 p-1">Loading users...</div>
            ) : (
              <select
                className="w-full border rounded px-2 py-1 bg-white"
                value={createForm.user}
                onChange={(e) =>
                  setCreateForm({ ...createForm, user: e.target.value })
                }
              >
                <option value="">Select Candidate</option>
                {readyUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.Fname} {u.Lname} ({u.email})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500">
              Subject ID
            </label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={createForm.subject}
              onChange={(e) =>
                setCreateForm({ ...createForm, subject: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500">Level ID</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={createForm.level}
              onChange={(e) =>
                setCreateForm({ ...createForm, level: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500">
              Category ID
            </label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={createForm.class_category}
              onChange={(e) =>
                setCreateForm({ ...createForm, class_category: e.target.value })
              }
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-bold text-gray-500">Time</label>
            <input
              type="datetime-local"
              className="w-full border rounded px-2 py-1"
              value={createForm.time}
              onChange={(e) =>
                setCreateForm({ ...createForm, time: e.target.value })
              }
            />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

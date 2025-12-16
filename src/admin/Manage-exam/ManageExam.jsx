import React, { useState, useEffect, useMemo } from "react";
import {
  FiSearch,
  FiEye,
  FiMoreVertical,
  FiCheck,
  FiX,
  FiTrash2,
  FiPlus,
  FiFilter,
  FiRefreshCw,
  FiEdit2,
  FiLayers,
  FiClock,
  FiBook,
  FiAlertCircle,
} from "react-icons/fi";
import Layout from "../Admin/Layout";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import {
  getExam,
  deleteExam,
  createExam,
  updateExam,
} from "../../services/adminManageExam";
import { getSubjects } from "../../services/adminSubujectApi";
import { getClassCategory } from "../../services/adminClassCategoryApi";
import { getLevel } from "../../services/adminManageLevel";
import apiService from "../../services/apiService";

// Reusable Components matching other refined pages
const ErrorMessage = ({ message, type = "error", onClose }) => {
  if (!message) return null;
  const bg =
    type === "success"
      ? "bg-green-50"
      : type === "warning"
      ? "bg-yellow-50"
      : "bg-red-50";
  const text =
    type === "success"
      ? "text-green-800"
      : type === "warning"
      ? "text-yellow-800"
      : "text-red-800";
  const border =
    type === "success"
      ? "border-green-200"
      : type === "warning"
      ? "border-yellow-200"
      : "border-red-200";
  const Icon =
    type === "success"
      ? FiCheck
      : type === "warning"
      ? FiAlertCircle
      : FiAlertCircle;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-3 mb-4 rounded-lg border ${bg} ${border} ${text} shadow-lg animate-fade-in-down`}
    >
      <Icon className="w-5 h-5 mr-2" />
      <div className="text-sm font-medium pr-2">{message}</div>
      <button
        onClick={onClose}
        className={`ml-auto p-1 rounded-full hover:bg-black/5 transition-colors`}
      >
        <FiX size={14} />
      </button>
    </div>
  );
};

export default function ExamManagement() {
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [classCategories, setClassCategories] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // Default to table for compact view
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filters
  const [filterClassCategoryId, setFilterClassCategoryId] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState("");
  const [filterLevelId, setFilterLevelId] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAddedBy, setFilterAddedBy] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    class_category: "",
    level: "",
    total_marks: "",
    duration: "",
    type: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const uniqueUsers = useMemo(() => {
    const setNames = new Set();
    exams.forEach((ex) => {
      const name = ex.assigneduser_name || "Admin";
      if (name) setNames.add(name);
    });
    return Array.from(setNames).sort();
  }, [exams]);

  useEffect(() => {
    loadAll(page, itemsPerPage);
  }, [page, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    searchQuery,
    filterClassCategoryId,
    filterSubjectId,
    filterLevelId,
    filterType,
    filterStatus,
    filterAddedBy,
  ]);

  const loadAll = async (currentPage = 1, currentRowsPerPage = 10) => {
    setLoading(true);
    try {
      const examResp = await apiService.getAll(
        `api/examsetter/?page=${currentPage}&page_size=${currentRowsPerPage}`
      );
      const [subjectResp, classResp, levelResp] = await Promise.all([
        getSubjects(),
        getClassCategory(),
        getLevel(),
      ]);

      setExams(Array.isArray(examResp.results) ? examResp.results : []);
      setTotalCount(examResp.count || 0);
      setSubjects(Array.isArray(subjectResp) ? subjectResp : []);
      setClassCategories(Array.isArray(classResp) ? classResp : []);
      setLevels(Array.isArray(levelResp) ? levelResp : []);
    } catch (err) {
      showNotification(
        err?.response?.data?.message || err.message || "Failed to load data",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getAssignedUserName = (exam) => {
    return exam.assigneduser_name || "Admin";
  };

  const filteredExams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return exams.filter((exam) => {
      const matchesQuery =
        !q ||
        exam.name.toLowerCase().includes(q) ||
        String(exam.id).includes(q);
      const matchesClass =
        !filterClassCategoryId ||
        exam.class_category ===
          classCategories.find((c) => c.id === Number(filterClassCategoryId))
            ?.name;
      const matchesSub =
        !filterSubjectId ||
        exam.subject ===
          subjects.find((s) => s.id === Number(filterSubjectId))?.subject_name;
      const matchesLevel =
        !filterLevelId ||
        exam.level === levels.find((l) => l.id === Number(filterLevelId))?.name;
      const matchesType = !filterType || exam.type === filterType;
      const matchesStatus =
        filterStatus === "" ? true : String(exam.status) === filterStatus;
      const matchesAdded =
        !filterAddedBy || getAssignedUserName(exam) === filterAddedBy;

      return (
        matchesQuery &&
        matchesClass &&
        matchesSub &&
        matchesLevel &&
        matchesType &&
        matchesStatus &&
        matchesAdded
      );
    });
  }, [
    exams,
    searchQuery,
    filterClassCategoryId,
    filterSubjectId,
    filterLevelId,
    filterType,
    filterStatus,
    filterAddedBy,
    classCategories,
    subjects,
    levels,
  ]);

  const handleOpenAdd = () => {
    setSelectedExam(null);
    setFormData({
      name: "",
      subject: "",
      class_category: "",
      level: "",
      total_marks: "",
      duration: "",
      type: "",
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleEdit = (exam) => {
    setSelectedExam(exam);
    setFormData({
      name: exam.name || "",
      subject: subjects.find((s) => s.subject_name === exam.subject)?.id || "",
      class_category:
        classCategories.find((c) => c.name === exam.class_category)?.id || "",
      level: levels.find((l) => l.name === exam.level)?.id || "",
      total_marks: exam.total_marks || "",
      duration: exam.duration || "",
      type: exam.type || "",
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name) errs.name = "Required";
    if (!formData.class_category) errs.class_category = "Required";
    if (!formData.subject) errs.subject = "Required";
    if (!formData.level) errs.level = "Required";
    if (!formData.total_marks || Number(formData.total_marks) <= 0)
      errs.total_marks = "Must be > 0";
    if (!formData.duration || Number(formData.duration) <= 0)
      errs.duration = "Must be > 0";

    const selectedLevel = levels.find((l) => l.id === Number(formData.level));
    if (selectedLevel && selectedLevel.level_code >= 2.0 && !formData.type)
      errs.type = "Required for this level";

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        subject: formData.subject,
        class_category: formData.class_category,
        level: formData.level,
        total_marks: formData.total_marks,
        duration: formData.duration,
        type: undefined,
      };
      const selectedLvl = levels.find((l) => l.id === Number(formData.level));
      if (selectedLvl && selectedLvl.level_code >= 2.0)
        payload.type = formData.type;

      if (selectedExam) {
        await updateExam(selectedExam.id, payload);
        showNotification("Exam updated successfully");
      } else {
        await createExam(payload);
        showNotification("Exam created successfully");
      }
      await loadAll(page, itemsPerPage);
      setIsAddModalOpen(false);
    } catch (err) {
      showNotification(
        err?.response?.data?.message || err.message || "Save failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examToDelete) => {
    if (!window.confirm("Delete this exam? This cannot be undone.")) return;
    setLoading(true);
    try {
      await deleteExam(examToDelete.id);
      showNotification("Exam deleted");
      await loadAll(page, itemsPerPage);
    } catch (err) {
      showNotification(
        err?.response?.data?.message || err.message || "Delete failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (exam, status) => {
    setLoading(true);
    try {
      await updateExam(exam.id, { status });
      showNotification(
        status ? "Exam approved" : "Exam rejected",
        status ? "success" : "warning"
      );
      await loadAll(page, itemsPerPage);
    } catch (err) {
      showNotification(
        err?.response?.data?.message || err.message || "Status update failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setFilterClassCategoryId("");
    setFilterSubjectId("");
    setFilterLevelId("");
    setFilterType("");
    setFilterStatus("");
    setFilterAddedBy("");
    setSearchQuery("");
  };

  if (loading && exams.length === 0) return <Loader />;

  return (
    <Layout>
      <div className="p-2 md:p-4 bg-gray-50 min-h-screen">
        {notification && (
          <ErrorMessage
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Header */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Manage Exams</h1>
            <p className="text-xs text-gray-500">
              Create, edit and manage your exam sets
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm text-sm"
          >
            <FiPlus size={18} />
            Add New Exam
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 p-3">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between mb-3">
            <div className="relative w-full lg:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search exam name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  showFilters
                    ? "bg-teal-50 border-teal-200 text-teal-700"
                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FiFilter size={14} />
                Filters
              </button>
              {showFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-500 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-gray-100">
              <select
                value={filterClassCategoryId}
                onChange={(e) => setFilterClassCategoryId(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-teal-500"
              >
                <option value="">All Classes</option>
                {classCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={filterSubjectId}
                onChange={(e) => setFilterSubjectId(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-teal-500"
              >
                <option value="">All Subjects</option>
                {subjects
                  .filter(
                    (s) =>
                      !filterClassCategoryId ||
                      s.class_category === Number(filterClassCategoryId)
                  )
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subject_name}
                    </option>
                  ))}
              </select>

              <select
                value={filterLevelId}
                onChange={(e) => setFilterLevelId(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-teal-500"
              >
                <option value="">All Levels</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-teal-500"
              >
                <option value="">All Types</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-teal-500"
              >
                <option value="">All Status</option>
                <option value="true">Approved</option>
                <option value="false">Pending</option>
              </select>

              <select
                value={filterAddedBy}
                onChange={(e) => setFilterAddedBy(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-teal-500"
              >
                <option value="">All Creators</option>
                {uniqueUsers.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredExams.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <FiRefreshCw className="mx-auto h-8 w-8 text-gray-300 mb-2 animate-spin-slow" />
              <p className="text-sm">No exams found. Try adjusting filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="px-3 py-2 w-16">ID</th>
                    <th className="px-3 py-2">Exam Name</th>
                    <th className="px-3 py-2">Subject / Class</th>
                    <th className="px-3 py-2">Level / Type</th>
                    <th className="px-3 py-2 w-24">Status</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredExams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800">
                          #{exam.id}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-900 text-sm">
                          {exam.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          By: {getAssignedUserName(exam)}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <FiLayerIcon className="text-teal-500" size={10} />{" "}
                            {exam.subject || "-"}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-sm">
                              {exam.class_category || "-"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          <div className="text-xs font-medium text-gray-700">
                            {exam.level || "-"}
                          </div>
                          {exam.type && (
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold w-fit ${
                                exam.type === "online"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {exam.type}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            exam.status
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {exam.status ? (
                            <FiCheck size={10} />
                          ) : (
                            <FiAlertCircle size={10} />
                          )}
                          {exam.status ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleStatusChange(exam, true)}
                            disabled={exam.status}
                            className={`p-1 rounded transition-colors ${
                              exam.status
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title="Approve"
                          >
                            <FiCheck size={14} />
                          </button>
                          <button
                            onClick={() => handleStatusChange(exam, false)}
                            disabled={!exam.status}
                            className={`p-1 rounded transition-colors ${
                              !exam.status
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-yellow-600 hover:bg-yellow-50"
                            }`}
                            title="Reject"
                          >
                            <FiX size={14} />
                          </button>
                          <Link
                            to={`/admin/exam/${exam.id}`}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Questions"
                          >
                            <FiEye size={14} />
                          </Link>
                          <button
                            onClick={() => handleEdit(exam)}
                            className="p-1 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(exam)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between text-xs bg-gray-50">
              <span className="text-gray-500">
                Showing {(page - 1) * itemsPerPage + 1} to{" "}
                {Math.min(page * itemsPerPage, totalCount)} of {totalCount}{" "}
                entries
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  Prev
                </button>
                <span className="font-medium text-gray-700">Page {page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)} // Simple next logic, assumes totalCount logic handled elsewhere or API returns empty
                  disabled={exams.length < itemsPerPage}
                  className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <h2 className="text-lg font-bold text-gray-800">
                  {selectedExam ? "Edit Exam" : "Create New Exam"}
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Exam Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      formErrors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.name && (
                    <span className="text-xs text-red-500">
                      {formErrors.name}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Class Category *
                  </label>
                  <select
                    value={formData.class_category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        class_category: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      formErrors.class_category
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Class</option>
                    {classCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.class_category && (
                    <span className="text-xs text-red-500">
                      {formErrors.class_category}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      formErrors.subject ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Subject</option>
                    {subjects
                      .filter(
                        (s) =>
                          !formData.class_category ||
                          s.class_category === Number(formData.class_category)
                      )
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.subject_name}
                        </option>
                      ))}
                  </select>
                  {formErrors.subject && (
                    <span className="text-xs text-red-500">
                      {formErrors.subject}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Level *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      formErrors.level ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Level</option>
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.level && (
                    <span className="text-xs text-red-500">
                      {formErrors.level}
                    </span>
                  )}
                </div>

                {Number(formData.level) &&
                  levels.find((l) => l.id === Number(formData.level))
                    ?.level_code >= 2.0 && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Exam Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          formErrors.type ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Type</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                      </select>
                      {formErrors.type && (
                        <span className="text-xs text-red-500">
                          {formErrors.type}
                        </span>
                      )}
                    </div>
                  )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) =>
                      setFormData({ ...formData, total_marks: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      formErrors.total_marks
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.total_marks && (
                    <span className="text-xs text-red-500">
                      {formErrors.total_marks}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Duration (min) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      formErrors.duration ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.duration && (
                    <span className="text-xs text-red-500">
                      {formErrors.duration}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors font-medium shadow-sm"
                >
                  {loading ? "Saving..." : "Save Exam"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

const FiLayerIcon = ({ className, size }) => (
  <svg
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    height={size}
    width={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

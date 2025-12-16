import React, { useState, useEffect } from "react";
import {
  FiRefreshCw,
  FiDownload,
  FiSearch,
  FiX,
  FiCheck,
  FiMoreVertical,
  FiBriefcase,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Layout from "../Admin/Layout";
import {
  getHireRequest,
  updateHireRequest,
} from "../../services/adminHiringRequest";

const ManageHiringRequests = () => {
  const [filters, setFilters] = useState({
    status: "all",
    recruiterName: "",
    teacherName: "",
  });

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getHireRequest();
        if (Array.isArray(response)) {
          // Sort by date descending (newest first)
          const sortedResponse = [...response].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );

          const formatData = sortedResponse.map((item) => ({
            id: item.id,
            recruiterName: item.recruiter_id, // Store full object for proper handling
            teacherName: item.teacher_id, // Store full object for proper handling
            recruiter: formatName(item.recruiter_id),
            teacher: formatName(item.teacher_id),
            role: item.teacher_job_type?.[0]?.teacher_job_name || "N/A",
            subjects:
              item.subject?.map((s) => ({ ...s, subject_name: s.name })) || [],
            status: item.status,
            requestDate: item.date,
          }));
          setData(formatData);
          setFilteredData(formatData);
        }
      } catch (error) {
        console.error("Error fetching hiring requests:", error);
        showNotification("Failed to load hiring requests", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((row) => {
      const recruiterMatch =
        !filters.recruiterName ||
        formatName(row.recruiterName)
          .toLowerCase()
          .includes(filters.recruiterName.toLowerCase());
      const teacherMatch =
        !filters.teacherName ||
        formatName(row.teacherName)
          .toLowerCase()
          .includes(filters.teacherName.toLowerCase());
      const statusMatch =
        filters.status === "all" ||
        row.status.toLowerCase() === filters.status.toLowerCase();

      return recruiterMatch && teacherMatch && statusMatch;
    });
    setFilteredData(filtered);
    setPaginationModel((prev) => ({ ...prev, page: 0 })); // Reset to first page on filter
  }, [filters, data]);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "success" }),
      3000
    );
  };

  const formatName = (user) => {
    if (!user) return "N/A";
    if (typeof user === "object") {
      const fname = user.Fname ?? user.first_name ?? user.fname;
      const lname = user.Lname ?? user.last_name ?? user.lname;
      const joined = [fname, lname].filter(Boolean).join(" ").trim();
      if (joined) return joined;
      if (user.name) return user.name;
      if (user.username) return user.username;
      if (user.id != null) return `ID: ${user.id}`;
      return "N/A";
    }
    return String(user);
  };

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    const options = { month: "short", day: "2-digit", year: "numeric" };
    return d.toLocaleDateString("en-US", options);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    setSubmitting(true);
    try {
      const recruiterId = selectedRequest.recruiterName?.id;
      const teacherId = selectedRequest.teacherName?.id;

      await updateHireRequest(selectedRequest.id, {
        recruiter_id: recruiterId,
        teacher_id: teacherId,
        status: "fulfilled",
      });
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedRequest.id
            ? { ...item, status: "fulfilled" }
            : item
        )
      );
      showNotification("Request approved successfully!");
      handleCloseModal();
    } catch (error) {
      console.error("Error approving request:", error);
      showNotification("Failed to approve request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    setSubmitting(true);
    try {
      const recruiterId = selectedRequest.recruiterName?.id;
      const teacherId = selectedRequest.teacherName?.id;

      await updateHireRequest(selectedRequest.id, {
        recruiter_id: recruiterId,
        teacher_id: teacherId,
        status: "rejected",
        reject_reason: "Rejected by admin",
      });
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedRequest.id
            ? { ...item, status: "rejected" }
            : item
        )
      );
      showNotification("Request rejected successfully", "warning");
      handleCloseModal();
    } catch (error) {
      console.error("Error rejecting request:", error);
      showNotification("Failed to reject request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: "all",
      recruiterName: "",
      teacherName: "",
    });
  };

  const handleExportData = () => {
    const csvData = filteredData.map((row) => ({
      Recruiter: formatName(row.recruiterName),
      Teacher: formatName(row.teacherName),
      Role: row.role || "N/A",
      Subjects:
        row.subjects?.map((subject) => subject.subject_name).join(", ") ||
        "N/A",
      Status: row.status,
      Date: formatDate(row.requestDate),
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Recruiter,Teacher,Role,Subjects,Status,Date"]
        .concat(csvData.map((row) => Object.values(row).join(",")))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hiring_requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Data exported successfully!");
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "fulfilled")
      return "bg-green-100 text-green-700 border-green-200";
    if (s === "rejected") return "bg-red-100 text-red-700 border-red-200";
    return "bg-orange-100 text-orange-700 border-orange-200";
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / paginationModel.pageSize);
  const displayedData = filteredData.slice(
    paginationModel.page * paginationModel.pageSize,
    (paginationModel.page + 1) * paginationModel.pageSize
  );

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-slate-50 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Manage Hiring Requests
            </h1>
            <p className="text-slate-500 mt-1">
              Review, approve, or reject teacher hiring requests
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
              title="Refresh Data"
            >
              <FiRefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
            >
              <FiDownload className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold border-b border-slate-100 pb-2">
            <FiFilter className="w-4 h-4" /> Filters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-700"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Recruiter Name
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Recruiter..."
                  value={filters.recruiterName}
                  onChange={(e) =>
                    handleFilterChange("recruiterName", e.target.value)
                  }
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Teacher Name
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Teacher..."
                  value={filters.teacherName}
                  onChange={(e) =>
                    handleFilterChange("teacherName", e.target.value)
                  }
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <FiX className="w-4 h-4" /> Clear
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : displayedData.length === 0 ? (
            <div className="text-center py-20 bg-slate-50">
              <FiBriefcase className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">
                No requests found
              </h3>
              <p className="text-slate-500 mt-1">
                Try adjusting your filters or search criteria
              </p>
            </div>
          ) : (
            <>
              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                      <th className="px-6 py-4">Recruiter</th>
                      <th className="px-6 py-4">Teacher</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Subjects</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedData.map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                            <span className="font-semibold text-slate-800">
                              {request.recruiter}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800">
                            {request.teacher}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {request.role || "—"}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {request.subjects?.[0]?.subject_name || "—"}
                          {request.subjects?.length > 1 && (
                            <span className="text-xs text-slate-400 ml-1">
                              +{request.subjects.length - 1}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              request.status
                            )} capitalize`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                          {formatDate(request.requestDate)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenModal(request)}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiMoreVertical className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
                <span className="text-sm text-slate-500">
                  Showing {paginationModel.page * paginationModel.pageSize + 1}{" "}
                  to{" "}
                  {Math.min(
                    (paginationModel.page + 1) * paginationModel.pageSize,
                    filteredData.length
                  )}{" "}
                  of {filteredData.length} results
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setPaginationModel((prev) => ({
                        ...prev,
                        page: Math.max(0, prev.page - 1),
                      }))
                    }
                    disabled={paginationModel.page === 0}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setPaginationModel((prev) => ({
                        ...prev,
                        page: Math.min(totalPages - 1, prev.page + 1),
                      }))
                    }
                    disabled={paginationModel.page >= totalPages - 1}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Custom Modal */}
        {modalOpen && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiBriefcase className="w-5 h-5" />
                  <h2 className="text-xl font-bold">Request Details</h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl">
                  <span className="text-xs text-teal-600 uppercase tracking-wider font-semibold">
                    Recruiter
                  </span>
                  <h3 className="text-lg font-bold text-slate-800">
                    {formatName(selectedRequest.recruiterName)}
                  </h3>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    Teacher
                  </span>
                  <h3 className="text-lg font-bold text-slate-800">
                    {formatName(selectedRequest.teacherName)}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block mb-1">
                      ROLE
                    </span>
                    <p className="text-slate-800 font-medium">
                      {selectedRequest.role || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block mb-1">
                      STATUS
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold border capitalize ${getStatusColor(
                        selectedRequest.status
                      )}`}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-semibold block mb-2">
                    SUBJECTS
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.subjects?.length > 0 ? (
                      selectedRequest.subjects.map((sub, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded border border-teal-100"
                        >
                          {sub.subject_name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic">
                        No subjects listed
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400 font-semibold block">
                    REQUEST DATE
                  </span>
                  <p className="text-slate-800 font-medium">
                    {formatDate(selectedRequest.requestDate)}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-600 font-semibold rounded-xl hover:bg-white transition-colors"
                >
                  Close
                </button>
                <div className="flex-[2] flex gap-2">
                  <button
                    onClick={handleRejectRequest}
                    disabled={
                      submitting || selectedRequest.status === "rejected"
                    }
                    className="flex-1 px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 border border-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleApproveRequest}
                    disabled={
                      submitting || selectedRequest.status === "fulfilled"
                    }
                    className="flex-1 px-4 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiCheck className="w-5 h-5" /> Approve
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification.show && (
          <div
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up z-50 ${
              notification.type === "success"
                ? "bg-teal-600 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.type === "success" ? (
              <FiCheck className="w-5 h-5" />
            ) : (
              <FiX className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageHiringRequests;

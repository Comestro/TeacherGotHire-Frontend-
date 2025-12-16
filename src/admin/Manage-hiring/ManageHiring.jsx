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
  FiUser,
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
    pageSize: 15,
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
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / paginationModel.pageSize);
  const displayedData = filteredData.slice(
    paginationModel.page * paginationModel.pageSize,
    (paginationModel.page + 1) * paginationModel.pageSize
  );

  return (
    <Layout>
      <div className="p-2 md:p-4 min-h-screen bg-gray-50 font-sans">
        {/* Header - Compact */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FiBriefcase className="text-teal-600" /> Hiring Requests
            </h1>
            <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-600 font-medium">
              {filteredData.length}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="p-1.5 text-teal-600 bg-teal-50 rounded hover:bg-teal-100 transition-colors border border-teal-100"
              title="Refresh"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded hover:bg-gray-50 transition-colors"
            >
              <FiDownload className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filters - Ultra Compact */}
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-[140px] flex-1">
              <div className="relative">
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Recruiter..."
                  value={filters.recruiterName}
                  onChange={(e) =>
                    handleFilterChange("recruiterName", e.target.value)
                  }
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="min-w-[140px] flex-1">
              <div className="relative">
                <FiUser className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Teacher..."
                  value={filters.teacherName}
                  onChange={(e) =>
                    handleFilterChange("teacherName", e.target.value)
                  }
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="min-w-[120px]">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 border border-dashed border-gray-300 text-gray-500 text-xs font-medium rounded hover:bg-gray-50 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Data Table - Compact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : displayedData.length === 0 ? (
            <div className="text-center py-12 bg-gray-50">
              <FiBriefcase className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-500">
                No requests found
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase text-gray-500 font-bold tracking-wider">
                      <th className="px-3 py-2">Recruiter</th>
                      <th className="px-3 py-2">Teacher</th>
                      <th className="px-3 py-2">Role</th>
                      <th className="px-3 py-2">Subjects</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {displayedData.map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        <td className="px-3 py-2 font-medium text-gray-800">
                          {request.recruiter}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {request.teacher}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {request.role || "—"}
                        </td>
                        <td
                          className="px-3 py-2 text-gray-600 max-w-[200px] truncate"
                          title={request.subjects
                            ?.map((s) => s.subject_name)
                            .join(", ")}
                        >
                          {request.subjects?.[0]?.subject_name || "—"}
                          {request.subjects?.length > 1 && (
                            <span className="text-[10px] text-gray-400 ml-1">
                              +{request.subjects.length - 1}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border capitalize ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                          {formatDate(request.requestDate)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => handleOpenModal(request)}
                            className="p-1 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                          >
                            <FiMoreVertical />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Compact */}
              <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between bg-gray-50">
                <span className="text-xs text-gray-500">
                  {paginationModel.page * paginationModel.pageSize + 1}-
                  {Math.min(
                    (paginationModel.page + 1) * paginationModel.pageSize,
                    filteredData.length
                  )}{" "}
                  of {filteredData.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      setPaginationModel((prev) => ({
                        ...prev,
                        page: Math.max(0, prev.page - 1),
                      }))
                    }
                    disabled={paginationModel.page === 0}
                    className="p-1 w-6 h-6 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-600"
                  >
                    <FiChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() =>
                      setPaginationModel((prev) => ({
                        ...prev,
                        page: Math.min(totalPages - 1, prev.page + 1),
                      }))
                    }
                    disabled={paginationModel.page >= totalPages - 1}
                    className="p-1 w-6 h-6 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-600"
                  >
                    <FiChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal - Adjusted for compact style */}
        {modalOpen && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <FiBriefcase /> Request Details
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              </div>

              <div className="p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                      Recruiter
                    </p>
                    <p className="font-semibold text-gray-800 truncate">
                      {formatName(selectedRequest.recruiterName)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                      Teacher
                    </p>
                    <p className="font-semibold text-gray-800 truncate">
                      {formatName(selectedRequest.teacherName)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">
                      Role
                    </span>{" "}
                    <span className="font-medium">
                      {selectedRequest.role || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">
                      Status
                    </span>{" "}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border capitalize ${getStatusColor(
                        selectedRequest.status
                      )}`}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">
                      Date
                    </span>{" "}
                    <span className="font-medium">
                      {formatDate(selectedRequest.requestDate)}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                    Subjects
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedRequest.subjects?.length > 0 ? (
                      selectedRequest.subjects.map((sub, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-semibold rounded border border-teal-100"
                        >
                          {sub.subject_name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 italic text-xs">
                        No subjects
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end">
                <button
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-semibold rounded hover:bg-white"
                >
                  Close
                </button>
                <button
                  onClick={handleRejectRequest}
                  disabled={submitting || selectedRequest.status === "rejected"}
                  className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded hover:bg-red-100 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={handleApproveRequest}
                  disabled={
                    submitting || selectedRequest.status === "fulfilled"
                  }
                  className="px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {submitting ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiCheck /> Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification.show && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg flex items-center gap-2 animate-slide-up z-50 text-sm ${
              notification.type === "success"
                ? "bg-teal-600 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.type === "success" ? <FiCheck /> : <FiX />}
            <span>{notification.message}</span>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageHiringRequests;

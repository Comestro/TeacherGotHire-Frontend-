import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiX,
  FiRefreshCw,
  FiTrash2,
  FiAlertTriangle,
  FiInfo,
  FiCalendar,
  FiCheckCircle,
  FiDatabase,
  FiUser,
  FiActivity,
  FiClock,
  FiTerminal,
  FiCopy,
  FiFilter,
  FiEye,
} from "react-icons/fi";
import Layout from "../Admin/Layout";
import { axiosInstance } from "../../services/apiService";

const ManageSystemErrors = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openClearModal, setOpenClearModal] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("api/admin/systemerrorlog/");
      const data = response.data;
      const processedData = Array.isArray(data) ? data : (data.results || []);
      setLogs(processedData);
      setFilteredLogs(processedData);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to load system error logs.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...logs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          (log.exception_type && log.exception_type.toLowerCase().includes(term)) ||
          (log.exception_message && log.exception_message.toLowerCase().includes(term)) ||
          (log.request_path && log.request_path.toLowerCase().includes(term))
      );
    }

    if (selectedSource !== "all") {
      result = result.filter((log) => log.source === selectedSource);
    }

    if (selectedMethod !== "all") {
      result = result.filter((log) => log.request_method === selectedMethod);
    }

    if (dateRange.start) {
      result = result.filter(
        (log) => new Date(log.created_at) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter((log) => new Date(log.created_at) <= endDate);
    }

    setFilteredLogs(result);
    setCurrentPage(1);
  }, [searchTerm, selectedSource, selectedMethod, dateRange, logs]);

  const showNotification = (message, type = "success") => {
    setNotification({ open: true, message, type });
    setTimeout(() => {
      setNotification({ open: false, message: "", type: "success" });
    }, 3000);
  };

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDelete = async () => {
    if (!logToDelete) return;
    setSubmitting(true);
    try {
      await axiosInstance.delete(`api/admin/systemerrorlog/${logToDelete}/`);
      showNotification("Error log deleted successfully.");
      setLogs(logs.filter((log) => log.id !== logToDelete));
      setOpenDeleteModal(false);
      setLogToDelete(null);
      if (selectedLog && selectedLog.id === logToDelete) {
        setSelectedLog(null);
      }
    } catch (error) {
      showNotification("Failed to delete log.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearAll = async () => {
    setSubmitting(true);
    try {
      // Create a promise array to delete all filtered logs
      // In a real app, you might have a bulk delete endpoint
      const deletePromises = filteredLogs.map(log => 
        axiosInstance.delete(`api/admin/systemerrorlog/${log.id}/`)
      );
      await Promise.all(deletePromises);
      showNotification(`Successfully cleared ${filteredLogs.length} logs.`);
      fetchLogs();
      setOpenClearModal(false);
    } catch (error) {
      showNotification("Failed to clear logs.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getSourceStyle = (source) => {
    if (source === "Frontend") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    return "bg-purple-50 text-purple-700 border-purple-200";
  };

  const getMethodStyle = (method) => {
    switch (method) {
      case "GET":
        return "bg-green-50 text-green-700 border-green-200";
      case "POST":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PUT":
      case "PATCH":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "DELETE":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Layout>
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* Notification Toast */}
        {notification.open && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg border ${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <FiCheckCircle className="w-5 h-5 mr-3" />
            ) : (
              <FiAlertTriangle className="w-5 h-5 mr-3" />
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() =>
                setNotification({ ...notification, open: false })
              }
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header Header Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FiTerminal className="text-indigo-600" />
              System Error Logs
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Monitor and analyze application errors across the system
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
            >
              <FiRefreshCw
                className={`mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={() => setOpenClearModal(true)}
              disabled={filteredLogs.length === 0}
              className="flex items-center px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiTrash2 className="mr-2" />
              Clear Filtered ({filteredLogs.length})
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Search Errors
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search exception type, message, path..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Source
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-gray-50 focus:bg-white"
              >
                <option value="all">All Sources</option>
                <option value="Backend">Backend</option>
                <option value="Frontend">Frontend</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Method
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-gray-50 focus:bg-white"
              >
                <option value="all">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Date Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs bg-gray-50 focus:bg-white"
                  title="Start Date"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - Logs Table & Details Panel */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Logs List Table */}
          <div className={`xl:col-span-${selectedLog ? '2' : '3'} bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300`}>
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading error logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                  <FiCheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  System is Healthy
                </h3>
                <p className="text-gray-500 max-w-sm">
                  No error logs found matching your current filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Error Details
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Source/Method
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Path
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={`hover:bg-indigo-50/50 cursor-pointer transition-colors ${
                          selectedLog?.id === log.id ? "bg-indigo-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <FiAlertTriangle className="text-red-500 w-5 h-5" />
                            </div>
                            <div className="max-w-xs xl:max-w-md">
                              <p className="text-sm font-bold text-gray-900 truncate" title={log.exception_type}>
                                {log.exception_type}
                              </p>
                              <p className="text-xs text-gray-500 truncate mt-1" title={log.exception_message}>
                                {log.exception_message}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex flex-col gap-2 items-start">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getSourceStyle(
                                log.source
                              )}`}
                            >
                              {log.source === "Frontend" ? <FiActivity className="mr-1" /> : <FiDatabase className="mr-1" />}
                              {log.source}
                            </span>
                            {log.request_method && (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getMethodStyle(
                                  log.request_method
                                )}`}
                              >
                                {log.request_method}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell max-w-[200px]">
                          {log.request_path ? (
                            <span className="text-xs text-gray-600 font-mono truncate block" title={log.request_path}>
                              {log.request_path}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <p className="text-sm text-gray-900">
                            {new Date(log.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="text-indigo-600 hover:text-indigo-900 p-1.5 hover:bg-indigo-50 rounded"
                              title="View Details"
                            >
                              <FiEye />
                            </button>
                            <button
                              onClick={() => {
                                setLogToDelete(log.id);
                                setOpenDeleteModal(true);
                              }}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded"
                              title="Delete Log"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && filteredLogs.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(indexOfLastItem, filteredLogs.length)}</span> of{" "}
                  <span className="font-medium">{filteredLogs.length}</span> results
                </span>
                <nav className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(number => number === 1 || number === totalPages || Math.abs(number - currentPage) <= 2)
                    .map((number, index, array) => {
                      if (index > 0 && array[index - 1] !== number - 1) {
                        return <span key={`ellipsis-${number}`} className="px-3 py-1 text-gray-500">...</span>;
                      }
                      return (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            currentPage === number
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {number}
                        </button>
                      );
                    })}
                </nav>
              </div>
            )}
          </div>

          {/* Log Details Panel */}
          {selectedLog && (
            <div className="xl:col-span-1 bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col h-[calc(100vh-220px)] xl:sticky xl:top-6">
              <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FiInfo className="text-indigo-600" />
                  Error Inspection
                </h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">
                    {selectedLog.exception_type}
                  </h4>
                  <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm font-medium border border-red-100 break-words">
                    {selectedLog.exception_message}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Source
                    </span>
                    <span className={`inline-block px-2.5 py-1 rounded-md text-sm font-medium border ${getSourceStyle(selectedLog.source)}`}>
                      {selectedLog.source}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Time
                    </span>
                    <div className="flex items-center text-sm text-gray-800 font-medium bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                      <FiClock className="mr-1.5 text-gray-400" />
                      {new Date(selectedLog.created_at).toLocaleString()}
                    </div>
                  </div>
                  {selectedLog.request_method && (
                    <div>
                      <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Method
                      </span>
                      <span className={`inline-block px-2.5 py-1 rounded-md text-sm font-medium border ${getMethodStyle(selectedLog.request_method)}`}>
                        {selectedLog.request_method}
                      </span>
                    </div>
                  )}
                  {selectedLog.user && (
                    <div className="col-span-2">
                      <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Affected User
                      </span>
                      <div className="flex items-center text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                        <FiUser className="mr-2 text-gray-400" />
                        <span className="font-medium">User ID: {selectedLog.user}</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedLog.request_path && (
                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-1">
                      <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Request Path
                      </span>
                      <button
                        onClick={() => handleCopy(selectedLog.request_path, "path")}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                      >
                        {copiedField === "path" ? <FiCheckCircle className="text-green-500" /> : <FiCopy />}
                        {copiedField === "path" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-sm text-gray-800 break-all">
                      {selectedLog.request_path}
                    </div>
                  </div>
                )}

                {selectedLog.payload && selectedLog.payload !== "{}" && selectedLog.payload !== "null" && (
                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-1">
                      <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Request Payload
                      </span>
                      <button
                        onClick={() => handleCopy(selectedLog.payload, "payload")}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                      >
                        {copiedField === "payload" ? <FiCheckCircle className="text-green-500" /> : <FiCopy />}
                        {copiedField === "payload" ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 font-mono text-xs text-green-400 overflow-x-auto">
                      <pre>{selectedLog.payload}</pre>
                    </div>
                  </div>
                )}

                <div className="mb-2">
                  <div className="flex justify-between items-end mb-1">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Stack Trace
                    </span>
                    <button
                      onClick={() => handleCopy(selectedLog.stack_trace, "trace")}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      {copiedField === "trace" ? <FiCheckCircle className="text-green-500" /> : <FiCopy />}
                      {copiedField === "trace" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-800 font-mono text-[11px] text-gray-300 overflow-x-auto leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
                    <pre>{selectedLog.stack_trace}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Single Modal */}
      {openDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-fade-in-up">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full text-red-600">
                <FiTrash2 className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Log?</h3>
            <p className="text-gray-500 text-center text-sm mb-6">
              Are you sure you want to permanently delete this error log? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOpenDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 flex justify-center items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm disabled:opacity-70"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Modal */}
      {openClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-fade-in-up">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full text-red-600 flex items-center justify-center relative">
                <FiAlertTriangle className="w-8 h-8" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  !
                </span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Clear Filtered Logs?</h3>
            <p className="text-gray-500 text-center text-sm mb-6">
              You are about to delete <span className="font-bold text-gray-800">{filteredLogs.length}</span> error logs. Are you completely sure you want to proceed?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOpenClearModal(false)}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={submitting}
                className="flex-1 flex justify-center items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm disabled:opacity-70"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Clear All"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </Layout>
  );
};

export default ManageSystemErrors;
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiEye,
  FiKey,
  FiCalendar,
  FiMoreVertical,
  FiAlertCircle,
  FiCopy,
} from "react-icons/fi";
import Layout from "../Admin/Layout";
import { getPasskey, updatePasskey } from "../../services/adminPasskeyApi";

const ErrorMessage = ({ message, type = "error", onClose }) => {
  if (!message) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 animate-slide-up px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
        type === "success"
          ? "bg-teal-600 text-white"
          : type === "warning"
          ? "bg-amber-500 text-white"
          : "bg-red-500 text-white"
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

export default function ManagePasskey() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [detailsModal, setDetailsModal] = useState({ open: false, row: null });
  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    row: null,
  });
  const [processing, setProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10 });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "success" }),
      4000
    );
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await getPasskey();
      const rows = (Array.isArray(resp) ? resp : []).map((r) => ({
        ...r,
        id: r.id,
        userEmail: r.user?.email || "N/A",
        examName: r.exam?.name || "N/A",
        centerName: r.center?.name || "N/A",
        requestDate: r.created_at || r.request_date || null,
      }));
      setData(rows);
    } catch (err) {
      showNotification("Failed to load passkeys", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.filter((r) => {
      const matchesQ =
        !q ||
        (r.userEmail || "").toLowerCase().includes(q) ||
        (r.examName || "").toLowerCase().includes(q) ||
        (r.centerName || "").toLowerCase().includes(q) ||
        (r.code || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesQ && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  const counts = useMemo(
    () => ({
      all: data.length,
      requested: data.filter((d) => d.status === "requested").length,
      fulfilled: data.filter((d) => d.status === "fulfilled").length,
      rejected: data.filter((d) => d.status === "rejected").length,
    }),
    [data]
  );

  const handleApprove = async (row) => {
    setProcessing(true);
    try {
      await updatePasskey(row.id, {
        user: row.user?.id,
        code: row.code,
        status: "fulfilled",
      });
      setData((prev) =>
        prev.map((p) => (p.id === row.id ? { ...p, status: "fulfilled" } : p))
      );
      showNotification("Passkey approved successfully", "success");
      setConfirm({ open: false, type: null, row: null });
      if (detailsModal.open && detailsModal.row?.id === row.id) {
        setDetailsModal((prev) => ({
          ...prev,
          row: { ...prev.row, status: "fulfilled" },
        }));
      }
    } catch (err) {
      showNotification("Approve failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (row) => {
    if (!rejectReason.trim()) {
      showNotification("Provide rejection reason", "warning");
      return;
    }
    setProcessing(true);
    try {
      await updatePasskey(row.id, {
        user: row.user?.id,
        code: row.code,
        status: "rejected",
        reason: rejectReason,
      });
      setData((prev) =>
        prev.map((p) =>
          p.id === row.id
            ? { ...p, status: "rejected", reject_reason: rejectReason }
            : p
        )
      );
      showNotification("Passkey rejected", "success");
      setConfirm({ open: false, type: null, row: null });
      setRejectReason("");
      if (detailsModal.open && detailsModal.row?.id === row.id) {
        setDetailsModal((prev) => ({
          ...prev,
          row: { ...prev.row, status: "rejected", reject_reason: rejectReason },
        }));
      }
    } catch (err) {
      showNotification("Reject failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  const displayedData = useMemo(() => {
    const start = pagination.page * pagination.pageSize;
    return filtered.slice(start, start + pagination.pageSize);
  }, [filtered, pagination]);

  const totalPages = Math.ceil(filtered.length / pagination.pageSize);

  const getStatusBadge = (status) => {
    switch (status) {
      case "fulfilled":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">
            Fulfilled
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
            Requested
          </span>
        );
    }
  };

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
              <FiKey className="text-teal-600" /> Manage Passkeys
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Review and manage exam access codes
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 border border-teal-200 text-sm font-medium transition-all"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email, exam, center..."
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="requested">Pending</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="md:col-span-4 flex justify-end gap-2">
              <div className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 border border-gray-200">
                Total: {counts.all}
              </div>
              <div className="px-3 py-1 bg-amber-50 rounded-lg text-xs font-medium text-amber-600 border border-amber-100">
                Pending: {counts.requested}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Loading passkeys...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiSearch className="text-gray-400 text-xl" />
              </div>
              <h3 className="text-gray-900 font-medium">No passkeys found</h3>
              <p className="text-gray-500 text-sm mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                    <th className="px-4 py-3">User Email</th>
                    <th className="px-4 py-3">Exam</th>
                    <th className="px-4 py-3">Passkey</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {displayedData.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {row.userEmail}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex flex-col">
                          <span>{row.examName}</span>
                          <span className="text-xs text-gray-400">
                            {row.centerName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {row.status === "fulfilled" ? (
                          <span className="font-mono font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                            {row.code}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-xs">
                            Hidden
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {row.requestDate
                          ? new Date(row.requestDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setDetailsModal({ open: true, row })}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:shadow-sm ring-1 ring-inset ring-indigo-100 transition-all"
                            title="View Details"
                          >
                            <FiEye size={16} />
                          </button>
                          {row.status === "requested" && (
                            <>
                              <button
                                onClick={() =>
                                  setConfirm({
                                    open: true,
                                    type: "approve",
                                    row,
                                  })
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:shadow-sm ring-1 ring-inset ring-green-100 transition-all"
                                title="Approve"
                              >
                                <FiCheck size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  setConfirm({
                                    open: true,
                                    type: "reject",
                                    row,
                                  })
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-sm ring-1 ring-inset ring-red-100 transition-all"
                                title="Reject"
                              >
                                <FiX size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Page {pagination.page + 1} of {totalPages || 1}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPagination({ ...pagination, page: i })}
                    className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                      pagination.page === i
                        ? "bg-teal-600 text-white shadow-sm"
                        : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {detailsModal.open && detailsModal.row && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in-up">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800">Request Details</h3>
                <button
                  onClick={() => setDetailsModal({ open: false, row: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      User Email
                    </label>
                    <p className="font-medium text-gray-800 break-words">
                      {detailsModal.row.userEmail}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(detailsModal.row.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Exam
                    </label>
                    <p className="text-sm text-gray-800 font-medium">
                      {detailsModal.row.examName}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Center
                    </label>
                    <p className="text-sm text-gray-800 font-medium">
                      {detailsModal.row.centerName}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                    Passkey
                  </label>
                  {detailsModal.row.status === "fulfilled" ? (
                    <div className="flex items-center justify-between">
                      <code className="text-lg font-bold text-teal-600 font-mono">
                        {detailsModal.row.code}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            detailsModal.row.code || ""
                          );
                          showNotification("Passkey copied");
                        }}
                        className="text-gray-400 hover:text-teal-600 p-1"
                      >
                        <FiCopy />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      {detailsModal.row.status === "rejected"
                        ? "Request was rejected"
                        : "Passkey not revealed yet"}
                    </p>
                  )}
                </div>

                {detailsModal.row.status === "rejected" &&
                  detailsModal.row.reject_reason && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                      <label className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1 block">
                        Rejection Reason
                      </label>
                      <p className="text-sm text-red-700">
                        {detailsModal.row.reject_reason}
                      </p>
                    </div>
                  )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                {detailsModal.row.status === "requested" ? (
                  <>
                    <button
                      onClick={() =>
                        setConfirm({
                          open: true,
                          type: "reject",
                          row: detailsModal.row,
                        })
                      }
                      className="px-4 py-2 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() =>
                        setConfirm({
                          open: true,
                          type: "approve",
                          row: detailsModal.row,
                        })
                      }
                      className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 shadow-sm transition-colors"
                    >
                      Approve
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setDetailsModal({ open: false, row: null })}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirm Modal */}
        {confirm.open && confirm.row && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-sm shadow-xl p-6 animate-fade-in-up">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {confirm.type === "approve"
                  ? "Approve Request?"
                  : "Reject Request?"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {confirm.type === "approve"
                  ? `Are you sure you want to approve the passkey request for ${confirm.row.userEmail}?`
                  : `Please provide a reason for rejecting the request for ${confirm.row.userEmail}.`}
              </p>

              {confirm.type === "reject" && (
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-4 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                  rows="3"
                  placeholder="Enter rejection reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                ></textarea>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() =>
                    setConfirm({ open: false, type: null, row: null })
                  }
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    confirm.type === "approve"
                      ? handleApprove(confirm.row)
                      : handleReject(confirm.row)
                  }
                  disabled={processing}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 ${
                    confirm.type === "approve"
                      ? "bg-teal-600 hover:bg-teal-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {processing && (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {confirm.type === "approve" ? "Approve" : "Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

import React, { useState, useEffect } from "react";
import {
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiInbox,
} from "react-icons/fi";
import {
  getMissingSubjects,
  deleteMissingSubject,
} from "../../services/adminMissingSubjectApi";
import Layout from "../Admin/Layout";
import { AnimatePresence, motion } from "framer-motion";

const ManageMissingSubject = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const filtered = requests.filter(
        (r) =>
          r.subject_name.toLowerCase().includes(lower) ||
          (r.description && r.description.toLowerCase().includes(lower)),
      );
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(requests);
    }
  }, [searchTerm, requests]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getMissingSubjects();
      // Ensure data is array
      const results = Array.isArray(data) ? data : data.results || [];
      setRequests(results);
      setFilteredRequests(results);
    } catch (error) {
      console.error("Failed to fetch requests", error);
      showNotification("Failed to fetch requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;
    try {
      await deleteMissingSubject(selectedRequest.id);
      const newRequests = requests.filter((r) => r.id !== selectedRequest.id);
      setRequests(newRequests);
      setFilteredRequests(newRequests); // filter will update via effect, but safe to set
      showNotification("Request deleted successfully", "success");
      setDeleteModalOpen(false);
    } catch (error) {
      showNotification("Failed to delete request", "error");
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Layout>
      <div className="p-2 md:p-6 bg-gray-50/50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiInbox className="text-teal-600" />
            Missing Subject Requests
          </h1>
          <p className="text-gray-500 mt-1">
            Review and manage requests for new subjects from users.
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
            />
          </div>
          <button
            onClick={fetchRequests}
            className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-100"
            title="Refresh"
          >
            <FiRefreshCw size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <span>Loading requests...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FiInbox size={32} className="text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-500">
                No requests found
              </p>
              <p className="text-sm">
                {searchTerm
                  ? "Try adjusting your search"
                  : "New requests will appear here"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Subject Name</th>
                    <th className="px-6 py-4">Requested By</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Requested On</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-700">
                          {req.subject_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">
                            {req.user?.name || "Anonymous"}
                          </span>
                          {req.user?.email && (
                            <span className="text-xs text-gray-500">
                              {req.user.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-sm text-gray-600 max-w-xs block truncate"
                          title={req.description}
                        >
                          {req.description || (
                            <span className="text-gray-400 italic">
                              No description
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(req.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete Request"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Modal */}
        <AnimatePresence>
          {deleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden"
              >
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    <FiAlertCircle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Delete Request?
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Are you sure you want to delete the request for{" "}
                    <span className="font-bold text-gray-800">
                      "{selectedRequest?.subject_name}"
                    </span>
                    ? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteModalOpen(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-2 z-50 ${
                notification.type === "error" ? "bg-red-600" : "bg-teal-600"
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default ManageMissingSubject;

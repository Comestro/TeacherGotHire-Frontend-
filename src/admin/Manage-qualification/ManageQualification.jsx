import React, { useState, useEffect, useRef } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiRefreshCw,
  FiAward,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import Layout from "../Admin/Layout";
import {
  getQualification,
  createQualification,
  updateQualification,
  deleteQualification,
} from "../../services/adminManageQualificationApi";

const ManageQualification = () => {
  const [qualifications, setQualifications] = useState([]);
  const [filteredQualifications, setFilteredQualifications] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentQualification, setCurrentQualification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [newQualificationName, setNewQualificationName] = useState("");

  const inputRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sort defaults
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  useEffect(() => {
    fetchQualifications();
  }, []);

  useEffect(() => {
    if (openAddEditModal && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [openAddEditModal]);

  const fetchQualifications = async () => {
    setLoading(true);
    try {
      const data = await getQualification();
      const processedData = Array.isArray(data) ? data : [];
      setQualifications(processedData);
      setFilteredQualifications(processedData);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to load qualifications.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    let displayMessage = message;
    if (typeof message === "object" && message !== null) {
      displayMessage = Object.values(message).flat().join(", ");
    } else if (Array.isArray(message)) {
      displayMessage = message.join(", ");
    }

    setNotification({
      open: true,
      message: displayMessage,
      type,
    });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, open: false }));
    }, 4000);
  };

  const handleOpenAddEditModal = (qualification = null) => {
    setCurrentQualification(qualification);
    setNewQualificationName(qualification ? qualification.name : "");
    setFormErrors({});
    setOpenAddEditModal(true);
  };

  const handleCloseAddEditModal = () => {
    setOpenAddEditModal(false);
    setCurrentQualification(null);
    setNewQualificationName("");
    setFormErrors({});
  };

  const handleOpenDeleteModal = (qualification) => {
    setCurrentQualification(qualification);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setCurrentQualification(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!newQualificationName || newQualificationName.trim() === "") {
      errors.name = "Qualification name is required";
    } else if (newQualificationName.trim().length < 2) {
      errors.name = "Qualification name must be at least 2 characters";
    } else if (newQualificationName.trim().length > 100) {
      errors.name = "Qualification name cannot exceed 100 characters";
    } else {
      const duplicate = qualifications.find(
        (q) =>
          q.name.toLowerCase() === newQualificationName.trim().toLowerCase() &&
          q.id !== currentQualification?.id
      );
      if (duplicate) {
        errors.name = "Qualification with this name already exists";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveQualification = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = { name: newQualificationName.trim() };

      if (currentQualification) {
        await updateQualification(currentQualification.id, payload);
        const updatedList = qualifications.map((q) =>
          q.id === currentQualification.id ? { ...q, ...payload } : q
        );
        setQualifications(updatedList);
        setFilteredQualifications(updatedList);
        showNotification(
          `Qualification "${payload.name}" updated successfully`
        );
      } else {
        const newQual = await createQualification(payload);
        const newList = [...qualifications, newQual];
        setQualifications(newList);
        setFilteredQualifications(newList);
        showNotification(`Qualification "${newQual.name}" added successfully`);
      }
      handleCloseAddEditModal();
    } catch (error) {
      if (error.response?.data) {
        const responseData = error.response.data;
        if (responseData.message) {
          showNotification(responseData.message, "error");
        } else if (responseData.non_field_errors) {
          showNotification(responseData.non_field_errors[0], "error");
        } else if (responseData.name) {
          setFormErrors({ name: responseData.name[0] });
          showNotification(responseData.name[0], "error");
        } else {
          showNotification(
            `Failed to ${
              currentQualification ? "update" : "add"
            } qualification.`,
            "error"
          );
        }
      } else {
        showNotification(
          `Failed to ${currentQualification ? "update" : "add"} qualification.`,
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQualification = async () => {
    if (!currentQualification) return;

    setSubmitting(true);
    try {
      await deleteQualification(currentQualification.id);
      const newList = qualifications.filter(
        (q) => q.id !== currentQualification.id
      );
      setQualifications(newList);
      setFilteredQualifications(newList);
      setSelectedQualifications(
        selectedQualifications.filter((id) => id !== currentQualification.id)
      );

      showNotification(
        `Qualification "${currentQualification.name}" deleted successfully`
      );
      handleCloseDeleteModal();
    } catch (error) {
      if (error.response?.data?.message) {
        showNotification(error.response.data.message, "error");
      } else {
        showNotification("Failed to delete qualification.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQualifications.length === 0) return;
    setSubmitting(true);
    try {
      await Promise.all(
        selectedQualifications.map((id) => deleteQualification(id))
      );
      const newList = qualifications.filter(
        (q) => !selectedQualifications.includes(q.id)
      );
      setQualifications(newList);
      setFilteredQualifications(newList);
      setSelectedQualifications([]);
      showNotification(
        `${selectedQualifications.length} qualifications deleted successfully`
      );
    } catch (error) {
      showNotification("Failed to delete some qualifications.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Search
  useEffect(() => {
    if (searchTerm) {
      const filtered = qualifications.filter((q) =>
        q.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQualifications(filtered);
    } else {
      setFilteredQualifications(qualifications);
    }
    setCurrentPage(1);
  }, [searchTerm, qualifications]);

  // Sort
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedQualifications = React.useMemo(() => {
    let items = [...filteredQualifications];
    if (sortConfig.key) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredQualifications, sortConfig]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQualificationsList = sortedQualifications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedQualifications.length / itemsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked)
      setSelectedQualifications(currentQualificationsList.map((q) => q.id));
    else setSelectedQualifications([]);
  };

  const handleSelectOne = (id) => {
    if (selectedQualifications.includes(id))
      setSelectedQualifications(selectedQualifications.filter((i) => i !== id));
    else setSelectedQualifications([...selectedQualifications, id]);
  };

  return (
    <Layout>
      <div className="p-2 md:p-4 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Manage Qualifications
            </h1>
            <p className="text-xs text-gray-500">
              Create and manage teacher qualification requirements
            </p>
          </div>
          <button
            onClick={() => handleOpenAddEditModal()}
            className="flex items-center justify-center gap-2 bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm text-sm"
          >
            <FiPlus size={18} />
            Add New Qualification
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-3 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search qualifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={fetchQualifications}
                className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <FiRefreshCw size={16} />
              </button>
              {selectedQualifications.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium"
                >
                  <FiTrash2 size={14} />
                  Delete ({selectedQualifications.length})
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
                Loading qualifications...
              </div>
            ) : sortedQualifications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FiAward className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  No qualifications found
                </h3>
                <p className="mt-1 text-sm">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by adding a new qualification"}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="px-3 py-2 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          currentQualificationsList.length > 0 &&
                          selectedQualifications.length ===
                            currentQualificationsList.length
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </th>
                    <th
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("id")}
                    >
                      ID
                    </th>
                    <th
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("qualification_name")}
                    >
                      Qualification Name
                    </th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentQualificationsList.map((qual) => (
                    <tr
                      key={qual.id}
                      className={`hover:bg-teal-50/30 transition-colors ${
                        selectedQualifications.includes(qual.id)
                          ? "bg-teal-50/50"
                          : ""
                      }`}
                    >
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedQualifications.includes(qual.id)}
                          onChange={() => handleSelectOne(qual.id)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800">
                          #{qual.id}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                          <span className="font-medium text-gray-900 text-sm">
                            {qual.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenAddEditModal(qual)}
                            className="p-1 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(qual)}
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
            )}
          </div>

          {/* Pagination */}
          {sortedQualifications.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, sortedQualifications.length)} of{" "}
                {sortedQualifications.length}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, currentPage - 2),
                    Math.min(totalPages, currentPage + 1)
                  )
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === page
                          ? "bg-teal-600 text-white border-teal-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {openAddEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">
                  {currentQualification
                    ? "Edit Qualification"
                    : "Add New Qualification"}
                </h3>
                <button
                  onClick={handleCloseAddEditModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualification Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newQualificationName}
                    onChange={(e) => {
                      setNewQualificationName(e.target.value);
                      if (formErrors.name) setFormErrors({});
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      formErrors.name
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-teal-500/20 focus:border-teal-500"
                    }`}
                    placeholder="e.g. Bachelor's Degree"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <FiAlertCircle /> {formErrors.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={handleCloseAddEditModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQualification}
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-70 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
                >
                  {submitting && (
                    <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  )}
                  {currentQualification ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {openDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertCircle className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Delete Qualification?
                </h3>
                <p className="text-gray-500 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-800">
                    "{currentQualification?.name}"
                  </span>
                  ?
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleCloseDeleteModal}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors w-full"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteQualification}
                    disabled={submitting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed font-medium transition-colors w-full flex justify-center items-center gap-2"
                  >
                    {submitting && (
                      <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {notification.open && (
          <div
            className={`fixed top-4 right-4 z-[60] max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden animate-slide-in-right border-l-4 ${
              notification.type === "error"
                ? "border-red-500"
                : "border-teal-500"
            }`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === "success" ? (
                    <FiCheckCircle className="h-6 w-6 text-teal-500" />
                  ) : (
                    <FiAlertCircle className="h-6 w-6 text-red-500" />
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.type === "success" ? "Success" : "Error"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() =>
                      setNotification((prev) => ({ ...prev, open: false }))
                    }
                  >
                    <span className="sr-only">Close</span>
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageQualification;

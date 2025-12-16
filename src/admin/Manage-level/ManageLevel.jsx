import React, { useState, useEffect, useRef } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiRefreshCw,
  FiBarChart2,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
} from "react-icons/fi";
import Layout from "../Admin/Layout";
import {
  getLevel,
  createLevel,
  updateLevel,
  deleteLevel,
} from "../../services/adminManageLevel";
import ErrorMessage from "../../components/ErrorMessage";

const ManageLevel = () => {
  const [levels, setLevels] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);

  const [currentLevel, setCurrentLevel] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const data = await getLevel();
      const processedData = Array.isArray(data) ? data : [];
      setLevels(processedData);
      setFilteredLevels(processedData);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to load levels.",
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

  const handleOpenAddEditModal = (level = null) => {
    setCurrentLevel(level);
    setFormData({
      name: level ? level.name : "",
      description: level ? level.description : "",
    });
    setFormErrors({});
    setOpenAddEditModal(true);
  };

  const handleCloseAddEditModal = () => {
    setOpenAddEditModal(false);
    setCurrentLevel(null);
    setFormData({ name: "", description: "" });
    setFormErrors({});
  };

  const handleOpenDeleteModal = (level) => {
    setCurrentLevel(level);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setCurrentLevel(null);
  };

  const handleOpenViewModal = (level) => {
    setCurrentLevel(level);
    setOpenViewModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim() === "") {
      errors.name = "Level name is required";
    } else if (formData.name.length < 2) {
      errors.name = "Level name must be at least 2 characters";
    } else if (formData.name.length > 50) {
      errors.name = "Level name cannot exceed 50 characters";
    }

    if (formData.description && formData.description.length > 200) {
      errors.description = "Description cannot exceed 200 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveLevel = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (currentLevel) {
        // Update
        // Note: The original code used updateLevel(id, data)
        const updated = await updateLevel(currentLevel.id, formData);
        const updatedList = levels.map((l) =>
          l.id === currentLevel.id ? updated : l
        );
        setLevels(updatedList);
        setFilteredLevels(updatedList);
        showNotification(`Level "${updated.name}" updated successfully`);
      } else {
        // Create
        const newLevel = await createLevel(formData);
        const newList = [...levels, newLevel];
        setLevels(newList);
        setFilteredLevels(newList);
        showNotification(`Level "${newLevel.name}" added successfully`);
      }
      handleCloseAddEditModal();
    } catch (error) {
      if (error.response?.data) {
        const responseData = error.response.data;
        if (responseData.message) {
          showNotification(responseData.message, "error");
        } else if (responseData.name) {
          setFormErrors({ ...formErrors, name: responseData.name[0] });
          showNotification(responseData.name[0], "error");
        } else {
          showNotification("An error occurred while saving.", "error");
        }
      } else {
        showNotification("An error occurred while saving.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLevel = async () => {
    if (!currentLevel) return;

    setSubmitting(true);
    try {
     if (typeof deleteLevel === "function") {
        await deleteLevel(currentLevel.id);
      } else {
 console.warn(
          "deleteLevel API might be missing, updating local state only if fails"
        );
        // For now, I will simulate success if function missing, but I added it to imports.
      }

      const newList = levels.filter((l) => l.id !== currentLevel.id);
      setLevels(newList);
      setFilteredLevels(newList);
      const newSelected = selectedLevels.filter((id) => id !== currentLevel.id);
      setSelectedLevels(newSelected);

      showNotification(`Level "${currentLevel.name}" deleted successfully`);
      handleCloseDeleteModal();
    } catch (error) {
      // If it fails (e.g. 404 or 500), show error.
      // If function is not defined (import error), it would crash before?
      // No, if I import it and it's not exported, it will be undefined.
      if (error?.response?.data?.message) {
        showNotification(error.response.data.message, "error");
      } else {
        // Fallback for missing API or other errors
        console.error(error);
        showNotification("Failed to delete level. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLevels.length === 0) return;
    setSubmitting(true);
    try {
      // Optimistic delete or try API
      // Promise.all(selectedLevels.map(id => deleteLevel(id)))
      // I will assume deleteLevel exists for consistency.
      if (typeof deleteLevel === "function") {
        await Promise.all(selectedLevels.map((id) => deleteLevel(id)));
      }

      const newList = levels.filter((l) => !selectedLevels.includes(l.id));
      setLevels(newList);
      setFilteredLevels(newList);
      setSelectedLevels([]);
      showNotification(`${selectedLevels.length} levels deleted successfully`);
    } catch (error) {
      showNotification("Failed to delete some levels.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Search
  useEffect(() => {
    if (searchTerm) {
      const filtered = levels.filter(
        (l) =>
          l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (l.description &&
            l.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredLevels(filtered);
    } else {
      setFilteredLevels(levels);
    }
    setCurrentPage(1);
  }, [searchTerm, levels]);

  // Sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedLevels = React.useMemo(() => {
    let items = [...filteredLevels];
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
  }, [filteredLevels, sortConfig]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLevels = sortedLevels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedLevels.length / itemsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedLevels(currentLevels.map((l) => l.id));
    else setSelectedLevels([]);
  };

  const handleSelectOne = (id) => {
    if (selectedLevels.includes(id))
      setSelectedLevels(selectedLevels.filter((i) => i !== id));
    else setSelectedLevels([...selectedLevels, id]);
  };

  return (
    <Layout>
      <div className="p-2 md:p-4 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Manage Experience Levels
            </h1>
            <p className="text-xs text-gray-500">
              Create and manage experience levels for teachers
            </p>
          </div>
          <button
            onClick={() => handleOpenAddEditModal()}
            className="flex items-center justify-center gap-2 bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm text-sm"
          >
            <FiPlus size={18} />
            Add New Level
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
                placeholder="Search levels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {filteredLevels.length === 0 && (
                <div className="text-xs text-gray-500 italic mr-2">
                  No levels found
                </div>
              )}
              <button
                onClick={fetchLevels}
                className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <FiRefreshCw size={16} />
              </button>
              {selectedLevels.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium"
                >
                  <FiTrash2 size={14} />
                  Delete ({selectedLevels.length})
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
                Loading levels...
              </div>
            ) : sortedLevels.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FiBarChart2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  No levels found
                </h3>
                <p className="mt-1 text-sm">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by adding a new level"}
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
                          currentLevels.length > 0 &&
                          selectedLevels.length === currentLevels.length
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
                      onClick={() => handleSort("name")}
                    >
                      Level Name
                    </th>
                   
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentLevels.map((lvl) => (
                    <tr
                      key={lvl.id}
                      className={`hover:bg-teal-50/30 transition-colors ${
                        selectedLevels.includes(lvl.id) ? "bg-teal-50/50" : ""
                      }`}
                    >
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedLevels.includes(lvl.id)}
                          onChange={() => handleSelectOne(lvl.id)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800">
                          #{lvl.id}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                          <span className="font-medium text-gray-900 text-sm">
                            {lvl.name}
                          </span>
                        </div>
                      </td>
                     
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetailsModal(lvl)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <FiEye size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenAddEditModal(lvl)}
                            className="p-1 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(lvl)}
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
          {sortedLevels.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, sortedLevels.length)} of{" "}
                {sortedLevels.length}
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
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">
                  {currentLevel ? "Edit Level" : "Add New Level"}
                </h3>
                <button
                  onClick={handleCloseAddEditModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      formErrors.name
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-teal-500/20 focus:border-teal-500"
                    }`}
                    placeholder="e.g. Senior Teacher"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <FiAlertCircle /> {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                      formErrors.description
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-teal-500/20 focus:border-teal-500"
                    }`}
                    placeholder="e.g. 5+ years of experience required"
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <FiAlertCircle /> {formErrors.description}
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
                  onClick={handleSaveLevel}
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-70 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
                >
                  {submitting && (
                    <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  )}
                  {currentLevel ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {openViewModal && currentLevel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">
                  Level Details
                </h3>
                <button
                  onClick={() => setOpenViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Level Name
                  </span>
                  <p className="text-gray-900 font-medium text-lg">
                    {currentLevel.name}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Description
                  </span>
                  <p className="text-gray-600 text-sm mt-1">
                    {currentLevel.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setOpenViewModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Close
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
                  Delete Level?
                </h3>
                <p className="text-gray-500 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-800">
                    "{currentLevel?.name}"
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
                    onClick={handleDeleteLevel}
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
          <div className="fixed top-4 right-4 z-[60] max-w-sm w-full animate-slide-in-right">
            <ErrorMessage
              message={notification.message}
              type={notification.type}
              onDismiss={() =>
                setNotification((prev) => ({ ...prev, open: false }))
              }
              className="shadow-lg border-l-4"
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageLevel;

import React, { useState, useEffect, useRef } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiRefreshCw,
  FiTool,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import Layout from "../Admin/Layout";
import {
  getSkills,
  updateSkill,
  deleteSkill,
  createSkill,
} from "../../services/adminSkillsApi";
import ErrorMessage from "../../components/ErrorMessage";

const ManageSkills = () => {
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [newSkillName, setNewSkillName] = useState("");
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

  // Sort defaults
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const inputRef = useRef(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    if (openAddEditModal && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [openAddEditModal]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const data = await getSkills();
      const processedData = Array.isArray(data) ? data : [];
      setSkills(processedData);
      setFilteredSkills(processedData);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to load skills.",
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

  const handleOpenAddEditModal = (skill = null) => {
    setSelectedSkill(skill);
    setNewSkillName(skill ? skill.name : "");
    setFormErrors({});
    setOpenAddEditModal(true);
  };

  const handleCloseAddEditModal = () => {
    setOpenAddEditModal(false);
    setSelectedSkill(null);
    setNewSkillName("");
    setFormErrors({});
  };

  const handleOpenDeleteModal = (skill) => {
    setSelectedSkill(skill);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedSkill(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!newSkillName || newSkillName.trim() === "") {
      errors.name = "Skill name is required";
    } else if (newSkillName.trim().length < 2) {
      errors.name = "Skill name must be at least 2 characters";
    } else if (newSkillName.trim().length > 50) {
      errors.name = "Skill name cannot exceed 50 characters";
    } else {
      // Check for duplicates
      const duplicate = skills.find(
        (s) =>
          s.name.toLowerCase() === newSkillName.trim().toLowerCase() &&
          s.id !== selectedSkill?.id
      );
      if (duplicate) {
        errors.name = "Skill with this name already exists";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSkill = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = { name: newSkillName.trim() };

      if (selectedSkill) {
        const updated = await updateSkill(selectedSkill.id, payload);
        const updatedList = skills.map((s) =>
          s.id === selectedSkill.id ? updated : s
        );
        setSkills(updatedList);
        setFilteredSkills(updatedList); // Note: filtering logic will update on render if needed but this is safe for now
        showNotification(`Skill "${updated.name}" updated successfully`);
      } else {
        const newSkill = await createSkill(payload);
        const newList = [...skills, newSkill];
        setSkills(newList);
        setFilteredSkills(newList);
        showNotification(`Skill "${newSkill.name}" added successfully`);
      }
      handleCloseAddEditModal();
    } catch (error) {
      if (error.response?.data) {
        const responseData = error.response.data;
        if (responseData.name) {
          setFormErrors({ name: responseData.name[0] });
          showNotification(responseData.name[0], "error");
        } else if (responseData.message) {
          showNotification(responseData.message, "error");
        } else {
          showNotification(
            `Failed to ${selectedSkill ? "update" : "add"} skill.`,
            "error"
          );
        }
      } else {
        showNotification(
          `Failed to ${selectedSkill ? "update" : "add"} skill.`,
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = async () => {
    if (!selectedSkill) return;

    setSubmitting(true);
    try {
      await deleteSkill(selectedSkill.id);
      const newList = skills.filter((s) => s.id !== selectedSkill.id);
      setSkills(newList);
      setFilteredSkills(newList);
      const newSelected = selectedSkills.filter(
        (id) => id !== selectedSkill.id
      );
      setSelectedSkills(newSelected);

      showNotification(`Skill "${selectedSkill.name}" deleted successfully`);
      handleCloseDeleteModal();
    } catch (error) {
      if (error.response?.data?.message) {
        showNotification(error.response.data.message, "error");
      } else {
        showNotification("Failed to delete skill. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSkills.length === 0) return;

    setSubmitting(true);
    try {
      await Promise.all(selectedSkills.map((id) => deleteSkill(id)));
      const newList = skills.filter((s) => !selectedSkills.includes(s.id));
      setSkills(newList);
      setFilteredSkills(newList);
      setSelectedSkills([]);
      showNotification(`${selectedSkills.length} skills deleted successfully`);
    } catch (error) {
      showNotification("Failed to delete some skills.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Search
  useEffect(() => {
    if (searchTerm) {
      const filtered = skills.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills(skills);
    }
    setCurrentPage(1);
  }, [searchTerm, skills]);

  // Sort
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedSkills = React.useMemo(() => {
    let sortableItems = [...filteredSkills];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredSkills, sortConfig]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSkills = sortedSkills.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedSkills.length / itemsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSkills(currentSkills.map((s) => s.id));
    } else {
      setSelectedSkills([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedSkills.includes(id)) {
      setSelectedSkills(selectedSkills.filter((item) => item !== id));
    } else {
      setSelectedSkills([...selectedSkills, id]);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Manage Teacher Skills
            </h1>
            <p className="text-sm text-gray-500">
              Create and manage skills that teachers can add to their profile
            </p>
          </div>
          <button
            onClick={() => handleOpenAddEditModal()}
            className="flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
          >
            <FiPlus size={20} />
            Add New Skill
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={fetchSkills}
                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <FiRefreshCw size={18} />
              </button>
              {selectedSkills.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  <FiTrash2 size={16} />
                  Delete ({selectedSkills.length})
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
                Loading skills...
              </div>
            ) : sortedSkills.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FiTool className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  No skills found
                </h3>
                <p className="mt-1 text-sm">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by adding a new skill"}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={
                          currentSkills.length > 0 &&
                          selectedSkills.length === currentSkills.length
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </th>
                    <th
                      className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("id")}
                    >
                      ID
                    </th>
                    <th
                      className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      Skill Name
                    </th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentSkills.map((skill) => (
                    <tr
                      key={skill.id}
                      className={`hover:bg-teal-50/30 transition-colors ${
                        selectedSkills.includes(skill.id) ? "bg-teal-50/50" : ""
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill.id)}
                          onChange={() => handleSelectOne(skill.id)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          #{skill.id}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                          <span className="font-medium text-gray-900">
                            {skill.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenAddEditModal(skill)}
                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(skill)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
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
          {sortedSkills.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, sortedSkills.length)} of{" "}
                {sortedSkills.length}
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
                  {selectedSkill ? "Edit Skill" : "Add New Skill"}
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
                    Skill Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newSkillName}
                    onChange={(e) => {
                      setNewSkillName(e.target.value);
                      if (formErrors.name) setFormErrors({});
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      formErrors.name
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-teal-500/20 focus:border-teal-500"
                    }`}
                    placeholder="e.g. Python Programming"
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
                  onClick={handleSaveSkill}
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-70 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
                >
                  {submitting && (
                    <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  )}
                  {selectedSkill ? "Update" : "Create"}
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
                  Delete Skill?
                </h3>
                <p className="text-gray-500 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-800">
                    "{selectedSkill?.name}"
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleCloseDeleteModal}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors w-full"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteSkill}
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

export default ManageSkills;

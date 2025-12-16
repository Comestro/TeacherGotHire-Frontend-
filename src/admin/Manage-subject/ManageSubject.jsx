import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiRefreshCw,
  FiGrid,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronDown,
  FiBook,
} from "react-icons/fi";
import Layout from "../Admin/Layout";
import {
  getSubjects,
  updateSubject,
  deleteSubject,
  createSubject,
  getClasses,
} from "../../services/adminSubujectApi";
import ErrorMessage from "../../components/ErrorMessage";

const ManageSubject = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sort defaults
  const [sortConfig, setSortConfig] = useState({
    key: "subject_name",
    direction: "asc",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subjectsData, classesData] = await Promise.all([
        getSubjects(),
        getClasses(),
      ]);

      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setFilteredSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
          "Failed to load data. Please try again later.",
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

  const handleAddSubject = () => {
    setCurrentSubject({ class_category: "", subject_name: "" });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubject = (subject) => {
    setCurrentSubject({ ...subject });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleConfirmDelete = (subject) => {
    setSelectedToDelete(subject);
    setOpenDeleteDialog(true);
  };

  const handleDeleteSubject = async () => {
    if (!selectedToDelete) return;

    setSubmitting(true);
    try {
      await deleteSubject(selectedToDelete.id);
      showNotification(
        `Subject "${selectedToDelete.subject_name}" deleted successfully`
      );
      // Optimistic update
      const newSubjects = subjects.filter((s) => s.id !== selectedToDelete.id);
      setSubjects(newSubjects);
      setFilteredSubjects((prev) =>
        prev.filter((s) => s.id !== selectedToDelete.id)
      );

      setOpenDeleteDialog(false);
      setSelectedToDelete(null);
    } catch (error) {
      if (error.response?.data) {
        showNotification(error.response.data, "error");
      } else {
        showNotification(
          "Failed to delete subject. Please try again.",
          "error"
        );
      }
      setOpenDeleteDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSubjects.length === 0) return;

    setSubmitting(true);
    try {
      await Promise.all(
        selectedSubjects.map((subjectId) => deleteSubject(subjectId))
      );
      showNotification(
        `${selectedSubjects.length} subjects deleted successfully`
      );

      const newSubjects = subjects.filter(
        (s) => !selectedSubjects.includes(s.id)
      );
      setSubjects(newSubjects);
      setFilteredSubjects((prev) =>
        prev.filter((s) => !selectedSubjects.includes(s.id))
      );

      setSelectedSubjects([]);
    } catch (error) {
      showNotification("Failed to delete some subjects.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (
      !currentSubject.subject_name ||
      currentSubject.subject_name.trim() === ""
    ) {
      errors.subject_name = "Subject name is required";
    } else if (currentSubject.subject_name.length < 2) {
      errors.subject_name = "Subject name must be at least 2 characters";
    } else if (currentSubject.subject_name.length > 50) {
      errors.subject_name = "Subject name cannot exceed 50 characters";
    }

    if (!currentSubject.class_category) {
      errors.class_category = "Please select a class category";
    } else if (currentSubject.subject_name) {
      if (!currentSubject.id) {
        const subjectExists = subjects.some(
          (subject) =>
            subject.subject_name.toLowerCase() ===
              currentSubject.subject_name.toLowerCase() &&
            subject.class_category === currentSubject.class_category
        );

        if (subjectExists) {
          const classCategory =
            classes.find((c) => c.id === currentSubject.class_category)?.name ||
            "";
          errors.subject_name = `Subject '${currentSubject.subject_name}' already exists for class category '${classCategory}'.`;
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSubject = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (currentSubject.id) {
        await updateSubject(currentSubject.id, currentSubject);
        showNotification(
          `Subject "${currentSubject.subject_name}" updated successfully`
        );
        // Update local state
        const updatedList = subjects.map((s) =>
          s.id === currentSubject.id ? currentSubject : s
        );
        setSubjects(updatedList);
        setFilteredSubjects((prev) =>
          prev.map((s) => (s.id === currentSubject.id ? currentSubject : s))
        );

        setIsEditModalOpen(false);
      } else {
        const newSub = await createSubject(currentSubject);
        showNotification(
          `Subject "${currentSubject.subject_name}" added successfully`
        );
        // Add to local state
        setSubjects([...subjects, newSub]);
        setFilteredSubjects((prev) => [...prev, newSub]);

        setIsEditModalOpen(false);
      }
    } catch (error) {
      if (error.response?.data) {
        const responseData = error.response.data;
        if (
          responseData.non_field_errors &&
          Array.isArray(responseData.non_field_errors)
        ) {
          showNotification(responseData.non_field_errors[0], "error");
          return;
        } else if (responseData.subject_name) {
          setFormErrors((prev) => ({
            ...prev,
            subject_name: responseData.subject_name[0],
          }));
          showNotification(responseData.subject_name[0], "error");
          return;
        } else if (responseData.class_category) {
          setFormErrors((prev) => ({
            ...prev,
            class_category: responseData.class_category[0],
          }));
          showNotification(responseData.class_category[0], "error");
          return;
        } else if (responseData.message) {
          showNotification(responseData.message, "error");
          return;
        }
      }
      showNotification(
        `Failed to ${
          currentSubject.id ? "update" : "create"
        } subject. Please try again.`,
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSubject({
      ...currentSubject,
      [name]: value,
    });
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  // Search
  useEffect(() => {
    if (searchQuery) {
      const filtered = subjects.filter((subject) =>
        subject.subject_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects(subjects);
    }
    setCurrentPage(1);
  }, [searchQuery, subjects]);

  // Sort
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedSubjects = React.useMemo(() => {
    let sortableItems = [...filteredSubjects];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle class category sort specifically if needed
        if (sortConfig.key === "class_category") {
          const classA =
            classes.find((c) => c.id === a.class_category)?.name || "";
          const classB =
            classes.find((c) => c.id === b.class_category)?.name || "";
          aValue = classA;
          bValue = classB;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredSubjects, sortConfig, classes]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubjects = sortedSubjects.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedSubjects.length / itemsPerPage);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedSubjects(currentSubjects.map((subject) => subject.id));
    } else {
      setSelectedSubjects([]);
    }
  };

  const handleCheckboxChange = (subjectId) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const getClassName = (classId) => {
    const classObj = classes.find((cls) => cls.id === classId);
    return classObj ? classObj.name : "N/A";
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Manage Subjects
            </h1>
            <p className="text-sm text-gray-500">
              Create and manage subjects for different class categories
            </p>
          </div>
          <button
            onClick={handleAddSubject}
            className="flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
          >
            <FiPlus size={20} />
            Add New Subject
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
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={fetchData}
                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <FiRefreshCw size={18} />
              </button>
              {selectedSubjects.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  <FiTrash2 size={16} />
                  Delete ({selectedSubjects.length})
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
                Loading subjects...
              </div>
            ) : sortedSubjects.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FiBook className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  No subjects found
                </h3>
                <p className="mt-1 text-sm">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Get started by creating a new subject"}
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
                          currentSubjects.length > 0 &&
                          selectedSubjects.length === currentSubjects.length
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
                      onClick={() => handleSort("subject_name")}
                    >
                      Subject Name
                    </th>
                    <th
                      className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("class_category")}
                    >
                      Class Category
                    </th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentSubjects.map((subject) => (
                    <tr
                      key={subject.id}
                      className={`hover:bg-teal-50/30 transition-colors ${
                        selectedSubjects.includes(subject.id)
                          ? "bg-teal-50/50"
                          : ""
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject.id)}
                          onChange={() => handleCheckboxChange(subject.id)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          #{subject.id}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          {subject.subject_name}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          {getClassName(subject.class_category)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditSubject(subject)}
                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleConfirmDelete(subject)}
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
          {sortedSubjects.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, sortedSubjects.length)} of{" "}
                {sortedSubjects.length}
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
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">
                  {currentSubject?.id ? "Edit Subject" : "Add New Subject"}
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="class_category"
                      value={currentSubject?.class_category || ""}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 transition-all ${
                        formErrors.class_category
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-300 focus:ring-teal-500/20 focus:border-teal-500"
                      }`}
                    >
                      <option value="">Select a category</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {formErrors.class_category && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <FiAlertCircle /> {formErrors.class_category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject_name"
                    value={currentSubject?.subject_name || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      formErrors.subject_name
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-teal-500/20 focus:border-teal-500"
                    }`}
                    placeholder="e.g. Mathematics"
                  />
                  {formErrors.subject_name && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <FiAlertCircle /> {formErrors.subject_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSubject}
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-70 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
                >
                  {submitting && (
                    <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  )}
                  {currentSubject?.id ? "Update Subject" : "Create Subject"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Dialog */}
        {openDeleteDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertCircle className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Delete Subject?
                </h3>
                <p className="text-gray-500 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-800">
                    "{selectedToDelete?.subject_name}"
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setOpenDeleteDialog(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors w-full"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteSubject}
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

        {/* Notification Toast */}
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

export default ManageSubject;

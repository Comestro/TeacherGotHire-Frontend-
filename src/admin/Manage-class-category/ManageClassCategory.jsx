import React, { useState, useEffect, useRef } from "react";
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
  FiMoreVertical,
  FiFilter,
} from "react-icons/fi";
import Layout from "../Admin/Layout";
import {
  getClassCategory,
  updateClassCategory,
  deleteClassCategory,
  createClassCategory,
} from "../../services/adminClassCategoryApi";
import ErrorMessage from "../../components/ErrorMessage";

const ManageClassCategory = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const inputRef = useRef(null);

  // Original state variables that are not part of the provided snippet but are in the original file
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState(null); // This was in the original, but the new snippet doesn't explicitly manage it. Keeping for now.
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (openAddEditModal && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [openAddEditModal]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getClassCategory();
      const processed = Array.isArray(data) ? data : [];
      setCategories(processed);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to load class categories.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!selectedCategory?.name || selectedCategory.name.trim() === "") {
      errors.name = "Category name is required";
    } else if (selectedCategory.name.length < 2) {
      errors.name = "Category name must be at least 2 characters";
    } else if (selectedCategory.name.length > 50) {
      errors.name = "Category name cannot exceed 50 characters";
    } else {
      if (!selectedCategory.id) {
        const nameExists = categories.some(
          (cat) =>
            cat.name.toLowerCase() === selectedCategory.name.toLowerCase()
        );

        if (nameExists) {
          errors.name = "Class category with this name already exists";
        }
      }
    }
    if (
      selectedCategory?.description &&
      selectedCategory.description.length > 500
    ) {
      errors.description = "Description cannot exceed 500 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showNotification = (message, type = "success") => {
    const cleanMessage = Array.isArray(message) ? message[0] : message;
    setNotification({
      open: true,
      message: cleanMessage,
      type,
    });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, open: false }));
    }, 4000);
  };

  const handleOpenAddEditModal = (category = null) => {
    setSelectedCategory(category || { name: "", description: "" });
    setFormErrors({});
    setOpenAddEditModal(true);
  };

  const handleCloseAddEditModal = () => {
    setSelectedCategory(null);
    setFormErrors({});
    setOpenAddEditModal(false);
  };

  const handleOpenDeleteModal = (category) => {
    setSelectedCategory(category);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedCategory(null);
    setOpenDeleteModal(false);
  };

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setSelectedCategory({
      ...selectedCategory,
      [name]: value,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handleSaveCategory = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (selectedCategory.id) {
        const updatedCategory = await updateClassCategory(
          selectedCategory.id,
          selectedCategory
        );
        setCategories(
          categories.map((cat) =>
            cat.id === selectedCategory.id ? updatedCategory : cat
          )
        );
        showNotification("Category updated successfully!");
        handleCloseAddEditModal();
      } else {
        const newCategory = await createClassCategory(selectedCategory);
        setCategories([...categories, newCategory]);
        showNotification("Category added successfully!");
        handleCloseAddEditModal();
      }
    } catch (error) {
      if (error.response?.data) {
        const responseData = error.response.data;

        if (responseData.name && Array.isArray(responseData.name)) {
          setFormErrors({
            ...formErrors,
            name: responseData.name[0],
          });
          showNotification(responseData.name[0], "error");
          return;
        } else if (responseData.message) {
          showNotification(responseData.message, "error");
          return;
        }
      }

      const fallbackMessage = selectedCategory.id
        ? "Failed to update category"
        : "Failed to add category";
      showNotification(fallbackMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      setSubmitting(true);
      await deleteClassCategory(selectedCategory.id);
      setCategories(categories.filter((cat) => cat.id !== selectedCategory.id));
      showNotification(
        `Category "${selectedCategory.name}" deleted successfully!`
      );
      handleCloseDeleteModal();
    } catch (error) {
      if (error.response?.data) {
        if (error.response.data.message) {
          showNotification(error.response.data.message, "error");
        } else if (typeof error.response.data === "string") {
          showNotification(error.response.data, "error");
        } else {
          showNotification(
            "Failed to delete category. It might be in use.",
            "error"
          );
        }
      } else {
        showNotification("Failed to delete category", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;

    try {
      setSubmitting(true);
      await Promise.all(
        selectedCategories.map((categoryId) => deleteClassCategory(categoryId))
      );
      setCategories(
        categories.filter((cat) => !selectedCategories.includes(cat.id))
      );
      setSelectedCategories([]);
      showNotification(
        `${selectedCategories.length} categories deleted successfully!`
      );
    } catch (error) {
      if (error.response?.data) {
        if (error.response.data.message) {
          showNotification(error.response.data.message, "error");
        } else if (typeof error.response.data === "string") {
          showNotification(error.response.data, "error");
        } else {
          showNotification(
            "Failed to delete some categories. They might be in use.",
            "error"
          );
        }
      } else {
        showNotification("Failed to delete selected categories", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Sorting logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedCategories = React.useMemo(() => {
    let sortableItems = [...categories];
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
  }, [categories, sortConfig]);

  // Filtering logic
  const filteredCategories = sortedCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description &&
        cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCategories(currentCategories.map((c) => c.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((item) => item !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Class Categories
            </h1>
            <p className="text-sm text-gray-500">
              Manage and organize your class categories
            </p>
          </div>
          <button
            onClick={() => handleOpenAddEditModal()}
            className="flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
          >
            <FiPlus size={20} />
            Add New Category
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
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

              {selectedCategories.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  <FiTrash2 size={16} />
                  Delete ({selectedCategories.length})
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
                Loading categories...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FiGrid className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  No categories found
                </h3>
                <p className="mt-1 text-sm">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by creating a new category"}
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
                          currentCategories.length > 0 &&
                          selectedCategories.length === currentCategories.length
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
                      Category Name
                    </th>
                    <th
                      className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("description")}
                    >
                      Description
                    </th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentCategories.map((category) => (
                    <tr
                      key={category.id}
                      className={`hover:bg-teal-50/30 transition-colors ${
                        selectedCategories.includes(category.id)
                          ? "bg-teal-50/50"
                          : ""
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleSelectOne(category.id)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          #{category.id}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                          <span className="font-medium text-gray-900">
                            {category.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p
                          className="text-gray-500 text-sm truncate max-w-xs"
                          title={category.description}
                        >
                          {category.description || (
                            <span className="italic text-gray-400">
                              No description provided
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenAddEditModal(category)}
                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(category)}
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
          {filteredCategories.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredCategories.length)} of{" "}
                {filteredCategories.length}
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
                  {selectedCategory?.id ? "Edit Category" : "Add New Category"}
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
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={selectedCategory?.name || ""}
                    onChange={handleCategoryChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      formErrors.name
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-teal-500/20 focus:border-teal-500"
                    }`}
                    placeholder="e.g. Primary School"
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
                    rows="4"
                    value={selectedCategory?.description || ""}
                    onChange={handleCategoryChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                      formErrors.description
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-teal-500/20 focus:border-teal-500"
                    }`}
                    placeholder="Optional description..."
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <FiAlertCircle /> {formErrors.description}
                    </p>
                  )}
                  <div className="mt-1 text-xs text-gray-400 text-right">
                    {selectedCategory?.description?.length || 0}/500
                  </div>
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
                  onClick={handleSaveCategory}
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-70 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
                >
                  {submitting && (
                    <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  )}
                  {selectedCategory?.id ? "Update Category" : "Create Category"}
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
                  Delete Category?
                </h3>
                <p className="text-gray-500 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-800">
                    "{selectedCategory?.name}"
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
                    onClick={handleDeleteCategory}
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

export default ManageClassCategory;

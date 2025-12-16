import React, { useState, useEffect, useRef } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiRefreshCw,
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import Layout from "../Admin/Layout";
import {
  getJobTypes,
  createJobType,
  updateJobType,
  deleteJobType,
} from "../../services/adminManageJobtype";

const ManageTeacherJobType = () => {
  const [jobTypes, setJobTypes] = useState([]);
  const [filteredJobTypes, setFilteredJobTypes] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [jobRoleName, setJobRoleName] = useState("");

  const inputRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sort defaults
  const [sortConfig, setSortConfig] = useState({
    key: "jobrole_name",
    direction: "asc",
  });

  useEffect(() => {
    fetchJobTypes();
  }, []);

  useEffect(() => {
    if (openAddEditModal && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [openAddEditModal]);

  const fetchJobTypes = async () => {
    setLoading(true);
    try {
      const data = await getJobTypes();
      const processedData = Array.isArray(data) ? data : [];
      setJobTypes(processedData);
      setFilteredJobTypes(processedData);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to load job types.",
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

  const handleOpenAddEditModal = (job = null) => {
    setCurrentJob(job);
    setJobRoleName(job ? job.jobrole_name : "");
    setFormErrors({});
    setOpenAddEditModal(true);
  };

  const handleCloseAddEditModal = () => {
    setOpenAddEditModal(false);
    setCurrentJob(null);
    setJobRoleName("");
    setFormErrors({});
  };

  const handleOpenDeleteModal = (job) => {
    setCurrentJob(job);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setCurrentJob(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!jobRoleName || jobRoleName.trim() === "") {
      errors.jobrole_name = "Job role name is required";
    } else if (jobRoleName.trim().length < 3) {
      errors.jobrole_name = "Job role name must be at least 3 characters";
    } else if (jobRoleName.trim().length > 50) {
      errors.jobrole_name = "Job role name cannot exceed 50 characters";
    } else {
      const duplicate = jobTypes.find(
        (j) =>
          j.jobrole_name.toLowerCase() === jobRoleName.trim().toLowerCase() &&
          j.id !== currentJob?.id
      );
      if (duplicate) {
        errors.jobrole_name = "Job type with this name already exists";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveJobType = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = { jobrole_name: jobRoleName.trim() };

      if (currentJob) {
        await updateJobType(currentJob.id, payload);
        const updatedList = jobTypes.map((j) =>
          j.id === currentJob.id ? { ...j, ...payload } : j
        );
        setJobTypes(updatedList);
        setFilteredJobTypes(updatedList);
        showNotification(
          `Job type "${payload.jobrole_name}" updated successfully`
        );
      } else {
        const newJob = await createJobType(payload);
        const newList = [...jobTypes, newJob];
        setJobTypes(newList);
        setFilteredJobTypes(newList);
        showNotification(
          `Job type "${newJob.jobrole_name}" added successfully`
        );
      }
      handleCloseAddEditModal();
    } catch (error) {
      if (error.response?.data) {
        const responseData = error.response.data;
        if (responseData.message) {
          showNotification(responseData.message, "error");
        } else if (responseData.jobrole_name) {
          setFormErrors({ jobrole_name: responseData.jobrole_name[0] });
          showNotification(responseData.jobrole_name[0], "error");
        } else {
          showNotification(
            `Failed to ${currentJob ? "update" : "add"} job type.`,
            "error"
          );
        }
      } else {
        showNotification(
          `Failed to ${currentJob ? "update" : "add"} job type.`,
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJobType = async () => {
    if (!currentJob) return;

    setSubmitting(true);
    try {
      await deleteJobType(currentJob.id);
      const newList = jobTypes.filter((j) => j.id !== currentJob.id);
      setJobTypes(newList);
      setFilteredJobTypes(newList);
      setSelectedJobTypes(
        selectedJobTypes.filter((id) => id !== currentJob.id)
      );

      showNotification(
        `Job type "${currentJob.jobrole_name}" deleted successfully`
      );
      handleCloseDeleteModal();
    } catch (error) {
      if (error.response?.data?.message) {
        showNotification(error.response.data.message, "error");
      } else {
        showNotification("Failed to delete job type.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedJobTypes.length === 0) return;
    setSubmitting(true);
    try {
      await Promise.all(selectedJobTypes.map((id) => deleteJobType(id)));
      const newList = jobTypes.filter((j) => !selectedJobTypes.includes(j.id));
      setJobTypes(newList);
      setFilteredJobTypes(newList);
      setSelectedJobTypes([]);
      showNotification(
        `${selectedJobTypes.length} job types deleted successfully`
      );
    } catch (error) {
      showNotification("Failed to delete some job types.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Search
  useEffect(() => {
    if (searchTerm) {
      const filtered = jobTypes.filter((j) =>
        j.jobrole_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobTypes(filtered);
    } else {
      setFilteredJobTypes(jobTypes);
    }
    setCurrentPage(1);
  }, [searchTerm, jobTypes]);

  // Sort
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedJobTypes = React.useMemo(() => {
    let items = [...filteredJobTypes];
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
  }, [filteredJobTypes, sortConfig]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobTypes = sortedJobTypes.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedJobTypes.length / itemsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedJobTypes(currentJobTypes.map((j) => j.id));
    else setSelectedJobTypes([]);
  };

  const handleSelectOne = (id) => {
    if (selectedJobTypes.includes(id))
      setSelectedJobTypes(selectedJobTypes.filter((i) => i !== id));
    else setSelectedJobTypes([...selectedJobTypes, id]);
  };

  return (
    <Layout>
      <div className="p-2 md:p-4 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Manage Teacher Job Types
            </h1>
            <p className="text-xs text-gray-500">
              Create and manage job types/roles for teachers
            </p>
          </div>
          <button
            onClick={() => handleOpenAddEditModal()}
            className="flex items-center justify-center gap-2 bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm text-sm"
          >
            <FiPlus size={18} />
            Add New Job Type
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
                placeholder="Search job types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={fetchJobTypes}
                className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <FiRefreshCw size={16} />
              </button>
              {selectedJobTypes.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium"
                >
                  <FiTrash2 size={14} />
                  Delete ({selectedJobTypes.length})
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
                Loading job types...
              </div>
            ) : sortedJobTypes.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FiBriefcase className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  No job types found
                </h3>
                <p className="mt-1 text-sm">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by adding a new job type"}
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
                          currentJobTypes.length > 0 &&
                          selectedJobTypes.length === currentJobTypes.length
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
                      onClick={() => handleSort("jobrole_name")}
                    >
                      Job Role Name
                    </th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentJobTypes.map((jobType) => (
                    <tr
                      key={jobType.id}
                      className={`hover:bg-teal-50/30 transition-colors ${
                        selectedJobTypes.includes(jobType.id)
                          ? "bg-teal-50/50"
                          : ""
                      }`}
                    >
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedJobTypes.includes(jobType.id)}
                          onChange={() => handleSelectOne(jobType.id)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800">
                          #{jobType.id}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                          <span className="font-medium text-gray-900 text-sm">
                            {jobType.jobrole_name || jobType.job_type_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenAddEditModal(jobType)}
                            className="p-1 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(jobType)}
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
          {sortedJobTypes.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, sortedJobTypes.length)} of{" "}
                {sortedJobTypes.length}
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
                  {currentJob ? "Edit Job Type" : "Add New Job Type"}
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
                    Job Role Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={jobRoleName}
                    onChange={(e) => {
                      setJobRoleName(e.target.value);
                      if (formErrors.jobrole_name) setFormErrors({});
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      formErrors.jobrole_name
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-teal-500/20 focus:border-teal-500"
                    }`}
                    placeholder="e.g. Senior Lecturer"
                  />
                  {formErrors.jobrole_name && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <FiAlertCircle /> {formErrors.jobrole_name}
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
                  onClick={handleSaveJobType}
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-70 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
                >
                  {submitting && (
                    <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  )}
                  {currentJob ? "Update" : "Create"}
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
                  Delete Job Type?
                </h3>
                <p className="text-gray-500 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-800">
                    "{currentJob?.jobrole_name}"
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
                    onClick={handleDeleteJobType}
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

export default ManageTeacherJobType;

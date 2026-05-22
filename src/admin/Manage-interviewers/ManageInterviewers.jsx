import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../services/apiService";
import { 
  HiOutlineSearch, 
  HiOutlinePencil, 
  HiOutlinePlus, 
  HiOutlineTrash 
} from "react-icons/hi";
import Layout from "../Admin/Layout";
import { getTeacher } from "../../services/adminTeacherApi";
import { getClassCategory } from "../../services/adminClassCategoryApi";
import { getSubjects } from "../../services/adminSubujectApi";

// MUI imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  Box,
  Autocomplete,
  TextField,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  CircularProgress,
  DialogContentText
} from "@mui/material";

const ManageInterviewers = () => {
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog state
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  
  // Option lists
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Form fields
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedClassCategories, setSelectedClassCategories] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Delete Dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [interviewerToDelete, setInterviewerToDelete] = useState(null);
  
  // Toast notifications
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchInterviewers();
    fetchInitialData();
  }, []);

  const fetchInterviewers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/interviewer/profile/");
      setInterviewers(response.data);
    } catch (error) {
      console.error("Failed to fetch interviewers", error);
      showToast("Failed to fetch interviewers list", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    setLoadingData(true);
    try {
      const [teachersRes, categoriesRes, subjectsRes] = await Promise.all([
        getTeacher(),
        getClassCategory(),
        getSubjects()
      ]);

      const teachersList = Array.isArray(teachersRes) 
        ? teachersRes 
        : (teachersRes?.results && Array.isArray(teachersRes.results)) 
          ? teachersRes.results 
          : [];

      const categoriesList = Array.isArray(categoriesRes)
        ? categoriesRes
        : (categoriesRes?.results && Array.isArray(categoriesRes.results))
          ? categoriesRes.results
          : [];

      const subjectsList = Array.isArray(subjectsRes)
        ? subjectsRes
        : (subjectsRes?.results && Array.isArray(subjectsRes.results))
          ? subjectsRes.results
          : [];

      setAvailableTeachers(teachersList);
      setAvailableCategories(categoriesList);
      setAvailableSubjects(subjectsList);
    } catch (error) {
      console.error("Failed to fetch form options", error);
      showToast("Failed to load options from server", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  // Helper to filter subjects by selected class categories
  const getFilteredSubjects = () => {
    if (selectedClassCategories.length === 0) return [];
    return availableSubjects.filter(sub => {
      const subCatId = typeof sub.class_category === 'object' ? sub.class_category?.id : sub.class_category;
      return selectedClassCategories.includes(Number(subCatId));
    });
  };

  // Filter teachers who don't already have an interviewer profile, unless we are editing that specific teacher
  const getEligibleTeachers = () => {
    return availableTeachers.filter(t => {
      if (isEditMode && selectedInterviewer && selectedInterviewer.user === t.id) {
        return true;
      }
      return !interviewers.some(inv => inv.user === t.id);
    });
  };

  const getTeacherFullName = (userId) => {
    const teacher = availableTeachers.find(t => t.id === userId);
    if (teacher) {
      return `${teacher.Fname || ""} ${teacher.Lname || ""}`.trim() || teacher.email || `User #${userId}`;
    }
    return `User #${userId}`;
  };

  const handleCategoryChange = (event) => {
    const newCategories = event.target.value;
    setSelectedClassCategories(newCategories);
    
    // Clear selected subjects that no longer belong to the selected categories
    const newFilteredSubs = availableSubjects.filter(sub => {
      const subCatId = typeof sub.class_category === 'object' ? sub.class_category?.id : sub.class_category;
      return newCategories.includes(Number(subCatId));
    });
    
    setSelectedSubjects(prev => prev.filter(subId => newFilteredSubs.some(fs => fs.id === subId)));
  };

  const handleSubjectChange = (event) => {
    setSelectedSubjects(event.target.value);
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setSelectedInterviewer(null);
    setSelectedTeacher(null);
    setSelectedClassCategories([]);
    setSelectedSubjects([]);
    setIsAvailable(true);
    setOpenModal(true);
  };

  const handleOpenEdit = (interviewer) => {
    setIsEditMode(true);
    setSelectedInterviewer(interviewer);
    
    const teacher = availableTeachers.find(t => t.id === interviewer.user);
    setSelectedTeacher(teacher || { id: interviewer.user, username: interviewer.username });

    const cats = Array.isArray(interviewer.class_category)
      ? interviewer.class_category.map(cat => typeof cat === 'object' ? cat.id : cat)
      : [];
    setSelectedClassCategories(cats);

    const subs = Array.isArray(interviewer.subject)
      ? interviewer.subject.map(sub => typeof sub === 'object' ? sub.id : sub)
      : [];
    setSelectedSubjects(subs);
    setIsAvailable(interviewer.is_available);
    setOpenModal(true);
  };

  const handleOpenDelete = (interviewer) => {
    setInterviewerToDelete(interviewer);
    setOpenDeleteDialog(true);
  };

  const handleSave = async () => {
    if (!selectedTeacher) {
      showToast("Please select a teacher/user", "error");
      return;
    }
    if (selectedClassCategories.length === 0) {
      showToast("Please select at least one class category", "error");
      return;
    }
    if (selectedSubjects.length === 0) {
      showToast("Please select at least one subject", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        user: selectedTeacher.id,
        class_category: selectedClassCategories,
        subject: selectedSubjects,
        is_available: isAvailable
      };

      if (isEditMode && selectedInterviewer) {
        await axiosInstance.patch(`/api/interviewer/profile/${selectedInterviewer.id}/`, payload);
        showToast("Interviewer profile updated successfully", "success");
      } else {
        await axiosInstance.post("/api/interviewer/profile/", payload);
        showToast("Interviewer role assigned successfully", "success");
      }

      setOpenModal(false);
      fetchInterviewers();
    } catch (error) {
      console.error("Failed to save interviewer profile", error);
      const errMsg = error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || "Failed to save interviewer profile";
      showToast(errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!interviewerToDelete) return;
    try {
      await axiosInstance.delete(`/api/interviewer/profile/${interviewerToDelete.id}/`);
      showToast("Interviewer role removed successfully", "success");
      setOpenDeleteDialog(false);
      setInterviewerToDelete(null);
      fetchInterviewers();
    } catch (error) {
      console.error("Failed to delete interviewer profile", error);
      showToast("Failed to delete interviewer profile", "error");
    }
  };

  const filteredInterviewers = interviewers.filter((inv) => {
    const fullName = getTeacherFullName(inv.user).toLowerCase();
    const username = (inv.username || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || username.includes(search);
  });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Manage Interviewers</h2>
            <p className="text-slate-500 text-sm mt-1">Assign subjects, categories, and view performance metrics.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <HiOutlinePlus />
            Add Interviewer Role
          </button>
        </div>

        {/* Search Bar & Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Search by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-teal-500 transition-colors bg-white text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Interviewer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categories</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subjects</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Interviews / Score</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading || loadingData ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </td>
                  </tr>
                ) : filteredInterviewers.length > 0 ? (
                  filteredInterviewers.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 text-sm">
                          {getTeacherFullName(inv.user)}
                        </div>
                        <div className="text-xs text-slate-500">
                          Username: {inv.username} | User ID: {inv.user}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {inv.class_category_names?.map((cat, i) => (
                            <span key={i} className="inline-block bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded font-medium">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {inv.subject_names?.map((sub, i) => (
                            <span key={i} className="inline-block bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded font-medium">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          inv.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {inv.is_available ? 'Available' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-slate-800 font-semibold">{inv.total_interviews}</div>
                        <div className="text-xs text-slate-500">Avg: {inv.average_score?.toFixed(1) || '0.0'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleOpenEdit(inv)}
                          className="text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 p-2 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <HiOutlinePencil /> Edit
                        </button>
                        <button 
                          onClick={() => handleOpenDelete(inv)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors inline-flex items-center gap-1 ml-2"
                        >
                          <HiOutlineTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500 text-sm">
                      No interviewers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Dialog 
          open={openModal} 
          onClose={() => !submitting && setOpenModal(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', pb: 1.5 }}>
            {isEditMode ? "Edit Interviewer Profile" : "Add Interviewer Role"}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box component="form" noValidate sx={{ mt: 1 }}>
              
              {/* Teacher/User Selection */}
              <Autocomplete
                disabled={isEditMode}
                options={getEligibleTeachers()}
                getOptionLabel={(option) => {
                  if (option.email) {
                    return `${option.Fname || ""} ${option.Lname || ""} (${option.email})`.trim();
                  }
                  return option.username || `User #${option.id}`;
                }}
                value={selectedTeacher}
                onChange={(event, newValue) => {
                  setSelectedTeacher(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Teacher / User"
                    required
                    variant="outlined"
                    fullWidth
                  />
                )}
                sx={{ mb: 3 }}
              />

              {/* Class Categories Selection */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="category-select-label">Class Categories</InputLabel>
                <Select
                  labelId="category-select-label"
                  multiple
                  value={selectedClassCategories}
                  onChange={handleCategoryChange}
                  label="Class Categories"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((id) => {
                        const cat = availableCategories.find(c => c.id === id);
                        return <Chip key={id} label={cat?.name || `Category #${id}`} size="small" />;
                      })}
                    </Box>
                  )}
                >
                  {availableCategories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      <Checkbox checked={selectedClassCategories.indexOf(cat.id) > -1} />
                      <ListItemText primary={cat.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Subjects Selection */}
              <FormControl fullWidth sx={{ mb: 3 }} disabled={selectedClassCategories.length === 0}>
                <InputLabel id="subject-select-label">Subjects</InputLabel>
                <Select
                  labelId="subject-select-label"
                  multiple
                  value={selectedSubjects}
                  onChange={handleSubjectChange}
                  label="Subjects"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((id) => {
                        const sub = availableSubjects.find(s => s.id === id);
                        const cat = availableCategories.find(c => c.id === (typeof sub?.class_category === 'object' ? sub?.class_category?.id : sub?.class_category));
                        const label = sub && cat ? `${sub.subject_name} (${cat.name})` : (sub?.subject_name || `Subject #${id}`);
                        return <Chip key={id} label={label} size="small" />;
                      })}
                    </Box>
                  )}
                >
                  {getFilteredSubjects().map((sub) => {
                    const cat = availableCategories.find(c => c.id === (typeof sub.class_category === 'object' ? sub.class_category?.id : sub.class_category));
                    return (
                      <MenuItem key={sub.id} value={sub.id}>
                        <Checkbox checked={selectedSubjects.indexOf(sub.id) > -1} />
                        <ListItemText primary={`${sub.subject_name} (${cat?.name || ''})`} />
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              {/* Availability Switch */}
              <FormControlLabel
                control={
                  <Switch
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    color="primary"
                  />
                }
                label="Available to conduct interviews"
                sx={{ mb: 1, display: 'block' }}
              />

            </Box>
          </DialogContent>
          <DialogActions sx={{ borderTop: '1px solid #f1f5f9', px: 3, py: 1.5 }}>
            <Button onClick={() => setOpenModal(false)} color="inherit" disabled={submitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              disabled={submitting}
              sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            {"Remove Interviewer Role?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to remove the interviewer role from{" "}
              <strong>{interviewerToDelete ? getTeacherFullName(interviewerToDelete.user) : ""}</strong>?
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} variant="contained" color="error">
              Remove
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toast Notification */}
        <Snackbar
          open={toast.open}
          autoHideDuration={6000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </div>
    </Layout>
  );
};

export default ManageInterviewers;

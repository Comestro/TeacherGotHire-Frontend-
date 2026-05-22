import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../services/apiService";
import { 
  HiOutlineSearch, 
  HiOutlinePencil, 
  HiOutlinePlus, 
  HiOutlineTrash,
  HiOutlineEye
} from "react-icons/hi";
import { FiStar, FiCalendar, FiAward, FiX } from "react-icons/fi";
import Layout from "../Admin/Layout";
import { getTeacher } from "../../services/adminTeacherApi";
import { getClassCategory } from "../../services/adminClassCategoryApi";
import { getSubjects } from "../../services/adminSubujectApi";

const dayNames = {
  0: 'Monday',
  1: 'Tuesday',
  2: 'Wednesday',
  3: 'Thursday',
  4: 'Friday',
  5: 'Saturday',
  6: 'Sunday'
};

const formatTime12h = (timeStr) => {
  if (!timeStr) return "";
  try {
    const [hours, minutes] = timeStr.split(":");
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12;
    return `${h.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
};

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
  DialogContentText,
  Drawer,
  Divider,
  IconButton,
  Typography
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

  // View Details Drawer state
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedInterviewerForView, setSelectedInterviewerForView] = useState(null);
  const [viewInterviewerSlots, setViewInterviewerSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

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

  const handleToggleAvailability = async (interviewer, newStatus) => {
    try {
      const payload = {
        user: interviewer.user,
        class_category: interviewer.class_category,
        subject: interviewer.subject,
        is_available: newStatus
      };
      await axiosInstance.patch(`/api/interviewer/profile/${interviewer.id}/`, payload);
      showToast(`Interviewer status updated to ${newStatus ? 'Active' : 'Inactive'}`, "success");
      
      // Update local state without full reload
      setInterviewers(prev => prev.map(inv => inv.id === interviewer.id ? { ...inv, is_available: newStatus } : inv));
      
      if (selectedInterviewerForView && selectedInterviewerForView.id === interviewer.id) {
        setSelectedInterviewerForView(prev => ({ ...prev, is_available: newStatus }));
      }
    } catch (error) {
      console.error("Failed to toggle availability status", error);
      showToast("Failed to update status", "error");
    }
  };

  const handleOpenView = async (interviewer) => {
    setSelectedInterviewerForView(interviewer);
    setViewDrawerOpen(true);
    setLoadingSlots(true);
    setViewInterviewerSlots([]);
    try {
      const response = await axiosInstance.get("/api/interviewer/availability/");
      const slots = Array.isArray(response.data) ? response.data : [];
      // Filter slots for this interviewer profile ID
      const interviewerSlots = slots.filter(
        slot => Number(slot.interviewer) === Number(interviewer.id)
      );
      setViewInterviewerSlots(interviewerSlots);
    } catch (error) {
      console.error("Failed to fetch interviewer availability slots", error);
      showToast("Failed to load availability calendar", "error");
    } finally {
      setLoadingSlots(false);
    }
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
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Switch
                            checked={inv.is_available}
                            onChange={(e) => handleToggleAvailability(inv, e.target.checked)}
                            color="success"
                            size="small"
                          />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.is_available ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {inv.is_available ? 'Active' : 'Inactive'}
                          </span>
                        </Box>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-slate-800 font-semibold">{inv.total_interviews}</div>
                        <div className="text-xs text-slate-500">Avg: {inv.average_score?.toFixed(1) || '0.0'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleOpenView(inv)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors inline-flex items-center gap-1 mr-2"
                        >
                          <HiOutlineEye /> View
                        </button>
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

        {/* View Details Drawer */}
        <Drawer
          anchor="right"
          open={viewDrawerOpen}
          onClose={() => setViewDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: "100%", sm: 500 },
              p: 0,
              borderRadius: { xs: 0, sm: "20px 0 0 20px" },
              boxShadow: "-10px 0 30px rgba(0,0,0,0.05)",
            }
          }}
        >
          <Box sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column", bgcolor: "#fafafa" }}>
            {selectedInterviewerForView && (
              <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                
                {/* Header Profile Section */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Box sx={{
                      width: 54,
                      height: 54,
                      borderRadius: "50%",
                      bgcolor: "#e0f2f1",
                      color: "#008080",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "1.2rem",
                      boxShadow: "0 4px 10px rgba(0, 128, 128, 0.1)"
                    }}>
                      {getTeacherFullName(selectedInterviewerForView.user).charAt(0).toUpperCase()}
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={800} color="#1e293b" sx={{ lineHeight: 1.2 }}>
                        {getTeacherFullName(selectedInterviewerForView.user)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        @{selectedInterviewerForView.username} • User ID: {selectedInterviewerForView.user}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton onClick={() => setViewDrawerOpen(false)} sx={{ bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#e2e8f0" } }}>
                    <FiX size={18} />
                  </IconButton>
                </Box>

                {/* Quick Availability Toggle in Drawer */}
                <Box sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: selectedInterviewerForView.is_available ? "#f0fdf4" : "#fef2f2",
                  border: "1px solid",
                  borderColor: selectedInterviewerForView.is_available ? "#bbf7d0" : "#fecaca",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
                      Availability Status
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedInterviewerForView.is_available ? "Active & receiving interview requests" : "Inactive & offline"}
                    </Typography>
                  </Box>
                  <Switch
                    checked={selectedInterviewerForView.is_available}
                    onChange={(e) => handleToggleAvailability(selectedInterviewerForView, e.target.checked)}
                    color="success"
                  />
                </Box>

                {/* Stats Grid */}
                <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
                  <Box sx={{ p: 2, bgcolor: "white", border: "1px solid #e2e8f0", borderRadius: 3, textAlign: "center" }}>
                    <FiAward size={18} className="mx-auto mb-1 text-amber-500" />
                    <Typography variant="caption" color="text.secondary" display="block">Interviewer Rank</Typography>
                    <Typography variant="body2" fontWeight={800} color="#1e293b">#{selectedInterviewerForView.rank || "—"}</Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: "white", border: "1px solid #e2e8f0", borderRadius: 3, textAlign: "center" }}>
                    <FiStar size={18} className="mx-auto mb-1 text-teal-600" />
                    <Typography variant="caption" color="text.secondary" display="block">Average Score</Typography>
                    <Typography variant="body2" fontWeight={800} color="#1e293b">{selectedInterviewerForView.average_score?.toFixed(1) || "0.0"}</Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: "white", border: "1px solid #e2e8f0", borderRadius: 3, textAlign: "center" }}>
                    <FiCalendar size={18} className="mx-auto mb-1 text-purple-600" />
                    <Typography variant="caption" color="text.secondary" display="block">Total Interviews</Typography>
                    <Typography variant="body2" fontWeight={800} color="#1e293b">{selectedInterviewerForView.total_interviews}</Typography>
                  </Box>
                </Box>

                <Divider />

                {/* Assigned Categories */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#475569" sx={{ mb: 1.5, textTransform: "uppercase", fontSize: "0.75rem", tracking: 1.5 }}>
                    Assigned Class Categories
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedInterviewerForView.class_category_names?.length > 0 ? (
                      selectedInterviewerForView.class_category_names.map((cat, i) => (
                        <Chip key={i} label={cat} size="small" sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, borderRadius: 2, border: "1px solid #dbeafe" }} />
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary">No categories assigned</Typography>
                    )}
                  </Box>
                </Box>

                {/* Assigned Subjects */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#475569" sx={{ mb: 1.5, textTransform: "uppercase", fontSize: "0.75rem", tracking: 1.5 }}>
                    Assigned Subjects
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedInterviewerForView.subject_names?.length > 0 ? (
                      selectedInterviewerForView.subject_names.map((sub, i) => (
                        <Chip key={i} label={sub} size="small" sx={{ bgcolor: "#faf5ff", color: "#6b21a8", fontWeight: 700, borderRadius: 2, border: "1px solid #f3e8ff" }} />
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary">No subjects assigned</Typography>
                    )}
                  </Box>
                </Box>

                <Divider />

                {/* Availability Slots */}
                <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#475569" sx={{ mb: 1.5, textTransform: "uppercase", fontSize: "0.75rem", tracking: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                    <FiCalendar /> Availability Schedule
                  </Typography>
                  
                  {loadingSlots ? (
                    <Box display="flex" justifyContent="center" py={4}>
                      <CircularProgress size={24} sx={{ color: "#0d9488" }} />
                    </Box>
                  ) : viewInterviewerSlots.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {[...viewInterviewerSlots].sort((a, b) => {
                        if (a.day_of_week !== b.day_of_week) {
                          return a.day_of_week - b.day_of_week;
                        }
                        return (a.start_time || "").localeCompare(b.start_time || "");
                      }).map((slot, i) => (
                        <Box key={i} sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "white",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          "&:hover": { borderColor: "#cbd5e1" }
                        }}>
                          <Typography variant="body2" fontWeight={700} color="#334155">
                            {dayNames[slot.day_of_week]}
                          </Typography>
                          <Typography variant="caption" fontWeight={600} sx={{ py: 0.5, px: 1.5, borderRadius: 1.5, bgcolor: "#f1f5f9", color: "#475569" }}>
                            {formatTime12h(slot.start_time)} - {formatTime12h(slot.end_time)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ py: 4, bgcolor: "#f8fafc", borderRadius: 3, border: "1px dashed #cbd5e1", textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        No availability slots registered.
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setViewDrawerOpen(false)}
                  sx={{
                    mt: "auto",
                    borderRadius: 3,
                    fontWeight: 700,
                    borderColor: "#e2e8f0",
                    color: "#475569",
                    py: 1.2,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#f1f5f9", borderColor: "#cbd5e1" }
                  }}
                >
                  Close Profile Details
                </Button>

              </Box>
            )}
          </Box>
        </Drawer>
      </div>
    </Layout>
  );
};

export default ManageInterviewers;

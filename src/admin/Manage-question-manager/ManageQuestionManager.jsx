import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  IconButton,
  Modal,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Switch,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  Grid,
  Tooltip,
  Stack,
  Backdrop,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningAmberIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { DataGrid, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import Layout from "../Admin/Layout";
import {
  getQuestionsManager,
  adminManageAssignedUserManager,
  updateAssignedUserManager,
  deleteAssignedUserManager
} from "../../services/adminManageQuestionManager";
import { getClasses, getSubjects } from "../../services/adminSubujectApi";

const CustomToolbar = ({ quickFilterValue }) => (
  <GridToolbarContainer>
    {/* simple toolbar: export + quickfilter placeholder - extend as needed */}
    <Box sx={{ flex: 1 }} />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const ManageQuestionManager = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // State variables
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [classCategories, setClassCategories] = useState([]);
  const [selectedClassCategories, setSelectedClassCategories] = useState([]);
  const [subjectSelectOpen, setSubjectSelectOpen] = useState(false);
  const [classCategorySelectOpen, setClassCategorySelectOpen] = useState(false);
  const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'asc' }]);

  // Add view dialog states
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewManager, setViewManager] = useState(null);

  // UI states
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [filterStatus, setFilterStatus] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState(null);

  // DataGrid local pagination state (used by your code references)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form data
  const [userData, setUserData] = useState({
    id: null,
    email: "",
    Fname: "",
    Lname: "",
    password: "",
    is_verified: true
  });
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // keep local page/rows sync with paginationModel
    setPage(paginationModel.page ?? 0);
    setRowsPerPage(paginationModel.pageSize ?? 10);
  }, [paginationModel]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [managersResponse, subjectsResponse, classesResponse] = await Promise.all([
        getQuestionsManager(),
        getSubjects(),
        getClasses()
      ]);

      if (Array.isArray(managersResponse)) {
        setManagers(managersResponse);
      } else {
        setManagers([]);
        setError("Failed to fetch managers");
      }

      if (Array.isArray(subjectsResponse)) {
        setAvailableSubjects(subjectsResponse);
      } else {
        setAvailableSubjects([]);
        setError(prev => prev ? prev : "Failed to fetch subjects");
      }

      if (Array.isArray(classesResponse)) {
        setClassCategories(classesResponse);
      } else {
        setClassCategories([]);
        setError(prev => prev ? prev : "Failed to fetch class categories");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching data");
      setManagers([]);
      setAvailableSubjects([]);
      setClassCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // View dialog handlers
  const handleOpenViewDialog = (manager) => {
    setViewManager(manager);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewManager(null);
    setOpenViewDialog(false);
  };

  // Modal handlers
  const handleOpenModal = (isEdit = false, manager = null) => {
    setIsEditMode(isEdit);

    if (isEdit && manager) {
      setSelectedManager(manager);
      setUserData({
        id: manager.id,
        email: manager.user?.email || "",
        Fname: manager.user?.Fname || "",
        Lname: manager.user?.Lname || "",
        password: "",
        is_verified: manager.status ?? true // Use status instead of user.is_verified
      });
      setSelectedSubjects(Array.isArray(manager.subject) ? manager.subject.map(sub => sub.id) : []);

      if (manager.class_category && Array.isArray(manager.class_category)) {
        const validCategoryIds = manager.class_category
          .filter(cat => {
            const categoryInSystem = classCategories.find(c => c.id === cat.id);
            return categoryInSystem && categoryInSystem.subjects && categoryInSystem.subjects.length > 0;
          })
          .map(cat => cat.id);

        setSelectedClassCategories(validCategoryIds);
      } else {
        const uniqueClassCategories = Array.from(new Set((manager.subject || []).map(sub => sub.class_category)));
        const validCategoryIds = uniqueClassCategories
          .filter(catId => {
            const category = classCategories.find(cat => cat.id === catId);
            return category && category.subjects && category.subjects.length > 0;
          })
          .map(Number);

        setSelectedClassCategories(validCategoryIds);
      }
    } else {
      setSelectedManager(null);
      setUserData({
        id: null,
        email: "",
        Fname: "",
        Lname: "",
        password: "",
        is_verified: true
      });
      setSelectedSubjects([]);
      setSelectedClassCategories([]);
    }

    setOpenModal(true);
  };

  const handleCloseModal = () => {
    if (loadingAction) return;
    setOpenModal(false);
    setIsEditMode(false);
    setSelectedManager(null);
  };

  const handleClassCategoryChange = (event, child) => {
    const selectedCategories = event.target.value;
    setSelectedClassCategories(selectedCategories);
    setSelectedSubjects([]);
    setClassCategorySelectOpen(false);
  };

  // Form submission
  const handleSave = async () => {
    try {
      setLoadingAction(true);

      if (!userData.email || !userData.Fname || !userData.Lname || (!isEditMode && !userData.password)) {
        setNotification({
          open: true,
          message: "Please fill all required fields",
          severity: "error",
        });
        setLoadingAction(false);
        return;
      }

      if (selectedSubjects.length === 0 || selectedClassCategories.length === 0) {
        setNotification({
          open: true,
          message: "Please select at least one subject and class category",
          severity: "error",
        });
        setLoadingAction(false);
        return;
      }

      const payload = {
        user: {
          email: userData.email,
          Fname: userData.Fname,
          Lname: userData.Lname,
          ...(isEditMode ? {} : { password: userData.password }),
        },
        class_category: selectedClassCategories,
        subject: selectedSubjects,
        status: userData.is_verified, // This maps the switch value to the status field
      };

      let response;
      if (isEditMode) {
        response = await updateAssignedUserManager(userData.id, payload);
      } else {
        response = await adminManageAssignedUserManager(payload);
      }

      if (response && (response.data || response.message)) {
        setNotification({
          open: true,
          message: response.message || "Manager saved successfully!",
          severity: "success",
        });

        await fetchData();
        handleCloseModal();
      } else {
        throw new Error(isEditMode ? "Failed to update manager" : "Failed to assign manager");
      }
    } catch (error) {
      console.error(error);

      let errorMessage = "Failed to save changes";

      if (error.response?.data) {
        const responseData = error.response.data;

        if (responseData.error) {
          if (typeof responseData.error === 'object') {
            const firstField = Object.keys(responseData.error)[0];
            if (Array.isArray(responseData.error[firstField]) && responseData.error[firstField].length > 0) {
              errorMessage = `${firstField}: ${responseData.error[firstField][0]}`;
            } else {
              errorMessage = responseData.message || "Validation error occurred";
            }
          } else {
            errorMessage = responseData.error;
          }
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // Delete functionality
  const handleDeleteConfirmation = (manager) => {
    setManagerToDelete(manager);
    setOpenDeleteModal(true);
  };

  const handleDeleteManager = async () => {
    if (!managerToDelete) return;

    try {
      setLoadingAction(true);

      await deleteAssignedUserManager(managerToDelete.id);

      setNotification({
        open: true,
        message: "Manager deleted successfully!",
        severity: "success",
      });

      await fetchData();
    } catch (error) {
      console.error(error);
      setNotification({
        open: true,
        message: `Error: ${error.response?.data?.detail || error.message || "Failed to delete manager"}`,
        severity: "error",
      });
    } finally {
      setLoadingAction(false);
      setOpenDeleteModal(false);
      setManagerToDelete(null);
    }
  };

  // Status toggle functionality
  const handleToggleStatus = async (manager) => {
    try {
      setLoadingAction(true);
      const updatedStatus = !manager.status; // Use status instead of user.is_verified

      const classCategoriesPayload = manager.class_category?.map(cat => cat.id) || [];

      const payload = {
        user: {
          email: manager.user?.email,
          Fname: manager.user?.Fname,
          Lname: manager.user?.Lname,
          is_verified: true // Keep user verified, only toggle status
        },
        class_category: classCategoriesPayload,
        subject: (manager.subject || []).map(sub => sub.id),
        status: updatedStatus // Update status field
      };

      const response = await updateAssignedUserManager(manager.id, payload);

      if (response && (response.data || response.message)) {
        // Update local state based on status field
        setManagers(prev =>
          prev.map(m =>
            m.id === manager.id
              ? {
                ...m,
                status: updatedStatus
              }
              : m
          )
        );

        setNotification({
          open: true,
          message: `Manager status ${updatedStatus ? 'activated' : 'deactivated'} successfully!`,
          severity: "success"
        });
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      let errorMessage = "Failed to update status";

      if (error.response?.data) {
        const responseData = error.response.data;

        if (responseData.error) {
          if (typeof responseData.error === 'object') {
            const firstField = Object.keys(responseData.error)[0];
            if (Array.isArray(responseData.error[firstField]) && responseData.error[firstField].length > 0) {
              errorMessage = `${firstField}: ${responseData.error[firstField][0]}`;
            } else {
              errorMessage = responseData.message || "Validation error occurred";
            }
          } else {
            errorMessage = responseData.error;
          }
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setNotification({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // Form input handlers
  const handleInputChange = (e) => {
    setUserData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStatusChange = (e) => {
    setUserData(prev => ({ ...prev, is_verified: e.target.checked }));
  };

  const handleSubjectChange = (event, child) => {
    const selectedSubjectId = child?.props?.value;
    if (!selectedSubjectId) return;

    setSelectedSubjects(prev => {
      if (prev.includes(selectedSubjectId)) {
        return prev.filter(id => id !== selectedSubjectId);
      } else {
        return [...prev, selectedSubjectId];
      }
    });

    setSubjectSelectOpen(false);
  };

  const getFilteredSubjects = () => {
    if (selectedClassCategories.length === 0) return [];

    return classCategories
      .filter(category => selectedClassCategories.includes(category.id))
      .flatMap(category => category.subjects || []);
  };

  const getClassCategoriesWithSubjects = () => {
    return classCategories.filter(category => category.subjects && category.subjects.length > 0);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const getFilteredManagers = () => {
    if (!Array.isArray(managers)) return [];

    const searchTermLower = (searchTerm || "").toLowerCase();

    return managers.filter((manager) => {
      const first = manager.user?.Fname || "";
      const last = manager.user?.Lname || "";
      const fullName = `${first} ${last}`.toLowerCase();
      const email = (manager.user?.email || "").toLowerCase();

      const subjectMatch = (manager.subject || []).some((subject) =>
        (subject.subject_name || "").toLowerCase().includes(searchTermLower)
      );

      const statusMatch =
        filterStatus === "" ||
        (filterStatus === "active" && manager.status) ||
        (filterStatus === "inactive" && !manager.status);

      const nameOrEmailMatch = fullName.includes(searchTermLower) || email.includes(searchTermLower);

      return (nameOrEmailMatch || subjectMatch) && statusMatch;
    });
  };

  const handleFilterStatus = (e) => {
    setFilterStatus(e.target.value);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const filteredManagers = getFilteredManagers();

  // Helper function to format subject with class category
  const getSubjectWithCategory = (subject, classCategoriesList) => {
    const category = classCategoriesList?.find(cat => cat.id === subject.class_category);
    return category ? `${subject.subject_name} (${category.name})` : subject.subject_name;
  };

  return (
    <Layout>
      <Box sx={{ width: '100%' }}>
        {/* Compact Header */}
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#1E293B',
                mb: 0.5,
              }}
            >
              Question Manager Assignment
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              {filteredManagers.length} managers assigned
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => handleOpenModal(false)}
            disabled={loading || loadingAction}
            sx={{
              bgcolor: '#0d9488',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#0a7a6f',
              },
            }}
          >
            Assign New Manager
          </Button>
        </Box>

        {/* Search and Filter Card */}
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: { xs: 'stretch', sm: 'center' },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <TextField
                  placeholder="Search by name, email or subject..."
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#0d9488' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#0d9488',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0d9488',
                      },
                    },
                  }}
                />
              </Box>

              <FormControl
                variant="outlined"
                size="small"
                sx={{
                  minWidth: { xs: '100%', sm: 180 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#0d9488',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0d9488',
                    },
                  },
                }}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={handleFilterStatus}
                  label="Status"
                  startAdornment={<FilterIcon sx={{ mr: 1, color: '#0d9488' }} />}
                >
                  <MenuItem value="">
                    <em>All Status</em>
                  </MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              <Tooltip title="Refresh Data">
                <IconButton
                  size="small"
                  onClick={fetchData}
                  sx={{
                    bgcolor: alpha('#0d9488', 0.1),
                    color: '#0d9488',
                    '&:hover': {
                      bgcolor: alpha('#0d9488', 0.2),
                    },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>

        {/* Main Content Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, flexDirection: 'column', gap: 2 }}>
              <CircularProgress sx={{ color: '#0d9488' }} size={48} />
              <Typography variant="body2" sx={{ color: '#64748B' }}>Loading managers data...</Typography>
            </Box>
          ) : error ? (
            <Box p={3} textAlign="center">
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : filteredManagers.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 3,
              }}
            >
              <GroupIcon sx={{ fontSize: 80, color: '#64748B', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ color: '#64748B', mb: 1, fontWeight: 600 }}>
                {searchTerm ? "No managers found" : "No managers yet"}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by assigning your first question manager"}
              </Typography>
              {!searchTerm && (
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => handleOpenModal(false)}
                  sx={{
                    bgcolor: '#0d9488',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: '#0a7a6f',
                    },
                  }}
                >
                  Assign First Manager
                </Button>
              )}
            </Box>
          ) : (
            <>
              {isMobile ? (
                <Box p={2}>
                  {renderMobileView()}
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 500,
                    width: '100%',
                    '& .MuiDataGrid-root': {
                      border: 'none',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      bgcolor: alpha('#0d9488', 0.05),
                      borderBottom: '2px solid',
                      borderColor: '#0d9488',
                      '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 700,
                        color: '#1E293B',
                      },
                    },
                    '& .MuiDataGrid-row': {
                      '&:hover': {
                        bgcolor: alpha('#0d9488', 0.04),
                      },
                    },
                    '& .MuiCheckbox-root': {
                      color: '#0d9488',
                      '&.Mui-checked': {
                        color: '#0d9488',
                      },
                    },
                  }}
                >
                  <DataGrid
                    rows={filteredManagers.map(manager => ({
                      id: manager.id,
                      name: `${manager.user.Fname} ${manager.user.Lname}`,
                      email: manager.user.email,
                      classes: manager.class_category || [],
                      subjects: manager.subject,
                      status: manager.status,
                      rawData: manager
                    }))}
                    columns={[
                      {
                        field: 'id',
                        headerName: 'ID',
                        width: 80,
                        renderCell: (params) => (
                          <Chip
                            label={params.value}
                            size="small"
                            sx={{
                              bgcolor: alpha('#0d9488', 0.1),
                              color: '#0d9488',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          />
                        ),
                      },
                      {
                        field: 'name',
                        headerName: 'Manager Name',
                        flex: 1.5,
                        minWidth: 180,
                        renderCell: (params) => (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#0d9488' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                              {params.value}
                            </Typography>
                          </Box>
                        ),
                      },
                      {
                        field: 'email',
                        headerName: 'Email',
                        flex: 1.5,
                        minWidth: 200,
                        renderCell: (params) => (
                          <Typography variant="body2" sx={{ color: '#64748B' }}>
                            {params.value}
                          </Typography>
                        ),
                      },
                      {
                        field: 'subjects',
                        headerName: 'Assigned Subjects',
                        flex: 3,
                        minWidth: 300,
                        sortable: false,
                        filterable: false,
                        renderCell: (params) => (
                          <Box 
                            display="flex" 
                            flexWrap="wrap" 
                            gap={0.5} 
                            sx={{ 
                              maxHeight: '100%',
                              overflow: 'auto',
                              py: 0.5
                            }}
                          >
                            {params.value.map((sub) => {
                              const category = params.row.classes.find(cat => cat.id === sub.class_category);
                              const label = category ? `${sub.subject_name} (${category.name})` : sub.subject_name;

                              return (
                                <Tooltip 
                                  key={sub.id}
                                  title={`Subject: ${sub.subject_name} | Category: ${category?.name || 'N/A'}`} 
                                  arrow
                                >
                                  <Chip
                                    label={label}
                                    size="small"
                                    sx={{ 
                                      m: 0.2,
                                      maxWidth: 200,
                                      bgcolor: alpha('#0d9488', 0.1),
                                      color: '#0d9488',
                                      fontWeight: 500,
                                      '& .MuiChip-label': {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }
                                    }}
                                  />
                                </Tooltip>
                              );
                            })}
                          </Box>
                        ),
                      },
                      {
                        field: 'status',
                        headerName: 'Status',
                        width: 170,
                        renderCell: (params) => (
                          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" px={1}>
                            <Chip
                              label={params.value ? "Active" : "Inactive"}
                              size="small"
                              sx={{ 
                                borderRadius: '4px',
                                fontWeight: 600,
                                px: 1,
                                bgcolor: params.value ? alpha('#0d9488', 0.1) : alpha('#64748B', 0.1),
                                color: params.value ? '#0d9488' : '#64748B',
                              }}
                            />
                            <Switch
                              checked={params.value}
                              onChange={() => handleToggleStatus(params.row.rawData)}
                              size="small"
                              disabled={loadingAction}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: '#0d9488',
                                  '& + .MuiSwitch-track': {
                                    backgroundColor: '#0d9488',
                                  },
                                },
                              }}
                            />
                          </Box>
                        ),
                      },
                      {
                        field: 'actions',
                        headerName: 'Actions',
                        width: 150,
                        sortable: false,
                        filterable: false,
                        disableColumnMenu: true,
                        renderCell: (params) => (
                          <Box display="flex" justifyContent="center" gap={1}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenViewDialog(params.row.rawData)}
                                sx={{
                                  bgcolor: alpha('#06B6D4', 0.1),
                                  color: '#06B6D4',
                                  '&:hover': { bgcolor: alpha('#06B6D4', 0.2) },
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Edit Manager">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenModal(true, params.row.rawData)}
                                disabled={loadingAction}
                                sx={{
                                  bgcolor: alpha('#0d9488', 0.1),
                                  color: '#0d9488',
                                  '&:hover': { bgcolor: alpha('#0d9488', 0.2) },
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete Manager">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteConfirmation(params.row.rawData)}
                                disabled={loadingAction}
                                sx={{
                                  bgcolor: alpha('#ef4444', 0.1),
                                  color: '#ef4444',
                                  '&:hover': { bgcolor: alpha('#ef4444', 0.2) },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ),
                      },
                    ]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5, 10, 25, 50]}
                    sortModel={sortModel}
                    onSortModelChange={setSortModel}
                    pagination
                    disableRowSelectionOnClick
                    loading={loading}
                    autoHeight={false}
                    getRowHeight={() => 'auto'}
                    getEstimatedRowHeight={() => 60}
                    sx={{
                      '& .MuiDataGrid-row': {
                        minHeight: '52px!important',
                      },
                      '& .MuiDataGrid-cell': {
                        py: 1.5,
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          open={openModal}
          onClose={loadingAction ? undefined : handleCloseModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { backdropFilter: 'blur(4px)' },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '540px' },
              maxWidth: '95%',
              maxHeight: '90vh',
              overflow: 'auto',
              bgcolor: 'background.paper',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              borderRadius: 3,
            }}
          >
            {/* Modal Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #0d9488 0%, #06B6D4 100%)',
                color: '#F8FAFC',
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isEditMode ? <EditIcon /> : <PersonAddIcon />}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {isEditMode ? "Edit Manager" : "Assign Question Manager"}
                </Typography>
              </Box>
              {!loadingAction && (
                <IconButton
                  onClick={handleCloseModal}
                  sx={{
                    color: '#F8FAFC',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>

            {/* Modal Body */}
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    name="Fname"
                    fullWidth
                    value={userData.Fname}
                    onChange={handleInputChange}
                    required
                    disabled={loadingAction}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#0d9488',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#0d9488',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    name="Lname"
                    fullWidth
                    value={userData.Lname}
                    onChange={handleInputChange}
                    required
                    disabled={loadingAction}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#0d9488',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#0d9488',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    fullWidth
                    value={userData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loadingAction}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#0d9488',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#0d9488',
                      },
                    }}
                  />
                </Grid>

                {!isEditMode && (
                  <Grid item xs={12}>
                    <TextField
                      label="Password"
                      name="password"
                      type="password"
                      fullWidth
                      value={userData.password}
                      onChange={handleInputChange}
                      required
                      disabled={loadingAction}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#0d9488',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#0d9488',
                        },
                      }}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <FormControl 
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#0d9488',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#0d9488',
                      },
                    }}
                  >
                    <InputLabel>Class Categories</InputLabel>
                    <Select
                      multiple
                      open={classCategorySelectOpen}
                      onOpen={() => setClassCategorySelectOpen(true)}
                      onClose={() => setClassCategorySelectOpen(false)}
                      value={selectedClassCategories}
                      onChange={(e, child) => handleClassCategoryChange(e, child)}
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((value) => {
                            const category = classCategories.find(cat => cat.id === value);
                            return (
                              <Chip
                                key={value}
                                label={category ? category.name : value}
                                size="small"
                                sx={{
                                  bgcolor: alpha('#0d9488', 0.1),
                                  color: '#0d9488',
                                  fontWeight: 500,
                                }}
                              />
                            );
                          })}
                        </Box>
                      )}
                      disabled={loadingAction}
                    >
                      {getClassCategoriesWithSubjects().map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name} ({category.subjects.length} subjects)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl 
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#0d9488',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#0d9488',
                      },
                    }}
                  >
                    <InputLabel>Assign Subject(s)</InputLabel>
                    <Select
                      multiple
                      open={subjectSelectOpen}
                      onOpen={() => setSubjectSelectOpen(true)}
                      onClose={() => setSubjectSelectOpen(false)}
                      value={selectedSubjects}
                      onChange={(e, child) => handleSubjectChange(e, child)}
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((value) => {
                            const filteredSubjects = getFilteredSubjects();
                            const subject = filteredSubjects.find(sub => sub.id === value);
                            const category = classCategories.find(cat => cat.id === subject?.class_category);
                            const label = subject && category ? `${subject.subject_name} (${category.name})` : (subject?.subject_name || value);
                            
                            return (
                              <Chip
                                key={value}
                                label={label}
                                size="small"
                                sx={{
                                  bgcolor: alpha('#0d9488', 0.1),
                                  color: '#0d9488',
                                  fontWeight: 500,
                                }}
                              />
                            );
                          })}
                        </Box>
                      )}
                      disabled={loadingAction || selectedClassCategories.length === 0}
                    >
                      {selectedClassCategories.length === 0 ? (
                        <MenuItem disabled>Please select class categories first</MenuItem>
                      ) : (
                        getFilteredSubjects().map((subject) => {
                          const category = classCategories.find(cat => cat.id === subject.class_category);
                          return (
                            <MenuItem key={subject.id} value={subject.id}>
                              {subject.subject_name} ({category?.name || `Class ${subject.class_category}`})
                            </MenuItem>
                          );
                        })
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="text.secondary" mr={2} sx={{ fontWeight: 500 }}>
                      Status:
                    </Typography>
                    <Switch
                      checked={userData.is_verified}
                      onChange={handleStatusChange}
                      disabled={loadingAction}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#0d9488',
                          '& + .MuiSwitch-track': {
                            backgroundColor: '#0d9488',
                          },
                        },
                      }}
                    />
                    <Typography variant="body2" ml={1} sx={{ fontWeight: 600 }}>
                      {userData.is_verified ? "Active" : "Inactive"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleCloseModal}
                  disabled={loadingAction}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#64748B',
                    color: '#64748B',
                    '&:hover': {
                      borderColor: '#64748B',
                      bgcolor: alpha('#64748B', 0.05),
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSave}
                  disabled={loadingAction}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#0d9488',
                    '&:hover': {
                      bgcolor: '#0a7a6f',
                    },
                  }}
                >
                  {loadingAction ? (
                    <CircularProgress size={24} sx={{ color: '#F8FAFC' }} />
                  ) : (
                    <>
                      {isEditMode ? (
                        <>
                          <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                          Update Manager
                        </>
                      ) : (
                        <>
                          <PersonAddIcon sx={{ mr: 1, fontSize: 20 }} />
                          Assign Manager
                        </>
                      )}
                    </>
                  )}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Modal>

        {/* View Manager Details Dialog */}
        <Dialog
          open={openViewDialog}
          onClose={handleCloseViewDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={600}>
                Manager Details
              </Typography>
              <IconButton size="small" onClick={handleCloseViewDialog}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            {viewManager && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={500} color="primary.main" gutterBottom>
                    Personal Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Full Name</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {viewManager.user.Fname} {viewManager.user.Lname}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Email</Typography>
                        <Typography variant="body1">{viewManager.user.email}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Chip
                          label={viewManager.status ? "Active" : "Inactive"} // Use status instead of user.is_verified
                          color={viewManager.status ? "success" : "default"} // Use status instead of user.is_verified
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Manager ID</Typography>
                        <Typography variant="body1">{viewManager.id}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={500} color="primary.main" gutterBottom>
                    Assigned Class Categories
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                    {viewManager.class_category && viewManager.class_category.length > 0 ? (
                      <Grid container spacing={1}>
                        {viewManager.class_category.map((cat) => (
                          <Grid item xs={6} key={cat.id}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                borderRadius: 1,
                                height: '100%'
                              }}
                            >
                              <Typography variant="body2" fontWeight={500}>
                                {cat.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {cat.id}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No class categories assigned</Typography>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={500} color="primary.main" gutterBottom>
                    Assigned Subjects
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                    {viewManager.subject && viewManager.subject.length > 0 ? (
                      <Grid container spacing={1}>
                        {viewManager.subject.map((sub) => {
                          const categoryId = sub.class_category;
                          const category = viewManager.class_category?.find(cat => cat.id === categoryId);
                          const categoryName = category ? category.name : `Class ${categoryId}`;

                          return (
                            <Grid item xs={6} key={sub.id}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 1.5,
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  borderRadius: 1,
                                  height: '100%'
                                }}
                              >
                                <Typography variant="body2" fontWeight={500}>
                                  {sub.subject_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {categoryName} • ID: {sub.id}
                                </Typography>
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No subjects assigned</Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              variant="contained"
              onClick={handleCloseViewDialog}
              sx={{ px: 3 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Modal
          open={openDeleteModal}
          onClose={!loadingAction ? () => setOpenDeleteModal(false) : undefined}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { backdropFilter: 'blur(4px)' },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '440px' },
              maxWidth: '95%',
              bgcolor: 'background.paper',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#F8FAFC',
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DeleteIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Delete Manager
                </Typography>
              </Box>
              {!loadingAction && (
                <IconButton
                  onClick={() => setOpenDeleteModal(false)}
                  sx={{
                    color: '#F8FAFC',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>

            {/* Modal Body */}
            <Box sx={{ p: 3 }}>
              <Box
                sx={{
                  bgcolor: alpha('#ef4444', 0.1),
                  borderRadius: 2,
                  p: 2.5,
                  mb: 2.5,
                  border: '1px solid',
                  borderColor: alpha('#ef4444', 0.2),
                }}
              >
                <Typography variant="body1" sx={{ mb: 1.5, color: '#1E293B', fontWeight: 500 }}>
                  Are you sure you want to delete this manager?
                </Typography>
                <Box
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: 1.5,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: '#64748B', mb: 0.5, fontSize: '0.75rem' }}>
                    Manager Name
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    {managerToDelete ? `${managerToDelete.user.Fname} ${managerToDelete.user.Lname}` : ''}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                    {managerToDelete?.user.email}
                  </Typography>
                </Box>
              </Box>

              <Alert
                severity="warning"
                icon={false}
                sx={{
                  borderRadius: 2,
                  bgcolor: alpha('#f59e0b', 0.1),
                  border: '1px solid',
                  borderColor: alpha('#f59e0b', 0.2),
                  '& .MuiAlert-message': {
                    color: '#92400e',
                  },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  ⚠️ Warning: This action cannot be undone!
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  All associated data will be permanently removed from the system.
                </Typography>
              </Alert>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setOpenDeleteModal(false)}
                  disabled={loadingAction}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#64748B',
                    color: '#64748B',
                    '&:hover': {
                      borderColor: '#64748B',
                      bgcolor: alpha('#64748B', 0.05),
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleDeleteManager}
                  disabled={loadingAction}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#ef4444',
                    '&:hover': {
                      bgcolor: '#dc2626',
                    },
                  }}
                >
                  {loadingAction ? (
                    <CircularProgress size={24} sx={{ color: '#F8FAFC' }} />
                  ) : (
                    <>
                      <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                      Delete Permanently
                    </>
                  )}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Modal>

        {/* Snackbar Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: { xs: 7, sm: 8 } }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            variant="filled"
            elevation={6}
            icon={notification.severity === 'success' ? <CheckCircleIcon /> : undefined}
            sx={{
              width: '100%',
              minWidth: '300px',
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              '& .MuiAlert-message': {
                maxWidth: '100%',
                wordBreak: 'break-word',
                fontWeight: 500,
              },
              ...(notification.severity === 'success' && {
                bgcolor: '#0d9488',
                color: '#F8FAFC',
              }),
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{
            color: '#F8FAFC',
            zIndex: (theme) => theme.zIndex.drawer + 2,
            backdropFilter: 'blur(4px)',
            bgcolor: 'rgba(13, 148, 136, 0.2)',
          }}
          open={submitting}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress
              size={56}
              thickness={4}
              sx={{
                color: '#0d9488',
                mb: 2,
              }}
            />
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E293B' }}>
              Processing...
            </Typography>
          </Box>
        </Backdrop>
      </Box>
    </Layout>
  );
};

export default ManageQuestionManager;
import React, { useState, useEffect } from "react";
import {
  Container,
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
  alpha,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector
} from "@mui/x-data-grid";
import Layout from "../Admin/Layout";
import {
  getQuestionsManager,
  adminManageAssignedUserManager,
  updateAssignedUserManager,
  deleteAssignedUserManager
} from "../../services/adminManageQuestionManager";
import { getClasses, getSubjects } from "../../services/adminSubujectApi";

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
  const [error, setError] = useState(null);
  const [classCategories, setClassCategories] = useState([]);
  const [selectedClassCategories, setSelectedClassCategories] = useState([]);
  const [subjectSelectOpen, setSubjectSelectOpen] = useState(false);
  const [classCategorySelectOpen, setClassCategorySelectOpen] = useState(false);

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState(null);

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
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [managersResponse, subjectsResponse, classesResponse] = await Promise.all([
        getQuestionsManager(),
        getSubjects(),
        getClasses()
      ]);

      if (Array.isArray(managersResponse)) {
        setManagers(managersResponse);
      } else {
        console.error("Invalid managers data:", managersResponse);
        setError("Failed to fetch managers");
      }

      if (Array.isArray(subjectsResponse)) {
        setAvailableSubjects(subjectsResponse);
      } else {
        console.error("Invalid subjects data:", subjectsResponse);
        setError("Failed to fetch subjects");
      }

      if (Array.isArray(classesResponse)) {
        setClassCategories(classesResponse);
      } else {
        console.error("Invalid class categories data:", classesResponse);
        setError("Failed to fetch class categories");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("An error occurred while fetching data");
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
        email: manager.user.email,
        Fname: manager.user.Fname,
        Lname: manager.user.Lname,
        password: "",
        is_verified: manager.status // Use status instead of user.is_verified
      });
      setSelectedSubjects(manager.subject.map(sub => sub.id));

      if (manager.class_category && Array.isArray(manager.class_category)) {
        const validCategoryIds = manager.class_category
          .filter(cat => {
            const categoryInSystem = classCategories.find(c => c.id === cat.id);
            return categoryInSystem && categoryInSystem.subjects && categoryInSystem.subjects.length > 0;
          })
          .map(cat => cat.id);

        setSelectedClassCategories(validCategoryIds);
      } else {
        const uniqueClassCategories = [...new Set(manager.subject.map(sub => sub.class_category))];
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
    setOpenModal(false);
    setIsEditMode(false);
    setSelectedManager(null);
  };

  const handleClassCategoryChange = (event, child) => {
    const selectedCategories = event.target.value;
    const newCategoryId = child ? child.props.value : null;
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
      console.error("Error saving manager:", error);

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
    setOpenDeleteDialog(true);
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
      console.error("Error deleting manager:", error);
      setNotification({
        open: true,
        message: `Error: ${error.response?.data?.detail || error.message || "Failed to delete manager"}`,
        severity: "error",
      });
    } finally {
      setLoadingAction(false);
      setOpenDeleteDialog(false);
      setManagerToDelete(null);
    }
  };

  // Status toggle functionality
  const handleToggleStatus = async (manager) => {
    try {
      setLoadingAction(true);
      const updatedStatus = !manager.status; // Use status instead of user.is_verified

      const classCategories = manager.class_category?.map(cat => cat.id) || [];

      const payload = {
        user: {
          email: manager.user.email,
          Fname: manager.user.Fname,
          Lname: manager.user.Lname,
          is_verified: true // Keep user verified, only toggle status
        },
        class_category: classCategories,
        subject: manager.subject.map(sub => sub.id),
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
                  status: updatedStatus  // Update the status field
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
      // Error handling remains the same
      console.error("Error updating status:", error);

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
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (e) => {
    setUserData({ ...userData, is_verified: e.target.checked });
  };

  const handleSubjectChange = (event, value) => {
    const selectedSubjectId = value.props.value;

    if (selectedSubjects.includes(selectedSubjectId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== selectedSubjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, selectedSubjectId]);
    }

    setSubjectSelectOpen(false);
  };

  const getFilteredSubjects = () => {
    if (selectedClassCategories.length === 0) return [];

    return classCategories
      .filter(category => selectedClassCategories.includes(category.id))
      .flatMap(category => category.subjects);
  };

  const getClassCategoriesWithSubjects = () => {
    return classCategories.filter(category => category.subjects && category.subjects.length > 0);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset to first page when searching
  };

  const getFilteredManagers = () => {
    if (!Array.isArray(managers)) return [];
    
    return managers.filter((manager) => {
      const fullName = `${manager.user.Fname} ${manager.user.Lname}`.toLowerCase();
      const searchTermLower = searchTerm.toLowerCase();
      const emailMatch = manager.user.email.toLowerCase().includes(searchTermLower);

      const subjectMatch = manager.subject.some((subject) =>
        subject.subject_name.toLowerCase().includes(searchTermLower)
      );

      const statusMatch =
        filterStatus === "" ||
        (filterStatus === "active" && manager.status) || // Use status instead of user.is_verified
        (filterStatus === "inactive" && !manager.status); // Use status instead of user.is_verified

      return (fullName.includes(searchTermLower) || emailMatch || subjectMatch) && statusMatch;
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterStatus = (e) => {
    setFilterStatus(e.target.value);
    setPage(0);
  };

  const filteredManagers = getFilteredManagers();

  const getSubjectNames = (subjectIds) => {
    return subjectIds
      .map(id => {
        const subject = availableSubjects.find(sub => sub.id === id);
        return subject ? subject.subject_name : id;
      })
      .join(", ");
  };

  const renderMobileView = () => {
    return (
      <Box>
        {filteredManagers
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((manager) => (
            <Card
              key={manager.user.id}
              sx={{
                mb: 2,
                borderLeft: `4px solid ${manager.user.is_verified ? theme.palette.success.main : theme.palette.grey[500]}`
              }}
              variant="outlined"
            >
              <CardContent>
                <Box mb={1}>
                  <Typography variant="h6" component="h3">
                    {manager.user.Fname} {manager.user.Lname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {manager.user.email}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Assigned Classes:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                  {manager.class_category && manager.class_category.map((cat) => (
                    <Chip
                      key={cat.id}
                      label={cat.name}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  ))}
                </Box>

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Assigned Subjects:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                  {manager.subject.map((sub) => {
                    const categoryId = sub.class_category;
                    const category = manager.class_category?.find(cat => cat.id === categoryId);
                    const categoryName = category ? category.name : `Class ${categoryId}`;

                    return (
                      <Chip
                        key={sub.id}
                        label={`${sub.subject_name} (${categoryName})`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    );
                  })}
                </Box>

                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" mr={1}>Status:</Typography>
                    <Chip
                      size="small"
                      label={manager.status ? "Active" : "Inactive"} // Use status instead of user.is_verified
                      color={manager.status ? "success" : "default"} // Use status instead of user.is_verified
                    />
                  </Box>
                  <Box>
                    <Switch
                      checked={manager.status} // Use status instead of user.is_verified
                      onChange={() => handleToggleStatus(manager)}
                      color="success"
                      size="small"
                      disabled={loadingAction}
                    />
                  </Box>
                </Box>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleOpenViewDialog(manager)}
                >
                  View
                </Button>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenModal(true, manager)}
                  disabled={loadingAction}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteConfirmation(manager)}
                  disabled={loadingAction}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
      </Box>
    );
  };

  const CustomToolbar = () => {
    const theme = useTheme();
    
    return (
      <GridToolbarContainer sx={{ p: 1 }}>
        <GridToolbarColumnsButton 
          sx={{ fontSize: '0.75rem', borderRadius: 1, color: theme.palette.text.secondary }}
        />
        <GridToolbarFilterButton 
          sx={{ fontSize: '0.75rem', borderRadius: 1, color: theme.palette.text.secondary }}
        />
        <GridToolbarDensitySelector 
          sx={{ fontSize: '0.75rem', borderRadius: 1, color: theme.palette.text.secondary }}
        />
        <GridToolbarExport 
          sx={{ fontSize: '0.75rem', borderRadius: 1, color: theme.palette.text.secondary }}
        />
      </GridToolbarContainer>
    );
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 2,
            backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.background.paper, 0.5)})`,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: "primary.main",
                fontWeight: 700,
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
              }}
            >
              Question Manager Assignment
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {filteredManagers.length} managers assigned
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenModal(false)}
            startIcon={<PersonAddIcon />}
            disabled={loading || loadingAction}
            sx={{
              boxShadow: 2,
              textTransform: 'none',
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            Assign New Manager
          </Button>
        </Paper>

        <Paper
          elevation={2}
          sx={{
            mb: 3,
            p: { xs: 2, sm: 3 },
            borderRadius: 2
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                placeholder="Search by name, email or subject..."
                variant="outlined"
                fullWidth
                size="small"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl variant="outlined" fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={handleFilterStatus}
                  label="Status"
                  startAdornment={<FilterIcon color="action" sx={{ mr: 1 }} />}
                >
                  <MenuItem value="">
                    <em>All Status</em>
                  </MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={6} flexDirection="column" gap={2}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">Loading managers data...</Typography>
            </Box>
          ) : error ? (
            <Box p={3} textAlign="center">
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : filteredManagers.length === 0 ? (
            <Box p={3} textAlign="center">
              <Alert severity="info">No managers found matching your criteria</Alert>
            </Box>
          ) : (
            <>
              {isMobile ? (
                <Box p={2}>
                  {renderMobileView()}
                </Box>
              ) : (
                <Box sx={{ height: 500, width: '100%' }}>
                  <DataGrid
                    rows={filteredManagers.map(manager => ({
                      id: manager.id,
                      name: `${manager.user.Fname} ${manager.user.Lname}`,
                      email: manager.user.email,
                      classes: manager.class_category || [],
                      subjects: manager.subject,
                      status: manager.status, // Use status instead of user.is_verified
                      rawData: manager
                    }))}
                    columns={[
                      {
                        field: 'name',
                        headerName: 'Manager Name',
                        flex: 1.5,
                        minWidth: 180,
                        sortable: true,
                        filterable: true,
                      },
                      {
                        field: 'email',
                        headerName: 'Email',
                        flex: 2,
                        minWidth: 200,
                        sortable: true,
                        filterable: true,
                      },
                      {
                        field: 'classes',
                        headerName: 'Classes',
                        flex: 2,
                        minWidth: 200,
                        sortable: false,
                        filterable: false,
                        renderCell: (params) => (
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {params.value && params.value.map((cat) => (
                              <Chip
                                key={cat.id}
                                label={cat.name}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                sx={{ m: 0.2 }}
                              />
                            ))}
                          </Box>
                        ),
                        hide: isTablet,
                      },
                      {
                        field: 'subjects',
                        headerName: 'Subjects',
                        flex: 2,
                        minWidth: 220,
                        sortable: false,
                        filterable: false,
                        renderCell: (params) => (
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {params.value.map((sub) => {
                              const categoryId = sub.class_category;
                              const category = params.row.classes.find(cat => cat.id === categoryId);
                              const categoryName = category ? category.name : `Class ${categoryId}`;

                              return (
                                <Chip
                                  key={sub.id}
                                  label={`${sub.subject_name} (${categoryName})`}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  sx={{ m: 0.2 }}
                                />
                              );
                            })}
                          </Box>
                        ),
                        hide: isTablet,
                      },
                      {
                        field: 'status',
                        headerName: 'Status',
                        width: 170,
                        sortable: true,
                        filterable: true,
                        type: 'boolean',
                        renderCell: (params) => (
                          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                            <Chip
                              label={params.value ? "Active" : "Inactive"}
                              color={params.value ? "success" : "default"}
                              size="small"
                            />
                            <Tooltip title={params.value ? "Deactivate" : "Activate"}>
                              <Switch
                                checked={params.value}
                                onChange={() => handleToggleStatus(params.row.rawData)}
                                color="success"
                                size="small"
                                disabled={loadingAction}
                              />
                            </Tooltip>
                          </Box>
                        ),
                      },
                      {
                        field: 'actions',
                        headerName: 'Actions',
                        width: 150,
                        sortable: false,
                        filterable: false,
                        renderCell: (params) => (
                          <Box display="flex" justifyContent="center" gap={1}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleOpenViewDialog(params.row.rawData)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Edit Manager">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenModal(true, params.row.rawData)}
                                disabled={loadingAction}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete Manager">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteConfirmation(params.row.rawData)}
                                disabled={loadingAction}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ),
                      },
                    ]}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          page: page,
                          pageSize: rowsPerPage
                        },
                      },
                      sorting: {
                        sortModel: [{ field: 'name', sort: 'asc' }],
                      },
                      filter: {
                        filterModel: {
                          items: [],
                          quickFilterValues: searchTerm ? [searchTerm] : [],
                        },
                      },
                    }}
                    pageSizeOptions={[5, 10, 25, 50]}
                    onPaginationModelChange={(model) => {
                      setPage(model.page);
                      setRowsPerPage(model.pageSize);
                    }}
                    filterMode="client"
                    slots={{
                      toolbar: CustomToolbar,
                      noRowsOverlay: () => (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 3 }}>
                          <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
                            No managers found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" align="center">
                            Try adjusting your search or filters
                          </Typography>
                        </Box>
                      ),
                    }}
                    sx={{
                      border: 'none',
                      '& .MuiDataGrid-cell:focus': {
                        outline: 'none',
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: theme.palette.background.default,
                        fontWeight: 600,
                      },
                      '& .MuiDataGrid-row:nth-of-type(even)': {
                        backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : theme.palette.background.default,
                      },
                      '& .MuiDataGrid-toolbarContainer': {
                        padding: 1,
                      },
                      '& .MuiButton-root': {
                        textTransform: 'none',
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Paper>

        {/* Add/Edit Modal */}
        <Dialog
          open={openModal}
          onClose={loadingAction ? undefined : handleCloseModal}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight={600}>
              {isEditMode ? "Edit Manager" : "Assign Question Manager"}
            </Typography>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="Fname"
                  fullWidth
                  margin="normal"
                  value={userData.Fname}
                  onChange={handleInputChange}
                  required
                  disabled={loadingAction || isEditMode}
                  InputProps={{
                    readOnly: isEditMode,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="Lname"
                  fullWidth
                  margin="normal"
                  value={userData.Lname}
                  onChange={handleInputChange}
                  required
                  disabled={loadingAction || isEditMode}
                  InputProps={{
                    readOnly: isEditMode,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  fullWidth
                  margin="normal"
                  value={userData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loadingAction || isEditMode}
                  InputProps={{
                    readOnly: isEditMode,
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
                    margin="normal"
                    value={userData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loadingAction}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
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
                              color="primary"
                              variant="outlined"
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
                <FormControl fullWidth margin="normal">
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
                          return (
                            <Chip
                              key={value}
                              label={subject ? subject.subject_name : value}
                              size="small"
                              color="primary"
                              variant="outlined"
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
                      getFilteredSubjects().map((subject) => (
                        <MenuItem key={subject.id} value={subject.id}>
                          {subject.subject_name} ({
                            classCategories.find(cat => cat.id === subject.class_category)?.name || `Class ${subject.class_category}`
                          })
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" mt={1}>
                  <Typography variant="body2" color="text.secondary" mr={2}>
                    Status:
                  </Typography>
                  <Switch
                    checked={userData.is_verified}
                    onChange={handleStatusChange}
                    color="success"
                    disabled={loadingAction}
                  />
                  <Typography variant="body2" ml={1}>
                    {userData.is_verified ? "Active" : "Inactive"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Button
              onClick={handleCloseModal}
              disabled={loadingAction}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={loadingAction}
              startIcon={loadingAction && <CircularProgress size={20} color="inherit" />}
            >
              {loadingAction ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

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

        <Dialog
          open={openDeleteDialog}
          onClose={() => !loadingAction && setOpenDeleteDialog(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete manager{' '}
              <strong>
                {managerToDelete ? `${managerToDelete.user.Fname} ${managerToDelete.user.Lname}` : ''}
              </strong>?
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenDeleteDialog(false)}
              disabled={loadingAction}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteManager}
              color="error"
              variant="contained"
              disabled={loadingAction}
              startIcon={loadingAction && <CircularProgress size={20} color="inherit" />}
            >
              {loadingAction ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            variant="filled"
            elevation={3}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default ManageQuestionManager;
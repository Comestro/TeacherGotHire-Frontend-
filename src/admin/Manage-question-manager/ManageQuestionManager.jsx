import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  TablePagination,
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
  MoreVert as MoreVertIcon
} from "@mui/icons-material";
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

  // Modal handlers
  const handleOpenModal = (isEdit = false, manager = null) => {
    setIsEditMode(isEdit);
  
    if (isEdit && manager) {
      setSelectedManager(manager);
      setUserData({
        id: manager.user.id,
        email: manager.user.email,
        Fname: manager.user.Fname,
        Lname: manager.user.Lname,
        password: "",
        is_verified: manager.user.is_verified
      });
      setSelectedSubjects(manager.subject.map(sub => sub.id));
  
      // For edit mode, determine selected class categories
      const uniqueClassCategories = [...new Set(manager.subject.map(sub => sub.class_category))];
      // Convert to numbers to ensure proper matching
      setSelectedClassCategories(uniqueClassCategories.map(Number));
    } else {
      // Reset form for new manager
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
  
      // Validate form
      if (!userData.email || !userData.Fname || !userData.Lname || (!isEditMode && !userData.password)) {
        setNotification({
          open: true,
          message: "Please fill all required fields",
          severity: "error"
        });
        setLoadingAction(false);
        return;
      }
  
      if (selectedSubjects.length === 0) {
        setNotification({
          open: true,
          message: "Please select at least one subject",
          severity: "error"
        });
        setLoadingAction(false);
        return;
      }
  
      // Prepare payload
      const payload = {
        user: {
          id: isEditMode ? userData.id : null,  // Include ID for edit mode
          email: userData.email,
          Fname: userData.Fname,
          Lname: userData.Lname,
          is_verified: userData.is_verified
        },
        subject: selectedSubjects,
      };
  
      // Add password only for new users
      if (!isEditMode) {
        payload.user.password = userData.password;
      }
  
      // Call API
      let response;
      if (isEditMode) {
        response = await updateAssignedUserManager(userData.id, payload);
      } else {
        response = await adminManageAssignedUserManager(payload);
      }
  
      // Check if the response was successful
      if (response && response.status) {
        setNotification({
          open: true,
          message: isEditMode ? "Manager updated successfully!" : "Manager assigned successfully!",
          severity: "success"
        });
        
        // Refresh data and close modal
        await fetchData();
        handleCloseModal();
      } else {
        throw new Error(isEditMode ? "Failed to update manager" : "Failed to assign manager");
      }
    } catch (error) {
      console.error("Error saving manager:", error);
      setNotification({
        open: true,
        message: `Error: ${error.message || "Failed to save changes"}`,
        severity: "error"
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
      const response = await deleteAssignedUserManager(managerToDelete.user.id);
      
      if (response && response.status) {
        setNotification({
          open: true,
          message: "Manager deleted successfully!",
          severity: "success"
        });
        
        await fetchData();
      } else {
        throw new Error("Failed to delete manager");
      }
    } catch (error) {
      console.error("Error deleting manager:", error);
      setNotification({
        open: true,
        message: `Error: ${error.message || "Failed to delete manager"}`,
        severity: "error"
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
      const updatedStatus = !manager.user.is_verified;
  
      // Update the payload structure to match API expectations
      const payload = {
        user: {
          id: manager.user.id,
          email: manager.user.email,
          Fname: manager.user.Fname,
          Lname: manager.user.Lname,
          is_verified: updatedStatus
        },
        subject: manager.subject.map(sub => sub.id)
      };
  
      const response = await updateAssignedUserManager(manager.user.id, payload);
      
      if (response && response.status) {
        // Update local state for immediate UI update
        setManagers(prev =>
          prev.map(m =>
            m.user.id === manager.user.id
              ? { ...m, user: { ...m.user, is_verified: updatedStatus } }
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
      console.error("Error updating status:", error);
      setNotification({
        open: true,
        message: `Error: ${error.message || "Failed to update status"}`,
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

    // If already selected, remove it, otherwise add it
    if (selectedSubjects.includes(selectedSubjectId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== selectedSubjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, selectedSubjectId]);
    }

    // Close the dropdown after selection
    setSubjectSelectOpen(false);
  };

  // Get available subjects based on selected class categories
  const getFilteredSubjects = () => {
    if (selectedClassCategories.length === 0) return [];

    return classCategories
      .filter(category => selectedClassCategories.includes(category.id))
      .flatMap(category => category.subjects);
  };

  // Filtering and pagination
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset to first page when searching
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
    setPage(0); // Reset to first page when filtering
  };

  // Filter managers based on search and status filter
  const filteredManagers = Array.isArray(managers)
    ? managers.filter((manager) => {
      const fullName = `${manager.user.Fname} ${manager.user.Lname}`.toLowerCase();
      const searchTermLower = searchTerm.toLowerCase();
      const emailMatch = manager.user.email.toLowerCase().includes(searchTermLower);

      const subjectMatch = manager.subject.some((subject) =>
        subject.subject_name.toLowerCase().includes(searchTermLower)
      );

      const statusMatch =
        filterStatus === "" ||
        (filterStatus === "active" && manager.user.is_verified) ||
        (filterStatus === "inactive" && !manager.user.is_verified);

      return (fullName.includes(searchTermLower) || emailMatch || subjectMatch) && statusMatch;
    })
    : [];

  // Get subject names for display
  const getSubjectNames = (subjectIds) => {
    return subjectIds
      .map(id => {
        const subject = availableSubjects.find(sub => sub.id === id);
        return subject ? subject.subject_name : id;
      })
      .join(", ");
  };

  // Render mobile card view
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
                  Assigned Subjects:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                  {manager.subject.map((sub) => (
                    <Chip
                      key={sub.id}
                      label={`${sub.subject_name} (Class ${sub.class_category})`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>

                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" mr={1}>Status:</Typography>
                    <Chip
                      size="small"
                      label={manager.user.is_verified ? "Active" : "Inactive"}
                      color={manager.user.is_verified ? "success" : "default"}
                    />
                  </Box>
                  <Box>
                    <Switch
                      checked={manager.user.is_verified}
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

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        {/* Header section */}
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

        {/* Filters section */}
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

        {/* Managers List */}
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
                // Mobile card view
                <Box p={2}>
                  {renderMobileView()}
                </Box>
              ) : (
                // Desktop table view
                <TableContainer>
                  <Table size={isTablet ? "small" : "medium"}>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Manager Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                        {!isTablet && (
                          <TableCell sx={{ fontWeight: 600 }}>Assigned Subjects</TableCell>
                        )}
                        <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {filteredManagers
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((manager) => (
                          <TableRow
                            key={manager.user.id}
                            hover
                            sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {manager.user.Fname} {manager.user.Lname}
                              </Typography>
                            </TableCell>

                            <TableCell>{manager.user.email}</TableCell>

                            {!isTablet && (
                              <TableCell>
                                <Box display="flex" flexWrap="wrap" gap={0.5}>
                                  {manager.subject.map((sub) => (
                                    <Chip
                                      key={sub.id}
                                      label={`${sub.subject_name} (${sub.class_category})`}
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                      sx={{ m: 0.2 }}
                                    />
                                  ))}
                                </Box>
                              </TableCell>
                            )}

                            <TableCell align="center">
                              <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                <Chip
                                  label={manager.user.is_verified ? "Active" : "Inactive"}
                                  color={manager.user.is_verified ? "success" : "default"}
                                  size="small"
                                />
                                <Tooltip title={manager.user.is_verified ? "Deactivate" : "Activate"}>
                                  <Switch
                                    checked={manager.user.is_verified}
                                    onChange={() => handleToggleStatus(manager)}
                                    color="success"
                                    size="small"
                                    disabled={loadingAction}
                                  />
                                </Tooltip>
                              </Box>
                            </TableCell>

                            <TableCell align="center">
                              <Box display="flex" justifyContent="center" gap={1}>
                                <Tooltip title="Edit Manager">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenModal(true, manager)}
                                    disabled={loadingAction}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Delete Manager">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteConfirmation(manager)}
                                    disabled={loadingAction}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Pagination */}
              <Box
                display="flex"
                justifyContent="flex-end"
                p={2}
                sx={{
                  backgroundColor: theme.palette.background.default,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}
              >
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredManagers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
                />
              </Box>
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
                  disabled={loadingAction}
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
                  disabled={loadingAction}
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
                  disabled={loadingAction}
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
                    {classCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
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

        {/* Delete Confirmation Dialog */}
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

        {/* Notification Snackbar */}
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
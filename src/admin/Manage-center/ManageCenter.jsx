import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  TablePagination,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  Tooltip,
  alpha
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Mail as EmailIcon
} from "@mui/icons-material";
import Layout from "../Admin/Layout";
import { createCenterManager, deleteCenterManager, getManageCenter, updateCenterManager } from "../../services/adminManageCenterApi";
import axios from 'axios';

const ManageCenter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [examCenters, setExamCenters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    Fname: "",
    Lname: "",
    center_name: "",
    pincode: "",
    state: "",
    city: "",
    area: "",
    status: false,
  });
  const [filteredCenters, setFilteredCenters] = useState([]);

  const [validationErrors, setValidationErrors] = useState({});
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [centerToDelete, setCenterToDelete] = useState(null);

  useEffect(() => {
    fetchExamCenters();
  }, []);

  useEffect(() => {
    // Update filteredCenters whenever examCenters, searchTerm, or filterStatus changes
    const filtered = examCenters.filter(
      (center) =>
        (center.center_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          center.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          center.state?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === "" || (filterStatus === "active" ? true : false) === center.status)
    );
    setFilteredCenters(filtered);
  }, [examCenters, searchTerm, filterStatus]);

  const fetchExamCenters = async () => {
    setIsLoading(true);
    try {
      const response = await getManageCenter();
      setExamCenters(Array.isArray(response) ? response : []);
      showSnackbar("Exam centers loaded successfully", "success");
    } catch (error) {
      console.error("Error fetching exam centers:", error);
      showSnackbar("Error fetching exam centers", "error");
      setExamCenters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterStatus = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddCenter = () => {
    setSelectedCenter(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      Fname: "",
      Lname: "",
      center_name: "",
      pincode: "",
      state: "",
      city: "",
      area: "",
      status: false,
    });
    setValidationErrors({});
    setPincodeStatus(null);
    setIsModalOpen(true);
  };

  const handleEditCenter = (center) => {
    setSelectedCenter(center);
    setFormData({
      username: center.user?.username || "",
      email: center.user?.email || "",
      password: "", // Leave password empty for edit
      Fname: center.user?.Fname || "",
      Lname: center.user?.Lname || "",
      center_name: center.center_name || "",
      pincode: center.pincode || "",
      state: center.state || "",
      city: center.city || "",
      area: center.area || "",
      status: center.status || false,
    });
    setValidationErrors({});
    setPincodeStatus(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (center) => {
    try {
      const updatedStatus = !center.status;
      console.log("Current status:", center.status);
      console.log("Attempting to update to:", updatedStatus);

      // Simple payload with just status
      const payload = {
        status: updatedStatus
      };
      
      console.log("Sending payload:", JSON.stringify(payload));
      
      const response = await updateCenterManager(center.id, payload);
      console.log("Response from server:", response);

      // Verify if the status was actually updated in the response
      if (response && response.status === updatedStatus) {
        // Update local state
        setExamCenters(prevCenters =>
          prevCenters.map(c =>
            c.id === center.id
              ? { ...c, status: updatedStatus }
              : c
          )
        );
        showSnackbar(`Exam center ${updatedStatus ? 'activated' : 'deactivated'} successfully`, "success");
      } else {
        console.error("Status not updated in response:", response);
        showSnackbar("Server did not update exam center status", "error");
      }
    } catch (error) {
      console.error("Error updating center status:", error);
      
      // Log more detailed error information
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      
      showSnackbar("Error updating exam center status", "error");
    }
  };

  const handleDeleteConfirmation = (center) => {
    setCenterToDelete(center);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCenter = async () => {
    if (!centerToDelete) return;

    try {
      setIsSubmitting(true);
      await deleteCenterManager(centerToDelete.id);
      setExamCenters(examCenters.filter((center) => center.id !== centerToDelete.id));
      showSnackbar("Exam center deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting exam center:", error);
      showSnackbar("Error deleting exam center", "error");
    } finally {
      setIsSubmitting(false);
      setDeleteDialogOpen(false);
      setCenterToDelete(null);
    }
  };

  const validateForm = () => {
    let errors = {};
    
    // Only validate user information if we're adding a new center (not editing)
    if (!selectedCenter) {
      if (!formData.username) errors.username = "Username is required";
      if (!formData.email) errors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
      if (!formData.Fname) errors.Fname = "First Name is required";
      if (!formData.Lname) errors.Lname = "Last Name is required";
      
      // Only validate password if adding a new center
      if (!formData.password) {
        errors.password = "Password is required for new centers";
      }
    }
    
    // Always validate center information
    if (!formData.center_name) errors.center_name = "Center Name is required";
    if (!formData.area) errors.area = "Area is required";
    if (!formData.pincode) errors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode)) errors.pincode = "Pincode must be a 6-digit number";
    if (!formData.city) errors.city = "City is required";
    if (!formData.state) errors.state = "State is required";
  
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showSnackbar("Please correct the errors in the form", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Different payload structure based on whether we're adding or editing
      let payload;
      
      if (selectedCenter) {
        // For editing existing center, use a flat structure
        payload = {
          user: selectedCenter.user?.id,  // Include user ID as per your Postman example
          center_name: formData.center_name,
          pincode: formData.pincode,
          state: formData.state,
          city: formData.city,
          area: formData.area,
          status: formData.status
        };
      } else {
        // For new center, include both user and center information
        payload = {
          user: {
            username: formData.username,
            email: formData.email,
            Fname: formData.Fname,
            Lname: formData.Lname,
            password: formData.password,
          },
          exam_center: {
            center_name: formData.center_name,
            pincode: formData.pincode,
            state: formData.state,
            city: formData.city,
            area: formData.area,
            status: formData.status,
          },
        };
      }

      console.log("Submitting payload:", JSON.stringify(payload));
    
      if (selectedCenter) {
        await updateCenterManager(selectedCenter.id, payload);
        showSnackbar("Exam center updated successfully", "success");
      } else {
        await createCenterManager(payload);
        showSnackbar("Exam center created successfully", "success");
      }
      setIsModalOpen(false);
      fetchExamCenters();
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
      showSnackbar("Error saving exam center", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let updatedValue = type === "checkbox" ? checked : value;

    if (name === "pincode") {
      if (!/^\d*$/.test(value)) return; // Only allow digits
      if (value.length > 6) return; // Limit to 6 characters
      updatedValue = value; // Keep it as a string
    }

    setFormData({
      ...formData,
      [name]: updatedValue,
    });

    setValidationErrors({ ...validationErrors, [name]: "" });

    if (name === "pincode" && value.length === 6) {
      fetchPostalData(value);
    }
  };

  const fetchPostalData = async (pincode) => {
    setLoadingPincode(true);
    setPincodeStatus(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_POSTAL_API_URL}${pincode}`);
      if (response.data && response.data[0].Status === "Success") {
        const postOffice = response.data[0].PostOffice[0];
        setFormData((prevData) => ({
          ...prevData,
          city: postOffice.District,
          state: postOffice.State,
          pincode: pincode.toString(), // Ensure it's stored as a string
        }));
        setPincodeStatus("success");
        showSnackbar("Pincode details fetched successfully", "success");
      } else {
        setFormData((prevData) => ({
          ...prevData,
          city: "",
          state: "",
          pincode: pincode.toString(), // Ensure it's stored as a string
        }));
        setPincodeStatus("error");
        showSnackbar("Invalid pincode", "error");
      }
    } catch (error) {
      console.error("Error fetching postal data:", error);
      setFormData((prevData) => ({
        ...prevData,
        city: "",
        state: "",
        pincode: pincode.toString(), // Ensure it's stored as a string
      }));
      setPincodeStatus("error");
      showSnackbar("Error fetching postal data", "error");
    } finally {
      setLoadingPincode(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Render mobile card view
  const renderMobileCards = () => {
    return filteredCenters
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((center) => (
        <Card key={center.id} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', borderLeft: `4px solid ${center.status ? theme.palette.success.main : theme.palette.grey[400]}` }} elevation={2}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {center.center_name}
              </Typography>
              <Chip
                label={center.status ? "Active" : "Inactive"}
                color={center.status ? "success" : "default"}
                size="small"
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2">{`${center.area}, ${center.city}, ${center.state}`}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2">{center.pincode}</Typography>
            </Box>

            {center.user && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2">{center.user.email}</Typography>
              </Box>
            )}
          </CardContent>

          <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={center.status}
                    onChange={() => handleToggleStatus(center)}
                    size="small"
                    color="success"
                  />
                }
                label={<Typography variant="body2">Active</Typography>}
              />
            </Box>

            <Box>
              <Tooltip title="Edit Center">
                <IconButton color="primary" onClick={() => handleEditCenter(center)} size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete Center">
                <IconButton color="error" onClick={() => handleDeleteConfirmation(center)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </CardActions>
        </Card>
      ));
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
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            gap={2}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  fontSize: { xs: '1.75rem', sm: '2.125rem' }
                }}
              >
                Manage Exam Centers
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {filteredCenters.length} centers found
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddCenter}
              sx={{
                boxShadow: 2,
                textTransform: 'none',
                minWidth: { xs: '100%', sm: 'auto' }
              }}
            >
              Add New Center
            </Button>
          </Box>
        </Paper>

        {/* Search and Filters */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 2
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by name, city or state..."
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
                <Select value={filterStatus} onChange={handleFilterStatus} label="Status">
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Content - Centers Data */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={6} flexDirection="column" gap={2}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">Loading exam centers...</Typography>
            </Box>
          ) : filteredCenters.length === 0 ? (
            <Box p={3} textAlign="center">
              <Alert severity="info">No exam centers found matching your criteria</Alert>
            </Box>
          ) : (
            <>
              {isMobile ? (
                // Mobile view with cards
                <Box p={2}>
                  {renderMobileCards()}
                </Box>
              ) : (
                // Desktop view with table
                <TableContainer>
                  <Table size={isTablet ? "small" : "medium"}>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Center Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Pincode</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Manager</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 100 }} align="center">Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 120 }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCenters
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((center) => (
                          <TableRow
                            key={center.id}
                            hover
                            sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}
                          >
                            <TableCell>{center.center_name}</TableCell>
                            <TableCell>{`${center.area}, ${center.city}, ${center.state}`}</TableCell>
                            <TableCell>{center.pincode}</TableCell>
                            <TableCell>
                              {center.user ? (
                                <Box>
                                  <Typography variant="body2">{`${center.user.Fname} ${center.user.Lname}`}</Typography>
                                  <Typography variant="caption" color="text.secondary">{center.user.email}</Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">Not assigned</Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" alignItems="center" justifyContent="center">
                                <Switch
                                  checked={center.status}
                                  onChange={() => handleToggleStatus(center)}
                                  color="success"
                                  size="small"
                                />
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" justifyContent="center" gap={1}>
                                <Tooltip title="Edit Center">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleEditCenter(center)}
                                    size="small"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Center">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleDeleteConfirmation(center)}
                                    size="small"
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
                  count={filteredCenters.length}
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

        {/* Add/Edit Center Modal */}
        <Dialog
          open={isModalOpen}
          onClose={() => !isSubmitting && setIsModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight={600}>
              {selectedCenter ? "Edit Exam Center" : "Add New Exam Center"}
            </Typography>
          </DialogTitle>

          <DialogContent dividers>
            <form id="center-form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Show user information section only for new centers */}
                {!selectedCenter && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight={500} gutterBottom sx={{ color: 'primary.main' }}>
                        User Information
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Username"
                        variant="outlined"
                        required
                        fullWidth
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        error={!!validationErrors.username}
                        helperText={validationErrors.username}
                        disabled={isSubmitting}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Email"
                        variant="outlined"
                        required
                        fullWidth
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={!!validationErrors.email}
                        helperText={validationErrors.email}
                        disabled={isSubmitting}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Password"
                        variant="outlined"
                        required
                        fullWidth
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        error={!!validationErrors.password}
                        helperText={validationErrors.password || "Required for new centers"}
                        disabled={isSubmitting}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="First Name"
                        variant="outlined"
                        required
                        fullWidth
                        name="Fname"
                        value={formData.Fname}
                        onChange={handleInputChange}
                        error={!!validationErrors.Fname}
                        helperText={validationErrors.Fname}
                        disabled={isSubmitting}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Last Name"
                        variant="outlined"
                        required
                        fullWidth
                        name="Lname"
                        value={formData.Lname}
                        onChange={handleInputChange}
                        error={!!validationErrors.Lname}
                        helperText={validationErrors.Lname}
                        disabled={isSubmitting}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={500} gutterBottom sx={{ color: 'primary.main' }}>
                    Exam Center Information
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Center Name"
                    variant="outlined"
                    required
                    fullWidth
                    name="center_name"
                    value={formData.center_name}
                    onChange={handleInputChange}
                    error={!!validationErrors.center_name}
                    helperText={validationErrors.center_name}
                    disabled={isSubmitting}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Area"
                    variant="outlined"
                    required
                    fullWidth
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    error={!!validationErrors.area}
                    helperText={validationErrors.area}
                    disabled={isSubmitting}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Pincode"
                    variant="outlined"
                    required
                    fullWidth
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    error={!!validationErrors.pincode || pincodeStatus === 'error'}
                    helperText={
                      validationErrors.pincode ||
                      (loadingPincode ? "Loading location data..." :
                        pincodeStatus === 'error' ? "Invalid Pincode" : "")
                    }
                    InputProps={{
                      endAdornment: loadingPincode ? <CircularProgress size={20} /> : null,
                    }}
                    inputProps={{ maxLength: 6 }}
                    disabled={isSubmitting || loadingPincode}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="City"
                    variant="outlined"
                    required
                    fullWidth
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={!!validationErrors.city}
                    helperText={validationErrors.city}
                    disabled={isSubmitting}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="State"
                    variant="outlined"
                    required
                    fullWidth
                    name="state"
                    value={formData.state}
                    InputProps={{
                      readOnly: true,
                    }}
                    error={!!validationErrors.state}
                    helperText={validationErrors.state}
                    disabled={isSubmitting}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                        name="status"
                        color="success"
                        disabled={isSubmitting}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {formData.status ? "Active" : "Inactive"}
                      </Typography>
                    }
                  />
                </Grid>
              </Grid>
            </form>
          </DialogContent>

          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="outlined"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="center-form"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {selectedCenter ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}

        <Dialog
          open={deleteDialogOpen}
          onClose={() => !isSubmitting && setDeleteDialogOpen(false)}
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight={600}>
              Confirm Delete
            </Typography>
          </DialogTitle>

          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to delete the exam center?
            </Typography>
          </DialogContent>

          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteCenter}
              variant="contained"
              color="error"
              disabled={isSubmitting}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );

}

export default ManageCenter;

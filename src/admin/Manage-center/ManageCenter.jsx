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
  Modal,
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
} from "@mui/material";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import Layout from "../Admin/Layout";
import { createCenterManager, updateCenterManager, deleteCenterManager, getManageCenter } from "../../services/adminManageCenterApi";
import axios from 'axios';

const ManageCenter = () => {
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

  useEffect(() => {
    fetchExamCenters();
  }, []);

  useEffect(() => {
    // Update filteredCenters whenever examCenters, searchTerm, or filterStatus changes
    const filtered = examCenters.filter(
      (center) =>
        (center.center_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          center.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          center.state.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === "" || (filterStatus === "active" ? true : false) === center.status)
    );
    setFilteredCenters(filtered);
  }, [examCenters, searchTerm, filterStatus]);

  const fetchExamCenters = async () => {
    try {
      const response = await getManageCenter();
      setExamCenters(response);
    } catch (error) {
      showSnackbar("Error fetching exam centers", "error");
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
    setIsModalOpen(true);
  };

  const handleEditCenter = (center) => {
    setSelectedCenter(center);
    setFormData({
      username: center.user.username || "",
      email: center.user.email || "",
      password: "",
      Fname: center.user.Fname || "",
      Lname: center.user.Lname || "",
      center_name: center.center_name,
      pincode: center.pincode,
      state: center.state,
      city: center.city,
      area: center.area,
      status: center.status,
    });
    setValidationErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteCenter = async (centerId) => {
    if (window.confirm("Are you sure you want to delete this exam center?")) {
      try {
        await deleteCenterManager(centerId);
        setExamCenters(examCenters.filter((center) => center.id !== centerId));
        showSnackbar("Exam center deleted successfully", "success");
      } catch (error) {
        showSnackbar("Error deleting exam center", "error");
      }
    }
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.username) errors.username = "Username is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.Fname) errors.Fname = "First Name is required";
    if (!formData.Lname) errors.Lname = "Last Name is required";
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
      const payload = {
        user: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          Fname: formData.Fname,
          Lname: formData.Lname,
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
      showSnackbar("Error submitting form", "error");
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

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxWidth: "600px",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    padding: "20px",
    overflowY: "auto",
    maxHeight: "80vh",
  };

  return (
    <Layout>
      <Container>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Manage Exam Centers
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Add and manage exam centers for teacher assessments
            </Typography>
          </Box>
          <Button variant="contained" color="primary" startIcon={<FiPlus />} onClick={handleAddCenter}>
            Add New Center
          </Button>
        </Box>

        <Box display="flex" mb={4}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search exam centers..."
            InputProps={{
              startAdornment: <FiSearch style={{ marginRight: 8 }} />,
            }}
            value={searchTerm}
            onChange={handleSearch}
            style={{ marginRight: "20px" }}
          />
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filterStatus} onChange={handleFilterStatus} label="Status">
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Pincode</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCenters
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((center) => (
                  <TableRow key={center.id}>
                    <TableCell>{center.center_name}</TableCell>
                    <TableCell>{`${center.city}, ${center.state}`}</TableCell>
                    <TableCell>{center.pincode}</TableCell>
                    <TableCell>
                      <Chip label={center.status ? "Active" : "Inactive"} color={center.status ? "success" : "default"} />
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEditCenter(center)}>
                        <FiEdit2 />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleDeleteCenter(center.id)}>
                        <FiTrash2 />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCenters.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom>
              {selectedCenter ? "Edit Exam Center" : "Add New Exam Center"}
            </Typography>
            <form onSubmit={handleSubmit}>
              <Typography variant="subtitle1" gutterBottom>
                User Information
              </Typography>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Username"
                  variant="outlined"
                  required
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  error={!!validationErrors.username}
                  helperText={validationErrors.username}
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Email"
                  variant="outlined"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Password"
                  variant="outlined"
                  required
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </FormControl>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <FormControl fullWidth margin="normal" sx={{ mr: 1 }}>
                  <TextField
                    label="First Name"
                    variant="outlined"
                    required
                    name="Fname"
                    value={formData.Fname}
                    onChange={handleInputChange}
                    error={!!validationErrors.Fname}
                    helperText={validationErrors.Fname}
                  />
                </FormControl>
                <FormControl fullWidth margin="normal" sx={{ ml: 1 }}>
                  <TextField
                    label="Last Name"
                    variant="outlined"
                    required
                    name="Lname"
                    value={formData.Lname}
                    onChange={handleInputChange}
                    error={!!validationErrors.Lname}
                    helperText={validationErrors.Lname}
                  />
                </FormControl>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Exam Center Information
              </Typography>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Center Name"
                  variant="outlined"
                  required
                  name="center_name"
                  value={formData.center_name}
                  onChange={handleInputChange}
                  error={!!validationErrors.center_name}
                  helperText={validationErrors.center_name}
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Area"
                  variant="outlined"
                  required
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  error={!!validationErrors.area}
                  helperText={validationErrors.area}
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Pincode"
                  variant="outlined"
                  required
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  error={!!validationErrors.pincode || pincodeStatus === 'error'}
                  helperText={validationErrors.pincode || (pincodeStatus === 'error' ? "Invalid Pincode" : "")}
                  inputProps={{ maxLength: 6 }}
                />
                {loadingPincode && <Typography variant="caption">Loading...</Typography>}
              </FormControl>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <FormControl fullWidth margin="normal" sx={{ mr: 1 }}>
                  <TextField
                    label="City"
                    variant="outlined"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={!!validationErrors.city}
                    helperText={validationErrors.city}
                  />
                </FormControl>
                <FormControl fullWidth margin="normal" sx={{ ml: 1 }}>
                  <TextField
                    label="State"
                    variant="outlined"
                    required
                    name="state"
                    value={formData.state}
                    InputProps={{
                      readOnly: true,
                    }}
                    onChange={handleInputChange}
                    error={!!validationErrors.state}
                    helperText={validationErrors.state}
                  />
                </FormControl>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                    name="status"
                    color="primary"
                  />
                }
                label="Active"
              />
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button onClick={() => setIsModalOpen(false)} sx={{ mr: 2 }}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {selectedCenter ? "Update" : "Add"} Center
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>

        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default ManageCenter;
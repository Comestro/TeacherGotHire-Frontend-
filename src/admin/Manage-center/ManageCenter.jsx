import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Breadcrumbs,
  Link,
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
import axios from 'axios'; // Import axios for API calls

const ManageCenter = () => {
  const [examCenters, setExamCenters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    // User Data
    username: "",
    email: "",
    password: "",
    Fname: "",
    Lname: "",
    // Exam Center Data
    center_name: "",
    pincode: "",
    state: "",
    city: "",
    area: "",
    status: false,
  });

  useEffect(() => {
    fetchExamCenters();
  }, []);

  const fetchExamCenters = async () => {
    try {
      const response = await getManageCenter();
      setExamCenters(response.data);
    } catch (error) {
      console.error("Error fetching exam centers:", error);
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

  const filteredCenters = examCenters.filter(
    (center) =>
      (center.center_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.state.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "" || (filterStatus === "active" ? true : false) === center.status)
  );

  const handleAddCenter = () => {
    setSelectedCenter(null);
    setFormData({
      // User Data
      username: "",
      email: "",
      password: "",
      Fname: "",
      Lname: "",
      // Exam Center Data
      center_name: "",
      pincode: "",
      state: "",
      city: "",
      area: "",
      status: false,
    });
    setIsModalOpen(true);
  };

  const handleEditCenter = (center) => {
    setSelectedCenter(center);
    setFormData({
      // User Data (Assuming you can edit user data as well)
      username: center.user.username || "", // Adjust if your response has different user fields
      email: center.user.email || "",
      password: "", // Don't pre-fill password for security
      Fname: center.user.Fname || "",
      Lname: center.user.Lname || "",
      // Exam Center Data
      center_name: center.center_name,
      pincode: center.pincode,
      state: center.state,
      city: center.city,
      area: center.area,
      status: center.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteCenter = async (centerId) => {
    if (window.confirm("Are you sure you want to delete this exam center?")) {
      try {
        await deleteCenterManager(centerId);
        setExamCenters(examCenters.filter((center) => center.id !== centerId));
      } catch (error) {
        console.error("Error deleting exam center:", error);
        // Optionally display an error message to the user
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        // Update existing center (You might need a different API for this)
        await updateCenterManager(selectedCenter.id, payload);
        setExamCenters(
          examCenters.map((center) =>
            center.id === selectedCenter.id ? { ...center, ...payload.exam_center, user: payload.user } : center
          )
        );
      } else {
        // Create new center
        const response = await createCenterManager(payload);
        setExamCenters([...examCenters, response.data]); // Assuming API returns the created center
      }
      setIsModalOpen(false);
      fetchExamCenters(); // Refresh the list
    } catch (error) {
      console.error("Error submitting form:", error);
      // Optionally display an error message to the user
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (name === "pincode") {
      // Fetch state and city based on pincode
      fetchPostalData(value);
    }
  };

  const fetchPostalData = async (pincode) => {
    if (pincode.length === 6) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_POSTAL_API_URL}${pincode}`);
        if (response.data && response.data[0].Status === "Success") {
          // Assuming the first post office is the relevant one
          const postOffice = response.data[0].PostOffice[0];
          setFormData({
            ...formData,
            city: postOffice.District,
            state: postOffice.State,
          });
        } else {
          console.error("Invalid pincode");
          setFormData({
            ...formData,
            city: "",
            state: "",
          });
        }
      } catch (error) {
        console.error("Error fetching postal data:", error);
        setFormData({
          ...formData,
          city: "",
          state: "",
        });
      }
    } else {
      setFormData({
        ...formData,
        city: "",
        state: "",
      });
    }
  };

  return (
    <Layout>
      <Container>
        {/* Header Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Manage Exam Centers
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Add and manage exam centers for teacher assessments
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FiPlus />}
            onClick={handleAddCenter}
          >
            Add New Center
          </Button>
        </Box>

        {/* Search and Filter Section */}
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
            <Select
              value={filterStatus}
              onChange={handleFilterStatus}
              label="Status"
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Exam Centers Table */}
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
                      <Chip
                        label={center.status ? "Active" : "Inactive"}
                        color={center.status ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditCenter(center)}
                      >
                        <FiEdit2 />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleDeleteCenter(center.id)}
                      >
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

        {/* Add/Edit Modal */}
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom>
              {selectedCenter ? "Edit Exam Center" : "Add New Exam Center"}
            </Typography>
            <form onSubmit={handleSubmit}>
              {/* User Information */}
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
                />
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
                  />
                </FormControl>
              </Box>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Pincode"
                  variant="outlined"
                  required
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                />
              </FormControl>
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
      </Container>
    </Layout>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%", // Make the modal responsive
  maxWidth: "600px", // Set a maximum width for larger screens
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  overflowY: "auto",
};

export default ManageCenter;
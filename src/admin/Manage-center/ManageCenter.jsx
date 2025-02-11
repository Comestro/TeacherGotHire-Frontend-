import React, { useState } from "react";
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

const dummyExamCenters = [
  {
    id: 1,
    name: "City Central Testing Hub",
    address: "123 MG Road",
    city: "Mumbai",
    state: "MH",
    zipCode: "400001",
    capacity: 200,
    contactPerson: "Rajesh Kumar",
    contactEmail: "rajesh@example.com",
    contactPhone: "(91) 98765-43210",
    status: "active",
    scheduledExams: [
      { id: 1, date: new Date(), title: "Mathematics Assessment" },
      { id: 2, date: new Date(), title: "Science Evaluation" },
    ],
  },
  {
    id: 2,
    name: "Downtown Assessment Center",
    address: "456 Park Street",
    city: "Delhi",
    state: "DL",
    zipCode: "110001",
    capacity: 150,
    contactPerson: "Anita Sharma",
    contactEmail: "anita@example.com",
    contactPhone: "(91) 87654-32109",
    status: "inactive",
    scheduledExams: [],
  },
];

const states = [
  "AP",
  "AR",
  "AS",
  "BR",
  "CT",
  "GA",
  "GJ",
  "HR",
  "HP",
  "JK",
  "JH",
  "KA",
  "KL",
  "MP",
  "MH",
  "MN",
  "ML",
  "MZ",
  "NL",
  "OR",
  "PB",
  "RJ",
  "SK",
  "TN",
  "TG",
  "TR",
  "UP",
  "UT",
  "WB",
  "AN",
  "CH",
  "DH",
  "DD",
  "LD",
  "DL",
  "PY",
];

const ManageCenter = () => {
  const [examCenters, setExamCenters] = useState(dummyExamCenters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    capacity: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    status: "active",
  });

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
      (center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.state.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "" || center.status === filterStatus)
  );

  const handleAddCenter = () => {
    setSelectedCenter(null);
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      capacity: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleEditCenter = (center) => {
    setSelectedCenter(center);
    setFormData(center);
    setIsModalOpen(true);
  };

  const handleDeleteCenter = (centerId) => {
    if (window.confirm("Are you sure you want to delete this exam center?")) {
      setExamCenters(examCenters.filter((center) => center.id !== centerId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCenter) {
      setExamCenters(
        examCenters.map((center) =>
          center.id === selectedCenter.id
            ? { ...formData, id: center.id }
            : center
        )
      );
    } else {
      setExamCenters([...examCenters, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
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
                <TableCell>Capacity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCenters
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((center) => (
                  <TableRow key={center.id}>
                    <TableCell>{center.name}</TableCell>
                    <TableCell>{`${center.city}, ${center.state}`}</TableCell>
                    <TableCell>{center.capacity}</TableCell>
                    <TableCell>
                      <Chip
                        label={center.status}
                        color={
                          center.status === "active" ? "success" : "default"
                        }
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
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Center Name"
                  variant="outlined"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Address"
                  variant="outlined"
                  required
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </FormControl>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <FormControl fullWidth margin="normal" sx={{ mr: 1 }}>
                  <TextField
                    label="City"
                    variant="outlined"
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl fullWidth margin="normal" sx={{ ml: 1 }}>
                  <InputLabel>State</InputLabel>
                  <Select
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    required
                  >
                    <MenuItem value="">
                      <em>Select State</em>
                    </MenuItem>
                    {states.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
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
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default ManageCenter;

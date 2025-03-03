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
import { Edit, Delete, Visibility } from "@mui/icons-material";
import Layout from "../Admin/Layout";
import { getQuestionsManager, adminManageAssignedUserManager, updateAssignedUserManager, deleteAssignedUserManager } from "../../services/adminManageQuestionManager";
import { getSubjects } from "../../services/adminSubujectApi";

const ManageQuestionManager = () => {
  const [openModal, setOpenModal] = useState(false);
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [status, setStatus] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("");
  const [newUserData, setNewUserData] = useState({
    email: "",
    Fname: "",
    Lname: "",
    password: "",
  });

  useEffect(() => {
    fetchManagers();
    fetchSubjects();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await getQuestionsManager();
      setManagers(response);
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await getSubjects();
      setAvailableSubjects(response);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleSave = async () => {
    try {
      const payload = {
        user: {
          email: newUserData.email,
          Fname: newUserData.Fname,
          Lname: newUserData.Lname,
          password: newUserData.password,
        },
        subject: subjects,
      };
      await adminManageAssignedUserManager(payload);
      setOpenSnackbar(true);
      fetchManagers(); // Refresh data after successful save
      handleCloseModal();
    } catch (error) {
      console.error("Error creating user:", error);
      // Handle error appropriately (e.g., display an error message)
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
  };

  const filteredManagers = Array.isArray(managers)
    ? managers.filter((manager) => {
      const fullName = `${manager.user.Fname} ${manager.user.Lname}`.toLowerCase();
      const searchTermLower = searchTerm.toLowerCase();

      const subjectMatch = manager.subject.some((subject) =>
        subject.subject_name.toLowerCase().includes(searchTermLower)
      );

      return (
        (fullName.includes(searchTermLower) || subjectMatch) &&
        (filterStatus === "" || (filterStatus === "active" ? true : false) === manager.user.is_verified)
      );
    })
    : [];

  const handleInputChange = (e) => {
    setNewUserData({ ...newUserData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <Container>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Question Manager Assignment
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenModal}
            startIcon={<Edit />}
          >
            + Assign Manager
          </Button>
        </Box>
        <Box display="flex" mb={4}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            style={{ marginRight: "20px" }}
            value={searchTerm}
            onChange={handleSearch}
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Manager Name</TableCell>
                <TableCell>Assigned Subjects</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredManagers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((manager) => (
                  <TableRow key={manager.user.id}>
                    <TableCell>
                      <Link href={`/manager/${manager.user.id}`} color="inherit">
                        {manager.user.Fname} {manager.user.Lname}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {manager.subject.map((sub) => (
                        <div key={sub.id}>
                          {sub.subject_name} (Class {sub.class_category})
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={manager.user.is_verified ? "Active" : "Inactive"}
                        color={manager.user.is_verified ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton>
                        <Edit />
                      </IconButton>
                      <IconButton>
                        <Delete />
                      </IconButton>
                      <IconButton>
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredManagers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={{ ...modalStyle }}>
            <Typography variant="h6" gutterBottom>
              Assign Question Manager
            </Typography>
            <TextField
              label="First Name"
              name="Fname"
              fullWidth
              margin="normal"
              onChange={handleInputChange}
            />
            <TextField
              label="Last Name"
              name="Lname"
              fullWidth
              margin="normal"
              onChange={handleInputChange}
            />
            <TextField
              label="Email"
              name="email"
              fullWidth
              margin="normal"
              onChange={handleInputChange}
            />
            <TextField
              label="Password"
              name="password"
              fullWidth
              margin="normal"
              type="password"
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Assign Subject(s)</InputLabel>
              {Array.isArray(availableSubjects) ? (
                <Select
                  multiple
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                      {selected.map((value) => (
                        <Chip key={value} label={
                          availableSubjects.find(sub => sub.id === value)?.subject_name || value
                        } sx={{ margin: "2px" }} />
                      ))}
                    </Box>
                  )}
                >
                  {availableSubjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.subject_name} (Class {subject.class_category})
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                <Typography>Loading subjects...</Typography>
              )}
            </FormControl>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <Button onClick={handleCloseModal} sx={{ marginRight: "10px" }}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save
              </Button>
            </Box>
          </Box>
        </Modal>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity="success">
            Manager assigned successfully!
          </Alert>
        </Snackbar>
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

export default ManageQuestionManager;
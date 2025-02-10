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
import { Edit, Delete, Visibility } from "@mui/icons-material";
import Layout from "../Admin/Layout";

const dummyManagers = [
  {
    id: 1,
    name: "Amit Sharma",
    subjects: ["Math", "Science"],
    totalQuestions: 120,
    status: true,
    assignmentDate: "2023-01-15",
  },
  {
    id: 2,
    name: "Priya Singh",
    subjects: ["English", "History"],
    totalQuestions: 80,
    status: false,
    assignmentDate: "2023-02-10",
  },
  {
    id: 3,
    name: "Ravi Kumar",
    subjects: ["Geography", "Civics"],
    totalQuestions: 50,
    status: true,
    assignmentDate: "2023-03-05",
  },
];

const ManageQuestionManager = () => {
  const [openModal, setOpenModal] = useState(false);
  const [managers, setManagers] = useState(dummyManagers);
  const [selectedManager, setSelectedManager] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [status, setStatus] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("");

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleSave = () => {
    // Save logic here
    setOpenSnackbar(true);
    handleCloseModal();
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

  const filteredManagers = managers.filter(
    (manager) =>
      (manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.subjects.some((subject) =>
          subject.toLowerCase().includes(searchTerm.toLowerCase())
        )) &&
      (filterStatus === "" || manager.status === (filterStatus === "active"))
  );

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
                <TableCell>Total Questions Added</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assignment Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredManagers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((manager) => (
                  <TableRow key={manager.id}>
                    <TableCell>
                      <Link href={`/manager/${manager.id}`} color="inherit">
                        {manager.name}
                      </Link>
                    </TableCell>
                    <TableCell>{manager.subjects.join(", ")}</TableCell>
                    <TableCell>{manager.totalQuestions}</TableCell>
                    <TableCell>
                      <Chip
                        label={manager.status ? "Active" : "Inactive"}
                        color={manager.status ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>{manager.assignmentDate}</TableCell>
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
            <FormControl fullWidth margin="normal">
              <InputLabel>Select User</InputLabel>
              <Select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
              >
                {/* Map through users */}
                <MenuItem value={1}>User 1</MenuItem>
                <MenuItem value={2}>User 2</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Assign Subject(s)</InputLabel>
              <Select
                multiple
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} sx={{ margin: "2px" }} />
                    ))}
                  </Box>
                )}
              >
                {/* Map through subjects */}
                <MenuItem value="Math">Math</MenuItem>
                <MenuItem value="Science">Science</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                />
              }
              label="Active"
            />
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

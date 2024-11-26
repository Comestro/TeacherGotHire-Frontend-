import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Box,
  Chip,
  Snackbar,
  Tooltip,
  Switch,
  TablePagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
} from "@mui/icons-material";
import Layout from "../Admin/Layout";

const ManageTeacher = () => {
  const [teachers, setTeachers] = useState([
    {
      id: 1,
      name: "Amit Sharma",
      email: "amit.sharma@example.com",
      qualification: "PhD",
      subjects: ["Math", "Science"],
      location: "Delhi",
      status: "Approved",
      score: 95,
    },
    {
      id: 2,
      name: "Priya Singh",
      email: "priya.singh@example.com",
      qualification: "Masters",
      subjects: ["English"],
      location: "Mumbai",
      status: "Pending",
      score: 88,
    },
    {
      id: 3,
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      qualification: "Bachelors",
      subjects: ["History"],
      location: "Bangalore",
      status: "Rejected",
      score: 72,
    },
    {
      id: 4,
      name: "Anjali Verma",
      email: "anjali.verma@example.com",
      qualification: "PhD",
      subjects: ["Physics"],
      location: "Chennai",
      status: "Approved",
      score: 90,
    },
    {
      id: 5,
      name: "Vikram Patel",
      email: "vikram.patel@example.com",
      qualification: "Masters",
      subjects: ["Chemistry"],
      location: "Hyderabad",
      status: "Pending",
      score: 85,
    },
    {
      id: 6,
      name: "Sneha Gupta",
      email: "sneha.gupta@example.com",
      qualification: "Bachelors",
      subjects: ["Biology", "Math"],
      location: "Pune",
      status: "Rejected",
      score: 70,
    },
    {
      id: 7,
      name: "Arjun Reddy",
      email: "arjun.reddy@example.com",
      qualification: "PhD",
      subjects: ["Math"],
      location: "Kolkata",
      status: "Approved",
      score: 92,
    },
    {
      id: 8,
      name: "Meera Nair",
      email: "meera.nair@example.com",
      qualification: "Masters",
      subjects: ["English", "History"],
      location: "Kochi",
      status: "Pending",
      score: 87,
    },
    {
      id: 9,
      name: "Ravi Shankar",
      email: "ravi.shankar@example.com",
      qualification: "Bachelors",
      subjects: ["Geography"],
      location: "Jaipur",
      status: "Rejected",
      score: 68,
    },
    {
      id: 10,
      name: "Kiran Desai",
      email: "kiran.desai@example.com",
      qualification: "PhD",
      subjects: ["Economics"],
      location: "Ahmedabad",
      status: "Approved",
      score: 94,
    },
    {
      id: 11,
      name: "Lakshmi Iyer",
      email: "lakshmi.iyer@example.com",
      qualification: "Masters",
      subjects: ["Political Science"],
      location: "Thiruvananthapuram",
      status: "Pending",
      score: 86,
    },
    {
      id: 12,
      name: "Suresh Menon",
      email: "suresh.menon@example.com",
      qualification: "Bachelors",
      subjects: ["Sociology"],
      location: "Bhopal",
      status: "Rejected",
      score: 75,
    },
  ]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQualification, setSelectedQualification] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleAddTeacher = () => {
    setCurrentTeacher(null);
    setIsEditModalOpen(true);
  };

  const handleEditTeacher = (teacher) => {
    setCurrentTeacher(teacher);
    setIsEditModalOpen(true);
  };

  const handleViewTeacher = (teacher) => {
    setCurrentTeacher(teacher);
    setIsViewModalOpen(true);
  };

  const handleDeleteTeacher = (teacherId) => {
    setTeachers(teachers.filter((teacher) => teacher.id !== teacherId));
    setNotification({
      open: true,
      message: "Teacher deleted successfully.",
      type: "success",
    });
  };

  const handleBulkDelete = () => {
    setTeachers(
      teachers.filter((teacher) => !selectedTeachers.includes(teacher.id))
    );
    setSelectedTeachers([]);
    setNotification({
      open: true,
      message: "Selected teachers deleted successfully.",
      type: "success",
    });
  };

  const handleSaveTeacher = () => {
    // Add save logic here
    setIsEditModalOpen(false);
    setNotification({
      open: true,
      message: "Teacher saved successfully.",
      type: "success",
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportData = () => {
    const csvContent = [
      [
        "ID",
        "Name",
        "Email",
        "Qualification",
        "Subjects",
        "Location",
        "Status",
        "Score",
      ],
      ...teachers.map((teacher) => [
        teacher.id,
        teacher.name,
        teacher.email,
        teacher.qualification,
        teacher.subjects.join(", "),
        teacher.location,
        teacher.status,
        teacher.score,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "teachers_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTeachers = teachers.filter((teacher) => {
    return (
      (teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.id.toString().includes(searchQuery)) &&
      (selectedQualification
        ? teacher.qualification.toLowerCase() ===
          selectedQualification.toLowerCase()
        : true) &&
      (selectedSubject ? teacher.subjects.includes(selectedSubject) : true) &&
      (selectedLocation
        ? teacher.location.toLowerCase() === selectedLocation.toLowerCase()
        : true) &&
      (selectedStatus
        ? teacher.status.toLowerCase() === selectedStatus.toLowerCase()
        : true)
    );
  });

  return (
    <Layout>
      <Container>
        <Typography variant="h4" gutterBottom>
          Manage Teachers
        </Typography>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTeacher}
          >
            Add Teacher
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ExportIcon />}
            onClick={handleExportData}
          >
            Export Data
          </Button>
        </Box>
        <Box mt={2} mb={2}>
          <TextField
            label="Search Teachers"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Qualification</InputLabel>
            <Select
              label="Qualification"
              value={selectedQualification}
              onChange={(e) => setSelectedQualification(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="phd">PhD</MenuItem>
              <MenuItem value="masters">Masters</MenuItem>
              <MenuItem value="bachelors">Bachelors</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Subject Expertise</InputLabel>
            <Select
              label="Subject Expertise"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="math">Math</MenuItem>
              <MenuItem value="science">Science</MenuItem>
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="history">History</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Location</InputLabel>
            <Select
              label="Location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="delhi">Delhi</MenuItem>
              <MenuItem value="mumbai">Mumbai</MenuItem>
              <MenuItem value="bangalore">Bangalore</MenuItem>
              <MenuItem value="chennai">Chennai</MenuItem>
              <MenuItem value="hyderabad">Hyderabad</MenuItem>
              <MenuItem value="pune">Pune</MenuItem>
              <MenuItem value="kolkata">Kolkata</MenuItem>
              <MenuItem value="kochi">Kochi</MenuItem>
              <MenuItem value="jaipur">Jaipur</MenuItem>
              <MenuItem value="ahmedabad">Ahmedabad</MenuItem>
              <MenuItem value="thiruvananthapuram">Thiruvananthapuram</MenuItem>
              <MenuItem value="bhopal">Bhopal</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email Address</TableCell>
              <TableCell>Qualification</TableCell>
              <TableCell>Subjects Taught</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Skill Test Score</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTeachers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedTeachers.includes(teacher.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTeachers([
                            ...selectedTeachers,
                            teacher.id,
                          ]);
                        } else {
                          setSelectedTeachers(
                            selectedTeachers.filter((id) => id !== teacher.id)
                          );
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.qualification}</TableCell>
                  <TableCell>{teacher.subjects.join(", ")}</TableCell>
                  <TableCell>{teacher.location}</TableCell>
                  <TableCell>
                    <Switch
                      checked={teacher.status === "Approved"}
                      onChange={() => {
                        const newStatus =
                          teacher.status === "Approved"
                            ? "Rejected"
                            : "Approved";
                        setTeachers(
                          teachers.map((t) =>
                            t.id === teacher.id
                              ? { ...t, status: newStatus }
                              : t
                          )
                        );
                      }}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>{teacher.score}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewTeacher(teacher)}>
                      <ViewIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEditTeacher(teacher)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteTeacher(teacher.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredTeachers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleBulkDelete}
        >
          Delete Selected
        </Button>
        <Dialog
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <DialogTitle>
            {currentTeacher ? "Edit Teacher" : "Add Teacher"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Full Name"
              variant="outlined"
              fullWidth
              margin="normal"
              defaultValue={currentTeacher ? currentTeacher.name : ""}
            />
            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              margin="normal"
              defaultValue={currentTeacher ? currentTeacher.email : ""}
            />
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Qualification</InputLabel>
              <Select
                label="Qualification"
                defaultValue={
                  currentTeacher ? currentTeacher.qualification : ""
                }
              >
                <MenuItem value="phd">PhD</MenuItem>
                <MenuItem value="masters">Masters</MenuItem>
                <MenuItem value="bachelors">Bachelors</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Subjects Taught</InputLabel>
              <Select
                label="Subjects Taught"
                multiple
                defaultValue={currentTeacher ? currentTeacher.subjects : []}
                renderValue={(selected) => (
                  <Box display="flex" flexWrap="wrap">
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="math">Math</MenuItem>
                <MenuItem value="science">Science</MenuItem>
                <MenuItem value="english">English</MenuItem>
                <MenuItem value="history">History</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Location"
              variant="outlined"
              fullWidth
              margin="normal"
              defaultValue={currentTeacher ? currentTeacher.location : ""}
            />
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                defaultValue={currentTeacher ? currentTeacher.status : ""}
              >
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditModalOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveTeacher} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        >
          <DialogTitle>View Teacher</DialogTitle>
          <DialogContent>
            <Typography variant="h6">
              Full Name: {currentTeacher?.name}
            </Typography>
            <Typography variant="h6">
              Email Address: {currentTeacher?.email}
            </Typography>
            <Typography variant="h6">
              Qualification: {currentTeacher?.qualification}
            </Typography>
            <Typography variant="h6">
              Subjects Taught: {currentTeacher?.subjects.join(", ")}
            </Typography>
            <Typography variant="h6">
              Location: {currentTeacher?.location}
            </Typography>
            <Typography variant="h6">
              Status: {currentTeacher?.status}
            </Typography>
            <Typography variant="h6">
              Skill Test Score: {currentTeacher?.score}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsViewModalOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          message={notification.message}
          severity={notification.type}
        />
      </Container>
    </Layout>
  );
};

export default ManageTeacher;

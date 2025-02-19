import React, { useState, useEffect } from "react";
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
import { getTeacher } from "../../services/adminTeacherApi";
import { Link } from "react-router-dom";

const ManageTeacher = () => {
  const [teachers, setTeachers] = useState([]);
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

  // fetching teacher data

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await getTeacher();
        if (Array.isArray(response)) {
          setTeachers(response);
        } else {
          console.error("Error fetching teacher data: ", response);
        }
      } catch (error) {
        console.error("Error fetching teacher data: ", error);
      }
    };
    fetchTeacherData();
  }, []);

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
        "First Name",
        "Last Name",
        "Email",
        "Subjects",
        "Address",
        "Qualifications",
        "Total Marks",
      ],
      ...teachers.map((teacher) => [
        teacher.id,
        teacher.Fname,
        teacher.Lname,
        teacher.email,
        teacher.teachersubjects.join(", "),
        teacher.teachersaddress.map((address) => address.state).join(", "),
        teacher.teacherqualifications
          .map((q) => q.qualification.name)
          .join(", "),
        teacher.total_marks,
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
      (teacher.Fname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.Lname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.id.toString().includes(searchQuery)) &&
      (selectedQualification
        ? teacher.teacherqualifications
          .map((q) => q.qualification.name.toLowerCase())
          .includes(selectedQualification.toLowerCase())
        : true) &&
      (selectedSubject
        ? teacher.teachersubjects.includes(selectedSubject)
        : true) &&
      (selectedLocation
        ? teacher.teachersaddress
          .map((a) => a.state.toLowerCase())
          .includes(selectedLocation.toLowerCase())
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
                  <TableCell>{`${teacher.Fname} ${teacher.Lname}`}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>
                    {teacher.teacherqualifications
                      .map((q) => q.qualification.name)
                      .join(", ")}
                  </TableCell>
                  <TableCell>{teacher.teachersubjects.join(", ")}</TableCell>
                  <TableCell>
                    {teacher.teachersaddress.map((address) => address.state).join(", ")}
                  </TableCell>
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
                  <TableCell>
                    <IconButton onClick={() => handleViewTeacher(teacher)}>
                      <Link to={`/admin/view/teacher/${teacher.id}`}>
                        <ViewIcon />
                      </Link>
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
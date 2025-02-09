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
import {
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../../services/adminTeacherApi";
import Loader from "../../components/Loader";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await getTeacher();
        if (Array.isArray(response)) {
          setTeachers(response);
        } else {
          console.error("Unexpected response structure:", response);
        }
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

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
  };

  const handleDeleteTeacher = async (teacherId) => {
    try {
      await deleteTeacher(teacherId);
      setTeachers(teachers.filter((teacher) => teacher.id !== teacherId));
      setNotification({
        open: true,
        message: "Teacher deleted successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to delete teacher:", error);
      setNotification({
        open: true,
        message: "Failed to delete teacher.",
        type: "error",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedTeachers.map((id) => deleteTeacher(id)));
      setTeachers(
        teachers.filter((teacher) => !selectedTeachers.includes(teacher.id))
      );
      setSelectedTeachers([]);
      setNotification({
        open: true,
        message: "Selected teachers deleted successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to delete selected teachers:", error);
      setNotification({
        open: true,
        message: "Failed to delete selected teachers.",
        type: "error",
      });
    }
  };

  const handleSaveTeacher = async () => {
    const teacherData = {
      Fname: currentTeacher.Fname,
      Lname: currentTeacher.Lname,
      email: currentTeacher.email,
      qualification: currentTeacher.teacherqualifications.map(
        (q) => q.qualification.name
      ),
      subjects: currentTeacher.teacherskill.map((s) => s.skill.name),
      location: currentTeacher.teachersaddress[0]?.state || "N/A",
      status: "Approved", // Default status
    };

    try {
      if (currentTeacher.id) {
        const response = await updateTeacher(currentTeacher.id, teacherData);
        setTeachers(
          teachers.map((t) => (t.id === currentTeacher.id ? response.data : t))
        );
      } else {
        const response = await createTeacher(teacherData);
        setTeachers([...teachers, response.data]);
      }
      setIsEditModalOpen(false);
      setNotification({
        open: true,
        message: "Teacher saved successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to save teacher:", error);
      setNotification({
        open: true,
        message: "Failed to save teacher.",
        type: "error",
      });
    }
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
        `${teacher.Fname} ${teacher.Lname}`,
        teacher.email,
        teacher.teacherqualifications
          .map((q) => q.qualification.name)
          .join(", "),
        teacher.teacherskill.map((s) => s.skill.name).join(", "),
        teacher.teachersaddress[0]?.state || "N/A",
        "Approved", // Default status
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

  const filteredTeachers = (teachers || []).filter((teacher) => {
    const fullName = `${teacher.Fname} ${teacher.Lname}`.toLowerCase();
    return (
      (fullName.includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.id.toString().includes(searchQuery)) &&
      (selectedQualification
        ? teacher.teacherqualifications.some(
            (q) =>
              q.qualification.name.toLowerCase() ===
              selectedQualification.toLowerCase()
          )
        : true) &&
      (selectedSubject
        ? teacher.teacherskill.some(
            (s) => s.skill.name.toLowerCase() === selectedSubject.toLowerCase()
          )
        : true) &&
      (selectedLocation
        ? teacher.teachersaddress[0]?.state.toLowerCase() ===
          selectedLocation.toLowerCase()
        : true) &&
      (selectedStatus
        ? "Approved".toLowerCase() === selectedStatus.toLowerCase()
        : true)
    );
  });

  if (loading) {
    return <Loader />;
  }

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
              <MenuItem value="B.Ed">B.Ed</MenuItem>
              <MenuItem value="M.Ed">M.Ed</MenuItem>
              <MenuItem value="PhD">PhD</MenuItem>
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
              <MenuItem value="Python">Python</MenuItem>
              <MenuItem value="Java">Java</MenuItem>
              <MenuItem value="Mathematics">Mathematics</MenuItem>
              <MenuItem value="Physics">Physics</MenuItem>
              <MenuItem value="History">History</MenuItem>
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
              <MenuItem value="Bihar">Bihar</MenuItem>
              <MenuItem value="Delhi">Delhi</MenuItem>
              <MenuItem value="Mumbai">Mumbai</MenuItem>
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
              .map((teacher, index) => (
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
                      .slice(0, 2)
                      .map((q) => q.qualification.name)
                      .join(", ")}
                  </TableCell>
                  <TableCell>
                    {teacher.teacherskill
                      .slice(0, 2)
                      .map((s) => s.skill.name)
                      .join(", ")}
                  </TableCell>
                  <TableCell>
                    {teacher.teachersaddress[0]?.state || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={true} // Default status
                      onChange={() => {}}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>{teacher.total_marks}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewTeacher(teacher)}>
                      <Link
                        to={`/admin/view/teacher/${teacher.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <ViewIcon />
                      </Link>
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
        {/* add/edit modal */}
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
              defaultValue={
                currentTeacher
                  ? `${currentTeacher.Fname} ${currentTeacher.Lname}`
                  : ""
              }
              onChange={(e) => {
                const [Fname, Lname] = e.target.value.split(" ");
                setCurrentTeacher({ ...currentTeacher, Fname, Lname });
              }}
            />
            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              margin="normal"
              defaultValue={currentTeacher ? currentTeacher.email : ""}
              onChange={(e) =>
                setCurrentTeacher({ ...currentTeacher, email: e.target.value })
              }
            />
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Qualification</InputLabel>
              <Select
                label="Qualification"
                multiple
                defaultValue={
                  currentTeacher
                    ? currentTeacher.teacherqualifications.map(
                        (q) => q.qualification.name
                      )
                    : []
                }
                onChange={(e) =>
                  setCurrentTeacher({
                    ...currentTeacher,
                    teacherqualifications: e.target.value.map((name) => ({
                      qualification: { name },
                    })),
                  })
                }
                renderValue={(selected) => (
                  <Box display="flex" flexWrap="wrap">
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="B.Ed">B.Ed</MenuItem>
                <MenuItem value="M.Ed">M.Ed</MenuItem>
                <MenuItem value="PhD">PhD</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Subjects Taught</InputLabel>
              <Select
                label="Subjects Taught"
                multiple
                defaultValue={
                  currentTeacher
                    ? currentTeacher.teacherskill.map((s) => s.skill.name)
                    : []
                }
                onChange={(e) =>
                  setCurrentTeacher({
                    ...currentTeacher,
                    teacherskill: e.target.value.map((name) => ({
                      skill: { name },
                    })),
                  })
                }
                renderValue={(selected) => (
                  <Box display="flex" flexWrap="wrap">
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="Python">Python</MenuItem>
                <MenuItem value="Java">Java</MenuItem>
                <MenuItem value="Mathematics">Mathematics</MenuItem>
                <MenuItem value="Physics">Physics</MenuItem>
                <MenuItem value="History">History</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Location"
              variant="outlined"
              fullWidth
              margin="normal"
              defaultValue={
                currentTeacher ? currentTeacher.teachersaddress[0]?.state : ""
              }
              onChange={(e) =>
                setCurrentTeacher({
                  ...currentTeacher,
                  teachersaddress: [{ state: e.target.value }],
                })
              }
            />
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
        {/* view modal */}
        <Dialog
          open={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        >
          <DialogTitle>View Teacher</DialogTitle>
          <DialogContent>
            <Typography variant="h6">
              Full Name: {`${currentTeacher?.Fname} ${currentTeacher?.Lname}`}
            </Typography>
            <Typography variant="h6">
              Email Address: {currentTeacher?.email}
            </Typography>
            <Typography variant="h6">
              Qualification:{" "}
              {currentTeacher?.teacherqualifications
                .map((q) => q.qualification.name)
                .join(", ")}
            </Typography>
            <Typography variant="h6">
              Subjects Taught:{" "}
              {currentTeacher?.teacherskill.map((s) => s.skill.name).join(", ")}
            </Typography>
            <Typography variant="h6">
              Location: {currentTeacher?.teachersaddress[0]?.state || "N/A"}
            </Typography>
            <Typography variant="h6">
              Status: Approved {/* Default status */}
            </Typography>
            <Typography variant="h6">
              Skill Test Score: {currentTeacher?.total_marks}
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
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        />
      </Container>
    </Layout>
  );
};

export default ManageTeacher;

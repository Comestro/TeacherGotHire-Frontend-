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
  FormControl,
  InputLabel,
  Box,
  Snackbar,
  Alert,
  Switch,
  TablePagination,
  Paper,
  Grid,
  TableContainer,
  CircularProgress,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Layout from "../Admin/Layout";
import { getTeacher } from "../../services/adminTeacherApi";
import { Link } from "react-router-dom";
import { getQualification } from "../../services/adminManageQualificationApi";
import { getSubjects } from "../../services/adminSubujectApi";

const ManageTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
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
  const [error, setError] = useState(null);

  // Fetch teacher data
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        const response = await getTeacher();
        if (Array.isArray(response)) {
          setTeachers(response);
        } else {
          console.error("Error fetching teacher data: ", response);
          setError("Failed to load teacher data. Please try again later.");
        }
      } catch (error) {
        console.error("Error fetching teacher data: ", error);
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherData();
  }, []);

  const handleDeleteTeacher = (teacherId) => {
    setTeachers(teachers.filter((teacher) => teacher.id !== teacherId));
    setNotification({
      open: true,
      message: "Teacher deleted successfully",
      type: "success",
    });
  };

  const handleBulkDelete = () => {
    if (selectedTeachers.length === 0) {
      setNotification({
        open: true,
        message: "Please select at least one teacher to delete",
        type: "warning",
      });
      return;
    }

    setTeachers(
      teachers.filter((teacher) => !selectedTeachers.includes(teacher.id))
    );
    setSelectedTeachers([]);
    setNotification({
      open: true,
      message: "Selected teachers deleted successfully",
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
    if (filteredTeachers.length === 0) {
      setNotification({
        open: true,
        message: "No data to export",
        type: "warning",
      });
      return;
    }

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
      ...filteredTeachers.map((teacher) => [
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

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredTeachers.map((teacher) => teacher.id);
      setSelectedTeachers(newSelected);
      return;
    }
    setSelectedTeachers([]);
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        {/* Header section */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          gap={2}
          mb={3}
        >
          <Typography
            variant="h4"
            sx={{
              color: "primary.main",
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "2.125rem" },
            }}
          >
            Manage Teachers
          </Typography>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<ExportIcon />}
            onClick={handleExportData}
            sx={{
              boxShadow: 2,
              textTransform: 'none',
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            Export Data
          </Button>
        </Box>

        {/* Search and filters */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 2
          }}
        >
          <Box mb={2}>
            <TextField
              label="Search Teachers"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl variant="outlined" fullWidth size="small">
                <InputLabel>Qualification</InputLabel>
                <Select
                  label="Qualification"
                  value={selectedQualification}
                  onChange={(e) => setSelectedQualification(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value="phd">PhD</MenuItem>
                  <MenuItem value="masters">Masters</MenuItem>
                  <MenuItem value="bachelors">Bachelors</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl variant="outlined" fullWidth size="small">
                <InputLabel>Subject Expertise</InputLabel>
                <Select
                  label="Subject Expertise"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value="math">Math</MenuItem>
                  <MenuItem value="science">Science</MenuItem>
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="history">History</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl variant="outlined" fullWidth size="small">
                <InputLabel>Location</InputLabel>
                <Select
                  label="Location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value="delhi">Delhi</MenuItem>
                  <MenuItem value="mumbai">Mumbai</MenuItem>
                  <MenuItem value="bangalore">Bangalore</MenuItem>
                  <MenuItem value="chennai">Chennai</MenuItem>
                  <MenuItem value="hyderabad">Hyderabad</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl variant="outlined" fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Teachers Table */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box p={3}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : filteredTeachers.length === 0 ? (
            <Box p={3} textAlign="center">
              <Alert severity="info">No teachers found matching your criteria</Alert>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedTeachers.length > 0 &&
                            selectedTeachers.length < filteredTeachers.length
                          }
                          checked={
                            filteredTeachers.length > 0 &&
                            selectedTeachers.length === filteredTeachers.length
                          }
                          onChange={handleSelectAllClick}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Full Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email Address</TableCell>
                      <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Qualification</TableCell>
                      <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Subjects</TableCell>
                      <TableCell sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTeachers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((teacher) => (
                        <TableRow
                          key={teacher.id}
                          hover
                          sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}
                        >
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
                          <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                            {teacher.teacherqualifications
                              .map((q) => q.qualification.name)
                              .join(", ")}
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                            {teacher.teachersubjects.join(", ")}
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
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
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <IconButton
                                component={Link}
                                to={`/admin/view/teacher/${teacher.id}`}
                                size="small"
                                color="primary"
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteTeacher(teacher.id)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box
                display="flex"
                flexDirection={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                p={2}
                gap={2}
              >
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleBulkDelete}
                  startIcon={<DeleteIcon />}
                  disabled={selectedTeachers.length === 0}
                  sx={{
                    textTransform: 'none',
                    order: { xs: 2, sm: 1 },
                    boxShadow: 1
                  }}
                >
                  Delete Selected ({selectedTeachers.length})
                </Button>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  component="div"
                  count={filteredTeachers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    order: { xs: 1, sm: 2 },
                    '.MuiTablePagination-toolbar': {
                      flexWrap: 'wrap'
                    }
                  }}
                />
              </Box>
            </>
          )}
        </Paper>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.type}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default ManageTeacher;
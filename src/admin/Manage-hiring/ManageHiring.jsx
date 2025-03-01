import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Modal,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/system";
import { FiDownload, FiFilter, FiMoreVertical } from "react-icons/fi";
import Layout from "../Admin/Layout";
import { getHireRequest, updateHireRequest } from "../../services/adminHiringRequest";

const StyledTableCell = styled(TableCell)(({ theme = {} }) => ({
  backgroundColor: theme.palette?.common?.white || "#ffffff",
  color: theme.palette?.common?.black || "#000000",
  fontWeight: "bold",
}));

const StyledStatusChip = styled(Chip)(({ status }) => ({
  backgroundColor:
    status === "Pending"
      ? "#ffd700"
      : status === "fulfilled"
      ? "#4caf50"
      : status === "rejected"
      ? "#f44336"
      : "#f44336",
  color: "#fff",
}));

const RequestDetailsModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const ModalContent = styled(Paper)({
  padding: "2rem",
  maxWidth: "600px",
  maxHeight: "80vh",
  overflow: "auto",
});

const ManageHiringRequests = () => {
  const [filters, setFilters] = useState({
    status: "all",
    recruiterName: null,
    teacherName: null,
    category: "",
    specialization: "",
    dateRange: [null, null],
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getHireRequest();
        console.log("Response: ", response);
        if (Array.isArray(response)) {
          const formatData = response.map((item) => ({
            id: item.id,
            recruiterName: item.recruiter_id, // This is an object
            teacherName: item.teacher_id, // This is an object
            role: item.role,
            subjects: item.subject,
            status: item.status,
            requestDate: item.date,
          }));
          setData(formatData);
        }
      } catch (error) {
        console.error("Error fetching hire requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper function to format names
  const formatName = (user) => {
    if (!user) return "N/A";
    return `${user.Fname} ${user.Lname}`;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const formatDate = (dateString) => {
    const options = { month: "short", day: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleApproveRequest = async () => {
    try {
      await updateHireRequest(selectedRequest.id, {
        recruiter_id: selectedRequest.recruiterName.id, // Use the recruiter ID
        teacher_id: selectedRequest.teacherName.id, // Use the teacher ID
        status: "fulfilled",
      });
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedRequest.id ? { ...item, status: "fulfilled" } : item
        )
      );
      setSnackbarMessage("Request approved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseModal();
    } catch (error) {
      console.error("Error approving request:", error);
      setSnackbarMessage("Failed to approve request.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleRejectRequest = async () => {
    try {
      await updateHireRequest(selectedRequest.id, {
        recruiter_id: selectedRequest.recruiterName.id, // Use the recruiter ID
        teacher_id: selectedRequest.teacherName.id, // Use the teacher ID
        status: "rejected",
        reject_reason: "Reason for rejection", // Add the actual reason here
      });
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedRequest.id ? { ...item, status: "rejected" } : item
        )
      );
      setSnackbarMessage("Request rejected successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseModal();
    } catch (error) {
      console.error("Error rejecting request:", error);
      setSnackbarMessage("Failed to reject request.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const filteredData = data.filter((row) => {
    return (
      (filters.status === "all" ||
        row.status.toLowerCase() === filters.status) &&
      (!filters.recruiterName ||
        formatName(row.recruiterName).toLowerCase().includes(filters.recruiterName.toLowerCase())) &&
      (!filters.teacherName ||
        formatName(row.teacherName).toLowerCase().includes(filters.teacherName.toLowerCase()))
    );
  });

  const handleExportData = () => {
    const csvData = filteredData.map((row) => ({
      Recruiter: formatName(row.recruiterName),
      Teacher: formatName(row.teacherName),
      Role: row.role,
      Subjects: row.subjects.map((subject) => subject.subject_name).join(", "),
      Status: row.status,
      Date: formatDate(row.requestDate),
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Recruiter,Teacher,Role,Subjects,Status,Date"]
        .concat(csvData.map((row) => Object.values(row).join(",")))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hiring_requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Manage Recruiter Hiring Requests
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Review, approve, or reject teacher hiring requests efficiently
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Filters Panel */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Filters
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.status}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Recruiter Name"
                      fullWidth
                      value={filters.recruiterName || ""}
                      onChange={(e) => handleFilterChange("recruiterName", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Teacher Name"
                      fullWidth
                      value={filters.teacherName || ""}
                      onChange={(e) => handleFilterChange("teacherName", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        startIcon={<FiFilter />}
                        fullWidth
                        onClick={() =>
                          setFilters({
                            status: "all",
                            recruiterName: null,
                            teacherName: null,
                            category: "",
                            specialization: "",
                            dateRange: [null, null],
                          })
                        }
                      >
                        Reset
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<FiDownload />}
                        fullWidth
                        onClick={handleExportData}
                      >
                        Export
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Table */}
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Recruiter</StyledTableCell>
                        <StyledTableCell>Teacher</StyledTableCell>
                        <StyledTableCell>Role</StyledTableCell>
                        <StyledTableCell>Subjects</StyledTableCell>
                        <StyledTableCell>Status</StyledTableCell>
                        <StyledTableCell>Date</StyledTableCell>
                        <StyledTableCell>Actions</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredData
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((row) => (
                          <TableRow
                            key={row.id}
                            hover
                            onClick={() => handleOpenModal(row)}
                            sx={{ cursor: "pointer" }}
                          >
                            <TableCell>{formatName(row.recruiterName)}</TableCell>
                            <TableCell>{formatName(row.teacherName)}</TableCell>
                            <TableCell>{row.role}</TableCell>
                            <TableCell>{row.subjects.map((subject) => subject.subject_name).join(", ")}</TableCell>
                            <TableCell>
                              <StyledStatusChip
                                label={row.status}
                                status={row.status}
                              />
                            </TableCell>
                            <TableCell>{formatDate(row.requestDate)}</TableCell>
                            <TableCell>
                              <IconButton>
                                <FiMoreVertical />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
                <TablePagination
                  component="div"
                  count={filteredData.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            </Grid>
          </Grid>

          {/* Request Details Modal */}
          <RequestDetailsModal open={modalOpen} onClose={handleCloseModal}>
            <ModalContent>
              {selectedRequest && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Request Details
                  </Typography>
                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    Recruiter: {formatName(selectedRequest.recruiterName)}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Teacher: {formatName(selectedRequest.teacherName)}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Role: {selectedRequest.role}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Subjects: {selectedRequest.subjects.map((subject) => subject.subject_name).join(", ")}
                  </Typography>

                  <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleApproveRequest}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleRejectRequest}
                    >
                      Reject
                    </Button>
                  </Box>
                </>
              )}
            </ModalContent>
          </RequestDetailsModal>

          {/* Snackbar for feedback messages */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity={snackbarSeverity}
              sx={{ width: '100%' }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </Layout>
  );
};

export default ManageHiringRequests;
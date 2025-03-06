import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  TextField,
  IconButton,
  Card,
  CardContent,
  Grid,
  Alert,
  Snackbar,
  TablePagination,
  useTheme,
  useMediaQuery,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  FaPlus,
  FaPencilAlt,
  FaTrash,
  FaBriefcase,
  FaSearch,
} from "react-icons/fa";
import Layout from "../Admin/Layout";
import { getJobTypes, createJobType, updateJobType, deleteJobType } from "../../services/adminManageJobtype";

const StyledModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

// Define ModalContent outside the component to prevent recreation on each render
const ModalContent = styled(Paper)(({ theme, width }) => ({
  padding: "24px",
  minWidth: "300px",
  width: width,
  maxWidth: "90vw",
}));

const ManageTeacherJobType = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const modalWidth = isMobile ? "90%" : "400px";

  const [jobTypes, setJobTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [newJobType, setNewJobType] = useState({ jobrole_name: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Use a ref for the text input to maintain focus
  const inputRef = useRef(null);

  // Focus the text field when the modal opens
  useEffect(() => {
    if (openModal && inputRef.current) {
      const timeoutId = setTimeout(() => {
        inputRef.current.focus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [openModal]);

  useEffect(() => {
    fetchJobTypes();
  }, []);

  const fetchJobTypes = async () => {
    setLoading(true);
    try {
      const data = await getJobTypes();
      setJobTypes(data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch job types:", err);
      setError("Failed to load job types. Please try again later.");

      // Fallback to sample data for development/testing
      setJobTypes([
        { "id": 1, "jobrole_name": "Teacher" },
        { "id": 2, "jobrole_name": "Professor" },
        { "id": 3, "jobrole_name": "Principal" },
        { "id": 4, "jobrole_name": "PtTeacher" },
        { "id": 5, "jobrole_name": "Sports Teacher" },
        { "id": 6, "jobrole_name": "Lecturer" },
        { "id": 7, "jobrole_name": "Administrator" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (job = null) => {
    setSelectedJob(job);
    if (job) {
      setNewJobType({ jobrole_name: job.jobrole_name });
    } else {
      setNewJobType({ jobrole_name: "" });
    }
    // Clear any previous field errors
    setFieldErrors({});
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedJob(null);
    setNewJobType({ jobrole_name: "" });
    setFieldErrors({});
  };

  const handleSave = async () => {
    // Reset field errors
    setFieldErrors({});

    // Client-side validation
    let hasErrors = false;
    const errors = {};

    if (!newJobType.jobrole_name.trim()) {
      errors.jobrole_name = ["Job role name is required"];
      hasErrors = true;
    } else if (newJobType.jobrole_name.trim().length < 3) {
      errors.jobrole_name = ["Role name must be at least 3 characters"];
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      if (selectedJob) {
        // Update existing job role
        await updateJobType(selectedJob.id, newJobType);
        setJobTypes(
          jobTypes.map((job) =>
            job.id === selectedJob.id ? { ...job, ...newJobType } : job
          )
        );
        setNotification({
          open: true,
          message: "Job type updated successfully!",
          severity: "success",
        });
        handleCloseModal();
      } else {
        // Create new job role
        const newJob = await createJobType(newJobType);
        setJobTypes([...jobTypes, newJob]);
        setNotification({
          open: true,
          message: "New job type added successfully!",
          severity: "success",
        });
        handleCloseModal();
      }
    } catch (err) {
      console.error("Failed to save job type:", err);

      // Handle validation errors from backend
      if (err.response && err.response.data) {
        const responseData = err.response.data;

        if (responseData.jobrole_name) {
          setFieldErrors({ jobrole_name: responseData.jobrole_name });
        } else {
          // General error
          setNotification({
            open: true,
            message: `Failed to ${selectedJob ? "update" : "create"} job type. ${err.response.data.message || 'Please try again.'}`,
            severity: "error",
          });
        }
      } else {
        setNotification({
          open: true,
          message: `Failed to ${selectedJob ? "update" : "create"} job type. Please try again.`,
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (job) => {
    setSelectedJob(job);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await deleteJobType(selectedJob.id);
      setJobTypes(jobTypes.filter((job) => job.id !== selectedJob.id));
      setNotification({
        open: true,
        message: "Job type deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Failed to delete job type:", err);
      setNotification({
        open: true,
        message: err.response?.data?.message || "Failed to delete job type. Please try again.",
        severity: "error",
      });
    } finally {
      setDeleteModal(false);
      setSelectedJob(null);
      setLoading(false);
    }
  };

  const filteredJobTypes = jobTypes.filter((job) =>
    job.jobrole_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle input change without losing focus
  const handleInputChange = (e) => {
    setNewJobType({ ...newJobType, jobrole_name: e.target.value });

    // Clear field error when user starts typing
    if (fieldErrors.jobrole_name) {
      setFieldErrors({
        ...fieldErrors,
        jobrole_name: null
      });
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 1,
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" }
            }}
          >
            <FaBriefcase style={{ marginRight: "12px" }} />
            Manage Teacher Job Types
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              mb: 3,
            }}
          >
            <TextField
              placeholder="Search job types..."
              variant="outlined"
              size="small"
              fullWidth={isMobile}
              InputProps={{
                startAdornment: <FaSearch style={{ marginRight: "8px" }} />,
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<FaPlus />}
              onClick={() => handleOpenModal()}
              fullWidth={isMobile}
              disabled={loading}
            >
              Add New Job Type
            </Button>
          </Box>
        </Box>

        {loading && !openModal && !deleteModal ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : isMobile || isTablet ? (
          <Grid container spacing={2}>
            {filteredJobTypes.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm ? "No job types match your search." : "No job types available."}
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              filteredJobTypes
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((job) => (
                  <Grid item xs={12} sm={6} key={job.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6">{job.jobrole_name}</Typography>
                        <Box sx={{ display: "flex", gap: 1, mt: 2, justifyContent: "flex-end" }}>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenModal(job)}
                            size="small"
                            disabled={loading}
                          >
                            <FaPencilAlt />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(job)}
                            size="small"
                            disabled={loading}
                          >
                            <FaTrash />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
            )}
          </Grid>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Job Type</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      {searchTerm ? "No job types match your search." : "No job types available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobTypes
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((job) => (
                      <TableRow key={job.id} hover>
                        <TableCell>{job.id}</TableCell>
                        <TableCell>{job.jobrole_name}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenModal(job)}
                            size="small"
                            disabled={loading}
                          >
                            <FaPencilAlt />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(job)}
                            size="small"
                            disabled={loading}
                          >
                            <FaTrash />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {filteredJobTypes.length > 0 && (
          <TablePagination
            component="div"
            count={filteredJobTypes.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}

        <StyledModal
          open={openModal}
          onClose={loading ? undefined : handleCloseModal}
          keepMounted
        >
          <ModalContent width={modalWidth}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedJob ? "Edit Job Type" : "Add New Job Type"}
            </Typography>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Job Role Name"
                value={newJobType.jobrole_name}
                onChange={handleInputChange}
                required
                disabled={loading}
                autoFocus
                inputRef={inputRef}
                error={!!fieldErrors.jobrole_name}
                InputProps={{
                  autoFocus: true
                }}
              />
              {fieldErrors.jobrole_name && (
                <FormHelperText error>
                  {fieldErrors.jobrole_name[0]}
                </FormHelperText>
              )}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" onClick={handleCloseModal} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save'}
              </Button>
            </Box>
          </ModalContent>
        </StyledModal>

        <StyledModal
          open={deleteModal}
          onClose={loading ? undefined : () => setDeleteModal(false)}
          keepMounted
        >
          <ModalContent width={modalWidth}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Confirm Deletion
            </Typography>
            <Typography sx={{ mb: 3 }}>
              Are you sure you want to delete "{selectedJob?.jobrole_name}"? This action cannot
              be undone.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setDeleteModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
              </Button>
            </Box>
          </ModalContent>
        </StyledModal>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            sx={{ width: "100%" }}
            variant="filled"
            elevation={6}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default ManageTeacherJobType;
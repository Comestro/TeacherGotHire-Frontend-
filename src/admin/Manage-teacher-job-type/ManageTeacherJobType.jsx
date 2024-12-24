import React, { useState } from "react";
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

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ModalContent = styled(Paper)(({ theme }) => ({
  padding: "24px",
  minWidth: "400px",
  maxWidth: "90%",
}));

const ManageTeacherJobType = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [jobTypes, setJobTypes] = useState([
    {
      id: 1,
      name: "Home Tutor",
      description: "One-on-one teaching at student's home",
    },
    {
      id: 2,
      name: "Private School Teacher",
      description: "Full-time teaching position",
    },
    {
      id: 3,
      name: "Online Tutor",
      description: "Remote teaching via video calls",
    },
  ]);

  const [openModal, setOpenModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [newJobType, setNewJobType] = useState({ name: "", description: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleOpenModal = (job = null) => {
    setSelectedJob(job);
    if (job) {
      setNewJobType({ name: job.name, description: job.description });
    } else {
      setNewJobType({ name: "", description: "" });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedJob(null);
    setNewJobType({ name: "", description: "" });
  };

  const handleSave = () => {
    if (!newJobType.name.trim()) {
      setNotification({
        open: true,
        message: "Job type name is required!",
        severity: "error",
      });
      return;
    }

    if (selectedJob) {
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
    } else {
      setJobTypes([...jobTypes, { id: jobTypes.length + 1, ...newJobType }]);
      setNotification({
        open: true,
        message: "New job type added successfully!",
        severity: "success",
      });
    }
    handleCloseModal();
  };

  const handleDelete = (job) => {
    setSelectedJob(job);
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    setJobTypes(jobTypes.filter((job) => job.id !== selectedJob.id));
    setDeleteModal(false);
    setSelectedJob(null);
    setNotification({
      open: true,
      message: "Job type deleted successfully!",
      severity: "success",
    });
  };

  const filteredJobTypes = jobTypes.filter((job) =>
    job.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ display: "flex", alignItems: "center", mb: 1 }}
          >
            <FaBriefcase style={{ marginRight: "12px" }} />
            Manage Teacher Job Types
          </Typography>
          {/* <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            Add, edit, or delete job types to keep the platform updated with
            relevant teaching opportunities.
          </Typography> */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <TextField
              placeholder="Search job types..."
              variant="outlined"
              size="small"
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
            >
              Add New Job Type
            </Button>
          </Box>
        </Box>

        {isMobile ? (
          <Grid container spacing={2}>
            {filteredJobTypes
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((job) => (
                <Grid item xs={12} key={job.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{job.name}</Typography>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        {job.description}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenModal(job)}
                          size="small"
                        >
                          <FaPencilAlt />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(job)}
                          size="small"
                        >
                          <FaTrash />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Job Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobTypes
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((job) => (
                    <TableRow key={job.id} hover>
                      <TableCell>{job.id}</TableCell>
                      <TableCell>{job.name}</TableCell>
                      <TableCell>{job.description}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenModal(job)}
                          size="small"
                        >
                          <FaPencilAlt />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(job)}
                          size="small"
                        >
                          <FaTrash />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          component="div"
          count={filteredJobTypes.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <StyledModal open={openModal} onClose={handleCloseModal}>
          <ModalContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedJob ? "Edit Job Type" : "Add New Job Type"}
            </Typography>
            <TextField
              fullWidth
              label="Job Type Name"
              value={newJobType.name}
              onChange={(e) =>
                setNewJobType({ ...newJobType, name: e.target.value })
              }
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={newJobType.description}
              onChange={(e) =>
                setNewJobType({ ...newJobType, description: e.target.value })
              }
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave}>
                Save
              </Button>
            </Box>
          </ModalContent>
        </StyledModal>

        <StyledModal open={deleteModal} onClose={() => setDeleteModal(false)}>
          <ModalContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Confirm Deletion
            </Typography>
            <Typography sx={{ mb: 3 }}>
              Are you sure you want to delete this job type? This action cannot
              be undone.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" onClick={() => setDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={confirmDelete}>
                Delete
              </Button>
            </Box>
          </ModalContent>
        </StyledModal>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        {/* <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Quick Links:{" "}
            <Button color="primary" size="small">
              Manage Teachers
            </Button>{" "}
            |{" "}
            <Button color="primary" size="small">
              Manage Class Categories
            </Button>{" "}
            |{" "}
            <Button color="primary" size="small">
              Support
            </Button>
          </Typography>
        </Box> */}
      </Container>
    </Layout>
  );
};

export default ManageTeacherJobType;

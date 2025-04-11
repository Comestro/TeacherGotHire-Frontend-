import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Card,
  CardContent,
  Grid,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  CircularProgress,
  InputAdornment,
  Divider,
  Backdrop
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import Layout from "../Admin/Layout";
import { getJobTypes, createJobType, updateJobType, deleteJobType } from "../../services/adminManageJobtype";

const ManageTeacherJobType = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [jobTypes, setJobTypes] = useState([]);
  const [filteredJobTypes, setFilteredJobTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobFormData, setJobFormData] = useState({ jobrole_name: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [paginationModel, setPaginationModel] = useState({
    pageSize: isMobile ? 5 : 10,
    page: 0
  });

  const inputRef = useRef(null);

  useEffect(() => {
    if (openEditDialog && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [openEditDialog]);

  useEffect(() => {
    fetchJobTypes();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredJobTypes(jobTypes);
    } else {
      const filtered = jobTypes.filter((job) =>
        job.jobrole_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobTypes(filtered);
    }
  }, [searchTerm, jobTypes]);

  const fetchJobTypes = async () => {
    setLoading(true);
    try {
      const data = await getJobTypes();
      setJobTypes(Array.isArray(data) ? data : []);
      setFilteredJobTypes(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch job types:", err);
      setError("Failed to load job types. Please try again later.");
      showSnackbar("Failed to load job types. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    let displayMessage;

    if (Array.isArray(message)) {
      displayMessage = message[0];
    } else if (typeof message === 'object' && message !== null) {
      const firstKey = Object.keys(message)[0];
      const firstValue = message[firstKey];
      displayMessage = Array.isArray(firstValue) ? firstValue[0] : JSON.stringify(message);
    } else {
      displayMessage = message;
    }

    setSnackbar({
      open: true,
      message: displayMessage,
      severity,
    });
  };

  const handleOpenEditDialog = (job = null) => {
    setSelectedJob(job);
    setJobFormData({
      jobrole_name: job ? job.jobrole_name : ""
    });
    setFormErrors({});
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    if (submitting) return;
    setOpenEditDialog(false);
    setSelectedJob(null);
    setJobFormData({ jobrole_name: "" });
    setFormErrors({});
  };

  const handleOpenDeleteDialog = (job) => {
    setSelectedJob(job);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    if (submitting) return;
    setOpenDeleteDialog(false);
    setSelectedJob(null);
  };

  const validateForm = () => {
    const errors = {};

    if (!jobFormData.jobrole_name || jobFormData.jobrole_name.trim() === "") {
      errors.jobrole_name = "Job role name is required";
    } else if (jobFormData.jobrole_name.trim().length < 3) {
      errors.jobrole_name = "Job role name must be at least 3 characters";
    } else if (jobFormData.jobrole_name.trim().length > 50) {
      errors.jobrole_name = "Job role name cannot exceed 50 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveJobType = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        jobrole_name: jobFormData.jobrole_name.trim(),
      };

      if (selectedJob) {
        await updateJobType(selectedJob.id, payload);
        setJobTypes(
          jobTypes.map((job) =>
            job.id === selectedJob.id ? { ...job, ...payload } : job
          )
        );
        showSnackbar(`Job type "${payload.jobrole_name}" updated successfully`);
      } else {
        const newJob = await createJobType(payload);
        setJobTypes([...jobTypes, newJob]);
        showSnackbar(`Job type "${payload.jobrole_name}" added successfully`);
      }
      handleCloseEditDialog();
    } catch (error) {
      console.error("Failed to save job type:", error);

      if (error.response?.data) {
        const responseData = error.response.data;

        if (responseData.jobrole_name) {
          setFormErrors({
            jobrole_name: Array.isArray(responseData.jobrole_name)
              ? responseData.jobrole_name[0]
              : responseData.jobrole_name
          });

          const errorMessage = Array.isArray(responseData.jobrole_name)
            ? responseData.jobrole_name[0]
            : responseData.jobrole_name;

          showSnackbar(errorMessage, "error");
        } else if (responseData.message) {
          showSnackbar(responseData.message, "error");
        } else if (responseData.error) {
          showSnackbar(responseData.error, "error");
        } else if (typeof responseData === 'string') {
          showSnackbar(responseData, "error");
        } else {
          showSnackbar(
            `Failed to ${selectedJob ? "update" : "add"} job type. Please try again.`,
            "error"
          );
        }
      } else {
        showSnackbar(
          `Failed to ${selectedJob ? "update" : "add"} job type. Please try again.`,
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJobType = async () => {
    if (!selectedJob) return;

    setSubmitting(true);
    try {
      await deleteJobType(selectedJob.id);
      setJobTypes(jobTypes.filter((job) => job.id !== selectedJob.id));
      showSnackbar(`Job type "${selectedJob.jobrole_name}" deleted successfully`);
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Failed to delete job type:", error);

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          showSnackbar(error.response.data, "error");
        } else if (error.response.data.message) {
          showSnackbar(error.response.data.message, "error");
        } else if (error.response.data.error) {
          showSnackbar(error.response.data.error, "error");
        } else {
          showSnackbar("Failed to delete job type. Please try again.", "error");
        }
      } else {
        showSnackbar("Failed to delete job type. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobFormData({
      ...jobFormData,
      [name]: value
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handlePaginationModelChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  const columns = [
    {
      field: 'serialNumber',
      headerName: '#',
      width: 70,
      renderCell: (params) => {
        const index = filteredJobTypes.findIndex(item => item.id === params.row?.id);
        return index !== -1 ? index + 1 : 'N/A';
      }
    },
    {
      field: 'jobrole_name',
      headerName: 'Job Type',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box display="flex" justifyContent="flex-end" gap={1}>
          <IconButton
            color="primary"
            onClick={() => handleOpenEditDialog(params.row)}
            size="small"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleOpenDeleteDialog(params.row)}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        <Card
          elevation={2}
          sx={{
            borderRadius: { xs: 1, sm: 2 },
            mb: { xs: 2, sm: 3 },
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <WorkIcon sx={{ mr: 1.5, fontSize: 'inherit' }} />
                  Manage Teacher Job Types
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenEditDialog()}
                  fullWidth={isMobile}
                  sx={{
                    py: { xs: 1, sm: 'auto' },
                    textTransform: 'none',
                    boxShadow: 2
                  }}
                >
                  Add New Job Type
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card
          elevation={2}
          sx={{
            borderRadius: { xs: 1, sm: 2 },
            overflow: 'hidden',
            mb: 2
          }}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              gap={2}
              mb={2}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Job Types ({filteredJobTypes.length})
              </Typography>

              <TextField
                placeholder="Search job types..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: '100%', sm: '220px' } }}
              />
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : filteredJobTypes.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {searchTerm
                  ? "No job types match your search criteria."
                  : "No job types available. Add a new job type to get started."
                }
              </Alert>
            ) : isMobile || isTablet ? (
              <>
                <Grid container spacing={2}>
                  {filteredJobTypes
                    .slice(paginationModel.page * paginationModel.pageSize,
                      (paginationModel.page + 1) * paginationModel.pageSize)
                    .map((job, index) => (
                      <Grid item xs={12} sm={6} key={job.id}>
                        <Card
                          elevation={1}
                          sx={{
                            height: '100%',
                            borderRadius: 1,
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: 3
                            }
                          }}
                        >
                          <CardContent>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                fontWeight={500}
                              >
                                {job.jobrole_name}
                              </Typography>
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <IconButton
                                  color="primary"
                                  onClick={() => handleOpenEditDialog(job)}
                                  size="small"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => handleOpenDeleteDialog(job)}
                                  size="small"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>

                {filteredJobTypes.length > paginationModel.pageSize && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mt: 3
                    }}
                  >
                    <Grid container justifyContent="center">
                      <Grid item>
                        <DataGrid
                          paginationModel={paginationModel}
                          onPaginationModelChange={handlePaginationModelChange}
                          pageSizeOptions={[5, 10, 25]}
                          pagination
                          paginationMode="client"
                          hideFooter={false}
                          autoHeight
                          rows={[]}
                          columns={[]}
                          sx={{
                            '& .MuiDataGrid-main, .MuiDataGrid-virtualScroller, .MuiDataGrid-columnsContainer, .MuiDataGrid-columnHeaders': {
                              display: 'none'
                            },
                            '& .MuiDataGrid-footerContainer': {
                              borderTop: 'none'
                            },
                            width: 'auto',
                            border: 'none'
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  mb: 2,
                  width: '100%',
                  height: 440
                }}
              >
                <DataGrid
                  rows={filteredJobTypes}
                  columns={columns}
                  paginationModel={paginationModel}
                  onPaginationModelChange={handlePaginationModelChange}
                  pageSizeOptions={[5, 10, 25]}
                  loading={loading}
                  density={isMobile ? "compact" : "standard"}
                  getRowId={(row) => row.id}
                  disableRowSelectionOnClick
                  sx={{
                    '& .MuiDataGrid-columnHeader': {
                      backgroundColor: 'background.default',
                      fontWeight: 600,
                    },
                    '& .MuiDataGrid-row:nth-of-type(even)': {
                      backgroundColor: '#fafafa',
                    },
                    border: 'none'
                  }}
                />
              </Paper>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={openEditDialog}
          onClose={!submitting ? handleCloseEditDialog : undefined}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: { xs: 1, sm: 2 },
              width: { xs: '95%', sm: 'auto' }
            }
          }}
        >
          <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedJob ? "Edit Job Type" : "Add New Job Type"}
              </Typography>
              {!submitting && (
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleCloseEditDialog}
                  aria-label="close"
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </DialogTitle>

          <Divider />

          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 } }}>
            <TextField
              label="Job Role Name"
              variant="outlined"
              fullWidth
              margin="normal"
              name="jobrole_name"
              value={jobFormData.jobrole_name}
              onChange={handleInputChange}
              error={Boolean(formErrors.jobrole_name)}
              helperText={formErrors.jobrole_name || ""}
              disabled={submitting}
              autoFocus
              inputRef={inputRef}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>

          <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'flex-end',
                gap: 1
              }}
            >
              <Button
                onClick={handleCloseEditDialog}
                variant="outlined"
                color="primary"
                disabled={submitting}
                fullWidth={isMobile}
                sx={{
                  order: { xs: 2, sm: 1 },
                  textTransform: 'none'
                }}
              >
                Cancel
              </Button>

              <Button
                onClick={handleSaveJobType}
                variant="contained"
                color="primary"
                disabled={submitting}
                fullWidth={isMobile}
                sx={{
                  order: { xs: 1, sm: 2 },
                  textTransform: 'none'
                }}
              >
                {submitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : selectedJob ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openDeleteDialog}
          onClose={!submitting ? handleCloseDeleteDialog : undefined}
          PaperProps={{
            sx: {
              borderRadius: { xs: 1, sm: 2 },
              width: { xs: '95%', sm: 'auto' },
              maxWidth: '450px'
            }
          }}
        >
          <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600 }}>
                Delete Job Type
              </Typography>
              {!submitting && (
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleCloseDeleteDialog}
                  aria-label="close"
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </DialogTitle>

          <Divider />

          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 } }}>
            <Typography variant="body1" mb={1}>
              Are you sure you want to delete this job type:
            </Typography>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              "{selectedJob?.jobrole_name}"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'flex-end',
                gap: 1
              }}
            >
              <Button
                onClick={handleCloseDeleteDialog}
                variant="outlined"
                disabled={submitting}
                fullWidth={isMobile}
                sx={{
                  order: { xs: 2, sm: 1 },
                  textTransform: 'none'
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteJobType}
                variant="contained"
                color="error"
                disabled={submitting}
                fullWidth={isMobile}
                sx={{
                  order: { xs: 1, sm: 2 },
                  textTransform: 'none'
                }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : "Delete"}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
          open={submitting}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ mt: { xs: 7, sm: 8 } }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            elevation={6}
            sx={{
              width: "100%",
              boxShadow: 3,
              '& .MuiAlert-message': {
                maxWidth: '100%',
                wordBreak: 'break-word'
              }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default ManageTeacherJobType;
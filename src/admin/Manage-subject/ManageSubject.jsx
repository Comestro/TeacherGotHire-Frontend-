import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Checkbox,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  InputAdornment,
  CircularProgress,
  Divider,
  FormHelperText,
  Backdrop,
  Pagination,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Alert } from "@mui/material";
import Layout from "../Admin/Layout";
import {
  getSubjects,
  updateSubject,
  deleteSubject,
  createSubject,
  getClasses,
} from "../../services/adminSubujectApi";

const ManageSubject = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 5 : 10;

  // Fetch subjects and classes on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subjectsData, classesData] = await Promise.all([
        getSubjects(),
        getClasses()
      ]);

      setSubjects(subjectsData);
      setFilteredSubjects(subjectsData);
      setClasses(classesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to load data. Please try again later.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Enhanced showSnackbar function
  const showSnackbar = (message, severity = "success") => {
    // Clean up and format the message if needed
    let displayMessage;

    if (Array.isArray(message)) {
      displayMessage = message[0]; // Take first error if it's an array
    } else if (typeof message === 'object' && message !== null) {
      // If message is an object, try to extract first error message
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

  // Handle adding a new subject
  const handleAddSubject = () => {
    setCurrentSubject({ class_category: "", subject_name: "" });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Handle editing a subject
  const handleEditSubject = (subject) => {
    setCurrentSubject({ ...subject });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Confirm delete dialog
  const handleConfirmDelete = (subject) => {
    setSelectedToDelete(subject);
    setOpenDeleteDialog(true);
  };

  // Handle deleting a subject
  const handleDeleteSubject = async () => {
    if (!selectedToDelete) return;

    setSubmitting(true);
    try {
      await deleteSubject(selectedToDelete.id);
      showSnackbar(`Subject "${selectedToDelete.subject_name}" deleted successfully`);
      fetchData();
      setOpenDeleteDialog(false);
      setSelectedToDelete(null);
    } catch (error) {
      console.error("Error deleting subject:", error);

      // Extract specific error message if available
      if (error.response?.data) {
        if (error.response.data.non_field_errors) {
          showSnackbar(error.response.data.non_field_errors[0], "error");
        } else if (error.response.data.message) {
          showSnackbar(error.response.data.message, "error");
        } else if (typeof error.response.data === 'string') {
          showSnackbar(error.response.data, "error");
        } else {
          showSnackbar("Failed to delete subject. It might be in use.", "error");
        }
      } else {
        showSnackbar("Failed to delete subject. Please try again.", "error");
      }

      setOpenDeleteDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle bulk deletion of selected subjects
  const handleBulkDelete = async () => {
    if (selectedSubjects.length === 0) return;

    setSubmitting(true);
    try {
      await Promise.all(
        selectedSubjects.map((subjectId) => deleteSubject(subjectId))
      );
      showSnackbar(`${selectedSubjects.length} subjects deleted successfully`);
      fetchData();
      setSelectedSubjects([]);
    } catch (error) {
      console.error("Error bulk deleting subjects:", error);

      // Extract specific error message if available
      if (error.response?.data) {
        if (error.response.data.non_field_errors) {
          showSnackbar(error.response.data.non_field_errors[0], "error");
        } else if (error.response.data.message) {
          showSnackbar(error.response.data.message, "error");
        } else if (typeof error.response.data === 'string') {
          showSnackbar(error.response.data, "error");
        } else {
          showSnackbar("Failed to delete selected subjects. Some might be in use.", "error");
        }
      } else {
        showSnackbar("Failed to delete selected subjects. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Updated validateForm function with duplicate subject check
  const validateForm = () => {
    const errors = {};

    // Basic validation
    if (!currentSubject.subject_name || currentSubject.subject_name.trim() === "") {
      errors.subject_name = "Subject name is required";
    } else if (currentSubject.subject_name.length < 2) {
      errors.subject_name = "Subject name must be at least 2 characters";
    } else if (currentSubject.subject_name.length > 50) {
      errors.subject_name = "Subject name cannot exceed 50 characters";
    }

    if (!currentSubject.class_category) {
      errors.class_category = "Please select a class category";
    } else if (currentSubject.subject_name) {
      // Check for duplicate subject in the same class category (only for new subjects)
      if (!currentSubject.id) {
        const subjectExists = subjects.some(
          subject =>
            subject.subject_name.toLowerCase() === currentSubject.subject_name.toLowerCase() &&
            subject.class_category === currentSubject.class_category
        );

        if (subjectExists) {
          const classCategory = classes.find(c => c.id === currentSubject.class_category)?.name || '';
          errors.subject_name = `Subject '${currentSubject.subject_name}' already exists for class category '${classCategory}'.`;
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Updated handleSaveSubject function with better error handling for duplicate subjects
  const handleSaveSubject = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (currentSubject.id) {
        await updateSubject(currentSubject.id, currentSubject);
        showSnackbar(`Subject "${currentSubject.subject_name}" updated successfully`);
        setIsEditModalOpen(false);
        fetchData();
      } else {
        await createSubject(currentSubject);
        showSnackbar(`Subject "${currentSubject.subject_name}" added successfully`);
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving subject:", error);

      // Handle specific error formats from the server
      if (error.response?.data) {
        const responseData = error.response.data;

        // Handle case where server returns non_field_errors array (duplicate subject error)
        if (responseData.non_field_errors && Array.isArray(responseData.non_field_errors)) {
          const errorMessage = responseData.non_field_errors[0];
          showSnackbar(errorMessage, "error");
          return;
        }

        // Handle case where server returns subject_name field errors
        else if (responseData.subject_name && Array.isArray(responseData.subject_name)) {
          setFormErrors({
            ...formErrors,
            subject_name: responseData.subject_name[0]
          });
          showSnackbar(responseData.subject_name[0], "error");
          return;
        }

        // Handle case where server returns class_category field errors
        else if (responseData.class_category && Array.isArray(responseData.class_category)) {
          setFormErrors({
            ...formErrors,
            class_category: responseData.class_category[0]
          });
          showSnackbar(responseData.class_category[0], "error");
          return;
        }

        // Handle case where server returns general message
        else if (responseData.message) {
          showSnackbar(responseData.message, "error");
          return;
        }
      }

      // Fallback for other error types
      showSnackbar(
        `Failed to ${currentSubject.id ? 'update' : 'create'} subject. Please try again.`,
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSubject({
      ...currentSubject,
      [name]: value,
    });

    // Clear validation error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  // Handle search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = subjects.filter((subject) =>
        subject.subject_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects(subjects);
    }
    setCurrentPage(1);
  };

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filteredSubjects.length / itemsPerPage));
  const currentSubjects = filteredSubjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Select all checkbox functionality
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedSubjects(currentSubjects.map((subject) => subject.id));
    } else {
      setSelectedSubjects([]);
    }
  };

  // Individual checkbox functionality
  const handleCheckboxChange = (subjectId) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  // Get class name by ID
  const getClassName = (classId) => {
    const classObj = classes.find((cls) => cls.id === classId);
    return classObj ? classObj.name : "N/A";
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Header Card */}
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
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                  }}
                >
                  Manage Subjects
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddSubject}
                  fullWidth={isMobile}
                  sx={{
                    py: { xs: 1, sm: 'auto' },
                    textTransform: 'none',
                    boxShadow: 2
                  }}
                >
                  Add New Subject
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Search and List Card */}
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
                Subjects ({filteredSubjects.length})
              </Typography>

              <TextField
                label="Subject Name"
                variant="outlined"
                fullWidth
                margin="normal"
                name="subject_name"
                value={currentSubject?.subject_name || ""}
                onChange={handleInputChange}
                error={Boolean(formErrors.subject_name)}
                helperText={formErrors.subject_name || ""}
                disabled={submitting}
                autoFocus
                sx={{ mt: 2 }}
              />
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : filteredSubjects.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {searchQuery
                  ? "No subjects match your search criteria."
                  : "No subjects available. Add a new subject to get started."
                }
              </Alert>
            ) : (
              <>
                <Paper
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'auto',
                    mb: 2
                  }}
                >
                  <TableContainer sx={{ maxHeight: 440 }}>
                    <Table size={isMobile ? "small" : "medium"}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'background.default' }}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              indeterminate={
                                selectedSubjects.length > 0 &&
                                selectedSubjects.length < currentSubjects.length
                              }
                              checked={
                                currentSubjects.length > 0 &&
                                selectedSubjects.length === currentSubjects.length
                              }
                              onChange={handleSelectAll}
                              size={isMobile ? "small" : "medium"}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                          <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Class Category</TableCell>
                          <TableCell sx={{ fontWeight: 600, width: isMobile ? 100 : 120 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentSubjects.map((subject, index) => (
                          <TableRow
                            key={`subject-${subject.id}`}
                            hover
                            sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedSubjects.includes(subject.id)}
                                onChange={() => handleCheckboxChange(subject.id)}
                                size={isMobile ? "small" : "medium"}
                              />
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>{subject.subject_name}</Typography>
                                {isMobile && (
                                  <Typography variant="caption" color="text.secondary">
                                    {getClassName(subject.class_category)}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                              <Chip
                                label={getClassName(subject.class_category)}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <IconButton
                                  size={isMobile ? "small" : "medium"}
                                  color="primary"
                                  onClick={() => handleEditSubject(subject)}
                                >
                                  <EditIcon fontSize={isMobile ? "small" : "medium"} />
                                </IconButton>
                                <IconButton
                                  size={isMobile ? "small" : "medium"}
                                  color="error"
                                  onClick={() => handleConfirmDelete(subject)}
                                >
                                  <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 2
                  }}
                >
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleBulkDelete}
                    disabled={selectedSubjects.length === 0 || submitting}
                    fullWidth={isMobile}
                    sx={{
                      py: { xs: 1, sm: 'auto' },
                      textTransform: 'none',
                      order: { xs: 2, sm: 1 }
                    }}
                  >
                    Delete Selected {selectedSubjects.length > 0 && `(${selectedSubjects.length})`}
                  </Button>

                  {pageCount > 1 && (
                    <Pagination
                      count={pageCount}
                      page={currentPage}
                      onChange={(event, value) => setCurrentPage(value)}
                      color="primary"
                      size={isMobile ? "small" : "medium"}
                      sx={{ order: { xs: 1, sm: 2 } }}
                    />
                  )}
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        {/* Subject Add/Edit Dialog */}
        <Dialog
          open={isEditModalOpen}
          onClose={() => !submitting && setIsEditModalOpen(false)}
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
                {currentSubject && currentSubject.id
                  ? "Edit Subject"
                  : "Add Subject"
                }
              </Typography>
              {!submitting && (
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={() => setIsEditModalOpen(false)}
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
            <FormControl
              fullWidth
              margin="normal"
              error={Boolean(formErrors.class_category)}
              disabled={submitting}
            >
              <InputLabel>Class Category</InputLabel>
              <Select
                value={currentSubject?.class_category || ""}
                onChange={(e) => handleInputChange({
                  target: { name: 'class_category', value: e.target.value }
                })}
                label="Class Category"
                name="class_category"
              >
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.class_category && (
                <FormHelperText error>{formErrors.class_category}</FormHelperText>
              )}
            </FormControl>

            <TextField
              label="Subject Name"
              variant="outlined"
              fullWidth
              margin="normal"
              name="subject_name"
              value={currentSubject?.subject_name || ""}
              onChange={handleInputChange}
              error={Boolean(formErrors.subject_name)}
              helperText={formErrors.subject_name}
              disabled={submitting}
              autoFocus
              sx={{ mt: 2 }}
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
                onClick={() => setIsEditModalOpen(false)}
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
                onClick={handleSaveSubject}
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
                ) : currentSubject?.id ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => !submitting && setOpenDeleteDialog(false)}
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
                Delete Subject
              </Typography>
              {!submitting && (
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={() => setOpenDeleteDialog(false)}
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
              Are you sure you want to delete this subject:
            </Typography>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              "{selectedToDelete?.subject_name}"
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
                onClick={() => setOpenDeleteDialog(false)}
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
                onClick={handleDeleteSubject}
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

        {/* Notification Snackbar */}
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
            sx={{ width: "100%", boxShadow: 3 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Loading backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
          open={submitting}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Container>
    </Layout>
  );
};

export default ManageSubject;
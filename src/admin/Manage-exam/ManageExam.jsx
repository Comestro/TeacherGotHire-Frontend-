import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  TablePagination,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormHelperText,
  IconButton,
  useMediaQuery,
  useTheme,
  Container,
} from "@mui/material";
import { FaPlus, FaEye, FaPencilAlt, FaTrash, FaFilter, FaSearch } from "react-icons/fa";
import { styled } from "@mui/system";
import Layout from "../Admin/Layout";
import {
  getExam,
  // getExamById,
  deleteExam,
  deleteAllExam,
  createExam,
  updateExam,
} from "../../services/adminManageExam";
import { getSubjects } from "../../services/adminSubujectApi";
import { getClassCategory } from "../../services/adminClassCategoryApi";
import { getLevel } from "../../services/adminManageLevel";
import Loader from "../../components/Loader";
import ViewQuestionModal from "./QuestionModal";

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: theme.spacing(3),
  minWidth: "300px",
  width: "90%",
  maxWidth: "600px",
  maxHeight: "90vh",
  overflow: "auto",
  [theme.breakpoints.up("md")]: {
    width: "500px",
  },
}));

const ResponsiveTableContainer = styled(Box)(({ theme }) => ({
  overflowX: "auto",
  width: "100%",
  "& .MuiTable-root": {
    minWidth: "650px",
  },
}));

const FilterContainer = styled(Box)(({ theme, open }) => ({
  display: open ? "flex" : "none",
  flexDirection: "column",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: "#f5f5f5",
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
    alignItems: "center",
  },
}));

const ExamManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedClassCategory, setSelectedClassCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [subjects, setSubjects] = useState([]);
  const [classCategories, setClassCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    class_category: "",
    level: "",
    total_marks: "",
    duration: "",
    type: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  // fetch all exams in ascending order
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await getExam();
      response.sort((a, b) => b.id - a.id);
      setExams(response);
    } catch (error) {
      console.error("Error fetching exams:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to load exams",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // fetch all subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await getSubjects();
        setSubjects(response);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        showSnackbar("Failed to load subjects", "error");
      }
    };
    fetchSubjects();
  }, []);

  // fetch all class categories
  useEffect(() => {
    const fetchClassCategories = async () => {
      try {
        const response = await getClassCategory();
        setClassCategories(response);
      } catch (error) {
        console.error("Error fetching class categories:", error);
        showSnackbar("Failed to load class categories", "error");
      }
    };
    fetchClassCategories();
  }, []);

  // fetch all levels
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await getLevel();
        setLevels(response);
      } catch (error) {
        console.error("Error fetching levels:", error);
        showSnackbar("Failed to load levels", "error");
      }
    };
    fetchLevels();
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!formData.class_category) errors.class_category = "Class category is required";
    if (!formData.subject) errors.subject = "Subject is required";
    if (!formData.level) errors.level = "Level is required";
    if (!formData.total_marks) errors.total_marks = "Total marks is required";
    else if (isNaN(formData.total_marks) || parseInt(formData.total_marks) <= 0)
      errors.total_marks = "Total marks must be a positive number";

    if (!formData.duration) errors.duration = "Duration is required";
    else if (isNaN(formData.duration) || parseInt(formData.duration) <= 0)
      errors.duration = "Duration must be a positive number";

    if (parseInt(formData.level) >= 2 && !formData.type)
      errors.type = "Type is required for this level";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };

    // Clear type when level changes to below 2
    if (name === "level" && parseInt(value) < 2) {
      newFormData.type = "";
    }

    // Clear subject when class_category changes
    if (name === "class_category") {
      newFormData.subject = "";
    }

    setFormData(newFormData);

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };

  // handle pagination
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare payload based on level
      const payload = { ...formData };
      if (parseInt(payload.level) < 2) {
        delete payload.type;
      }

      if (selectedExam) {
        await updateExam(selectedExam.id, payload);
        showSnackbar("Exam updated successfully!");
      } else {
        await createExam(payload);
        showSnackbar("Exam created successfully!");
      }

      await fetchExams();
      setOpenAddModal(false);
    } catch (error) {
      console.error("Error saving exam:", error);
      showSnackbar(
        error.response?.data?.message || "Error saving exam!",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (exam) => {
    setSelectedExam(exam);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await deleteExam(selectedExam.id);
      await fetchExams();
      setOpenDeleteModal(false);
      showSnackbar("Exam deleted successfully!");
    } catch (error) {
      console.error("Error deleting exam:", error);
      showSnackbar(
        error.response?.data?.message || "Error deleting exam!",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedExams.length === 0) {
      showSnackbar("No exams selected for deletion", "warning");
      return;
    }
    setIsBulkDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    setLoading(true);
    try {
      await Promise.all(selectedExams.map((examId) => deleteExam(examId)));
      await fetchExams();
      setSelectedExams([]);
      showSnackbar("Selected exams deleted successfully!");
      setIsBulkDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting selected exams:", error);
      showSnackbar(
        error.response?.data?.message || "Error deleting selected exams!",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleView = (exam) => {
    setSelectedExam(exam);
    setOpenViewModal(true);
  };

  const handleAddNew = () => {
    setSelectedExam(null);
    setFormData({
      name: "",
      subject: "",
      class_category: "",
      level: "",
      total_marks: "",
      duration: "",
      type: "",
    });
    setFormErrors({});
    setOpenAddModal(true);
  };

  // handle edit
  const handleEdit = (exam) => {
    setSelectedExam(exam);
    setFormData({
      name: exam.name,
      subject: exam.subject.id,
      class_category: exam.class_category.id,
      level: exam.level.id,
      total_marks: exam.total_marks,
      duration: exam.duration,
      // Only set type if level is 2 or above
      type: exam.level.id >= 2 ? exam.type : "",
    });
    setFormErrors({});
    setOpenAddModal(true);
  };

  const filteredExams = exams.filter((exam) => {
    return (
      (exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.id.toString().includes(searchQuery)) &&
      (selectedSubject
        ? exam.subject.subject_name === selectedSubject
        : true) &&
      (selectedLevel ? exam.level.name === selectedLevel : true) &&
      (selectedClassCategory
        ? exam.class_category.name === selectedClassCategory
        : true) &&
      (selectedType ? exam.type === selectedType : true)
    );
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          <Box
            sx={{
              mb: 4,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2
            }}
          >
            <Typography variant="h4" gutterBottom>
              Manage Exams
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                startIcon={<FaPlus />}
                onClick={handleAddNew}
                size={isMobile ? "small" : "medium"}
              >
                {isMobile ? "Add" : "Add New Exam"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<FaFilter />}
                onClick={() => setShowFilters(!showFilters)}
                size={isMobile ? "small" : "medium"}
              >
                {showFilters ? "Hide Filters" : "Filters"}
              </Button>
            </Box>
          </Box>

          <Box mt={2} mb={2}>
            <TextField
              label="Search Exams"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <FaSearch style={{ marginRight: 8 }} />,
              }}
            />
          </Box>

          <FilterContainer open={showFilters}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                label="Subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Subjects</em>
                </MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.subject_name}>
                    {subject.subject_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Class Category</InputLabel>
              <Select
                label="Class Category"
                value={selectedClassCategory}
                onChange={(e) => setSelectedClassCategory(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Categories</em>
                </MenuItem>
                {classCategories.map((classCategory, index) => (
                  <MenuItem key={index + 1} value={classCategory.name}>
                    {classCategory.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                label="Level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Levels</em>
                </MenuItem>
                {levels.map((level, index) => (
                  <MenuItem key={index + 1} value={level.name}>
                    {level.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Types</em>
                </MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>
          </FilterContainer>

          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              {selectedExams.length > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleBulkDelete}
                  sx={{ mb: 2 }}
                  size={isMobile ? "small" : "medium"}
                >
                  Delete Selected ({selectedExams.length})
                </Button>
              )}

              <ResponsiveTableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedExams.length > 0 &&
                            selectedExams.length < exams.length
                          }
                          checked={
                            exams.length > 0 &&
                            selectedExams.length === exams.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedExams(exams.map((exam) => exam.id));
                            } else {
                              setSelectedExams([]);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Level</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Marks</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredExams.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center">
                          No exams found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExams
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((exam, index) => (
                          <TableRow key={index} hover>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedExams.includes(exam.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedExams([...selectedExams, exam.id]);
                                  } else {
                                    setSelectedExams(
                                      selectedExams.filter((id) => id !== exam.id)
                                    );
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{exam.name.slice(0, 15)}</TableCell>
                            <TableCell>{exam.subject.subject_name}</TableCell>
                            <TableCell>{exam.level.name}</TableCell>
                            <TableCell>{exam.class_category.name}</TableCell>
                            <TableCell>{exam.total_marks}</TableCell>
                            <TableCell>{exam.duration} min</TableCell>
                            <TableCell>{exam.type}</TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => handleView(exam)}
                                size="small"
                                title="View"
                                color="primary"
                              >
                                <FaEye />
                              </IconButton>
                              <IconButton
                                onClick={() => handleEdit(exam)}
                                size="small"
                                title="Edit"
                                color="secondary"
                              >
                                <FaPencilAlt />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDelete(exam)}
                                size="small"
                                title="Delete"
                                color="error"
                              >
                                <FaTrash />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </ResponsiveTableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredExams.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
              />
            </CardContent>
          </Card>

          <StyledModal
            open={openAddModal}
            onClose={() => {
              if (!loading) setOpenAddModal(false);
            }}
          >
            <ModalContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedExam ? "Edit Exam" : "Add New Exam"}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!formErrors.class_category}>
                    <InputLabel>Class Category *</InputLabel>
                    <Select
                      name="class_category"
                      value={formData.class_category}
                      onChange={handleFormChange}
                      disabled={loading}
                    >
                      {classCategories.map((classCategory) => (
                        <MenuItem key={classCategory.id} value={classCategory.id}>
                          {classCategory.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.class_category && (
                      <FormHelperText>{formErrors.class_category}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!formErrors.subject}>
                    <InputLabel>Subject *</InputLabel>
                    <Select
                      name="subject"
                      value={formData.subject}
                      onChange={handleFormChange}
                      disabled={!formData.class_category || loading}
                    >
                      {subjects
                        .filter((subject) => subject.class_category === formData.class_category)
                        .map((subject) => (
                          <MenuItem key={subject.id} value={subject.id}>
                            {subject.subject_name}
                          </MenuItem>
                        ))}
                    </Select>
                    {formErrors.subject && (
                      <FormHelperText>{formErrors.subject}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!formErrors.level}>
                    <InputLabel>Level *</InputLabel>
                    <Select
                      name="level"
                      value={formData.level}
                      onChange={handleFormChange}
                      disabled={loading}
                    >
                      {levels.map((level) => (
                        <MenuItem key={level.id} value={level.id}>
                          {level.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.level && (
                      <FormHelperText>{formErrors.level}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Marks *"
                    name="total_marks"
                    value={formData.total_marks}
                    onChange={handleFormChange}
                    error={!!formErrors.total_marks}
                    helperText={formErrors.total_marks}
                    type="number"
                    InputProps={{ inputProps: { min: 1 } }}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={formData.level >= 2 ? 6 : 12}>
                  <TextField
                    fullWidth
                    label="Duration (minutes) *"
                    name="duration"
                    value={formData.duration}
                    onChange={handleFormChange}
                    error={!!formErrors.duration}
                    helperText={formErrors.duration}
                    type="number"
                    InputProps={{ inputProps: { min: 1 } }}
                    disabled={loading}
                  />
                </Grid>
                {formData.level >= 2 && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!formErrors.type}>
                      <InputLabel>Type *</InputLabel>
                      <Select
                        name="type"
                        value={formData.type}
                        onChange={handleFormChange}
                        disabled={loading}
                      >
                        <MenuItem value="online">Online</MenuItem>
                        <MenuItem value="offline">Offline</MenuItem>
                      </Select>
                      {formErrors.type && (
                        <FormHelperText>{formErrors.type}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                    }}
                  >
                    <Button
                      onClick={() => setOpenAddModal(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </ModalContent>
          </StyledModal>

          <ViewQuestionModal
            open={openViewModal}
            onClose={() => setOpenViewModal(false)}
            selectedExam={selectedExam}
          />

          <Dialog
            open={openDeleteModal}
            onClose={() => !loading && setOpenDeleteModal(false)}
            fullWidth
            maxWidth="xs"
          >
            <DialogTitle>Delete Exam</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete the exam "{selectedExam?.name}"? This action cannot be
                undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpenDeleteModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleConfirmDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={isBulkDeleteDialogOpen}
            onClose={() => !loading && setIsBulkDeleteDialogOpen(false)}
            fullWidth
            maxWidth="xs"
          >
            <DialogTitle>Delete Multiple Exams</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete {selectedExams.length} selected exams? This action cannot be
                undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setIsBulkDeleteDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleConfirmBulkDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Selected"}
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              severity={snackbar.severity}
              sx={{ width: "100%" }}
              variant="filled"
              elevation={6}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </Layout>
  );
};
export default ExamManagement;
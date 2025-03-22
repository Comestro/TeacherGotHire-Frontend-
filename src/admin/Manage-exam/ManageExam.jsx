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
  TablePagination,
  FormHelperText,
  IconButton,
  useMediaQuery,
  useTheme,
  Container,
  Chip,
  Menu,
  Tooltip,
  Paper,
  Avatar,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  FaPlus,
  FaFilter,
  FaSearch,
  FaEye,
  FaEllipsisV,
  FaCheck,
  FaTimes,
  FaUser,
  FaClock,
  FaBookOpen,
  FaLayerGroup,
  FaSchool,
  FaPencilAlt,
  FaTrash
} from "react-icons/fa";
import Layout from "../Admin/Layout";
import {
  getExam,
  deleteExam,
  createExam,
  updateExam,
} from "../../services/adminManageExam";
import { getSubjects } from "../../services/adminSubujectApi";
import { getClassCategory } from "../../services/adminClassCategoryApi";
import { getLevel } from "../../services/adminManageLevel";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(1),
}));

const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: theme.spacing(2),
  minWidth: "300px",
  width: "90%",
  maxWidth: "600px",
  maxHeight: "90vh",
  overflow: "auto",
  [theme.breakpoints.up("md")]: {
    width: "500px",
    padding: theme.spacing(3),
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
  width: '100%',
  [theme.breakpoints.up("md")]: {
    flexDirection: "column", // Changed from row to column for better layout
    alignItems: "stretch",
  },
}));

const ExamCard = styled(Card)(({ theme, status }) => ({
  height: '100%',
  marginBottom: theme?.spacing(2) || 16,
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", // Use literal shadow instead of theme.shadows[4]
  },
  border: status ? "1px solid #4CAF50" : "1px solid transparent",
  position: "relative",
  display: 'flex',
  flexDirection: 'column',
}));

const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
});

const StatusChip = styled(Chip)(({ theme, status }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: status ? "#4CAF50" : "#FF9800",
  color: "white",
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start", // Changed from center to allow wrapping
  marginBottom: theme.spacing(1),
  gap: theme.spacing(1),
  "& svg": {
    color: theme.palette.primary.main,
    minWidth: 20,
    marginTop: 4, // To align with text when it wraps
  },
  "& .MuiTypography-root": {
    wordBreak: "break-word", // Allow breaking long words
  }
}));

const ExamManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
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
  const [rowsPerPage, setRowsPerPage] = useState(9);
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
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [menuExam, setMenuExam] = useState(null);
  const [openStatusConfirmation, setOpenStatusConfirmation] = useState(false);
  const [statusAction, setStatusAction] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAddedBy, setSelectedAddedBy] = useState("");
  const [uniqueUsers, setUniqueUsers] = useState([]);


  // fetch all exams in ascending order
  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (exams.length > 0) {
      try {
        const users = new Set();
        exams.forEach(exam => {
          const user = getAssignedUserName(exam);
          if (user && user !== "Unknown") {
            users.add(user);
          }
        });
        setUniqueUsers(Array.from(users).sort());
        console.log("Unique users:", Array.from(users).sort());
      } catch (error) {
        console.error("Error processing unique users:", error);
        setUniqueUsers([]);
      }
    }
  }, [exams]);

  const getAssignedUserName = (exam) => {
    try {
      if (exam.assigneduser && exam.assigneduser.user) {
        const firstName = exam.assigneduser.user.Fname || '';
        const lastName = exam.assigneduser.user.Lname || '';
        return `${firstName} ${lastName}`.trim() || "Unknown";
      }
      return "Admin";
    } catch (error) {
      console.error("Error getting assigned user name:", error);
      return "Unknown";
    }
  };

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await getExam();
      response.sort((a, b) => b.id - a.id);
      setExams(response);
    } catch (error) {
      console.error("Error fetching exams:", error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to load exams";
      showSnackbar(errorMessage, "error");
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

    if (!formData.total_marks) {
      errors.total_marks = "Total marks is required";
    } else if (isNaN(formData.total_marks) || parseInt(formData.total_marks) <= 0) {
      errors.total_marks = "Total marks must be a positive number";
    }

    if (!formData.duration) {
      errors.duration = "Duration is required";
    } else if (isNaN(formData.duration) || parseInt(formData.duration) <= 0) {
      errors.duration = "Duration must be a positive number";
    }

    if (parseInt(formData.level) >= 2 && !formData.type) {
      errors.type = "Type is required for this level";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add real-time validation to handleFormChange
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

    // Real-time validation for the changed field
    const newErrors = { ...formErrors };

    if (name === 'name' && !value.trim()) {
      newErrors.name = "Exam name is required";
    } else if (name === 'total_marks') {
      if (!value) {
        newErrors.total_marks = "Total marks is required";
      } else if (isNaN(value) || parseInt(value) <= 0) {
        newErrors.total_marks = "Total marks must be a positive number";
      } else {
        delete newErrors.total_marks;
      }
    } else if (name === 'duration') {
      if (!value) {
        newErrors.duration = "Duration is required";
      } else if (isNaN(value) || parseInt(value) <= 0) {
        newErrors.duration = "Duration must be a positive number";
      } else {
        delete newErrors.duration;
      }
    } else if (name === 'type' && parseInt(formData.level) >= 2 && !value) {
      newErrors.type = "Type is required for this level";
    } else {
      delete newErrors[name];
    }

    setFormErrors(newErrors);
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
    // If message is an error object with response data
    if (message && typeof message === 'object' && message.response) {
      const serverMessage = message.response.data?.message ||
        message.response.data?.error ||
        "An error occurred";
      setSnackbar({
        open: true,
        message: serverMessage,
        severity: "error",
      });
    } else {
      setSnackbar({
        open: true,
        message,
        severity,
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Prepare payload with all required fields
      const payload = {
        subject: formData.subject,
        class_category: formData.class_category,
        level: formData.level,
        total_marks: formData.total_marks,
        duration: formData.duration,
        type: parseInt(formData.level) >= 2 ? formData.type : undefined
      };

      if (selectedExam) {
        const response = await updateExam(selectedExam.id, payload);
        showSnackbar(response.message || "Exam updated successfully!");
      } else {
        const response = await createExam(payload);
        showSnackbar(response.message || "Exam created successfully!");
      }

      await fetchExams();
      setOpenAddModal(false);
    } catch (error) {
      console.error("Error saving exam:", error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to save exam";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setOpenDeleteModal(true);
    setActionMenuAnchor(null);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      const response = await deleteExam(menuExam.id);
      await fetchExams();
      setOpenDeleteModal(false);
      showSnackbar(response.message || "Exam deleted successfully!");
    } catch (error) {
      console.error("Error deleting exam:", error);
      showSnackbar(error);
    } finally {
      setLoading(false);
    }
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
  const handleEdit = () => {
    setSelectedExam(menuExam);
    setFormData({
      subject: menuExam.subject.id,
      class_category: menuExam.class_category.id,
      level: menuExam.level.id,
      total_marks: menuExam.total_marks,
      duration: menuExam.duration,
      type: menuExam.level.id >= 2 ? menuExam.type : "",
    });
    setFormErrors({});
    setOpenAddModal(true);
    setActionMenuAnchor(null);
  };

  const handleOpenMenu = (event, exam) => {
    setActionMenuAnchor(event.currentTarget);
    setMenuExam(exam);
  };

  const handleCloseMenu = () => {
    setActionMenuAnchor(null);
  };

  const handleStatusChange = (action) => {
    setStatusAction(action);
    setOpenStatusConfirmation(true);
    setActionMenuAnchor(null);
  };

  const handleConfirmStatusChange = async () => {
    setLoading(true);
    try {
      // Update exam status based on the action (accept = true, reject = false)
      const payload = {
        status: statusAction === 'accept'
      };

      const response = await updateExam(menuExam.id, payload);

      showSnackbar(
        statusAction === 'accept'
          ? "Exam accepted successfully!"
          : "Exam rejected successfully!",
        "success"
      );

      await fetchExams();
      setOpenStatusConfirmation(false);
    } catch (error) {
      console.error("Error updating exam status:", error);
      showSnackbar("Failed to update exam status", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter((exam) => {
    // Get and normalize the assigned user name for this exam
    const examUser = getAssignedUserName(exam);

    // Debug log for troubleshooting
    if (selectedAddedBy && examUser !== selectedAddedBy) {
      console.log(`Filter mismatch: Exam user "${examUser}" !== selected "${selectedAddedBy}"`);
    }

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
      (selectedType ? exam.type === selectedType : true) &&
      // New filters
      (selectedStatus !== ""
        ? exam.status === (selectedStatus === "true")
        : true) &&
      (selectedAddedBy !== ""
        ? examUser === selectedAddedBy
        : true)
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
                {isMobile ? "Add" : "Add New Exam Set"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<FaFilter />}
                onClick={() => setShowFilters(!showFilters)}
                size={isMobile ? "small" : "medium"}
                sx={{
                  borderWidth: showFilters ? 2 : 1,
                  borderColor: showFilters ? theme.palette.primary.main : 'inherit',
                  fontWeight: showFilters ? 'bold' : 'normal'
                }}
              >
                {isMobile ? (showFilters ? "Hide" : "Filter") : (showFilters ? "Hide Filters" : "Filters")}
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
            {/* First row of filters */}
            <Box sx={{
              width: '100%',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              mb: 2
            }}>
              <FormControl variant="outlined" fullWidth size="small">
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

              <FormControl variant="outlined" fullWidth size="small">
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

              <FormControl variant="outlined" fullWidth size="small">
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
            </Box>

            {/* Second row of filters */}
            <Box sx={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2
            }}>
              <FormControl variant="outlined" fullWidth size="small">
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

              {/* New Status Filter */}
              <FormControl variant="outlined" fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  startAdornment={
                    selectedStatus !== "" ? (
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        {selectedStatus === "true" ? (
                          <FaCheck style={{ color: '#4CAF50', fontSize: '0.8rem' }} />
                        ) : (
                          <FaTimes style={{ color: '#FF9800', fontSize: '0.8rem' }} />
                        )}
                      </Box>
                    ) : null
                  }
                >
                  <MenuItem value="">
                    <em>All Status</em>
                  </MenuItem>
                  <MenuItem value="true" sx={{ color: '#4CAF50', fontWeight: 500 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FaCheck /> Approved
                    </Box>
                  </MenuItem>
                  <MenuItem value="false" sx={{ color: '#FF9800', fontWeight: 500 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FaTimes /> Pending
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* New Added By Filter */}
              <FormControl variant="outlined" fullWidth size="small">
                <InputLabel>Added By</InputLabel>
                <Select
                  label="Added By"
                  value={selectedAddedBy}
                  onChange={(e) => setSelectedAddedBy(e.target.value)}
                  startAdornment={
                    selectedAddedBy !== "" ? (
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        <FaUser style={{ fontSize: '0.8rem' }} />
                      </Box>
                    ) : null
                  }
                >
                  <MenuItem value="">
                    <em>All Users</em>
                  </MenuItem>
                  {uniqueUsers.map((user, index) => (
                    <MenuItem key={`user-${index}`} value={user}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                          {user.charAt(0)}
                        </Avatar>
                        {user}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Filter actions */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 2,
              gap: 1,
              width: '100%'
            }}>
              <Button
                size="small"
                startIcon={<FaTimes />}
                onClick={() => {
                  setSelectedSubject("");
                  setSelectedClassCategory("");
                  setSelectedLevel("");
                  setSelectedType("");
                  setSelectedStatus("");
                  setSelectedAddedBy("");
                }}
                sx={{ textTransform: 'none' }}
              >
                Clear Filters
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<FaFilter />}
                onClick={() => setShowFilters(false)}
                sx={{ textTransform: 'none' }}
              >
                Apply Filters
              </Button>
            </Box>
          </FilterContainer>

          {filteredExams.length === 0 ? (
            <Paper
              elevation={1}
              sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: '#f9f9f9',
                borderRadius: 2,
                mt: 2
              }}
            >
              <Box sx={{ mb: 2 }}>
                <FaSearch style={{ fontSize: '2rem', opacity: 0.5 }} />
              </Box>
              <Typography variant="h6" gutterBottom>No exams found</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Try adjusting your search criteria or filters
              </Typography>
              {(searchQuery || selectedSubject || selectedLevel || selectedClassCategory ||
                selectedType || selectedStatus || selectedAddedBy) && (
                  <Button
                    startIcon={<FaTimes />}
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedSubject("");
                      setSelectedClassCategory("");
                      setSelectedLevel("");
                      setSelectedType("");
                      setSelectedStatus("");
                      setSelectedAddedBy("");
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
            </Paper>
          ) : (
            <>
              {/* // Update the Grid item sizing */}
              <Grid container spacing={2}>
                {filteredExams
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((exam) => (
                    <Grid item xs={12} sm={6} lg={4} key={exam.id}>
                      <ExamCard status={exam.status} elevation={2}>
                        <StatusChip
                          label={exam.status ? "Approved" : "Pending"}
                          status={exam.status}
                          size="small"
                        />
                        <StyledCardContent>
                          <Link to={`/admin/exam/${exam.id}`} >
                            <Typography
                              variant="h6"
                              component="h2"
                              sx={{
                                mb: 2,
                                fontWeight: 'bold',
                                pr: { xs: 10, sm: 8 }, // More space for status chip on mobile
                                fontSize: { xs: '1rem', sm: '1.25rem' }, // Smaller font on mobile
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {exam.name}
                            </Typography>

                            <Grid container spacing={1}>
                              <Grid item xs={12} sm={6}>
                                <InfoItem>
                                  <FaBookOpen />
                                  <Typography variant="body2">
                                    <strong>Subject:</strong> {exam.subject.subject_name}
                                  </Typography>
                                </InfoItem>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <InfoItem>
                                  <FaLayerGroup />
                                  <Typography variant="body2">
                                    <strong>Level:</strong> {exam.level.name}
                                  </Typography>
                                </InfoItem>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <InfoItem>
                                  <FaSchool />
                                  <Typography variant="body2">
                                    <strong>Class:</strong> {exam.class_category.name}
                                  </Typography>
                                </InfoItem>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <InfoItem>
                                  <FaClock />
                                  <Typography variant="body2">
                                    <strong>Duration:</strong> {exam.duration} min
                                  </Typography>
                                </InfoItem>
                              </Grid>
                            </Grid>
                          </Link>
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 2,
                            pt: 2,
                            borderTop: '1px solid #eee'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                sx={{
                                  width: 24,
                                  height: 24,
                                  mr: 1,
                                  bgcolor: theme.palette.primary.main,
                                  fontSize: '0.8rem'
                                }}
                              >
                                <FaUser size={12} />
                              </Avatar>
                              <Typography variant="body2">
                                <strong>Added by:</strong> {getAssignedUserName(exam)}
                              </Typography>
                            </Box>

                            <Box>
                              <IconButton
                                component={Link}
                                to={`/admin/exam/${exam.id}`}
                                color="primary"
                                size="small"
                                title="View Details"
                              >
                                <FaEye />
                              </IconButton>
                              <IconButton
                                onClick={(e) => handleOpenMenu(e, exam)}
                                size="small"
                              >
                                <FaEllipsisV />
                              </IconButton>
                            </Box>
                          </Box>
                        </StyledCardContent>
                      </ExamCard>

                    </Grid>
                  ))}
              </Grid>

              <Box sx={{
                mt: 2,
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: 'white',
                borderRadius: 1,
                boxShadow: 1
              }}>
                <TablePagination
                  component="div"
                  count={filteredExams.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={isMobile ? [9, 18] : [9, 18, 36]} // Fewer options on mobile
                  labelRowsPerPage={isMobile ? "Rows:" : "Exams per page:"}
                  labelDisplayedRows={({ from, to, count }) =>
                    isMobile ? `${from}-${to} of ${count}` : `${from}-${to} of ${count} exams`
                  }
                  sx={{
                    '.MuiTablePagination-selectLabel': {
                      display: { xs: 'none', sm: 'block' }
                    }
                  }}
                />
              </Box>
            </>
          )}

          {/* Action Menu */}
          <Menu
            anchorEl={actionMenuAnchor}
            open={Boolean(actionMenuAnchor)}
            onClose={handleCloseMenu}
            PaperProps={{
              elevation: 3,
              sx: { minWidth: 200 },
            }}
          >
            <MenuItem onClick={handleEdit}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FaPencilAlt size={14} />
                <Typography>Edit Exam</Typography>
              </Box>
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusChange('accept')}
              disabled={menuExam?.status === true} // Disable if already approved
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#4CAF50' }}>
                <FaCheck size={14} />
                <Typography>Accept Exam</Typography>
              </Box>
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusChange('reject')}
              disabled={menuExam?.status === false} // Disable if already rejected
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#FF9800' }}>
                <FaTimes size={14} />
                <Typography>Reject Exam</Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleDelete} sx={{ color: theme.palette.error.main }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FaTrash size={14} />
                <Typography>Delete Exam</Typography>
              </Box>
            </MenuItem>
          </Menu>

          {/* Modals */}
          <StyledModal
            open={openAddModal}
            onClose={() => {
              if (!loading) setOpenAddModal(false);
            }}
          >
            <ModalContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedExam ? "Edit Exam Set" : "Add New Exam Set"}
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration (minutes) *"
                    name="duration"
                    value={formData.duration}
                    onChange={handleFormChange}
                    error={!!formErrors.duration}
                    helperText={formErrors.duration}
                    type="number"
                  />
                </Grid>
                {parseInt(formData.level) >= 2 && (
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
              </Grid>
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </Box>
            </ModalContent>
          </StyledModal>

          <Dialog
            open={openDeleteModal}
            onClose={() => {
              if (!loading) setOpenDeleteModal(false);
            }}
          >
            <DialogTitle>Delete Exam</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this exam set?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteModal(false)} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={openStatusConfirmation}
            onClose={() => {
              if (!loading) setOpenStatusConfirmation(false);
            }}
          >
            <DialogTitle>{statusAction === 'accept' ? 'Accept' : 'Reject'} Exam</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to {statusAction === 'accept' ? 'accept' : 'reject'} this exam set?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenStatusConfirmation(false)} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmStatusChange}
                color="primary"
                disabled={loading}
              >
                {loading ? "Processing..." : statusAction === 'accept' ? 'Accept' : 'Reject'}
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
          </Snackbar>
        </Box>
      </Container>
    </Layout>
  );
}

export default ExamManagement;
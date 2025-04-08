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
  Badge,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel
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
  FaTrash,
  FaListUl,
  FaFileAlt,
  FaSync,
  FaTh,
  FaQuestionCircle,
  FaDatabase,
  FaTable,
  FaThLarge,
  FaLaptop
} from "react-icons/fa";
import { MdAdd, MdRefresh, MdFilterList, MdClear, MdAssignment, MdTimeline, MdViewList, MdGridView, MdExpandLess, MdExpandMore } from 'react-icons/md';
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
  borderRadius: "10px",
  padding: theme.spacing(3),
  minWidth: "300px",
  width: "90%",
  maxWidth: "600px",
  maxHeight: "90vh",
  overflow: "auto",
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(3),
  backgroundColor: '#f8f9fa',
  borderRadius: '10px',
  boxShadow: 'rgba(0, 0, 0, 0.04) 0px 3px 5px',
  width: '100%',
  border: '1px solid #e0e0e0',
}));

const FilterSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  width: '100%',
}));

const FilterTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  fontSize: '0.9rem',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
}));

const FilterBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    fontSize: '0.7rem',
    minWidth: '18px',
    height: '18px',
    padding: '0 5px',
  },
}));

const HeaderActionButton = styled(Button)(({ theme }) => ({
  fontWeight: 500,
  borderRadius: '8px',
  textTransform: 'none',
  boxShadow: 'none',
  padding: theme.spacing(1, 2),
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
    transform: 'translateY(-2px)',
  },
}));

const ExamCard = styled(Card)(({ theme, status }) => ({
  height: '100%',
  marginBottom: theme?.spacing(2) || 16,
  transition: "all 0.3s ease",
  borderRadius: '12px',
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0px 8px 20px rgba(0,0,0,0.08)",
  },
  border: status ? "1px solid rgba(76, 175, 80, 0.3)" : "1px solid rgba(255, 152, 0, 0.3)",
  position: "relative",
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: status ? 'rgba(76, 175, 80, 0.02)' : 'rgba(255, 152, 0, 0.02)',
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2.5),
  '&:last-child': {
    paddingBottom: theme.spacing(2.5),
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  position: "absolute",
  top: theme.spacing(1.5),
  right: theme.spacing(1.5),
  backgroundColor: status ? "#4CAF50" : "#FF9800",
  color: "white",
  fontWeight: 600,
  fontSize: '0.75rem',
  height: '24px',
  boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  zIndex: 1,
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  marginBottom: theme.spacing(1.5),
  gap: theme.spacing(1),
  "& svg": {
    color: theme.palette.primary.main,
    minWidth: 20,
    marginTop: 3,
  },
  "& .MuiTypography-root": {
    wordBreak: "break-word",
    lineHeight: 1.4,
  }
}));

const ViewToggleButton = styled(Button)(({ theme, active }) => ({
  minWidth: '42px',
  height: '36px',
  padding: theme.spacing(0.75, 1.25),
  borderRadius: '6px',
  color: active ? theme.palette.primary.dark : theme.palette.text.secondary,
  backgroundColor: active ? 'rgba(25, 118, 210, 0.12)' : 'transparent',
  border: active ? `1px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
  '&:hover': {
    backgroundColor: active ? 'rgba(25, 118, 210, 0.18)' : 'rgba(0, 0, 0, 0.04)',
  },
  transition: 'all 0.2s ease',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  '& .MuiTableCell-head': {
    backgroundColor: '#f5f5f5',
    color: theme.palette.text.primary,
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: theme.spacing(1.5),
  },
  '& .MuiTableRow-root': {
    '&:nth-of-type(even)': {
      backgroundColor: 'rgba(0, 0, 0, 0.01)',
    },
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },
  '& .MuiTableCell-body': {
    fontSize: '0.875rem',
    padding: theme.spacing(1.5),
  },
}));

const CollapsibleFilterContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  width: '100%',
}));

const MobileFilterButton = styled(Button)(({ theme, isActive }) => ({
  borderRadius: '8px',
  padding: theme.spacing(1),
  textTransform: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  backgroundColor: isActive ? 'rgba(25, 118, 210, 0.08)' : '#fff',
  color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
  fontWeight: 500,
  '&:hover': {
    backgroundColor: isActive ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
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
  const [showFilters, setShowFilters] = useState(true);
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
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [menuExam, setMenuExam] = useState(null);
  const [openStatusConfirmation, setOpenStatusConfirmation] = useState(false);
  const [statusAction, setStatusAction] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAddedBy, setSelectedAddedBy] = useState("");
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [viewMode, setViewMode] = useState('card');

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    setSelectedSubject("");
  }, [selectedClassCategory]);

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

    const selectedLevel = levels.find(level => level.id === parseInt(formData.level));
    if (selectedLevel && selectedLevel.level_code >= 2.0 && !formData.type) {
      errors.type = "Type is required for this level";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };

    if (name === "level") {
      const selectedLevel = levels.find(level => level.id === parseInt(value));
      if (selectedLevel && selectedLevel.level_code < 2.0) {
        newFormData.type = "";
      }
    }

    if (name === "class_category") {
      newFormData.subject = "";
    }

    setFormData(newFormData);

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
    } else if (name === 'type') {
      const selectedLevel = levels.find(level => level.id === parseInt(formData.level));
      if (selectedLevel && selectedLevel.level_code >= 2.0 && !value) {
        newErrors.type = "Type is required for this level";
      } else {
        delete newErrors.type;
      }
    } else {
      delete newErrors[name];
    }

    setFormErrors(newErrors);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const showSnackbar = (message, severity = "success") => {
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
      const payload = {
        subject: formData.subject,
        class_category: formData.class_category,
        level: formData.level,
        total_marks: formData.total_marks,
        duration: formData.duration,
        type: undefined
      };
      
      const selectedLevel = levels.find(level => level.id === parseInt(formData.level));
      if (selectedLevel && selectedLevel.level_code >= 2.0) {
        payload.type = formData.type;
      }

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

  const handleEdit = () => {
    setSelectedExam(menuExam);
    setFormData({
      subject: menuExam.subject.id,
      class_category: menuExam.class_category.id,
      level: menuExam.level.id,
      total_marks: menuExam.total_marks,
      duration: menuExam.duration,
      type: menuExam.level.level_code >= 2.0 ? menuExam.type : "",
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

  const refreshData = async () => {
    setLoading(true);
    try {
      await fetchExams();
      showSnackbar("Data refreshed successfully", "success");
    } catch (error) {
      console.error("Error refreshing data:", error);
      showSnackbar("Failed to refresh data", "error");
    } finally {
      setLoading(false);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedSubject) count++;
    if (selectedLevel) count++;
    if (selectedClassCategory) count++;
    if (selectedType) count++;
    if (selectedStatus) count++;
    if (selectedAddedBy) count++;
    return count;
  };

  const filteredExams = exams.filter((exam) => {
    const examUser = getAssignedUserName(exam);

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
        <Box sx={{
          p: { xs: 2, sm: 3 },
          backgroundColor: '#F9FAFC',
          minHeight: '100vh'
        }}>
          {/* Header Section Redesign */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 3,
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.dark,
                  width: { xs: 40, md: 48 },
                  height: { xs: 40, md: 48 },
                  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px'
                }}
              >
                <MdAssignment size={24} />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    color: '#263238',
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                    lineHeight: 1.2
                  }}
                >
                  Manage Exams
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Create, edit and manage your exam sets
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
              {/* View toggle buttons */}
              <Box sx={{
                display: 'flex',
                mr: { xs: 1, sm: 2 },
                backgroundColor: '#f3f6f9',
                borderRadius: '8px',
                p: 0.5,
                border: '1px solid #e0e0e0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <Tooltip title="Card View" arrow placement="top">
                  <ViewToggleButton
                    size="small"
                    onClick={() => setViewMode('card')}
                    active={viewMode === 'card'}
                    aria-label="Card View"
                    sx={{
                      mr: 0.5,
                      color: viewMode === 'card' ? theme.palette.primary.main : theme.palette.text.secondary,
                      '&:hover': {
                        backgroundColor: viewMode === 'card'
                          ? 'rgba(25, 118, 210, 0.18)'
                          : 'rgba(0, 0, 0, 0.04)',
                      }
                    }}
                  >
                    <MdGridView size={20} />
                  </ViewToggleButton>
                </Tooltip>
                <Tooltip title="Table View" arrow placement="top">
                  <ViewToggleButton
                    size="small"
                    onClick={() => setViewMode('table')}
                    active={viewMode === 'table'}
                    aria-label="Table View"
                    sx={{
                      color: viewMode === 'table' ? theme.palette.primary.main : theme.palette.text.secondary,
                      '&:hover': {
                        backgroundColor: viewMode === 'table'
                          ? 'rgba(25, 118, 210, 0.18)'
                          : 'rgba(0, 0, 0, 0.04)',
                      }
                    }}
                  >
                    <MdViewList size={20} />
                  </ViewToggleButton>
                </Tooltip>
              </Box>

              <HeaderActionButton
                variant="outlined"
                color="primary"
                startIcon={<MdRefresh size={20} />}
                onClick={refreshData}
                size={isMobile ? "small" : "medium"}
              >
                {isMobile ? "" : "Refresh"}
              </HeaderActionButton>
              <HeaderActionButton
                variant="contained"
                startIcon={<MdAdd size={20} />}
                onClick={handleAddNew}
                size={isMobile ? "small" : "medium"}
                sx={{
                  bgcolor: theme.palette.primary.dark,
                  '&:hover': {
                    bgcolor: theme.palette.primary.main,
                  }
                }}
              >
                {isMobile ? "Add" : "Add New Exam"}
              </HeaderActionButton>
            </Stack>
          </Paper>

          {/* Search and Filters Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 3,
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              backgroundColor: '#fff'
            }}
          >
            {/* Search and clear button layout */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  label="Search Exams"
                  variant="outlined"
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <FaSearch style={{ marginRight: 8, color: '#757575' }} />,
                    endAdornment: searchQuery ? (
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery("")}
                        sx={{ color: 'text.secondary' }}
                      >
                        <MdClear />
                      </IconButton>
                    ) : null,
                    sx: { borderRadius: '8px' }
                  }}
                  placeholder="Search by exam name or ID..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#bdbdbd',
                      },
                    }
                  }}
                />
              </Grid>

              {/* Clear Filters Button Column */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', height: '100%', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<MdClear />}
                    onClick={() => {
                      setSelectedSubject("");
                      setSelectedClassCategory("");
                      setSelectedLevel("");
                      setSelectedType("");
                      setSelectedStatus("");
                      setSelectedAddedBy("");
                    }}
                    disabled={getActiveFilterCount() === 0}
                    fullWidth
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 500,
                      height: '100%',
                      borderColor: getActiveFilterCount() > 0 ? 'primary.main' : '#e0e0e0',
                      color: getActiveFilterCount() > 0 ? 'primary.main' : 'text.disabled',
                    }}
                  >
                    {getActiveFilterCount() > 0 ? (
                      <>
                        Clear Filters
                        <Chip
                          size="small"
                          label={getActiveFilterCount()}
                          color="primary"
                          sx={{ ml: 1, height: 22 }}
                        />
                      </>
                    ) : "No Filters Applied"}
                  </Button>

                  {searchQuery && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => setSearchQuery("")}
                      sx={{
                        borderRadius: '8px',
                        minWidth: 'auto',
                        width: 'auto',
                        px: 1.5,
                        height: '100%'
                      }}
                    >
                      <MdClear />
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Mobile filter toggle button */}
            {isMobile && (
              <Box sx={{ mt: 2 }}>
                <MobileFilterButton
                  onClick={() => setShowFilters(!showFilters)}
                  isActive={showFilters && getActiveFilterCount() > 0}
                  startIcon={<MdFilterList />}
                  variant="outlined"
                >
                  Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
                  {getActiveFilterCount() > 0 ? (
                    <Chip
                      size="small"
                      label={getActiveFilterCount()}
                      color="primary"
                      sx={{ ml: 1, height: 22 }}
                    />
                  ) : (
                    <IconButton size="small" sx={{ p: 0, ml: 1 }}>
                      {showFilters ? <MdExpandLess /> : <MdExpandMore />}
                    </IconButton>
                  )}
                </MobileFilterButton>
              </Box>
            )}

            <CollapsibleFilterContainer
              sx={{
                maxHeight: showFilters ? '1000px' : isMobile ? '0px' : '1000px',
                visibility: showFilters || !isMobile ? 'visible' : 'hidden',
                mt: 2,
                opacity: showFilters || !isMobile ? 1 : 0,
                transition: 'all 0.3s ease',
              }}
            >
              <Box sx={{
                p: 2,
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                border: '1px solid #e0e0e0',
              }}>
                {/* Filter Header */}
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                  pb: 1.5,
                  borderBottom: '1px solid #eeeeee'
                }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MdFilterList /> Filter Options
                      {getActiveFilterCount() > 0 && (
                        <Chip
                          size="small"
                          label={getActiveFilterCount()}
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>
                  </Typography>

                  {getActiveFilterCount() > 0 && (
                    <Button
                      size="small"
                      startIcon={<MdClear size={16} />}
                      onClick={() => {
                        setSelectedSubject("");
                        setSelectedClassCategory("");
                        setSelectedLevel("");
                        setSelectedType("");
                        setSelectedStatus("");
                        setSelectedAddedBy("");
                      }}
                      sx={{
                        textTransform: 'none',
                        color: theme.palette.grey[700],
                        fontWeight: 500,
                      }}
                    >
                      Clear All
                    </Button>
                  )}
                </Box>

                {/* Main Filters - Optimized Layout with Added By & Type */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={isMobile ? 6 : 2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Class Category</InputLabel>
                      <Select
                        label="Class Category"
                        value={selectedClassCategory}
                        onChange={(e) => setSelectedClassCategory(e.target.value)}
                        sx={{ borderRadius: '8px' }}
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
                  </Grid>

                  <Grid item xs={12} sm={6} md={isMobile ? 6 : 2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Subject</InputLabel>
                      <Select
                        label="Subject"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value="">
                          <em>All Subjects</em>
                        </MenuItem>
                        {subjects
                          .filter(subject =>
                            selectedClassCategory ?
                              classCategories.find(cat => cat.name === selectedClassCategory)?.subjects
                                .some(s => s.id === subject.id) :
                              true
                          )
                          .map((subject) => (
                            <MenuItem key={subject.id} value={subject.subject_name}>
                              {subject.subject_name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={isMobile ? 6 : 2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Level</InputLabel>
                      <Select
                        label="Level"
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        sx={{ borderRadius: '8px' }}
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
                  </Grid>

                  <Grid item xs={12} sm={6} md={isMobile ? 6 : 2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        label="Status"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value="">
                          <em>All Status</em>
                        </MenuItem>
                        <MenuItem value="true" sx={{ color: '#4CAF50' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FaCheck size={12} /> Approved
                          </Box>
                        </MenuItem>
                        <MenuItem value="false" sx={{ color: '#FF9800' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FaClock size={12} /> Pending
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Moved to the filter section for both mobile and desktop */}
                  <Grid item xs={12} sm={6} md={isMobile ? 6 : 2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Added By</InputLabel>
                      <Select
                        label="Added By"
                        value={selectedAddedBy}
                        onChange={(e) => setSelectedAddedBy(e.target.value)}
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value="">
                          <em>All Users</em>
                        </MenuItem>
                        {uniqueUsers.map((user) => (
                          <MenuItem key={user} value={user}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                sx={{
                                  width: 24,
                                  height: 24,
                                  fontSize: '0.75rem',
                                  bgcolor: theme.palette.primary.dark
                                }}
                              >
                                {user.charAt(0)}
                              </Avatar>
                              {user}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={isMobile ? 6 : 2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Exam Type</InputLabel>
                      <Select
                        label="Exam Type"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        sx={{ borderRadius: '8px' }}
                      >
                        <MenuItem value="">
                          <em>All Types</em>
                        </MenuItem>
                        <MenuItem value="online">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FaLaptop size={12} /> Online
                          </Box>
                        </MenuItem>
                        <MenuItem value="offline">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FaFileAlt size={12} /> Offline
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Active Filters */}
                {getActiveFilterCount() > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedSubject && (
                      <Chip
                        label={`Subject: ${selectedSubject}`}
                        onDelete={() => setSelectedSubject("")}
                        size="small"
                        sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}
                      />
                    )}
                    {selectedClassCategory && (
                      <Chip
                        label={`Class: ${selectedClassCategory}`}
                        onDelete={() => setSelectedClassCategory("")}
                        size="small"
                        sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}
                      />
                    )}
                    {selectedLevel && (
                      <Chip
                        label={`Level: ${selectedLevel}`}
                        onDelete={() => setSelectedLevel("")}
                        size="small"
                        sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}
                      />
                    )}
                    {selectedType && (
                      <Chip
                        label={`Type: ${selectedType === "online" ? "Online" : "Offline"}`}
                        onDelete={() => setSelectedType("")}
                        size="small"
                        sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}
                      />
                    )}
                    {selectedStatus && (
                      <Chip
                        label={`Status: ${selectedStatus === "true" ? "Approved" : "Pending"}`}
                        onDelete={() => setSelectedStatus("")}
                        size="small"
                        sx={{
                          bgcolor: selectedStatus === "true" ? '#e8f5e9' : '#fff3e0',
                          color: selectedStatus === "true" ? '#2e7d32' : '#ef6c00'
                        }}
                      />
                    )}
                    {selectedAddedBy && (
                      <Chip
                        label={`User: ${selectedAddedBy}`}
                        onDelete={() => setSelectedAddedBy("")}
                        size="small"
                        sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}
                        avatar={
                          <Avatar sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
                            {selectedAddedBy.charAt(0)}
                          </Avatar>
                        }
                      />
                    )}
                  </Box>
                )}
              </Box>
            </CollapsibleFilterContainer>
          </Paper>

          {/* Rest of the component remains unchanged */}
          {filteredExams.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: '#fff',
                borderRadius: '8px',
                mt: 2,
                border: '1px solid #e0e0e0',
              }}
            >
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <FaSearch style={{ fontSize: '2.5rem', opacity: 0.4, color: '#757575' }} />
              </Box>
              <Typography variant="h6" gutterBottom fontWeight={500} color="#424242">
                No exams found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '500px', mx: 'auto' }}>
                Try adjusting your search criteria or filters to find what you're looking for
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
                    sx={{
                      borderRadius: '6px',
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
            </Paper>
          ) : (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredExams.length} {filteredExams.length === 1 ? 'exam' : 'exams'}
                  {(searchQuery || selectedSubject || selectedLevel || selectedClassCategory ||
                    selectedType || selectedStatus || selectedAddedBy) && ' with applied filters'}
                </Typography>
              </Box>

              {viewMode === 'card' ? (
                <Grid container spacing={2.5}>
                  {filteredExams
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((exam) => (
                      <Grid item xs={12} sm={6} md={6} lg={6} key={exam.id}>
                        <ExamCard status={exam.status} elevation={0}>
                          <StatusChip
                            label={exam.status ? "Approved" : "Pending"}
                            status={exam.status}
                            size="small"
                            icon={exam.status ? <FaCheck size={10} /> : <FaClock size={10} />}
                          />
                          <StyledCardContent>
                            <Link to={`/admin/exam/${exam.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <Typography
                                variant="h6"
                                component="h2"
                                sx={{
                                  mb: 2,
                                  fontWeight: 600,
                                  pr: { xs: 11, sm: 9 },
                                  fontSize: { xs: '1rem', sm: '1.125rem' },
                                  lineHeight: 1.3,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  color: '#1a237e',
                                  '&:hover': {
                                    color: theme.palette.primary.main
                                  },
                                  position: 'relative',
                                  zIndex: 0,
                                }}
                              >
                                {exam.name}
                              </Typography>

                              <Grid container spacing={1.5} sx={{ mb: 1 }}>
                                <Grid item xs={12} sm={6}>
                                  <InfoItem>
                                    <FaBookOpen size={14} />
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                        Subject
                                      </Typography>
                                      <Typography variant="body2" fontWeight={500}>
                                        {exam.subject.subject_name}
                                      </Typography>
                                    </Box>
                                  </InfoItem>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <InfoItem>
                                    <FaLayerGroup size={14} />
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                        Level
                                      </Typography>
                                      <Typography variant="body2" fontWeight={500}>
                                        {exam.level.name}
                                      </Typography>
                                    </Box>
                                  </InfoItem>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <InfoItem>
                                    <FaSchool size={14} />
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                        Class
                                      </Typography>
                                      <Typography variant="body2" fontWeight={500}>
                                        {exam.class_category.name}
                                      </Typography>
                                    </Box>
                                  </InfoItem>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <InfoItem>
                                    <FaClock size={14} />
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                        Duration
                                      </Typography>
                                      <Typography variant="body2" fontWeight={500}>
                                        {exam.duration} min
                                      </Typography>
                                    </Box>
                                  </InfoItem>
                                </Grid>
                              </Grid>

                              <Box sx={{
                                mt: 1,
                                mb: 2,
                                p: 1.5,
                                borderRadius: '6px',
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #eaeaea'
                              }}>
                                <InfoItem sx={{ mb: 0 }}>
                                  <FaListUl size={14} />
                                  <Box sx={{ width: '100%' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                        Questions
                                      </Typography>
                                      <Typography variant="caption" fontWeight={600} color="primary">
                                        {exam.questions?.length || 0} total
                                      </Typography>
                                    </Box>

                                    {exam.questions?.length > 0 && (
                                      <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        gap: 1.5
                                      }}>
                                        <Tooltip title="English Questions">
                                          <Chip
                                            size="small"
                                            label={`${exam.questions.filter(q => q.language === "English").length || 0} EN`}
                                            sx={{
                                              height: '20px',
                                              fontSize: '0.7rem',
                                              fontWeight: 600,
                                              backgroundColor: theme.palette.primary.light,
                                              color: theme.palette.primary.dark
                                            }}
                                          />
                                        </Tooltip>
                                        <Tooltip title="Hindi Questions">
                                          <Chip
                                            size="small"
                                            label={`${exam.questions.filter(q => q.language === "Hindi").length || 0} HI`}
                                            sx={{
                                              height: '20px',
                                              fontSize: '0.7rem',
                                              fontWeight: 600,
                                              backgroundColor: theme.palette.secondary.light,
                                              color: theme.palette.secondary.dark
                                            }}
                                          />
                                        </Tooltip>
                                      </Box>
                                    )}
                                  </Box>
                                </InfoItem>
                              </Box>
                            </Link>

                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mt: 'auto',
                              pt: 2,
                              borderTop: '1px solid #eaeaea'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Tooltip title={`Added by ${getAssignedUserName(exam)}`}>
                                  <Avatar
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      mr: 1,
                                      bgcolor: theme.palette.primary.main,
                                      fontSize: '0.8rem',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                  >
                                    {getAssignedUserName(exam).charAt(0)}
                                  </Avatar>
                                </Tooltip>
                                <Typography variant="body2" noWrap sx={{ maxWidth: '150px' }}>
                                  {getAssignedUserName(exam)}
                                </Typography>
                              </Box>

                              <Box>
                                <Tooltip title="View Details">
                                  <IconButton
                                    component={Link}
                                    to={`/admin/exam/${exam.id}`}
                                    color="primary"
                                    size="small"
                                    sx={{
                                      backgroundColor: 'rgba(33, 150, 243, 0.08)',
                                      mr: 1,
                                      '&:hover': {
                                        backgroundColor: 'rgba(33, 150, 243, 0.15)',
                                      }
                                    }}
                                  >
                                    <FaEye size={14} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="More Actions">
                                  <IconButton
                                    onClick={(e) => handleOpenMenu(e, exam)}
                                    size="small"
                                    sx={{
                                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                      '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                      }
                                    }}
                                  >
                                    <FaEllipsisV size={14} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </StyledCardContent>
                        </ExamCard>
                      </Grid>
                    ))}
                </Grid>
              ) : (
                <StyledTableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Level</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredExams
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((exam) => (
                          <TableRow key={exam.id}>
                            <TableCell>{exam.id}</TableCell>
                            <TableCell>{exam.name}</TableCell>
                            <TableCell>{exam.subject.subject_name}</TableCell>
                            <TableCell>{exam.level.name}</TableCell>
                            <TableCell>{exam.class_category.name}</TableCell>
                            <TableCell>{exam.duration} min</TableCell>
                            <TableCell>
                              <Chip
                                label={exam.status ? "Approved" : "Pending"}
                                size="small"
                                sx={{
                                  bgcolor: exam.status ? '#e8f5e9' : '#fff3e0',
                                  color: exam.status ? '#2e7d32' : '#ef6c00',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title="View Details">
                                <IconButton
                                  component={Link}
                                  to={`/admin/exam/${exam.id}`}
                                  color="primary"
                                  size="small"
                                  sx={{
                                    backgroundColor: 'rgba(33, 150, 243, 0.08)',
                                    mr: 1,
                                    '&:hover': {
                                      backgroundColor: 'rgba(33, 150, 243, 0.15)',
                                    }
                                  }}
                                >
                                  <FaEye size={14} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="More Actions">
                                <IconButton
                                  onClick={(e) => handleOpenMenu(e, exam)}
                                  size="small"
                                  sx={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                    }
                                  }}
                                >
                                  <FaEllipsisV size={14} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              )}

              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  display: 'flex',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  overflow: 'hidden'
                }}
              >
                <TablePagination
                  component="div"
                  count={filteredExams.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={isMobile ? [10, 20] : [10, 20, 40]}
                  labelRowsPerPage={isMobile ? "Rows:" : "Exams per page:"}
                  labelDisplayedRows={({ from, to, count }) =>
                    isMobile ? `${from}-${to} of ${count}` : `${from}-${to} of ${count} exams`
                  }
                  sx={{
                    '.MuiTablePagination-selectLabel': {
                      display: { xs: 'none', sm: 'block' }
                    },
                    '.MuiTablePagination-select': {
                      paddingTop: '0.5rem',
                      paddingBottom: '0.5rem'
                    }
                  }}
                />
              </Paper>
            </>
          )}

          <Menu
            anchorEl={actionMenuAnchor}
            open={Boolean(actionMenuAnchor)}
            onClose={handleCloseMenu}
            PaperProps={{
              elevation: 3,
              sx: {
                minWidth: 200,
                borderRadius: '8px',
                mt: 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            <MenuItem onClick={handleEdit} sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FaPencilAlt size={14} color={theme.palette.primary.main} />
                <Typography variant="body2" fontWeight={500}>Edit Exam</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange('accept')} disabled={menuExam?.status} sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#4CAF50' }}>
                <FaCheck size={14} />
                <Typography variant="body2" fontWeight={500}>Accept Exam</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange('reject')} disabled={!menuExam?.status} sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#FF9800' }}>
                <FaTimes size={14} />
                <Typography variant="body2" fontWeight={500}>Reject Exam</Typography>
              </Box>
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleDelete} sx={{ py: 1.5, color: theme.palette.error.main }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FaTrash size={14} />
                <Typography variant="body2" fontWeight={500}>Delete Exam</Typography>
              </Box>
            </MenuItem>
          </Menu>

          <StyledModal
            open={openAddModal}
            onClose={() => {
              if (!loading) setOpenAddModal(false);
            }}
          >
            <ModalContent sx={{ borderRadius: '10px' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#37474f' }}>
                {selectedExam ? "Edit Exam Set" : "Add New Exam Set"}
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!formErrors.class_category}>
                    <InputLabel>Class Category *</InputLabel>
                    <Select
                      name="class_category"
                      value={formData.class_category}
                      onChange={handleFormChange}
                      disabled={loading}
                      sx={{ borderRadius: '8px' }}
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
                      sx={{ borderRadius: '8px' }}
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
                      sx={{ borderRadius: '8px' }}
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
                    InputProps={{ sx: { borderRadius: '8px' } }}
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
                    InputProps={{ sx: { borderRadius: '8px' } }}
                  />
                </Grid>
                {formData.level && levels.find(level => level.id === parseInt(formData.level))?.level_code >= 2.0 && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!formErrors.type}>
                      <InputLabel>Type *</InputLabel>
                      <Select
                        name="type"
                        value={formData.type}
                        onChange={handleFormChange}
                        disabled={loading}
                        sx={{ borderRadius: '8px' }}
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
              <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => setOpenAddModal(false)}
                  disabled={loading}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={loading}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 3
                  }}
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
            PaperProps={{
              sx: { borderRadius: '10px' }
            }}
          >
            <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Delete Exam</DialogTitle>
            <DialogContent>
              <Typography variant="body2">
                Are you sure you want to delete this exam set? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1 }}>
              <Button
                onClick={() => setOpenDeleteModal(false)}
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                disabled={loading}
                variant="contained"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500
                }}
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
            PaperProps={{
              sx: { borderRadius: '10px' }
            }}
          >
            <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
              {statusAction === 'accept' ? 'Accept' : 'Reject'} Exam
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2">
                Are you sure you want to {statusAction === 'accept' ? 'accept' : 'reject'} this exam set?
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1 }}>
              <Button
                onClick={() => setOpenStatusConfirmation(false)}
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmStatusChange}
                color={statusAction === 'accept' ? "primary" : "warning"}
                disabled={loading}
                variant="contained"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                {loading ? "Processing..." : statusAction === 'accept' ? 'Accept' : 'Reject'}
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              severity={snackbar.severity}
              variant="filled"
              sx={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: '8px',
                alignItems: 'center'
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </Layout>
  );
}

export default ExamManagement;
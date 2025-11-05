import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Modal,
  Button,
  TextField,
  Tooltip,
  Snackbar,
  Grid2,
  useMediaQuery,
  useTheme,
  Paper,
  Divider,
  CircularProgress,
  Backdrop,
  FormHelperText,
  InputAdornment,
  Menu,
  MenuItem,
  Chip,
  Stack,
  alpha,
  Select,
  FormControl,
  InputLabel,
  Dialog,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  MenuBook as SubjectIcon,
} from "@mui/icons-material";
import { Alert } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
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
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // DataGrid specific state
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [sortModel, setSortModel] = useState([
    {
      field: 'subject_name',
      sort: 'asc',
    },
  ]);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);

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

      const processedData = Array.isArray(subjectsData) ? subjectsData.map(subject => ({
        ...subject,
        id: subject.id,
      })) : [];

      setSubjects(processedData);
      setClasses(classesData);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to load data. Please try again later.";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced showSnackbar function
  const showSnackbar = (message, severity = "success") => {
    const cleanMessage = Array.isArray(message) ? message[0] : message;

    setSnackbar({
      open: true,
      message: cleanMessage,
      severity,
    });
  };

  const handleOpenAddEditModal = (subject = null) => {
    setCurrentSubject(subject || { class_category: "", subject_name: "" });
    setFormErrors({});
    setOpenAddEditModal(true);
  };

  const handleCloseAddEditModal = () => {
    setCurrentSubject(null);
    setFormErrors({});
    setOpenAddEditModal(false);
  };

  const handleOpenDeleteModal = (subject) => {
    setCurrentSubject(subject);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setCurrentSubject(null);
    setOpenDeleteModal(false);
  };

  const handleActionMenuOpen = (event, row) => {
    setActionMenuAnchorEl(event.currentTarget);
    setActionMenuRow(row);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setActionMenuRow(null);
  };

  // Handle deleting a subject
  const handleDeleteSubject = async () => {
    if (!currentSubject) return;

    setSubmitting(true);
    try {
      await deleteSubject(currentSubject.id);
      setSubjects(subjects.filter((sub) => sub.id !== currentSubject.id));
      showSnackbar(`Subject "${currentSubject.subject_name}" deleted successfully`);
      handleCloseDeleteModal();
    } catch (error) {
      if (error.response?.data) {
        if (error.response.data.message) {
          showSnackbar(error.response.data.message, "error");
        } else if (typeof error.response.data === 'string') {
          showSnackbar(error.response.data, "error");
        } else {
          showSnackbar("Failed to delete subject. It might be in use.", "error");
        }
      } else {
        showSnackbar("Failed to delete subject", "error");
      }
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
      setSubjects(subjects.filter((sub) => !selectedSubjects.includes(sub.id)));
      setSelectedSubjects([]);
      showSnackbar(`${selectedSubjects.length} subjects deleted successfully`);
    } catch (error) {
      if (error.response?.data) {
        if (error.response.data.message) {
          showSnackbar(error.response.data.message, "error");
        } else if (typeof error.response.data === 'string') {
          showSnackbar(error.response.data, "error");
        } else {
          showSnackbar("Failed to delete some subjects. They might be in use.", "error");
        }
      } else {
        showSnackbar("Failed to delete selected subjects", "error");
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
        const updatedSubject = await updateSubject(currentSubject.id, currentSubject);
        setSubjects(
          subjects.map((sub) =>
            sub.id === currentSubject.id ? updatedSubject : sub
          )
        );
        showSnackbar(`Subject "${currentSubject.subject_name}" updated successfully`);
        handleCloseAddEditModal();
      } else {
        const newSubject = await createSubject(currentSubject);
        setSubjects([...subjects, newSubject]);
        showSnackbar(`Subject "${currentSubject.subject_name}" added successfully`);
        handleCloseAddEditModal();
      }
    } catch (error) {
      if (error.response?.data) {
        const responseData = error.response.data;

        if (responseData.non_field_errors && Array.isArray(responseData.non_field_errors)) {
          showSnackbar(responseData.non_field_errors[0], "error");
          return;
        } else if (responseData.subject_name && Array.isArray(responseData.subject_name)) {
          setFormErrors({
            ...formErrors,
            subject_name: responseData.subject_name[0]
          });
          showSnackbar(responseData.subject_name[0], "error");
          return;
        } else if (responseData.class_category && Array.isArray(responseData.class_category)) {
          setFormErrors({
            ...formErrors,
            class_category: responseData.class_category[0]
          });
          showSnackbar(responseData.class_category[0], "error");
          return;
        } else if (responseData.message) {
          showSnackbar(responseData.message, "error");
          return;
        }
      }

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

  const filteredSubjects = subjects.filter((sub) =>
    sub.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (classes.find(c => c.id === sub.class_category)?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
      renderCell: (params) => (
        <Chip
          label={`#${params.value}`}
          size="small"
          sx={{
            bgcolor: alpha('#0d9488', 0.1),
            color: '#0d9488',
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: 'subject_name',
      headerName: 'Subject Name',
      flex: 1,
      minWidth: 180,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#0d9488',
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'class_category',
      headerName: 'Class Category',
      flex: 1,
      minWidth: 150,
      sortable: true,
      renderCell: (params) => {
        const classObj = classes.find((cls) => cls.id === params.value);
        return (
          <Chip
            label={classObj ? classObj.name : "N/A"}
            size="small"
            sx={{
              bgcolor: alpha('#06B6D4', 0.1),
              color: '#06B6D4',
              fontWeight: 600,
              border: '1px solid',
              borderColor: alpha('#06B6D4', 0.3),
            }}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit Subject" arrow>
            <IconButton
              size="small"
              onClick={() => handleOpenAddEditModal(params.row)}
              sx={{
                color: '#0d9488',
                bgcolor: alpha('#0d9488', 0.1),
                '&:hover': {
                  bgcolor: alpha('#0d9488', 0.2),
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Subject" arrow>
            <IconButton
              size="small"
              onClick={() => handleOpenDeleteModal(params.row)}
              sx={{
                color: '#ef4444',
                bgcolor: alpha('#ef4444', 0.1),
                '&:hover': {
                  bgcolor: alpha('#ef4444', 0.2),
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="More Options" arrow>
            <IconButton
              size="small"
              onClick={(e) => handleActionMenuOpen(e, params.row)}
              sx={{
                color: '#64748B',
                bgcolor: alpha('#64748B', 0.1),
                '&:hover': {
                  bgcolor: alpha('#64748B', 0.2),
                },
              }}
            >
              <MoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '1400px', mx: 'auto' }}>
        {/* Modern Header Section */}
        <Box
          sx={{
            borderRadius: 2,
            p: { xs: 2, sm: 2.5 },
            mb: 3,
            border: '2px solid #0d9488',
            bgcolor: '#fff',
          }}
        >
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={{ xs: 12, sm: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: alpha('#0d9488', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SubjectIcon sx={{ fontSize: 28, color: '#0d9488' }} />
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#1E293B',
                      fontWeight: 700,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    }}
                  >
                    Manage Subjects
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748B',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    }}
                  >
                    Manage and organize your subjects
                  </Typography>
                </Box>
              </Box>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 4 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenAddEditModal()}
                fullWidth={isMobile}
                sx={{
                  bgcolor: '#0d9488',
                  color: '#F8FAFC',
                  py: 1.2,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: '#0a7a6f',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Add New Subject
              </Button>
            </Grid2>
          </Grid2>
        </Box>

        {/* Search and List Card */}
        {/* Main Content Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Search and Actions Bar */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2,
                mb: 3,
                pb: 2,
                borderBottom: '2px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#0d9488' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    minWidth: { xs: '100%', sm: '280px' },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#0d9488',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0d9488',
                      },
                    },
                  }}
                />
              </Box>

              <Stack direction="row" spacing={1}>
                <Tooltip title="Refresh Data">
                  <IconButton
                    size="small"
                    onClick={fetchData}
                    sx={{
                      bgcolor: alpha('#0d9488', 0.1),
                      color: '#0d9488',
                      '&:hover': {
                        bgcolor: alpha('#0d9488', 0.2),
                      },
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterIcon />}
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    borderColor: '#0d9488',
                    color: '#0d9488',
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#0d9488',
                      bgcolor: alpha('#0d9488', 0.05),
                    },
                  }}
                >
                  Filter
                </Button>
                {selectedSubjects.length > 0 && (
                  <Button
                    variant="contained"
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleBulkDelete}
                    disabled={submitting}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    Delete ({selectedSubjects.length})
                  </Button>
                )}
              </Stack>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#0d9488' }} size={48} />
              </Box>
            ) : error && !filteredSubjects.length ? (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 2,
                  '& .MuiAlert-icon': { color: '#ef4444' }
                }}
              >
                {error}
              </Alert>
            ) : filteredSubjects.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  px: 3,
                }}
              >
                <SubjectIcon sx={{ fontSize: 80, color: '#64748B', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ color: '#64748B', mb: 1, fontWeight: 600 }}>
                  {searchTerm ? "No subjects found" : "No subjects yet"}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first subject"}
                </Typography>
                {!searchTerm && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenAddEditModal()}
                    sx={{
                      bgcolor: '#0d9488',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: '#0a7a6f',
                      },
                    }}
                  >
                    Create First Subject
                  </Button>
                )}
              </Box>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  height: 500,
                  width: '100%',
                  '& .MuiDataGrid-root': {
                    border: 'none',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: alpha('#0d9488', 0.05),
                    borderBottom: '2px solid',
                    borderColor: '#0d9488',
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontWeight: 700,
                      color: '#1E293B',
                    },
                  },
                  '& .MuiDataGrid-row': {
                    '&:hover': {
                      bgcolor: alpha('#0d9488', 0.04),
                    },
                    '&.Mui-selected': {
                      bgcolor: alpha('#0d9488', 0.08),
                      '&:hover': {
                        bgcolor: alpha('#0d9488', 0.12),
                      },
                    },
                  },
                  '& .MuiCheckbox-root': {
                    color: '#0d9488',
                    '&.Mui-checked': {
                      color: '#0d9488',
                    },
                  },
                }}
              >
                <DataGrid
                  rows={filteredSubjects}
                  columns={columns}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  pageSizeOptions={[5, 10, 25, 50]}
                  pagination
                  checkboxSelection
                  disableRowSelectionOnClick
                  sortModel={sortModel}
                  onSortModelChange={setSortModel}
                  onRowSelectionModelChange={(newSelection) => {
                    setSelectedSubjects(newSelection);
                  }}
                  rowSelectionModel={selectedSubjects}
                  loading={loading}
                  autoHeight={false}
                  getRowHeight={() => 'auto'}
                  getEstimatedRowHeight={() => 60}
                  sx={{
                    '& .MuiDataGrid-row': {
                      minHeight: '52px!important',
                    },
                    '& .MuiDataGrid-cell': {
                      py: 1.5,
                    },
                  }}
                />
              </Paper>
            )}
          </CardContent>
        </Card>

        {/* Subject Add/Edit Dialog */}
        <Menu
          anchorEl={actionMenuAnchorEl}
          open={Boolean(actionMenuAnchorEl)}
          onClose={handleActionMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: 2,
              minWidth: 180,
              mt: 1,
            },
          }}
        >
          <MenuItem 
            onClick={() => {
              handleOpenAddEditModal(actionMenuRow);
              handleActionMenuClose();
            }}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                bgcolor: alpha('#0d9488', 0.08),
              },
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1.5, color: '#0d9488' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Edit Subject</Typography>
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={() => {
              handleOpenDeleteModal(actionMenuRow);
              handleActionMenuClose();
            }}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                bgcolor: alpha('#ef4444', 0.08),
              },
            }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: '#ef4444' }} />
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#ef4444' }}>Delete Subject</Typography>
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem 
            onClick={() => {
              handleActionMenuClose();
            }}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                bgcolor: alpha('#64748B', 0.08),
              },
            }}
          >
            <SubjectIcon fontSize="small" sx={{ mr: 1.5, color: '#64748B' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>View Details</Typography>
          </MenuItem>
        </Menu>

        {/* Add/Edit Modal */}
        <Modal
          open={openAddEditModal}
          onClose={!submitting ? handleCloseAddEditModal : undefined}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { backdropFilter: 'blur(4px)' },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '480px' },
              maxWidth: '95%',
              bgcolor: 'background.paper',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #0d9488 0%, #06B6D4 100%)',
                color: '#F8FAFC',
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {currentSubject?.id ? <EditIcon /> : <AddIcon />}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {currentSubject?.id ? "Edit Subject" : "Add New Subject"}
                </Typography>
              </Box>
              {!submitting && (
                <IconButton
                  onClick={handleCloseAddEditModal}
                  sx={{
                    color: '#F8FAFC',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>

            {/* Modal Body */}
            <Box sx={{ p: 3 }}>
              <FormControl
                fullWidth
                error={Boolean(formErrors.class_category)}
                disabled={submitting}
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused fieldset': {
                      borderColor: '#0d9488',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0d9488',
                  },
                }}
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
                fullWidth
                label="Subject Name"
                name="subject_name"
                value={currentSubject?.subject_name || ""}
                onChange={handleInputChange}
                error={Boolean(formErrors.subject_name)}
                helperText={formErrors.subject_name || "Enter the subject name"}
                disabled={submitting}
                autoFocus
                required
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused fieldset': {
                      borderColor: '#0d9488',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0d9488',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SubjectIcon sx={{ color: '#0d9488' }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleCloseAddEditModal}
                  disabled={submitting}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#64748B',
                    color: '#64748B',
                    '&:hover': {
                      borderColor: '#64748B',
                      bgcolor: alpha('#64748B', 0.05),
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSaveSubject}
                  disabled={submitting}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#0d9488',
                    '&:hover': {
                      bgcolor: '#0a7a6f',
                    },
                  }}
                >
                  {submitting ? (
                    <CircularProgress size={24} sx={{ color: '#F8FAFC' }} />
                  ) : currentSubject?.id ? (
                    <>
                      <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                      Update Subject
                    </>
                  ) : (
                    <>
                      <AddIcon sx={{ mr: 1, fontSize: 20 }} />
                      Create Subject
                    </>
                  )}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Modal>

        {/* Delete Modal */}
        <Modal
          open={openDeleteModal}
          onClose={!submitting ? handleCloseDeleteModal : undefined}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { backdropFilter: 'blur(4px)' },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '440px' },
              maxWidth: '95%',
              bgcolor: 'background.paper',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#F8FAFC',
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DeleteIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Delete Subject
                </Typography>
              </Box>
              {!submitting && (
                <IconButton
                  onClick={handleCloseDeleteModal}
                  sx={{
                    color: '#F8FAFC',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>

            {/* Modal Body */}
            <Box sx={{ p: 3 }}>
              <Box
                sx={{
                  bgcolor: alpha('#ef4444', 0.1),
                  borderRadius: 2,
                  p: 2.5,
                  mb: 2.5,
                  border: '1px solid',
                  borderColor: alpha('#ef4444', 0.2),
                }}
              >
                <Typography variant="body1" sx={{ mb: 1.5, color: '#1E293B', fontWeight: 500 }}>
                  Are you sure you want to delete this subject?
                </Typography>
                <Box
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: 1.5,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: '#64748B', mb: 0.5, fontSize: '0.75rem' }}>
                    Subject Name
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    "{currentSubject?.subject_name}"
                  </Typography>
                </Box>
              </Box>

              <Alert
                severity="warning"
                icon={false}
                sx={{
                  borderRadius: 2,
                  bgcolor: alpha('#f59e0b', 0.1),
                  border: '1px solid',
                  borderColor: alpha('#f59e0b', 0.2),
                  '& .MuiAlert-message': {
                    color: '#92400e',
                  },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  ⚠️ Warning: This action cannot be undone!
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  All associated data will be permanently removed from the system.
                </Typography>
              </Alert>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleCloseDeleteModal}
                  disabled={submitting}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#64748B',
                    color: '#64748B',
                    '&:hover': {
                      borderColor: '#64748B',
                      bgcolor: alpha('#64748B', 0.05),
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleDeleteSubject}
                  disabled={submitting}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#ef4444',
                    '&:hover': {
                      bgcolor: '#dc2626',
                    },
                  }}
                >
                  {submitting ? (
                    <CircularProgress size={24} sx={{ color: '#F8FAFC' }} />
                  ) : (
                    <>
                      <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                      Delete Permanently
                    </>
                  )}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Modal>

        {/* Snackbar Notifications */}
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
            icon={snackbar.severity === 'success' ? <CheckCircleIcon /> : undefined}
            sx={{
              width: "100%",
              minWidth: '300px',
              borderRadius: 2,
              '& .MuiAlert-message': {
                maxWidth: '100%',
                wordBreak: 'break-word',
                fontWeight: 500,
              },
              ...(snackbar.severity === 'success' && {
                bgcolor: '#0d9488',
                color: '#F8FAFC',
              }),
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{
            color: '#F8FAFC',
            zIndex: (theme) => theme.zIndex.drawer + 2,
            backdropFilter: 'blur(4px)',
            bgcolor: 'rgba(13, 148, 136, 0.2)',
          }}
          open={submitting}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress
              size={56}
              thickness={4}
              sx={{
                color: '#0d9488',
                mb: 2,
              }}
            />
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E293B' }}>
              Processing...
            </Typography>
          </Box>
        </Backdrop>
      </Box>
    </Layout>
  );
};

export default ManageSubject;
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  TextField,
  Snackbar,
  useMediaQuery,
  useTheme,
  InputAdornment,
  CircularProgress,
  Backdrop,
  Alert,
  Stack,
  Tooltip,
  Modal,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import { alpha } from "@mui/material/styles"; // <- import alpha from styles
import { DataGrid } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import Layout from "../Admin/Layout";
import {
  getLevel,
  createLevel,
  updateLevel,
} from "../../services/adminManageLevel";

const ManageLevel = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [levels, setLevels] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);
  const [newLevelData, setNewLevelData] = useState({ name: "", description: "" });
  const [editLevelData, setEditLevelData] = useState({ id: null, name: "", description: "", level_code: null });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [paginationModel, setPaginationModel] = useState({
    pageSize: isMobile ? 5 : 10,
    page: 0,
  });
  const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'asc' }]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const data = await getLevel();
      setLevels(Array.isArray(data) ? data : []);
    } catch (error) {
      showSnackbar(
        error?.response?.data?.message || "Failed to fetch levels. Please try again.",
        "error"
      );
      setLevels([]);
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

  const handleOpenAddEditModal = (level = null) => {
    if (level) {
      setCurrentLevel(level);
      setEditLevelData({
        id: level.id,
        name: level.name || "",
        description: level.description || "",
        level_code: level.level_code ?? null
      });
    } else {
      setCurrentLevel(null);
      setNewLevelData({ name: "", description: "" });
    }
    setFormErrors({});
    setOpenAddEditModal(true);
  };

  const handleCloseAddEditModal = () => {
    if (submitting) return;
    setCurrentLevel(null);
    setNewLevelData({ name: "", description: "" });
    setEditLevelData({ id: null, name: "", description: "", level_code: null });
    setFormErrors({});
    setOpenAddEditModal(false);
  };

  const handleOpenDeleteModal = (level) => {
    setCurrentLevel(level);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (submitting) return;
    setCurrentLevel(null);
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

  // ----- MISSING view dialog handlers (added) -----
  const handleOpenViewDialog = (level) => {
    setSelectedLevel(level || null);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setSelectedLevel(null);
    setOpenViewDialog(false);
  };
  // -------------------------------------------------

  const handleDeleteLevel = async () => {
    if (!currentLevel) return;

    try {
      setSubmitting(true);
      // await deleteLevel(currentLevel.id); // implement if you have API
      setLevels((prev) => prev.filter(level => level.id !== currentLevel.id));
      showSnackbar(`Level "${currentLevel.name}" deleted successfully!`);
      handleCloseDeleteModal();
    } catch (error) {
      showSnackbar(
        error?.response?.data?.message || "Failed to delete level. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedLevels || selectedLevels.length === 0) return;

    try {
      setSubmitting(true);
      // await bulkDeleteLevels(selectedLevels); // implement if you have API
      setLevels(prev => prev.filter(level => !selectedLevels.includes(level.id)));
      showSnackbar(`${selectedLevels.length} level(s) deleted successfully!`);
      setSelectedLevels([]);
    } catch (error) {
      showSnackbar(
        error?.response?.data?.message || "Failed to delete levels. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!newLevelData?.name || newLevelData.name.trim() === "") {
      errors.name = "Level name is required";
    } else if (newLevelData.name.length < 2) {
      errors.name = "Level name must be at least 2 characters";
    } else if (newLevelData.name.length > 50) {
      errors.name = "Level name cannot exceed 50 characters";
    }

    if (newLevelData?.description && newLevelData.description.length > 200) {
      errors.description = "Description cannot exceed 200 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editLevelData?.name || editLevelData.name.trim() === "") {
      errors.name = "Level name is required";
    } else if (editLevelData.name.length < 2) {
      errors.name = "Level name must be at least 2 characters";
    } else if (editLevelData.name.length > 50) {
      errors.name = "Level name cannot exceed 50 characters";
    }

    if (editLevelData?.description && editLevelData.description.length > 200) {
      errors.description = "Description cannot exceed 200 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLevelData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditLevelData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handleSaveLevel = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const newLevel = await createLevel(newLevelData);
      setLevels(prev => [...prev, newLevel]);
      showSnackbar(`Level "${newLevelData.name}" added successfully!`);
      handleCloseAddEditModal();
    } catch (error) {
      if (error?.response?.data) {
        const responseData = error.response.data;
        if (typeof responseData === 'object' && !Array.isArray(responseData)) {
          const fieldErrors = {};
          let hasFieldErrors = false;
          for (const [field, errorMessages] of Object.entries(responseData)) {
            if (Array.isArray(errorMessages) && errorMessages.length > 0) {
              fieldErrors[field] = errorMessages[0];
              hasFieldErrors = true;
            }
          }
          if (hasFieldErrors) {
            setFormErrors(fieldErrors);
            const firstField = Object.keys(fieldErrors)[0];
            showSnackbar(fieldErrors[firstField], "error");
            return;
          }
        }
        if (responseData.message || typeof responseData === 'string') {
          const errorMessage = responseData.message || responseData;
          showSnackbar(errorMessage, "error");
          return;
        }
      }
      showSnackbar("Failed to create level. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLevel = async () => {
    if (!validateEditForm()) return;

    try {
      setSubmitting(true);
      const updatedLevel = await updateLevel(editLevelData.id, editLevelData);
      setLevels(prev => prev.map(level => level.id === updatedLevel.id ? updatedLevel : level));
      showSnackbar(`Level "${updatedLevel.name}" updated successfully!`);
      handleCloseAddEditModal();
    } catch (error) {
      if (error?.response?.data) {
        const responseData = error.response.data;
        if (typeof responseData === 'object' && !Array.isArray(responseData)) {
          const fieldErrors = {};
          let hasFieldErrors = false;
          for (const [field, errorMessages] of Object.entries(responseData)) {
            if (Array.isArray(errorMessages) && errorMessages.length > 0) {
              fieldErrors[field] = errorMessages[0];
              hasFieldErrors = true;
            }
          }
          if (hasFieldErrors) {
            setFormErrors(fieldErrors);
            const firstField = Object.keys(fieldErrors)[0];
            showSnackbar(fieldErrors[firstField], "error");
            return;
          }
        }
        if (responseData.message || typeof responseData === 'string') {
          const errorMessage = responseData.message || responseData;
          showSnackbar(errorMessage, "error");
          return;
        }
      }
      showSnackbar("Failed to update level. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLevels = (Array.isArray(levels) ? levels : []).filter((lvl) =>
    (lvl?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((lvl?.description || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: alpha('#0d9488', 0.1),
            color: '#0d9488',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'name',
      headerName: 'Level Name',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#0d9488' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 220,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          {params.value || '—'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleOpenViewDialog(params.row)}
              sx={{
                bgcolor: alpha('#06B6D4', 0.1),
                color: '#06B6D4',
                '&:hover': { bgcolor: alpha('#06B6D4', 0.2) },
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="More">
            <IconButton
              size="small"
              onClick={(e) => handleActionMenuOpen(e, params.row)}
              sx={{
                bgcolor: alpha('#0d9488', 0.1),
                color: '#0d9488',
                '&:hover': { bgcolor: alpha('#0d9488', 0.2) },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
  return (
    <Layout>
      <Box sx={{ width: '100%' }}>
        {/* Compact Header */}
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#1E293B',
                mb: 0.5,
              }}
            >
              Manage Experience Levels
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Create and manage experience levels for teachers
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenAddEditModal()}
            sx={{
              bgcolor: '#0d9488',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#0a7a6f',
              },
            }}
          >
            Add New Level
          </Button>
        </Box>

        {/* Main Content Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
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
                  placeholder="Search levels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#0d9488' }} />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              </Box>

              <Stack direction="row" spacing={1}>
                <Tooltip title="Refresh Data">
                  <IconButton
                    size="small"
                    onClick={fetchLevels}
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
                {selectedLevels.length > 0 && (
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
                    Delete ({selectedLevels.length})
                  </Button>
                )}
              </Stack>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#0d9488' }} size={48} />
              </Box>
            ) : filteredLevels.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  px: 3,
                }}
              >
                <BuildIcon sx={{ fontSize: 80, color: '#64748B', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ color: '#64748B', mb: 1, fontWeight: 600 }}>
                  {searchTerm ? "No levels found" : "No levels yet"}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first experience level"}
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
                    Create First Level
                  </Button>
                )}
              </Box>
            ) : (
              <Box
                sx={{
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
                  rows={filteredLevels}
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
                    setSelectedLevels(newSelection);
                  }}
                  rowSelectionModel={selectedLevels}
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
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          open={openAddEditModal}
          onClose={!submitting ? handleCloseAddEditModal : undefined}
          closeAfterTransition
          slots={{
            backdrop: Backdrop
          }}
          slotProps={{
            backdrop: {
              timeout: 500,
              sx: { backdropFilter: 'blur(4px)' },
            }
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
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
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
                  {currentLevel ? <EditIcon /> : <AddIcon />}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {currentLevel ? "Edit Experience Level" : "Add New Level"}
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
              <TextField
                fullWidth
                label="Level Name"
                name="name"
                value={currentLevel ? editLevelData.name : newLevelData.name}
                onChange={currentLevel ? handleEditInputChange : handleInputChange}
                error={Boolean(formErrors.name)}
                helperText={formErrors.name || "Enter the experience level name"}
                disabled={submitting}
                autoFocus
                required
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
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BuildIcon sx={{ color: '#0d9488' }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />

              {currentLevel && (
                <TextField
                  fullWidth
                  label="Level Code"
                  value={editLevelData.level_code}
                  sx={{
                    mb: 2.5,
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: '#64748B',
                    },
                    backgroundColor: alpha('#64748B', 0.05),
                    borderRadius: 2,
                  }}
                  helperText="Level code cannot be modified"
                  slotProps={{
                    input: {
                      readOnly: true,
                    }
                  }}
                />
              )}

              <TextField
                fullWidth
                label="Description (optional)"
                name="description"
                value={currentLevel ? editLevelData.description : newLevelData.description}
                onChange={currentLevel ? handleEditInputChange : handleInputChange}
                error={Boolean(formErrors.description)}
                helperText={formErrors.description || "Provide a brief description of this experience level"}
                disabled={submitting}
                multiline
                rows={4}
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
                  onClick={currentLevel ? handleUpdateLevel : handleSaveLevel}
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
                  ) : currentLevel ? (
                    <>
                      <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                      Update Level
                    </>
                  ) : (
                    <>
                      <AddIcon sx={{ mr: 1, fontSize: 20 }} />
                      Create Level
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
          slots={{
            backdrop: Backdrop
          }}
          slotProps={{
            backdrop: {
              timeout: 500,
              sx: { backdropFilter: 'blur(4px)' },
            }
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
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
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
                  Delete Experience Level
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
                  Are you sure you want to delete this experience level?
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
                    Level Name
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    "{currentLevel?.name}"
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
                  onClick={handleDeleteLevel}
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

        {/* Action Menu */}
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
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
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
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Edit Level</Typography>
          </MenuItem>
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
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#ef4444' }}>Delete Level</Typography>
          </MenuItem>
        </Menu>

        {/* View Modal */}
        <Modal
          open={openViewDialog}
          onClose={handleCloseViewDialog}
          closeAfterTransition
          slots={{
            backdrop: Backdrop
          }}
          slotProps={{
            backdrop: {
              timeout: 500,
              sx: { backdropFilter: 'blur(4px)' },
            }
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
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #06B6D4 0%, #0d9488 100%)',
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
                  <VisibilityIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Level Details
                </Typography>
              </Box>
              <IconButton
                onClick={handleCloseViewDialog}
                sx={{
                  color: '#F8FAFC',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Modal Body */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#64748B', mb: 1, fontSize: '0.75rem' }}>
                  Level Name
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
                  {selectedLevel?.name}
                </Typography>
                <Chip
                  label={`ID: ${selectedLevel?.id}`}
                  size="small"
                  sx={{
                    bgcolor: alpha('#0d9488', 0.1),
                    color: '#0d9488',
                    fontWeight: 600,
                  }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#64748B', mb: 1, fontSize: '0.75rem' }}>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ color: '#1E293B', lineHeight: 1.6 }}>
                  {selectedLevel?.description || "No description available for this experience level."}
                </Typography>
              </Box>

              {/* Action Button */}
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={handleCloseViewDialog}
                  sx={{
                    px: 4,
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
                  Close
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>

        {/* Enhanced Backdrop */}
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

        {/* Enhanced Snackbar */}
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
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
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
      </Box>
    </Layout>
  );
};

export default ManageLevel;
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Snackbar,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Backdrop,
  Alert,
  InputAdornment,
  Stack,
  Tooltip,
  Modal,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import Layout from "../Admin/Layout";
import {
  getQualification,
  createQualification,
  updateQualification,
  deleteQualification,
} from "../../services/adminManageQualificationApi";

const ManageQualification = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [qualifications, setQualifications] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentQualification, setCurrentQualification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0
  });
  const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'asc' }]);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);

  useEffect(() => {
    fetchQualifications();
  }, []);

  const fetchQualifications = async () => {
    setLoading(true);
    try {
      const data = await getQualification();
      setQualifications(Array.isArray(data) ? data : []);
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Failed to load qualifications. Please try again.",
        "error"
      );
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

  const handleOpenAddEditModal = (qualification = null) => {
    setCurrentQualification(qualification);
    setFormErrors({});
    setOpenAddEditModal(true);
  };

  const handleCloseAddEditModal = () => {
    if (submitting) return;
    setCurrentQualification(null);
    setFormErrors({});
    setOpenAddEditModal(false);
  };

  const handleOpenDeleteModal = (qualification) => {
    setCurrentQualification(qualification);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (submitting) return;
    setCurrentQualification(null);
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

  const handleDeleteQualification = async () => {
    if (!currentQualification) return;
    setSubmitting(true);
    try {
      await deleteQualification(currentQualification.id);
      setQualifications(
        qualifications.filter(
          (qualification) => qualification.id !== currentQualification.id
        )
      );
      showSnackbar(`Qualification "${currentQualification.name}" deleted successfully.`);
      if (selectedQualifications.includes(currentQualification.id)) {
        setSelectedQualifications(
          selectedQualifications.filter(id => id !== currentQualification.id)
        );
      }
      handleCloseDeleteModal();
    } catch (error) {
      handleApiError(error, "Failed to delete qualification.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQualifications.length === 0) return;
    setSubmitting(true);
    try {
      await Promise.all(
        selectedQualifications.map((id) => deleteQualification(id))
      );
      setQualifications(
        qualifications.filter(
          (qualification) => !selectedQualifications.includes(qualification.id)
        )
      );
      showSnackbar(`${selectedQualifications.length} qualifications deleted successfully.`);
      setSelectedQualifications([]);
    } catch (error) {
      
      handleApiError(error, "Failed to delete selected qualifications.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApiError = (error, fallbackMessage) => {
    if (error.response?.data) {
      const responseData = error.response.data;
      if (typeof responseData === 'object' && !Array.isArray(responseData)) {
        const fieldErrors = {};
        let hasFieldErrors = false;
        for (const [field, errorMessages] of Object.entries(responseData)) {
          if (Array.isArray(errorMessages) && errorMessages.length > 0) {
            fieldErrors[field] = errorMessages[0];
            hasFieldErrors = true;
          } else if (typeof errorMessages === 'string') {
            fieldErrors[field] = errorMessages;
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
      if (responseData.non_field_errors && Array.isArray(responseData.non_field_errors)) {
        showSnackbar(responseData.non_field_errors[0], "error");
        return;
      }
      if (typeof responseData === 'string') {
        showSnackbar(responseData, "error");
        return;
      }
      if (responseData.message) {
        showSnackbar(responseData.message, "error");
        return;
      }
      if (responseData.detail) {
        showSnackbar(responseData.detail, "error");
        return;
      }
    }
    showSnackbar(fallbackMessage, "error");
  };

  const validateForm = () => {
    const errors = {};
    if (!currentQualification?.name || currentQualification.name.trim() === "") {
      errors.name = "Qualification name is required";
    } else if (currentQualification.name.length < 2) {
      errors.name = "Qualification name must be at least 2 characters";
    } else if (currentQualification.name.length > 100) {
      errors.name = "Qualification name cannot exceed 100 characters";
    } else {
      const duplicate = qualifications.find(
        (qual) =>
          qual.name.toLowerCase() === currentQualification.name.trim().toLowerCase() &&
          qual.id !== currentQualification?.id
      );
      if (duplicate) {
        errors.name = "This qualification name already exists";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveQualification = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: currentQualification.name.trim(),
      };
      if (currentQualification.id) {
        await updateQualification(currentQualification.id, payload);
        setQualifications(
          qualifications.map((qualification) =>
            qualification.id === currentQualification.id
              ? { ...qualification, ...payload }
              : qualification
          )
        );
        showSnackbar(`Qualification "${payload.name}" updated successfully.`);
      } else {
        const newQualification = await createQualification(payload);
        setQualifications([...qualifications, newQualification]);
        showSnackbar(`Qualification "${payload.name}" added successfully.`);
      }
      handleCloseAddEditModal();
    } catch (error) {
      
      handleApiError(
        error, 
        `Failed to ${currentQualification.id ? 'update' : 'add'} qualification. Please try again.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentQualification({
      ...(currentQualification || {}),
      [name]: value
    });
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };

  const handleSelectAll = (newSelection) => {
    setSelectedQualifications(newSelection);
  };

  const filteredQualifications = qualifications.filter((qual) =>
    qual.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      field: 'name',
      headerName: 'Qualification Name',
      flex: 1,
      minWidth: 200,
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
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit Qualification" arrow>
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
          <Tooltip title="Delete Qualification" arrow>
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
    }
  ];

  return (
    <Layout>
      <Box sx={{ width: '100%' }}>
        {/* Compact Header */}
        <Box
          sx={{
            bgcolor: '#F8FAFC',
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
              Manage Teacher Qualifications
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Create and manage teacher qualification requirements
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
            Add New Qualification
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
                  placeholder="Search qualifications..."
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
                    onClick={fetchQualifications}
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
                {selectedQualifications.length > 0 && (
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
                    Delete ({selectedQualifications.length})
                  </Button>
                )}
              </Stack>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#0d9488' }} size={48} />
              </Box>
            ) : filteredQualifications.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  px: 3,
                }}
              >
                <SchoolIcon sx={{ fontSize: 80, color: '#64748B', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ color: '#64748B', mb: 1, fontWeight: 600 }}>
                  {searchTerm ? "No qualifications found" : "No qualifications yet"}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first qualification"}
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
                    Create First Qualification
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
                  rows={filteredQualifications}
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
                    setSelectedQualifications(newSelection);
                  }}
                  rowSelectionModel={selectedQualifications}
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
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Edit Qualification</Typography>
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
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#ef4444' }}>Delete Qualification</Typography>
          </MenuItem>
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
            <SchoolIcon fontSize="small" sx={{ mr: 1.5, color: '#64748B' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>View Details</Typography>
          </MenuItem>
        </Menu>

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
                  {currentQualification?.id ? <EditIcon /> : <AddIcon />}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {currentQualification?.id ? "Edit Qualification" : "Add New Qualification"}
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
                label="Qualification Name"
                name="name"
                value={currentQualification?.name || ""}
                onChange={handleInputChange}
                error={Boolean(formErrors.name)}
                helperText={formErrors.name || "Enter the qualification name"}
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
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon sx={{ color: '#0d9488' }} />
                      </InputAdornment>
                    ),
                  }
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
                  onClick={handleSaveQualification}
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
                  ) : currentQualification?.id ? (
                    <>
                      <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                      Update Qualification
                    </>
                  ) : (
                    <>
                      <AddIcon sx={{ mr: 1, fontSize: 20 }} />
                      Create Qualification
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
                  Delete Qualification
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
                  Are you sure you want to delete this qualification?
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
                    Qualification Name
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    "{currentQualification?.name}"
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
                  onClick={handleDeleteQualification}
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

        {/* Enhanced Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: { xs: 7, sm: 8 } }}
        >
          <Alert 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
            severity={snackbar.severity}
            variant="filled"
            icon={
              snackbar.severity === 'success' ? (
                <CheckCircleIcon />
              ) : snackbar.severity === 'error' ? (
                <WarningAmberIcon />
              ) : undefined
            }
            sx={{
              borderRadius: 2,
              minWidth: 300,
              fontWeight: 500,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              ...(snackbar.severity === 'success' && {
                bgcolor: '#0d9488',
                '& .MuiAlert-icon': {
                  color: '#F8FAFC',
                },
              }),
              ...(snackbar.severity === 'error' && {
                bgcolor: '#ef4444',
                '& .MuiAlert-icon': {
                  color: '#F8FAFC',
                },
              }),
              '& .MuiAlert-message': {
                maxWidth: '100%',
                wordBreak: 'break-word',
              },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Enhanced Backdrop */}
        <Backdrop
          open={submitting}
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.modal + 1,
            backdropFilter: 'blur(8px)',
            bgcolor: 'rgba(13, 148, 136, 0.1)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              p: 4,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <CircularProgress size={48} sx={{ color: '#0d9488' }} />
            <Typography
              variant="body1"
              sx={{
                color: '#1E293B',
                fontWeight: 600,
              }}
            >
              Processing...
            </Typography>
          </Box>
        </Backdrop>
      </Box>
    </Layout>
  );
};

export default ManageQualification;
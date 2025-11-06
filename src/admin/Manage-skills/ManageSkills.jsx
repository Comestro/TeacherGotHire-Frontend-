import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, TextField,
  IconButton, Box, Snackbar, Grid, Paper, useTheme, useMediaQuery, CircularProgress,
  Divider, Backdrop, Card, CardContent, InputAdornment, Alert, Stack, Tooltip, Modal
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningAmberIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import Layout from "../Admin/Layout";
import {
  getSkills, 
  updateSkill, 
  deleteSkill,
  createSkill
} from '../../services/adminSkillsApi';

const ManageSkills = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
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
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: isMobile ? 5 : 10 });

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, pageSize: isMobile ? 5 : 10 }));
  }, [isMobile]);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const data = await getSkills();
      setSkills(Array.isArray(data) ? data : []);
      setFilteredSkills(Array.isArray(data) ? data : []);
    } catch (error) {
      
      showSnackbar(
        error.response?.data?.message || "Failed to load skills. Please try again.",
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

  const handleAddSkill = () => {
    setCurrentSkill({ name: '', description: '' });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSkill = (skill) => {
    setCurrentSkill({...skill});
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleConfirmDelete = (skill) => {
    setSelectedToDelete(skill);
    setOpenDeleteDialog(true);
  };

  const handleDeleteSkill = async () => {
    if (!selectedToDelete) return;
    
    setSubmitting(true);
    try {
      await deleteSkill(selectedToDelete.id);
      showSnackbar(`Skill "${selectedToDelete.name}" deleted successfully`);
      fetchSkills();
    } catch (error) {
      
      handleApiError(error, "Failed to delete skill");
    } finally {
      setSubmitting(false);
      setOpenDeleteDialog(false);
      setSelectedToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSkills.length === 0) return;
    
    setSubmitting(true);
    try {
      await Promise.all(selectedSkills.map(skillId => deleteSkill(skillId)));
      showSnackbar(`${selectedSkills.length} skills deleted successfully`);
      fetchSkills();
      setSelectedSkills([]);
    } catch (error) {
      
      handleApiError(error, "Failed to delete selected skills");
    } finally {
      setSubmitting(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!currentSkill?.name || currentSkill.name.trim() === "") {
      errors.name = "Skill name is required";
    } else if (currentSkill.name.length < 2) {
      errors.name = "Skill name must be at least 2 characters";
    } else if (currentSkill.name.length > 50) {
      errors.name = "Skill name cannot exceed 50 characters";
    }

    if (currentSkill?.description && currentSkill.description.length > 200) {
      errors.description = "Description cannot exceed 200 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
    }
    
    showSnackbar(fallbackMessage, "error");
  };

  const handleSaveSkill = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      if (currentSkill.id) {
        await updateSkill(currentSkill.id, currentSkill);
        showSnackbar(`Skill "${currentSkill.name}" updated successfully`);
      } else {
        await createSkill(currentSkill);
        showSnackbar(`Skill "${currentSkill.name}" added successfully`);
      }
      fetchSkills();
      setIsEditModalOpen(false);
    } catch (error) {
      
      handleApiError(
        error, 
        `Failed to ${currentSkill.id ? 'update' : 'add'} skill. Please try again.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSkill({
      ...currentSkill,
      [name]: value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = skills.filter(skill =>
        skill.name.toLowerCase().includes(query.toLowerCase()) ||
        (skill.description && skill.description.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills(skills);
    }
    setCurrentPage(1);
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Skill Name',
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
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEditSkill(params.row)}
              sx={{
                bgcolor: alpha('#0d9488', 0.1),
                color: '#0d9488',
                '&:hover': { bgcolor: alpha('#0d9488', 0.2) },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleConfirmDelete(params.row)}
              sx={{
                bgcolor: alpha('#ef4444', 0.1),
                color: '#ef4444',
                '&:hover': { bgcolor: alpha('#ef4444', 0.2) },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Layout>
        {/* Compact Header */}
        <Box
          sx={{
            mb: { xs: 2, sm: 3 },
            display: 'flex',
            justifyContent: 'space-between',
            bgcolor: '#fff',
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: '#1E293B' }}
          >
            Manage Skills
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSkill}
            sx={{
              bgcolor: '#0d9488',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              '&:hover': { bgcolor: '#0a7a6f' },
            }}
          >
            Add Skill
          </Button>
        </Box>

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
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
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
                      '&:hover fieldset': { borderColor: '#0d9488' },
                      '&.Mui-focused fieldset': { borderColor: '#0d9488' },
                    },
                  }}
                />
              </Box>

              <Stack direction="row" spacing={1}>
                <Tooltip title="Refresh Data">
                  <IconButton
                    size="small"
                    onClick={fetchSkills}
                    sx={{
                      bgcolor: alpha('#0d9488', 0.1),
                      color: '#0d9488',
                      '&:hover': { bgcolor: alpha('#0d9488', 0.2) },
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterListIcon />}
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    borderColor: '#0d9488',
                    color: '#0d9488',
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': { borderColor: '#0d9488', bgcolor: alpha('#0d9488', 0.05) },
                  }}
                >
                  Filter
                </Button>
                {selectedSkills.length > 0 && (
                  <Button
                    variant="contained"
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleBulkDelete}
                    disabled={submitting}
                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                  >
                    Delete ({selectedSkills.length})
                  </Button>
                )}
              </Stack>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#0d9488' }} size={48} />
              </Box>
            ) : filteredSkills.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
                <BuildIcon sx={{ fontSize: 80, color: '#64748B', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ color: '#64748B', mb: 1, fontWeight: 600 }}>
                  {searchQuery ? 'No skills found' : 'No skills yet'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                  {searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first skill'}
                </Typography>
                {!searchQuery && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddSkill}
                    sx={{
                      bgcolor: '#0d9488', textTransform: 'none', fontWeight: 600, px: 4, py: 1.5, borderRadius: 2,
                      '&:hover': { bgcolor: '#0a7a6f' },
                    }}
                  >
                    Create First Skill
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
                  '& .MuiDataGrid-root': { border: 'none' },
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: alpha('#0d9488', 0.05),
                    borderBottom: '2px solid',
                    borderColor: '#0d9488',
                    '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, color: '#1E293B' },
                  },
                  '& .MuiDataGrid-row': {
                    '&:hover': { bgcolor: alpha('#0d9488', 0.04) },
                    '&.Mui-selected': {
                      bgcolor: alpha('#0d9488', 0.08),
                      '&:hover': { bgcolor: alpha('#0d9488', 0.12) },
                    },
                  },
                  '& .MuiCheckbox-root': {
                    color: '#0d9488',
                    '&.Mui-checked': { color: '#0d9488' },
                  },
                }}
              >
                <DataGrid
                  rows={filteredSkills}
                  columns={columns}
                  checkboxSelection
                  disableRowSelectionOnClick
                  pagination
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  pageSizeOptions={[5, 10, 25, 50]}
                  loading={loading}
                  onRowSelectionModelChange={(model) => setSelectedSkills(model)}
                  rowSelectionModel={selectedSkills}
                  getRowHeight={() => 'auto'}
                  getEstimatedRowHeight={() => 60}
                  sx={{
                    '& .MuiDataGrid-row': { minHeight: '52px!important' },
                    '& .MuiDataGrid-cell': { py: 1.5 },
                  }}
                />
              </Paper>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          open={isEditModalOpen}
          onClose={() => !submitting && setIsEditModalOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500, sx: { backdropFilter: 'blur(4px)' } }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '520px' },
              bgcolor: 'background.paper',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
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
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {currentSkill?.id ? 'Edit Skill' : 'Add New Skill'}
              </Typography>
              {!submitting && (
                <IconButton
                  onClick={() => setIsEditModalOpen(false)}
                  sx={{ color: '#F8FAFC', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>

            {/* Body */}
            <Box sx={{ p: 3 }}>
              <TextField
                fullWidth
                label="Skill Name"
                name="name"
                value={currentSkill?.name || ''}
                onChange={handleInputChange}
                error={Boolean(formErrors.name)}
                helperText={formErrors.name || 'Enter the skill name'}
                disabled={submitting}
                autoFocus
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused fieldset': { borderColor: '#0d9488' },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#0d9488' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BuildIcon sx={{ color: '#0d9488' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Description (optional)"
                name="description"
                value={currentSkill?.description || ''}
                onChange={handleInputChange}
                error={Boolean(formErrors.description)}
                helperText={formErrors.description || 'Up to 200 characters'}
                disabled={submitting}
                multiline
                rows={4}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused fieldset': { borderColor: '#0d9488' },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#0d9488' },
                }}
              />

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={submitting}
                  sx={{
                    py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600,
                    borderColor: '#64748B', color: '#64748B',
                    '&:hover': { borderColor: '#64748B', bgcolor: alpha('#64748B', 0.05) },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSaveSkill}
                  disabled={submitting}
                  sx={{
                    py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600,
                    bgcolor: '#0d9488', '&:hover': { bgcolor: '#0a7a6f' },
                  }}
                >
                  {submitting ? (
                    <CircularProgress size={24} sx={{ color: '#F8FAFC' }} />
                  ) : currentSkill?.id ? (
                    <>
                      <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                      Update Skill
                    </>
                  ) : (
                    <>
                      <AddIcon sx={{ mr: 1, fontSize: 20 }} />
                      Create Skill
                    </>
                  )}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Modal>

        {/* Delete Modal */}
        <Modal
          open={openDeleteDialog}
          onClose={() => !submitting && setOpenDeleteDialog(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500, sx: { backdropFilter: 'blur(4px)' } }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '480px' },
              bgcolor: 'background.paper',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
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
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Delete Skill
              </Typography>
              {!submitting && (
                <IconButton
                  onClick={() => setOpenDeleteDialog(false)}
                  sx={{ color: '#F8FAFC', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>

            {/* Body */}
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
                  Are you sure you want to delete this skill?
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
                    Skill Name
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    "{selectedToDelete?.name}"
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
                  '& .MuiAlert-message': { color: '#92400e' },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  ⚠️ Warning: This action cannot be undone!
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  All associated data will be permanently removed from the system.
                </Typography>
              </Alert>

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setOpenDeleteDialog(false)}
                  disabled={submitting}
                  sx={{
                    py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600,
                    borderColor: '#64748B', color: '#64748B',
                    '&:hover': { borderColor: '#64748B', bgcolor: alpha('#64748B', 0.05) },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleDeleteSkill}
                  disabled={submitting}
                  sx={{
                    py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600,
                    bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' },
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

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: { xs: 7, sm: 8 } }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            elevation={6}
            icon={snackbar.severity === 'success' ? <CheckCircleIcon /> : undefined}
            sx={{
              width: '100%',
              minWidth: '300px',
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              '& .MuiAlert-message': { maxWidth: '100%', wordBreak: 'break-word', fontWeight: 500 },
              ...(snackbar.severity === 'success' && { bgcolor: '#0d9488', color: '#F8FAFC' }),
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

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
            <CircularProgress size={56} thickness={4} sx={{ color: '#0d9488', mb: 2 }} />
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E293B' }}>
              Processing...
            </Typography>
          </Box>
        </Backdrop>
    </Layout>
  );
};

export default ManageSkills;
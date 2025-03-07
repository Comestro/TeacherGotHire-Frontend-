import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, TextField,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Checkbox, IconButton, Dialog, DialogActions, DialogContent, DialogTitle,
  Box, Snackbar, Grid, Paper, useTheme, useMediaQuery, CircularProgress,
  Divider, Backdrop, Pagination, Card, CardContent, InputAdornment, Alert,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 5 : 10;

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
      console.error("Error fetching skills:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to load skills. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    // Clean up the message if it's an array or object
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
      console.error("Error deleting skill:", error);
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
      console.error("Error bulk deleting skills:", error);
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
      
      // Handle field-specific errors
      if (typeof responseData === 'object' && !Array.isArray(responseData)) {
        const fieldErrors = {};
        let hasFieldErrors = false;
        
        // Process each field error
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
          
          // Show the first field error in the snackbar
          const firstField = Object.keys(fieldErrors)[0];
          showSnackbar(fieldErrors[firstField], "error");
          return;
        }
      }
      
      // Handle non-field errors
      if (responseData.non_field_errors && Array.isArray(responseData.non_field_errors)) {
        showSnackbar(responseData.non_field_errors[0], "error");
        return;
      }
      
      // Handle string message
      if (typeof responseData === 'string') {
        showSnackbar(responseData, "error");
        return;
      }
      
      // Handle message property
      if (responseData.message) {
        showSnackbar(responseData.message, "error");
        return;
      }
    }
    
    // Fallback error message
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
      console.error("Error saving skill:", error);
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
    
    // Clear validation error for the field being edited
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

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const visibleSkillIds = currentSkills.map(skill => skill.id);
      setSelectedSkills(visibleSkillIds);
    } else {
      setSelectedSkills([]);
    }
  };

  const handleCheckboxChange = (skillId) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skillId)) {
        return prev.filter(id => id !== skillId);
      } else {
        return [...prev, skillId];
      }
    });
  };

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filteredSkills.length / itemsPerPage));
  const currentSkills = filteredSkills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
                  Manage Extra Skills
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddSkill}
                  fullWidth={isMobile}
                  sx={{ 
                    py: { xs: 1, sm: 'auto' },
                    textTransform: 'none',
                    boxShadow: 2
                  }}
                >
                  Add New Skill
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
            overflow: 'hidden'
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
                Skills ({filteredSkills.length})
              </Typography>
              
              <TextField
                placeholder="Search skills"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
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
            ) : filteredSkills.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {searchQuery 
                  ? "No skills match your search criteria."
                  : "No skills available. Add a new skill to get started."
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
                    overflow: 'hidden',
                    mb: 2,
                    width: '100%'
                  }}
                >
                  <TableContainer sx={{ maxHeight: 440 }}>
                    <Table size={isMobile ? "small" : "medium"}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'background.default' }}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              indeterminate={
                                selectedSkills.length > 0 &&
                                selectedSkills.length < currentSkills.length
                              }
                              checked={
                                currentSkills.length > 0 &&
                                selectedSkills.length === currentSkills.length
                              }
                              onChange={handleSelectAll}
                              size={isMobile ? "small" : "medium"}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Skill Name</TableCell>
                          <TableCell 
                            sx={{ 
                              fontWeight: 600, 
                              display: { xs: 'none', sm: 'table-cell' } 
                            }}
                          >
                            Description
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              fontWeight: 600, 
                              width: isMobile ? 100 : 120 
                            }}
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentSkills.map((skill) => (
                          <TableRow 
                            key={`skill-${skill.id}`} 
                            hover
                            sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedSkills.includes(skill.id)}
                                onChange={() => handleCheckboxChange(skill.id)}
                                size={isMobile ? "small" : "medium"}
                              />
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {skill.name}
                                </Typography>
                                {isMobile && skill.description && (
                                  <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ 
                                      display: '-webkit-box',
                                      overflow: 'hidden',
                                      WebkitBoxOrient: 'vertical',
                                      WebkitLineClamp: 2,
                                    }}
                                  >
                                    {skill.description}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                              {skill.description || "—"}
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <IconButton
                                  size={isMobile ? "small" : "medium"}
                                  color="primary"
                                  onClick={() => handleEditSkill(skill)}
                                >
                                  <EditIcon fontSize={isMobile ? "small" : "medium"} />
                                </IconButton>
                                <IconButton
                                  size={isMobile ? "small" : "medium"}
                                  color="error"
                                  onClick={() => handleConfirmDelete(skill)}
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
                    disabled={selectedSkills.length === 0 || submitting}
                    fullWidth={isMobile}
                    sx={{ 
                      py: { xs: 1, sm: 'auto' },
                      textTransform: 'none',
                      order: { xs: 2, sm: 1 }
                    }}
                  >
                    Delete Selected {selectedSkills.length > 0 && `(${selectedSkills.length})`}
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

        {/* Skill Add/Edit Dialog */}
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
                {currentSkill && currentSkill.id ? "Edit Skill" : "Add Skill"}
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
            <TextField
              label="Skill Name"
              variant="outlined"
              fullWidth
              margin="normal"
              name="name"
              value={currentSkill?.name || ""}
              onChange={handleInputChange}
              error={Boolean(formErrors.name)}
              helperText={formErrors.name || ""}
              disabled={submitting}
              autoFocus
            />
            
            <TextField
              label="Description (optional)"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              name="description"
              value={currentSkill?.description || ""}
              onChange={handleInputChange}
              error={Boolean(formErrors.description)}
              helperText={formErrors.description || ""}
              disabled={submitting}
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
                onClick={handleSaveSkill} 
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
                ) : currentSkill?.id ? (
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
                Delete Skill
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
              Are you sure you want to delete this skill:
            </Typography>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              "{selectedToDelete?.name}"
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
                onClick={handleDeleteSkill} 
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

        {/* Loading Backdrop */}
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

export default ManageSkills;
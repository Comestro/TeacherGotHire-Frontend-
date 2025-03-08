import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
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
  Snackbar,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Backdrop,
  Divider,
  Alert,
  InputAdornment,
  Pagination
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon
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
  const [filteredQualifications, setFilteredQualifications] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentQualification, setCurrentQualification] = useState({
    id: null,
    name: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 5 : 10;

  // Fetch qualifications from the server
  useEffect(() => {
    fetchQualifications();
  }, []);

  // Filter qualifications when search query changes
  useEffect(() => {
    handleSearch(searchQuery);
  }, [qualifications, searchQuery]);

  const fetchQualifications = async () => {
    setLoading(true);
    try {
      const data = await getQualification();
      setQualifications(Array.isArray(data) ? data : []);
      setFilteredQualifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching qualifications:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to load qualifications. Please try again.",
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

  const handleSearch = (query) => {
    if (!query) {
      setFilteredQualifications(qualifications);
    } else {
      const filtered = qualifications.filter(
        (qualification) => 
          qualification.name && 
          qualification.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredQualifications(filtered);
    }
    setCurrentPage(1);
  };

  const handleAddQualification = () => {
    setCurrentQualification({
      id: null,
      name: "",
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditQualification = (qualification) => {
    setCurrentQualification({ ...qualification });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleDeleteQualification = async (qualificationId) => {
    setSubmitting(true);
    try {
      await deleteQualification(qualificationId);
      setQualifications(
        qualifications.filter(
          (qualification) => qualification.id !== qualificationId
        )
      );
      
      const deletedItem = qualifications.find(q => q.id === qualificationId);
      showSnackbar(`Qualification "${deletedItem?.name}" deleted successfully.`);
      
      // Clear selection if the deleted item was selected
      if (selectedQualifications.includes(qualificationId)) {
        setSelectedQualifications(
          selectedQualifications.filter(id => id !== qualificationId)
        );
      }
    } catch (error) {
      console.error("Error deleting qualification:", error);
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
      console.error("Error bulk deleting qualifications:", error);
      handleApiError(error, "Failed to delete selected qualifications.");
    } finally {
      setSubmitting(false);
    }
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
      
      // Handle detail property (common in DRF errors)
      if (responseData.detail) {
        showSnackbar(responseData.detail, "error");
        return;
      }
    }
    
    // Fallback error message
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
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error saving qualification:", error);
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
      ...currentQualification,
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

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const visibleQualificationIds = currentQualifications.map(qualification => qualification.id);
      setSelectedQualifications(visibleQualificationIds);
    } else {
      setSelectedQualifications([]);
    }
  };

  const handleCheckboxChange = (qualificationId) => {
    setSelectedQualifications((prev) => {
      if (prev.includes(qualificationId)) {
        return prev.filter(id => id !== qualificationId);
      } else {
        return [...prev, qualificationId];
      }
    });
  };

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filteredQualifications.length / itemsPerPage));
  const currentQualifications = filteredQualifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
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
                  Manage Teacher Qualifications
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddQualification}
                  fullWidth={isMobile}
                  sx={{ 
                    py: { xs: 1, sm: 'auto' },
                    textTransform: 'none',
                    boxShadow: 2
                  }}
                >
                  Add New Qualification
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Qualifications List Card */}
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
                Qualifications ({filteredQualifications.length})
              </Typography>
              
              <TextField
                placeholder="Search qualifications"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            ) : filteredQualifications.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {searchQuery 
                  ? "No qualifications match your search criteria."
                  : "No qualifications available. Add a new qualification to get started."
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
                                selectedQualifications.length > 0 &&
                                selectedQualifications.length < currentQualifications.length
                              }
                              checked={
                                currentQualifications.length > 0 &&
                                selectedQualifications.length === currentQualifications.length
                              }
                              onChange={handleSelectAll}
                              size={isMobile ? "small" : "medium"}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Qualification Name</TableCell>
                          <TableCell sx={{ fontWeight: 600, width: isMobile ? 100 : 120 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentQualifications.map((qualification, index) => (
                          <TableRow 
                            key={qualification.id} 
                            hover
                            sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedQualifications.includes(qualification.id)}
                                onChange={() => handleCheckboxChange(qualification.id)}
                                size={isMobile ? "small" : "medium"}
                              />
                            </TableCell>
                            <TableCell>{index + 1 + (currentPage - 1) * itemsPerPage}</TableCell>
                            <TableCell>{qualification.name}</TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <IconButton
                                  size={isMobile ? "small" : "medium"}
                                  color="primary"
                                  onClick={() => handleEditQualification(qualification)}
                                >
                                  <EditIcon fontSize={isMobile ? "small" : "medium"} />
                                </IconButton>
                                <IconButton
                                  size={isMobile ? "small" : "medium"}
                                  color="error"
                                  onClick={() => handleDeleteQualification(qualification.id)}
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
                    disabled={selectedQualifications.length === 0 || submitting}
                    fullWidth={isMobile}
                    sx={{ 
                      py: { xs: 1, sm: 'auto' },
                      textTransform: 'none',
                      order: { xs: 2, sm: 1 }
                    }}
                  >
                    Delete Selected {selectedQualifications.length > 0 && `(${selectedQualifications.length})`}
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

        {/* Edit/Add Dialog */}
        <Dialog 
          open={isEditModalOpen} 
          onClose={!submitting ? () => setIsEditModalOpen(false) : undefined}
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
                {currentQualification.id ? "Edit Qualification" : "Add Qualification"}
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
              label="Qualification Name"
              variant="outlined"
              fullWidth
              margin="normal"
              name="name"
              value={currentQualification?.name || ""}
              onChange={handleInputChange}
              error={Boolean(formErrors.name)}
              helperText={formErrors.name || ""}
              disabled={submitting}
              autoFocus
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
                onClick={handleSaveQualification} 
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
                ) : currentQualification.id ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
          open={submitting}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

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
      </Box>
    </Layout>
  );
};

export default ManageQualification;
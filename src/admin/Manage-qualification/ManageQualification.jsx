import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
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
  const [paginationModel, setPaginationModel] = useState({
    pageSize: isMobile ? 5 : 10,
    page: 0
  });

  useEffect(() => {
    fetchQualifications();
  }, []);

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

  const columns = [
    {
      field: 'serialNumber',
      headerName: 'ID',
      width: 70,
      // Use a much simpler approach that doesn't rely on any potentially undefined params
      renderCell: (params) => {
        const index = filteredQualifications.findIndex(item => item.id === params.row?.id);
        return index !== -1 ? index + 1 : 'N/A';
      }
    },
    {
      field: 'name',
      headerName: 'Qualification Name',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton
            size={isMobile ? "small" : "medium"}
            color="primary"
            onClick={() => handleEditQualification(params.row)}
          >
            <EditIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
          <IconButton
            size={isMobile ? "small" : "medium"}
            color="error"
            onClick={() => handleDeleteQualification(params.row.id)}
          >
            <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Layout>
      <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
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
                    width: '100%',
                    height: 440
                  }}
                >
                  <DataGrid
                    rows={filteredQualifications}
                    columns={columns}
                    checkboxSelection
                    disableRowSelectionOnClick
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5, 10, 25]}
                    rowSelectionModel={selectedQualifications}
                    onRowSelectionModelChange={handleSelectAll}
                    loading={loading}
                    density={isMobile ? "compact" : "standard"}
                    getRowId={(row) => row.id} 
                    sx={{
                      '& .MuiDataGrid-columnHeader': {
                        backgroundColor: 'background.default',
                        fontWeight: 600,
                      },
                      '& .MuiDataGrid-row:nth-of-type(even)': {
                        backgroundColor: '#fafafa',
                      },
                      border: 'none'
                    }}
                  />
                </Paper>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'flex-start',
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
                      textTransform: 'none'
                    }}
                  >
                    Delete Selected {selectedQualifications.length > 0 && `(${selectedQualifications.length})`}
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>

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

        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
          open={submitting}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

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
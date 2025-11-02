import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  Button,
  TextField,
  Snackbar,
  Grid,
  useMediaQuery,
  useTheme,
  Paper,
  InputAdornment,
  CircularProgress,
  Divider,
  DialogTitle,
  DialogContent,
  DialogActions,
  Backdrop,
  FormHelperText,
  Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Edit as EditIcon
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
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [newLevelData, setNewLevelData] = useState({ name: "", description: "" });
  const [editLevelData, setEditLevelData] = useState({ id: null, name: "", description: "", level_code: null });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [paginationModel, setPaginationModel] = useState({
    pageSize: isMobile ? 5 : 8,
    page: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const data = await getLevel();
      setLevels(Array.isArray(data) ? data : []);
    } catch (error) {
      
      showSnackbar(
        error.response?.data?.message || "Failed to fetch levels. Please try again.",
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

  const handleOpenAddDialog = () => {
    setNewLevelData({ name: "", description: "" });
    setFormErrors({});
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    if (submitting) return;
    setNewLevelData({ name: "", description: "" });
    setFormErrors({});
    setOpenAddDialog(false);
  };

  const handleOpenViewDialog = (level) => {
    setSelectedLevel(level);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setSelectedLevel(null);
    setOpenViewDialog(false);
  };

  const handleOpenEditDialog = (level) => {
    setEditLevelData({
      id: level.id,
      name: level.name,
      description: level.description || "",
      level_code: level.level_code
    });
    setFormErrors({});
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    if (submitting) return;
    setEditLevelData({ id: null, name: "", description: "", level_code: null });
    setFormErrors({});
    setOpenEditDialog(false);
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
    setNewLevelData({
      ...newLevelData,
      [name]: value,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditLevelData({
      ...editLevelData,
      [name]: value,
    });

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
      setLevels([...levels, newLevel]);
      showSnackbar(`Level "${newLevelData.name}" added successfully!`);
      handleCloseAddDialog();
    } catch (error) {
      

      if (error.response?.data) {
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

      showSnackbar(
        "Failed to create level. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLevel = async () => {
    if (!validateEditForm()) return;

    try {
      setSubmitting(true);
      const updatedLevel = await updateLevel(editLevelData.id, editLevelData);
      setLevels(levels.map(level => level.id === updatedLevel.id ? updatedLevel : level));
      showSnackbar(`Level "${updatedLevel.name}" updated successfully!`);
      handleCloseEditDialog();
    } catch (error) {
      

      if (error.response?.data) {
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

      showSnackbar(
        "Failed to update level. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLevels = levels.filter((lvl) =>
    lvl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lvl.description && lvl.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Generate rows with index that we'll use directly
  const rows = filteredLevels.map((level, index) => ({
    ...level,
    index: paginationModel.page * paginationModel.pageSize + index + 1
  }));

  const columns = [
    {
      field: 'index',
      headerName: '#',
      width: 60,
      sortable: false,
      filterable: false,
      // Simply display the pre-calculated index value
      renderCell: (params) => params.value
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
          {isMobile && params.row.description && (
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
              {params.row.description}
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
      hide: isMobile,
      renderCell: (params) => (
        params.value || "—"
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box
          display="flex"
          justifyContent={isMobile ? "center" : "flex-start"}
          gap={1}
        >
          <IconButton
            size={isMobile ? "small" : "medium"}
            color="info"
            onClick={() => handleOpenViewDialog(params.row)}
          >
            <VisibilityIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
          <IconButton
            size={isMobile ? "small" : "medium"}
            color="primary"
            onClick={() => handleOpenEditDialog(params.row)}
          >
            <EditIcon fontSize={isMobile ? "small" : "medium"} />
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
                  Manage Experience Levels
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                  fullWidth={isMobile}
                  sx={{
                    py: { xs: 1, sm: 'auto' },
                    textTransform: 'none',
                    boxShadow: 2
                  }}
                >
                  Add New Level
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
                Experience Levels ({filteredLevels.length})
              </Typography>

              <TextField
                placeholder="Search levels"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            ) : filteredLevels.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {searchTerm
                  ? "No levels match your search criteria."
                  : "No levels available. Add a new level to get started."
                }
              </Alert>
            ) : (
              <Box sx={{ height: 440, width: '100%' }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  pageSizeOptions={[5, 8, 10, 25]}
                  disableRowSelectionOnClick
                  getRowId={(row) => row.id}
                  autoHeight
                  loading={loading}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '& .MuiDataGrid-cell:focus': {
                      outline: 'none',
                    },
                    '& .MuiDataGrid-row:nth-of-type(even)': {
                      backgroundColor: '#fafafa',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: 'background.default',
                      fontWeight: 600
                    },
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={openAddDialog}
          onClose={!submitting ? handleCloseAddDialog : undefined}
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
                Add Experience Level
              </Typography>
              {!submitting && (
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleCloseAddDialog}
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
              label="Level Name"
              variant="outlined"
              fullWidth
              margin="normal"
              name="name"
              value={newLevelData.name}
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
              value={newLevelData.description}
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
                onClick={handleCloseAddDialog}
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
                onClick={handleSaveLevel}
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
                ) : (
                  "Save"
                )}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openEditDialog}
          onClose={!submitting ? handleCloseEditDialog : undefined}
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
                Edit Experience Level
              </Typography>
              {!submitting && (
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleCloseEditDialog}
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
              label="Level Name"
              variant="outlined"
              fullWidth
              margin="normal"
              name="name"
              value={editLevelData.name}
              onChange={handleEditInputChange}
              error={Boolean(formErrors.name)}
              helperText={formErrors.name || ""}
              disabled={submitting}
              autoFocus
            />

            <TextField
              label="Level Code"
              variant="outlined"
              fullWidth
              margin="normal"
              value={editLevelData.level_code}
              InputProps={{
                readOnly: true,
              }}
              sx={{ 
                mt: 2,
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: theme.palette.text.secondary,
                },
                backgroundColor: theme.palette.action.hover
              }}
              helperText="Level code cannot be modified"
            />

            <TextField
              label="Description (optional)"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              name="description"
              value={editLevelData.description}
              onChange={handleEditInputChange}
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
                onClick={handleCloseEditDialog}
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
                onClick={handleUpdateLevel}
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
                ) : (
                  "Update"
                )}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openViewDialog}
          onClose={handleCloseViewDialog}
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
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Level Details
              </Typography>
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleCloseViewDialog}
                aria-label="close"
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </DialogTitle>

          <Divider />

          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 } }}>
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Level Name
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedLevel?.name}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1">
                {selectedLevel?.description || "No description available."}
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
            <Button
              onClick={handleCloseViewDialog}
              variant="contained"
              color="primary"
              fullWidth={isMobile}
              sx={{ textTransform: 'none' }}
            >
              Close
            </Button>
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

export default ManageLevel;
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
  Grid,
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
} from "@mui/icons-material";
import { Alert } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import Layout from "../Admin/Layout";
import {
  getClassCategory,
  updateClassCategory,
  deleteClassCategory,
  createClassCategory,
} from "../../services/adminClassCategoryApi";

const ManageClassCategory = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
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
  const [rowCount, setRowCount] = useState(0);
  const [sortModel, setSortModel] = useState([
    {
      field: 'name',
      sort: 'asc',
    },
  ]);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getClassCategory();
      const processedData = Array.isArray(data) ? data.map(cat => ({
        ...cat,
        id: cat.id, // Ensure ID is available for DataGrid
      })) : [];
      setCategories(processedData);
      setRowCount(processedData.length);
    } catch (error) {
      console.error("Error fetching categories:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch class categories";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Updated form validation with duplicate name check
  const validateForm = () => {
    const errors = {};

    // Basic validation
    if (!selectedCategory?.name || selectedCategory.name.trim() === "") {
      errors.name = "Category name is required";
    } else if (selectedCategory.name.length < 2) {
      errors.name = "Category name must be at least 2 characters";
    } else if (selectedCategory.name.length > 50) {
      errors.name = "Category name cannot exceed 50 characters";
    } else {
      // Check for duplicate names (only for new categories)
      if (!selectedCategory.id) {
        const nameExists = categories.some(
          cat => cat.name.toLowerCase() === selectedCategory.name.toLowerCase()
        );

        if (nameExists) {
          errors.name = "Class category with this name already exists";
        }
      }
    }

    // Description validation (only if provided)
    if (selectedCategory?.description && selectedCategory.description.length > 500) {
      errors.description = "Description cannot exceed 500 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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

  const handleOpenAddEditModal = (category = null) => {
    setSelectedCategory(category || { name: "", description: "" });
    setFormErrors({});
    setOpenAddEditModal(true);
  };

  const handleCloseAddEditModal = () => {
    setSelectedCategory(null);
    setFormErrors({});
    setOpenAddEditModal(false);
  };

  const handleOpenDeleteModal = (category) => {
    setSelectedCategory(category);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedCategory(null);
    setOpenDeleteModal(false);
  };

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setSelectedCategory({
      ...selectedCategory,
      [name]: value,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handleSaveCategory = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (selectedCategory.id) {
        const updatedCategory = await updateClassCategory(selectedCategory.id, selectedCategory);
        setCategories(
          categories.map((cat) =>
            cat.id === selectedCategory.id ? updatedCategory : cat
          )
        );
        showSnackbar("Category updated successfully!");
        handleCloseAddEditModal();
      } else {
        const newCategory = await createClassCategory(selectedCategory);
        setCategories([...categories, newCategory]);
        showSnackbar("Category added successfully!");
        handleCloseAddEditModal();
      }
    } catch (error) {
      console.error("Error saving category:", error);

      if (error.response?.data) {
        const responseData = error.response.data;

        if (responseData.name && Array.isArray(responseData.name)) {
          setFormErrors({
            ...formErrors,
            name: responseData.name[0]
          });

          showSnackbar(responseData.name[0], "error");
          return;
        } else if (responseData.message) {
          showSnackbar(responseData.message, "error");
          return;
        }
      }

      const fallbackMessage = selectedCategory.id
        ? "Failed to update category"
        : "Failed to add category";
      showSnackbar(fallbackMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      setSubmitting(true);
      await deleteClassCategory(selectedCategory.id);
      setCategories(categories.filter((cat) => cat.id !== selectedCategory.id));
      showSnackbar(`Category "${selectedCategory.name}" deleted successfully!`);
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting category:", error);

      if (error.response?.data) {
        if (error.response.data.message) {
          showSnackbar(error.response.data.message, "error");
        } else if (typeof error.response.data === 'string') {
          showSnackbar(error.response.data, "error");
        } else {
          showSnackbar("Failed to delete category. It might be in use.", "error");
        }
      } else {
        showSnackbar("Failed to delete category", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;

    try {
      setSubmitting(true);
      await Promise.all(
        selectedCategories.map((categoryId) => deleteClassCategory(categoryId))
      );
      setCategories(categories.filter((cat) => !selectedCategories.includes(cat.id)));
      setSelectedCategories([]);
      showSnackbar(`${selectedCategories.length} categories deleted successfully!`);
    } catch (error) {
      console.error("Error bulk deleting categories:", error);

      if (error.response?.data) {
        if (error.response.data.message) {
          showSnackbar(error.response.data.message, "error");
        } else if (typeof error.response.data === 'string') {
          showSnackbar(error.response.data, "error");
        } else {
          showSnackbar("Failed to delete some categories. They might be in use.", "error");
        }
      } else {
        showSnackbar("Failed to delete selected categories", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleActionMenuOpen = (event, row) => {
    setActionMenuAnchorEl(event.currentTarget);
    setActionMenuRow(row);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setActionMenuRow(null);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      sortable: true,
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
      sortable: true,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.5,
      minWidth: 200,
      sortable: true,
      renderCell: (params) => (
        params.value ? (
          <Tooltip title={params.value} arrow>
            <Typography
              variant="body2"
              sx={{
                maxWidth: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {params.value}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            No description
          </Typography>
        )
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleOpenAddEditModal(params.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleOpenDeleteModal(params.row)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => handleActionMenuOpen(e, params.row)}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
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
                  Manage Class Categories
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenAddEditModal()}
                  fullWidth={isMobile}
                  sx={{
                    py: { xs: 1, sm: 'auto' },
                    textTransform: 'none',
                    boxShadow: 2
                  }}
                >
                  Add New Category
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
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  Class Categories ({filteredCategories.length})
                </Typography>
                <IconButton 
                  size="small" 
                  color="primary" 
                  onClick={fetchCategories}
                  title="Refresh"
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box display="flex" gap={2} width={{ xs: '100%', sm: 'auto' }}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search categories"
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
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterIcon />}
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                >
                  Filter
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error && !filteredCategories.length ? (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            ) : filteredCategories.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {searchTerm ? "No categories match your search" : "No categories available. Create one to get started."}
              </Alert>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  mb: 2,
                  height: 440,
                  width: '100%'
                }}
              >
                <DataGrid
                  rows={filteredCategories}
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
                    setSelectedCategories(newSelection);
                  }}
                  rowSelectionModel={selectedCategories}
                  loading={loading}
                  autoHeight={false}
                  getRowHeight={() => 'auto'}
                  getEstimatedRowHeight={() => 60}
                  sx={{
                    '& .MuiDataGrid-row': {
                      minHeight: '48px!important',
                    },
                    '& .MuiDataGrid-cell': {
                      py: 1,
                    },
                  }}
                />
              </Paper>
            )}

            {filteredCategories.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: 2,
                  mt: 2
                }}
              >
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDelete}
                  disabled={selectedCategories.length === 0 || submitting}
                  fullWidth={isMobile}
                  sx={{
                    py: { xs: 1, sm: 'auto' },
                    textTransform: 'none',
                    order: { xs: 2, sm: 1 }
                  }}
                >
                  Delete Selected {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        <Menu
          anchorEl={actionMenuAnchorEl}
          open={Boolean(actionMenuAnchorEl)}
          onClose={handleActionMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem 
            onClick={() => {
              handleOpenAddEditModal(actionMenuRow);
              handleActionMenuClose();
            }}
            dense
          >
            <EditIcon fontSize="small" color="primary" sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem 
            onClick={() => {
              handleOpenDeleteModal(actionMenuRow);
              handleActionMenuClose();
            }}
            dense
          >
            <DeleteIcon fontSize="small" color="error" sx={{ mr: 1 }} /> Delete
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={() => {
              handleActionMenuClose();
            }}
            dense
          >
            View Details
          </MenuItem>
        </Menu>

        <Modal
          open={openAddEditModal}
          onClose={!submitting ? handleCloseAddEditModal : undefined}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '400px' },
              maxWidth: '95%',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 2,
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedCategory?.id ? "Edit Category" : "Add New Category"}
              </Typography>
              {!submitting && (
                <IconButton
                  size="small"
                  onClick={handleCloseAddEditModal}
                  aria-label="close"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              margin="normal"
              label="Category Name"
              name="name"
              value={selectedCategory?.name || ""}
              onChange={handleCategoryChange}
              error={Boolean(formErrors.name)}
              helperText={formErrors.name}
              disabled={submitting}
              InputProps={{
                autoFocus: true,
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Description (Optional)"
              name="description"
              value={selectedCategory?.description || ""}
              onChange={handleCategoryChange}
              error={Boolean(formErrors.description)}
              helperText={formErrors.description}
              disabled={submitting}
              multiline
              rows={3}
              placeholder="Enter an optional description for this category"
            />

            <FormHelperText sx={{ mt: 0.5, px: 1.5, color: 'text.secondary' }}>
              You can add a description to provide more information about this category
            </FormHelperText>

            <Box
              mt={3}
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              justifyContent="flex-end"
              gap={2}
            >
              <Button
                variant="outlined"
                onClick={handleCloseAddEditModal}
                disabled={submitting}
                fullWidth={isMobile}
                sx={{
                  textTransform: 'none',
                  order: { xs: 2, sm: 1 }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveCategory}
                disabled={submitting}
                fullWidth={isMobile}
                sx={{
                  textTransform: 'none',
                  order: { xs: 1, sm: 2 }
                }}
              >
                {submitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : selectedCategory?.id ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </Button>
            </Box>
          </Box>
        </Modal>

        <Modal
          open={openDeleteModal}
          onClose={!submitting ? handleCloseDeleteModal : undefined}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '400px' },
              maxWidth: '95%',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 2,
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600 }}>
                Delete Category
              </Typography>
              {!submitting && (
                <IconButton
                  size="small"
                  onClick={handleCloseDeleteModal}
                  aria-label="close"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="body1" mb={1}>
              Are you sure you want to delete:
            </Typography>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              "{selectedCategory?.name}"
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              This action cannot be undone. All associated data will be permanently removed.
            </Typography>

            <Box
              mt={2}
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              justifyContent="flex-end"
              gap={2}
            >
              <Button
                variant="outlined"
                onClick={handleCloseDeleteModal}
                disabled={submitting}
                fullWidth={isMobile}
                sx={{
                  textTransform: 'none',
                  order: { xs: 2, sm: 1 }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteCategory}
                disabled={submitting}
                fullWidth={isMobile}
                sx={{
                  textTransform: 'none',
                  order: { xs: 1, sm: 2 }
                }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : "Delete"}
              </Button>
            </Box>
          </Box>
        </Modal>

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

        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
          open={submitting}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </Layout>
  );
};

export default ManageClassCategory;
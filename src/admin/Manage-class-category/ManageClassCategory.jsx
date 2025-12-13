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
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
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
      
      const errorMessage = error.response?.data?.message || "Failed to fetch class categories";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };
  const validateForm = () => {
    const errors = {};
    if (!selectedCategory?.name || selectedCategory.name.trim() === "") {
      errors.name = "Category name is required";
    } else if (selectedCategory.name.length < 2) {
      errors.name = "Category name must be at least 2 characters";
    } else if (selectedCategory.name.length > 50) {
      errors.name = "Category name cannot exceed 50 characters";
    } else {
      if (!selectedCategory.id) {
        const nameExists = categories.some(
          cat => cat.name.toLowerCase() === selectedCategory.name.toLowerCase()
        );

        if (nameExists) {
          errors.name = "Class category with this name already exists";
        }
      }
    }
    if (selectedCategory?.description && selectedCategory.description.length > 500) {
      errors.description = "Description cannot exceed 500 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
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
      headerName: 'Category Name',
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
      field: 'description',
      headerName: 'Description',
      flex: 1.5,
      minWidth: 220,
      sortable: true,
      renderCell: (params) => (
        params.value ? (
          <Tooltip title={params.value} arrow placement="top">
            <Typography
              variant="body2"
              sx={{
                maxWidth: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#64748B',
              }}
            >
              {params.value}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
            No description provided
          </Typography>
        )
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
          <Tooltip title="Edit Category" arrow>
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
          <Tooltip title="Delete Category" arrow>
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
      <Box sx={{ width: '100%', mx: 'auto' }}>
        {/* Modern Header Section */}
        <Box
          sx={{
            mb: 3,
            bgcolor: '#fff',
          }}
        >
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={{ xs: 12, sm: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#1E293B',
                      fontWeight: 700,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    }}
                  >
                    Class Categories
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748B',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    }}
                  >
                    Manage and organize your class categories
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
                  boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)',
                  '&:hover': {
                    bgcolor: '#0a7a6f',
                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Add New Category
              </Button>
            </Grid2>
          </Grid2>
        </Box>

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
                  placeholder="Search categories..."
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
                    onClick={fetchCategories}
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
                {selectedCategories.length > 0 && (
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
                    Delete ({selectedCategories.length})
                  </Button>
                )}
              </Stack>
            </Box>

            {/* Data Grid Section */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#0d9488' }} size={48} />
              </Box>
            ) : error && !filteredCategories.length ? (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 2,
                  '& .MuiAlert-icon': { color: '#ef4444' }
                }}
              >
                {error}
              </Alert>
            ) : filteredCategories.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  px: 3,
                }}
              >
                <CategoryIcon sx={{ fontSize: 80, color: '#64748B', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ color: '#64748B', mb: 1, fontWeight: 600 }}>
                  {searchTerm ? "No categories found" : "No categories yet"}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first class category"}
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
                    Create First Category
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
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Edit Category</Typography>
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
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
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#ef4444' }}>Delete Category</Typography>
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
            <CategoryIcon fontSize="small" sx={{ mr: 1.5, color: '#64748B' }} />
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
                  {selectedCategory?.id ? <EditIcon /> : <AddIcon />}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedCategory?.id ? "Edit Category" : "Add New Category"}
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
                label="Category Name"
                name="name"
                value={selectedCategory?.name || ""}
                onChange={handleCategoryChange}
                error={Boolean(formErrors.name)}
                helperText={formErrors.name}
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
                        <CategoryIcon sx={{ color: '#0d9488' }} />
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                value={selectedCategory?.description || ""}
                onChange={handleCategoryChange}
                error={Boolean(formErrors.description)}
                helperText={formErrors.description || "Provide additional details about this category"}
                disabled={submitting}
                multiline
                rows={4}
                placeholder="Enter a detailed description..."
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
                  onClick={handleSaveCategory}
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
                  ) : selectedCategory?.id ? (
                    <>
                      <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                      Update Category
                    </>
                  ) : (
                    <>
                      <AddIcon sx={{ mr: 1, fontSize: 20 }} />
                      Create Category
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
                  Delete Category
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
                  Are you sure you want to delete this category?
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
                    Category Name
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    "{selectedCategory?.name}"
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
                  onClick={handleDeleteCategory}
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

export default ManageClassCategory;
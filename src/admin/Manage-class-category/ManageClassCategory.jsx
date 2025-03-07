import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Modal,
  Button,
  TextField,
  Tooltip,
  Snackbar,
  Pagination,
  Checkbox,
  Grid,
  useMediaQuery,
  useTheme,
  Paper,
  Divider,
  CircularProgress,
  Backdrop,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Alert } from "@mui/material";
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 5 : 10;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getClassCategory();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        const errorMessage = error.response?.data?.message || "Failed to fetch class categories";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!selectedCategory?.name || selectedCategory.name.trim() === "") {
      errors.name = "Category name is required";
    } else if (selectedCategory.name.length < 2) {
      errors.name = "Category name must be at least 2 characters";
    } else if (selectedCategory.name.length > 50) {
      errors.name = "Category name cannot exceed 50 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleOpenAddEditModal = (category = null) => {
    setSelectedCategory(category || { name: "" });
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
    
    // Clear error when user types
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
      } else {
        const newCategory = await createClassCategory(selectedCategory);
        setCategories([...categories, newCategory]);
        showSnackbar("Category added successfully!");
      }
      handleCloseAddEditModal();
    } catch (error) {
      console.error("Error saving category:", error);
      const errorMessage = error.response?.data?.message || 
        (selectedCategory.id ? "Failed to update category" : "Failed to add category");
      showSnackbar(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      setSubmitting(true);
      await deleteClassCategory(selectedCategory.id);
      setCategories(categories.filter((cat) => cat.id !== selectedCategory.id));
      showSnackbar("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete category";
      showSnackbar(errorMessage, "error");
    } finally {
      setSubmitting(false);
      handleCloseDeleteModal();
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
      const errorMessage = error.response?.data?.message || "Failed to delete selected categories";
      showSnackbar(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  const currentCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCheckboxChange = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedCategories(currentCategories.map((category) => category.id));
    } else {
      setSelectedCategories([]);
    }
  };

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

        {/* Categories List Card */}
        <Card 
          elevation={2} 
          sx={{ 
            borderRadius: { xs: 1, sm: 2 },
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
            {/* Search and Count Section */}
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
                Class Categories ({filteredCategories.length})
              </Typography>
              
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search categories"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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
                                selectedCategories.length > 0 &&
                                selectedCategories.length < currentCategories.length
                              }
                              checked={
                                currentCategories.length > 0 &&
                                selectedCategories.length === currentCategories.length
                              }
                              onChange={handleSelectAll}
                              size={isMobile ? "small" : "medium"}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 600, width: isMobile ? 100 : 120 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentCategories.map((category, index) => (
                          <TableRow 
                            key={category.id} 
                            hover
                            sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedCategories.includes(category.id)}
                                onChange={() => handleCheckboxChange(category.id)}
                                size={isMobile ? "small" : "medium"}
                              />
                            </TableCell>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{category.name}</TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <IconButton
                                  size={isMobile ? "small" : "medium"}
                                  color="primary"
                                  onClick={() => handleOpenAddEditModal(category)}
                                >
                                  <EditIcon fontSize={isMobile ? "small" : "medium"} />
                                </IconButton>
                                <IconButton
                                  size={isMobile ? "small" : "medium"}
                                  color="error"
                                  onClick={() => handleOpenDeleteModal(category)}
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

        {/* Add/Edit Modal */}
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

        {/* Delete Confirmation Modal */}
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
            sx={{ width: "100%", boxShadow: 3 }}
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
      </Box>
    </Layout>
  );
};

export default ManageClassCategory;
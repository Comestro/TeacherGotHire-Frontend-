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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { Alert } from "@mui/material";
import Layout from "../Admin/Layout";
import {
  getClassCategory,
  updateClassCategory,
  deleteClassCategory,
  createClassCategory,
} from "../../services/adminClassCategoryApi";

const ManageClassCategory = () => {
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
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getClassCategory();
        setCategories(data);
      } catch (error) {
        setError("Failed to fetch class categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleOpenAddEditModal = (category = null) => {
    setSelectedCategory(category);
    setOpenAddEditModal(true);
  };

  const handleCloseAddEditModal = () => {
    setSelectedCategory(null);
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

  const handleSaveCategory = async () => {
    try {
      if (selectedCategory.id) {
        await updateClassCategory(selectedCategory.id, selectedCategory);
        setCategories(
          categories.map((cat) =>
            cat.id === selectedCategory.id ? selectedCategory : cat
          )
        );
        setSnackbar({
          open: true,
          message: "Category updated successfully!",
          severity: "success",
        });
      } else {
        const newCategory = await createClassCategory(selectedCategory);
        setCategories([...categories, newCategory]);
        setSnackbar({
          open: true,
          message: "Category added successfully!",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to save category",
        severity: "error",
      });
    }
    handleCloseAddEditModal();
  };

  const handleDeleteCategory = async () => {
    try {
      await deleteClassCategory(selectedCategory.id);
      setCategories(categories.filter((cat) => cat.id !== selectedCategory.id));
      setSnackbar({
        open: true,
        message: "Category deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete category",
        severity: "error",
      });
    }
    handleCloseDeleteModal();
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedCategories.map((categoryId) => deleteClassCategory(categoryId))
      );
      setCategories(categories.filter((cat) => !selectedCategories.includes(cat.id)));
      setSelectedCategories([]);
      setSnackbar({
        open: true,
        message: "Selected categories deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete selected categories",
        severity: "error",
      });
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredCategories.length / itemsPerPage);
  const currentCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Layout>
      <Box mt={3}>
        <Card style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Manage Class Categories
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenAddEditModal()}
            >
              Add New Class Category
            </Button>
          </CardContent>
        </Card>

        <Box mt={3}>
          <Card style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" gutterBottom>
                  Class Categories
                </Typography>
                <Box display="flex" alignItems="center">
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search by category name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <IconButton>
                          <SearchIcon />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedCategories.length === filteredCategories.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories(filteredCategories.map((category) => category.id));
                            } else {
                              setSelectedCategories([]);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedCategories.includes(category.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, category.id]);
                              } else {
                                setSelectedCategories(
                                  selectedCategories.filter((id) => id !== category.id)
                                );
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>{category.id}</TableCell>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleOpenAddEditModal(category)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleOpenDeleteModal(category)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {pageCount > 1 && (
                <Box mt={2} display="flex" justifyContent="center">
                  <Pagination
                    count={pageCount}
                    page={currentPage}
                    onChange={(event, value) => setCurrentPage(value)}
                    color="primary"
                  />
                </Box>
              )}
              <br />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleBulkDelete}
                disabled={selectedCategories.length === 0}
              >
                Delete Selected
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Modal open={openAddEditModal} onClose={handleCloseAddEditModal}>
          <Box
            p={4}
            bgcolor="background.paper"
            sx={{
              width: "90%",
              maxWidth: "400px",
              margin: "auto",
              marginTop: "10%",
              boxShadow: 3,
              borderRadius: 2,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <Typography variant="h6" gutterBottom>
              {selectedCategory
                ? "Edit Class Category"
                : "Add New Class Category"}
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Category Name"
              value={selectedCategory ? selectedCategory.name : ""}
              onChange={(e) =>
                setSelectedCategory({
                  ...selectedCategory,
                  name: e.target.value,
                })
              }
            />
            <Box mt={2} display="flex" justifyContent="space-between">
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCloseAddEditModal}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveCategory}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Modal>

        <Modal open={openDeleteModal} onClose={handleCloseDeleteModal}>
          <Box
            p={4}
            bgcolor="background.paper"
            sx={{
              width: "90%",
              maxWidth: "400px",
              margin: "auto",
              marginTop: "10%",
              boxShadow: 3,
              borderRadius: 2,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Delete Class Category
            </Typography>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete this class category? This action
              cannot be undone.
            </Typography>
            <Box mt={2} display="flex" justifyContent="space-between">
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCloseDeleteModal}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDeleteCategory}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </Modal>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default ManageClassCategory;
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Alert } from "@mui/material";
import Layout from "../Admin/Layout";
import {
  getLevel,
  updateLevel,
  createLevel,
  deleteLevel,
  deleteAllLevel,
} from "../../services/adminManageLevel";

const ManageLevel = () => {
  const [levels, setLevels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedLevels, setSelectedLevels] = useState([]);
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
    const fetchLevels = async () => {
      try {
        const data = await getLevel();
        setLevels(data);
      } catch (error) {
        setError("Failed to fetch levels");
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

  const handleOpenAddEditModal = (level = null) => {
    setSelectedLevel(level);
    setOpenAddEditModal(true);
  };

  const handleCloseAddEditModal = () => {
    setSelectedLevel(null);
    setOpenAddEditModal(false);
  };

  const handleOpenDeleteModal = (level) => {
    setSelectedLevel(level);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedLevel(null);
    setOpenDeleteModal(false);
  };

  const handleOpenViewModal = (level) => {
    setSelectedLevel(level);
    setOpenViewModal(true);
  };

  const handleCloseViewModal = () => {
    setSelectedLevel(null);
    setOpenViewModal(false);
  };

  const handleSaveLevel = async () => {
    try {
      if (selectedLevel.id) {
        await updateLevel(selectedLevel.id, selectedLevel);
        setLevels(
          levels.map((lvl) =>
            lvl.id === selectedLevel.id ? selectedLevel : lvl
          )
        );
        setSnackbar({
          open: true,
          message: "Level updated successfully!",
          severity: "success",
        });
      } else {
        const newLevel = await createLevel(selectedLevel);
        setLevels([...levels, newLevel]);
        setSnackbar({
          open: true,
          message: "Level added successfully!",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to save level",
        severity: "error",
      });
    }
    handleCloseAddEditModal();
  };

  const handleDeleteLevel = async () => {
    try {
      await deleteLevel(selectedLevel.id);
      setLevels(levels.filter((lvl) => lvl.id !== selectedLevel.id));
      setSnackbar({
        open: true,
        message: "Level deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete level",
        severity: "error",
      });
    }
    handleCloseDeleteModal();
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedLevels.map((levelId) => deleteLevel(levelId))
      );
      setLevels(levels.filter((lvl) => !selectedLevels.includes(lvl.id)));
      setSelectedLevels([]);
      setSnackbar({
        open: true,
        message: "Selected levels deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete selected levels",
        severity: "error",
      });
    }
  };

  const filteredLevels = levels.filter((lvl) =>
    lvl.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredLevels.length / itemsPerPage);
  const currentLevels = filteredLevels.slice(
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
              Manage Level
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenAddEditModal()}
            >
              Add New Level
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
                  Levels
                </Typography>
                <Box display="flex" alignItems="center">
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search by level name"
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
                          checked={
                            selectedLevels.length === filteredLevels.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLevels(
                                filteredLevels.map((level) => level.id)
                              );
                            } else {
                              setSelectedLevels([]);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentLevels.map((level, index) => (
                      <TableRow key={level.id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedLevels.includes(level.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLevels([
                                  ...selectedLevels,
                                  level.id,
                                ]);
                              } else {
                                setSelectedLevels(
                                  selectedLevels.filter(
                                    (id) => id !== level.id
                                  )
                                );
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>{index + 1 + (currentPage - 1) * itemsPerPage}</TableCell>
                        <TableCell>{level.name}</TableCell>
                        <TableCell>{level.description}</TableCell>
                        <TableCell>
                          <Tooltip title="View">
                            <IconButton
                              onClick={() => handleOpenViewModal(level)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleOpenAddEditModal(level)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleOpenDeleteModal(level)}
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
              <Button
                variant="contained"
                color="secondary"
                onClick={handleBulkDelete}
                disabled={selectedLevels.length === 0}
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
              {selectedLevel ? "Edit Level" : "Add New Level"}
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Level Name"
              value={selectedLevel ? selectedLevel.name : ""}
              onChange={(e) =>
                setSelectedLevel({
                  ...selectedLevel,
                  name: e.target.value,
                })
              }
            />
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              value={selectedLevel ? selectedLevel.description : ""}
              onChange={(e) =>
                setSelectedLevel({
                  ...selectedLevel,
                  description: e.target.value,
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
                onClick={handleSaveLevel}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Modal>

        <Modal open={openViewModal} onClose={handleCloseViewModal}>
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
              View Level
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Name:</strong> {selectedLevel?.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Description:</strong> {selectedLevel?.description}
            </Typography>
            <Box mt={2} display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleCloseViewModal}
              >
                Close
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
              Delete Level
            </Typography>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete this level? This action cannot be
              undone.
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
                onClick={handleDeleteLevel}
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

export default ManageLevel;
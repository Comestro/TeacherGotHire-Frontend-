import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Snackbar,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Layout from "../Admin/Layout";
import {
  getQualification,
  createQualification,
  updateQualification,
  deleteQualification,
} from "../../services/adminManageQualificationApi";

const ManageQualification = () => {
  const [qualifications, setQualifications] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentQualification, setCurrentQualification] = useState({
    id: null,
    name: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [error, setError] = useState("");

  // fetch qualifications from the server
  useEffect(() => {
    const fetchQualifications = async () => {
      try {
        const data = await getQualification();
        setQualifications(data);
      } catch (error) {
        setNotification({
          open: true,
          message: "Error fetching qualifications.",
          type: "error",
        });
      }
    };
    fetchQualifications();
  }, []);

  const handleAddQualification = () => {
    setCurrentQualification({
      id: null,
      name: "",
    });
    setError("");
    setIsEditModalOpen(true);
  };

  const handleEditQualification = (qualification) => {
    setCurrentQualification(qualification);
    setError("");
    setIsEditModalOpen(true);
  };

  const handleDeleteQualification = async (qualificationId) => {
    try {
      await deleteQualification(qualificationId);
      setQualifications(
        qualifications.filter(
          (qualification) => qualification.id !== qualificationId
        )
      );
      setNotification({
        open: true,
        message: "Qualification deleted successfully.",
        type: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: "Error deleting qualification.",
        type: "error",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedQualifications.map((id) => deleteQualification(id))
      );
      setQualifications(
        qualifications.filter(
          (qualification) => !selectedQualifications.includes(qualification.id)
        )
      );
      setSelectedQualifications([]);
      setNotification({
        open: true,
        message: "Selected qualifications deleted successfully.",
        type: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: "Error deleting selected qualifications.",
        type: "error",
      });
    }
  };

  const handleSaveQualification = async () => {
    if (!currentQualification.name) {
      setError("Qualification name is required");
      return;
    }

    try {
      const payload = {
        name: currentQualification.name,
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
        setNotification({
          open: true,
          message: "Qualification updated successfully.",
          type: "success",
        });
      } else {
        const newQualification = await createQualification(payload);
        setQualifications([...qualifications, newQualification]);
        setNotification({
          open: true,
          message: "Qualification added successfully.",
          type: "success",
        });
      }
      setIsEditModalOpen(false);
    } catch (error) {
      setNotification({
        open: true,
        message: "Error saving qualification.",
        type: "error",
      });
    }
  };

  const filteredQualifications = qualifications.filter((qualification) => {
    return (
      qualification.name &&
      qualification.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Layout>
      <Container>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography variant="h4" gutterBottom>
              Manage Teacher Qualifications
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddQualification}
              fullWidth
              style={{ height: '100%' }}
            >
              Add Qualification
            </Button>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center" mt={2} mb={2}>
          <Grid item xs={12}>
            <TextField
              label="Search Qualifications"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
        </Grid>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              <TableCell>Qualification Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQualifications.map((qualification) => (
              <TableRow key={qualification.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedQualifications.includes(qualification.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedQualifications([
                          ...selectedQualifications,
                          qualification.id,
                        ]);
                      } else {
                        setSelectedQualifications(
                          selectedQualifications.filter(
                            (id) => id !== qualification.id
                          )
                        );
                      }
                    }}
                  />
                </TableCell>
                <TableCell>{qualification.name}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEditQualification(qualification)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteQualification(qualification.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleBulkDelete}
        >
          Delete Selected
        </Button>
        <Dialog
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <DialogTitle>
            {currentQualification.id ? "Edit Qualification" : "Add Qualification"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Qualification Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={currentQualification.name}
              onChange={(e) =>
                setCurrentQualification({
                  ...currentQualification,
                  name: e.target.value,
                })
              }
              error={!!error}
              helperText={error}
              FormHelperTextProps={{ style: { color: 'red' } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditModalOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveQualification} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          message={notification.message}
          severity={notification.type}
        />
      </Container>
    </Layout>
  );
};

export default ManageQualification;
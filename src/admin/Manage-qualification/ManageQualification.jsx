import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
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
  FormControl,
  InputLabel,
  Chip,
  Box,
  Tooltip,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import Layout from "../Admin/Layout";

const ManageQualification = () => {
  const [qualifications, setQualifications] = useState([
    {
      id: 1,
      name: "Bachelor of Science",
      category: "Degree",
      dateAdded: "2023-01-01",
      fields: ["Science"],
    },
    {
      id: 2,
      name: "Diploma in Education",
      category: "Diploma",
      dateAdded: "2023-02-01",
      fields: ["Teaching"],
    },
    {
      id: 3,
      name: "Certification in Arts",
      category: "Certification",
      dateAdded: "2023-03-01",
      fields: ["Arts"],
    },
  ]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentQualification, setCurrentQualification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "",
  });

  const handleAddQualification = () => {
    setCurrentQualification(null);
    setIsEditModalOpen(true);
  };

  const handleEditQualification = (qualification) => {
    setCurrentQualification(qualification);
    setIsEditModalOpen(true);
  };

  const handleDeleteQualification = (qualificationId) => {
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
  };

  const handleBulkDelete = () => {
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
  };

  const handleSaveQualification = () => {
    // Add save logic here
    setIsEditModalOpen(false);
    setNotification({
      open: true,
      message: "Qualification saved successfully.",
      type: "success",
    });
  };

  const filteredQualifications = qualifications.filter((qualification) => {
    return (
      qualification.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory
        ? qualification.category.toLowerCase() ===
          selectedCategory.toLowerCase()
        : true)
    );
  });

  const checkDuplicate = (name) => {
    return qualifications.some(
      (qualification) => qualification.name.toLowerCase() === name.toLowerCase()
    );
  };

  return (
    <Layout>
      <Container>
        <Typography variant="h4" gutterBottom>
          Manage Qualifications
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddQualification}
        >
          Add Qualification
        </Button>
        <Box mt={2} mb={2}>
          <TextField
            label="Search Qualifications"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="degree">Degree</MenuItem>
              <MenuItem value="diploma">Diploma</MenuItem>
              <MenuItem value="certification">Certification</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              <TableCell>Qualification Name</TableCell>
              <TableCell>Category/Type</TableCell>
              <TableCell>Date Added</TableCell>
              <TableCell>Associated Fields</TableCell>
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
                <TableCell>{qualification.category}</TableCell>
                <TableCell>{qualification.dateAdded}</TableCell>
                <TableCell>{qualification.fields.join(", ")}</TableCell>
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
            {currentQualification ? "Edit Qualification" : "Add Qualification"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Qualification Name"
              variant="outlined"
              fullWidth
              margin="normal"
              defaultValue={
                currentQualification ? currentQualification.name : ""
              }
              error={checkDuplicate(
                currentQualification ? currentQualification.name : ""
              )}
              helperText={
                checkDuplicate(
                  currentQualification ? currentQualification.name : ""
                )
                  ? "This qualification already exists. Please enter a unique qualification."
                  : ""
              }
            />
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Category/Type</InputLabel>
              <Select
                label="Category/Type"
                defaultValue={
                  currentQualification ? currentQualification.category : ""
                }
              >
                <MenuItem value="degree">Degree</MenuItem>
                <MenuItem value="diploma">Diploma</MenuItem>
                <MenuItem value="certification">Certification</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              defaultValue={
                currentQualification ? currentQualification.description : ""
              }
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

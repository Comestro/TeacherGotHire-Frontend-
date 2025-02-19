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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Layout from "../Admin/Layout";
import {
  getSubjects,
  updateSubject,
  deleteSubject,
  createSubject,
  getClasses,
} from "../../services/adminSubujectApi";

const ManageSubject = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState([]);

  // Fetch subjects and classes on component mount
  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  // Fetch subjects from the API
  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
      setFilteredSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  // Fetch classes from the API
  const fetchClasses = async () => {
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  // Handle adding a new subject
  const handleAddSubject = () => {
    setCurrentSubject({ class_category: "", subject_name: "" });
    setIsEditModalOpen(true);
  };

  // Handle editing a subject
  const handleEditSubject = (subject) => {
    setCurrentSubject(subject);
    setIsEditModalOpen(true);
  };

  // Handle deleting a subject
  const handleDeleteSubject = async (subjectId) => {
    try {
      await deleteSubject(subjectId);
      fetchSubjects();
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  // Handle bulk deletion of selected subjects
  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedSubjects.map((subjectId) => deleteSubject(subjectId))
      );
      fetchSubjects();
      setSelectedSubjects([]);
    } catch (error) {
      console.error("Error deleting selected subjects:", error);
    }
  };

  // Handle saving a subject (create or update)
  const handleSaveSubject = async () => {
    try {
      if (currentSubject.id) {
        await updateSubject(currentSubject.id, {
          ...currentSubject,
          class_category: currentSubject.class_category,
        });
      } else {
        await createSubject({
          ...currentSubject,
          class_category: currentSubject.class_category,
        });
      }
      fetchSubjects();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error saving subject:", error);
    }
  };

  // Handle search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = subjects.filter((subject) =>
        subject.subject_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects(subjects);
    }
  };

  return (
    <Layout>
      <Container>
        <Typography variant="h4" gutterBottom>
          Manage Subjects
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddSubject}
        >
          Add Subject
        </Button>
        <Box mt={2} mb={2}>
          <TextField
            label="Search Subjects"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Box>
        <Typography variant="h6" gutterBottom>
          Total Subjects: {filteredSubjects.length}
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedSubjects.length === filteredSubjects.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSubjects(
                        filteredSubjects.map((subject) => subject.id)
                      );
                    } else {
                      setSelectedSubjects([]);
                    }
                  }}
                />
              </TableCell>
              <TableCell>Subject Name</TableCell>
              <TableCell>Class Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubjects.map((subject) => (
              <TableRow key={`subject-${subject.id}`}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedSubjects.includes(subject.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubjects([...selectedSubjects, subject.id]);
                      } else {
                        setSelectedSubjects(
                          selectedSubjects.filter((id) => id !== subject.id)
                        );
                      }
                    }}
                  />
                </TableCell>
                <TableCell>{subject.subject_name}</TableCell>
                <TableCell>
                  {
                    classes.find((cls) => cls.id === subject.class_category)
                      ?.name
                  }
                </TableCell>
                <TableCell>
                  <IconButton
                    key={`edit-${subject.id}`}
                    onClick={() => handleEditSubject(subject)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    key={`delete-${subject.id}`}
                    onClick={() => handleDeleteSubject(subject.id)}
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
            {currentSubject && currentSubject.id
              ? "Edit Subject"
              : "Add Subject"}
          </DialogTitle>
          <DialogContent>
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Class Category</InputLabel>
              <Select
                value={currentSubject ? currentSubject.class_category : ""}
                onChange={(e) =>
                  setCurrentSubject({
                    ...currentSubject,
                    class_category: e.target.value,
                  })
                }
                label="Class Category"
              >
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Subject Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={currentSubject ? currentSubject.subject_name : ""}
              onChange={(e) =>
                setCurrentSubject({
                  ...currentSubject,
                  subject_name: e.target.value,
                })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditModalOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveSubject} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default ManageSubject;
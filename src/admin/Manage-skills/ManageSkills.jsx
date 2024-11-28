import React, { useState } from "react";
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
  Box,
  Snackbar,
  TablePagination,
  Switch,
  Paper,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Layout from "../Admin/Layout";

const ManageSkills = () => {
  const [skills, setSkills] = useState([
    {
      id: 1,
      name: "Mathematics",
      category: "Subject-Specific",
      level: "Advanced",
      dateAdded: "2023-01-01",
      status: "Active",
    },
    {
      id: 2,
      name: "Physics",
      category: "Subject-Specific",
      level: "Intermediate",
      dateAdded: "2023-01-02",
      status: "Active",
    },
    {
      id: 3,
      name: "Chemistry",
      category: "Subject-Specific",
      level: "Beginner",
      dateAdded: "2023-01-03",
      status: "Inactive",
    },
    {
      id: 4,
      name: "Biology",
      category: "Subject-Specific",
      level: "Advanced",
      dateAdded: "2023-01-04",
      status: "Active",
    },
    {
      id: 5,
      name: "English",
      category: "Subject-Specific",
      level: "Intermediate",
      dateAdded: "2023-01-05",
      status: "Active",
    },
    {
      id: 6,
      name: "Communication",
      category: "Soft Skills",
      level: "Advanced",
      dateAdded: "2023-01-06",
      status: "Active",
    },
    {
      id: 7,
      name: "Teamwork",
      category: "Soft Skills",
      level: "Intermediate",
      dateAdded: "2023-01-07",
      status: "Inactive",
    },
    {
      id: 8,
      name: "Problem Solving",
      category: "Soft Skills",
      level: "Advanced",
      dateAdded: "2023-01-08",
      status: "Active",
    },
    {
      id: 9,
      name: "JavaScript",
      category: "Technical Skills",
      level: "Beginner",
      dateAdded: "2023-01-09",
      status: "Active",
    },
    {
      id: 10,
      name: "Python",
      category: "Technical Skills",
      level: "Intermediate",
      dateAdded: "2023-01-10",
      status: "Active",
    },
    {
      id: 11,
      name: "Data Analysis",
      category: "Technical Skills",
      level: "Advanced",
      dateAdded: "2023-01-11",
      status: "Inactive",
    },
    {
      id: 12,
      name: "Machine Learning",
      category: "Technical Skills",
      level: "Advanced",
      dateAdded: "2023-01-12",
      status: "Active",
    },
  ]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleAddSkill = () => {
    setCurrentSkill(null);
    setIsEditModalOpen(true);
  };

  const handleEditSkill = (skill) => {
    setCurrentSkill(skill);
    setIsEditModalOpen(true);
  };

  const handleDeleteSkill = (skillId) => {
    setSkills(skills.filter((skill) => skill.id !== skillId));
    setNotification({
      open: true,
      message: "Skill deleted successfully.",
      type: "success",
    });
  };

  const handleBulkDelete = () => {
    setSkills(skills.filter((skill) => !selectedSkills.includes(skill.id)));
    setSelectedSkills([]);
    setNotification({
      open: true,
      message: "Selected skills deleted successfully.",
      type: "success",
    });
  };

  const handleSaveSkill = () => {
    // Add save logic here
    setIsEditModalOpen(false);
    setNotification({
      open: true,
      message: "Skill saved successfully.",
      type: "success",
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredSkills = skills.filter((skill) => {
    return (
      (skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.id.toString().includes(searchQuery)) &&
      (selectedCategory
        ? skill.category.toLowerCase() === selectedCategory.toLowerCase()
        : true) &&
      (selectedLevel
        ? skill.level.toLowerCase() === selectedLevel.toLowerCase()
        : true) &&
      (selectedStatus
        ? skill.status.toLowerCase() === selectedStatus.toLowerCase()
        : true)
    );
  });

  return (
    <Layout>
      <Container>
        <Typography variant="h4" gutterBottom>
          Manage Skills
        </Typography>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddSkill}
          >
            Add Skill
          </Button>
        </Box>
        <Box mt={2} mb={2}>
          <TextField
            label="Search Skills"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Skill Category</InputLabel>
            <Select
              label="Skill Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="teaching">Teaching</MenuItem>
              <MenuItem value="communication">Communication</MenuItem>
              <MenuItem value="subject-specific">Subject-Specific</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Skill Level</InputLabel>
            <Select
              label="Skill Level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              <TableCell>Skill Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Skill Level</TableCell>
              <TableCell>Date Added</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSkills
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((skill) => (
                <TableRow key={skill.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedSkills.includes(skill.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSkills([...selectedSkills, skill.id]);
                        } else {
                          setSelectedSkills(
                            selectedSkills.filter((id) => id !== skill.id)
                          );
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{skill.name}</TableCell>
                  <TableCell>{skill.category}</TableCell>
                  <TableCell>{skill.level}</TableCell>
                  <TableCell>{skill.dateAdded}</TableCell>
                  <TableCell>
                    <Switch
                      checked={skill.status === "Active"}
                      onChange={() => {
                        const newStatus =
                          skill.status === "Active" ? "Inactive" : "Active";
                        setSkills(
                          skills.map((s) =>
                            s.id === skill.id ? { ...s, status: newStatus } : s
                          )
                        );
                      }}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditSkill(skill)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteSkill(skill.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredSkills.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
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
          <DialogTitle>{currentSkill ? "Edit Skill" : "Add Skill"}</DialogTitle>
          <DialogContent>
            <TextField
              label="Skill Name"
              variant="outlined"
              fullWidth
              margin="normal"
              defaultValue={currentSkill ? currentSkill.name : ""}
            />
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                defaultValue={currentSkill ? currentSkill.category : ""}
              >
                <MenuItem value="teaching">Teaching</MenuItem>
                <MenuItem value="communication">Communication</MenuItem>
                <MenuItem value="subject-specific">Subject-Specific</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Skill Level</InputLabel>
              <Select
                label="Skill Level"
                defaultValue={currentSkill ? currentSkill.level : ""}
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              defaultValue={currentSkill ? currentSkill.description : ""}
            />
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                defaultValue={currentSkill ? currentSkill.status : ""}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditModalOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveSkill} color="primary">
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

export default ManageSkills;

import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, TextField,
  Table, TableBody, TableCell, TableHead, TableRow, Checkbox,
  IconButton, Dialog, DialogActions, DialogContent, DialogTitle,
  Box, Snackbar, Grid
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Alert } from '@mui/material';
import Layout from "../Admin/Layout";
import {
  getSkills, updateSkill, deleteSkill,
  createSkill
} from '../../services/adminSkillsApi';

const ManageSkills = () => {
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const data = await getSkills();
      setSkills(data);
      setFilteredSkills(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching skills",
        severity: "error",
      });
    }
  };

  const handleAddSkill = () => {
    setCurrentSkill({ name: '', description: '' });
    setError("");
    setIsEditModalOpen(true);
  };

  const handleEditSkill = (skill) => {
    setCurrentSkill(skill);
    setError("");
    setIsEditModalOpen(true);
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await deleteSkill(skillId);
      fetchSkills();
      setSnackbar({
        open: true,
        message: "Skill deleted successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error deleting skill",
        severity: "error",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedSkills.map(skillId => deleteSkill(skillId)));
      fetchSkills();
      setSelectedSkills([]);
      setSnackbar({
        open: true,
        message: "Selected skills deleted successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error deleting selected skills",
        severity: "error",
      });
    }
  };

  const handleSaveSkill = async () => {
    if (!currentSkill.name) {
      setError("Skill name is required");
      return;
    }

    try {
      if (currentSkill.id) {
        await updateSkill(currentSkill.id, currentSkill);
        setSnackbar({
          open: true,
          message: "Skill updated successfully",
          severity: "success",
        });
      } else {
        await createSkill(currentSkill);
        setSnackbar({
          open: true,
          message: "Skill added successfully",
          severity: "success",
        });
      }
      fetchSkills();
      setIsEditModalOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error saving skill",
        severity: "error",
      });
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = skills.filter(skill =>
        skill.name.toLowerCase().includes(query.toLowerCase()) ||
        skill.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills(skills);
    }
  };

  return (
    <Layout>
      <Container>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography variant="h4" gutterBottom>Manage Extra Skills</Typography>
          </Grid>
          <Grid item xs={12} sm={4} style={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddSkill}
            >
              Add Skill
            </Button>
          </Grid>
        </Grid>
        <Box mt={2} mb={2}>
          <TextField
            label="Search Skills"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Box>
        <Typography variant="h6" gutterBottom>
          Total Skills: {filteredSkills.length}
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedSkills.length === filteredSkills.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSkills(filteredSkills.map(skill => skill.id));
                    } else {
                      setSelectedSkills([]);
                    }
                  }}
                />
              </TableCell>
              <TableCell>Skill Name</TableCell>
              <TableCell>Skill Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSkills.map((skill, index) => (
              <TableRow key={index}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedSkills.includes(skill.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSkills([...selectedSkills, skill.id]);
                      } else {
                        setSelectedSkills(selectedSkills.filter(id => id !== skill.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell>{skill.name}</TableCell>
                <TableCell>{skill.description}</TableCell>
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
        <Button
          variant="contained"
          color="secondary"
          onClick={handleBulkDelete}
          sx={{ mt: 2 }}
        >
          Delete Selected
        </Button>
        <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <DialogTitle>{currentSkill && currentSkill.id ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
          <DialogContent>
            <TextField
              label="Skill Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={currentSkill ? currentSkill.name : ''}
              onChange={(e) => setCurrentSkill({ ...currentSkill, name: e.target.value })}
              error={!!error}
              helperText={error}
              FormHelperTextProps={{ style: { color: 'red' } }}
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={currentSkill ? currentSkill.description : ''}
              onChange={(e) => setCurrentSkill({ ...currentSkill, description: e.target.value })}
              error={!!error}
              helperText={error}
              FormHelperTextProps={{ style: { color: 'red' } }}
            />
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
      </Container>
    </Layout>
  );
};

export default ManageSkills;
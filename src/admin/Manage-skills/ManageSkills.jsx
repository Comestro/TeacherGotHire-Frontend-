import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Button, TextField, 
  Table, TableBody, TableCell, TableHead, TableRow, Checkbox, 
  IconButton, Dialog, DialogActions, DialogContent, DialogTitle, 
  Box 
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Layout from "../Admin/Layout";
import { 
  getSkills, updateSkill, deleteSkill, 
  deleteAllSkills, createSkill 
} from '../../services/adminSkillsApi';

const ManageSkills = () => {
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const data = await getSkills();
      setSkills(data);
      setFilteredSkills(data);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  const handleAddSkill = () => {
    setCurrentSkill({ name: '', description: '' });
    setIsEditModalOpen(true);
  };

  const handleEditSkill = (skill) => {
    setCurrentSkill(skill);
    setIsEditModalOpen(true);
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await deleteSkill(skillId);
      fetchSkills();
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedSkills.map(skillId => deleteSkill(skillId)));
      fetchSkills();
      setSelectedSkills([]);
    } catch (error) {
      console.error("Error deleting selected skills:", error);
    }
  };

  const handleSaveSkill = async () => {
    try {
      if (currentSkill.id) {
        await updateSkill(currentSkill.id, currentSkill);
      } else {
        await createSkill(currentSkill);
      }
      fetchSkills();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error saving skill:", error);
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
        <Typography variant="h4" gutterBottom>Manage Extra Skills</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={handleAddSkill}
        >
          Add Skill
        </Button>
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
              {/* <TableCell>Category</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Status</TableCell> */}
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
                {/* <TableCell>{skill.category}</TableCell>
                <TableCell>{skill.level}</TableCell>
                <TableCell>{skill.status}</TableCell> */}
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
            />
            {/* <TextField 
              label="Category" 
              variant="outlined" 
              fullWidth 
              margin="normal" 
              value={currentSkill ? currentSkill.category : ''} 
              onChange={(e) => setCurrentSkill({ ...currentSkill, category: e.target.value })}
            />
            <TextField 
              label="Level" 
              variant="outlined" 
              fullWidth 
              margin="normal" 
              value={currentSkill ? currentSkill.level : ''} 
              onChange={(e) => setCurrentSkill({ ...currentSkill, level: e.target.value })}
            />
            <TextField 
              label="Status" 
              variant="outlined" 
              fullWidth 
              margin="normal" 
              value={currentSkill ? currentSkill.status : ''} 
              onChange={(e) => setCurrentSkill({ ...currentSkill, status: e.target.value })}
            /> */}
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
      </Container>
    </Layout>
  );
};

export default ManageSkills;
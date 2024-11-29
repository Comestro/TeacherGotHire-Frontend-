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
  getSubjects, updateSubject, deleteSubject, 
  deleteAllSubjects, createSubject 
} from '../../services/adminSubujectApi';

const ManageSubject = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
      setFilteredSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleAddSubject = () => {
    setCurrentSubject({ subject_name: '', subject_description: '' });
    setIsEditModalOpen(true);
  };

  const handleEditSubject = (subject) => {
    setCurrentSubject(subject);
    setIsEditModalOpen(true);
  };

  const handleDeleteSubject = async (subjectId) => {
    try {
      await deleteSubject(subjectId);
      fetchSubjects();
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedSubjects.map(subjectId => deleteSubject(subjectId)));
      fetchSubjects();
      setSelectedSubjects([]);
    } catch (error) {
      console.error("Error deleting selected subjects:", error);
    }
  };

  const handleSaveSubject = async () => {
    try {
      if (currentSubject.id) {
        await updateSubject(currentSubject.id, currentSubject);
      } else {
        await createSubject(currentSubject);
      }
      fetchSubjects();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error saving subject:", error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = subjects.filter(subject =>
        subject.subject_name.toLowerCase().includes(query.toLowerCase()) ||
        subject.subject_description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects(subjects);
    }
  };

  return (
    <Layout>
      <Container>
        <Typography variant="h4" gutterBottom>Manage Subjects</Typography>
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
                      setSelectedSubjects(filteredSubjects.map(subject => subject.id));
                    } else {
                      setSelectedSubjects([]);
                    }
                  }}
                />
              </TableCell>
              <TableCell>Subject Name</TableCell>
              <TableCell>Subject Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell padding="checkbox">
                  <Checkbox 
                    checked={selectedSubjects.includes(subject.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubjects([...selectedSubjects, subject.id]);
                      } else {
                        setSelectedSubjects(selectedSubjects.filter(id => id !== subject.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell>{subject.subject_name}</TableCell>
                <TableCell>{subject.subject_description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditSubject(subject)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteSubject(subject.id)}>
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
          <DialogTitle>{currentSubject && currentSubject.id ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
          <DialogContent>
            <TextField 
              label="Subject Name" 
              variant="outlined" 
              fullWidth 
              margin="normal" 
              value={currentSubject ? currentSubject.subject_name : ''} 
              onChange={(e) => setCurrentSubject({ ...currentSubject, subject_name: e.target.value })}
            />
            <TextField 
              label="Description" 
              variant="outlined" 
              fullWidth 
              margin="normal" 
              multiline 
              rows={4} 
              value={currentSubject ? currentSubject.subject_description : ''} 
              onChange={(e) => setCurrentSubject({ ...currentSubject, subject_description: e.target.value })}
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
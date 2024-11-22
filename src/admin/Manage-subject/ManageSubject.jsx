import React, { useState } from 'react';
import { 
  Container, Typography, Button, TextField, Select, MenuItem, 
  Table, TableBody, TableCell, TableHead, TableRow, Checkbox, 
  IconButton, Dialog, DialogActions, DialogContent, DialogTitle, 
  FormControl, InputLabel, Chip, Box 
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Layout from "../Admin/Layout";

const ManageSubject = () => {
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Mathematics', category: 'Academic', gradeLevels: ['Primary', 'Secondary'], dateAdded: '2023-01-01' },
    { id: 2, name: 'Science', category: 'Academic', gradeLevels: ['Primary'], dateAdded: '2023-02-01' },
    { id: 3, name: 'Art', category: 'Extracurricular', gradeLevels: ['Secondary'], dateAdded: '2023-03-01' }
  ]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);

  const handleAddSubject = () => {
    setCurrentSubject(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubject = (subject) => {
    setCurrentSubject(subject);
    setIsEditModalOpen(true);
  };

  const handleDeleteSubject = (subjectId) => {
    setSubjects(subjects.filter(subject => subject.id !== subjectId));
  };

  const handleBulkDelete = () => {
    setSubjects(subjects.filter(subject => !selectedSubjects.includes(subject.id)));
    setSelectedSubjects([]);
  };

  const handleSaveSubject = () => {
    // Add save logic here
    setIsEditModalOpen(false);
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
          <TextField label="Search Subjects" variant="outlined" fullWidth />
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select label="Category">
              <MenuItem value=""><em>None</em></MenuItem>
              <MenuItem value="academic">Academic</MenuItem>
              <MenuItem value="extracurricular">Extracurricular</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Grade Level</InputLabel>
            <Select label="Grade Level">
              <MenuItem value=""><em>None</em></MenuItem>
              <MenuItem value="primary">Primary</MenuItem>
              <MenuItem value="secondary">Secondary</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              <TableCell>Subject Name</TableCell>
              <TableCell>Category/Type</TableCell>
              <TableCell>Associated Grade Levels</TableCell>
              <TableCell>Date Added</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map((subject) => (
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
                <TableCell>{subject.name}</TableCell>
                <TableCell>{subject.category}</TableCell>
                <TableCell>{subject.gradeLevels.join(', ')}</TableCell>
                <TableCell>{subject.dateAdded}</TableCell>
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
          <DialogTitle>{currentSubject ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
          <DialogContent>
            <TextField 
              label="Subject Name" 
              variant="outlined" 
              fullWidth 
              margin="normal" 
              defaultValue={currentSubject ? currentSubject.name : ''} 
            />
            <TextField 
              label="Description" 
              variant="outlined" 
              fullWidth 
              margin="normal" 
              multiline 
              rows={4} 
              defaultValue={currentSubject ? currentSubject.description : ''} 
            />
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Category/Type</InputLabel>
              <Select 
                label="Category/Type" 
                defaultValue={currentSubject ? currentSubject.category : ''}
              >
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="extracurricular">Extracurricular</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Grade Levels</InputLabel>
              <Select 
                label="Grade Levels" 
                multiple 
                defaultValue={currentSubject ? currentSubject.gradeLevels : []}
                renderValue={(selected) => (
                  <Box display="flex" flexWrap="wrap">
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="primary">Primary</MenuItem>
                <MenuItem value="secondary">Secondary</MenuItem>
              </Select>
            </FormControl>
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
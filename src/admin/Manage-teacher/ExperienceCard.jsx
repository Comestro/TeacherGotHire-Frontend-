import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Modal, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const ExperienceCard = ({ experience }) => {
  const [open, setOpen] = useState(false);
  const [editedExperience, setEditedExperience] = useState(experience);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    // Save the edited experience (you can add your save logic here)
    setOpen(false);
  };

  const handleExperienceChange = (index, field, event) => {
    const newExperience = [...editedExperience];
    newExperience[index][field] = event.target.value;
    setEditedExperience(newExperience);
  };

  return (
    <Box mt={3}>
      <Card style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" gutterBottom>
              Experience
            </Typography>
            <IconButton onClick={handleOpen}>
              <EditIcon />
            </IconButton>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job Title</TableCell>
                  <TableCell>Institution</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {experience.map((exp, index) => (
                  <TableRow key={index}>
                    <TableCell>{exp.title}</TableCell>
                    <TableCell>{exp.institution}</TableCell>
                    <TableCell>{exp.duration}</TableCell>
                    <TableCell>{exp.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Modal open={open} onClose={handleClose}>
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
            Edit Experience
          </Typography>
          {editedExperience.map((exp, index) => (
            <Box key={index} mb={2}>
              <TextField
                fullWidth
                margin="normal"
                label="Job Title"
                value={exp.title}
                onChange={(event) => handleExperienceChange(index, 'title', event)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Institution"
                value={exp.institution}
                onChange={(event) => handleExperienceChange(index, 'institution', event)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Duration"
                value={exp.duration}
                onChange={(event) => handleExperienceChange(index, 'duration', event)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Description"
                value={exp.description}
                onChange={(event) => handleExperienceChange(index, 'description', event)}
              />
            </Box>
          ))}
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button variant="contained" color="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ExperienceCard;
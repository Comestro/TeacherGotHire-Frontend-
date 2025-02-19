import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Modal, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getTeacherExperience } from '../../services/adminTeacherApi';

const ExperienceCard = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const [experience, setExperience] = useState([]);
  const [editedExperience, setEditedExperience] = useState([]);

  const handleOpen = () => {
    setEditedExperience(experience);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (!userId) return;
    const fetchExperience = async () => {
      try {
        const response = await getTeacherExperience(userId);
        if (response && response.id) {
          const formattedExperience = {
            id: response.id,
            institution: response.institution,
            role: response.role?.jobrole_name || 'N/A',
            start_date: response.start_date,
            end_date: response.end_date,
            achievements: response.achievements || 'N/A',
          };
          setExperience([formattedExperience]);
        } else {
          console.error('Unexpected response structure:', response);
        }
      } catch (error) {
        console.error('Error fetching experience:', error);
        setExperience([]);
      }
    };

    fetchExperience();
  }, [userId]);

  const handleSave = () => {
    // Save the edited experience (you can add your save logic here)
    setExperience(editedExperience);
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
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Achievements</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {experience.map((exp, index) => (
                  <TableRow key={index}>
                    <TableCell>{exp.role}</TableCell>
                    <TableCell>{exp.institution}</TableCell>
                    <TableCell>{exp.start_date}</TableCell>
                    <TableCell>{exp.end_date}</TableCell>
                    <TableCell>{exp.achievements}</TableCell>
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
                value={exp.role}
                onChange={(event) => handleExperienceChange(index, 'role', event)}
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
                label="Start Date"
                value={exp.start_date}
                onChange={(event) => handleExperienceChange(index, 'start_date', event)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="End Date"
                value={exp.end_date}
                onChange={(event) => handleExperienceChange(index, 'end_date', event)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Achievements"
                value={exp.achievements}
                onChange={(event) => handleExperienceChange(index, 'achievements', event)}
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
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Modal, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getTeacherSkills } from '../../services/adminTeacherApi';
import axios from 'axios';

const SkillsCard = ({ userId }) => {
  console.log('userId:', userId);

  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState([]);
  const [editedSkills, setEditedSkills] = useState([]);

  useEffect(() => {
    // Fetch skills data from the Api
    if (!userId) return;
    getTeacherSkills(userId)
      .then(response => {
        if (response && Array.isArray(response)) {
          const skillsData = response.map(skill => skill.skill);
          const uniqueSkills = Array.from(new Set(skillsData.map(skill => skill.id)))
            .map(id => skillsData.find(skill => skill.id === id));
          setSkills(uniqueSkills);
          setEditedSkills(uniqueSkills);
        } else {
          console.error('Unexpected response structure:', response.data);
        }
      })
      .catch(error => {
        console.error('Error fetching skills:', error);
      });
  }, [userId]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    // Save the edited skills
    axios.put(`/api/users/${userId}/skills`, { skills: editedSkills })
      .then(response => {
        setSkills(editedSkills);
        setOpen(false);
      })
      .catch(error => {
        console.error('Error saving skills:', error);
      });
  };

  const handleSkillChange = (index, event) => {
    const newSkills = [...editedSkills];
    newSkills[index].name = event.target.value;
    setEditedSkills(newSkills);
  };

  return (
    <Box mt={3}>
      <Card sx={{ boxShadow: 3, borderRadius: 2, overflow: "hidden" }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" gutterBottom>
              Skills and Expertise
            </Typography>
            <IconButton onClick={handleOpen}>
              <EditIcon />
            </IconButton>
          </Box>
          <Box>
            {skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill.name}
                color="primary"
                style={{ marginRight: 8 }}
              />
            ))}
          </Box>
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
          }}
        >
          <Typography variant="h6" gutterBottom>
            Edit Skills
          </Typography>
          {editedSkills.map((skill, index) => (
            <TextField
              key={index}
              fullWidth
              margin="normal"
              label={`Skill ${index + 1}`}
              value={skill.name}
              onChange={(event) => handleSkillChange(index, event)}
            />
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

export default SkillsCard;
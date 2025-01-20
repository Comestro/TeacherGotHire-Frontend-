import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Modal, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const SkillsCard = ({ skills }) => {
  const [open, setOpen] = useState(false);
  const [editedSkills, setEditedSkills] = useState(skills);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    // Save the edited skills (you can add your save logic here)
    setOpen(false);
  };

  const handleSkillChange = (index, event) => {
    const newSkills = [...editedSkills];
    newSkills[index] = event.target.value;
    setEditedSkills(newSkills);
  };

  return (
    <Box mt={3}>
      <Card style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
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
                label={skill}
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
              value={skill}
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
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Modal, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const QualificationsCard = ({ qualifications }) => {
  const [open, setOpen] = useState(false);
  const [editedQualifications, setEditedQualifications] = useState(qualifications);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    // Save the edited qualifications (you can add your save logic here)
    setOpen(false);
  };

  const handleQualificationChange = (index, field, event) => {
    const newQualifications = [...editedQualifications];
    newQualifications[index][field] = event.target.value;
    setEditedQualifications(newQualifications);
  };

  return (
    <Box mt={3}>
      <Card style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" gutterBottom>
              Qualifications
            </Typography>
            <IconButton onClick={handleOpen}>
              <EditIcon />
            </IconButton>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Degree</TableCell>
                  <TableCell>Institution</TableCell>
                  <TableCell>Year of Completion</TableCell>
                  <TableCell>Certification Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {qualifications.map((qualification, index) => (
                  <TableRow key={index}>
                    <TableCell>{qualification.degree}</TableCell>
                    <TableCell>{qualification.institution}</TableCell>
                    <TableCell>{qualification.year}</TableCell>
                    <TableCell>{qualification.certification}</TableCell>
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
            Edit Qualifications
          </Typography>
          {editedQualifications.map((qualification, index) => (
            <Box key={index} mb={2}>
              <TextField
                fullWidth
                margin="normal"
                label="Degree"
                value={qualification.degree}
                onChange={(event) => handleQualificationChange(index, 'degree', event)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Institution"
                value={qualification.institution}
                onChange={(event) => handleQualificationChange(index, 'institution', event)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Year of Completion"
                value={qualification.year}
                onChange={(event) => handleQualificationChange(index, 'year', event)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Certification Details"
                value={qualification.certification}
                onChange={(event) => handleQualificationChange(index, 'certification', event)}
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

export default QualificationsCard;
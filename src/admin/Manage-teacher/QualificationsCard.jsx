import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Modal, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getTeacherQualification } from '../../services/adminTeacherApi';

const QualificationsCard = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const [qualifications, setQualifications] = useState([]);
  const [editedQualifications, setEditedQualifications] = useState([]);

  // fetch qualifications data from the API
  useEffect(() => {
    if (!userId) return;
    getTeacherQualification(userId)
      .then(response => {
        if (response && Array.isArray(response)) {
          const formattedQualifications = response.map(item => ({
            id: item.id,
            degree: item.qualification?.name || 'N/A',
            institution: item.institution || 'N/A',
            year_of_passing: item.year_of_passing || 'N/A',
            grade_or_percentage: item.grade_or_percentage || 'N/A',
          }));
          setQualifications(formattedQualifications);
          setEditedQualifications(formattedQualifications);
        } else if (response && response.id) {
          const formattedQualification = {
            id: response.id,
            degree: response.qualification?.name || 'N/A',
            institution: response.institution || 'N/A',
            year_of_passing: response.year_of_passing || 'N/A',
            grade_or_percentage: response.grade_or_percentage || 'N/A',
          };
          setQualifications([formattedQualification]);
          setEditedQualifications([formattedQualification]);
        } else {
          console.error('Unexpected response structure:', response);
        }
      })
      .catch(error => {
        console.error('Error fetching qualifications:', error);
      });
  }, [userId]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = () => {
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
                  <TableCell>Year of Passing</TableCell>
                  <TableCell>Grade/Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {qualifications.map((qualification, index) => (
                  <TableRow key={index}>
                    <TableCell>{qualification.degree}</TableCell>
                    <TableCell>{qualification.institution}</TableCell>
                    <TableCell>{qualification.year_of_passing}</TableCell>
                    <TableCell>{qualification.grade_or_percentage}</TableCell>
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
                label="Year of Passing"
                value={qualification.year_of_passing}
                onChange={(event) => handleQualificationChange(index, 'year_of_passing', event)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Grade/Percentage"
                value={qualification.grade_or_percentage}
                onChange={(event) => handleQualificationChange(index, 'grade_or_percentage', event)}
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
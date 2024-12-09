import React from 'react';
import { Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const TeacherExperience = ({ experience }) => (
  <Box mt={4}>
    <Typography variant="h6" gutterBottom color="secondary.main">
      Experience
    </Typography>
    <TableContainer sx={{ boxShadow: 2, borderRadius: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Job Title</strong>
            </TableCell>
            <TableCell>
              <strong>Institution</strong>
            </TableCell>
            <TableCell>
              <strong>Duration</strong>
            </TableCell>
            <TableCell>
              <strong>Description</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {experience.map((exp, index) => (
            <TableRow key={index} hover>
              <TableCell>{exp.title}</TableCell>
              <TableCell>{exp.institution}</TableCell>
              <TableCell>{exp.duration}</TableCell>
              <TableCell>{exp.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

export default TeacherExperience;
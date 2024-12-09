import React from 'react';
import { Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const TeacherQualifications = ({ qualifications }) => (
  <Box mt={4}>
    <Typography variant="h6" gutterBottom color="secondary.main">
      Qualifications
    </Typography>
    <TableContainer sx={{ boxShadow: 2, borderRadius: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Degree</strong>
            </TableCell>
            <TableCell>
              <strong>Institution</strong>
            </TableCell>
            <TableCell>
              <strong>Year of Completion</strong>
            </TableCell>
            <TableCell>
              <strong>Certification Details</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {qualifications.map((qualification, index) => (
            <TableRow key={index} hover>
              <TableCell>{qualification.degree}</TableCell>
              <TableCell>{qualification.institution}</TableCell>
              <TableCell>{qualification.year}</TableCell>
              <TableCell>{qualification.certification}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

export default TeacherQualifications;
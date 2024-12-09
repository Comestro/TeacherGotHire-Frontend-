import React from 'react';
import { Box, Card, CardContent, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const ExperienceCard = ({ experience }) => {
  return (
    <Box mt={3}>
      <Card style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Experience
          </Typography>
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
    </Box>
  );
};

export default ExperienceCard;
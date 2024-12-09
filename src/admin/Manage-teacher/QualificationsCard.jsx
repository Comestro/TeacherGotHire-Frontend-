import React from 'react';
import { Box, Card, CardContent, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const QualificationsCard = ({ qualifications }) => {
  return (
    <Box mt={3}>
      <Card style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Qualifications
          </Typography>
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
    </Box>
  );
};

export default QualificationsCard;
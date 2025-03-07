import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { getTeacherQualification } from '../../services/adminTeacherApi';

const QualificationsCard = ({ userId }) => {
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch qualifications data from the API
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
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
        } else if (response && response.id) {
          const formattedQualification = {
            id: response.id,
            degree: response.qualification?.name || 'N/A',
            institution: response.institution || 'N/A',
            year_of_passing: response.year_of_passing || 'N/A',
            grade_or_percentage: response.grade_or_percentage || 'N/A',
          };
          setQualifications([formattedQualification]);
        } else {
          console.error('Unexpected response structure:', response);
          setQualifications([]);
        }
      })
      .catch(error => {
        console.error('Error fetching qualifications:', error);
        setQualifications([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  return (
    <Box mt={3}>
      <Card
        sx={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: 2,
          overflow: "hidden",
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
          }
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: "primary.main",
              mb: 2,
              borderBottom: '1px solid #f0f0f0',
              pb: 1
            }}
          >
            Qualifications
          </Typography>

          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Loading qualifications...
            </Typography>
          ) : qualifications.length > 0 ? (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: { xs: '100%', sm: 650 } }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Degree</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Institution</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Year of Passing</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Grade/Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {qualifications.map((qualification, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}
                    >
                      <TableCell>{qualification.degree}</TableCell>
                      <TableCell>{qualification.institution}</TableCell>
                      <TableCell>{qualification.year_of_passing}</TableCell>
                      <TableCell>{qualification.grade_or_percentage}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
              No qualification information available for this teacher.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default QualificationsCard;
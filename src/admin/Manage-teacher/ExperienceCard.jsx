import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { getTeacherExperience } from '../../services/adminTeacherApi';

const ExperienceCard = ({ userId }) => {
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchExperience = async () => {
      try {
        const response = await getTeacherExperience(userId);
        if (response && response.id) {
          const formattedExperience = {
            id: response.id,
            institution: response.institution || 'N/A',
            role: response.role?.jobrole_name || 'N/A',
            start_date: response.start_date || 'N/A',
            end_date: response.end_date || 'N/A',
            achievements: response.achievements || 'N/A',
          };
          setExperience([formattedExperience]);
        } else if (Array.isArray(response) && response.length > 0) {
          const formattedExperiences = response.map(item => ({
            id: item.id,
            institution: item.institution || 'N/A',
            role: item.role?.jobrole_name || 'N/A',
            start_date: item.start_date || 'N/A',
            end_date: item.end_date || 'N/A',
            achievements: item.achievements || 'N/A',
          }));
          setExperience(formattedExperiences);
        } else {
          
          setExperience([]);
        }
      } catch (error) {
        
        setExperience([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
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
            Experience
          </Typography>

          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Loading experience information...
            </Typography>
          ) : experience && experience.length > 0 ? (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: { xs: '100%', sm: 650 } }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Job Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Institution</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Achievements</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {experience.map((exp, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}
                    >
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
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
              No experience information available for this teacher.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExperienceCard;
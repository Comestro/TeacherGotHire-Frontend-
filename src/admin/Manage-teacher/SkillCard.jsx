import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { getTeacherSkills } from '../../services/adminTeacherApi';

const SkillsCard = ({ userId }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch skills data from the API
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getTeacherSkills(userId)
      .then(response => {
        if (response && Array.isArray(response)) {
          const skillsData = response.map(skill => skill.skill);
          const uniqueSkills = Array.from(new Set(skillsData.map(skill => skill.id)))
            .map(id => skillsData.find(skill => skill.id === id));
          setSkills(uniqueSkills);
        } else {
          console.error('Unexpected response structure:', response);
          setSkills([]);
        }
      })
      .catch(error => {
        console.error('Error fetching skills:', error);
        setSkills([]);
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
            Skills and Expertise
          </Typography>

          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Loading skills...
            </Typography>
          ) : skills.length > 0 ? (
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1
            }}>
              {skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill.name}
                  color="primary"
                  variant="outlined"
                  size="medium"
                  sx={{
                    borderRadius: "16px",
                    fontWeight: 500,
                    mb: 1
                  }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No skills information available for this teacher.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SkillsCard;
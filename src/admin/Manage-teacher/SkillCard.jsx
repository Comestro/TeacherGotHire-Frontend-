import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

const SkillsCard = ({ skills }) => {
  return (
    <Box mt={3}>
      <Card style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Skills and Expertise
          </Typography>
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
    </Box>
  );
};

export default SkillsCard;
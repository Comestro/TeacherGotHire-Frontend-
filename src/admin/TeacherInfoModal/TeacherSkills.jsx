import React from 'react';
import { Box, Typography } from '@mui/material';

const TeacherSkills = ({ skills }) => (
  <Box mt={4}>
    <Typography variant="h6" gutterBottom color="secondary.main">
      Skills and Expertise
    </Typography>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: 2,
        mt: 2,
      }}
    >
      {skills.map((skill, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "40px",
            padding: "12px",
            color: "black",
            borderRadius: "8px",
            fontSize: "0.9rem",
            fontWeight: "bold",
            boxShadow: 1,
            textAlign: "center",
          }}
        >
          {skill}
        </Box>
      ))}
    </Box>
  </Box>
);

export default TeacherSkills;
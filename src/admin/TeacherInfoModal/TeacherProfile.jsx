import React from 'react';
import { Grid, Avatar, Typography, Badge } from '@mui/material';

const TeacherProfile = ({ teacherData }) => (
  <Grid container spacing={4} alignItems="center">
    <Grid
      item
      xs={12}
      sm={4}
      container
      justifyContent="center"
      alignItems="center"
      sx={{ textAlign: "center" }}
    >
      <Avatar
        alt={teacherData.name}
        src={teacherData.profilePic}
        sx={{
          width: 150,
          height: 150,
          boxShadow: 2,
          border: "4px solid",
          borderColor: "primary.main",
        }}
      />
    </Grid>
    <Grid item xs={12} sm={8}>
      <Typography variant="h4" gutterBottom color="primary.main">
        {teacherData.name}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        <strong>Email:</strong> {teacherData.email}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        <strong>Phone:</strong> {teacherData.phone}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        <strong>Address:</strong> {teacherData.address}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        <strong>Registration Date:</strong> {teacherData.registrationDate}
      </Typography>
      <Badge
        className="mx-4 pb-6"
        badgeContent={teacherData.status}
        color={teacherData.status === "Active" ? "light" : "error"}
        sx={{ mt: 2 }}
      />
    </Grid>
  </Grid>
);

export default TeacherProfile;
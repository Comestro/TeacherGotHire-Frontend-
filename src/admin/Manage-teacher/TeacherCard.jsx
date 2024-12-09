import React from 'react';
import { Card, CardContent, Grid, Avatar, Typography, Badge } from '@mui/material';

const TeacherCard = ({ teacherData }) => {
  if (!teacherData) {
    return null; // or return a loading indicator or a message
  }

  return (
    <Card style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid
            item
            xs={12}
            sm={4}
            container
            justifyContent="center"
            alignItems="center"
            style={{ textAlign: "center" }}
          >
            <Avatar
              alt={teacherData.name}
              src={teacherData.profilePic}
              sx={{
                width: "40%",
                height: "130px",
              }}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="h5" gutterBottom>
              {teacherData.name}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {teacherData.email}
            </Typography>
            <Typography variant="body1">
              <strong>Phone:</strong> {teacherData.phone}
            </Typography>
            <Typography variant="body1">
              <strong>Address:</strong> {teacherData.address}
            </Typography>
            <Typography variant="body1">
              <strong>Registration Date:</strong>{" "}
              {teacherData.registrationDate}
            </Typography>
            <Badge
              badgeContent={teacherData.status}
              color="primary"
              className="mx-5"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TeacherCard;
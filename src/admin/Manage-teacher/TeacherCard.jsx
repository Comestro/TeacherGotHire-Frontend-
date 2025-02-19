import React, { useState } from "react";
import {
  Card,
  CardContent,
  Grid,
  Avatar,
  Typography,
  Badge,
  IconButton,
  Modal,
  TextField,
  Button,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

const TeacherCard = ({ teacherData }) => {
  const [open, setOpen] = useState(false);
  const [editedData, setEditedData] = useState(teacherData);

  if (!teacherData) return null;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSave = () => setOpen(false);

  const handleChange = (field, event) => {
    const [parent, child] = field.split('.');
    if (child) {
      setEditedData({
        ...editedData,
        [parent]: {
          ...editedData[parent],
          [child]: event.target.value,
        },
      });
    } else {
      setEditedData({ ...editedData, [field]: event.target.value });
    }
  };

  return (
    <>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} display="flex" justifyContent="center">
              <Avatar
                alt={teacherData?.Fname || "N/A"}
                src={teacherData?.profiles?.profile_picture || ""}
                sx={{ width: "40%", height: 130 }}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h5" gutterBottom>
                  {teacherData?.Fname || "N/A"} {teacherData?.Lname || "N/A"}
                </Typography>
                <IconButton onClick={handleOpen}>
                  <EditIcon />
                </IconButton>
              </Box>
              <Typography variant="body1">
                <strong>Email:</strong> {teacherData?.email || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Phone:</strong> {teacherData?.profiles?.phone_number || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Bio:</strong> {teacherData?.profiles?.bio || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Religion:</strong> {teacherData?.profiles?.religion || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Date of Birth:</strong> {teacherData?.profiles?.date_of_birth || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Marital Status:</strong> {teacherData?.profiles?.marital_status || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Gender:</strong> {teacherData?.profiles?.gender || "N/A"}
              </Typography>
              <Badge
                badgeContent={teacherData?.is_verified ? "Verified" : "Not Verified"}
                color={teacherData?.is_verified ? "primary" : "error"}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Modal open={open} onClose={handleClose}>
        <Box
          p={4}
          bgcolor="background.paper"
          sx={{
            width: "90%",
            maxWidth: 400,
            margin: "auto",
            mt: "10%",
            boxShadow: 3,
            borderRadius: 2,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Edit Teacher Information
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="First Name"
            value={editedData?.Fname || ""}
            onChange={(event) => handleChange("Fname", event)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Last Name"
            value={editedData?.Lname || ""}
            onChange={(event) => handleChange("Lname", event)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            value={editedData?.email || ""}
            onChange={(event) => handleChange("email", event)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Phone"
            value={editedData?.profiles?.phone_number || ""}
            onChange={(event) => handleChange("profiles.phone_number", event)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Bio"
            value={editedData?.profiles?.bio || ""}
            onChange={(event) => handleChange("profiles.bio", event)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Religion"
            value={editedData?.profiles?.religion || ""}
            onChange={(event) => handleChange("profiles.religion", event)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Date of Birth"
            value={editedData?.profiles?.date_of_birth || ""}
            onChange={(event) => handleChange("profiles.date_of_birth", event)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Marital Status"
            value={editedData?.profiles?.marital_status || ""}
            onChange={(event) => handleChange("profiles.marital_status", event)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Gender"
            value={editedData?.profiles?.gender || ""}
            onChange={(event) => handleChange("profiles.gender", event)}
          />
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button variant="contained" color="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default TeacherCard;
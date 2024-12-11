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

  if (!teacherData) {
    return null; // or return a loading indicator or a message
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    // Save the edited data (you can add your save logic here)
    setOpen(false);
  };

  const handleChange = (field, event) => {
    setEditedData({ ...editedData, [field]: event.target.value });
  };

  return (
    <>
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
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" gutterBottom>
                  {teacherData.name}
                </Typography>
                <IconButton onClick={handleOpen}>
                  <EditIcon />
                </IconButton>
              </Box>
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
                <strong>Registration Date:</strong> {teacherData.registrationDate}
              </Typography>
              <Badge
                badgeContent={teacherData.status}
                color={teacherData.status === "Active" ? "primary" : "error"}
                className="mx-5"
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
            maxWidth: "400px",
            margin: "auto",
            marginTop: "10%",
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
            label="Name"
            value={editedData.name}
            onChange={(event) => handleChange("name", event)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            value={editedData.email}
            onChange={(event) => handleChange("email", event)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Phone"
            value={editedData.phone}
            onChange={(event) => handleChange("phone", event)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Address"
            value={editedData.address}
            onChange={(event) => handleChange("address", event)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Registration Date"
            value={editedData.registrationDate}
            onChange={(event) => handleChange("registrationDate", event)}
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
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
    setEditedData({ ...editedData, [field]: event.target.value });
  };

  return (
    <>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} display="flex" justifyContent="center">
              <Avatar
                alt={teacherData.name}
                src={teacherData.profilePic}
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
                <strong>Phone:</strong> {teacherData.phone || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Address:</strong>{" "}
                {teacherData.address
                  ? `${teacherData.address.state || "N/A"}, ${
                      teacherData.address.division || "N/A"
                    },
                ${teacherData.address.district || "N/A"}, ${
                      teacherData.address.block || "N/A"
                    },
                ${teacherData.address.village || "N/A"}, ${
                      teacherData.address.area || "N/A"
                    },
                ${teacherData.address.pincode || "N/A"}`
                  : "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Registration Date:</strong>{" "}
                {teacherData.registrationDate || "N/A"}
              </Typography>
              <Badge
                badgeContent={teacherData.status || "N/A"}
                color={teacherData.status === "Active" ? "primary" : "error"}
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
            value={
              editedData.address
                ? `${editedData.address.state || "N/A"}, ${
                    editedData.address.division || "N/A"
                  },
                ${editedData.address.district || "N/A"}, ${
                    editedData.address.block || "N/A"
                  },
                ${editedData.address.village || "N/A"}, ${
                    editedData.address.area || "N/A"
                  },
                ${editedData.address.pincode || "N/A"}`
                : "N/A"
            }
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

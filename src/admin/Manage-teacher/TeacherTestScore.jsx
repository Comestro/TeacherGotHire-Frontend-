import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Modal,
  Button,
  TextField,
  Grid,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";

const TeacherTestScorePage = ({ teacherData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [open, setOpen] = useState(false);

  const testScores = [
    {
      testName: "Math Test",
      level: "Intermediate",
      score: 85,
      dateTaken: "2023-01-15",
      remarks: "Good performance",
    },
    {
      testName: "Science Test",
      level: "Advanced",
      score: 90,
      dateTaken: "2023-02-20",
      remarks: "Excellent understanding",
    },
    {
      testName: "English Test",
      level: "Beginner",
      score: 78,
      dateTaken: "2023-03-10",
      remarks: "Needs improvement in grammar",
    },
  ];

  const handleOpen = (test) => {
    setSelectedTest(test);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const filteredScores = testScores.filter((test) =>
    test.testName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box mt={3}>
      {/* <Card style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid
              item
              xs={12}
              sm={4}
              container
              justifyContent="center"
              alignItems="center"
            >
              <Avatar
                alt={teacherData.name}
                src={teacherData.profilePic}
                sx={{ width: "40%", height: "130px" }}
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
            </Grid>
          </Grid>
        </CardContent>
      </Card> */}

      <Box mt={3}>
        <Card style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" gutterBottom>
                Test Scores
              </Typography>
              <Box display="flex" alignItems="center">
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search by test name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton>
                        <SearchIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Test Name</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Date Taken</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredScores.map((test, index) => (
                    <TableRow key={index}>
                      <TableCell>{test.testName}</TableCell>
                      <TableCell>{test.level}</TableCell>
                      <TableCell>{test.score}</TableCell>
                      <TableCell>{test.dateTaken}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpen(test)}>
                          <InfoIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {selectedTest && (
        <Modal open={open} onClose={handleClose}>
          <Box
            p={4}
            bgcolor="background.paper"
            sx={{
              width: "90%",
              maxWidth: "500px",
              margin: "auto",
              marginTop: "10%",
              boxShadow: 3,
              borderRadius: 2,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Test Details
            </Typography>
            <Typography variant="body1">
              <strong>Test Name:</strong> {selectedTest.testName}
            </Typography>
            <Typography variant="body1">
              <strong>Level:</strong> {selectedTest.level}
            </Typography>
            <Typography variant="body1">
              <strong>Score:</strong> {selectedTest.score}
            </Typography>
            <Typography variant="body1">
              <strong>Date Taken:</strong> {selectedTest.dateTaken}
            </Typography>
            <Typography variant="body1">
              <strong>Remarks:</strong> {selectedTest.remarks}
            </Typography>
            <Box mt={2} display="flex" justifyContent="space-between">
              <Button
                variant="contained"
                color="secondary"
                onClick={handleClose}
              >
                Close
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default TeacherTestScorePage;
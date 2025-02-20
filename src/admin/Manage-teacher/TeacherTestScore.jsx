import React, { useState, useEffect } from "react";
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
import { getTeacherScorecard } from "../../services/adminTeacherApi";

const TeacherTestScorePage = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [open, setOpen] = useState(false);
  const [testScores, setTestScores] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const fetchTestScores = async () => {
      try {
        const response = await getTeacherScorecard(userId);
        const scores = response.map((test) => ({
          testName: test.exam.name,
          level: "N/A", // Assuming level is not provided in the response
          score: ((test.correct_answer / test.total_question) * 100).toFixed(2),
          dateTaken: "N/A", // Assuming dateTaken is not provided in the response
          remarks: "N/A", // Assuming remarks is not provided in the response
          ...test,
        }));
        setTestScores(scores);
      } catch (error) {
        console.error("Error fetching test scores:", error);
        setTestScores([]);
      }
    };

    fetchTestScores();
  }, [userId]);

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
                      <TableCell>{test.score}%</TableCell>
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
              <strong>Score:</strong> {selectedTest.score}%
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
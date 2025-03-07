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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";
import { getTeacherScorecard } from "../../services/adminTeacherApi";

const TeacherTestScorePage = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [open, setOpen] = useState(false);
  const [testScores, setTestScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchTestScores = async () => {
      try {
        const response = await getTeacherScorecard(userId);
        if (response && Array.isArray(response) && response.length > 0) {
          const scores = response.map((test) => ({
            testName: test.exam?.name || 'N/A',
            level: test.exam?.level || 'N/A',
            score: test.total_question > 0 ?
              ((test.correct_answer / test.total_question) * 100).toFixed(2) :
              'N/A',
            dateTaken: test.created_at ?
              new Date(test.created_at).toLocaleDateString() :
              'N/A',
            remarks: test.remarks || 'N/A',
            ...test,
          }));
          setTestScores(scores);
        } else {
          console.error('Unexpected response structure:', response);
          setTestScores([]);
        }
      } catch (error) {
        console.error("Error fetching test scores:", error);
        setTestScores([]);
      } finally {
        setLoading(false);
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
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={2}
            mb={2}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "primary.main",
                borderBottom: { xs: 'none', sm: '1px solid #f0f0f0' },
                pb: 1
              }}
            >
              Test Scores
            </Typography>
            <Box display="flex" alignItems="center" width={{ xs: '100%', sm: 'auto' }}>
              <TextField
                variant="outlined"
                size="small"
                fullWidth
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

          {loading ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              Loading test scores...
            </Typography>
          ) : testScores.length > 0 ? (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: { xs: '100%', sm: 650 } }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Test Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Level</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date Taken</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredScores.map((test, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}
                    >
                      <TableCell>{test.testName}</TableCell>
                      <TableCell>{test.level}</TableCell>
                      <TableCell>{test.score}%</TableCell>
                      <TableCell>{test.dateTaken}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleOpen(test)}
                          size="small"
                          sx={{ color: 'primary.main' }}
                        >
                          <InfoIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', p: 2 }}>
              No test scores available for this teacher.
            </Typography>
          )}
        </CardContent>
      </Card>

      {selectedTest && (
        <Modal open={open} onClose={handleClose}>
          <Box
            p={4}
            bgcolor="background.paper"
            sx={{
              width: "90%",
              maxWidth: "500px",
              margin: "auto",
              marginTop: { xs: "20%", sm: "10%" },
              boxShadow: 3,
              borderRadius: 2,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
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
              Test Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Test Name:</strong> {selectedTest.testName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Level:</strong> {selectedTest.level}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Score:</strong> {selectedTest.score}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Date Taken:</strong> {selectedTest.dateTaken}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Total Questions:</strong> {selectedTest.total_question || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Correct Answers:</strong> {selectedTest.correct_answer || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Remarks:</strong> {selectedTest.remarks}
                </Typography>
              </Grid>
            </Grid>

            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={handleClose}
                sx={{
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }
                }}
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
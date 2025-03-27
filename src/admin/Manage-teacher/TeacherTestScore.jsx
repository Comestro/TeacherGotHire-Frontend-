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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Alert,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import { getTeacherScorecard } from "../../services/adminTeacherApi";

const TeacherTestScorePage = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [open, setOpen] = useState(false);
  const [testScores, setTestScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [subjects, setSubjects] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [invalidDataPresent, setInvalidDataPresent] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchTestScores = async () => {
      try {
        const response = await getTeacherScorecard(userId);
        console.log('Raw API output:', response);
        
        // Check for invalid data
        const hasInvalidData = response?.some(test => test.exam === null);
        setInvalidDataPresent(hasInvalidData);
        
        if (response && Array.isArray(response) && response.length > 0) {
          // Filter out null exams
          const validTests = response.filter(test => test.exam !== null);
          
          // Process both exam and interview data
          let allRecords = [];
          
          // Process exam results
          const examRecords = validTests.map((test) => ({
            recordType: "Exam",
            testName: test.exam?.name || 'N/A',
            level: test.exam?.level_name || 'N/A',
            levelId: test.exam?.level_id || 0,
            subject: test.exam?.subject_name || 'N/A',
            classCategory: test.exam?.class_category_name || 'N/A',
            score: test.total_question > 0 ?
              ((test.correct_answer / test.total_question) * 100).toFixed(2) :
              '0.00',
            dateTaken: test.created_at ?
              new Date(test.created_at).toLocaleDateString() :
              'N/A',
            language: test.language || 'N/A',
            remarks: test.remarks || 'N/A',
            status: test.isqualified ? "Passed" : "Failed",
            ...test,
          }));
          
          allRecords = [...examRecords];
          
          // Process interview data
          validTests.forEach(test => {
            if (test.interviews && test.interviews.length > 0) {
              test.interviews.forEach(interview => {
                allRecords.push({
                  recordType: "Interview",
                  testName: `${interview.class_category}, ${interview.subject}, Interview`,
                  level: "Interview",
                  levelId: 4, // Use 4 for interviews as per reference code
                  subject: interview.subject,
                  classCategory: interview.class_category,
                  score: interview.grade ? interview.grade : 'N/A',
                  dateTaken: interview.time ?
                    new Date(interview.time).toLocaleDateString() :
                    'N/A',
                  interviewDate: interview.created_at ?
                    new Date(interview.created_at).toLocaleDateString() :
                    'N/A',
                  language: 'N/A',
                  remarks: interview.status || 'N/A',
                  status: interview.status === "fulfilled" ? "Completed" : "Pending",
                  interviewGrade: interview.grade,
                  interview: interview,
                });
              });
            }
          });
          
          setTestScores(allRecords);
          
          // Extract unique categories
          const uniqueCategories = ["All", ...new Set(allRecords.map(record => record.classCategory))];
          setCategories(uniqueCategories);
          
          // Extract subjects
          const uniqueSubjects = [...new Set(allRecords.map(record => record.subject))];
          setSubjects(uniqueSubjects);
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

  useEffect(() => {
    // Filter test scores based on selected category and search term
    const filtered = testScores.filter((test) => {
      const categoryMatch = selectedCategory === "All" || test.classCategory === selectedCategory;
      const searchMatch = test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          test.subject.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
    
    setFilteredScores(filtered);
  }, [selectedCategory, searchTerm, testScores]);

  const handleOpen = (test) => {
    setSelectedTest(test);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  
  // Function to get the numerical order for level sorting
  const getLevelOrder = (levelName) => {
    if (levelName.includes("1st")) return 1;
    if (levelName.includes("Online")) return 2;
    if (levelName.includes("Offline")) return 3;
    return 4; // Default for other levels
  };

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
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <MenuBookOutlinedIcon />
              Test Scores
            </Typography>
            
            <Box 
              display="flex" 
              alignItems="center" 
              gap={2}
              width={{ xs: '100%', sm: 'auto' }}
              flexDirection={{ xs: 'column', sm: 'row' }}
            >
              <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Class Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Class Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category === "All" ? "All Categories" : category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search by test name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
          
          {invalidDataPresent && (
            <Alert 
              severity="warning" 
              sx={{ mb: 2, borderRadius: 1 }}
            >
              Some test results are invalid or incomplete and have been filtered out.
            </Alert>
          )}
          
          {loading ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              Loading test scores...
            </Typography>
          ) : testScores.length > 0 ? (
            <Box>
              {selectedCategory && (
                <Box 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 1, 
                    p: 1.5, 
                    bgcolor: "grey.50", 
                    borderRadius: 1,
                    mb: 2,
                    border: "1px solid",
                    borderColor: "grey.200"
                  }}
                >
                  <FolderOutlinedIcon color="action" />
                  <Typography variant="body1" color="text.secondary">
                    Showing results for: {selectedCategory === "All" ? "All Categories" : selectedCategory}
                  </Typography>
                </Box>
              )}
              
              {subjects.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  No test results found for the selected filters.
                </Typography>
              ) : (
                subjects.map((subject) => {
                  // Get tests for this subject
                  const subjectTests = filteredScores.filter(
                    (test) => test.subject === subject
                  );
                  
                  // Skip if no tests for this subject after filtering
                  if (subjectTests.length === 0) return null;
                  
                  // Sort by level order and date
                  const sortedTests = [...subjectTests].sort((a, b) => {
                    if (getLevelOrder(a.level) !== getLevelOrder(b.level)) {
                      return getLevelOrder(a.level) - getLevelOrder(b.level);
                    }
                    return new Date(b.dateTaken) - new Date(a.dateTaken);
                  });
                  
                  return (
                    <Box key={subject} mb={4}>
                      <Card
                        variant="outlined"
                        sx={{
                          overflow: "hidden",
                          borderRadius: 1,
                        }}
                      >
                        <Box 
                          sx={{ 
                            p: 2, 
                            bgcolor: "grey.50", 
                            borderBottom: "1px solid",
                            borderColor: "grey.200"
                          }}
                        >
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 600, 
                              color: "text.primary",
                              display: "flex",
                              alignItems: "center",
                              gap: 1
                            }}
                          >
                            <MenuBookOutlinedIcon color="primary" fontSize="small" />
                            {subject}
                          </Typography>
                        </Box>
                        
                        <TableContainer>
                          <Table sx={{ minWidth: { xs: '100%', sm: 650 } }}>
                            <TableHead>
                              <TableRow sx={{ bgcolor: "#E5F1F9" }}>
                                <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>Record Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>Test Name</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>Class Category</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>Level</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>Language</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>Score</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>Details</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sortedTests.map((test, index) => (
                                <TableRow
                                  key={index}
                                  sx={{ 
                                    '&:nth-of-type(even)': { backgroundColor: '#fafafa' },
                                    bgcolor: test.recordType === "Interview" ? 'rgba(229, 241, 249, 0.3)' : 'inherit'
                                  }}
                                >
                                  <TableCell sx={{ fontWeight: 500 }}>{test.recordType}</TableCell>
                                  <TableCell>{test.testName}</TableCell>
                                  <TableCell>{test.classCategory}</TableCell>
                                  <TableCell>{test.level}</TableCell>
                                  <TableCell>{test.language}</TableCell>
                                  <TableCell sx={{ 
                                    color: test.recordType === "Interview"
                                      ? test.status === "Completed" ? "success.main" : "warning.main"
                                      : test.status === "Passed" ? "success.main" : "error.main",
                                    fontWeight: 500
                                  }}>
                                    {test.status}
                                  </TableCell>
                                  <TableCell>
                                    {test.recordType === "Interview" 
                                      ? test.score !== 'N/A' ? `${test.score}/100` : 'N/A'
                                      : `${test.score}%`
                                    }
                                  </TableCell>
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
                      </Card>
                    </Box>
                  );
                })
              )}
            </Box>
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
                pb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              {selectedTest.recordType === "Interview" ? "Interview Details" : "Test Details"}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Record Type:</strong> {selectedTest.recordType}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>{selectedTest.recordType === "Interview" ? "Interview Name" : "Test Name"}:</strong> {selectedTest.testName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Class Category:</strong> {selectedTest.classCategory}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Subject:</strong> {selectedTest.subject}
                </Typography>
              </Grid>
              
              {selectedTest.recordType === "Interview" ? (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Interview Date:</strong> {selectedTest.dateTaken}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Grade:</strong> {selectedTest.interviewGrade ? `${selectedTest.interviewGrade}/100` : 'Not graded yet'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Status:</strong> <span style={{ 
                        color: selectedTest.status === "Completed" ? "#4caf50" : "#ff9800",
                        fontWeight: 500
                      }}>{selectedTest.status}</span>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Created On:</strong> {selectedTest.interviewDate || 'N/A'}
                    </Typography>
                  </Grid>
                </>
              ) : (
                <>
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
                      <strong>Language:</strong> {selectedTest.language || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Status:</strong> <span style={{ 
                        color: selectedTest.status === "Passed" ? "#4caf50" : "#f44336",
                        fontWeight: 500
                      }}>{selectedTest.status}</span>
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
                      <strong>Remarks:</strong> {selectedTest.remarks || "N/A"}
                    </Typography>
                  </Grid>
                </>
              )}
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
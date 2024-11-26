import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Box,
  Snackbar,
  TablePagination,
  Paper,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Layout from "../Admin/Layout";

const ManageQuestion = () => {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: "What is the capital of India?",
      category: "Geography",
      type: "Multiple Choice",
      difficulty: "Easy",
      dateAdded: "2023-01-01",
    },
    {
      id: 2,
      text: "Solve the equation: 2x + 3 = 7",
      category: "Math",
      type: "Descriptive",
      difficulty: "Medium",
      dateAdded: "2023-01-02",
    },
    {
      id: 3,
      text: "The Earth is flat. True or False?",
      category: "Science",
      type: "True/False",
      difficulty: "Easy",
      dateAdded: "2023-01-03",
    },
    {
      id: 4,
      text: "Explain the theory of relativity.",
      category: "Physics",
      type: "Descriptive",
      difficulty: "Hard",
      dateAdded: "2023-01-04",
    },
    {
      id: 5,
      text: "What is the chemical symbol for water?",
      category: "Chemistry",
      type: "Multiple Choice",
      difficulty: "Easy",
      dateAdded: "2023-01-05",
    },
    {
      id: 6,
      text: "Who wrote 'Hamlet'?",
      category: "Literature",
      type: "Multiple Choice",
      difficulty: "Medium",
      dateAdded: "2023-01-06",
    },
    {
      id: 7,
      text: "What is the speed of light?",
      category: "Physics",
      type: "Descriptive",
      difficulty: "Hard",
      dateAdded: "2023-01-07",
    },
    {
      id: 8,
      text: "What is the largest planet in our solar system?",
      category: "Astronomy",
      type: "Multiple Choice",
      difficulty: "Easy",
      dateAdded: "2023-01-08",
    },
    {
      id: 9,
      text: "Describe the process of photosynthesis.",
      category: "Biology",
      type: "Descriptive",
      difficulty: "Medium",
      dateAdded: "2023-01-09",
    },
    {
      id: 10,
      text: "What is the square root of 144?",
      category: "Math",
      type: "Multiple Choice",
      difficulty: "Easy",
      dateAdded: "2023-01-10",
    },
    {
      id: 11,
      text: "The sun rises in the west. True or False?",
      category: "Geography",
      type: "True/False",
      difficulty: "Easy",
      dateAdded: "2023-01-11",
    },
    {
      id: 12,
      text: "What is the formula for calculating the area of a circle?",
      category: "Math",
      type: "Descriptive",
      difficulty: "Medium",
      dateAdded: "2023-01-12",
    },
  ]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleAddQuestion = () => {
    setCurrentQuestion(null);
    setIsEditModalOpen(true);
  };

  const handleEditQuestion = (question) => {
    setCurrentQuestion(question);
    setIsEditModalOpen(true);
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter((question) => question.id !== questionId));
    setNotification({
      open: true,
      message: "Question deleted successfully.",
      type: "success",
    });
  };

  const handleBulkDelete = () => {
    setQuestions(
      questions.filter((question) => !selectedQuestions.includes(question.id))
    );
    setSelectedQuestions([]);
    setNotification({
      open: true,
      message: "Selected questions deleted successfully.",
      type: "success",
    });
  };

  const handleSaveQuestion = () => {
    // Add save logic here
    setIsEditModalOpen(false);
    setNotification({
      open: true,
      message: "Question saved successfully.",
      type: "success",
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredQuestions = questions.filter((question) => {
    return (
      (question.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.id.toString().includes(searchQuery)) &&
      (selectedType
        ? question.type.toLowerCase() === selectedType.toLowerCase()
        : true) &&
      (selectedCategory
        ? question.category.toLowerCase() === selectedCategory.toLowerCase()
        : true) &&
      (selectedDifficulty
        ? question.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
        : true)
    );
  });

  return (
    <Layout>
      <Container>
        <Typography variant="h4" gutterBottom>
          Manage Questions
        </Typography>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddQuestion}
          >
            Add Question
          </Button>
        </Box>
        <Box mt={2} mb={2}>
          <TextField
            label="Search Questions"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Question Type</InputLabel>
            <Select
              label="Question Type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="multiple choice">Multiple Choice</MenuItem>
              <MenuItem value="true/false">True/False</MenuItem>
              <MenuItem value="descriptive">Descriptive</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Category/Topic</InputLabel>
            <Select
              label="Category/Topic"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="math">Math</MenuItem>
              <MenuItem value="science">Science</MenuItem>
              <MenuItem value="english">English</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Difficulty Level</InputLabel>
            <Select
              label="Difficulty Level"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              <TableCell>Question Text</TableCell>
              <TableCell>Category/Topic</TableCell>
              <TableCell>Question Type</TableCell>
              <TableCell>Difficulty Level</TableCell>
              <TableCell>Date Added</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQuestions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((question) => (
                <TableRow key={question.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedQuestions.includes(question.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedQuestions([
                            ...selectedQuestions,
                            question.id,
                          ]);
                        } else {
                          setSelectedQuestions(
                            selectedQuestions.filter((id) => id !== question.id)
                          );
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{question.text}</TableCell>
                  <TableCell>{question.category}</TableCell>
                  <TableCell>{question.type}</TableCell>
                  <TableCell>{question.difficulty}</TableCell>
                  <TableCell>{question.dateAdded}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditQuestion(question)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredQuestions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleBulkDelete}
        >
          Delete Selected
        </Button>
        <Dialog
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <DialogTitle>
            {currentQuestion ? "Edit Question" : "Add Question"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Question Text"
              variant="outlined"
              fullWidth
              margin="normal"
              defaultValue={currentQuestion ? currentQuestion.text : ""}
            />
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Category/Topic</InputLabel>
              <Select
                label="Category/Topic"
                defaultValue={currentQuestion ? currentQuestion.category : ""}
              >
                <MenuItem value="math">Math</MenuItem>
                <MenuItem value="science">Science</MenuItem>
                <MenuItem value="english">English</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Question Type</InputLabel>
              <Select
                label="Question Type"
                defaultValue={currentQuestion ? currentQuestion.type : ""}
              >
                <MenuItem value="multiple choice">Multiple Choice</MenuItem>
                <MenuItem value="true/false">True/False</MenuItem>
                <MenuItem value="descriptive">Descriptive</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Difficulty Level</InputLabel>
              <Select
                label="Difficulty Level"
                defaultValue={currentQuestion ? currentQuestion.difficulty : ""}
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditModalOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          message={notification.message}
          severity={notification.type}
        />
      </Container>
    </Layout>
  );
};

export default ManageQuestion;

import React, { useState, useEffect } from "react";
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
import {
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  deleteAllQuestions,
} from "../../services/adminManageQuestion";

const ManageQuestion = () => {
  const [questions, setQuestions] = useState([]);
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

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestions();
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  const handleAddQuestion = () => {
    setCurrentQuestion({
      id: null,
      text: "",
      subject: { id: "", subject_name: "" },
      level: { name: "", description: "" },
      classCategory: { id: "", name: "" },
      options: [],
      time: "",
      language: "",
      solution: "",
      correct_option: "",
      created_at: new Date().toISOString(),
    });
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
    if (currentQuestion.id) {
      setQuestions(
        questions.map((question) =>
          question.id === currentQuestion.id ? currentQuestion : question
        )
      );
    } else {
      setQuestions([...questions, { ...currentQuestion, id: questions.length + 1 }]);
    }
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
              <TableCell>Class Category</TableCell>
              <TableCell>Subject</TableCell>
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
                  <TableCell>{question.classCategory.name}</TableCell>
                  <TableCell>{question.subject.subject_name}</TableCell>
                  <TableCell>{question.level.name}</TableCell>
                  <TableCell>{question.created_at}</TableCell>
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
            {currentQuestion && currentQuestion.id ? "Edit Question" : "Add Question"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Question Text"
              variant="outlined"
              fullWidth
              margin="normal"
              value={currentQuestion ? currentQuestion.text : ""}
              onChange={(e) =>
                setCurrentQuestion({ ...currentQuestion, text: e.target.value })
              }
            />
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Category/Topic</InputLabel>
              <Select
                label="Category/Topic"
                value={currentQuestion ? currentQuestion.classCategory.id : ""}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    classCategory: { ...currentQuestion.classCategory, id: e.target.value },
                  })
                }
              >
                <MenuItem value="1">10 to 12</MenuItem>
                <MenuItem value="2">9 to 10</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Subject</InputLabel>
              <Select
                label="Subject"
                value={currentQuestion ? currentQuestion.subject.id : ""}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    subject: { ...currentQuestion.subject, id: e.target.value },
                  })
                }
              >
                <MenuItem value="1">Economics</MenuItem>
                <MenuItem value="2">Computer Science</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Difficulty Level</InputLabel>
              <Select
                label="Difficulty Level"
                value={currentQuestion ? currentQuestion.level.name : ""}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    level: { ...currentQuestion.level, name: e.target.value },
                  })
                }
              >
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Expert">Expert</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Options (comma separated)"
              variant="outlined"
              fullWidth
              margin="normal"
              value={currentQuestion ? currentQuestion.options.join(", ") : ""}
              onChange={(e) =>
                setCurrentQuestion({
                  ...currentQuestion,
                  options: e.target.value.split(","),
                })
              }
            />
            <TextField
              label="Correct Option Index"
              variant="outlined"
              fullWidth
              margin="normal"
              value={currentQuestion ? currentQuestion.correct_option : ""}
              onChange={(e) =>
                setCurrentQuestion({
                  ...currentQuestion,
                  correct_option: e.target.value,
                })
              }
            />
            <TextField
              label="Time (in minutes)"
              variant="outlined"
              fullWidth
              margin="normal"
              value={currentQuestion ? currentQuestion.time : ""}
              onChange={(e) =>
                setCurrentQuestion({
                  ...currentQuestion,
                  time: e.target.value,
                })
              }
            />
            <TextField
              label="Language"
              variant="outlined"
              fullWidth
              margin="normal"
              value={currentQuestion ? currentQuestion.language : ""}
              onChange={(e) =>
                setCurrentQuestion({
                  ...currentQuestion,
                  language: e.target.value,
                })
              }
            />
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
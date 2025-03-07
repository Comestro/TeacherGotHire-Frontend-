import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";

import {
  getExamById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../services/adminManageExam";

const QuestionCard = ({ question, index, onEdit, onDelete }) => {
  if (!question) return null;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Question {index + 1}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {question.text}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Options:</strong>
        </Typography>
        {question.options.map((option, i) => (
          <Typography
            key={i}
            variant="body2"
            color={
              i + 1 === question.correct_option
                ? "success.main"
                : "text.secondary"
            }
          >
            {i + 1}. {option}
          </Typography>
        ))}
        <Typography variant="body2" mt={1} color="text.primary">
          <strong>Solution:</strong> {question.solution}
        </Typography>
        <Typography variant="body2" mt={1} color="text.primary">
          <strong>Language:</strong> {question.language}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <IconButton onClick={() => onEdit(question)}>
            <Edit />
          </IconButton>
          <IconButton onClick={() => onDelete(question.id)}>
            <Delete />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

const ViewQuestionModal = ({ open, onClose, selectedExam }) => {
  const [questions, setQuestions] = useState([]);
  const [openAddQuestionModal, setOpenAddQuestionModal] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correct_option: 1,
    solution: "",
    time: 2.5,
    language: "English"
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (selectedExam?.id) {
      const fetchQuestions = async () => {
        const response = await getExamById(selectedExam.id);
        // Transform the options format for each question
        const transformedQuestions = response?.questions?.map(q => ({
          ...q,
          options: q.options.map(opt => typeof opt === 'object' ? opt.option : opt),
          language: q.language || "English"
        })) || [];
        setQuestions(transformedQuestions);
      };
      fetchQuestions();
    }
  }, [selectedExam]);

  const handleAddQuestion = () => {
    setOpenAddQuestionModal(true);
    setEditQuestion(null);
    setNewQuestion({
      text: "",
      options: ["", "", "", ""],
      correct_option: 1,
      solution: "",
      time: 2.5,
      language: "English"
    });
  };

  const handleSaveQuestion = async () => {
    if (editQuestion) {
      await updateQuestion(editQuestion.id, newQuestion);
      setSnackbarMessage("Question updated successfully!");
    } else {
      await createQuestion({
        ...newQuestion,
        exam: selectedExam.id,
      });
      setSnackbarMessage("Question added successfully!");
    }

    setOpenAddQuestionModal(false);
    setSnackbarOpen(true);

    // Fetch latest questions from backend to ensure new question is reflected immediately
    const response = await getExamById(selectedExam.id);
    // Transform the options format for each question
    const transformedQuestions = response?.questions?.map(q => ({
      ...q,
      options: q.options.map(opt => typeof opt === 'object' ? opt.option : opt),
      language: q.language || "English"
    })) || [];
    setQuestions(transformedQuestions);
  };

  const handleEditQuestion = (question) => {
    // Transform options if they are in object format
    const transformedQuestion = {
      ...question,
      options: question.options.map(opt => typeof opt === 'object' ? opt.option : opt)
    };
    setEditQuestion(transformedQuestion);
    setNewQuestion(transformedQuestion);
    setOpenAddQuestionModal(true);
  };

  const handleDeleteQuestion = async (id) => {
    await deleteQuestion(id);
    setQuestions(questions.filter((q) => q.id !== id));
    setSnackbarMessage("Question deleted successfully!");
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Exam Details - {selectedExam?.name}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Basic Info Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Typography variant="body1">
                  <strong>Subject:</strong>{" "}
                  {selectedExam?.subject?.subject_name}
                </Typography>
                <Typography variant="body1">
                  <strong>Level:</strong> {selectedExam?.level?.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Class Category:</strong>{" "}
                  {selectedExam?.class_category?.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Total Marks:</strong> {selectedExam?.total_marks}
                </Typography>
                <Typography variant="body1">
                  <strong>Duration:</strong> {selectedExam?.duration} minutes
                </Typography>
                <Typography variant="body1">
                  <strong>Type:</strong> {selectedExam?.type || "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Questions Section */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">Questions</Typography>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Filter Language</InputLabel>
                  <Select
                    value={selectedLanguage}
                    label="Filter Language"
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Hindi">Hindi</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddQuestion}
              >
                Add Question
              </Button>
            </Box>
            {questions
              ?.filter(q => q.language === selectedLanguage)
              ?.map((question, index) => (
                <QuestionCard
                  key={question?.id || `question-${index}`}
                  question={question}
                  index={index}
                  onEdit={handleEditQuestion}
                  onDelete={handleDeleteQuestion}
                />
              ))
            }
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      {/* Add/Edit Question Modal */}
      <Dialog
        open={openAddQuestionModal}
        onClose={() => setOpenAddQuestionModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editQuestion ? "Edit Question" : "Add New Question"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={newQuestion.language}
                label="Language"
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    language: e.target.value,
                  })
                }
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Hindi">Hindi</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Question Text"
              fullWidth
              value={newQuestion.text}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, text: e.target.value })
              }
            />
            {newQuestion.options.map((option, index) => (
              <TextField
                key={index}
                label={`Option ${index + 1}`}
                fullWidth
                value={option}
                onChange={(e) => {
                  const newOptions = [...newQuestion.options];
                  newOptions[index] = e.target.value;
                  setNewQuestion({ ...newQuestion, options: newOptions });
                }}
              />
            ))}
            <TextField
              label="Correct Option (1-4)"
              type="number"
              fullWidth
              value={newQuestion.correct_option}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  correct_option: parseInt(e.target.value),
                })
              }
              inputProps={{ min: 1, max: 4 }}
            />
            <TextField
              label="Solution"
              fullWidth
              value={newQuestion.solution}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, solution: e.target.value })
              }
            />
            <TextField
              label="Time (minutes)"
              type="number"
              fullWidth
              value={newQuestion.time}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  time: parseFloat(e.target.value),
                })
              }
              inputProps={{ step: 0.5 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddQuestionModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveQuestion}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for success messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ViewQuestionModal;
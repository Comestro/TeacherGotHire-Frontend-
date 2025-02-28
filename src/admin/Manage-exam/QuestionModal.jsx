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

  const normalizedOptions = question.options.map((option) => {
    if (typeof option === "string") {
      return { option, image: null };
    }
    return option; // Keep object options as is
  });

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
        {normalizedOptions.map((option, i) => (
          <Typography
            key={i}
            variant="body2"
            color={
              i + 1 === question.correct_option
                ? "success.main"
                : "text.secondary"
            }
          >
            {i + 1}. {option.option}
            {option.image && (
              <img
                src={option.image}
                alt={`Option ${i + 1}`}
                style={{ maxWidth: "100px", marginLeft: "10px" }}
              />
            )}
          </Typography>
        ))}
        <Typography variant="body2" mt={1} color="text.primary">
          <strong>Solution:</strong> {question.solution}
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
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: [{ option: "", image: null }, { option: "", image: null }, { option: "", image: null }, { option: "", image: null }],
    correct_option: 1,
    solution: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (selectedExam?.id) {
      const fetchQuestions = async () => {
        const response = await getExamById(selectedExam.id);
        // Ensure response structure matches expectations
        setQuestions(response?.questions || []);
      };
      fetchQuestions();
    }
  }, [selectedExam]);

  const handleAddQuestion = () => {
    setOpenAddQuestionModal(true);
    setEditQuestion(null);
    setNewQuestion({
      text: "",
      options: [{ option: "", image: null }, { option: "", image: null }, { option: "", image: null }, { option: "", image: null }],
      correct_option: 1,
      solution: "",
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
    setQuestions(response?.questions || []);
  };


  const handleEditQuestion = (question) => {
    setEditQuestion(question);
    setNewQuestion(question);
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
              <Typography variant="h6">Questions</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddQuestion}
              >
                Add Question
              </Button>
            </Box>
            {questions?.map((question, index) => (
              <QuestionCard
                key={question?.id || `question-${index}`} // Fallback key
                question={question}
                index={index}
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
              />
            ))}
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
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Question Text"
            value={newQuestion.text || ""}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, text: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          {newQuestion.options.map((option, i) => (
            <TextField
              key={i}
              fullWidth
              label={`Option ${i + 1}`}
              value={option.option || ""}
              onChange={(e) => {
                const newOptions = [...newQuestion.options];
                newOptions[i] = { ...newOptions[i], option: e.target.value };
                setNewQuestion({ ...newQuestion, options: newOptions });
              }}
              sx={{ mb: 2 }}
            />
          ))}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Correct Option</InputLabel>
            <Select
              value={newQuestion.correct_option}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  correct_option: e.target.value,
                })
              }
            >
              {newQuestion.options.map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  Option {i + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Solution"
            value={newQuestion.solution || ""}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, solution: e.target.value })
            }
          />
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
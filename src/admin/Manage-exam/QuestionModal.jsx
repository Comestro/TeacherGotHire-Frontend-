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
  useMediaQuery,
  useTheme
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
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Form validation error state; you can extend this as needed.
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (selectedExam?.id) {
      const fetchQuestions = async () => {
        try {
          const response = await getExamById(selectedExam.id);
          const transformedQuestions = response?.questions?.map(q => ({
            ...q,
            options: q.options.map(opt => typeof opt === 'object' ? opt.option : opt),
            language: q.language || "English"
          })) || [];
          setQuestions(transformedQuestions);
        } catch (error) {
          setSnackbarMessage(error.response?.data?.message || "Failed to fetch questions.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      };
      fetchQuestions();
    }
  }, [selectedExam]);

  const validateForm = () => {
    let errors = {};
    if (!newQuestion.text.trim()) {
      errors.text = "Question text is required.";
    }
    newQuestion.options.forEach((opt, index) => {
      if (!opt.trim()) {
        errors[`option_${index}`] = `Option ${index + 1} is required.`;
      }
    });
    // Check if correct_option is provided and is between 1 and 4.
    if (newQuestion.correct_option === "" || isNaN(newQuestion.correct_option)) {
      errors.correct_option = "Correct Option is required.";
    } else if (newQuestion.correct_option < 1 || newQuestion.correct_option > 4) {
      errors.correct_option = "Correct Option must be between 1 and 4.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddQuestion = () => {
    setOpenAddQuestionModal(true);
    setEditQuestion(null);
    setFormErrors({});
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
    if (!validateForm()) return;

    try {
      if (editQuestion) {
        await updateQuestion(editQuestion.id, newQuestion);
        setSnackbarMessage("Question updated successfully!");
      } else {
        await createQuestion({ ...newQuestion, exam: selectedExam.id });
        setSnackbarMessage("Question added successfully!");
      }
      setSnackbarSeverity("success");
      setOpenAddQuestionModal(false);
      setFormErrors({}); // clear any existing errors
    } catch (error) {
      // If we receive field-specific errors, show them inline
      if (error.response?.data && typeof error.response.data === 'object') {
        const errors = {};
        for (const key in error.response.data) {
          if (Array.isArray(error.response.data[key])) {
            errors[key] = error.response.data[key][0]; // use the first error message
          } else {
            errors[key] = error.response.data[key];
          }
        }
        setFormErrors(errors);
      } else {
        // Generic error handling via Snackbar
        const errorMsg = error.response?.data || "Action failed.";
        setSnackbarMessage(errorMsg);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
      return; // so that the questions don't get refreshed if save failed
    }

    try {
      const response = await getExamById(selectedExam.id);
      const transformedQuestions = response?.questions?.map(q => ({
        ...q,
        options: q.options.map(opt => typeof opt === 'object' ? opt.option : opt),
        language: q.language || "English"
      })) || [];
      setQuestions(transformedQuestions);
    } catch (fetchError) {
      const fetchErrorMsg =
        (fetchError.response?.data && typeof fetchError.response.data === 'object'
          ? Object.values(fetchError.response.data).flat().join(" ")
          : fetchError.response?.data) || "Failed to refresh questions.";
      setSnackbarMessage(fetchErrorMsg);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleEditQuestion = (question) => {
    const transformedQuestion = {
      ...question,
      options: question.options.map(opt => typeof opt === 'object' ? opt.option : opt)
    };
    setEditQuestion(transformedQuestion);
    setNewQuestion(transformedQuestion);
    setFormErrors({});
    setOpenAddQuestionModal(true);
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter((q) => q.id !== id));
      setSnackbarMessage("Question deleted successfully!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage(error.response?.data?.message || "Failed to delete question.");
      setSnackbarSeverity("error");
    }
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
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
                  <strong>Subject:</strong> {selectedExam?.subject?.subject_name}
                </Typography>
                <Typography variant="body1">
                  <strong>Level:</strong> {selectedExam?.level?.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Class Category:</strong> {selectedExam?.class_category?.name}
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
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="h6">
                  Questions ({questions.filter(q => q.language === selectedLanguage).length})
                </Typography>
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
              <Button variant="contained" startIcon={<Add />} onClick={handleAddQuestion}>
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
        fullScreen={fullScreen}
      >
        <DialogTitle>{editQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
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
              error={!!formErrors.text}
              helperText={formErrors.text}
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
                error={!!formErrors[`option_${index}`]}
                helperText={formErrors[`option_${index}`]}
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
                  correct_option: parseInt(e.target.value, 10),
                })
              }
              inputProps={{ min: 1, max: 4 }}
              error={!!formErrors.correct_option}
              helperText={formErrors.correct_option}
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
          <Button variant="contained" onClick={handleSaveQuestion}>Save</Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for messages – top right positioning */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ViewQuestionModal;
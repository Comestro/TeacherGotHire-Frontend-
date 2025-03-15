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
  useTheme,
  Divider,
  Paper,
  Stack,
  Chip
} from "@mui/material";
import { Edit, Delete, Add, School, ArrowBack, Assessment, AccessTime } from "@mui/icons-material";

import {
  getExamById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../services/adminManageExam";

const QuestionCard = ({ question, index, onEdit, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!question) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        mb: 3,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6
        }
      }}
    >
      <CardContent>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexDirection: isMobile ? 'column' : 'row',
          mb: 1
        }}>
          <Box>
            <Typography
              variant="h6"
              color="primary"
              gutterBottom
              fontWeight="medium"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Assessment fontSize="small" />
              Question {index + 1}
            </Typography>
            <Chip
              label={question.language}
              size="small"
              color={question.language === "English" ? "info" : "secondary"}
              sx={{ mb: 1 }}
            />
          </Box>
          <Box sx={{
            display: "flex",
            mt: isMobile ? 1 : 0,
            alignSelf: isMobile ? 'flex-end' : 'center'
          }}>
            <IconButton
              onClick={() => onEdit(question)}
              color="primary"
              size="small"
              sx={{ mr: 1 }}
            >
              <Edit />
            </IconButton>
            <IconButton
              onClick={() => onDelete(question.id)}
              color="error"
              size="small"
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Typography
          variant="body1"
          gutterBottom
          sx={{
            fontSize: { xs: '0.95rem', sm: '1rem' },
            fontWeight: 500
          }}
        >
          {question.text}
        </Typography>

        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Options:
          </Typography>
          <Grid container spacing={1}>
            {question.options.map((option, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1,
                    backgroundColor: i + 1 === question.correct_option ? 'success.light' : 'background.default',
                    border: i + 1 === question.correct_option ? '1px solid' : '1px solid',
                    borderColor: i + 1 === question.correct_option ? 'success.main' : 'divider'
                  }}
                >
                  <Typography
                    variant="body2"
                    color={i + 1 === question.correct_option ? "success.dark" : "text.secondary"}
                    fontWeight={i + 1 === question.correct_option ? 500 : 400}
                  >
                    {i + 1}. {option}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {question.solution && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight={500}>
              Solution:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {question.solution}
            </Typography>
          </Box>
        )}

        {question.time && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
            <AccessTime fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {question.time} minutes
            </Typography>
          </Box>
        )}
      </CardContent>
    </Paper>
  );
};

const ViewQuestionModal = ({ open, onClose, selectedExam }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Form validation error state
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

  const filteredQuestions = questions.filter(q => q.language === selectedLanguage);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: { xs: 0, sm: 2 }
        }
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'primary.light',
          color: 'primary.contrastText',
          fontWeight: 'bold'
        }}
      >
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
        )}
        <Box>
          <Typography variant={isMobile ? "subtitle1" : "h6"} component="div">
            {selectedExam?.name}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Exam Management Portal
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={3}>
          {/* Basic Info Card */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 2,
                height: '100%'
              }}
            >
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                gap: 1
              }}>
                <School color="primary" />
                <Typography variant="h6" color="primary.main" fontWeight="medium">
                  Exam Information
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subject
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedExam?.subject?.subject_name || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Level
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedExam?.level?.name || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Class Category
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedExam?.class_category?.name || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedExam?.type || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Marks
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedExam?.total_marks || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedExam?.duration || "N/A"} minutes
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Questions Section */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                mb: 3,
                gap: 2
              }}
            >
              <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: 'wrap',
                width: { xs: '100%', sm: 'auto' }
              }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assessment /> Questions ({filteredQuestions.length})
                </Typography>
                <FormControl
                  sx={{
                    minWidth: 120,
                    flex: { xs: 1, sm: 'none' }
                  }}
                  size="small"
                >
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={selectedLanguage}
                    label="Language"
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Hindi">Hindi</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleAddQuestion}
                fullWidth={isMobile}
                sx={{
                  borderRadius: 2,
                  py: isMobile ? 1 : 'inherit'
                }}
              >
                Add Question
              </Button>
            </Box>

            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question, index) => (
                <QuestionCard
                  key={question?.id || `question-${index}`}
                  question={question}
                  index={index}
                  onEdit={handleEditQuestion}
                  onDelete={handleDeleteQuestion}
                />
              ))
            ) : (
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 2,
                  borderStyle: 'dashed'
                }}
              >
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  No questions available in {selectedLanguage}.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleAddQuestion}
                >
                  Add Question
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Close
        </Button>
      </DialogActions>

      {/* Add/Edit Question Modal */}
      <Dialog
        open={openAddQuestionModal}
        onClose={() => setOpenAddQuestionModal(false)}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: { xs: 0, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: editQuestion ? 'warning.light' : 'primary.light',
          color: editQuestion ? 'warning.contrastText' : 'primary.contrastText',
          px: { xs: 2, sm: 3 },
          py: 2
        }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setOpenAddQuestionModal(false)}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
          )}
          <Typography variant="h6">
            {editQuestion ? "Edit Question" : "Add New Question"}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 }, mt: 1 }}>
          <Stack spacing={3}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
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
              multiline
              rows={3}
              size={isMobile ? "small" : "medium"}
            />

            <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }}>
              Options
            </Typography>

            <Grid container spacing={2}>
              {newQuestion.options.map((option, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <TextField
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
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size={isMobile ? "small" : "medium"}>
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
                      size={isMobile ? "small" : "medium"}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
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
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
              </Grid>
            </Box>

            <TextField
              label="Solution (Optional)"
              fullWidth
              value={newQuestion.solution}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, solution: e.target.value })
              }
              multiline
              rows={2}
              size={isMobile ? "small" : "medium"}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button
            onClick={() => setOpenAddQuestionModal(false)}
            fullWidth={isMobile}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveQuestion}
            fullWidth={isMobile}
            sx={{ borderRadius: 2 }}
          >
            {editQuestion ? "Update Question" : "Save Question"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ViewQuestionModal;
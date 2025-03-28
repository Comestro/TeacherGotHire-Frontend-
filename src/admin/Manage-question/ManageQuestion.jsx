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
  Chip,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Layout from "../Admin/Layout";
import {
  getQuestions,
  updateQuestion,
  deleteQuestion,
  createQuestion,
} from "../../services/adminManageQuestion";
import {
  getClassCategory,
  createClassCategory,
  updateClassCategory,
} from "../../services/adminClassCategoryApi";
import {
  getSubjects,
  createSubject,
  updateSubject,
} from "../../services/adminSubujectApi";
import {
  getLevel,
  createLevel,
  updateLevel,
} from "../../services/adminManageLevel";

const ManageQuestion = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classCategories, setClassCategories] = useState([]);
  const [difficultyLevels, setDifficultyLevels] = useState([]);
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
    const fetchData = async () => {
      try {
        const questionsData = await getQuestions();
        setQuestions(questionsData);

        const subjectsData = await getSubjects();
        setSubjects(subjectsData);

        const classCategoriesData = await getClassCategory();
        setClassCategories(classCategoriesData);

        const difficultyLevelsData = await getLevel();
        setDifficultyLevels(difficultyLevelsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddQuestion = () => {
    setCurrentQuestion({
      id: null,
      text: "",
      options: ["", "", "", ""],
      exam: "",
      solution: "",
      correct_option: "",
      time: 2.5,
      created_at: new Date().toISOString(),
    });
    setIsEditModalOpen(true);
  };

  const handleEditQuestion = (question) => {
    setCurrentQuestion(question);
    setIsEditModalOpen(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await deleteQuestion(questionId);
      setQuestions(questions.filter((question) => question.id !== questionId));
      setNotification({
        open: true,
        message: "Question deleted successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      setNotification({
        open: true,
        message: "Error deleting question.",
        type: "error",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedQuestions.map((id) => deleteQuestion(id)));
      setQuestions(
        questions.filter((question) => !selectedQuestions.includes(question.id))
      );
      setSelectedQuestions([]);
      setNotification({
        open: true,
        message: "Selected questions deleted successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting selected questions:", error);
      setNotification({
        open: true,
        message: "Error deleting selected questions.",
        type: "error",
      });
    }
  };

  const handleSaveQuestion = async () => {
    try {
      const questionData = {
        text: currentQuestion.text,
        options: currentQuestion.options,
        exam: currentQuestion.exam,
        solution: currentQuestion.solution,
        correct_option: currentQuestion.correct_option,
        time: currentQuestion.time,
      };

      if (currentQuestion.id) {
        await updateQuestion(currentQuestion.id, questionData);
        setQuestions(
          questions.map((question) =>
            question.id === currentQuestion.id ? { ...question, ...questionData } : question
          )
        );
      } else {
        const newQuestion = await createQuestion(questionData);
        setQuestions([...questions, newQuestion]);
      }
      setIsEditModalOpen(false);
      setNotification({
        open: true,
        message: "Question saved successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving question:", error);
      setNotification({
        open: true,
        message: "Error saving question.",
        type: "error",
      });
    }
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
      (selectedType ? question.subject.id === selectedType : true) &&
      (selectedCategory
        ? question.classCategory.id === selectedCategory
        : true) &&
      (selectedDifficulty ? question.level.id === selectedDifficulty : true)
    );
  });

  const handleAddSubject = async () => {
    const newSubject = prompt("Enter new subject name:");
    if (newSubject) {
      try {
        const createdSubject = await createSubject({ subject_name: newSubject });
        setSubjects([...subjects, createdSubject]);
        setNotification({
          open: true,
          message: "Subject added successfully.",
          type: "success",
        });
      } catch (error) {
        console.error("Error adding subject:", error);
        setNotification({
          open: true,
          message: "Error adding subject.",
          type: "error",
        });
      }
    }
  };

  const handleAddClassCategory = async () => {
    const newClassCategory = prompt("Enter new class category name:");
    if (newClassCategory) {
      try {
        const createdClassCategory = await createClassCategory({ name: newClassCategory });
        setClassCategories([...classCategories, createdClassCategory]);
        setNotification({
          open: true,
          message: "Class category added successfully.",
          type: "success",
        });
      } catch (error) {
        console.error("Error adding class category:", error);
        setNotification({
          open: true,
          message: "Error adding class category.",
          type: "error",
        });
      }
    }
  };

  const handleAddLevel = async () => {
    const newLevelName = prompt("Enter new level name:");
    const newLevelDescription = prompt("Enter new level description:");
    if (newLevelName && newLevelDescription) {
      try {
        const createdLevel = await createLevel({ name: newLevelName, description: newLevelDescription });
        setDifficultyLevels([...difficultyLevels, createdLevel]);
        setNotification({
          open: true,
          message: "Level added successfully.",
          type: "success",
        });
      } catch (error) {
        console.error("Error adding level:", error);
        setNotification({
          open: true,
          message: "Error adding level.",
          type: "error",
        });
      }
    }
  };

  return (
    <Layout>
      <Container>
        <Typography variant="h4" gutterBottom>
          Manage Questions new
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
            <InputLabel>Subject</InputLabel>
            <Select
              label="Subject"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.subject_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Class Category</InputLabel>
            <Select
              label="Class Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {classCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
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
              {difficultyLevels.map((level) => (
                <MenuItem key={level.id} value={level.id}>
                  {level.name}
                </MenuItem>
              ))}
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
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {currentQuestion?.id ? "Edit Question" : "Add New Question"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <TextField
                label="Question Text"
                fullWidth
                value={currentQuestion?.text || ""}
                onChange={(e) =>
                  setCurrentQuestion({ ...currentQuestion, text: e.target.value })
                }
              />
              {currentQuestion?.options.map((option, index) => (
                <TextField
                  key={index}
                  label={`Option ${index + 1}`}
                  fullWidth
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...currentQuestion.options];
                    newOptions[index] = e.target.value;
                    setCurrentQuestion({ ...currentQuestion, options: newOptions });
                  }}
                  sx={{ mb: 2 }}
                />
              ))}
              <TextField
                label="Exam Number"
                type="number"
                fullWidth
                value={currentQuestion?.exam || ""}
                onChange={(e) =>
                  setCurrentQuestion({ ...currentQuestion, exam: parseInt(e.target.value) })
                }
              />
              <TextField
                label="Solution"
                fullWidth
                value={currentQuestion?.solution || ""}
                onChange={(e) =>
                  setCurrentQuestion({ ...currentQuestion, solution: e.target.value })
                }
              />
              <TextField
                label="Correct Option (1-4)"
                type="number"
                fullWidth
                value={currentQuestion?.correct_option || ""}
                onChange={(e) =>
                  setCurrentQuestion({ ...currentQuestion, correct_option: parseInt(e.target.value) })
                }
                inputProps={{ min: 1, max: 4 }}
              />
              <TextField
                label="Time (minutes)"
                type="number"
                fullWidth
                value={currentQuestion?.time || 2.5}
                onChange={(e) =>
                  setCurrentQuestion({ ...currentQuestion, time: parseFloat(e.target.value) })
                }
                inputProps={{ step: 0.5 }}
              />
            </Box>
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
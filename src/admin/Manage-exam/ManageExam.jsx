import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  TablePagination,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { FaPlus, FaEye, FaPencilAlt, FaTrash } from "react-icons/fa";
import { styled } from "@mui/system";
import Layout from "../Admin/Layout";
import {
  getExam,
  // getExamById,
  deleteExam,
  deleteAllExam,
  createExam,
  updateExam,
} from "../../services/adminManageExam";
import { getSubjects } from "../../services/adminSubujectApi";
import { getClassCategory } from "../../services/adminClassCategoryApi";
import { getLevel } from "../../services/adminManageLevel";
import Loader from "../../components/Loader";
import ViewQuestionModal from "./QuestionModal";

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: "24px",
  minWidth: "500px",
  maxWidth: "90vw",
  maxHeight: "90vh",
  overflow: "auto",
}));

const ExamManagement = () => {
  const [Loader, setLoader] = useState(false);
  const [exams, setExams] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedClassCategory, setSelectedClassCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [subjects, setSubjects] = useState([]);
  const [classCategories, setClassCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    class_category: "",
    level: "",
    total_marks: "",
    duration: "",
    type: "",
  });

  // fetch all exams in ascending order
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await getExam();
        // want to sort the exams in ascending order
        response.sort((a, b) => b.id - a.id);
        setExams(response);
      } catch (error) {
        console.error("Error fetching exams:", error);
        setSnackbar({
          open: true,
          message: "Error fetching exams!",
          severity: "error",
        });
      } finally {
        setLoader(false);
      }
    };
    fetchExams();
  }, []);

  // fetch all subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await getSubjects();
        setSubjects(response);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  // fetch all class categories
  useEffect(() => {
    const fetchClassCategories = async () => {
      try {
        const response = await getClassCategory();
        setClassCategories(response);
      } catch (error) {
        console.error("Error fetching class categories:", error);
      }
    };
    fetchClassCategories();
  }, []);

  // fetch all levels
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await getLevel();
        setLevels(response);
      } catch (error) {
        console.error("Error fetching levels:", error);
      }
    };
    fetchLevels();
  }, []);

  // handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };

    // Clear type when level changes to below 2
    if (name === "level" && parseInt(value) < 2) {
      newFormData.type = "";
    }

    // Clear subject when class_category changes
    if (name === "class_category") {
      newFormData.subject = "";
    }

    setFormData(newFormData);
  };
  // handle pagination

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSave = async () => {
    try {
      // Prepare payload based on level
      const payload = { ...formData };
      if (parseInt(payload.level) < 2) {
        delete payload.type;
      }

      // Remove the name field from the payload
      delete payload.name;

      if (selectedExam) {
        await updateExam(selectedExam.id, payload);
      } else {
        await createExam(payload);
      }

      const response = await getExam();
      setExams(response);
      setOpenAddModal(false);
      setSnackbar({
        open: true,
        message: `Exam ${selectedExam ? "updated" : "created"} successfully!`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error saving exam!",
        severity: "error",
      });
    }
  };

  const handleDelete = (exam) => {
    setSelectedExam(exam);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteExam(selectedExam.id);
      const response = await getExam();
      setExams(response);
      setOpenDeleteModal(false);
      setSnackbar({
        open: true,
        message: "Exam deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error deleting exam!",
        severity: "error",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedExams.map((examId) => deleteExam(examId)));
      const response = await getExam();
      setExams(response);
      setSelectedExams([]);
      setSnackbar({
        open: true,
        message: "Selected exams deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting selected exams:", error);
      setSnackbar({
        open: true,
        message: "Error deleting selected exams!",
        severity: "error",
      });
    }
  };

  const handleView = (exam) => {
    setSelectedExam(exam);
    setOpenViewModal(true);
  };

  const handleAddNew = () => {
    setSelectedExam(null);
    setFormData({
      name: "",
      subject: "",
      class_category: "",
      level: "",
      total_marks: "",
      duration: "",
      type: "",
    });
    setOpenAddModal(true);
  };

  // handle edit
  const handleEdit = (exam) => {
    setSelectedExam(exam);
    setFormData({
      name: exam.name,
      subject: exam.subject.id,
      class_category: exam.class_category.id,
      level: exam.level.id,
      total_marks: exam.total_marks,
      duration: exam.duration,
      // Only set type if level is 2 or above
      type: exam.level.id >= 2 ? exam.type : "",
    });
    setOpenAddModal(true);
  };

  const filteredExams = exams.filter((exam) => {
    return (
      (exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.id.toString().includes(searchQuery)) &&
      (selectedSubject
        ? exam.subject.subject_name === selectedSubject
        : true) &&
      (selectedLevel ? exam.level.name === selectedLevel : true) &&
      (selectedClassCategory
        ? exam.class_category.name === selectedClassCategory
        : true) &&
      (selectedType ? exam.type === selectedType : true)
    );
  });

  if (Loader) {
    return <Loader />;
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Manage Exams
          </Typography>
          <Button
            variant="contained"
            startIcon={<FaPlus />}
            onClick={handleAddNew}
            sx={{ float: "right", mb: 2 }}
          >
            Add New Exam
          </Button>
        </Box>

        <Box mt={2} mb={2}>
          <TextField
            label="Search Exams"
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
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.subject_name}>
                  {subject.subject_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Class Category</InputLabel>
            <Select
              label="Class Category"
              value={selectedClassCategory}
              onChange={(e) => setSelectedClassCategory(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {classCategories.map((classCategory, index) => (
                <MenuItem key={index + 1} value={classCategory.name}>
                  {classCategory.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Level</InputLabel>
            <Select
              label="Level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {levels.map((level, index) => (
                <MenuItem key={index + 1} value={level.name}>
                  {level.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Type</InputLabel>
            <Select
              label="Type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="online">Online</MenuItem>
              <MenuItem value="offline">Offline</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedExams.length > 0 &&
                        selectedExams.length < exams.length
                      }
                      checked={
                        exams.length > 0 &&
                        selectedExams.length === exams.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedExams(exams.map((exam) => exam.id));
                        } else {
                          setSelectedExams([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Class Category</TableCell>
                  <TableCell>Total Marks</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExams
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((exam, index) => (
                    <TableRow key={index}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedExams.includes(exam.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedExams([...selectedExams, exam.id]);
                            } else {
                              setSelectedExams(
                                selectedExams.filter((id) => id !== exam.id)
                              );
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{exam.name.slice(0, 15)}</TableCell>
                      <TableCell>{exam.subject.subject_name}</TableCell>
                      <TableCell>{exam.level.name}</TableCell>
                      <TableCell>{exam.class_category.name}</TableCell>
                      <TableCell>{exam.total_marks}</TableCell>
                      <TableCell>{exam.duration}</TableCell>
                      <TableCell>{exam.type}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleView(exam)}
                          startIcon={<FaEye />}
                          size="small"
                        ></Button>
                        <Button
                          onClick={() => handleEdit(exam)}
                          startIcon={<FaPencilAlt />}
                          size="small"
                        ></Button>
                        <Button
                          onClick={() => handleDelete(exam)}
                          startIcon={<FaTrash />}
                          size="small"
                          color="error"
                        ></Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <Button
              variant="contained"
              color="error"
              onClick={handleBulkDelete}
              sx={{ ml: 2, mt: 2 }}
            >
              Delete Selected
            </Button>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredExams.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContent>
        </Card>

        <StyledModal open={openAddModal} onClose={() => setOpenAddModal(false)}>
          <ModalContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedExam ? "Edit Exam" : "Add New Exam"}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Class Category</InputLabel>
                  <Select
                    name="class_category"
                    value={formData.class_category}
                    onChange={handleFormChange}
                  >
                    {classCategories.map((classCategory) => (
                      <MenuItem key={classCategory.id} value={classCategory.id}>
                        {classCategory.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    name="subject"
                    value={formData.subject}
                    onChange={handleFormChange}
                  >
                    {subjects
                      .filter((subject) => subject.class_category === formData.class_category)
                      .map((subject) => (
                        <MenuItem key={subject.id} value={subject.id}>
                          {subject.subject_name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    name="level"
                    value={formData.level}
                    onChange={handleFormChange}
                  >
                    {levels.map((level) => (
                      <MenuItem key={level.id} value={level.id}>
                        {level.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {formData.level >= 2 && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleFormChange}
                    >
                      <MenuItem value="online">Online</MenuItem>
                      <MenuItem value="offline">Offline</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Total Marks"
                  name="total_marks"
                  value={formData.total_marks}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                  }}
                >
                  <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
                  <Button variant="contained" onClick={handleSave}>
                    Save
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </ModalContent>
        </StyledModal>

        <ViewQuestionModal
          open={openViewModal}
          onClose={() => setOpenViewModal(false)}
          selectedExam={selectedExam}
        />

        <Dialog
          open={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
        >
          <DialogTitle>Delete Exam</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this exam? This action cannot be
              undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};
export default ExamManagement;

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
} from "@mui/material";
import { FaPlus, FaEye, FaPencilAlt, FaTrash } from "react-icons/fa";
import { styled } from "@mui/system";
import Layout from "../Admin/Layout";
import {
  getExam,
  getExamById,
  deleteExam,
  deleteAllExam,
  createExam,
  updateExam,
} from "../../services/adminManageExam";
import { getSubjects } from "../../services/adminSubujectApi";

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await getExam();
        setExams(response);
      } catch (error) {
        console.error("Error fetching exams:", error);
      }
    };

    fetchExams();
  }, []);

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
        : true)
    );
  });

  const handleView = (exam) => {
    setSelectedExam(exam);
    setOpenViewModal(true);
  };

  const handleEdit = (exam) => {
    setSelectedExam(exam);
    setOpenAddModal(true);
  };

  const handleDelete = (exam) => {
    setSelectedExam(exam);
    setOpenDeleteModal(true);
  };

  const handleSave = () => {
    setSnackbar({
      open: true,
      message: "Exam saved successfully!",
      severity: "success",
    });
    setOpenAddModal(false);
  };

  const handleConfirmDelete = () => {
    setSnackbar({
      open: true,
      message: "Exam deleted successfully!",
      severity: "success",
    });
    setOpenDeleteModal(false);
  };

  const handleBulkDelete = () => {
    setSnackbar({
      open: true,
      message: "Selected exams deleted successfully!",
      severity: "success",
    });
    setSelectedExams([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
            onClick={() => setOpenAddModal(true)}
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
              <MenuItem value="Mathematics">Mathematics</MenuItem>
              <MenuItem value="Science">Science</MenuItem>
              <MenuItem value="English">English</MenuItem>
              <MenuItem value="History">History</MenuItem>
              <MenuItem value="Geography">Geography</MenuItem>
              <MenuItem value="Computer Science">Computer Science</MenuItem>
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
              <MenuItem value="6-8">6-8</MenuItem>
              <MenuItem value="9-10">9-10</MenuItem>
              <MenuItem value="11-12">11-12</MenuItem>
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
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Type</InputLabel>
            <Select
              label="Level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
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
                      <TableCell>{exam.id}</TableCell>
                      <TableCell>{exam.name}</TableCell>
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
                <TextField
                  fullWidth
                  label="Exam Name"
                  defaultValue={selectedExam?.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  defaultValue={selectedExam?.description}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    defaultValue={selectedExam?.subject.subject_name || ""}
                  >
                    <MenuItem value="Mathematics">Mathematics</MenuItem>
                    <MenuItem value="Science">Science</MenuItem>
                    <MenuItem value="English">English</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select defaultValue={selectedExam?.level.name || ""}>
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
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

        <Dialog
          open={openViewModal}
          onClose={() => setOpenViewModal(false)}
          maxWidth="md"
        >
          <DialogTitle>Exam Details</DialogTitle>
          <DialogContent>
            {selectedExam && (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Name</Typography>
                  <Typography>{selectedExam.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Subject</Typography>
                  <Typography>{selectedExam.subject.subject_name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography>{selectedExam.description}</Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewModal(false)}>Close</Button>
          </DialogActions>
        </Dialog>

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

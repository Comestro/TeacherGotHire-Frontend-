import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    Stack,
    Chip,
    useMediaQuery,
    useTheme,
    Container,
    Tooltip,
    Breadcrumbs,
    Badge,
    Fade,
    CircularProgress
} from "@mui/material";
import {
    ArrowBack,
    School,
    Assessment,
    Edit,
    Delete,
    Add,
    AccessTime,
    DescriptionOutlined,
    InfoOutlined,
    NavigateNext,
    Check,
    Close,
    Warning,
    HelpOutline
} from "@mui/icons-material";
import { FaArrowLeft } from "react-icons/fa";
import {
    getExamById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
} from "../../services/adminManageExam";
import Layout from "../Admin/Layout";
import Loader from "../../components/Loader";

const QuestionCard = ({ question, index, onEdit, onDelete }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const [isHovered, setIsHovered] = useState(false);

    if (!question) return null;

    return (
        <Paper
            elevation={isHovered ? 5 : 3}
            sx={{
                mb: 3,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                borderLeft: `4px solid ${question.language === "English" ? theme.palette.info.main : theme.palette.secondary.main}`,
                '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                },
                position: 'relative',
                overflow: 'hidden',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexDirection: isMobile ? 'column' : 'row',
                    mb: 1
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography
                            variant="h6"
                            color="primary"
                            gutterBottom={isMobile}
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
                            sx={{ mb: isMobile ? 1 : 0 }}
                        />
                    </Box>

                    <Box sx={{
                        display: "flex",
                        mt: isMobile ? 1 : 0,
                        alignSelf: isMobile ? 'flex-end' : 'center',
                        gap: 0.5
                    }}>
                        <Tooltip title="Edit Question" arrow>
                            <IconButton
                                onClick={() => onEdit(question)}
                                color="primary"
                                size="small"
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'primary.light',
                                    '&:hover': { bgcolor: 'primary.50' }
                                }}
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Question" arrow>
                            <IconButton
                                onClick={() => onDelete(question.id)}
                                color="error"
                                size="small"
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'error.light',
                                    '&:hover': { bgcolor: 'error.50' }
                                }}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Typography
                    variant="body1"
                    gutterBottom
                    sx={{
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        fontWeight: 500,
                        lineHeight: 1.5
                    }}
                >
                    {question.text}
                </Typography>

                <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mb: 1
                        }}
                    >
                        <DescriptionOutlined fontSize="small" /> Options:
                    </Typography>
                    <Grid container spacing={1.5}>
                        {question.options.map((option, i) => (
                            <Grid item xs={12} sm={6} key={i}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 1.5,
                                        backgroundColor: i + 1 === question.correct_option ? 'success.50' : 'background.default',
                                        border: '1px solid',
                                        borderColor: i + 1 === question.correct_option ? 'success.main' : 'divider',
                                        borderRadius: 1.5,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: i + 1 === question.correct_option ? 'success.dark' : 'primary.light',
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {i + 1 === question.correct_option && (
                                            <Check fontSize="small" color="success" sx={{ mr: 0.5 }} />
                                        )}
                                        <Typography
                                            variant="body2"
                                            color={i + 1 === question.correct_option ? "success.dark" : "text.secondary"}
                                            fontWeight={i + 1 === question.correct_option ? 500 : 400}
                                        >
                                            {i + 1}. {option}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {question.solution && (
                    <Box sx={{ mt: 2.5, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed', borderColor: 'info.light' }}>
                        <Typography
                            variant="subtitle2"
                            fontWeight={500}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                color: 'info.dark'
                            }}
                        >
                            <HelpOutline fontSize="small" />
                            Solution:
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, pl: 2.5 }}>
                            {question.solution}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                            {question.time} minutes
                        </Typography>
                    </Box>

                    {isHovered && !isMobile && (
                        <Fade in={isHovered}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Edit Question" arrow>
                                    <IconButton size="small" color="primary" onClick={() => onEdit(question)}>
                                        <Edit fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Question" arrow>
                                    <IconButton size="small" color="error" onClick={() => onDelete(question.id)}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Fade>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

const ExamDetails = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [loading, setLoading] = useState(true);
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState("English");
    const [openAddQuestionModal, setOpenAddQuestionModal] = useState(false);
    const [editQuestion, setEditQuestion] = useState(null);
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
    const [formErrors, setFormErrors] = useState({});
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [formSubmitting, setFormSubmitting] = useState(false);

    useEffect(() => {
        const fetchExamData = async () => {
            setLoading(true);
            try {
                const response = await getExamById(examId);
                setExam(response);
                const transformedQuestions = response?.questions?.map(q => ({
                    ...q,
                    options: q.options.map(opt => typeof opt === 'object' ? opt.option : opt),
                    language: q.language || "English"
                })) || [];
                setQuestions(transformedQuestions);
            } catch (error) {
                setSnackbarMessage(error.response?.data?.message || "Failed to fetch exam details.");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            } finally {
                setLoading(false);
            }
        };

        if (examId) {
            fetchExamData();
        }
    }, [examId]);

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
        if (newQuestion.correct_option === "" || isNaN(newQuestion.correct_option)) {
            errors.correct_option = "Correct Option is required.";
        } else if (newQuestion.correct_option < 1 || newQuestion.correct_option > 4) {
            errors.correct_option = "Correct Option must be between 1 and 4.";
        }
        if (!newQuestion.time || newQuestion.time <= 0) {
            errors.time = "Time must be greater than 0.";
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
            language: selectedLanguage
        });
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

    const handleBackToExams = () => {
        navigate('/admin/manage/exam');
    };

    const handleSaveQuestion = async () => {
        if (!validateForm()) return;

        setFormSubmitting(true);

        try {
            if (editQuestion) {
                await updateQuestion(editQuestion.id, newQuestion);
                setSnackbarMessage("Question updated successfully!");
            } else {
                await createQuestion({ ...newQuestion, exam: examId });
                setSnackbarMessage("Question added successfully!");
            }
            setSnackbarSeverity("success");

            try {
                const response = await getExamById(examId);
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

            setOpenAddQuestionModal(false);
            setFormErrors({});
        } catch (error) {
            if (error.response?.data && typeof error.response.data === 'object') {
                const errors = {};
                for (const key in error.response.data) {
                    if (Array.isArray(error.response.data[key])) {
                        errors[key] = error.response.data[key][0];
                    } else {
                        errors[key] = error.response.data[key];
                    }
                }
                setFormErrors(errors);
            } else {
                const errorMsg = error.response?.data || "Action failed.";
                setSnackbarMessage(errorMsg);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            }
        } finally {
            setFormSubmitting(false);
            setSnackbarOpen(true);
        }
    };

    const handleDeleteQuestion = async (id) => {
        setConfirmDelete(id);
    };

    const confirmDeleteQuestion = async () => {
        try {
            await deleteQuestion(confirmDelete);
            setQuestions(questions.filter((q) => q.id !== confirmDelete));
            setSnackbarMessage("Question deleted successfully!");
            setSnackbarSeverity("success");
            setConfirmDelete(null);
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

    // Count questions by language
    const questionCounts = {
        English: questions.filter(q => q.language === "English").length,
        Hindi: questions.filter(q => q.language === "Hindi").length
    };

    if (loading) {
        return (
            <Layout>
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Loader />
                </Container>
            </Layout>
        );
    }

    return (
        <Layout>
            <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
                <Box sx={{ mb: 2 }}>
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb">
                        <Link
                            to="/admin/dashboard"
                            style={{
                                textDecoration: 'none',
                                color: theme.palette.text.secondary,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/admin/manage/exam"
                            style={{
                                textDecoration: 'none',
                                color: theme.palette.text.secondary,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            Exam set
                        </Link>
                        <Typography color="primary" sx={{ fontWeight: 500 }}>
                            {exam?.subject?.subject_name || "Exam"} Details
                        </Typography>
                    </Breadcrumbs>
                </Box>

                <Box
                    sx={{
                        mb: 4,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<FaArrowLeft />}
                            onClick={handleBackToExams}
                            sx={{ borderRadius: 8, px: 2 }}
                        >
                            Back
                        </Button>
                        <Typography
                            variant={isMobile ? "h5" : "h4"}
                            sx={{
                                mb: { sm: 0 },
                                fontWeight: 600,
                                color: 'primary.dark'
                            }}
                        >
                            {exam?.subject?.subject_name || "Exam"} Details
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Basic Info Card */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper
                            elevation={2}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                height: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4
                                }
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
                                        {exam?.subject?.subject_name || "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Level
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {exam?.level?.name || "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Class Category
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {exam?.class_category?.name || "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Type
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {exam?.type || "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Total Marks
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {exam?.total_marks || "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Duration
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {exam?.duration || "N/A"} minutes
                                    </Typography>
                                </Grid>
                            </Grid>

                            {/* Summary of questions */}
                            <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <InfoOutlined fontSize="small" color="info" />
                                    Questions Summary
                                </Typography>
                                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                    <Chip
                                        label={`English: ${questionCounts.English}`}
                                        color="info"
                                        variant={selectedLanguage === "English" ? "filled" : "outlined"}
                                        onClick={() => setSelectedLanguage("English")}
                                        sx={{ borderRadius: 1 }}
                                    />
                                    <Chip
                                        label={`Hindi: ${questionCounts.Hindi}`}
                                        color="secondary"
                                        variant={selectedLanguage === "Hindi" ? "filled" : "outlined"}
                                        onClick={() => setSelectedLanguage("Hindi")}
                                        sx={{ borderRadius: 1 }}
                                    />
                                </Stack>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Questions Section */}
                    <Grid item xs={12} md={6} lg={8}>
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
                                <Typography
                                    variant="h6"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        color: 'text.primary'
                                    }}
                                >
                                    <Badge
                                        badgeContent={filteredQuestions.length}
                                        color={selectedLanguage === "English" ? "info" : "secondary"}
                                        showZero
                                    >
                                        <Assessment />
                                    </Badge>
                                    {selectedLanguage} Questions
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
                                    borderRadius: 8,
                                    px: 3,
                                    py: isMobile ? 1 : 'inherit',
                                    boxShadow: 2,
                                    '&:hover': {
                                        boxShadow: 4
                                    }
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
                                    p: { xs: 3, sm: 4 },
                                    textAlign: 'center',
                                    borderRadius: 2,
                                    borderStyle: 'dashed',
                                    borderWidth: 2,
                                    borderColor: 'divider',
                                    bgcolor: 'background.default',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2
                                }}
                            >
                                <Warning color="action" fontSize="large" />
                                <Typography color="text.secondary" variant="h6" sx={{ mb: 1 }}>
                                    No questions available in {selectedLanguage}
                                </Typography>
                                <Typography color="text.secondary" variant="body2" sx={{ mb: 2, maxWidth: 450 }}>
                                    Please add questions to this exam in {selectedLanguage} to make it available to candidates.
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={handleAddQuestion}
                                    sx={{ borderRadius: 8, px: 3 }}
                                >
                                    Add Question
                                </Button>
                            </Paper>
                        )}
                    </Grid>
                </Grid>

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
                        bgcolor: editQuestion ? 'warning.50' : 'primary.50',
                        color: editQuestion ? 'warning.dark' : 'primary.dark',
                        px: { xs: 2, sm: 3 },
                        py: 2,
                        borderBottom: '1px solid',
                        borderColor: editQuestion ? 'warning.light' : 'primary.light',
                    }}>
                        {isMobile && (
                            <IconButton
                                edge="start"
                                onClick={() => setOpenAddQuestionModal(false)}
                                sx={{ mr: 2, color: 'inherit' }}
                                disabled={formSubmitting}
                            >
                                <ArrowBack />
                            </IconButton>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {editQuestion ? <Edit color="warning" /> : <Add color="primary" />}
                            <Typography variant="h6">
                                {editQuestion ? "Edit Question" : "Add New Question"}
                            </Typography>
                        </Box>
                    </DialogTitle>

                    <DialogContent sx={{ p: { xs: 2, sm: 3 }, mt: 2, mb: 2, position: 'relative' }}>
                        {/* Full-page loader overlay */}
                        {formSubmitting && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    zIndex: 10,
                                    borderRadius: 'inherit'
                                }}
                            >
                                <CircularProgress size={60} thickness={4} />
                                <Typography variant="h6" sx={{ mt: 2, fontWeight: 500 }}>
                                    {editQuestion ? "Updating..." : "Saving..."}
                                </Typography>
                            </Box>
                        )}

                        <Stack spacing={3.5}>
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="subtitle1"
                                    color="text.primary"
                                    fontWeight={500}
                                    gutterBottom
                                    sx={{ mb: 1 }}
                                >
                                    Question Language*
                                </Typography>
                                <FormControl
                                    fullWidth
                                    size={isMobile ? "small" : "medium"}
                                    variant="outlined"
                                    error={!!formErrors.language}
                                    disabled={formSubmitting}
                                >
                                    <Select
                                        value={newQuestion.language || ''}
                                        displayEmpty
                                        onChange={(e) =>
                                            setNewQuestion({
                                                ...newQuestion,
                                                language: e.target.value,
                                            })
                                        }
                                    >
                                        <MenuItem disabled value="">
                                            <em>Select a language</em>
                                        </MenuItem>
                                        <MenuItem value="English">English</MenuItem>
                                        <MenuItem value="Hindi">Hindi</MenuItem>
                                    </Select>
                                    {formErrors.language && (
                                        <FormHelperText>{formErrors.language}</FormHelperText>
                                    )}
                                </FormControl>
                            </Box>

                            <TextField
                                label="Question Text"
                                fullWidth
                                variant="outlined"
                                value={newQuestion.text}
                                onChange={(e) =>
                                    setNewQuestion({ ...newQuestion, text: e.target.value })
                                }
                                error={!!formErrors.text}
                                helperText={formErrors.text || "Enter the complete question text here"}
                                multiline
                                rows={3}
                                size={isMobile ? "small" : "medium"}
                                required
                                disabled={formSubmitting}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            <Box sx={{ mt: 1 }}>
                                <Typography
                                    variant="subtitle1"
                                    color="primary"
                                    sx={{
                                        mb: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        fontWeight: 500
                                    }}
                                >
                                    <DescriptionOutlined fontSize="small" /> Question Options
                                </Typography>

                                <Grid container spacing={2.5}>
                                    {newQuestion.options.map((option, index) => (
                                        <Grid item xs={12} sm={6} key={index}>
                                            <TextField
                                                label={`Option ${index + 1}`}
                                                placeholder={`Enter option ${index + 1}`}
                                                fullWidth
                                                variant="outlined"
                                                value={option}
                                                onChange={(e) => {
                                                    const updatedOptions = [...newQuestion.options];
                                                    updatedOptions[index] = e.target.value;
                                                    setNewQuestion({
                                                        ...newQuestion,
                                                        options: updatedOptions,
                                                    });
                                                }}
                                                error={!!formErrors[`option_${index}`]}
                                                helperText={formErrors[`option_${index}`]}
                                                size={isMobile ? "small" : "medium"}
                                                required
                                                disabled={formSubmitting}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>

                            <FormControl
                                fullWidth
                                size={isMobile ? "small" : "medium"}
                                variant="outlined"
                                disabled={formSubmitting}
                            >
                                <InputLabel id="correct-option-label">Correct Option</InputLabel>
                                <Select
                                    labelId="correct-option-label"
                                    value={newQuestion.correct_option}
                                    label="Correct Option"
                                    onChange={(e) =>
                                        setNewQuestion({
                                            ...newQuestion,
                                            correct_option: e.target.value,
                                        })
                                    }
                                    error={!!formErrors.correct_option}
                                >
                                    {[1, 2, 3, 4].map((option) => (
                                        <MenuItem key={option} value={option}>
                                            Option {option}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.correct_option && (
                                    <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>
                                        {formErrors.correct_option}
                                    </Typography>
                                )}
                            </FormControl>

                            <TextField
                                label="Solution (Optional)"
                                placeholder="Provide an explanation for the correct answer"
                                fullWidth
                                variant="outlined"
                                value={newQuestion.solution}
                                onChange={(e) =>
                                    setNewQuestion({ ...newQuestion, solution: e.target.value })
                                }
                                multiline
                                rows={3}
                                size={isMobile ? "small" : "medium"}
                                disabled={formSubmitting}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            <TextField
                                label="Time Allocation"
                                placeholder="Time in minutes"
                                fullWidth
                                variant="outlined"
                                type="number"
                                value={newQuestion.time}
                                onChange={(e) =>
                                    setNewQuestion({ ...newQuestion, time: e.target.value })
                                }
                                error={!!formErrors.time}
                                helperText={formErrors.time || "The time allocated for this question (in minutes)"}
                                size={isMobile ? "small" : "medium"}
                                required
                                disabled={formSubmitting}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    step: 0.5,
                                    min: 0.5,
                                }}
                            />

                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mt: 3,
                                gap: 2
                            }}>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    onClick={() => setOpenAddQuestionModal(false)}
                                    sx={{ px: 3 }}
                                    disabled={formSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color={editQuestion ? "warning" : "primary"}
                                    onClick={handleSaveQuestion}
                                    disabled={formSubmitting}
                                    sx={{
                                        px: 4,
                                        fontWeight: 500
                                    }}
                                >
                                    {formSubmitting ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CircularProgress size={20} color="inherit" thickness={4} />
                                            {editQuestion ? "Updating..." : "Saving..."}
                                        </Box>
                                    ) : (
                                        editQuestion ? "Update Question" : "Save Question"
                                    )}
                                </Button>
                            </Box>
                        </Stack>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}

                <Dialog
                    open={!!confirmDelete}
                    onClose={() => setConfirmDelete(null)}
                    fullWidth
                    maxWidth="xs"
                    fullScreen={fullScreen}
                    sx={{
                        "& .MuiDialog-paper": {
                            borderRadius: { xs: 0, sm: 2 }
                        }
                    }}
                >
                    <DialogTitle sx={{ bgcolor: 'error.50', color: 'error.dark', px: 3, py: 2 }}>
                        <Warning color="error" />
                        Confirm Delete
                    </DialogTitle>
                    <DialogContent sx={{ p: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                            Are you sure you want to delete this question?
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setConfirmDelete(null)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={confirmDeleteQuestion} color="error">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity={snackbarSeverity}
                        sx={{ width: "100%" }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Container>
        </Layout>
    );
}

export default ExamDetails;
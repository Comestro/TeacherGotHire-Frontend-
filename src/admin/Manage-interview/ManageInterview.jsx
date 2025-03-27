import React, { useState, useEffect } from "react";
import {
    Box, Container, Typography, Grid, Paper, TextField, Button, Autocomplete,
    FormControl, InputLabel, Select, MenuItem, Modal, Chip, IconButton, Switch,
    ThemeProvider, createTheme, CssBaseline, CircularProgress, Alert, Snackbar,
    useMediaQuery, Tooltip, Divider, Avatar, Card, CardContent, Stack, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {
    FiDownload, FiRefreshCw, FiEye, FiCalendar, FiX, FiThumbsDown,
    FiCheck, FiFilter, FiSearch, FiChevronDown, FiBarChart2, FiList, FiClock
} from "react-icons/fi";
import Layout from "../Admin/Layout";
import { getInterview, updateInterview } from "../../services/adminInterviewApi";

// Initialize dayjs plugins
dayjs.extend(isBetween);

// Helper function to generate colors based on name
const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
};

const InterviewManagement = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [filters, setFilters] = useState({
        status: "",
        teacherName: "",
        dateRange: [null, null],
        searchTerm: ""
    });

    const [openModal, setOpenModal] = useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [interviewData, setInterviewData] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [selectedDateTime, setSelectedDateTime] = useState(dayjs());
    const [rejectionReason, setRejectionReason] = useState("");
    const [interviewScore, setInterviewScore] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Responsive breakpoints
    const isMobile = useMediaQuery('(max-width:600px)');
    const isTablet = useMediaQuery('(max-width:960px)');

    const theme = createTheme({
        palette: {
            mode: darkMode ? "dark" : "light",
            primary: {
                main: '#2196f3',
            },
            secondary: {
                main: '#f50057',
            },
            success: {
                main: '#4caf50',
            },
            warning: {
                main: '#ff9800',
            },
            error: {
                main: '#f44336',
            },
            info: {
                main: '#2196f3',
            },
            background: {
                default: darkMode ? '#121212' : '#f5f5f5',
                paper: darkMode ? '#1e1e1e' : '#ffffff',
            },
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            h4: {
                fontWeight: 600,
            },
            h6: {
                fontWeight: 600,
            },
            button: {
                textTransform: 'none',
                fontWeight: 500,
            },
        },
        components: {
            MuiTableCell: {
                styleOverrides: {
                    head: {
                        fontWeight: 600,
                        backgroundColor: darkMode ? "#2a2a2a" : "#f5f5f5",
                    },
                    body: {
                        padding: '16px',
                    }
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                    }
                }
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        borderRadius: 8,
                    }
                }
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 6,
                    }
                }
            },
            MuiTableContainer: {
                styleOverrides: {
                    root: {
                        borderRadius: '8px 8px 0 0',
                        overflow: 'auto'
                    }
                }
            }
        }
    });

    // Function to determine the correct status based on API data
    const determineStatus = (interview) => {
        // Return the status directly if it's already a string like "fulfilled", "requested"
        if (typeof interview.status === 'string') {
            // Map API status to display status
            switch (interview.status) {
                case 'fulfilled':
                    return "Completed";
                case 'requested':
                    return "Pending";
                case 'scheduled':
                    return "Scheduled";
                case 'rejected':
                    return "Rejected";
                default:
                    return interview.status;
            }
        } else if (interview.grade !== null && interview.grade !== undefined && interview.grade > 0) {
            return "Completed";
        } else if (interview.status && interview.link) {
            return "Scheduled";
        } else if (interview.rejectionReason) {
            return "Rejected";
        } else {
            return "Pending";
        }
    };

    // Modify the fetchInterviews function to properly map the data
    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const response = await getInterview();
            console.log("API response:", response);

            const data = response.map(item => {
                // Determine the correct status from the API response
                const status = determineStatus(item);

                return {
                    id: item.id,
                    name: `${item.user.Fname} ${item.user.Lname}`,
                    classCategory: item.class_category?.name || "Unknown",
                    classCategoryId: item.class_category?.id || null,
                    subjectName: item.subject?.subject_name || "Unknown",
                    subjectId: item.subject?.id || null,
                    examName: `${item.subject?.subject_name || ""} (${item.class_category?.name || ""})`,
                    score: item.grade !== null && item.grade !== undefined && item.grade > 0 ? item.grade : "Not graded",
                    mode: item.class_category?.id === 1 ? "Online" : "Offline",
                    requestedDate: dayjs(item.time).format("YYYY-MM-DD"),
                    requestedTime: dayjs(item.time).format("HH:mm"),
                    status: status,
                    apiStatus: item.status, // Store original API status
                    scheduledDate: (item.status === "scheduled" || item.status === "fulfilled") ? dayjs(item.time).format("YYYY-MM-DD HH:mm") : null,
                    rejectionReason: item.rejectionReason || null,
                    link: item.link,
                    email: item.user.email,
                    originalData: item
                };
            });

            console.log("Processed data:", data);
            setInterviewData(data);
            setFilteredTeachers(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching interviews:", err);
            setError(err.message || "Error fetching interviews");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterviews();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, interviewData]);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleScheduleInterview = async () => {
        // Validate that selected date is in the future
        if (selectedDateTime.isBefore(dayjs())) {
            setSnackbarMessage("Please select a future date and time.");
            setSnackbarSeverity("warning");
            setSnackbarOpen(true);
            return;
        }

        try {
            setActionLoading(true);
            const response = await updateInterview(selectedTeacher.id, {
                status: "scheduled", // Use string status 
                time: selectedDateTime && selectedDateTime.toISOString()
            });

            console.log("Schedule response:", response);

            // Refresh data to get updated interview data
            await fetchInterviews();

            setScheduleModalOpen(false);
            setSnackbarMessage("Interview scheduled successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (err) {
            console.error("Error scheduling interview:", err);
            setSnackbarMessage("Failed to schedule interview.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

    // Update handleRejectInterview function
    const handleRejectInterview = async () => {
        if (!rejectionReason.trim()) {
            setSnackbarMessage("Please provide a reason for rejection.");
            setSnackbarSeverity("warning");
            setSnackbarOpen(true);
            return;
        }

        try {
            setActionLoading(true);
            const response = await updateInterview(selectedTeacher.id, {
                status: "rejected", // Use string status
                rejectionReason
            });

            console.log("Reject response:", response);

            // Refresh data to get updated interview data
            await fetchInterviews();

            setRejectModalOpen(false);
            setRejectionReason("");
            setSnackbarMessage("Interview rejected successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (err) {
            console.error("Error rejecting interview:", err);
            setSnackbarMessage("Failed to reject interview.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCompleteInterview = async () => {
        if (!interviewScore.trim() || isNaN(interviewScore) || Number(interviewScore) < 0 || Number(interviewScore) > 10) {
            setSnackbarMessage("Please provide a valid score between 0 and 10.");
            setSnackbarSeverity("warning");
            setSnackbarOpen(true);
            return;
        }

        try {
            setActionLoading(true);
            // Send "fulfilled" as the status instead of boolean
            const response = await updateInterview(selectedTeacher.id, {
                grade: Number(interviewScore),
                status: "fulfilled"
            });

            console.log("Complete response:", response);

            // Update the local data immediately
            setInterviewData(prev => prev.map(interview => {
                if (interview.id === selectedTeacher.id) {
                    return {
                        ...interview,
                        score: interviewScore,
                        status: "Completed",
                        apiStatus: "fulfilled",
                        originalData: {
                            ...interview.originalData,
                            grade: Number(interviewScore),
                            status: "fulfilled"
                        }
                    };
                }
                return interview;
            }));

            // Also refresh from server to ensure sync
            await fetchInterviews();

            setCompleteModalOpen(false);
            setInterviewScore("");
            setSnackbarMessage("Interview completed successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (err) {
            console.error("Error completing interview:", err);
            setSnackbarMessage("Failed to complete interview.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

    const handleViewDetails = (teacher) => {
        setSelectedTeacher(teacher);
        setOpenModal(true);
    };

    const handleOpenSchedule = (teacher) => {
        setSelectedTeacher(teacher);
        // Set initial date time from teacher's requested time if available
        if (teacher.requestedDate && teacher.requestedTime) {
            const initialDateTime = dayjs(`${teacher.requestedDate} ${teacher.requestedTime}`);
            setSelectedDateTime(initialDateTime);
        } else {
            setSelectedDateTime(dayjs());
        }
        setScheduleModalOpen(true);
    };

    const handleOpenReject = (teacher) => {
        setSelectedTeacher(teacher);
        setRejectionReason("");
        setRejectModalOpen(true);
    };

    const handleOpenComplete = (teacher) => {
        setSelectedTeacher(teacher);
        setInterviewScore(teacher.score !== "Not graded" ? teacher.score.toString() : "");
        setCompleteModalOpen(true);
    };

    const handleResetFilters = () => {
        setFilters({
            status: "",
            teacherName: "",
            dateRange: [null, null],
            searchTerm: ""
        });
    };

    const handleRefreshData = () => {
        fetchInterviews();
    };

    const applyFilters = () => {
        let filtered = [...interviewData];

        // Apply status filter
        if (filters.status) {
            filtered = filtered.filter(teacher => teacher.status === filters.status);
        }

        // Apply teacher name filter
        if (filters.teacherName) {
            filtered = filtered.filter(teacher =>
                teacher.name.toLowerCase().includes(filters.teacherName.toLowerCase())
            );
        }

        // Apply search term filter
        if (filters.searchTerm) {
            filtered = filtered.filter(teacher =>
                Object.entries(teacher).some(([key, value]) =>
                    key !== 'originalData' &&
                    value !== null &&
                    value !== undefined &&
                    String(value).toLowerCase().includes(filters.searchTerm.toLowerCase())
                )
            );
        }

        // Apply date range filter
        if (filters.dateRange[0] && filters.dateRange[1]) {
            filtered = filtered.filter(teacher =>
                dayjs(teacher.requestedDate).isAfter(filters.dateRange[0], 'day') ||
                dayjs(teacher.requestedDate).isSame(filters.dateRange[0], 'day')
            ).filter(teacher =>
                dayjs(teacher.requestedDate).isBefore(filters.dateRange[1], 'day') ||
                dayjs(teacher.requestedDate).isSame(filters.dateRange[1], 'day')
            );
        }

        setFilteredTeachers(filtered);
    };

    const handleExport = () => {
        const headers = [
            "Teacher Name",
            "Email",
            "Class Category",
            "Subject",
            "Mode",
            "Score",
            "Requested Date",
            "Requested Time",
            "Status",
            "Scheduled Date"
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + filteredTeachers.map(teacher => [
                teacher.name,
                teacher.email,
                teacher.classCategory,
                teacher.subjectName,
                teacher.mode,
                teacher.score,
                teacher.requestedDate,
                teacher.requestedTime,
                teacher.status,
                teacher.scheduledDate || "Not scheduled"
            ].join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `teacher_interviews_${dayjs().format("YYYY-MM-DD")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Get statistics for dashboard summary
    const getStatusCount = (status) => {
        return interviewData.filter(teacher => teacher.status === status).length;
    };

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Render card view for mobile
    const renderCardView = () => {
        return (
            <Stack spacing={2}>
                {filteredTeachers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((teacher) => (
                        <Card key={teacher.id} sx={{ borderRadius: 2, boxShadow: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: stringToColor(teacher.name),
                                                width: 40,
                                                height: 40
                                            }}
                                        >
                                            {teacher.name.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {teacher.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {teacher.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip
                                        label={teacher.status}
                                        size="small"
                                        color={
                                            teacher.status === "Pending" ? "warning" :
                                                teacher.status === "Scheduled" ? "info" :
                                                    teacher.status === "Completed" ? "success" :
                                                        "error"
                                        }
                                        sx={{ fontWeight: 500 }}
                                    />
                                </Box>

                                <Grid container spacing={1} sx={{ mb: 2 }}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Subject</Typography>
                                        <Typography variant="body2" fontWeight={500}>{teacher.subjectName}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Class</Typography>
                                        <Typography variant="body2" fontWeight={500}>{teacher.classCategory}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Mode</Typography>
                                        <Chip
                                            label={teacher.mode}
                                            size="small"
                                            variant="outlined"
                                            color={teacher.mode === "Online" ? "primary" : "secondary"}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">Grade</Typography>
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            color={
                                                teacher.score !== "Not graded" ?
                                                    (Number(teacher.score) >= 7 ? 'success.main' :
                                                        Number(teacher.score) >= 4 ? 'warning.main' : 'error.main')
                                                    : 'text.secondary'
                                            }
                                        >
                                            {teacher.score !== "Not graded" ? `${teacher.score}/10` : "Not graded"}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">Schedule</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {teacher.scheduledDate || "Not scheduled"}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<FiEye />}
                                        onClick={() => handleViewDetails(teacher)}
                                    >
                                        View
                                    </Button>

                                    <Box>
                                        {teacher.status === "Pending" && (
                                            <>
                                                <Tooltip title="Schedule Interview">
                                                    <IconButton
                                                        onClick={() => handleOpenSchedule(teacher)}
                                                        size="small"
                                                        color="primary"
                                                    >
                                                        <FiClock /> {/* Or use another library like MdSchedule from react-icons/md */}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reject Request">
                                                    <IconButton
                                                        onClick={() => handleOpenReject(teacher)}
                                                        size="small"
                                                        color="error"
                                                    >
                                                        <FiX /> {/* Or use MdCancel from react-icons/md */}
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}

                                        {teacher.status === "Scheduled" && (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="success"
                                                startIcon={<FiCheck />}
                                                onClick={() => handleOpenComplete(teacher)}
                                            >
                                                Complete
                                            </Button>
                                        )}

                                        {teacher.link && teacher.status === "Scheduled" && (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{ ml: 1 }}
                                                onClick={() => window.open(teacher.link, "_blank")}
                                            >
                                                Join
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
            </Stack>
        );
    };

    // Render table view for larger screens
    const renderTableView = () => {
        return (
            <TableContainer>
                <Table sx={{ minWidth: 750 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Teacher Name</TableCell>
                            <TableCell>Subject</TableCell>
                            <TableCell>Class Category</TableCell>
                            <TableCell>Mode</TableCell>
                            <TableCell>Grade</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell>Schedule</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTeachers
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((teacher) => (
                                <TableRow
                                    key={teacher.id}
                                    hover
                                    sx={{
                                        '&:nth-of-type(even)': {
                                            backgroundColor: theme.palette.mode === 'dark' ?
                                                alpha(theme.palette.common.white, 0.05) :
                                                alpha(theme.palette.common.black, 0.02)
                                        }
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: stringToColor(teacher.name),
                                                    width: 32,
                                                    height: 32,
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {teacher.name.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {teacher.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {teacher.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {teacher.subjectName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {teacher.classCategory}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={teacher.mode}
                                            variant="outlined"
                                            size="small"
                                            color={teacher.mode === "Online" ? "primary" : "secondary"}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            fontWeight={teacher.score !== "Not graded" ? 600 : 400}
                                            color={
                                                teacher.score !== "Not graded" ?
                                                    (Number(teacher.score) >= 7 ? 'success.main' :
                                                        Number(teacher.score) >= 4 ? 'warning.main' : 'error.main')
                                                    : 'text.secondary'
                                            }
                                        >
                                            {teacher.score !== "Not graded" ? `${teacher.score}/10` : "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <Chip
                                                label={teacher.status}
                                                size="small"
                                                color={
                                                    teacher.status === "Pending" ? "warning" :
                                                        teacher.status === "Scheduled" ? "info" :
                                                            teacher.status === "Completed" ? "success" :
                                                                "error"
                                                }
                                                sx={{
                                                    fontWeight: 500,
                                                    minWidth: '90px'
                                                }}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {teacher.scheduledDate || "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    onClick={() => handleViewDetails(teacher)}
                                                    size="small"
                                                    color="info"
                                                >
                                                    <FiEye />
                                                </IconButton>
                                            </Tooltip>

                                            {teacher.apiStatus === "requested" && (
                                                <>
                                                    <Tooltip title="Schedule Interview">
                                                        <IconButton
                                                            onClick={() => handleOpenSchedule(teacher)}
                                                            size="small"
                                                            color="primary"
                                                        >
                                                            <FiClock /> {/* Or use another library like MdSchedule from react-icons/md */}
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject Request">
                                                        <IconButton
                                                            onClick={() => handleOpenReject(teacher)}
                                                            size="small"
                                                            color="error"
                                                        >
                                                            <FiX /> {/* Or use MdCancel from react-icons/md */}
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}

                                            {teacher.apiStatus === "scheduled" && (
                                                <>
                                                    <Tooltip title="Complete Interview">
                                                        <IconButton
                                                            onClick={() => handleOpenComplete(teacher)}
                                                            size="small"
                                                            color="success"
                                                        >
                                                            <FiCheck />
                                                        </IconButton>
                                                    </Tooltip>

                                                    {teacher.link && (
                                                        <Tooltip title="Join Meeting">
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                onClick={() => window.open(teacher.link, "_blank")}
                                                            >
                                                                Join
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                </>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    if (loading && interviewData.length === 0) {
        return (
            <Layout>
                <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                    <Box textAlign="center">
                        <CircularProgress />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Loading interview data...
                        </Typography>
                    </Box>
                </Container>
            </Layout>
        );
    }

    if (error && interviewData.length === 0) {
        return (
            <Layout>
                <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                    <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
                        {error}
                    </Alert>
                </Container>
            </Layout>
        );
    }

    return (
        <Layout>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Container maxWidth="xl" sx={{
                    py: { xs: 2, sm: 4 },
                    px: { xs: 1, sm: 3 },
                }}>
                    {/* Header */}
                    <Box sx={{
                        mb: 3,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <Typography
                            variant="h4"
                            component="h1"
                            fontWeight="bold"
                            sx={{
                                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                                color: 'primary.main'
                            }}
                        >
                            Teacher Interview Management
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2">Dark Mode</Typography>
                                <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Refresh Data">
                                    <IconButton
                                        color="primary"
                                        onClick={handleRefreshData}
                                        size={isMobile ? "small" : "medium"}
                                    >
                                        <FiRefreshCw />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title={viewMode === 'table' ? 'Card View' : 'Table View'}>
                                    <IconButton
                                        color="primary"
                                        onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
                                        size={isMobile ? "small" : "medium"}
                                    >
                                        {viewMode === 'table' ? <FiList /> : <FiBarChart2 />}
                                    </IconButton>
                                </Tooltip>

                                {isTablet && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<FiFilter />}
                                        onClick={() => setFiltersOpen(!filtersOpen)}
                                    >
                                        Filters
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    {/* Filter Box */}
                    {(filtersOpen || !isTablet) && (
                        <Paper sx={{
                            p: { xs: 2, sm: 3 },
                            mb: 3,
                            borderRadius: 2,
                            boxShadow: 2,
                        }}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2
                            }}>
                                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                    Filters
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        startIcon={<FiRefreshCw />}
                                        variant="outlined"
                                        size="small"
                                        onClick={handleResetFilters}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        startIcon={<FiDownload />}
                                        variant="contained"
                                        size="small"
                                        onClick={handleExport}
                                    >
                                        Export
                                    </Button>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Search"
                                        variant="outlined"
                                        size="small"
                                        value={filters.searchTerm}
                                        onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                                        placeholder="Search interviews..."
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={filters.status}
                                            label="Status"
                                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            <MenuItem value="Pending">Pending</MenuItem>
                                            <MenuItem value="Scheduled">Scheduled</MenuItem>
                                            <MenuItem value="Completed">Completed</MenuItem>
                                            <MenuItem value="Rejected">Rejected</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <Autocomplete
                                        options={Array.from(new Set(interviewData.map(t => t.name)))}
                                        value={filters.teacherName || null}
                                        onChange={(_, newValue) => setFilters({ ...filters, teacherName: newValue || "" })}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Teacher Name"
                                                size="small"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="From Date"
                                            value={filters.dateRange[0]}
                                            onChange={(newValue) => setFilters({ ...filters, dateRange: [newValue, filters.dateRange[1]] })}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: 'small'
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="To Date"
                                            value={filters.dateRange[1]}
                                            onChange={(newValue) => setFilters({ ...filters, dateRange: [filters.dateRange[0], newValue] })}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: 'small'
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                            </Grid>
                        </Paper>
                    )}

                    {/* Data Table */}
                    <Paper sx={{
                        width: '100%',
                        borderRadius: 2,
                        boxShadow: 2,
                        overflow: 'hidden'
                    }}>
                        {loading && interviewData.length > 0 ? (
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                p: 4
                            }}>
                                <CircularProgress size={30} />
                                <Typography ml={2} variant="body2" color="text.secondary">
                                    Updating data...
                                </Typography>
                            </Box>
                        ) : filteredTeachers.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No interviews found
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Try adjusting your filters or check back later.
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                {viewMode === 'table' ? renderTableView() : renderCardView()}
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    component="div"
                                    count={filteredTeachers.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </>
                        )}
                    </Paper>

                    {/* View Details Modal */}
                    <Modal
                        open={openModal}
                        onClose={() => setOpenModal(false)}
                        aria-labelledby="teacher-details-modal"
                    >
                        <Paper sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: { xs: '90%', sm: 500 },
                            p: 3,
                            borderRadius: 2,
                            maxHeight: '90vh',
                            overflow: 'auto'
                        }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6" fontWeight={600}>Teacher Interview Details</Typography>
                                <IconButton onClick={() => setOpenModal(false)} size="small">
                                    <FiX />
                                </IconButton>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            {selectedTeacher && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Teacher Name</Typography>
                                        <Typography variant="body1" fontWeight={500}>{selectedTeacher.name}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Qualified Exam</Typography>
                                        <Typography variant="body1">{selectedTeacher.exam}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Interview Mode</Typography>
                                        <Chip
                                            label={selectedTeacher.mode}
                                            color={selectedTeacher.mode === "Online" ? "primary" : "secondary"}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                        <Chip
                                            label={selectedTeacher.status}
                                            color={
                                                selectedTeacher.status === "Pending" ? "warning" :
                                                    selectedTeacher.status === "Scheduled" ? "info" :
                                                        selectedTeacher.status === "Completed" ? "success" :
                                                            "error"
                                            }
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Requested Date</Typography>
                                        <Typography variant="body1">{selectedTeacher.requestedDate}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Requested Time</Typography>
                                        <Typography variant="body1">{selectedTeacher.requestedTime}</Typography>
                                    </Grid>

                                    {selectedTeacher.scheduledDate && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="text.secondary">Scheduled Date & Time</Typography>
                                            <Typography variant="body1" fontWeight={500}>{selectedTeacher.scheduledDate}</Typography>
                                        </Grid>
                                    )}

                                    {selectedTeacher.rejectionReason && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="text.secondary">Rejection Reason</Typography>
                                            <Paper
                                                variant="outlined"
                                                sx={{ p: 1.5, mt: 0.5, bgcolor: 'background.default' }}
                                            >
                                                <Typography variant="body2">{selectedTeacher.rejectionReason}</Typography>
                                            </Paper>
                                        </Grid>
                                    )}
                                    {selectedTeacher.score && selectedTeacher.score !== "Not graded" && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="text.secondary">Interview Score</Typography>
                                            <Typography variant="body1" fontWeight={600}>
                                                {selectedTeacher.score}/10
                                            </Typography>
                                        </Grid>
                                    )}

                                    {selectedTeacher.link && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="text.secondary">Interview Link</Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                sx={{ mt: 1 }}
                                                onClick={() => window.open(selectedTeacher.link, "_blank")}
                                                disabled={selectedTeacher.status === "Completed" || selectedTeacher.status === "Rejected"}
                                            >
                                                Open Meeting Link
                                            </Button>
                                        </Grid>
                                    )}
                                </Grid>
                            )}

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" onClick={() => setOpenModal(false)}>
                                    Close
                                </Button>
                            </Box>
                        </Paper>
                    </Modal>

                    {/* Schedule Modal */}
                    <Modal 
                        open={scheduleModalOpen} 
                        onClose={() => setScheduleModalOpen(false)}
                        // Use an alternative animation to improve perception of space
                        closeAfterTransition
                    >
                        <Paper sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: '90%', sm: 'auto', md: 450 },
                            maxWidth: '95vw',
                            maxHeight: { xs: '85vh', sm: '90vh' },
                            overflow: 'auto',
                            p: { xs: 2, sm: 3 },
                            borderRadius: 2,
                            // Responsive margin to ensure it's not flush with the edge of the screen
                            m: { xs: 1, sm: 2 }
                        }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                Schedule Interview
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            {selectedTeacher && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Scheduling interview for
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {selectedTeacher.name}
                                    </Typography>
                                </Box>
                            )}

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    label="Select Date & Time"
                                    value={selectedDateTime}
                                    onChange={(newValue) => setSelectedDateTime(newValue)}
                                    minDateTime={dayjs()} // This prevents selection of past dates
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            helperText: "Choose a future date and time for the interview",
                                            size: "medium"
                                        },
                                        // Improve the dialog responsiveness
                                        dialog: {
                                            sx: {
                                                '& .MuiPickersLayout-root': {
                                                    maxWidth: '100%',
                                                    maxHeight: '85vh',
                                                    overflowY: 'auto'
                                                },
                                                '& .MuiDateCalendar-root': {
                                                    width: { xs: '260px', sm: '300px' },
                                                    maxHeight: { xs: '280px', sm: '350px' }
                                                },
                                                '& .MuiClockPicker-root': {
                                                    maxHeight: { xs: '280px', sm: '320px' },
                                                    width: { xs: '260px', sm: '300px' }
                                                },
                                                '& .MuiTabs-root': {
                                                    minHeight: { xs: '40px', sm: '48px' }
                                                },
                                                '& .MuiButtonBase-root': {
                                                    padding: { xs: '6px', sm: '8px' }
                                                },
                                                '& .MuiPickersDay-root': {
                                                    width: { xs: '32px', sm: '36px' },
                                                    height: { xs: '32px', sm: '36px' },
                                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                }
                                            }
                                        },
                                        desktopPaper: {
                                            sx: {
                                                maxWidth: '95vw',
                                                overflowX: 'auto'
                                            }
                                        }
                                    }}
                                    sx={{
                                        width: '100%',
                                        '& .MuiInputBase-root': {
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        }
                                    }}
                                />
                            </LocalizationProvider>

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                                <Button variant="outlined" onClick={() => setScheduleModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleScheduleInterview}
                                    disabled={actionLoading}
                                    startIcon={actionLoading && <CircularProgress size={20} />}
                                >
                                    {actionLoading ? "Scheduling..." : "Confirm Schedule"}
                                </Button>
                            </Box>
                        </Paper>
                    </Modal>

                    {/* Rejection Modal */}
                    <Modal open={rejectModalOpen} onClose={() => setRejectModalOpen(false)}>
                        <Paper sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: '90%', sm: 450 },
                            p: 3,
                            borderRadius: 2
                        }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                Reject Interview Request
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            {selectedTeacher && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Rejecting interview request for
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {selectedTeacher.name}
                                    </Typography>
                                </Box>
                            )}

                            <TextField
                                label="Rejection Reason"
                                multiline
                                rows={4}
                                placeholder="Please provide a reason for rejection"
                                fullWidth
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                required
                                error={rejectModalOpen && rejectionReason.trim() === ""}
                                helperText={rejectModalOpen && rejectionReason.trim() === "" ? "Rejection reason is required" : ""}
                            />

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                                <Button variant="outlined" onClick={() => setRejectModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleRejectInterview}
                                    disabled={loading || rejectionReason.trim() === ""}
                                    startIcon={loading && <CircularProgress size={20} />}
                                >
                                    {loading ? "Rejecting..." : "Confirm Rejection"}
                                </Button>
                            </Box>
                        </Paper>
                    </Modal>

                    {/* Complete Interview Modal */}
                    <Modal open={completeModalOpen} onClose={() => setCompleteModalOpen(false)}>
                        <Paper sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: '90%', sm: 450 },
                            p: 3,
                            borderRadius: 2
                        }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                Complete Interview
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            {selectedTeacher && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Completing interview for
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {selectedTeacher.name}
                                    </Typography>
                                </Box>
                            )}

                            <TextField
                                fullWidth
                                label="Interview Score (0-10)"
                                type="number"
                                InputProps={{ inputProps: { min: 0, max: 10 } }}
                                value={interviewScore}
                                onChange={(e) => setInterviewScore(e.target.value)}
                                required
                                error={completeModalOpen && (interviewScore.trim() === "" || isNaN(interviewScore) || Number(interviewScore) < 0 || Number(interviewScore) > 10)}
                                helperText={completeModalOpen && (interviewScore.trim() === "" || isNaN(interviewScore) || Number(interviewScore) < 0 || Number(interviewScore) > 10) ? "Please enter a valid score between 0 and 10" : ""}
                                sx={{ mb: 2 }}
                            />

                            <Alert severity="info" sx={{ mb: 2 }}>
                                Completing this interview will mark it as finished and the score will be recorded.
                            </Alert>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button variant="outlined" onClick={() => setCompleteModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleCompleteInterview}
                                    disabled={loading || interviewScore.trim() === "" || isNaN(interviewScore) || Number(interviewScore) < 0 || Number(interviewScore) > 10}
                                    startIcon={loading && <CircularProgress size={20} />}
                                >
                                    {loading ? "Saving..." : "Mark Completed"}
                                </Button>
                            </Box>
                        </Paper>
                    </Modal>

                    {/* Snackbar for success/error messages */}
                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={6000}
                        onClose={handleSnackbarClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <Alert
                            onClose={handleSnackbarClose}
                            severity={snackbarSeverity}
                            variant="filled"
                            elevation={6}
                            sx={{ width: '100%' }}
                        >
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </Container>
            </ThemeProvider>
        </Layout>
    );
};

export default InterviewManagement;
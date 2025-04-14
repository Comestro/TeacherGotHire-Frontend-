import React, { useState, useEffect } from "react";
import {
    Box, Container, Typography, Grid, Paper, TextField, Button, Autocomplete,
    FormControl, InputLabel, Select, MenuItem, Modal, Chip, IconButton, Switch,
    ThemeProvider, createTheme, CssBaseline, CircularProgress, Alert, Snackbar,
    useMediaQuery, Tooltip, Divider, Avatar, Card, CardContent, Stack
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { alpha } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {
    FiDownload, FiRefreshCw, FiEye, FiCalendar, FiX, FiThumbsDown,
    FiCheck, FiFilter, FiSearch, FiChevronDown, FiBarChart2, FiList, FiClock, FiLink
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
        searchTerm: "",
        classCategory: "",
        subject: "",
        level: "",
        creationDateRange: [null, null],
        attempt: ""
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
    const [meetingLink, setMeetingLink] = useState("");
    const [meetingLinkError, setMeetingLinkError] = useState(false);
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
        if (typeof interview.status === 'string') {
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

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const response = await getInterview();
            console.log("API response:", response);

            const data = response.map(item => {
                const status = determineStatus(item);
                const mode = item.class_category?.id === 1 ? "Online" : "Offline";

                return {
                    id: item.id,
                    name: `${item.user.Fname} ${item.user.Lname}`,
                    userId: item.user.id,
                    firstName: item.user.Fname,
                    lastName: item.user.Lname,
                    email: item.user.email,
                    isVerified: item.user.is_verified,
                    classCategory: item.class_category?.name || "Unknown",
                    classCategoryId: item.class_category?.id || null,
                    subjectName: item.subject?.subject_name || "Unknown",
                    subjectId: item.subject?.id || null,
                    level: item.level?.name || "Unknown",
                    levelId: item.level?.id || null,
                    levelCode: item.level?.level_code || null,
                    levelDescription: item.level?.description || null,
                    mergedSubject: `${item.subject?.subject_name || "Unknown"} (${item.class_category?.name || "Unknown"})`,
                    examName: `${item.subject?.subject_name || ""} (${item.class_category?.name || ""})`,
                    score: item.grade !== null && item.grade !== undefined && item.grade > 0 ? item.grade : "Not graded",
                    mode: mode,
                    statusWithMode: `${status} (${mode})`,
                    requestedDate: item.time ? dayjs(item.time).format("YYYY-MM-DD") : "—",
                    requestedTime: item.time ? dayjs(item.time).format("HH:mm") : "—",
                    desiredDateTime: item.time ? dayjs(item.time).format("YYYY-MM-DD HH:mm") : "—",
                    status: status,
                    apiStatus: item.status,
                    scheduledDate: (item.status === "scheduled" || item.status === "fulfilled") ? dayjs(item.time).format("YYYY-MM-DD HH:mm") : null,
                    rejectionReason: item.rejectionReason || null,
                    link: item.link,
                    attempt: item.attempt,
                    createdAt: item.created_at ? dayjs(item.created_at).format("YYYY-MM-DD HH:mm") : "—",
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

    const applyFilters = () => {
        let filtered = [...interviewData];

        if (filters.status) {
            filtered = filtered.filter(teacher => teacher.status === filters.status);
        }

        if (filters.teacherName) {
            filtered = filtered.filter(teacher =>
                teacher.name.toLowerCase().includes(filters.teacherName.toLowerCase())
            );
        }

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

        if (filters.dateRange[0] && filters.dateRange[1]) {
            filtered = filtered.filter(teacher =>
                dayjs(teacher.requestedDate).isAfter(filters.dateRange[0], 'day') ||
                dayjs(teacher.requestedDate).isSame(filters.dateRange[0], 'day')
            ).filter(teacher =>
                dayjs(teacher.requestedDate).isBefore(filters.dateRange[1], 'day') ||
                dayjs(teacher.requestedDate).isSame(filters.dateRange[1], 'day')
            );
        }

        if (filters.classCategory) {
            filtered = filtered.filter(teacher =>
                teacher.classCategory === filters.classCategory
            );
        }

        if (filters.subject) {
            filtered = filtered.filter(teacher =>
                teacher.subjectName === filters.subject
            );
        }

        if (filters.level) {
            filtered = filtered.filter(teacher =>
                teacher.level === filters.level
            );
        }

        if (filters.creationDateRange[0] && filters.creationDateRange[1]) {
            filtered = filtered.filter(teacher =>
                dayjs(teacher.createdAt).isAfter(filters.creationDateRange[0], 'day') ||
                dayjs(teacher.createdAt).isSame(filters.creationDateRange[0], 'day')
            ).filter(teacher =>
                dayjs(teacher.createdAt).isBefore(filters.creationDateRange[1], 'day') ||
                dayjs(teacher.createdAt).isSame(filters.creationDateRange[1], 'day')
            );
        }

        if (filters.attempt) {
            filtered = filtered.filter(teacher =>
                teacher.attempt === Number(filters.attempt)
            );
        }

        setFilteredTeachers(filtered);
    };

    const handleResetFilters = () => {
        setFilters({
            status: "",
            teacherName: "",
            dateRange: [null, null],
            searchTerm: "",
            classCategory: "",
            subject: "",
            level: "",
            creationDateRange: [null, null],
            attempt: ""
        });
    };

    const handleRefreshData = () => {
        fetchInterviews();
    };

    const handleExport = () => {
        const headers = [
            "Teacher Name",
            "Email",
            "Subject (Class)",
            "Status (Mode)",
            "Score",
            "Desired Date/Time",
            "Scheduled Date"
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + filteredTeachers.map(teacher => [
                teacher.name,
                teacher.email,
                teacher.mergedSubject,
                teacher.statusWithMode,
                teacher.score,
                teacher.desiredDateTime,
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

    const getStatusCount = (status) => {
        return interviewData.filter(teacher => teacher.status === status).length;
    };

    const handleViewDetails = (teacher) => {
        setSelectedTeacher(teacher);
        setOpenModal(true);
    };

    const handleOpenSchedule = (teacher) => {
        setSelectedTeacher(teacher);
        setSelectedDateTime(dayjs(teacher.desiredDateTime !== "—" ? teacher.desiredDateTime : null));
        setMeetingLink("");
        setMeetingLinkError(false);
        setScheduleModalOpen(true);
    };

    const handleScheduleInterview = async () => {
        if (!meetingLink.trim()) {
            setMeetingLinkError(true);
            return;
        }

        setActionLoading(true);
        try {
            const response = await updateInterview(
                selectedTeacher.id, 
                {
                    status: "scheduled",
                    time: selectedDateTime.format("YYYY-MM-DD HH:mm:ss"),
                    link: meetingLink,
                }
            );

            setSnackbarMessage("Interview scheduled successfully");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            setScheduleModalOpen(false);

            fetchInterviews();
        } catch (err) {
            setSnackbarMessage("Failed to schedule interview: " + (err.response?.data?.message || err.message || "Unknown error"));
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenReject = (teacher) => {
        setSelectedTeacher(teacher);
        setRejectionReason("");
        setRejectModalOpen(true);
    };

    const handleOpenComplete = (teacher) => {
        setSelectedTeacher(teacher);
        setInterviewScore("");
        setCompleteModalOpen(true);
    };

    const handleRejectInterview = async () => {
        if (!rejectionReason.trim()) {
            setSnackbarMessage("Please provide a rejection reason");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        setActionLoading(true);
        try {
            await updateInterview(
                selectedTeacher.id,
                {
                    status: "rejected",
                    rejectionReason: rejectionReason
                }
            );

            setSnackbarMessage("Interview request rejected");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            setRejectModalOpen(false);

            fetchInterviews();
        } catch (err) {
            setSnackbarMessage("Failed to reject interview: " + (err.response?.data?.message || err.message || "Unknown error"));
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCompleteInterview = async () => {
        const score = Number(interviewScore);
        if (isNaN(score) || score < 0 || score > 10) {
            setSnackbarMessage("Please provide a valid score between 0 and 10");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        setActionLoading(true);
        try {
            await updateInterview(
                selectedTeacher.id,
                {
                    status: "fulfilled",
                    grade: score
                }
            );

            setSnackbarMessage("Interview completed successfully");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            setCompleteModalOpen(false);

            fetchInterviews();
        } catch (err) {
            setSnackbarMessage("Failed to complete interview: " + (err.response?.data?.message || err.message || "Unknown error"));
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setActionLoading(false);
        }
    };

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
                                        label={teacher.statusWithMode}
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
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">Subject & Class</Typography>
                                        <Typography variant="body2" fontWeight={500}>{teacher.mergedSubject}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">Desired Date/Time</Typography>
                                        <Typography variant="body2" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            {teacher.desiredDateTime !== "—" ? (
                                                <>
                                                    <FiCalendar size="14px" />
                                                    {teacher.desiredDateTime}
                                                </>
                                            ) : "—"}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
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
                                                        <FiClock />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reject Request">
                                                    <IconButton
                                                        onClick={() => handleOpenReject(teacher)}
                                                        size="small"
                                                        color="error"
                                                    >
                                                        <FiX />
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

    const renderTableView = () => {
        const columns = [
            {
                field: 'name',
                headerName: 'Teacher Name',
                flex: 1.5,
                minWidth: 200,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                        <Avatar
                            sx={{
                                bgcolor: stringToColor(params.row.name),
                                width: 36,
                                height: 36,
                                fontSize: '14px'
                            }}
                        >
                            {params.row.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={500}>
                                {params.row.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {params.row.email}
                            </Typography>
                        </Box>
                    </Box>
                ),
                sortable: true
            },
            {
                field: 'mergedSubject',
                headerName: 'Subject (Class)',
                flex: 1,
                minWidth: 180,
                renderCell: (params) => (
                    <Typography variant="body2" sx={{ py: 1 }}>
                        {params.value}
                    </Typography>
                ),
                sortable: true
            },
            {
                field: 'desiredDateTime',
                headerName: 'Desired Date/Time',
                flex: 1,
                minWidth: 180,
                renderCell: (params) => (
                    <Typography variant="body2" sx={{ py: 1 }}>
                        {params.value !== "—" ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <FiCalendar size="14px" />
                                {params.value}
                            </Box>
                        ) : "—"}
                    </Typography>
                ),
                sortable: true
            },
            {
                field: 'score',
                headerName: 'Grade',
                width: 120,
                renderCell: (params) => (
                    <Typography
                        variant="body2"
                        fontWeight={params.value !== "Not graded" ? 600 : 400}
                        color={
                            params.value !== "Not graded" ?
                                (Number(params.value) >= 7 ? 'success.main' :
                                    Number(params.value) >= 4 ? 'warning.main' : 'error.main')
                                : 'text.secondary'
                        }
                        sx={{ py: 1 }}
                    >
                        {params.value !== "Not graded" ? `${params.value}/10` : "—"}
                    </Typography>
                ),
                sortable: true
            },
            {
                field: 'statusWithMode',
                headerName: 'Status (Mode)',
                flex: 1,
                minWidth: 160,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                        <Chip
                            label={params.value}
                            size="small"
                            color={
                                params.row.status === "Pending" ? "warning" :
                                    params.row.status === "Scheduled" ? "info" :
                                        params.row.status === "Completed" ? "success" :
                                            "error"
                            }
                            sx={{
                                fontWeight: 500,
                                minWidth: '140px'
                            }}
                        />
                    </Box>
                ),
                sortable: true
            },
            {
                field: 'scheduledDate',
                headerName: 'Schedule',
                flex: 1,
                minWidth: 160,
                renderCell: (params) => (
                    <Typography variant="body2" sx={{ py: 1 }}>
                        {params.value || "—"}
                    </Typography>
                ),
                sortable: true
            },
            {
                field: 'actions',
                headerName: 'Actions',
                type: 'actions',
                width: 180,
                getActions: (params) => {
                    const actions = [
                        <GridActionsCellItem
                            icon={<FiEye />}
                            label="View Details"
                            onClick={() => handleViewDetails(params.row)}
                            color="info"
                            showInMenu={false}
                        />
                    ];

                    if (params.row.apiStatus === "requested") {
                        actions.push(
                            <GridActionsCellItem
                                icon={<FiClock />}
                                label="Schedule Interview"
                                onClick={() => handleOpenSchedule(params.row)}
                                color="primary"
                                showInMenu={false}
                            />,
                            <GridActionsCellItem
                                icon={<FiX />}
                                label="Reject Request"
                                onClick={() => handleOpenReject(params.row)}
                                color="error"
                                showInMenu={false}
                            />
                        );
                    }

                    if (params.row.apiStatus === "scheduled") {
                        actions.push(
                            <GridActionsCellItem
                                icon={<FiCheck />}
                                label="Complete Interview"
                                onClick={() => handleOpenComplete(params.row)}
                                color="success"
                                showInMenu={false}
                            />
                        );

                        if (params.row.link) {
                            actions.push(
                                <GridActionsCellItem
                                    icon={<Button variant="contained" size="small">Join</Button>}
                                    label="Join Meeting"
                                    onClick={() => window.open(params.row.link, "_blank")}
                                    showInMenu={false}
                                />
                            );
                        }
                    }

                    return actions;
                }
            }
        ];

        return (
            <Box sx={{ height: 650, width: '100%' }}>
                <DataGrid
                    rows={filteredTeachers}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: rowsPerPage },
                        },
                        sorting: {
                            sortModel: [{ field: 'desiredDateTime', sort: 'desc' }],
                        },
                    }}
                    pageSizeOptions={[5, 10, 25, 50]}
                    onPaginationModelChange={(model) => {
                        setPage(model.page);
                        setRowsPerPage(model.pageSize);
                    }}
                    disableRowSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-cell': { 
                            py: 1.5,
                            px: 2
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5',
                            fontWeight: 600,
                            py: 2,
                        },
                        '& .MuiDataGrid-row': {
                            '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark' ? 
                                    'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
                            }
                        },
                        '& .MuiDataGrid-virtualScroller': {
                            backgroundColor: theme.palette.mode === 'dark' ? 
                                'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                        },
                        border: 'none',
                        borderRadius: '8px',
                    }}
                    getRowHeight={() => 'auto'}
                    getEstimatedRowHeight={() => 80}
                />
            </Box>
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
                                <Grid item xs={12} sm={6} md={3}>
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
                                <Grid item xs={12} sm={6} md={3}>
                                    <Autocomplete
                                        options={Array.from(new Set(interviewData.map(t => t.classCategory))).filter(Boolean)}
                                        value={filters.classCategory || null}
                                        onChange={(_, newValue) => setFilters({ ...filters, classCategory: newValue || "" })}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Class Category"
                                                size="small"
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Autocomplete
                                        options={Array.from(new Set(interviewData.map(t => t.subjectName))).filter(Boolean)}
                                        value={filters.subject || null}
                                        onChange={(_, newValue) => setFilters({ ...filters, subject: newValue || "" })}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Subject"
                                                size="small"
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Autocomplete
                                        options={Array.from(new Set(interviewData.map(t => t.level))).filter(Boolean)}
                                        value={filters.level || null}
                                        onChange={(_, newValue) => setFilters({ ...filters, level: newValue || "" })}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Level"
                                                size="small"
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Attempt"
                                        variant="outlined"
                                        size="small"
                                        type="number"
                                        value={filters.attempt}
                                        onChange={(e) => setFilters({ ...filters, attempt: e.target.value })}
                                        InputProps={{ inputProps: { min: 1 } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="From Date (Request)"
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
                                <Grid item xs={12} sm={6} md={3}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="To Date (Request)"
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

                                <Grid item xs={12} sm={6} md={3}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="From Date (Created)"
                                            value={filters.creationDateRange[0]}
                                            onChange={(newValue) => setFilters({ ...filters, creationDateRange: [newValue, filters.creationDateRange[1]] })}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: 'small'
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="To Date (Created)"
                                            value={filters.creationDateRange[1]}
                                            onChange={(newValue) => setFilters({ ...filters, creationDateRange: [filters.creationDateRange[0], newValue] })}
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
                            viewMode === 'table' ? renderTableView() : renderCardView()
                        )}
                    </Paper>

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
                                        <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                                        <Typography variant="body1">{selectedTeacher.email}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
                                        <Typography variant="body1">{selectedTeacher.subjectName}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Class Category</Typography>
                                        <Typography variant="body1">{selectedTeacher.classCategory}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Level</Typography>
                                        <Typography variant="body1">{selectedTeacher.level}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Attempt</Typography>
                                        <Typography variant="body1">{selectedTeacher.attempt}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                                        <Typography variant="body1">{selectedTeacher.createdAt}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Status & Mode</Typography>
                                        <Chip
                                            label={selectedTeacher.statusWithMode}
                                            color={
                                                selectedTeacher.status === "Pending" ? "warning" :
                                                    selectedTeacher.status === "Scheduled" ? "info" :
                                                        selectedTeacher.status === "Completed" ? "success" :
                                                            "error"
                                            }
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Desired Date & Time</Typography>
                                        <Typography variant="body1">{selectedTeacher.desiredDateTime}</Typography>
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

                    <Modal
                        open={scheduleModalOpen}
                        onClose={() => setScheduleModalOpen(false)}
                        aria-labelledby="schedule-interview-modal"
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
                                <Typography variant="h6" fontWeight={600}>Schedule Interview</Typography>
                                <IconButton onClick={() => setScheduleModalOpen(false)} size="small">
                                    <FiX />
                                </IconButton>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            {selectedTeacher && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Teacher Name</Typography>
                                        <Typography variant="body1" fontWeight={500}>{selectedTeacher.name}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Subject & Class</Typography>
                                        <Typography variant="body1">{selectedTeacher.mergedSubject}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DateTimePicker
                                                label="Schedule Date & Time"
                                                value={selectedDateTime}
                                                onChange={setSelectedDateTime}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        margin: 'normal',
                                                        required: true
                                                    }
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Interview Meeting Link"
                                            variant="outlined"
                                            value={meetingLink}
                                            onChange={(e) => {
                                                setMeetingLink(e.target.value);
                                                if (e.target.value.trim()) {
                                                    setMeetingLinkError(false);
                                                }
                                            }}
                                            placeholder="Enter meeting URL (Google Meet, Zoom, etc.)"
                                            required
                                            error={meetingLinkError}
                                            helperText={meetingLinkError ? "Meeting link is required" : ""}
                                            margin="normal"
                                            InputProps={{
                                                startAdornment: (
                                                    <FiLink style={{ marginRight: '8px', color: '#999' }} />
                                                ),
                                            }}
                                        />
                                        {meetingLinkError && (
                                            <Alert severity="error" sx={{ mt: 1 }}>
                                                Please provide a meeting link before scheduling the interview.
                                            </Alert>
                                        )}
                                    </Grid>
                                </Grid>
                            )}

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => setScheduleModalOpen(false)}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="contained" 
                                    onClick={handleScheduleInterview}
                                    disabled={actionLoading}
                                    startIcon={actionLoading ? <CircularProgress size={20} /> : <FiClock />}
                                >
                                    {actionLoading ? "Scheduling..." : "Schedule Interview"}
                                </Button>
                            </Box>
                        </Paper>
                    </Modal>

                    <Modal
                        open={completeModalOpen}
                        onClose={() => setCompleteModalOpen(false)}
                        aria-labelledby="complete-interview-modal"
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
                                <Typography variant="h6" fontWeight={600}>Complete Interview</Typography>
                                <IconButton onClick={() => setCompleteModalOpen(false)} size="small">
                                    <FiX />
                                </IconButton>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            {selectedTeacher && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Teacher Name</Typography>
                                        <Typography variant="body1" fontWeight={500}>{selectedTeacher.name}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Subject & Class</Typography>
                                        <Typography variant="body1">{selectedTeacher.mergedSubject}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Scheduled Date & Time</Typography>
                                        <Typography variant="body1">{selectedTeacher.scheduledDate || "—"}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sx={{ mt: 1 }}>
                                        <TextField
                                            fullWidth
                                            label="Interview Score (0-10)"
                                            variant="outlined"
                                            type="number"
                                            InputProps={{ inputProps: { min: 0, max: 10, step: 0.5 } }}
                                            value={interviewScore}
                                            onChange={(e) => setInterviewScore(e.target.value)}
                                            required
                                            placeholder="Enter score between 0 and 10"
                                            helperText="Please provide a score between 0 and 10"
                                        />
                                    </Grid>
                                </Grid>
                            )}

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => setCompleteModalOpen(false)}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="success"
                                    onClick={handleCompleteInterview}
                                    disabled={actionLoading}
                                    startIcon={actionLoading ? <CircularProgress size={20} /> : <FiCheck />}
                                >
                                    {actionLoading ? "Completing..." : "Complete Interview"}
                                </Button>
                            </Box>
                        </Paper>
                    </Modal>

                    <Modal
                        open={rejectModalOpen}
                        onClose={() => setRejectModalOpen(false)}
                        aria-labelledby="reject-interview-modal"
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
                                <Typography variant="h6" fontWeight={600}>Reject Interview Request</Typography>
                                <IconButton onClick={() => setRejectModalOpen(false)} size="small">
                                    <FiX />
                                </IconButton>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            {selectedTeacher && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Teacher Name</Typography>
                                        <Typography variant="body1" fontWeight={500}>{selectedTeacher.name}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Subject & Class</Typography>
                                        <Typography variant="body1">{selectedTeacher.mergedSubject}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sx={{ mt: 1 }}>
                                        <TextField
                                            fullWidth
                                            label="Rejection Reason"
                                            variant="outlined"
                                            multiline
                                            rows={4}
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            required
                                            placeholder="Please explain why this interview request is being rejected"
                                        />
                                    </Grid>
                                </Grid>
                            )}

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => setRejectModalOpen(false)}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="error"
                                    onClick={handleRejectInterview}
                                    disabled={actionLoading}
                                    startIcon={actionLoading ? <CircularProgress size={20} /> : <FiThumbsDown />}
                                >
                                    {actionLoading ? "Rejecting..." : "Reject Interview"}
                                </Button>
                            </Box>
                        </Paper>
                    </Modal>

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
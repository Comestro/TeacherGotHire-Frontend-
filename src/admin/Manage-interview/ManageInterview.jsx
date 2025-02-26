import React, { useState, useEffect } from "react";
import {
    Box, Container, Typography, Grid, Paper, TextField, Button, Autocomplete,
    FormControl, InputLabel, Select, MenuItem, Modal, Chip, IconButton, Switch,
    ThemeProvider, createTheme, CssBaseline, TextareaAutosize, CircularProgress, Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { FiDownload, FiRefreshCw, FiEye, FiCalendar, FiX, FiThumbsDown, FiCheck } from "react-icons/fi";
import Layout from "../Admin/Layout";
import { getInterview, updateInterview } from "../../services/adminInterviewApi";

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
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [selectedDateTime, setSelectedDateTime] = useState(dayjs());
    const [rejectionReason, setRejectionReason] = useState("");
    const [interviewScore, setInterviewScore] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const theme = createTheme({
        palette: {
            mode: darkMode ? "dark" : "light"
        },
        components: {
            MuiDataGrid: {
                styleOverrides: {
                    root: {
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: darkMode ? "#424242" : "#f5f5f5",
                        },
                        "& .MuiDataGrid-virtualScroller": {
                            minHeight: "200px",
                            overflowX: 'auto'
                        },
                        "& .MuiDataGrid-cell": {
                            display: 'flex',
                            alignItems: 'center',
                        }
                    }
                }
            }
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getInterview();
                const data = response.map(item => ({
                    id: item.id,
                    name: `${item.user.Fname} ${item.user.Lname}`,
                    exam: `Subject ${item.subject}`,
                    score: item.grade,
                    mode: item.class_category === 1 ? "Online" : "Offline",
                    requestedDate: dayjs(item.time).format("YYYY-MM-DD"),
                    requestedTime: dayjs(item.time).format("HH:mm"),
                    status: item.status ? "Scheduled" : "Pending",
                    scheduledDate: item.status ? dayjs(item.time).format("YYYY-MM-DD HH:mm") : null,
                    rejectionReason: null
                }));
                setFilteredTeachers(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        handleFilterChange();
    }, [filters]);

    const columns = [
        { field: "name", headerName: "Teacher Name", flex: 1, minWidth: 150 },
        { field: "exam", headerName: "Qualified Exam", flex: 1, minWidth: 150 },
        {
            field: "mode",
            headerName: "Interview Mode",
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === "Online" ? "primary" : "secondary"}
                    variant="outlined"
                    size="small"
                />
            )
        },
        { field: "requestedDate", headerName: "Requested Date", flex: 1, minWidth: 150 },
        { field: "requestedTime", headerName: "Requested Time", flex: 1, minWidth: 150 },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            minWidth: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={
                        params.value === "Pending" ? "warning" :
                            params.value === "Scheduled" ? "success" :
                                params.value === "Rejected" ? "error" : "default"
                    }
                />
            )
        },
        { field: "scheduledDate", headerName: "Scheduled Date", flex: 1, minWidth: 150 },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={() => handleViewDetails(params.row)} size="small">
                        <FiEye />
                    </IconButton>
                    {params.row.status === "Pending" && (
                        <>
                            <IconButton onClick={() => handleOpenSchedule(params.row)} size="small">
                                <FiCalendar />
                            </IconButton>
                            <IconButton onClick={() => handleOpenReject(params.row)} size="small">
                                <FiThumbsDown />
                            </IconButton>
                        </>
                    )}
                    {params.row.status === "Scheduled" && (
                        <IconButton onClick={() => handleOpenComplete(params.row)} size="small">
                            <FiCheck />
                        </IconButton>
                    )}
                </Box>
            )
        }
    ];

    const handleViewDetails = (teacher) => {
        setSelectedTeacher(teacher);
        setOpenModal(true);
    };

    const handleOpenSchedule = (teacher) => {
        setSelectedTeacher(teacher);
        setScheduleModalOpen(true);
    };

    const handleScheduleInterview = () => {
        const updatedTeachers = filteredTeachers.map(t =>
            t.id === selectedTeacher.id ? {
                ...t,
                status: "Scheduled",
                scheduledDate: selectedDateTime.format("YYYY-MM-DD HH:mm"),
                rejectionReason: null
            } : t
        );
        setFilteredTeachers(updatedTeachers);
        setScheduleModalOpen(false);
    };

    const handleOpenReject = (teacher) => {
        setSelectedTeacher(teacher);
        setRejectModalOpen(true);
    };

    const handleRejectInterview = () => {
        const updatedTeachers = filteredTeachers.map(t =>
            t.id === selectedTeacher.id ? {
                ...t,
                status: "Rejected",
                rejectionReason: rejectionReason,
                scheduledDate: null
            } : t
        );
        setFilteredTeachers(updatedTeachers);
        setRejectModalOpen(false);
        setRejectionReason("");
    };

    const handleOpenComplete = (teacher) => {
        setSelectedTeacher(teacher);
        setCompleteModalOpen(true);
    };

    const handleCompleteInterview = () => {
        const updatedTeachers = filteredTeachers.map(t =>
            t.id === selectedTeacher.id ? {
                ...t,
                status: "Completed",
                score: interviewScore
            } : t
        );
        setFilteredTeachers(updatedTeachers);
        setCompleteModalOpen(false);
        setInterviewScore("");
    };

    const handleResetFilters = () => {
        setFilters({
            status: "",
            teacherName: "",
            dateRange: [null, null],
            searchTerm: ""
        });
        setFilteredTeachers(filteredTeachers);
    };

    const handleFilterChange = () => {
        let filtered = filteredTeachers.filter(teacher => {
            const matchesStatus = !filters.status || teacher.status === filters.status;
            const matchesName = !filters.teacherName ||
                teacher.name.toLowerCase().includes(filters.teacherName.toLowerCase());
            const matchesSearch = !filters.searchTerm ||
                Object.values(teacher).some(value =>
                    String(value).toLowerCase().includes(filters.searchTerm.toLowerCase()));
            const matchesDate = !filters.dateRange[0] || !filters.dateRange[1] ||
                dayjs(teacher.requestedDate).isBetween(filters.dateRange[0], filters.dateRange[1], null, '[]');

            return matchesStatus && matchesName && matchesSearch && matchesDate;
        });

        setFilteredTeachers(filtered);
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + filteredTeachers.map(teacher => Object.values(teacher).join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "teacher_interviews.csv");
        document.body.appendChild(link);
        link.click();
    };

    if (loading) {
        return (
            <Layout>
                <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Container>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Alert severity="error">{error}</Alert>
                </Container>
            </Layout>
        );
    }

    return (
        <Layout>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Container maxWidth="lg" sx={{
                    py: 4,
                    overflowX: 'hidden',
                    maxWidth: '100%',
                    '& .MuiDataGrid-root': {
                        overflowX: 'auto'
                    }
                }}>
                    <Box sx={{
                        mb: 4,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <Typography variant="h4" component="h1" sx={{
                            fontSize: { xs: '1.5rem', sm: '2rem' },
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            Manage Teacher Interview Requests
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">Dark Mode</Typography>
                            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                        </Box>
                    </Box>

                    {/* Filter Box */}
                    <Paper sx={{
                        p: 2,
                        mb: 3,
                        borderRadius: 2,
                        boxShadow: 3,
                        overflow: 'hidden'
                    }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <TextField
                                    fullWidth
                                    label="Search"
                                    variant="outlined"
                                    size="small"
                                    value={filters.searchTerm}
                                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={2}>
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
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <Autocomplete
                                    options={filteredTeachers.map(t => t.name)}
                                    value={filters.teacherName}
                                    onChange={(_, newValue) => setFilters({ ...filters, teacherName: newValue })}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Teacher Name"
                                            size="small"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={2}>
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
                            <Grid item xs={12} sm={6} md={4} lg={2}>
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
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <Button
                                    startIcon={<FiRefreshCw />}
                                    variant="outlined"
                                    onClick={handleResetFilters}
                                    fullWidth
                                    size="small"
                                >
                                    Reset
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <Button
                                    startIcon={<FiDownload />}
                                    variant="contained"
                                    onClick={handleExport}
                                    fullWidth
                                    size="small"
                                >
                                    Export
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Data Table */}
                    <Paper sx={{
                        width: '100%',
                        overflow: 'hidden',
                        borderRadius: 2,
                        boxShadow: 3
                    }}>
                        <DataGrid
                            rows={filteredTeachers}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 10 }
                                }
                            }}
                            pageSizeOptions={[10]}
                            checkboxSelection
                            disableRowSelectionOnClick
                            autoHeight
                            sx={{
                                '& .MuiDataGrid-cellContent': {
                                    whiteSpace: 'normal',
                                    lineHeight: '1.2',
                                    maxHeight: '3.6em',
                                    display: 'flex',
                                    alignItems: 'center'
                                }
                            }}
                        />
                    </Paper>

                    {/* Modals */}
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
                            width: { xs: '90%', sm: 400 },
                            p: 3,
                            borderRadius: 2
                        }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6">Teacher Details</Typography>
                                <IconButton onClick={() => setOpenModal(false)} size="small">
                                    <FiX />
                                </IconButton>
                            </Box>
                            {selectedTeacher && (
                                <Box>
                                    <Typography><strong>Name:</strong> {selectedTeacher.name}</Typography>
                                    <Typography><strong>Exam:</strong> {selectedTeacher.exam}</Typography>
                                    <Typography><strong>Score:</strong> {selectedTeacher.score}</Typography>
                                    <Typography><strong>Mode:</strong> {selectedTeacher.mode}</Typography>
                                    <Typography><strong>Requested Date:</strong> {selectedTeacher.requestedDate}</Typography>
                                    <Typography><strong>Requested Time:</strong> {selectedTeacher.requestedTime}</Typography>
                                    <Typography><strong>Status:</strong> {selectedTeacher.status}</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Modal>

                    {/* Schedule Modal */}
                    <Modal open={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)}>
                        <Paper sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { xs: '90%', sm: 400 },
                            p: 3,
                            borderRadius: 2
                        }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Schedule Interview</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    label="Select Date & Time"
                                    value={selectedDateTime}
                                    onChange={(newValue) => setSelectedDateTime(newValue)}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </LocalizationProvider>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button onClick={() => setScheduleModalOpen(false)}>Cancel</Button>
                                <Button variant="contained" onClick={handleScheduleInterview}>Confirm</Button>
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
                            width: { xs: '90%', sm: 400 },
                            p: 3,
                            borderRadius: 2
                        }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Reject Interview Request</Typography>
                            <TextareaAutosize
                                minRows={3}
                                placeholder="Enter rejection reason"
                                style={{ width: '100%', marginBottom: '1rem' }}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button onClick={() => setRejectModalOpen(false)}>Cancel</Button>
                                <Button variant="contained" color="error" onClick={handleRejectInterview}>Confirm Rejection</Button>
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
                            width: { xs: '90%', sm: 400 },
                            p: 3,
                            borderRadius: 2
                        }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Complete Interview</Typography>
                            <TextField
                                fullWidth
                                label="Interview Score"
                                type="number"
                                value={interviewScore}
                                onChange={(e) => setInterviewScore(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button onClick={() => setCompleteModalOpen(false)}>Cancel</Button>
                                <Button variant="contained" onClick={handleCompleteInterview}>Mark Completed</Button>
                            </Box>
                        </Paper>
                    </Modal>

                </Container>
            </ThemeProvider>
        </Layout>
    );
};

export default InterviewManagement;
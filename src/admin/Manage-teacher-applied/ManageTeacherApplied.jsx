import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Modal,
    Paper,
    Select,
    TextField,
    Typography,
    useTheme,
    useMediaQuery,
    CircularProgress,
    Alert,
    Snackbar,
    Skeleton,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Search,
    FilterList,
    Visibility,
    Close as CloseIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Layout from '../Admin/Layout';
import { getJobApplied } from '../../services/adminManageJobApplied';
import { getTeacherjobType } from '../../features/jobProfileSlice';
import { getClassCategory } from '../../services/adminClassCategoryApi';

// Styled components
const StatusChip = styled(Chip)(({ theme, status }) => ({
    fontWeight: 'bold',
    variant: 'outlined',
    border: '1px solid',
    ...(status === 'Approved' && {
        backgroundColor: 'transparent',
        color: theme.palette.success.main,
        borderColor: theme.palette.success.main,
    }),
    ...(status === 'Pending' && {
        backgroundColor: 'transparent',
        color: theme.palette.warning.main,
        borderColor: theme.palette.warning.main,
    }),
    ...(status === 'Rejected' && {
        backgroundColor: 'transparent',
        color: theme.palette.error.main,
        borderColor: theme.palette.error.main,
    }),
}));

const VerificationBadge = styled(Chip)(({ theme, verified }) => ({
    fontWeight: 'bold',
    variant: 'outlined',
    border: '1px solid',
    ...(verified && {
        backgroundColor: 'transparent',
        color: theme.palette.success.main,
        borderColor: theme.palette.success.main,
    }),
    ...(!verified && {
        backgroundColor: 'transparent',
        color: theme.palette.grey[700],
        borderColor: theme.palette.grey[400],
    }),
}));

const ManageTeacherApplied = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        classCategory: '',
        jobType: '',
        status: '',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });
    const [classCategoryOptions, setClassCategoryOptions] = useState([]);
    const [jobTypeOptions, setJobTypeOptions] = useState([]);
    const statusOptions = ['Pending', 'Approved', 'Rejected'];

    // Fetch class categories and job types
    const fetchClassCategories = async () => {
        try {
            const response = await getClassCategory();
            setClassCategoryOptions(response.map((category) => category.name));
        } catch (err) {
            
        }
    };
    // Fetch job types
    const fetchJobTypes = async () => {
        try {
            const response = await getTeacherjobType();
            setJobTypeOptions(response.map((jobType) => jobType.teacher_job_name));
        } catch (err) {
            
        }
    };
    useEffect(() => {
        // fetch class categories
        fetchClassCategories();
        // fetch job types
        fetchJobTypes();
    }, []);

    // Fetch job applications data
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                const response = await getJobApplied();
                // Format the data to match the expected structure
                const formattedData = Array.isArray(response) ? response.map(app => ({
                    id: app.id,
                    teacherName: `${app.user.Fname} ${app.user.Lname}`,
                    teacherEmail: app.user.email,
                    verified: app.user.is_verified,
                    classCategory: app.class_category?.length ? app.class_category[0].name : 'N/A',
                    subjects: app.subject?.map(sub => sub.subject_name) || [],
                    jobType: app.teacher_job_type?.length ? app.teacher_job_type[0].teacher_job_name : 'N/A',
                    status: app.status ? 'Approved' : 'Pending',
                    appliedDate: new Date(app.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })
                })) : [];

                setApplications(formattedData);
                setError(null);
            } catch (err) {
                
                setError("Failed to load teacher applications. Please try again later.");
                setSnackbar({
                    open: true,
                    message: "Failed to load teacher applications",
                    severity: "error",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Handle filtering and search
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setPage(0);
    };

    const handleFilterChange = (event) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.value,
        });
        setPage(0);
    };

    const resetFilters = () => {
        setFilters({
            classCategory: '',
            jobType: '',
            status: '',
        });
        setSearchQuery('');
        setPage(0);
    };

    // Filter and search applications
    const filteredApplications = applications.filter((app) => {
        const matchesSearch =
            app.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.teacherEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            '';

        const matchesClassCategory = filters.classCategory
            ? app.classCategory === filters.classCategory
            : true;

        const matchesJobType = filters.jobType ? app.jobType === filters.jobType : true;

        const matchesStatus = filters.status ? app.status === filters.status : true;

        return matchesSearch && matchesClassCategory && matchesJobType && matchesStatus;
    });

    // Handle details modal
    const handleOpenDetails = (application) => {
        setSelectedApplication(application);
        setOpenDetailModal(true);
    };

    const handleCloseDetails = () => {
        setOpenDetailModal(false);
        setSelectedApplication(null);
    };

    // Handle snackbar close
    const handleSnackbarClose = () => {
        setSnackbar({
            ...snackbar,
            open: false,
        });
    };

    // Loading skeletons for table
    const renderSkeletons = () => {
        const skeletonRows = Array(rowsPerPage).fill(0);
        return skeletonRows.map((_, index) => (
            <Skeleton key={`skeleton-${index}`} variant="text" width="100%" height={24} />
        ));
    };

    // Replace the Applications Table section with DataGrid
    const renderApplicationsTable = () => {
        const columns = [
            {
                field: 'teacherInfo',
                headerName: 'Teacher Info',
                flex: 1.5,
                minWidth: 200,
                sortable: true,
                filterable: true,
                renderCell: (params) => (
                    <Box>
                        <Typography variant="body1" fontWeight="medium">
                            {params.row.teacherName}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: { xs: '150px', sm: '200px' },
                            }}
                        >
                            {params.row.teacherEmail}
                        </Typography>
                    </Box>
                ),
            },
            {
                field: 'appliedDate',
                headerName: 'Applied Date',
                flex: 1,
                minWidth: 130,
                sortable: true,
                filterable: true,
                hide: isMobile,
            },
            {
                field: 'classCategory',
                headerName: 'Class Category',
                flex: 1,
                minWidth: 150,
                sortable: true,
                filterable: true,
                hide: isMobile || isTablet,
            },
            {
                field: 'subjects',
                headerName: 'Subjects',
                flex: 1.5,
                minWidth: 200,
                sortable: false,
                filterable: false,
                hide: isMobile || isTablet,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {params.row.subjects.map((subject) => (
                            <Chip
                                key={subject}
                                label={subject}
                                size="small"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                ),
            },
            {
                field: 'jobType',
                headerName: 'Job Type',
                flex: 1,
                minWidth: 130,
                sortable: true,
                filterable: true,
                hide: isMobile,
            },
            {
                field: 'status',
                headerName: 'Status',
                flex: 0.8,
                minWidth: 120,
                sortable: true,
                filterable: true,
                renderCell: (params) => (
                    <StatusChip
                        label={params.row.status}
                        status={params.row.status}
                        size="small"
                    />
                ),
            },
            {
                field: 'actions',
                headerName: 'View',
                type: 'actions',
                width: 80,
                getActions: (params) => [
                    <GridActionsCellItem
                        icon={<Visibility fontSize="small" />}
                        onClick={() => handleOpenDetails(params.row)}
                        label="View Details"
                        color="primary"
                    />,
                ],
            },
        ];

        // Prepare rows with a proper id field for DataGrid
        const rows = filteredApplications.map(app => ({
            id: app.id,
            ...app,
            // Add a composite field for teacher info display
            teacherInfo: `${app.teacherName} (${app.teacherEmail})`
        }));

        return (
            <Box sx={{ height: 450, width: '100%' }}>
                <DataGrid
                    rows={applications}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    checkboxSelection={false}
                    disableSelectionOnClick
                    autoHeight
                    getRowId={(row) => row.id}
                    density={isMobile ? "compact" : "standard"}
                    components={{
                        NoRowsOverlay: () => (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 2 }}>
                                <Typography variant="h6" color="text.secondary">No Applications Found</Typography>
                                <Typography variant="body2" color="text.secondary">Try adjusting your filters</Typography>
                            </Box>
                        ),
                    }}
                    sx={{
                        borderRadius: 2,
                        boxShadow: 1,
                        border: 'none',
                        '& .MuiDataGrid-cell': {
                            padding: '16px',
                            whiteSpace: 'normal',
                            wordWrap: 'break-word',
                            lineHeight: '1.3',
                            '&:focus': { outline: 'none' }
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5',
                            fontWeight: 600
                        },
                        '& .MuiDataGrid-virtualScroller': {
                            backgroundColor: theme.palette.mode === 'dark' ? 
                                'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.01)'
                        },
                        '& .MuiDataGrid-row:nth-of-type(even)': {
                            backgroundColor: theme.palette.mode === 'dark' ? 
                                'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.02)'
                        },
                        '& .MuiDataGrid-footerContainer': {
                            backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5',
                            borderTop: '1px solid',
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        '& .MuiTablePagination-root': {
                            padding: '8px 16px'
                        },
                        minHeight: '400px',
                        height: '100%',
                    }}
                />
            </Box>
        );
    };

    return (
        <Layout>
            <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                {/* Page Header */}
                <Typography
                    variant={isMobile ? "h5" : "h4"}
                    gutterBottom
                    fontWeight="bold"
                    color="primary"
                    sx={{
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                    }}
                >
                    Teacher Job Applications
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 3 }} color="text.secondary">
                    View and manage job applications submitted by teachers
                </Typography>

                {/* Search and Filters */}
                <Paper
                    sx={{
                        p: { xs: 1.5, sm: 2, md: 3 },
                        mb: 3,
                        borderRadius: { xs: 1, sm: 2 },
                    }}
                    elevation={1}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                placeholder="Search by teacher name or email"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Box
                                display="flex"
                                gap={2}
                                flexDirection={isMobile ? "column" : "row"}
                            >
                                <Button
                                    variant="outlined"
                                    startIcon={<FilterList />}
                                    onClick={() => setShowFilters(!showFilters)}
                                    fullWidth
                                    sx={{
                                        textTransform: 'none',
                                    }}
                                >
                                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                                </Button>
                                {showFilters && (
                                    <Button
                                        variant="text"
                                        onClick={resetFilters}
                                        sx={{
                                            textTransform: 'none',
                                        }}
                                        fullWidth={isMobile}
                                    >
                                        Reset Filters
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>

                    {showFilters && (
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth variant="outlined" size="small">
                                    <InputLabel>Class Category</InputLabel>
                                    <Select
                                        name="classCategory"
                                        value={filters.classCategory}
                                        onChange={handleFilterChange}
                                        label="Class Category"
                                    >
                                        <MenuItem value="">All Categories</MenuItem>
                                        {classCategoryOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth variant="outlined" size="small">
                                    <InputLabel>Job Type</InputLabel>
                                    <Select
                                        name="jobType"
                                        value={filters.jobType}
                                        onChange={handleFilterChange}
                                        label="Job Type"
                                    >
                                        <MenuItem value="">All Job Types</MenuItem>
                                        {jobTypeOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth variant="outlined" size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        name="status"
                                        value={filters.status}
                                        onChange={handleFilterChange}
                                        label="Status"
                                    >
                                        <MenuItem value="">All Statuses</MenuItem>
                                        {statusOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    )}
                </Paper>

                {/* Applications Stats Summary */}
                {!loading && !error && (
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: { xs: 1, sm: 2 },
                            mb: 3
                        }}
                    >
                        <Paper
                            sx={{
                                p: { xs: 1.5, sm: 2 },
                                borderRadius: 1,
                                flexGrow: 1,
                                minWidth: { xs: '100%', sm: '30%', md: '22%' }
                            }}
                        >
                            <Typography variant="subtitle2" color="text.secondary">Total Applications</Typography>
                            <Typography variant="h5" fontWeight="bold">{applications.length}</Typography>
                        </Paper>

                        <Paper
                            sx={{
                                p: { xs: 1.5, sm: 2 },
                                borderRadius: 1,
                                flexGrow: 1,
                                minWidth: { xs: '100%', sm: '30%', md: '22%' },
                                borderLeft: '4px solid',
                                borderColor: 'warning.main'
                            }}
                        >
                            <Typography variant="subtitle2" color="text.secondary">Pending</Typography>
                            <Typography variant="h5" fontWeight="bold" color="warning.main">
                                {applications.filter(app => app.status === 'Pending').length}
                            </Typography>
                        </Paper>

                        <Paper
                            sx={{
                                p: { xs: 1.5, sm: 2 },
                                borderRadius: 1,
                                flexGrow: 1,
                                minWidth: { xs: '100%', sm: '30%', md: '22%' },
                                borderLeft: '4px solid',
                                borderColor: 'success.main'
                            }}
                        >
                            <Typography variant="subtitle2" color="text.secondary">Approved</Typography>
                            <Typography variant="h5" fontWeight="bold" color="success.main">
                                {applications.filter(app => app.status === 'Approved').length}
                            </Typography>
                        </Paper>

                        <Paper
                            sx={{
                                p: { xs: 1.5, sm: 2 },
                                borderRadius: 1,
                                flexGrow: 1,
                                minWidth: { xs: '100%', sm: '30%', md: '22%' },
                                borderLeft: '4px solid',
                                borderColor: 'error.main'
                            }}
                        >
                            <Typography variant="subtitle2" color="text.secondary">Rejected</Typography>
                            <Typography variant="h5" fontWeight="bold" color="error.main">
                                {applications.filter(app => app.status === 'Rejected').length}
                            </Typography>
                        </Paper>
                    </Box>
                )}

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Applications Table - Replace with DataGrid */}
                <Paper
                    sx={{
                        width: '100%',
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                    }}
                    elevation={0}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            px: { xs: 1.5, sm: 2 },
                            py: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            fontWeight="600"
                            sx={{
                                fontSize: { xs: '1rem', md: '1.1rem' }
                            }}
                        >
                            Teacher Applications {!loading && `(${filteredApplications.length})`}
                        </Typography>
                    </Box>

                    {/* Replace the TableContainer with the DataGrid component */}
                    {renderApplicationsTable()}
                </Paper>

                {/* Application Detail Modal */}
                {selectedApplication && (
                    <Modal
                        open={openDetailModal}
                        onClose={handleCloseDetails}
                        aria-labelledby="application-details-modal"
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: { xs: '95%', sm: '80%', md: 600 },
                                maxHeight: '90vh',
                                bgcolor: 'background.paper',
                                boxShadow: 24,
                                p: { xs: 2, sm: 3, md: 4 },
                                borderRadius: 2,
                                overflowY: 'auto',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 2
                                }}
                            >
                                <Typography variant="h6" component="h2" fontWeight="bold">
                                    Application Details
                                </Typography>
                                <IconButton
                                    onClick={handleCloseDetails}
                                    size="small"
                                    sx={{ ml: 2 }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            {/* Teacher Info */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                    Teacher Information
                                </Typography>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Full Name
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {selectedApplication.teacherName}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Email
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {selectedApplication.teacherEmail}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sx={{ mt: 1 }}>
                                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                            <Typography variant="body2" color="text.secondary">
                                                Verification Status:
                                            </Typography>
                                            <VerificationBadge
                                                label={selectedApplication.verified ? 'Verified' : 'Not Verified'}
                                                verified={selectedApplication.verified}
                                                size="small"
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Application Details */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                    Job Application Details
                                </Typography>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Applied For
                                        </Typography>
                                        <Typography variant="body1">{selectedApplication.jobType}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Application Date
                                        </Typography>
                                        <Typography variant="body1">{selectedApplication.appliedDate}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Class Category
                                        </Typography>
                                        <Typography variant="body1">{selectedApplication.classCategory}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Current Status
                                        </Typography>
                                        <StatusChip
                                            label={selectedApplication.status}
                                            status={selectedApplication.status}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            Subjects Applied For
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                            {selectedApplication.subjects.map((subject) => (
                                                <Chip
                                                    key={subject}
                                                    label={subject}
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Admin Notes
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            placeholder="Add notes about this application"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Action Buttons */}
                            <Box
                                sx={{
                                    mt: 4,
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    gap: 2,
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={handleCloseDetails}
                                    sx={{ textTransform: 'none' }}
                                    fullWidth={isMobile}
                                >
                                    Close
                                </Button>
                            </Box>
                        </Box>
                    </Modal>
                )}

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Layout>
    );
};

export default ManageTeacherApplied;
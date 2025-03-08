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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Search,
    FilterList,
    Visibility,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Layout from '../Admin/Layout';
import { getJobApplied } from '../../services/adminManageJobApplied';

// Mock data for demonstration
const mockApplications = [
    {
        id: 1,
        teacherName: 'Komal Raj',
        teacherEmail: 'ks@gmail.com',
        appliedDate: '26-02-2025',
        classCategory: '1 to 5',
        subjects: ['Maths', 'Science', 'Hindi'],
        jobType: 'Tutor',
        status: 'Pending',
        verified: true,
    },
    {
        id: 2,
        teacherName: 'Rahul Singh',
        teacherEmail: 'rahul.s@gmail.com',
        appliedDate: '25-02-2025',
        classCategory: '6 to 8',
        subjects: ['Physics', 'Chemistry'],
        jobType: 'School Teacher',
        status: 'Approved',
        verified: true,
    },
    {
        id: 3,
        teacherName: 'Priya Sharma',
        teacherEmail: 'priya.sharma@gmail.com',
        appliedDate: '24-02-2025',
        classCategory: '9 to 12',
        subjects: ['Biology', 'Chemistry'],
        jobType: 'Tutor',
        status: 'Rejected',
        verified: false,
    },
    {
        id: 4,
        teacherName: 'Amit Kumar',
        teacherEmail: 'amit.k@gmail.com',
        appliedDate: '23-02-2025',
        classCategory: '1 to 5',
        subjects: ['English', 'Social Studies'],
        jobType: 'School Teacher',
        status: 'Pending',
        verified: true,
    },
    {
        id: 5,
        teacherName: 'Neha Gupta',
        teacherEmail: 'neha.g@gmail.com',
        appliedDate: '22-02-2025',
        classCategory: '6 to 8',
        subjects: ['Maths', 'Computer Science'],
        jobType: 'Tutor',
        status: 'Approved',
        verified: true,
    },
];

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
    
    const [applications, setApplications] = useState(mockApplications);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        classCategory: '',
        jobType: '',
        status: '',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // Filter options
    const classCategoryOptions = ['1 to 5', '6 to 8', '9 to 12'];
    const jobTypeOptions = ['Tutor', 'School Teacher', 'Online Tutor'];
    const statusOptions = ['Pending', 'Approved', 'Rejected'];

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
            app.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.teacherEmail.toLowerCase().includes(searchQuery.toLowerCase());

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

    // Handle application status change
    const handleStatusChange = (id, newStatus) => {
        if (newStatus === 'Rejected') {
            setSelectedApplication(applications.find(app => app.id === id));
            setOpenRejectDialog(true);
            return;
        }

        const updatedApplications = applications.map((app) =>
            app.id === id ? { ...app, status: newStatus } : app
        );
        setApplications(updatedApplications);
    };

    const handleReject = () => {
        const updatedApplications = applications.map((app) =>
            app.id === selectedApplication.id ? { ...app, status: 'Rejected' } : app
        );
        setApplications(updatedApplications);
        setOpenRejectDialog(false);
        setRejectionReason('');
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
                <Paper sx={{ p: 2, mb: 3 }}>
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
                                sx={{ height: '100%' }}
                            />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Box display="flex" gap={2} height="100%">
                                <Button
                                    variant="outlined"
                                    startIcon={<FilterList />}
                                    onClick={() => setShowFilters(!showFilters)}
                                    fullWidth
                                    sx={{ 
                                        height: '100%',
                                        textTransform: 'none'
                                    }}
                                >
                                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                                </Button>
                                {showFilters && (
                                    <Button 
                                        variant="text" 
                                        onClick={resetFilters}
                                        sx={{ 
                                            height: '100%',
                                            textTransform: 'none'
                                        }}
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

                {/* Applications Table */}
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
                    <TableContainer sx={{ maxHeight: 440 }}>
                        <Table stickyHeader aria-label="Applications table" size={isMobile ? "small" : "medium"}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'background.default' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Teacher Info</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Applied Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Class Category</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Subjects</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Job Type</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>View</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredApplications
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((application) => (
                                        <TableRow 
                                            hover 
                                            key={application.id}
                                            sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}
                                        >
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {application.teacherName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {application.teacherEmail}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{application.appliedDate}</TableCell>
                                            <TableCell>{application.classCategory}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {application.subjects.map((subject) => (
                                                        <Chip
                                                            key={subject}
                                                            label={subject}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{application.jobType}</TableCell>
                                            <TableCell>
                                                <StatusChip
                                                    label={application.status}
                                                    status={application.status}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleOpenDetails(application)}
                                                    size="small"
                                                >
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                {filteredApplications.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography variant="body1" py={3}>
                                                No applications found matching the filters
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredApplications.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
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
                                width: { xs: '90%', sm: 600 },
                                maxHeight: '90vh',
                                bgcolor: 'background.paper',
                                boxShadow: 24,
                                p: 4,
                                borderRadius: 2,
                                overflowY: 'auto',
                            }}
                        >
                            <Typography variant="h6" component="h2" fontWeight="bold" mb={2}>
                                Application Details
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            {/* Teacher Info */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                    Teacher Information
                                </Typography>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Full Name
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {selectedApplication.teacherName}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Email
                                        </Typography>
                                        <Typography variant="body1">{selectedApplication.teacherEmail}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sx={{ mt: 1 }}>
                                        <Box display="flex" alignItems="center" gap={1}>
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
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Applied For
                                        </Typography>
                                        <Typography variant="body1">{selectedApplication.jobType}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Application Date
                                        </Typography>
                                        <Typography variant="body1">{selectedApplication.appliedDate}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Class Category
                                        </Typography>
                                        <Typography variant="body1">{selectedApplication.classCategory}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
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
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button 
                                    variant="outlined" 
                                    onClick={handleCloseDetails}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Close
                                </Button>
                            </Box>
                        </Box>
                    </Modal>
                )}
            </Box>
        </Layout>
    );
};

export default ManageTeacherApplied;
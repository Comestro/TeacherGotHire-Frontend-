import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
    Button, TextField, MenuItem, Select, FormControl, InputLabel,
    Dialog, DialogActions, DialogContent, DialogTitle, Drawer,
    useMediaQuery, Grid, Divider, Tooltip, Snackbar, Alert,
    CircularProgress, InputAdornment, SwipeableDrawer, Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    Search, FilterList, Sort, MoreVert, Check, Close,
    KeyboardArrowDown, KeyboardArrowUp, CalendarToday,
    Delete, Edit, Visibility, ExpandMore, Refresh, GetApp
} from '@mui/icons-material';
import moment from 'moment';
import Layout from '../Admin/Layout';
import { getQuestionReport, updateQuestionReport, deleteQuestionReport, patchQuestionReport } from '../../services/adminManageQuestionReport';

// Helper function to safely format dates
const safeFormatDate = (dateValue, format = 'MMM DD, YYYY') => {
    if (!dateValue) return '—';
    try {
        return moment(dateValue).format(format);
    } catch (error) {
        
        return '—';
    }
};

// Status color mapping based on API response format
const statusColors = {
    true: '#f9a825',
    false: '#388e3c',
};

// Status labels mapping for display
const statusLabels = {
    true: 'Open',
    false: 'Done'
};


// Issue type mapping for better display
const issueTypeMapping = {
    "question wrong": "Question is incorrect",
    "incorrect answer": "Answer is incorrect",
    "offensive content": "Offensive content",
    "duplicate question": "Duplicate question",
    "typo error": "Typographical error",
    "other": "Other issue"
};

const ManageQuestionReport = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State variables
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [reasonFilter, setReasonFilter] = useState('all');
    const [dateRange, setDateRange] = useState([null, null]);
    const [sortOrder, setSortOrder] = useState('newest');
    const [selectedReport, setSelectedReport] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filtersOpen, setFiltersOpen] = useState(!isMobile);
    const [adminNotes, setAdminNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Handle closing snackbar
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // Show snackbar message
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    // Fetch reports from API
    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await getQuestionReport();
            setReports(data || []);  // Changed from response.data to just data
            setError(null);
            showSnackbar("Reports fetched successfully", "success");
        } catch (err) {
            
            const errorMessage = err.response?.data?.detail || 'Failed to fetch reports';
            setError(errorMessage);
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // Handle opening detail view
    const handleViewDetails = (report) => {
        setSelectedReport(report);
        setAdminNotes(''); // Reset notes when opening a new report
        setDetailsOpen(true);
    };

    // Handle closing detail view
    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedReport(null);
    };

    // Handle status change
    const handleStatusChange = async (reportId, newStatus) => {
        if (!reportId) return;

        const reportToUpdate = reports.find(r => r.id === reportId);
        if (!reportToUpdate) {
            showSnackbar("Report not found", "error");
            return;
        }

        setProcessing(true);
        try {
            // Convert status text to the correct boolean format for API
            const statusValue = newStatus === 'Done' ? false : true;

            // Include the required fields from the original report
            const updateData = {
                status: statusValue,
                question: reportToUpdate.question?.id,
                issue_type: reportToUpdate.issue_type?.map(issue => issue.id)
            };

            await updateQuestionReport(reportId, updateData);

            // Update local state
            setReports(reports.map(report =>
                report.id === reportId ? { ...report, status: statusValue } : report
            ));

            showSnackbar(`Report has been marked as ${newStatus} successfully`);
            handleCloseDetails();
        } catch (err) {
            
            const errorMessage = err.response?.data?.detail ||
                (err.response?.data ? JSON.stringify(err.response.data) : `Failed to update report status`);
            showSnackbar(errorMessage, 'error');
        } finally {
            setProcessing(false);
        }
    };


    // Get unique issue types from reports for filter dropdown
    const getUniqueIssueTypes = () => {
        const issueTypes = new Set();
        reports.forEach(report => {
            if (report.issue_type && report.issue_type.length > 0) {
                report.issue_type.forEach(issue => {
                    if (issue.issue_type) {
                        issueTypes.add(issue.issue_type);
                    }
                });
            }
        });
        return Array.from(issueTypes);
    };

    // Format issue types for display
    const formatIssueTypes = (issueTypeArray) => {
        if (!issueTypeArray || !issueTypeArray.length) return 'Not specified';

        return issueTypeArray.map(issue => {
            const displayText = issueTypeMapping[issue.issue_type] || issue.issue_type;
            return displayText;
        }).join(', ');
    };

    // Filter reports based on search and filters
    const filteredReports = reports.filter(report => {
        if (!report) return false;

        // Search term filter
        const reportedByName = `${report.user?.Fname || ''} ${report.user?.Lname || ''}`.trim();
        const searchMatch =
            (report.question?.text?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (reportedByName.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (report.user?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        // Status filter
        let statusMatch = statusFilter === 'all';
        if (statusFilter === 'Pending') {
            statusMatch = report.status === true;
        } else if (statusFilter === 'Resolved') {
            statusMatch = report.status === false;
        }

        // Reason filter
        const reasonMatch = reasonFilter === 'all' ||
            (report.issue_type?.some(issue => issue.issue_type === reasonFilter));

        // Date range filter
        let dateMatch = true;
        if (dateRange[0] && dateRange[1] && report.created_at) {
            try {
                const reportDate = moment(report.created_at);
                dateMatch =
                    reportDate.isValid() &&
                    reportDate.isSameOrAfter(moment(dateRange[0])) &&
                    reportDate.isSameOrBefore(moment(dateRange[1]));
            } catch (error) {
                
                dateMatch = false;
            }
        }

        return searchMatch && statusMatch && reasonMatch && dateMatch;
    });

    // Sort reports based on sort order
    const sortedReports = [...filteredReports].sort((a, b) => {
        if (!a || !b) return 0;

        if (sortOrder === 'newest') {
            return moment(b?.created_at || 0).diff(moment(a?.created_at || 0));
        } else if (sortOrder === 'oldest') {
            return moment(a?.created_at || 0).diff(moment(b?.created_at || 0));
        } else if (sortOrder === 'status') {
            const statusPriority = { false: 1, 'rejected': 2, true: 3 };
            return (statusPriority[a?.status] || 0) - (statusPriority[b?.status] || 0);
        }
        return 0;
    });

    // Pagination
    const paginatedReports = sortedReports.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Get status counts for statistics
    const getStatusCounts = () => {
        return {
            total: reports.length,
            pending: reports.filter(r => r.status === true).length,
            resolved: reports.filter(r => r.status === false).length
        };
    };

    const statusCounts = getStatusCounts();

    const renderMobileView = () => {
        return (
            <Box sx={{ mt: 2 }}>
                {paginatedReports.map((report) => (
                    <Card
                        key={report.id}
                        sx={{
                            mb: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            borderLeft: `4px solid ${statusColors[report.status]}`
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    ID: {report.id}
                                </Typography>
                                <Chip
                                    label={statusLabels[report.status] || 'Unknown'}
                                    size="small"
                                    sx={{
                                        backgroundColor: statusColors[report.status] || '#ccc',
                                        color: 'white'
                                    }}
                                />
                            </Box>

                            <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
                                {report.question?.text?.length > 100
                                    ? `${report.question.text.substring(0, 100)}...`
                                    : report.question?.text || 'No question text available'}
                            </Typography>

                            <Grid container spacing={1} sx={{ mb: 1 }}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Reported By:
                                    </Typography>
                                    <Typography variant="body2">
                                        {`${report.user?.Fname || ''} ${report.user?.Lname || ''}`.trim() || 'Unknown'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Issue:
                                    </Typography>
                                    <Typography variant="body2">
                                        {formatIssueTypes(report.issue_type)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">
                                        Date:
                                    </Typography>
                                    <Typography variant="body2">
                                        {safeFormatDate(report.created_at)}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button
                                    startIcon={<Visibility />}
                                    onClick={() => handleViewDetails(report)}
                                    size="small"
                                >
                                    View
                                </Button>
                                {report.status === true && (
                                    <Button
                                        startIcon={<Check />}
                                        color="success"
                                        onClick={() => handleStatusChange(report.id, 'Done')}
                                        size="small"
                                        disabled={processing}
                                    >
                                        Mark Done
                                    </Button>
                                )}
                            </Box>

                        </CardContent>
                    </Card>
                ))}
            </Box>
        );
    };

    const renderDesktopView = () => {
        return (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table aria-label="question reports table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>ID</TableCell>
                            <TableCell>Reported Question</TableCell>
                            <TableCell>Reported By</TableCell>
                            <TableCell>Issue</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedReports.map((report) => (
                            <React.Fragment key={report.id}>
                                <TableRow
                                    sx={{
                                        '&:hover': { backgroundColor: theme.palette.action.hover },
                                        borderLeft: `4px solid ${statusColors[report.status] || '#ccc'}`
                                    }}
                                >
                                    <TableCell>
                                        <IconButton
                                            aria-label="expand row"
                                            size="small"
                                            onClick={() => setExpandedRow(expandedRow === report.id ? null : report.id)}
                                        >
                                            {expandedRow === report.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                        </IconButton>
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        REP01-00{report.id}
                                    </TableCell>
                                    <TableCell>
                                        {report.question?.text?.length > 50
                                            ? `${report.question.text.substring(0, 50)}...`
                                            : report.question?.text || 'N/A'}
                                    </TableCell>
                                    <TableCell>{`${report.user?.Fname || ''} ${report.user?.Lname || ''}`.trim() || 'Unknown'}</TableCell>
                                    <TableCell>{formatIssueTypes(report.issue_type)}</TableCell>
                                    <TableCell>{safeFormatDate(report.created_at)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={statusLabels[report.status] || 'Unknown'}
                                            size="small"
                                            sx={{
                                                backgroundColor: statusColors[report.status] || '#ccc',
                                                color: 'white'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewDetails(report)}
                                                >
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {report.status === true && (
                                                <Tooltip title="Mark as Done">
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleStatusChange(report.id, 'Done')}
                                                        disabled={processing}
                                                    >
                                                        <Check fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>

                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={8} sx={{ py: 0, border: 0 }}>
                                        {expandedRow === report.id && (
                                            <Box sx={{ p: 2, backgroundColor: theme.palette.action.hover }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Question Details:
                                                </Typography>
                                                <Typography variant="body2" paragraph>
                                                    <strong>Full Question:</strong> {report.question?.text || 'N/A'}
                                                </Typography>
                                                <Typography variant="body2" paragraph>
                                                    <strong>Options:</strong> {report.question?.options?.join(', ') || 'N/A'}
                                                </Typography>
                                                <Typography variant="body2" paragraph>
                                                    <strong>Correct Answer:</strong> {
                                                        report.question?.options &&
                                                        report.question.correct_option >= 0 &&
                                                        report.question.options[report.question.correct_option]
                                                    }
                                                </Typography>
                                                <Typography variant="body2" paragraph>
                                                    <strong>Solution:</strong> {report.question?.solution || 'No solution provided'}
                                                </Typography>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Reporter Information:
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>Email:</strong> {report.user?.email || 'N/A'}
                                                </Typography>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderFilters = () => {
        const uniqueIssueTypes = getUniqueIssueTypes();

        return (
            <Box sx={{
                mb: 2,
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                backgroundColor: 'background.paper',
                display: filtersOpen ? 'block' : 'none'
            }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Statuses</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Resolved">Resolved</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Issue Type</InputLabel>
                            <Select
                                value={reasonFilter}
                                label="Issue Type"
                                onChange={(e) => setReasonFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Issues</MenuItem>
                                {uniqueIssueTypes.map((issueType) => (
                                    <MenuItem key={issueType} value={issueType}>
                                        {issueTypeMapping[issueType] || issueType}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortOrder}
                                label="Sort By"
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <MenuItem value="newest">Newest First</MenuItem>
                                <MenuItem value="oldest">Oldest First</MenuItem>
                                <MenuItem value="status">By Status</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            fullWidth
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setReasonFilter('all');
                                setDateRange([null, null]);
                                setSortOrder('newest');
                            }}
                        >
                            Reset Filters
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    return (
        <Layout>
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                        variant="filled"
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>

                {/* Header Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Manage Question Reports
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Review and manage reported questions submitted by users.
                    </Typography>
                </Box>

                {/* Search and Filter Controls */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'stretch', md: 'center' },
                    gap: 2,
                    mb: 2
                }}>
                    <TextField
                        placeholder="Search questions, reporters..."
                        variant="outlined"
                        fullWidth={isMobile}
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flexGrow: 1 }}
                    />

                    <Button
                        variant="outlined"
                        startIcon={<FilterList />}
                        onClick={() => setFiltersOpen(!filtersOpen)}
                        sx={{ minWidth: 120 }}
                    >
                        {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        sx={{ minWidth: 120 }}
                        onClick={fetchReports}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Box>

                {/* Filters Section */}
                {renderFilters()}

                {/* Stats Summary */}
                <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                        {[
                            { label: 'Total Reports', count: statusCounts.total, color: theme.palette.primary.main },
                            { label: 'Pending', count: statusCounts.pending, color: statusColors[true] },
                            { label: 'Resolved', count: statusCounts.resolved, color: statusColors[false] }
                        ].map((stat) => (
                            <Grid item xs={6} sm={4} key={stat.label}>
                                <Card sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    borderTop: `3px solid ${stat.color}`
                                }}>
                                    <Typography variant="h4" component="div">
                                        {stat.count}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {stat.label}
                                    </Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Reports List */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Card sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body1" color="error">
                            {error}
                        </Typography>
                        <Button
                            variant="outlined"
                            sx={{ mt: 2 }}
                            onClick={fetchReports}
                        >
                            Retry
                        </Button>
                    </Card>
                ) : paginatedReports.length === 0 ? (
                    <Card sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                            No reports found matching your criteria.
                        </Typography>
                    </Card>
                ) : (
                    isMobile ? renderMobileView() : renderDesktopView()
                )}

                {/* Pagination */}
                {!loading && filteredReports.length > 0 && (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 3,
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            Showing {Math.min(page * rowsPerPage + 1, filteredReports.length)} - {Math.min((page + 1) * rowsPerPage, filteredReports.length)} of {filteredReports.length} reports
                        </Typography>

                        <Stack direction="row" spacing={1}>
                            <Button
                                disabled={page === 0}
                                onClick={() => setPage(page - 1)}
                                variant="outlined"
                                size="small"
                            >
                                Previous
                            </Button>
                            <Button
                                disabled={(page + 1) * rowsPerPage >= filteredReports.length}
                                onClick={() => setPage(page + 1)}
                                variant="outlined"
                                size="small"
                            >
                                Next
                            </Button>
                        </Stack>
                    </Box>
                )}

                {/* Detail Modal/Drawer */}
                {isMobile ? (
                    <SwipeableDrawer
                        anchor="bottom"
                        open={detailsOpen}
                        onClose={handleCloseDetails}
                        onOpen={() => { }}
                        PaperProps={{
                            sx: {
                                height: '80%',
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                            }
                        }}
                    >
                        {selectedReport && (
                            <Box sx={{ p: 2 }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 2
                                }}>
                                    <Typography variant="h6">
                                        Report Details
                                    </Typography>
                                    <Chip
                                        label={statusLabels[selectedReport.status] || 'Unknown'}
                                        sx={{
                                            backgroundColor: statusColors[selectedReport.status] || '#ccc',
                                            color: 'white'
                                        }}
                                    />
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                <Typography variant="subtitle2" color="text.secondary">
                                    Report ID
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    {selectedReport.id}
                                </Typography>

                                <Typography variant="subtitle2" color="text.secondary">
                                    Reported Question
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    {selectedReport.question?.text || 'N/A'}
                                </Typography>

                                <Typography variant="subtitle2" color="text.secondary">
                                    Options
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    {selectedReport.question?.options?.map((option, index) => (
                                        <Typography
                                            key={index}
                                            variant="body1"
                                            sx={{
                                                fontWeight: index === selectedReport.question?.correct_option ? 'bold' : 'normal',
                                                color: index === selectedReport.question?.correct_option ? 'success.main' : 'text.primary'
                                            }}
                                        >
                                            {index + 1}. {option} {index === selectedReport.question?.correct_option ? '(Correct)' : ''}
                                        </Typography>
                                    ))}
                                </Box>

                                <Typography variant="subtitle2" color="text.secondary">
                                    Reported By
                                </Typography>
                                <Typography variant="body1">
                                    {`${selectedReport.user?.Fname || ''} ${selectedReport.user?.Lname || ''}`.trim() || 'Unknown'}
                                </Typography>

                                <Typography variant="subtitle2" color="text.secondary">
                                    Reported At
                                </Typography>
                                <Typography variant="body1">
                                    {safeFormatDate(selectedReport.created_at)}
                                </Typography>

                                <Typography variant="subtitle2" color="text.secondary">
                                    Issue Type
                                </Typography>

                                <Typography variant="body1" paragraph>
                                    {formatIssueTypes(selectedReport.issue_type)}
                                </Typography>

                                <Typography variant="subtitle2" color="text.secondary">
                                    Description
                                </Typography>

                                <Typography variant="body1" paragraph>
                                    {selectedReport.description || 'No description provided'}
                                </Typography>

                                <Typography variant="subtitle2" color="text.secondary">
                                    Admin Notes
                                </Typography>

                                <TextField
                                    multiline
                                    rows={4}
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Add notes for this report..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    sx={{ mb: 2 }}
                                />

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleCloseDetails}
                                    >
                                        Close
                                    </Button>
                                    {selectedReport.status === true && (
                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={() => handleStatusChange(selectedReport.id, 'Done')}
                                            disabled={processing}
                                        >
                                            Mark as Done
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </SwipeableDrawer>
                ) : (

                    <Dialog
                        open={detailsOpen}
                        onClose={handleCloseDetails}
                        fullWidth
                        maxWidth="md"
                    >
                        {selectedReport && (
                            <>
                                <DialogTitle>
                                    Report Details
                                </DialogTitle>
                                <DialogContent>
                                    <Box sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Report ID
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            {selectedReport.id}
                                        </Typography>

                                        <Typography variant="subtitle2" color="text.secondary">
                                            Reported Question
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            {selectedReport.question?.text || 'N/A'}
                                        </Typography>

                                        <Typography variant="subtitle2" color="text.secondary">
                                            Options
                                        </Typography>
                                        <Box sx={{ mb: 2 }}>
                                            {selectedReport.question?.options?.map((option, index) => (
                                                <Typography
                                                    key={index}
                                                    variant="body1"
                                                    sx={{
                                                        fontWeight: index === selectedReport.question?.correct_option ? 'bold' : 'normal',
                                                        color: index === selectedReport.question?.correct_option ? 'success.main' : 'text.primary'
                                                    }}
                                                >
                                                    {index + 1}. {option} {index === selectedReport.question?.correct_option ? '(Correct)' : ''}
                                                </Typography>
                                            ))}
                                        </Box>

                                        <Typography variant="subtitle2" color="text.secondary">
                                            Reported By
                                        </Typography>
                                        <Typography variant="body1">
                                            {`${selectedReport.user?.Fname || ''} ${selectedReport.user?.Lname || ''}`.trim() || 'Unknown'}
                                        </Typography>

                                        <Typography variant="subtitle2" color="text.secondary">
                                            Reported At
                                        </Typography>
                                        <Typography variant="body1">
                                            {safeFormatDate(selectedReport.created_at)}
                                        </Typography>

                                        <Typography variant="subtitle2" color="text.secondary">
                                            Issue Type
                                        </Typography>

                                        <Typography variant="body1" paragraph>
                                            {formatIssueTypes(selectedReport.issue_type)}
                                        </Typography>

                                        <Typography variant="subtitle2" color="text.secondary">
                                            Description
                                        </Typography>

                                        <Typography variant="body1" paragraph>
                                            {selectedReport.description || 'No description provided'}
                                        </Typography>

                                        <Typography variant="subtitle2" color="text.secondary">
                                            Admin Notes
                                        </Typography>

                                        <TextField
                                            multiline
                                            rows={4}
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Add notes for this report..."
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            sx={{ mb: 2 }}
                                        />
                                    </Box>

                                </DialogContent>
                                <DialogActions>
                                    <Button
                                        onClick={handleCloseDetails}
                                        color="primary"
                                    >
                                        Close
                                    </Button>
                                    {selectedReport.status === true && (
                                        <Button
                                            onClick={() => handleStatusChange(selectedReport.id, 'Done')}
                                            color="success"
                                            disabled={processing}
                                            variant="contained"
                                        >
                                            Mark as Done
                                        </Button>
                                    )}
                                </DialogActions>
                            </>
                        )}
                    </Dialog>
                )}
            </Box>
        </Layout>
    );
}

export default ManageQuestionReport;
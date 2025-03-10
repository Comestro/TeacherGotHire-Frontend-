import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    TextField,
    Button,
    IconButton,
    Chip,
    Drawer,
    Grid,
    Card,
    CardContent,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Collapse,
    Badge,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    useMediaQuery,
    Pagination
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Sort as SortIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    Notes as NotesIcon,
    Add as AddIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Layout from '../Admin/Layout';
import { getRecruiterEnquiry } from '../../services/adminRecruiterEnquiryApi';

const ManageRecruiterEnquiry = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State variables
    const [inquiries, setInquiries] = useState([]);
    const [filteredInquiries, setFilteredInquiries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [sortOption, setSortOption] = useState('newest');
    const [filters, setFilters] = useState({
        subjects: [],
        classCategory: '',
        teacherType: '',
        location: {
            state: '',
            city: ''
        },
        status: []
    });
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [adminNote, setAdminNote] = useState('');

    // Add pagination state
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Load data on component mount
    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                const response = await getRecruiterEnquiry();
                // Transform the data to match the expected structure
                const transformedInquiries = response.map(item => ({
                    id: item.id,
                    recruiterName: item.name,
                    email: item.email,
                    contactNumber: item.contact,
                    subjects: item.subject.map(s => s.subject_name),
                    teacherType: item.teachertype,
                    location: {
                        city: item.city,
                        state: item.state,
                        area: item.area,
                        pincode: item.pincode
                    },
                    status: "Pending", // Assuming default status
                    createdAt: new Date().toISOString(), // Assuming current date as creation date
                    adminNotes: ""
                }));
                setInquiries(transformedInquiries);
                setFilteredInquiries(transformedInquiries);
            } catch (error) {
                console.error("Error fetching recruiter inquiries:", error);
            }
        };

        fetchInquiries();
    }, []);

    // Handle search and filtering
    useEffect(() => {
        let results = inquiries;

        // Apply search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(inquiry =>
                inquiry.recruiterName.toLowerCase().includes(term) ||
                inquiry.email.toLowerCase().includes(term) ||
                inquiry.location.city.toLowerCase().includes(term) ||
                inquiry.subjects.some(subject => subject.toLowerCase().includes(term))
            );
        }

        // Apply filters
        if (filters.status.length > 0) {
            results = results.filter(inquiry => filters.status.includes(inquiry.status));
        }

        if (filters.teacherType) {
            results = results.filter(inquiry => inquiry.teacherType === filters.teacherType);
        }

        if (filters.location.state) {
            results = results.filter(inquiry => inquiry.location.state === filters.location.state);
        }

        // Apply sorting
        results = [...results].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);

            if (sortOption === 'newest') {
                return dateB - dateA;
            } else if (sortOption === 'oldest') {
                return dateA - dateB;
            }

            return 0;
        });

        setFilteredInquiries(results);
    }, [searchTerm, filters, inquiries, sortOption]);

    // Calculate paginated data
    const paginatedInquiries = filteredInquiries.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    // Handle page change
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Handle view details
    const handleViewDetails = (inquiry) => {
        setSelectedInquiry(inquiry);
        setIsDrawerOpen(true);
    };

    // Handle approve inquiry
    const handleApprove = (id) => {
        setInquiries(inquiries.map(item =>
            item.id === id ? { ...item, status: 'Approved' } : item
        ));

        if (selectedInquiry && selectedInquiry.id === id) {
            setSelectedInquiry({ ...selectedInquiry, status: 'Approved' });
        }
    };

    // Open reject modal
    const handleOpenRejectModal = (inquiry) => {
        setSelectedInquiry(inquiry);
        setIsRejectModalOpen(true);
    };

    // Handle reject inquiry
    const handleReject = () => {
        if (selectedInquiry) {
            setInquiries(inquiries.map(item =>
                item.id === selectedInquiry.id ?
                    { ...item, status: 'Rejected', adminNotes: item.adminNotes + " | Rejection reason: " + rejectReason } : item
            ));

            setSelectedInquiry({
                ...selectedInquiry,
                status: 'Rejected',
                adminNotes: selectedInquiry.adminNotes + " | Rejection reason: " + rejectReason
            });

            setIsRejectModalOpen(false);
            setRejectReason('');
        }
    };

    // Handle adding admin note
    const handleAddNote = () => {
        if (selectedInquiry && adminNote) {
            const updatedNotes = selectedInquiry.adminNotes ?
                `${selectedInquiry.adminNotes}\n${new Date().toLocaleDateString()}: ${adminNote}` :
                `${new Date().toLocaleDateString()}: ${adminNote}`;

            setInquiries(inquiries.map(item =>
                item.id === selectedInquiry.id ? { ...item, adminNotes: updatedNotes } : item
            ));

            setSelectedInquiry({ ...selectedInquiry, adminNotes: updatedNotes });
            setIsNoteModalOpen(false);
            setAdminNote('');
        }
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return theme.palette.success.main;
            case 'Rejected': return theme.palette.error.main;
            default: return theme.palette.warning.main;
        }
    };

    return (
        <Layout>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Page Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Manage Recruiter Inquiries
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Review and manage inquiries from recruiters seeking qualified teachers
                    </Typography>
                </Box>

                {/* Search, Sort & Filter Section */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 2,
                        mb: 3,
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        backgroundColor: 'background.paper'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by name, email, subject, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />

                        <Box sx={{ display: 'flex', ml: 1 }}>
                            <IconButton
                                color={isFilterExpanded ? "primary" : "default"}
                                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                            >
                                <FilterListIcon />
                            </IconButton>

                            <FormControl variant="outlined" size="small" sx={{ ml: 1, minWidth: 120, display: { xs: 'none', md: 'block' } }}>
                                <Select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    displayEmpty
                                    startAdornment={<SortIcon sx={{ mr: 0.5, color: 'text.secondary' }} />}
                                >
                                    <MenuItem value="newest">Newest First</MenuItem>
                                    <MenuItem value="oldest">Oldest First</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    {/* Mobile Sort Option */}
                    <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
                        <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                label="Sort By"
                            >
                                <MenuItem value="newest">Newest First</MenuItem>
                                <MenuItem value="oldest">Oldest First</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Filter Section - Collapsible */}
                    <Collapse in={isFilterExpanded}>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Teacher Type</InputLabel>
                                    <Select
                                        value={filters.teacherType}
                                        onChange={(e) => setFilters({ ...filters, teacherType: e.target.value })}
                                        label="Teacher Type"
                                    >
                                        <MenuItem value="">All Types</MenuItem>
                                        <MenuItem value="School Teacher">School Teacher</MenuItem>
                                        <MenuItem value="Tutor">Tutor</MenuItem>
                                        <MenuItem value="Coaching Faculty">Coaching Faculty</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>State</InputLabel>
                                    <Select
                                        value={filters.location.state}
                                        onChange={(e) => setFilters({
                                            ...filters,
                                            location: { ...filters.location, state: e.target.value }
                                        })}
                                        label="State"
                                    >
                                        <MenuItem value="">All States</MenuItem>
                                        <MenuItem value="Bihar">Bihar</MenuItem>
                                        <MenuItem value="Delhi">Delhi</MenuItem>
                                        <MenuItem value="Maharashtra">Maharashtra</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={4} lg={6}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    <Chip
                                        label="Pending"
                                        clickable
                                        color={filters.status.includes('Pending') ? "primary" : "default"}
                                        onClick={() => {
                                            const newStatus = filters.status.includes('Pending')
                                                ? filters.status.filter(s => s !== 'Pending')
                                                : [...filters.status, 'Pending'];
                                            setFilters({ ...filters, status: newStatus });
                                        }}
                                    />

                                    <Chip
                                        label="Approved"
                                        clickable
                                        color={filters.status.includes('Approved') ? "success" : "default"}
                                        onClick={() => {
                                            const newStatus = filters.status.includes('Approved')
                                                ? filters.status.filter(s => s !== 'Approved')
                                                : [...filters.status, 'Approved'];
                                            setFilters({ ...filters, status: newStatus });
                                        }}
                                    />

                                    <Chip
                                        label="Rejected"
                                        clickable
                                        color={filters.status.includes('Rejected') ? "error" : "default"}
                                        onClick={() => {
                                            const newStatus = filters.status.includes('Rejected')
                                                ? filters.status.filter(s => s !== 'Rejected')
                                                : [...filters.status, 'Rejected'];
                                            setFilters({ ...filters, status: newStatus });
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                size="small"
                                onClick={() => {
                                    setFilters({
                                        subjects: [],
                                        classCategory: '',
                                        teacherType: '',
                                        location: { state: '', city: '' },
                                        status: []
                                    });
                                }}
                            >
                                Clear Filters
                            </Button>
                        </Box>
                    </Collapse>
                </Paper>

                {/* Inquiry List Section */}
                <Box>
                    {/* Desktop View - Table */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Paper elevation={1}>
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 2fr 2fr 1fr',
                                p: 2,
                                fontWeight: 'bold',
                                borderBottom: 1,
                                borderColor: 'divider'
                            }}>
                                <Typography variant="subtitle2">Recruiter</Typography>
                                <Typography variant="subtitle2">Requirements</Typography>
                                <Typography variant="subtitle2">Location</Typography>
                                <Typography variant="subtitle2">Status</Typography>
                            </Box>

                            {paginatedInquiries.map((inquiry) => (
                                <Box
                                    key={inquiry.id}
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 2fr 2fr 1fr',
                                        p: 2,
                                        borderBottom: 1,
                                        borderColor: 'divider',
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                        }
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body2" fontWeight="medium">{inquiry.recruiterName}</Typography>
                                        <Typography variant="caption" display="block">{inquiry.email}</Typography>
                                        <Typography variant="caption" color="text.secondary">{inquiry.contactNumber}</Typography>
                                    </Box>

                                    <Box>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                                            {inquiry.subjects.map((subject, idx) => (
                                                <Chip key={idx} label={subject} size="small" variant="outlined" />
                                            ))}
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Teacher Type: {inquiry.teacherType}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="body2">{inquiry.location.city}, {inquiry.location.state}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {inquiry.location.area} - {inquiry.location.pincode}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Chip
                                            label={inquiry.status}
                                            size="small"
                                            sx={{
                                                backgroundColor: getStatusColor(inquiry.status),
                                                color: '#fff',
                                                mr: 1
                                            }}
                                        />
                                        <Tooltip title="View Details">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleViewDetails(inquiry)}
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            ))}
                        </Paper>
                    </Box>

                    {/* Mobile View - Cards */}
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                        {paginatedInquiries.map((inquiry) => (
                            <Card
                                key={inquiry.id}
                                sx={{
                                    mb: 2,
                                    border: `1px solid ${theme.palette.divider}`,
                                    position: 'relative'
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        zIndex: 1
                                    }}
                                >
                                    <Chip
                                        label={inquiry.status}
                                        size="small"
                                        sx={{
                                            backgroundColor: getStatusColor(inquiry.status),
                                            color: '#fff'
                                        }}
                                    />
                                </Box>

                                <CardContent>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h6" component="div">
                                            {inquiry.recruiterName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {inquiry.email} | {inquiry.contactNumber}
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ mb: 2 }} />

                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">
                                                Teacher Type
                                            </Typography>
                                            <Typography variant="body2">
                                                {inquiry.teacherType}
                                            </Typography>
                                        </Grid>

                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">
                                                Location
                                            </Typography>
                                            <Typography variant="body2">
                                                {inquiry.location.city}, {inquiry.location.state}
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Subjects
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                            {inquiry.subjects.map((subject, idx) => (
                                                <Chip key={idx} label={subject} size="small" variant="outlined" />
                                            ))}
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() => handleViewDetails(inquiry)}
                                        >
                                            View Details
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    {/* Add Pagination */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                            count={Math.ceil(filteredInquiries.length / rowsPerPage)}
                            page={page}
                            onChange={handleChangePage}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Box>

                    {filteredInquiries.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                No inquiries found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Try adjusting your search or filters
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Inquiry Details Drawer */}
                <Drawer
                    anchor={isMobile ? 'bottom' : 'right'}
                    open={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    PaperProps={{
                        sx: {
                            width: isMobile ? '100%' : '400px',
                            height: isMobile ? '90%' : '100%',
                            borderTopLeftRadius: isMobile ? 16 : 0,
                            borderTopRightRadius: isMobile ? 16 : 0,
                        }
                    }}
                >
                    {selectedInquiry && (
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Inquiry Details</Typography>
                                <IconButton onClick={() => setIsDrawerOpen(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            <Typography variant="subtitle2" gutterBottom>Recruiter Information</Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body1">{selectedInquiry.recruiterName}</Typography>
                                <Typography variant="body2">{selectedInquiry.email}</Typography>
                                <Typography variant="body2">{selectedInquiry.contactNumber}</Typography>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <Typography variant="subtitle2" gutterBottom>Inquiry Details</Typography>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Teacher Type</Typography>
                                    <Typography variant="body1">{selectedInquiry.teacherType}</Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Status</Typography>
                                    <Chip
                                        label={selectedInquiry.status}
                                        size="small"
                                        sx={{
                                            backgroundColor: getStatusColor(selectedInquiry.status),
                                            color: '#fff'
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Subjects</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                        {selectedInquiry.subjects.map((subject, idx) => (
                                            <Chip key={idx} label={subject} size="small" />
                                        ))}
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Location</Typography>
                                    <Typography variant="body1">
                                        {selectedInquiry.location.area}, {selectedInquiry.location.city}, {selectedInquiry.location.state} - {selectedInquiry.location.pincode}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ mb: 2 }} />

                            {/* Modify the Admin Notes section in the drawer to use a traditional button */}
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle2">Admin Notes</Typography>
                                    <Button
                                        startIcon={<NotesIcon />}
                                        size="small"
                                        variant="outlined"
                                        onClick={() => setIsNoteModalOpen(true)}
                                    >
                                        Add Note
                                    </Button>
                                </Box>

                                <Paper
                                    variant="outlined"
                                    sx={{
                                        mt: 1,
                                        p: 2,
                                        minHeight: '80px',
                                        backgroundColor: theme.palette.background.default
                                    }}
                                >
                                    {selectedInquiry.adminNotes ? (
                                        <Typography
                                            variant="body2"
                                            sx={{ whiteSpace: 'pre-wrap' }}
                                        >
                                            {selectedInquiry.adminNotes}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                            No notes added yet
                                        </Typography>
                                    )}
                                </Paper>
                            </Box>
                        </Box>
                    )}
                </Drawer>

                {/* Reject Modal */}
                <Dialog
                    open={isRejectModalOpen}
                    onClose={() => setIsRejectModalOpen(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Reject Inquiry</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" paragraph>
                            Please provide a reason for rejecting this inquiry from {selectedInquiry?.recruiterName}
                        </Typography>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Rejection Reason</InputLabel>
                            <Select
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                label="Rejection Reason"
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="Incomplete information">Incomplete information</MenuItem>
                                <MenuItem value="Not matching our platform requirements">Not matching our platform requirements</MenuItem>
                                <MenuItem value="No suitable teachers available">No suitable teachers available</MenuItem>
                                <MenuItem value="Other">Other (please specify)</MenuItem>
                            </Select>
                        </FormControl>

                        {rejectReason === 'Other' && (
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Specify reason"
                                variant="outlined"
                                value={rejectReason === 'Other' ? rejectReason : ''}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleReject} color="error">Reject Inquiry</Button>
                    </DialogActions>
                </Dialog>

                {/* Add Note Modal */}

                <Dialog
                    open={isNoteModalOpen}
                    onClose={() => setIsNoteModalOpen(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Add Admin Note</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Add a note for this inquiry"
                            variant="outlined"
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsNoteModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddNote} color="primary">Add Note</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Layout>

    );
}
export default ManageRecruiterEnquiry;
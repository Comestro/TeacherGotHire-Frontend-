import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Box,
  Snackbar,
  Alert,
  TablePagination,
  Chip,
  Paper,
  Grid,
  TableContainer,
  Tooltip,
  CircularProgress,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Divider,
  Avatar,
  alpha,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Email as EmailIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  VerifiedUser as VerifiedIcon,
} from "@mui/icons-material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Layout from "../Admin/Layout";
import { getRecruiter } from "../../services/adminManageRecruiter";
import { Link } from "react-router-dom";

const ManageRecruiter = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [selectedRecruiters, setSelectedRecruiters] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentRecruiter, setCurrentRecruiter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    // Fetch recruiters data from the API
    setLoading(true);
    getRecruiter()
      .then(response => {
        if (response && Array.isArray(response)) {
          const formattedRecruiters = response.map(item => ({
            id: item.id,
            firstName: item.Fname || '',
            lastName: item.Lname || '',
            name: `${item.Fname || ''} ${item.Lname || ''}`.trim(),
            email: item.email || 'N/A',
            phone: item.profiles?.phone_number || 'N/A',
            gender: item.profiles?.gender || 'N/A',
            status: item.is_verified ? 'Verified' : 'Pending',
            company: item.profiles?.company || 'N/A',
            location: item.profiles?.location || 'N/A',
            profilePic: item.profiles?.profile_image || null,
            createdAt: new Date(item.created_at || Date.now()).toLocaleDateString(),
          }));
          setRecruiters(formattedRecruiters);
          setNotification({
            open: true,
            message: "Recruiters loaded successfully",
            type: "success",
          });
        } else {
          console.error('Unexpected response structure:', response);
          setError('Failed to load recruiter data. Please try again.');
          setNotification({
            open: true,
            message: "Failed to fetch recruiters data",
            type: "error",
          });
        }
      })
      .catch(error => {
        console.error('Error fetching recruiters:', error);
        setError('An error occurred while fetching data.');
        setNotification({
          open: true,
          message: `Error: ${error.message || 'Failed to fetch data'}`,
          type: "error",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleViewRecruiter = (recruiter) => {
    setCurrentRecruiter(recruiter);
    setIsViewModalOpen(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredRecruiters.map((recruiter) => recruiter.id);
      setSelectedRecruiters(newSelected);
      return;
    }
    setSelectedRecruiters([]);
  };

  const handleExportData = () => {
    if (filteredRecruiters.length === 0) {
      setNotification({
        open: true,
        message: "No data to export",
        type: "warning",
      });
      return;
    }

    const csvContent = [
      [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Gender",
        "Status",
        "Company",
        "Location",
        "Registration Date"
      ],
      ...filteredRecruiters.map((recruiter) => [
        recruiter.id,
        recruiter.name,
        recruiter.email,
        recruiter.phone,
        recruiter.gender,
        recruiter.status,
        recruiter.company,
        recruiter.location,
        recruiter.createdAt
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "recruiters_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotification({
      open: true,
      message: "Data exported successfully",
      type: "success",
    });
  };

  const filteredRecruiters = recruiters.filter((recruiter) => {
    return (
      (searchQuery === "" ||
        recruiter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recruiter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recruiter.id.toString().includes(searchQuery) ||
        (recruiter.phone && recruiter.phone.includes(searchQuery))) &&
      (selectedGender === "" ||
        recruiter.gender.toLowerCase() === selectedGender.toLowerCase()) &&
      (selectedStatus === "" ||
        recruiter.status.toLowerCase() === selectedStatus.toLowerCase())
    );
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderMobileCards = () => {
    return filteredRecruiters
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((recruiter) => (
        <Card
          key={recruiter.id}
          elevation={2}
          sx={{
            mb: 2,
            position: 'relative',
            borderLeft: `4px solid ${theme.palette[getStatusColor(recruiter.status)].main}`
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  src={recruiter.profilePic}
                  alt={getInitials(recruiter.name)}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 40,
                    height: 40
                  }}
                >
                  {getInitials(recruiter.name)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{recruiter.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{recruiter.company}</Typography>
                </Box>
              </Box>
              <Chip
                size="small"
                label={recruiter.status}
                color={getStatusColor(recruiter.status)}
                variant="outlined"
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                    {recruiter.email}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2">{recruiter.phone}</Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2">{recruiter.gender}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" mt={1} gap={1}>
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleViewRecruiter(recruiter)}
                >
                  <ViewIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="WhatsApp">
                <IconButton
                  size="small"
                  component="a"
                  href={`https://api.whatsapp.com/send/?phone=${recruiter.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#25D366' }}
                >
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Send Email">
                <IconButton
                  size="small"
                  component="a"
                  href={`mailto:${recruiter.email}`}
                  color="warning"
                >
                  <EmailIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      ));
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        {/* Header section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 2,
            backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.background.paper, 0.5)})`,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2.125rem' }
              }}
            >
              Manage Recruiters
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {filteredRecruiters.length} recruiters found
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<ExportIcon />}
            onClick={handleExportData}
            disabled={filteredRecruiters.length === 0 || loading}
            sx={{
              boxShadow: 2,
              textTransform: 'none',
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            Export Data
          </Button>
        </Paper>

        {/* Search and filter section */}
        <Paper
          elevation={2}
          sx={{
            mb: 3,
            p: { xs: 2, sm: 3 },
            borderRadius: 2
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                placeholder="Search recruiters by name, email or phone..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl variant="outlined" fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Statuses</em>
                  </MenuItem>
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl variant="outlined" fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Recruiters data section */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={6} flexDirection="column" gap={2}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">Loading recruiters data...</Typography>
            </Box>
          ) : error ? (
            <Box p={3} textAlign="center">
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : filteredRecruiters.length === 0 ? (
            <Box p={3} textAlign="center">
              <Alert severity="info">No recruiters found matching your criteria</Alert>
            </Box>
          ) : (
            <>
              {isXsScreen ? (
                <>
                  {/* Mobile view: Card layout */}
                  <Box p={2}>
                    {renderMobileCards()}
                  </Box>
                </>
              ) : (
                <>
                  {/* Desktop view: Table layout */}
                  <TableContainer>
                    <Table size={isSmallScreen ? "small" : "medium"}>
                      <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox
                              indeterminate={
                                selectedRecruiters.length > 0 &&
                                selectedRecruiters.length < filteredRecruiters.length
                              }
                              checked={
                                filteredRecruiters.length > 0 &&
                                selectedRecruiters.length === filteredRecruiters.length
                              }
                              onChange={handleSelectAllClick}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Recruiter</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                          {!isSmallScreen && (
                            <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                          )}
                          {!isMediumScreen && (
                            <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                          )}
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredRecruiters
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((recruiter) => (
                            <TableRow
                              key={recruiter.id}
                              hover
                              sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafafa' } }}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={selectedRecruiters.includes(recruiter.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRecruiters([
                                        ...selectedRecruiters,
                                        recruiter.id,
                                      ]);
                                    } else {
                                      setSelectedRecruiters(
                                        selectedRecruiters.filter(
                                          (id) => id !== recruiter.id
                                        )
                                      );
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1.5}>
                                  <Avatar
                                    src={recruiter.profilePic}
                                    alt={getInitials(recruiter.name)}
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      bgcolor: theme.palette.primary.main,
                                    }}
                                  >
                                    {getInitials(recruiter.name)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                      {recruiter.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {recruiter.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <Tooltip title="Contact on WhatsApp">
                                    <IconButton
                                      size="small"
                                      component="a"
                                      href={`https://api.whatsapp.com/send/?phone=${recruiter.phone}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{ color: '#25D366' }}
                                    >
                                      <WhatsAppIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Typography variant="body2">{recruiter.phone}</Typography>
                                </Box>
                              </TableCell>
                              {!isSmallScreen && (
                                <TableCell>{recruiter.company}</TableCell>
                              )}
                              {!isMediumScreen && (
                                <TableCell>{recruiter.location}</TableCell>
                              )}
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={recruiter.status}
                                  color={getStatusColor(recruiter.status)}
                                  variant="outlined"
                                  icon={recruiter.status === 'Verified' ? <VerifiedIcon fontSize="small" /> : undefined}
                                />
                              </TableCell>
                              <TableCell>
                                <Box display="flex" gap={1}>
                                  <Tooltip title="View Details">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleViewRecruiter(recruiter)}
                                    >
                                      <ViewIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Send Email">
                                    <IconButton
                                      size="small"
                                      color="warning"
                                      component="a"
                                      href={`mailto:${recruiter.email}`}
                                    >
                                      <EmailIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}

              {/* Pagination - always visible */}
              <Box
                display="flex"
                justifyContent="flex-end"
                p={2}
                sx={{
                  backgroundColor: theme.palette.background.default,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}
              >
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredRecruiters.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage={isSmallScreen ? "Rows:" : "Rows per page:"}
                />
              </Box>
            </>
          )}
        </Paper>

        {/* View recruiter details dialog */}
        <Dialog
          open={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight={600}>Recruiter Details</Typography>
          </DialogTitle>

          <DialogContent dividers>
            {currentRecruiter && (
              <Grid container spacing={2}>
                <Grid item xs={12} display="flex" justifyContent="center" mb={2}>
                  <Avatar
                    src={currentRecruiter.profilePic}
                    alt={getInitials(currentRecruiter.name)}
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '2.5rem',
                      boxShadow: 2
                    }}
                  >
                    {getInitials(currentRecruiter.name)}
                  </Avatar>
                </Grid>

                <Grid item xs={12} textAlign="center" mb={1}>
                  <Typography variant="h6" fontWeight={600}>{currentRecruiter.name}</Typography>
                  <Chip
                    size="small"
                    label={currentRecruiter.status}
                    color={getStatusColor(currentRecruiter.status)}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2">{currentRecruiter.email}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">{currentRecruiter.phone}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">{currentRecruiter.gender}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Company</Typography>
                  <Typography variant="body2" mt={0.5}>{currentRecruiter.company}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                  <Typography variant="body2" mt={0.5}>{currentRecruiter.location}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Registration Date</Typography>
                  <Typography variant="body2" mt={0.5}>{currentRecruiter.createdAt}</Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setIsViewModalOpen(false)}
              variant="outlined"
              color="primary"
            >
              Close
            </Button>
            {currentRecruiter && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<WhatsAppIcon />}
                  component="a"
                  href={`https://api.whatsapp.com/send/?phone=${currentRecruiter.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ backgroundColor: '#25D366', '&:hover': { backgroundColor: '#128C7E' } }}
                >
                  WhatsApp
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<EmailIcon />}
                  component="a"
                  href={`mailto:${currentRecruiter.email}`}
                >
                  Email
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.type}
            variant="filled"
            elevation={3}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default ManageRecruiter;
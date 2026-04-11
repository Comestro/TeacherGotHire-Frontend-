import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  TablePagination,
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
  Chip,
  Paper,
  Grid,
  Tooltip,
  CircularProgress,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Divider,
  Avatar,
  alpha,
  Stack,
} from "@mui/material";
import {
  MdVisibility as ViewIcon,
  MdGetApp as ExportIcon,
  MdEmail as EmailIcon,
  MdFilterList as FilterIcon,
  MdSearch as SearchIcon,
  MdPhone as PhoneIcon,
  MdPerson as PersonIcon,
  MdVerifiedUser as VerifiedIcon,
  MdRefresh,
  MdAdd,
} from "react-icons/md";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Layout from "../Admin/Layout";
import { getRecruiter } from "../../services/adminManageRecruiter";
import { Link } from "react-router-dom";

const BIHAR_DISTRICTS = [
  "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar",
  "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur",
  "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger",
  "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur",
  "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"
].sort();

const ManageRecruiter = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [selectedRecruiters, setSelectedRecruiters] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentRecruiter, setCurrentRecruiter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
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
  // Safe theme properties with fallbacks for MUI v6 stability
  const safePalette = theme?.palette || { text: { secondary: '#64748b' } };
  const safeBreakpoints = theme?.breakpoints || { down: () => '@media (max-width:600px)' };
  
  const isXsScreen = useMediaQuery(safeBreakpoints.down('sm'));
  const isSmallScreen = useMediaQuery(safeBreakpoints.down('md'));
  const isMediumScreen = useMediaQuery(safeBreakpoints.down('lg'));

  useEffect(() => {
    setLoading(true);
    getRecruiter()
      .then(response => {
        let data = [];
        if (response && Array.isArray(response)) {
          data = response;
        } else if (response && response.results && Array.isArray(response.results)) {
          data = response.results;
        }

        if (data.length > 0 || (response && Array.isArray(response))) {
          const formattedRecruiters = data.map(item => ({
            id: item.id || Math.random(),
            firstName: item.Fname || '',
            lastName: item.Lname || '',
            name: `${item.Fname || ''} ${item.Lname || ''}`.trim() || 'No Name',
            email: item.email || 'N/A',
            phone: item.profiles?.phone_number || 'N/A',
            gender: item.profiles?.gender || 'N/A',
            status: item.is_verified ? 'Verified' : 'Pending',
            company: item.profiles?.company || 'N/A',
            location: item.profiles?.location || 'N/A',
            profilePic: item.profiles?.profile_picture || null, // Backend uses profile_picture
            createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A',
          }));
          setRecruiters(formattedRecruiters);
          if (formattedRecruiters.length > 0) {
            setNotification({
              open: true,
              message: "Recruiters loaded successfully",
              type: "success",
            });
          }
        } else {
          setError('No recruiter data found.');
          setNotification({
            open: true,
            message: "No recruiters data available",
            type: "info",
          });
        }
      })
      .catch(error => {
        
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

  const handleExportData = () => {
    if (handleFilterChange().length === 0) {
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
      ...handleFilterChange().map((recruiter) => [
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

  const filteredRecruiters = React.useMemo(() => {
    return recruiters.filter((recruiter) => {
      // 1. Search Query Filter
      const query = searchQuery ? searchQuery.toLowerCase() : "";
      const matchesSearch = query === "" ||
        (recruiter.name && recruiter.name.toLowerCase().includes(query)) ||
        (recruiter.email && recruiter.email.toLowerCase().includes(query)) ||
        (recruiter.id && recruiter.id.toString().includes(query)) ||
        (recruiter.phone && recruiter.phone.includes(query)) ||
        (recruiter.company && recruiter.company.toLowerCase().includes(query));

      // 2. Status Filter
      const matchesStatus = selectedStatus === "" || 
        (recruiter.status && recruiter.status.toLowerCase() === selectedStatus.toLowerCase());

      // 3. Gender Filter
      const matchesGender = selectedGender === "" || 
        (recruiter.gender && recruiter.gender.toLowerCase() === selectedGender.toLowerCase());

      // 4. District Filter
      const matchesDistrict = selectedDistrict === "" || 
        (recruiter.location && recruiter.location.toLowerCase().includes(selectedDistrict.toLowerCase()));

      return matchesSearch && matchesStatus && matchesGender && matchesDistrict;
    });
  }, [recruiters, searchQuery, selectedStatus, selectedGender, selectedDistrict]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("");
    setSelectedGender("");
    setSelectedDistrict("");
  };

  const handleFilterChange = () => {
    return filteredRecruiters;
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    const s = String(status).toLowerCase();
    switch (s) {
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
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(/\s+/).filter(part => part.length > 0);
    if (parts.length === 0) return '?';
    return parts.map(n => n[0]).join('').toUpperCase();
  };

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer sx={{ p: 1 }}>
        <GridToolbarColumnsButton
          sx={{ fontSize: '0.75rem', borderRadius: 1, color: safePalette.text.secondary }}
        />
        <GridToolbarFilterButton
          sx={{ fontSize: '0.75rem', borderRadius: 1, color: safePalette.text.secondary }}
        />
        <GridToolbarDensitySelector
          sx={{ fontSize: '0.75rem', borderRadius: 1, color: safePalette.text.secondary }}
        />
        <GridToolbarExport
          sx={{ fontSize: '0.75rem', borderRadius: 1, color: safePalette.text.secondary }}
        />
      </GridToolbarContainer>
    );
  };

  const renderMobileCards = () => {
    return handleFilterChange()
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((recruiter) => (
        <Card
          key={recruiter.id}
          elevation={2}
          sx={{
            mb: 2,
            position: 'relative',
            borderRadius: 3,
            border: `1px solid ${alpha('#0d9488', 0.1)}`,
            background: `linear-gradient(135deg, ${alpha('#ffffff', 0.9)} 0%, ${alpha('#f8fafc', 0.5)} 100%)`,
            borderLeft: `4px solid ${recruiter.status === 'Verified' ? '#0d9488' : recruiter.status === 'Pending' ? '#f59e0b' : '#ef4444'}`
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Box display="flex" alignItems="center" gap={1}>
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
                sx={{
                  borderColor: recruiter.status === 'Verified' ? '#0d9488' : recruiter.status === 'Pending' ? '#f59e0b' : '#ef4444',
                  color: recruiter.status === 'Verified' ? '#0d9488' : recruiter.status === 'Pending' ? '#f59e0b' : '#ef4444',
                }}
              />
            </Box>

            <Divider sx={{ my: 1, borderColor: alpha('#0d9488', 0.1) }} />

            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon size={16} color="#6b7280" />
                  <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                    {recruiter.email}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PhoneIcon size={16} color="#6b7280" />
                  <Typography variant="body2">{recruiter.phone}</Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon size={16} color="#6b7280" />
                  <Typography variant="body2">{recruiter.gender}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" mt={1} gap={1}>
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  sx={{ color: '#0d9488' }}
                  onClick={() => handleViewRecruiter(recruiter)}
                >
                  <ViewIcon size={18} />
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
                  sx={{ color: '#f59e0b' }}
                >
                  <EmailIcon size={18} />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      ));
  };

  return (
    <Layout>
      {/* Header section */}
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          p: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: alpha('#0d9488', 0.1), color: '#0d9488', width: 44, height: 44 }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 700 }}>
              Recruiter Management
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total {filteredRecruiters.length} recruiters active
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button 
            variant="text" 
            size="small"
            startIcon={<MdRefresh />} 
            onClick={() => window.location.reload()}
            sx={{ color: '#64748b' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: '#0d9488',
              '&:hover': { bgcolor: '#0b7d6f' },
              boxShadow: 'none',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
            startIcon={<ExportIcon />}
            onClick={handleExportData}
            disabled={filteredRecruiters.length === 0 || loading}
          >
            Export CSV
          </Button>
        </Stack>
      </Paper>

      {/* Filter section */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name, email or phone..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon style={{ marginRight: '8px', color: '#94a3b8', fontSize: '1.2rem' }} />,
                sx: { borderRadius: 1.5, bgcolor: '#f8fafc' }
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl variant="outlined" fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                sx={{ borderRadius: 1.5, bgcolor: '#f8fafc' }}
              >
                <MenuItem value=""><em>All Statuses</em></MenuItem>
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
                sx={{ borderRadius: 1.5, bgcolor: '#f8fafc' }}
              >
                <MenuItem value=""><em>All Genders</em></MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl variant="outlined" fullWidth size="small">
              <InputLabel>District</InputLabel>
              <Select
                label="District"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                sx={{ borderRadius: 1.5, bgcolor: '#f8fafc' }}
              >
                <MenuItem value=""><em>All Districts</em></MenuItem>
                {BIHAR_DISTRICTS.map(district => (
                  <MenuItem key={district} value={district}>{district}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              size="small"
              variant="text"
              onClick={handleClearFilters}
              sx={{ color: '#64748b', textTransform: 'none' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={10} flexDirection="column" gap={2}>
            <CircularProgress size={32} sx={{ color: '#0d9488' }} />
            <Typography variant="body2" color="text.secondary">Fetching data...</Typography>
          </Box>
        ) : error ? (
          <Box p={4} textAlign="center">
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <>
            {isXsScreen ? (
              <Box p={2}>{renderMobileCards()}</Box>
            ) : (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Recruiter</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Company</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Location</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecruiters
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <Typography variant="body2" fontWeight={600} color="#1e293b">{row.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{row.company}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{row.location}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <Chip
                            size="small"
                            label={row.status}
                            color={getStatusColor(row.status)}
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, px: 0.5 }}
                          />
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <IconButton size="small" sx={{ color: '#0d9488' }} onClick={() => handleViewRecruiter(row)}>
                            <ViewIcon size={18} />
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                    {filteredRecruiters.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                          No results found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Box>
            )}
            
            <Box display="flex" justifyContent="flex-end" p={1} sx={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredRecruiters.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Density:"
                sx={{ border: 'none' }}
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
        slotProps={{
          paper: {
            elevation: 3,
            sx: { 
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha('#f8fafc', 0.9)} 100%)`,
              border: `1px solid ${alpha('#0d9488', 0.2)}`,
            }
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            pb: 1,
            background: `linear-gradient(135deg, ${alpha('#0d9488', 0.1)} 0%, ${alpha('#06B6D4', 0.05)} 100%)`,
            borderBottom: `1px solid ${alpha('#0d9488', 0.2)}`,
          }}
        >
          <Typography variant="h6" fontWeight={600} sx={{ color: '#0d9488' }}>Recruiter Details</Typography>
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
                    bgcolor: '#0d9488',
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
                  <EmailIcon size={14} color="#64748b" />
                  <Typography variant="body2">{currentRecruiter.email}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <PhoneIcon size={14} color="#64748b" />
                  <Typography variant="body2">{currentRecruiter.phone}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <PersonIcon size={14} color="#64748b" />
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

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setIsViewModalOpen(false)}
            variant="outlined"
            sx={{
              borderColor: alpha('#0d9488', 0.3),
              color: '#0d9488',
              '&:hover': {
                borderColor: '#0d9488',
                backgroundColor: alpha('#0d9488', 0.04),
              }
            }}
          >
            Close
          </Button>
          {currentRecruiter && (
            <>
              <Button
                variant="contained"
                component="a"
                href={`https://api.whatsapp.com/send/?phone=${currentRecruiter.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  backgroundColor: '#25D366', 
                  '&:hover': { backgroundColor: '#128C7E' },
                  textTransform: 'none'
                }}
                startIcon={<WhatsAppIcon />}
              >
                WhatsApp
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
    </Layout>
  );
};

export default ManageRecruiter;
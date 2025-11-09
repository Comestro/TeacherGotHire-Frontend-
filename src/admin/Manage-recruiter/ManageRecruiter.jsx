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
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector
} from '@mui/x-data-grid';
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
          
          setError('Failed to load recruiter data. Please try again.');
          setNotification({
            open: true,
            message: "Failed to fetch recruiters data",
            type: "error",
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

  const handleFilterChange = () => {
    // Your existing filter logic for the search box only
    const filtered = recruiters.filter((recruiter) => {
      return (
        searchQuery === "" ||
        recruiter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recruiter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recruiter.id.toString().includes(searchQuery) ||
        (recruiter.phone && recruiter.phone.includes(searchQuery))
      );
    });
    
    return filtered;
  };

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

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer sx={{ p: 1 }}>
        <GridToolbarColumnsButton
          sx={{ fontSize: '0.75rem', borderRadius: 1, color: theme.palette.text.secondary }}
        />
        <GridToolbarFilterButton
          sx={{ fontSize: '0.75rem', borderRadius: 1, color: theme.palette.text.secondary }}
        />
        <GridToolbarDensitySelector
          sx={{ fontSize: '0.75rem', borderRadius: 1, color: theme.palette.text.secondary }}
        />
        <GridToolbarExport
          sx={{ fontSize: '0.75rem', borderRadius: 1, color: theme.palette.text.secondary }}
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
          mb: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#0d9488', width: 48, height: 48 }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: '#0d9488',
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2.125rem' }
              }}
            >
              Manage Recruiters
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {handleFilterChange().length} recruiters found
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<MdRefresh />} onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #0d9488 0%, #06B6D4 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0b7d6f 0%, #0891b2 100%)',
              }
            }}
            startIcon={<ExportIcon />}
            onClick={handleExportData}
            disabled={handleFilterChange().length === 0 || loading}
            textTransform="none"
            minWidth={{ xs: '100%', sm: 'auto' }}
          >
            Export Data
          </Button>
        </Stack>
      </Paper>
      {/* Search and filter section */}
      <Paper
        elevation={2}
        sx={{
          mb: 3,
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          border: `1px solid ${alpha('#0d9488', 0.1)}`,
          background: `linear-gradient(135deg, ${alpha('#ffffff', 0.9)} 0%, ${alpha('#f8fafc', 0.5)} 100%)`,
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
              slotProps={{
                input: {
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }
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
        ) : handleFilterChange().length === 0 ? (
          <Box p={3} textAlign="center">
            <Alert severity="info">No recruiters found matching your criteria</Alert>
          </Box>
        ) : (
          <>
            {isXsScreen ? (
              // Mobile view: Card layout - Keep this as is
              (<Box p={2}>
                {renderMobileCards()}
              </Box>)
            ) : (
              // Replace the TableContainer with DataGrid
              (<Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                  rows={handleFilterChange()}
                  getRowId={(row) => row.id}
                  columns={[
                    {
                      field: 'name',
                      headerName: 'Recruiter',
                      flex: 2,
                      minWidth: 220,
                      headerAlign: 'center',
                      renderCell: (params) => (
                        <Box 
                          display="flex" 
                          gap={1.5} 
                          sx={{ 
                            py: 1.5, 
                            width: '100%',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={500} align="center">
                              {params.row.name}
                            </Typography>
                           
                          </Box>
                        </Box>
                      ),
                      sortable: true,
                      filterable: true,
                      align: 'center',
                    },
                    {
                      field: 'email',
                      headerName: 'Email',
                      flex: 1,
                      minWidth: 180,
                      hide: true,
                      headerAlign: 'center',
                      align: 'center',
                    },
                    
                    {
                      field: 'company',
                      headerName: 'Company',
                      flex: 1,
                      minWidth: 150,
                      hide: isSmallScreen,
                      sortable: true,
                      filterable: true,
                      headerAlign: 'center',
                      renderCell: (params) => (
                        <Box sx={{ py: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
                          <Typography variant="body2" align="center">
                            {params.value || 'N/A'}
                          </Typography>
                        </Box>
                      ),
                      align: 'center',
                    },
                    {
                      field: 'location',
                      headerName: 'Location',
                      flex: 1,
                      minWidth: 150,
                      hide: isMediumScreen,
                      sortable: true,
                      filterable: true,
                      headerAlign: 'center',
                      renderCell: (params) => (
                        <Box sx={{ py: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
                          <Typography variant="body2" align="center">
                            {params.value || 'N/A'}
                          </Typography>
                        </Box>
                      ),
                      align: 'center',
                    },
                    {
                      field: 'status',
                      headerName: 'Status',
                      width: 140,
                      headerAlign: 'center',
                      renderCell: (params) => (
                        <Box 
                          display="flex" 
                          justifyContent="center" 
                          sx={{ 
                            py: 1, 
                            width: '100%'
                          }}
                        >
                          <Chip
                            size="small"
                            label={params.value}
                            color={getStatusColor(params.value)}
                            variant="outlined"
                            icon={params.value === 'Verified' ? <VerifiedIcon fontSize="small" /> : undefined}
                            sx={{ minWidth: 85 }}
                          />
                        </Box>
                      ),
                      sortable: true,
                      filterable: true,
                      type: 'singleSelect',
                      valueOptions: ['Verified', 'Pending', 'Rejected'],
                      align: 'center',
                    },
                    {
                      field: 'actions',
                      headerName: 'Actions',
                      width: 120,
                      sortable: false,
                      filterable: false,
                      disableColumnMenu: true,
                      headerAlign: 'center',
                      renderCell: (params) => (
                        <Box 
                          display="flex" 
                          gap={1} 
                          sx={{ 
                            py: 1,
                            width: '100%',
                            justifyContent: 'center'
                          }}
                        >
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewRecruiter(params.row)}
                            >
                              <ViewIcon fontSize="large" />
                            </IconButton>
                          </Tooltip>
                          
                        </Box>
                      ),
                      align: 'center',
                    },
                  ]}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        page: page,
                        pageSize: rowsPerPage
                      },
                    },
                    sorting: {
                      sortModel: [{ field: 'name', sort: 'asc' }],
                    },
                    filter: {
                      filterModel: {
                        items: [],
                        quickFilterValues: [],
                      },
                    },
                  }}
                  pageSizeOptions={[5, 10, 25, 50]}
                  onPaginationModelChange={(model) => {
                    setPage(model.page);
                    setRowsPerPage(model.pageSize);
                  }}
                  disableRowSelectionOnClick
                  onRowSelectionModelChange={(newSelectionModel) => {
                    setSelectedRecruiters(newSelectionModel);
                  }}
                  rowSelectionModel={selectedRecruiters}
                  loading={loading}
                  filterMode="client"
                  slots={{
                    toolbar: CustomToolbar,
                    noRowsOverlay: () => (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 3 }}>
                        <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
                          No recruiters found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          Try adjusting your search or filters
                        </Typography>
                      </Box>
                    ),
                  }}
                  componentsProps={{
                    noRowsOverlay: {
                      sx: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                      },
                    },
                  }}
                  getRowHeight={() => 'auto'}
                  getEstimatedRowHeight={() => 80}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                      px: 2,
                      py: 1.5,
                      whiteSpace: 'normal',
                      borderBottom: `1px solid ${alpha('#0d9488', 0.1)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    },
                    '& .MuiDataGrid-cell:focus': {
                      outline: 'none',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      background: `linear-gradient(135deg, ${alpha('#0d9488', 0.05)} 0%, ${alpha('#06B6D4', 0.03)} 100%)`,
                      fontWeight: 600,
                      borderBottom: `2px solid ${alpha('#0d9488', 0.2)}`,
                      py: 2,
                    },
                    '& .MuiDataGrid-columnHeader': {
                      px: 2,
                      py: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontWeight: 600,
                      textAlign: 'center',
                    },
                    '& .MuiDataGrid-columnHeaderTitleContainer': {
                      display: 'flex',
                      justifyContent: 'center',
                    },
                    '& .MuiDataGrid-row': {
                      '&:hover': {
                        backgroundColor: alpha('#0d9488', 0.04),
                      },
                    },
                    '& .MuiDataGrid-row:nth-of-type(even)': {
                      backgroundColor: alpha('#f8fafc', 0.6),
                    },
                    '& .MuiDataGrid-toolbarContainer': {
                      padding: 2,
                      borderBottom: `1px solid ${alpha('#0d9488', 0.1)}`,
                    },
                    '& .MuiButton-root': {
                      textTransform: 'none',
                    },
                    '& .MuiDataGrid-virtualScroller': {
                      backgroundColor: alpha('#ffffff', 0.8),
                    },
                    '& .MuiCheckbox-root': {
                      color: alpha('#0d9488', 0.6),
                    },
                    // Center checkbox column
                    '& .MuiDataGrid-columnHeaderCheckbox, & .MuiDataGrid-cellCheckbox': {
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }
                  }}
                />
              </Box>)
            )}

            {/* Remove the existing TablePagination as DataGrid has built-in pagination */}
            {isXsScreen && (
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
                  count={handleFilterChange().length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage={isSmallScreen ? "Rows:" : "Rows per page:"}
                />
              </Box>
            )}
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
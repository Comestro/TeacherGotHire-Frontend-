import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  Button,
  Modal,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  Backdrop,
  useMediaQuery,
  useTheme,
  Grid,
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import { DataGrid } from "@mui/x-data-grid";
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  People as PeopleIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Check as CheckIcon,
  Close as CloseActionIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import { FiMoreVertical } from "react-icons/fi";
import Layout from "../Admin/Layout";
import { getHireRequest, updateHireRequest } from "../../services/adminHiringRequest";

const ManageHiringRequests = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [filters, setFilters] = useState({
    status: "all",
    recruiterName: "",
    teacherName: "",
  });

  const [paginationModel, setPaginationModel] = useState({
    pageSize: isMobile ? 5 : 10,
    page: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, pageSize: isMobile ? 5 : 10 }));
  }, [isMobile]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getHireRequest();
        
        if (Array.isArray(response)) {
          const formatData = response.map((item) => ({
            id: item.id,
            recruiterName: item.recruiter_id,
            teacherName: item.teacher_id,
            role: item.role,
            subjects: item.subject,
            status: item.status,
            requestDate: item.date,
          }));
          setData(formatData);
          setFilteredData(formatData);
        }
      } catch (error) {
        console.error("Error fetching hiring requests:", error);
        showSnackbar("Failed to load hiring requests", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((row) => {
      const recruiterMatch = !filters.recruiterName || 
        formatName(row.recruiterName).toLowerCase().includes(filters.recruiterName.toLowerCase());
      const teacherMatch = !filters.teacherName || 
        formatName(row.teacherName).toLowerCase().includes(filters.teacherName.toLowerCase());
      const statusMatch = filters.status === "all" || 
        row.status.toLowerCase() === filters.status.toLowerCase();

      return recruiterMatch && teacherMatch && statusMatch;
    });
    setFilteredData(filtered);
  }, [filters, data]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const formatName = (user) => {
    if (!user) return "N/A";
    if (typeof user === "object") {
      const fname = user.Fname ?? user.first_name ?? user.fname;
      const lname = user.Lname ?? user.last_name ?? user.lname;
      const joined = [fname, lname].filter(Boolean).join(" ").trim();
      if (joined) return joined;
      if (user.name) return user.name;
      if (user.username) return user.username;
      if (user.id != null) return `ID: ${user.id}`;
      return "N/A";
    }
    return String(user);
  };

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    const options = { month: "short", day: "2-digit", year: "numeric" };
    return d.toLocaleDateString("en-US", options);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    
    setSubmitting(true);
    try {
      const recruiterId =
        typeof selectedRequest.recruiterName === 'object'
          ? selectedRequest.recruiterName?.id
          : selectedRequest.recruiterName;
      const teacherId =
        typeof selectedRequest.teacherName === 'object'
          ? selectedRequest.teacherName?.id
          : selectedRequest.teacherName;

      await updateHireRequest(selectedRequest.id, {
        recruiter_id: recruiterId,
        teacher_id: teacherId,
        status: "fulfilled",
      });
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedRequest.id ? { ...item, status: "fulfilled" } : item
        )
      );
      showSnackbar("Request approved successfully!");
      handleCloseModal();
    } catch (error) {
      console.error("Error approving request:", error);
      showSnackbar("Failed to approve request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    
    setSubmitting(true);
    try {
      const recruiterId =
        typeof selectedRequest.recruiterName === 'object'
          ? selectedRequest.recruiterName?.id
          : selectedRequest.recruiterName;
      const teacherId =
        typeof selectedRequest.teacherName === 'object'
          ? selectedRequest.teacherName?.id
          : selectedRequest.teacherName;

      await updateHireRequest(selectedRequest.id, {
        recruiter_id: recruiterId,
        teacher_id: teacherId,
        status: "rejected",
        reject_reason: "Rejected by admin",
      });
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedRequest.id ? { ...item, status: "rejected" } : item
        )
      );
      showSnackbar("Request rejected successfully", "warning");
      handleCloseModal();
    } catch (error) {
      console.error("Error rejecting request:", error);
      showSnackbar("Failed to reject request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: "all",
      recruiterName: "",
      teacherName: "",
    });
  };

  const handleExportData = () => {
    const csvData = filteredData.map((row) => ({
      Recruiter: formatName(row.recruiterName),
      Teacher: formatName(row.teacherName),
      Role: row.role || "N/A",
      Subjects: row.subjects?.map((subject) => subject.subject_name).join(", ") || "N/A",
      Status: row.status,
      Date: formatDate(row.requestDate),
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Recruiter,Teacher,Role,Subjects,Status,Date"]
        .concat(csvData.map((row) => Object.values(row).join(",")))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hiring_requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar("Data exported successfully!", "success");
  };

  const getStatusChip = (status) => {
    const statusLower = status?.toLowerCase();
    let color, bgcolor;
    
    if (statusLower === "fulfilled") {
      color = "#2e7d32";
      bgcolor = "#e8f5e9";
    } else if (statusLower === "rejected") {
      color = "#d32f2f";
      bgcolor = "#ffebee";
    } else {
      color = "#ed6c02";
      bgcolor = "#fff3e0";
    }

    return (
      <Chip
        label={status}
        size="small"
        sx={{
          bgcolor,
          color,
          fontWeight: 600,
          textTransform: 'capitalize',
        }}
      />
    );
  };

  const columns = [
    {
      field: 'recruiter',
      headerName: 'Recruiter',
      flex: 1,
      minWidth: 180,
      valueGetter: (params) => {
        // DataGrid may call valueGetter with undefined params in some cases;
        // guard against that and return a safe fallback.
        if (!params || !params.row) return 'N/A';
        return formatName(params.row.recruiterName);
      },
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#0d9488' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'teacher',
      headerName: 'Teacher',
      flex: 1,
      minWidth: 180,
      valueGetter: (params) => {
        if (!params || !params.row) return 'N/A';
        return formatName(params.row.teacherName);
      },
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          {params.value || '—'}
        </Typography>
      ),
    },
    {
      field: 'subjects',
      headerName: 'Subjects',
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => {
        const row = params?.row;
        if (!row) return 'N/A';
        const subjects = row.subjects;
        if (!Array.isArray(subjects) || subjects.length === 0) return 'N/A';
        return subjects.map((subject) => subject?.subject_name ?? String(subject)).join(', ');
      },
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: 'requestDate',
      headerName: 'Date',
      width: 120,
      valueFormatter: (params) => formatDate(params?.value),
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          {params.formattedValue}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(params.row);
            }}
            sx={{
              bgcolor: alpha('#0d9488', 0.1),
              color: '#0d9488',
              '&:hover': { bgcolor: alpha('#0d9488', 0.2) },
            }}
          >
            <FiMoreVertical />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const handleRowClick = (params) => {
    handleOpenModal(params.row);
  };

  return (
    <Layout>
      {/* Compact Header */}
      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          bgcolor: '#fff',
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}
          >
            Manage Hiring Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review, approve, or reject teacher hiring requests
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh Data">
            <IconButton
              onClick={() => window.location.reload()}
              sx={{
                bgcolor: alpha('#0d9488', 0.1),
                color: '#0d9488',
                '&:hover': { bgcolor: alpha('#0d9488', 0.2) },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportData}
            sx={{
              bgcolor: '#0d9488',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              '&:hover': { bgcolor: '#0a7a6f' },
            }}
          >
            Export
          </Button>
        </Stack>
      </Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Filters Section */}
          <Box
            sx={{
              mb: 3,
              pb: 2,
              borderBottom: '2px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1E293B' }}>
              Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    sx={{
                      borderRadius: 2,
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#0d9488',
                      },
                    }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="fulfilled">Fulfilled</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Recruiter Name"
                  size="small"
                  fullWidth
                  value={filters.recruiterName}
                  onChange={(e) => handleFilterChange("recruiterName", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#0d9488', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: '#0d9488' },
                      '&.Mui-focused fieldset': { borderColor: '#0d9488' },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Teacher Name"
                  size="small"
                  fullWidth
                  value={filters.teacherName}
                  onChange={(e) => handleFilterChange("teacherName", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#0d9488', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: '#0d9488' },
                      '&.Mui-focused fieldset': { borderColor: '#0d9488' },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  sx={{
                    borderColor: '#64748B',
                    color: '#64748B',
                    textTransform: 'none',
                    borderRadius: 2,
                    height: '40px',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#64748B',
                      bgcolor: alpha('#64748B', 0.05),
                    },
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Data Grid */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#0d9488' }} size={48} />
            </Box>
          ) : filteredData.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
              <PeopleIcon sx={{ fontSize: 80, color: '#64748B', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ color: '#64748B', mb: 1, fontWeight: 600 }}>
                No hiring requests found
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                {filters.status !== "all" || filters.recruiterName || filters.teacherName
                  ? 'Try adjusting your filters'
                  : 'No hiring requests have been submitted yet'}
              </Typography>
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                height: 500,
                width: '100%',
                '& .MuiDataGrid-root': { border: 'none' },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: alpha('#0d9488', 0.05),
                  borderBottom: '2px solid',
                  borderColor: '#0d9488',
                  '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, color: '#1E293B' },
                },
                '& .MuiDataGrid-row': {
                  '&:hover': { bgcolor: alpha('#0d9488', 0.04), cursor: 'pointer' },
                  '&.Mui-selected': {
                    bgcolor: alpha('#0d9488', 0.08),
                    '&:hover': { bgcolor: alpha('#0d9488', 0.12) },
                  },
                },
                '& .MuiCheckbox-root': {
                  color: '#0d9488',
                  '&.Mui-checked': { color: '#0d9488' },
                },
              }}
            >
              <DataGrid
                rows={filteredData}
                columns={columns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25, 50]}
                loading={loading}
                disableRowSelectionOnClick
                onRowClick={handleRowClick}
                getRowId={(row) => row.id}
                getRowHeight={() => 'auto'}
                getEstimatedRowHeight={() => 60}
                sx={{
                  '& .MuiDataGrid-row': { minHeight: '52px!important' },
                  '& .MuiDataGrid-cell': { py: 1.5 },
                }}
              />
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Modal
        open={modalOpen}
        onClose={() => !submitting && handleCloseModal()}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500, sx: { backdropFilter: 'blur(4px)' } }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '600px' },
            bgcolor: 'background.paper',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #0d9488 0%, #06B6D4 100%)',
              color: '#F8FAFC',
              p: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <WorkIcon />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Request Details
              </Typography>
            </Box>
            {!submitting && (
              <IconButton
                onClick={handleCloseModal}
                sx={{ color: '#F8FAFC', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>

          {selectedRequest && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      bgcolor: alpha('#0d9488', 0.05),
                      borderRadius: 2,
                      p: 2,
                      border: '1px solid',
                      borderColor: alpha('#0d9488', 0.2),
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#64748B', mb: 0.5, display: 'block' }}>
                      Recruiter
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
                      {formatName(selectedRequest.recruiterName)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      bgcolor: '#F8FAFC',
                      borderRadius: 2,
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#64748B', mb: 0.5, display: 'block' }}>
                      Teacher
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
                      {formatName(selectedRequest.teacherName)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748B', mb: 0.5, display: 'block' }}>
                    Role
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E293B' }}>
                    {selectedRequest.role || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748B', mb: 0.5, display: 'block' }}>
                    Status
                  </Typography>
                  {getStatusChip(selectedRequest.status)}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#64748B', mb: 1, display: 'block' }}>
                    Subjects
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedRequest.subjects?.map((subject, index) => (
                      <Chip
                        key={index}
                        label={subject.subject_name}
                        size="small"
                        sx={{
                          bgcolor: alpha('#0d9488', 0.1),
                          color: '#0d9488',
                          fontWeight: 600,
                        }}
                      />
                    )) || <Typography variant="body2" color="text.secondary">No subjects</Typography>}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#64748B', mb: 0.5, display: 'block' }}>
                    Request Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E293B' }}>
                    {formatDate(selectedRequest.requestDate)}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#64748B',
                    color: '#64748B',
                    '&:hover': { borderColor: '#64748B', bgcolor: alpha('#64748B', 0.05) },
                  }}
                >
                  Close
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CheckIcon />}
                  onClick={handleApproveRequest}
                  disabled={submitting || selectedRequest.status === 'fulfilled'}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#0d9488',
                    '&:hover': { bgcolor: '#0a7a6f' },
                  }}
                >
                  {submitting ? <CircularProgress size={24} sx={{ color: '#F8FAFC' }} /> : 'Approve'}
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  startIcon={<CloseActionIcon />}
                  onClick={handleRejectRequest}
                  disabled={submitting || selectedRequest.status === 'rejected'}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Reject'}
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: { xs: 7, sm: 8 } }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          icon={snackbar.severity === 'success' ? <CheckCircleIcon /> : undefined}
          sx={{
            width: '100%',
            minWidth: '300px',
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            '& .MuiAlert-message': { maxWidth: '100%', wordBreak: 'break-word', fontWeight: 500 },
            ...(snackbar.severity === 'success' && { bgcolor: '#0d9488', color: '#F8FAFC' }),
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Backdrop
        sx={{
          color: '#F8FAFC',
          zIndex: (theme) => theme.zIndex.drawer + 2,
          backdropFilter: 'blur(4px)',
          bgcolor: 'rgba(13, 148, 136, 0.2)',
        }}
        open={submitting}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={56} thickness={4} sx={{ color: '#0d9488', mb: 2 }} />
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E293B' }}>
            Processing...
          </Typography>
        </Box>
      </Backdrop>
    </Layout>
  );
};

export default ManageHiringRequests;
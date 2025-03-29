import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TablePagination,
  Grid,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  IconButton,
  Card,
  CardContent,
  Divider,
  Tooltip,
  CircularProgress,
  Badge,
  Fade,
  Stack,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaSearch,
  FaFilter,
  FaKey,
  FaUser,
  FaCalendarAlt,
  FaBuilding,
  FaBook
} from "react-icons/fa";
import {
  MdClose,
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdRefresh,
  MdFilterList,
  MdInfo
} from "react-icons/md";
import { debounce } from "lodash";
import Layout from "../Admin/Layout";
import { getPasskey, updatePasskey } from "../../services/adminPasskeyApi";

// Enhanced styled components with better shadow and border effects
const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  backdropFilter: "blur(3px)",
}));

const ModalContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: "600px",
  width: "100%",
  maxHeight: "80vh",
  overflow: "auto",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    maxWidth: "95%",
  }
}));

// Improved status chip with better visual distinction
const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  textTransform: "uppercase",
  fontSize: "0.75rem",
  borderRadius: "16px",
  padding: "0 2px",
  height: "26px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  backgroundColor:
    status === "requested"
      ? theme.palette?.warning?.main || '#ff9800'
      : status === "fulfilled"
        ? theme.palette?.success?.main || '#4caf50'
        : theme.palette?.error?.main || '#f44336',
  color: "#fff",
  '&:hover': {
    backgroundColor:
      status === "requested"
        ? theme.palette?.warning?.dark || '#f57c00'
        : status === "fulfilled"
          ? theme.palette?.success?.dark || '#388e3c'
          : theme.palette?.error?.dark || '#d32f2f',
  }
}));

// Enhanced card for mobile view
const StyledCard = styled(Card)(({ theme, status }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: "transform 0.2s, box-shadow 0.2s",
  borderLeft: `4px solid ${status === "fulfilled"
      ? theme.palette?.success?.main || '#4caf50'
      : status === "rejected"
        ? theme.palette?.error?.main || '#f44336'
        : theme.palette?.warning?.main || '#ff9800'
    }`,
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
  },
}));

// Enhanced action button
const ActionButton = styled(IconButton)(({ theme, color = "primary" }) => ({
  backgroundColor: `${theme?.palette?.[color]?.main || '#1976d2'}20`,
  "&:hover": {
    backgroundColor: `${theme?.palette?.[color]?.main || '#1976d2'}30`,
  }
}));

const PasskeyManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailsModal, setDetailsModal] = useState({ open: false, data: null });
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: null,
    data: null,
  });
  const [processing, setProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch passkey data from the API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getPasskey();
      setData(response);
    } catch (error) {
      console.error("Error fetching passkey data:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch passkey data. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset page when filtering changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter]);

  // Adjust rows per page based on screen size
  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : 10);
  }, [isMobile]);

  const handleSearch = useCallback(
    debounce((term) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Make sure we safely access properties with optional chaining
      const matchesSearch =
        (item.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.exam?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.center?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const paginatedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const getStatusCount = (status) => {
    return data.filter(item => item.status === status).length;
  };

  const handleApprove = async (id, code, userId) => {
    setProcessing(true);
    try {
      const payload = {
        user: userId,
        code: code,
        status: "fulfilled",
      };
      await updatePasskey(id, payload);
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "fulfilled" } : item
        )
      );
      setSnackbar({
        open: true,
        message: "Passkey approved successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error approving request:", error);
      setSnackbar({
        open: true,
        message: "Failed to approve passkey. Please try again.",
        severity: "error",
      });
    } finally {
      setProcessing(false);
      setConfirmModal({ open: false, type: null, data: null });
    }
  };

  const handleReject = async (id, code, userId) => {
    if (!rejectReason.trim()) {
      setSnackbar({
        open: true,
        message: "Please provide a reason for rejection",
        severity: "warning",
      });
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        user: userId,
        code: code,
        status: "rejected",
        reason: rejectReason,
      };
      await updatePasskey(id, payload);
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "rejected", reject_reason: rejectReason } : item
        )
      );
      setSnackbar({
        open: true,
        message: "Passkey rejected successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
      setSnackbar({
        open: true,
        message: "Failed to reject passkey. Please try again.",
        severity: "error",
      });
    } finally {
      setProcessing(false);
      setConfirmModal({ open: false, type: null, data: null });
      setRejectReason("");
    }
  };

  // Render mobile card view with enhanced design
  const renderMobileCard = (row) => {
    return (
      <StyledCard
        key={row.id}
        variant="outlined"
        status={row.status}
        sx={{ mb: 2 }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <FaUser color={theme?.palette?.primary?.main || '#1976d2'} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {row.user?.email || "N/A"}
              </Typography>
            </Stack>
            <StatusChip
              size="small"
              label={
                row.status === "fulfilled" ? "Fulfilled" :
                  row.status === "rejected" ? "Rejected" : "Requested"
              }
              status={row.status}
            />
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FaBook size={14} color={theme?.palette?.text?.secondary || '#757575'} />
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                  Exam
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                {row.exam?.name || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FaBuilding size={14} color={theme?.palette?.text?.secondary || '#757575'} />
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                  Center
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                {row.center?.name || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FaKey size={14} color={theme?.palette?.text?.secondary || '#757575'} />
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                  Passkey
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  fontFamily: row.status === "fulfilled" ? 'monospace' : 'inherit',
                  fontWeight: row.status === "fulfilled" ? 600 : 400,
                  fontStyle: row.status !== "fulfilled" ? 'italic' : 'normal',
                  color: row.status === "fulfilled" ? 'text.primary' : 'text.secondary',
                  bgcolor: row.status === "fulfilled" ? 'action.hover' : 'transparent',
                  p: row.status === "fulfilled" ? 0.5 : 0,
                  borderRadius: 1,
                  display: 'inline-block'
                }}
              >
                {row.status === "fulfilled"
                  ? row.code || "N/A"
                  : row.status === "rejected" ? "Access denied" : "Pending approval"
                }
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FaCalendarAlt size={14} color={theme?.palette?.text?.secondary || '#757575'} />
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                  Date
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                {row.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A"}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
            <Tooltip title="View Details">
              <ActionButton
                size="small"
                onClick={() => setDetailsModal({ open: true, data: row })}
                color="primary"
              >
                <FaEye />
              </ActionButton>
            </Tooltip>

            {row.status === "requested" && (
              <>
                <Tooltip title="Approve">
                  <ActionButton
                    size="small"
                    color="success"
                    onClick={() =>
                      setConfirmModal({
                        open: true,
                        type: "approve",
                        data: row,
                      })
                    }
                  >
                    <FaCheck />
                  </ActionButton>
                </Tooltip>
                <Tooltip title="Reject">
                  <ActionButton
                    size="small"
                    color="error"
                    onClick={() =>
                      setConfirmModal({
                        open: true,
                        type: "reject",
                        data: row,
                      })
                    }
                  >
                    <FaTimes />
                  </ActionButton>
                </Tooltip>
              </>
            )}
          </Box>
        </CardContent>
      </StyledCard>
    );
  };

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header section with title and summary stats */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 2,
            backgroundColor: theme?.palette?.primary?.main || '#1976d2',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{
            position: 'absolute',
            right: '-20px',
            top: '-20px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }} />

          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0,
            position: 'relative',
            zIndex: 1
          }}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 700,
                mb: isMobile ? 1 : 0,
                width: isMobile ? '100%' : 'auto'
              }}
            >
              Manage Passkeys
            </Typography>

            <Button
              variant="contained"
              startIcon={<MdRefresh />}
              onClick={fetchData}
              disabled={loading}
              size={isMobile ? "small" : "medium"}
              sx={{
                width: isMobile ? '100%' : 'auto',
                backgroundColor: 'rgba(255,255,255,0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              Refresh
            </Button>
          </Box>

          {!loading && (
            <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Chip
                icon={<MdFilterList style={{ color: 'white' }} />}
                label={`Total: ${data.length}`}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
              <Chip
                icon={<MdAccessTime style={{ color: 'white' }} />}
                label={`Pending: ${getStatusCount('requested')}`}
                sx={{
                  backgroundColor: theme?.palette?.warning?.dark || '#f57c00',
                  color: 'white',
                  fontWeight: 600
                }}
              />
              <Chip
                icon={<MdCheckCircle style={{ color: 'white' }} />}
                label={`Approved: ${getStatusCount('fulfilled')}`}
                sx={{
                  backgroundColor: theme?.palette?.success?.dark || '#388e3c',
                  color: 'white',
                  fontWeight: 600
                }}
              />
              <Chip
                icon={<MdCancel style={{ color: 'white' }} />}
                label={`Rejected: ${getStatusCount('rejected')}`}
                sx={{
                  backgroundColor: theme?.palette?.error?.dark || '#d32f2f',
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Box>
          )}
        </Paper>

        {/* Search and Filter Bar */}
        <Paper
          elevation={1}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor="search-input">Search</InputLabel>
                <OutlinedInput
                  id="search-input"
                  placeholder="Search by email, exam, center or passkey"
                  onChange={(e) => handleSearch(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <FaSearch />
                    </InputAdornment>
                  }
                  label="Search"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status Filter</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                  startAdornment={
                    <InputAdornment position="start">
                      <FaFilter />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="requested">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        size="small"
                        label="Requested"
                        sx={{
                          backgroundColor: theme?.palette?.warning?.main || '#ff9800',
                          color: 'white',
                          height: '20px',
                          fontSize: '0.7rem'
                        }}
                      />
                      Pending Approval
                    </Box>
                  </MenuItem>
                  <MenuItem value="fulfilled">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        size="small"
                        label="Fulfilled"
                        sx={{
                          backgroundColor: theme?.palette?.success?.main || '#4caf50',
                          color: 'white',
                          height: '20px',
                          fontSize: '0.7rem'
                        }}
                      />
                      Approved
                    </Box>
                  </MenuItem>
                  <MenuItem value="rejected">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        size="small"
                        label="Rejected"
                        sx={{
                          backgroundColor: theme?.palette?.error?.main || '#f44336',
                          color: 'white',
                          height: '20px',
                          fontSize: '0.7rem'
                        }}
                      />
                      Denied
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Loading state */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 6, flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={44} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
              Loading passkey data...
            </Typography>
          </Box>
        ) : filteredData.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: theme?.palette?.grey?.[50] || '#f5f5f5',
              border: '1px dashed rgba(0,0,0,0.12)'
            }}
          >
            <MdInfo style={{ fontSize: '48px', color: theme?.palette?.text?.secondary || '#757575', marginBottom: '16px' }} />
            <Typography variant="h6" color="textSecondary" fontWeight={600}>
              No passkey requests found
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ maxWidth: '500px', mx: 'auto', mt: 1 }}>
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search criteria or filter settings to see more results."
                : "There are currently no passkey requests in the system."}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<MdRefresh />}
              sx={{ mt: 3 }}
              onClick={fetchData}
            >
              Refresh Data
            </Button>
          </Paper>
        ) : isMobile ? (
          // Mobile view with cards
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="textSecondary">
                Showing {filteredData.length} results
              </Typography>
              {statusFilter !== "all" && (
                <Chip
                  label={`Filtered: ${statusFilter}`}
                  size="small"
                  onDelete={() => setStatusFilter("all")}
                  variant="outlined"
                  color={
                    statusFilter === "fulfilled" ? "success" :
                      statusFilter === "rejected" ? "error" : "warning"
                  }
                />
              )}
            </Box>
            <Box>
              {paginatedData.map(renderMobileCard)}
            </Box>
          </>
        ) : (
          // Desktop table view with enhanced appearance
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.04)'
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme?.palette?.grey?.[50] || '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>User Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Exam Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Exam Center</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Passkey</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Request Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: theme?.palette?.action?.hover || '#f5f5f5'
                      },
                      borderLeft: `4px solid ${row.status === "fulfilled"
                          ? theme?.palette?.success?.main || '#4caf50'
                          : row.status === "rejected"
                            ? theme?.palette?.error?.main || '#f44336'
                            : theme?.palette?.warning?.main || '#ff9800'
                        }`,
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FaUser color={theme?.palette?.primary?.main || '#1976d2'} size={14} />
                        <Typography fontWeight={500}>{row.user?.email || "N/A"}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.exam?.name || "N/A"}</TableCell>
                    <TableCell>{row.center?.name || "N/A"}</TableCell>
                    <TableCell>
                      {row.status === "fulfilled" ? (
                        <Box sx={{
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          display: 'inline-block',
                          backgroundColor: theme?.palette?.action?.hover || '#f5f5f5',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid rgba(0,0,0,0.08)'
                        }}>
                          {row.code || "N/A"}
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{
                            fontStyle: 'italic',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          {row.status === "rejected" ? (
                            <>
                              <MdCancel color={theme?.palette?.error?.main || '#f44336'} />
                              Access denied
                            </>
                          ) : (
                            <>
                              <MdAccessTime color={theme?.palette?.warning?.main || '#ff9800'} />
                              Pending approval
                            </>
                          )}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={
                          row.status === "fulfilled" ? "Fulfilled" :
                            row.status === "rejected" ? "Rejected" : "Requested"
                        }
                        status={row.status}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FaCalendarAlt size={12} color={theme?.palette?.text?.secondary || '#757575'} />
                        {row.created_at
                          ? new Date(row.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                          : "N/A"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <ActionButton
                            onClick={() => setDetailsModal({ open: true, data: row })}
                            size="small"
                            color="primary"
                          >
                            <FaEye />
                          </ActionButton>
                        </Tooltip>

                        {row.status === "requested" && (
                          <>
                            <Tooltip title="Approve Request">
                              <ActionButton
                                color="success"
                                onClick={() =>
                                  setConfirmModal({
                                    open: true,
                                    type: "approve",
                                    data: row,
                                  })
                                }
                                size="small"
                              >
                                <FaCheck />
                              </ActionButton>
                            </Tooltip>
                            <Tooltip title="Reject Request">
                              <ActionButton
                                color="error"
                                onClick={() =>
                                  setConfirmModal({
                                    open: true,
                                    type: "reject",
                                    data: row,
                                  })
                                }
                                size="small"
                              >
                                <FaTimes />
                              </ActionButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination control */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <TablePagination
            component={Paper}
            elevation={1}
            sx={{
              borderRadius: '8px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              overflow: 'hidden'
            }}
            count={filteredData.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={isMobile ? [5, 10] : [10, 25, 50]}
            labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
          />
        </Box>

        {/* Details Modal with enhanced styling */}
        <StyledModal
          open={detailsModal.open}
          onClose={() => setDetailsModal({ open: false, data: null })}
          closeAfterTransition
        >
          <Fade in={detailsModal.open}>
            <ModalContent>
              {detailsModal.data && (
                <>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme?.palette?.primary?.main || '#1976d2' }}>
                      Request Details
                    </Typography>
                    <IconButton
                      onClick={() => setDetailsModal({ open: false, data: null })}
                      size="small"
                      sx={{
                        bgcolor: theme?.palette?.grey?.[100] || '#f5f5f5',
                        '&:hover': { bgcolor: theme?.palette?.grey?.[200] || '#e0e0e0' }
                      }}
                    >
                      <MdClose />
                    </IconButton>
                  </Box>

                  <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusChip
                      label={
                        detailsModal.data.status === "fulfilled" ? "Fulfilled" :
                          detailsModal.data.status === "rejected" ? "Rejected" : "Requested"
                      }
                      status={detailsModal.data.status}
                      sx={{ borderRadius: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {detailsModal.data.status === "fulfilled"
                        ? "This request has been approved"
                        : detailsModal.data.status === "rejected"
                          ? "This request has been denied"
                          : "This request is awaiting approval"
                      }
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{
                        fontWeight: 600,
                        color: theme?.palette?.primary?.main || '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <FaUser color={theme?.palette?.primary?.main || '#1976d2'} size={16} />
                        User Information
                      </Typography>
                      
                      <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 1 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary" fontWeight={500}>
                              Email:
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500 }}>
                              {detailsModal.data.user?.email || "—"}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary" fontWeight={500}>
                              Full Name:
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 0.5 }}>
                              {detailsModal.data.user?.name || "—"}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary" fontWeight={500}>
                              Phone Number:
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 0.5 }}>
                              {detailsModal.data.user?.phone || "—"}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary" fontWeight={500}>
                              Date of Birth:
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 0.5 }}>
                              {detailsModal.data.user?.dob ? 
                                new Date(detailsModal.data.user.dob).toLocaleDateString('en-US', {
                                  year: 'numeric', month: 'long', day: 'numeric'
                                }) : "—"}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Divider sx={{ my: 1.5 }} />
                            <Typography variant="body2" color="textSecondary" fontWeight={500}>
                              Address:
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 0.5 }}>
                              {detailsModal.data.user?.address || "—"}
                              {detailsModal.data.user?.city && `, ${detailsModal.data.user.city}`}
                              {detailsModal.data.user?.state && `, ${detailsModal.data.user.state}`}
                              {detailsModal.data.user?.zip && ` ${detailsModal.data.user.zip}`}
                            </Typography>
                            {detailsModal.data.user?.country && (
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {detailsModal.data.user.country}
                              </Typography>
                            )}
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{
                        fontWeight: 600,
                        color: theme?.palette?.primary?.main || '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <FaBook color={theme?.palette?.primary?.main || '#1976d2'} size={16} />
                        Exam Information
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 1 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary" fontWeight={500}>
                              Exam Name:
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 0.5 }}>
                              {detailsModal.data.exam?.name || "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary" fontWeight={500}>
                              Exam Date:
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 0.5 }}>
                              {detailsModal.data.exam?.date ? new Date(detailsModal.data.exam.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary" fontWeight={500}>
                              Exam Center:
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 0.5 }}>
                              {detailsModal.data.center?.name || "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary" fontWeight={500}>
                              Center Address:
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 0.5 }}>
                              {detailsModal.data.center?.address || "N/A"}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{
                        fontWeight: 600,
                        color: theme?.palette?.primary?.main || '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <FaKey color={theme?.palette?.primary?.main || '#1976d2'} size={16} />
                        Passkey Details
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          mt: 1,
                          borderRadius: 1,
                          bgcolor: theme?.palette?.background?.default || '#ffffff'
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary" fontWeight={500}>
                              Status:
                            </Typography>
                            <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                              <StatusChip
                                label={
                                  detailsModal.data.status === "fulfilled" ? "Fulfilled" :
                                    detailsModal.data.status === "rejected" ? "Rejected" : "Requested"
                                }
                                status={detailsModal.data.status}
                                size="small"
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary" fontWeight={500}>
                              Request Date:
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 0.5 }}>
                              {detailsModal.data.created_at ? new Date(detailsModal.data.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="textSecondary" fontWeight={500}>
                              Passkey:
                            </Typography>
                            {detailsModal.data.status === "fulfilled" ? (
                              <Box sx={{
                                mt: 0.5,
                                p: 1.5,
                                bgcolor: theme?.palette?.success?.light || '#a5d6a7',
                                borderRadius: 1,
                                border: `1px solid ${theme?.palette?.success?.main || '#4caf50'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontFamily: 'monospace',
                                    fontSize: '1.2rem',
                                    fontWeight: 600,
                                    letterSpacing: 1
                                  }}
                                >
                                  {detailsModal.data.code || "N/A"}
                                </Typography>
                                <Tooltip title="Copy Passkey">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      navigator.clipboard.writeText(detailsModal.data.code || "");
                                      setSnackbar({
                                        open: true,
                                        message: "Passkey copied to clipboard",
                                        severity: "success"
                                      });
                                    }}
                                  >
                                    <FaKey size={14} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            ) : (
                              <Box sx={{
                                mt: 0.5,
                                p: 1.5,
                                bgcolor: detailsModal.data.status === "rejected"
                                  ? theme?.palette?.error?.light || '#ef9a9a'
                                  : theme?.palette?.warning?.light || '#ffe082',
                                borderRadius: 1,
                                border: `1px solid ${detailsModal.data.status === "rejected"
                                  ? theme?.palette?.error?.main || '#f44336'
                                  : theme?.palette?.warning?.main || '#ff9800'}`
                              }}>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    fontStyle: 'italic'
                                  }}
                                >
                                  {detailsModal.data.status === "rejected" ? (
                                    <>
                                      <MdCancel color={theme?.palette?.error?.main || '#f44336'} />
                                      Access denied - Request was rejected
                                    </>
                                  ) : (
                                    <>
                                      <MdAccessTime color={theme?.palette?.warning?.main || '#ff9800'} />
                                      Pending approval - Awaiting admin decision
                                    </>
                                  )}
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                          {detailsModal.data.status === "rejected" && detailsModal.data.reject_reason && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="textSecondary" fontWeight={500}>
                                Rejection Reason:
                              </Typography>
                              <Box sx={{
                                mt: 0.5,
                                p: 1.5,
                                bgcolor: 'rgba(0,0,0,0.03)',
                                borderRadius: 1,
                                border: '1px solid rgba(0,0,0,0.09)'
                              }}>
                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                  "{detailsModal.data.reject_reason}"
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {detailsModal.data.status === "requested" && (
                      <>
                        <Button
                          variant="contained"
                          startIcon={<FaCheck />}
                          color="success"
                          onClick={() =>
                            setConfirmModal({
                              open: true,
                              type: "approve",
                              data: detailsModal.data,
                            })
                          }
                        >
                          Approve Request
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<FaTimes />}
                          color="error"
                          onClick={() =>
                            setConfirmModal({
                              open: true,
                              type: "reject",
                              data: detailsModal.data,
                            })
                          }
                        >
                          Reject Request
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outlined"
                      onClick={() => setDetailsModal({ open: false, data: null })}
                    >
                      Close
                    </Button>
                  </Box>
                </>
              )}
            </ModalContent>
          </Fade>
        </StyledModal>

        {/* Confirmation Modal */}
        <StyledModal
          open={confirmModal.open}
          onClose={() => setConfirmModal({ open: false, type: null, data: null })}
          closeAfterTransition
        >
          <Fade in={confirmModal.open}>
            <ModalContent sx={{ maxWidth: 450 }}>
              {confirmModal.data && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: confirmModal.type === "approve" ? theme?.palette?.success?.main || '#4caf50' : theme?.palette?.error?.main || '#f44336' }}>
                      {confirmModal.type === "approve" ? "Approve Passkey Request?" : "Reject Passkey Request?"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {confirmModal.type === "approve"
                        ? "Are you sure you want to approve this passkey request? This will generate a passkey for the user."
                        : "Are you sure you want to reject this passkey request? This action will deny access for this user."}
                    </Typography>
                  </Box>

                  <Box sx={{ bgcolor: theme?.palette?.background?.default || '#ffffff', p: 2, borderRadius: 1, mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Request Details:
                    </Typography>
                    <Typography variant="body2">
                      <strong>User:</strong> {confirmModal.data.user?.email || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Exam:</strong> {confirmModal.data.exam?.name || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Center:</strong> {confirmModal.data.center?.name || "N/A"}
                    </Typography>
                  </Box>

                  {confirmModal.type === "reject" && (
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        label="Reason for Rejection"
                        variant="outlined"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        required
                        multiline
                        rows={2}
                        placeholder="Please provide a reason for rejecting this request"
                        error={rejectReason.trim() === ""}
                        helperText={rejectReason.trim() === "" ? "Rejection reason is required" : ""}
                      />
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setConfirmModal({ open: false, type: null, data: null });
                        setRejectReason("");
                      }}
                      disabled={processing}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color={confirmModal.type === "approve" ? "success" : "error"}
                      onClick={() => {
                        if (confirmModal.type === "approve") {
                          handleApprove(
                            confirmModal.data.id,
                            confirmModal.data.code,
                            confirmModal.data.user?.id
                          );
                        } else {
                          handleReject(
                            confirmModal.data.id,
                            confirmModal.data.code,
                            confirmModal.data.user?.id
                          );
                        }
                      }}
                      disabled={processing || (confirmModal.type === "reject" && rejectReason.trim() === "")}
                      startIcon={processing ? <CircularProgress size={16} color="inherit" /> : confirmModal.type === "approve" ? <FaCheck /> : <FaTimes />}
                    >
                      {processing ? "Processing..." : confirmModal.type === "approve" ? "Approve" : "Reject"}
                    </Button>
                  </Box>
                </>
              )}
            </ModalContent>
          </Fade>
        </StyledModal>

        {/* Snackbar notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            elevation={6}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default PasskeyManagement;

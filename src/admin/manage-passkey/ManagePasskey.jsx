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
} from "@mui/material";
import { styled } from "@mui/system";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaSearch,
  FaFilter
} from "react-icons/fa";
import {
  MdClose,
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdRefresh
} from "react-icons/md";
import { debounce } from "lodash";
import Layout from "../Admin/Layout";
import { getPasskey, updatePasskey } from "../../services/adminPasskeyApi";

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
}));

const ModalContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: "600px",
  width: "100%",
  maxHeight: "80vh",
  overflow: "auto",
  borderRadius: theme.shape.borderRadius * 2,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    maxWidth: "95%",
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 500,
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

  // Render mobile card view
  const renderMobileCard = (row) => {
    return (
      <Card
        key={row.id}
        variant="outlined"
        sx={{
          mb: 2,
          borderLeft: `4px solid ${row.status === "fulfilled"
            ? theme.palette?.success?.main || '#4caf50'
            : row.status === "rejected"
              ? theme.palette?.error?.main || '#f44336'
              : theme.palette?.warning?.main || '#ff9800'
            }`
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {row.user?.email || "N/A"}
            </Typography>
            <StatusChip
              size="small"
              label={
                row.status === "fulfilled" ? "Fulfilled" :
                  row.status === "rejected" ? "Rejected" : "Requested"
              }
              status={row.status}
            />
          </Box>

          <Divider sx={{ my: 1 }} />

          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">
                Exam:
              </Typography>
              <Typography variant="body2">
                {row.exam?.name || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">
                Center:
              </Typography>
              <Typography variant="body2">
                {row.center?.name || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">
                Passkey:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {row.code || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">
                Date:
              </Typography>
              <Typography variant="body2">
                {row.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A"}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => setDetailsModal({ open: true, data: row })}
                color="primary"
              >
                <FaEye />
              </IconButton>
            </Tooltip>

            {row.status === "requested" && (
              <>
                <Tooltip title="Approve">
                  <IconButton
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
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject">
                  <IconButton
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
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0
        }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              fontWeight: 600,
              mb: isMobile ? 1 : 0,
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Manage Passkeys
          </Typography>

          <Button
            variant="outlined"
            startIcon={<MdRefresh />}
            onClick={fetchData}
            disabled={loading}
            size={isMobile ? "small" : "medium"}
            sx={{ width: isMobile ? '100%' : 'auto' }}
          >
            Refresh
          </Button>
        </Box>

        <Paper
          elevation={2}
          sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search"
                placeholder="Search by email, exam, center or passkey"
                onChange={(e) => handleSearch(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: <FaSearch style={{ marginRight: 8 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status Filter</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                  startAdornment={<FaFilter style={{ marginRight: 8 }} />}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="requested">Requested</MenuItem>
                  <MenuItem value="fulfilled">Fulfilled</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredData.length === 0 ? (
          <Paper
            elevation={2}
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: theme.palette.grey[50]
            }}
          >
            <Typography variant="h6" color="textSecondary">
              No passkey requests found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter"
                : "There are no passkey requests at this time"}
            </Typography>
          </Paper>
        ) : isMobile ? (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Showing {filteredData.length} results
              </Typography>
            </Box>
            <Box>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(renderMobileCard)}
            </Box>
          </>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: 2
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>User Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Exam Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Exam Center</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Passkey</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Request Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        '&:nth-of-type(odd)': {
                          backgroundColor: theme.palette.action.hover
                        }
                      }}
                    >
                      <TableCell>{row.user?.email || "N/A"}</TableCell>
                      <TableCell>{row.exam?.name || "N/A"}</TableCell>
                      <TableCell>{row.center?.name || "N/A"}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                        {row.code || "N/A"}
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
                        {row.created_at
                          ? new Date(row.created_at).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => setDetailsModal({ open: true, data: row })}
                              size="small"
                              color="primary"
                            >
                              <FaEye />
                            </IconButton>
                          </Tooltip>

                          {row.status === "requested" && (
                            <>
                              <Tooltip title="Approve Request">
                                <IconButton
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
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject Request">
                                <IconButton
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
                                </IconButton>
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

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <TablePagination
            component="div"
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

        {/* Details Modal */}
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
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Request Details
                    </Typography>
                    <IconButton
                      onClick={() => setDetailsModal({ open: false, data: null })}
                      size="small"
                    >
                      <MdClose />
                    </IconButton>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <StatusChip
                      label={
                        detailsModal.data.status === "fulfilled" ? "Fulfilled" :
                          detailsModal.data.status === "rejected" ? "Rejected" : "Requested"
                      }
                      status={detailsModal.data.status}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        User Information
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 1 }}>
                        <Typography variant="body1">
                          <strong>Email:</strong> {detailsModal.data.user?.email || "N/A"}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Exam Details
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 1 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body1">
                              <strong>Name:</strong> {detailsModal.data.exam?.name || "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body1">
                              <strong>Center:</strong> {detailsModal.data.center?.name || "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body1">
                              <strong>Passkey:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{detailsModal.data.code || "N/A"}</span>
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body1">
                              <strong>Request Date:</strong>{" "}
                              {new Date(detailsModal.data.created_at).toLocaleString()}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>

                    {detailsModal.data.status === "rejected" && detailsModal.data.reject_reason && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                          Rejection Reason
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            mt: 1,
                            borderRadius: 1,
                            borderColor: theme.palette.error.light,
                            backgroundColor: theme.palette.error.light + '10'
                          }}
                        >
                          <Typography variant="body1">
                            {detailsModal.data.reject_reason}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>

                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
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

        {/* Confirm Modal */}
        <StyledModal
          open={confirmModal.open}
          onClose={() =>
            !processing && setConfirmModal({ open: false, type: null, data: null })
          }
          closeAfterTransition
        >
          <Fade in={confirmModal.open}>
            <ModalContent>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {confirmModal.type === "approve" ? "Approve Request" : "Reject Request"}
                </Typography>
                <IconButton
                  onClick={() => !processing && setConfirmModal({ open: false, type: null, data: null })}
                  size="small"
                  disabled={processing}
                >
                  <MdClose />
                </IconButton>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {confirmModal.type === "approve" ? (
                <>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Are you sure you want to approve this passkey request from <strong>{confirmModal.data?.user?.email || "Unknown User"}</strong>?
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => !processing && setConfirmModal({ open: false, type: null, data: null })}
                      disabled={processing}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        handleApprove(
                          confirmModal.data.id,
                          confirmModal.data.code,
                          confirmModal.data.user.id
                        )
                      }
                      disabled={processing}
                      startIcon={processing ? <CircularProgress size={20} /> : <FaCheck />}
                    >
                      {processing ? "Processing..." : "Confirm Approval"}
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Please provide a reason for rejecting this passkey request from <strong>{confirmModal.data?.user?.email || "Unknown User"}</strong>.
                  </Typography>
                  <TextField
                    fullWidth
                    label="Reason for rejection"
                    multiline
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    error={rejectReason.trim() === ""}
                    helperText={rejectReason.trim() === "" ? "Rejection reason is required" : null}
                    sx={{ mb: 3 }}
                    required
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => !processing && setConfirmModal({ open: false, type: null, data: null })}
                      disabled={processing}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() =>
                        handleReject(
                          confirmModal.data.id,
                          confirmModal.data.code,
                          confirmModal.data.user.id
                        )
                      }
                      disabled={processing || rejectReason.trim() === ""}
                      startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <FaTimes />}
                    >
                      {processing ? "Processing..." : "Confirm Rejection"}
                    </Button>
                  </Box>
                </>
              )}
            </ModalContent>
          </Fade>
        </StyledModal>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{
            vertical: isMobile ? 'top' : 'bottom',
            horizontal: 'center'
          }}
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
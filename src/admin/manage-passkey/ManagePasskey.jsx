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
} from "@mui/material";
import { styled } from "@mui/system";
import { FaCheck, FaTimes, FaEye } from "react-icons/fa";
import { debounce } from "lodash";
import Layout from "../Admin/Layout";
import { getPasskey, updatePasskey } from "../../services/adminPasskeyApi";

const StyledModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const ModalContent = styled(Paper)({
  padding: "32px",
  maxWidth: "600px",
  maxHeight: "80vh",
  overflow: "auto",
});

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor:
    status === "requested"
      ? "#FFC107" // Yellow for requested
      : status === "fulfilled"
        ? "#4CAF50" // Green for fulfilled
        : "#F44336", // Red for rejected
  color: "#fff",
}));

const PasskeyManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailsModal, setDetailsModal] = useState({ open: false, data: null });
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: null,
    data: null,
  });
  const [rejectReason, setRejectReason] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch passkey data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPasskey();
        setData(response);
      } catch (error) {
        console.error("Error fetching passkey data:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch passkey data",
          severity: "error",
        });
      }
    };
    fetchData();
  }, []);

  const handleSearch = useCallback(
    debounce((term) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const handleApprove = async (id, code, userId) => {
    try {
      const payload = {
        user: userId,
        code: code,
        status: "fulfilled", // Use "fulfilled" for approval
      };
      await updatePasskey(id, payload);
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "fulfilled" } : item
        )
      );
      setConfirmModal({ open: false, type: null, data: null });
      setSnackbar({
        open: true,
        message: "Passkey approved successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error approving request:", error);
      setSnackbar({
        open: true,
        message: "Failed to approve passkey",
        severity: "error",
      });
    }
  };

  const handleReject = async (id, code, userId) => {
    try {
      const payload = {
        user: userId,
        code: code,
        status: "rejected", // Use "rejected" for rejection
        reason: rejectReason,
      };
      await updatePasskey(id, payload);
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "rejected", reject_reason: rejectReason } : item
        )
      );
      setConfirmModal({ open: false, type: null, data: null });
      setRejectReason("");
      setSnackbar({
        open: true,
        message: "Passkey rejected successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
      setSnackbar({
        open: true,
        message: "Failed to reject passkey",
        severity: "error",
      });
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Manage Passkeys
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search"
              onChange={(e) => handleSearch(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Filter"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="requested">Requested</MenuItem>
                <MenuItem value="fulfilled">Fulfilled</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User Name</TableCell>
                <TableCell>Exam Name</TableCell>
                <TableCell>Exam Center</TableCell>
                <TableCell>Passkey</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Request Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.user?.email || "N/A"}</TableCell>
                    <TableCell>{row.exam?.name || "N/A"}</TableCell>
                    <TableCell>{row.center?.name || "N/A"}</TableCell>
                    <TableCell>{row.code || "N/A"}</TableCell>
                    <TableCell>
                      <StatusChip
                        label={
                          row.status === "fulfilled" ? "Fulfilled" :
                            row.status === "rejected" ? "Rejected" : "Requested"
                        }
                        status={row.status}
                      />
                    </TableCell>
                    <TableCell>
                      {row.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => setDetailsModal({ open: true, data: row })} size="small">
                        <FaEye />
                      </Button>

                      {row.status === "requested" && (
                        <>
                          <Button
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
                          </Button>
                          <Button
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
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
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
          />
        </TableContainer>

        {/* Details Modal */}
        <StyledModal
          open={detailsModal.open}
          onClose={() => setDetailsModal({ open: false, data: null })}
        >
          <ModalContent>
            {detailsModal.data && (
              <>
                <Typography variant="h6" gutterBottom>
                  Request Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      User Information
                    </Typography>
                    <Typography>
                      Email: {detailsModal.data.user?.email || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Exam Details</Typography>
                    <Typography>
                      Name: {detailsModal.data.exam?.name || "N/A"}
                    </Typography>
                    <Typography>
                      Center: {detailsModal.data.center?.name || "N/A"}
                    </Typography>
                    <Typography>
                      Date:{" "}
                      {new Date(detailsModal.data.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </>
            )}
          </ModalContent>
        </StyledModal>

        {/* Confirm Modal */}
        <StyledModal
          open={confirmModal.open}
          onClose={() =>
            setConfirmModal({ open: false, type: null, data: null })
          }
        >
          <ModalContent>
            {confirmModal.type === "approve" ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Confirm Approval
                </Typography>
                <Typography gutterBottom>
                  Are you sure you want to approve this request?
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    handleApprove(
                      confirmModal.data.id,
                      confirmModal.data.code,
                      confirmModal.data.user.id // Pass user ID
                    )
                  }
                >
                  Confirm
                </Button>
              </>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Confirm Rejection
                </Typography>
                <TextField
                  fullWidth
                  label="Reason for rejection"
                  multiline
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  color="error"
                  onClick={() =>
                    handleReject(
                      confirmModal.data.id,
                      confirmModal.data.code,
                      confirmModal.data.user.id // Pass user ID
                    )
                  }
                >
                  Confirm Rejection
                </Button>
              </>
            )}
          </ModalContent>
        </StyledModal>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default PasskeyManagement;
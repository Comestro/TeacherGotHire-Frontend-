import React, { useState, useCallback, useMemo } from "react";
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
  Breadcrumbs,
  Link,
  TablePagination,
  Grid,
} from "@mui/material";
import { styled } from "@mui/system";
import { FaCheck, FaTimes, FaEye } from "react-icons/fa";
import { debounce } from "lodash";
import Layout from "../Admin/Layout";

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
    status === "Pending"
      ? "#FFC107"
      : status === "Approved"
      ? "#4CAF50"
      : "#F44336",
  color: "#fff",
}));

const mockData = [
  {
    id: 1,
    userName: "John Doe",
    examName: "Mathematics Advanced",
    examCenter: "Central Hall A",
    passkey: "MATH2023A",
    status: "Pending",
    requestDate: "2023-12-01",
    email: "john@example.com",
    contact: "+1234567890",
    examDate: "2023-12-15",
  },
  // Add more mock data as needed
];

const PasskeyManagement = () => {
  const [data, setData] = useState(mockData);
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

  const handleApprove = (id) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "Approved", passkey: generatePasskey() }
          : item
      )
    );
    setConfirmModal({ open: false, type: null, data: null });
  };

  const handleReject = (id) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Rejected" } : item
      )
    );
    setConfirmModal({ open: false, type: null, data: null });
    setRejectReason("");
  };

  const generatePasskey = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
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
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
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
                    <TableCell>{row.userName}</TableCell>
                    <TableCell>{row.examName}</TableCell>
                    <TableCell>{row.examCenter}</TableCell>
                    <TableCell>{row.passkey}</TableCell>
                    <TableCell>
                      <StatusChip label={row.status} status={row.status} />
                    </TableCell>
                    <TableCell>{row.requestDate}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() =>
                          setDetailsModal({ open: true, data: row })
                        }
                        size="small"
                      >
                        <FaEye />
                      </Button>
                      {row.status === "Pending" && (
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
                    <Typography>Name: {detailsModal.data.userName}</Typography>
                    <Typography>Email: {detailsModal.data.email}</Typography>
                    <Typography>
                      Contact: {detailsModal.data.contact}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Exam Details</Typography>
                    <Typography>Name: {detailsModal.data.examName}</Typography>
                    <Typography>
                      Center: {detailsModal.data.examCenter}
                    </Typography>
                    <Typography>Date: {detailsModal.data.examDate}</Typography>
                  </Grid>
                </Grid>
              </>
            )}
          </ModalContent>
        </StyledModal>

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
                  onClick={() => handleApprove(confirmModal.data.id)}
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
                  onClick={() => handleReject(confirmModal.data.id)}
                >
                  Confirm Rejection
                </Button>
              </>
            )}
          </ModalContent>
        </StyledModal>
      </Box>
    </Layout>
  );
};

export default PasskeyManagement;

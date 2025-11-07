import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Snackbar,
  Skeleton,
  Stack,
  Avatar,
  Tooltip,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  GetApp as DownloadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Layout from "../Admin/Layout";
import { getJobApplied } from "../../services/adminManageJobApplied";
import { getTeacherjobType } from "../../features/jobProfileSlice";
import { getClassCategory } from "../../services/adminClassCategoryApi";
import debounce from "lodash/debounce";
import dayjs from "dayjs";

/* -------------------------
   Styled components
   ------------------------- */
const StatusChip = styled(Chip, { shouldForwardProp: (p) => p !== "status" })(({ theme, status }) => ({
  fontWeight: 700,
  textTransform: "none",
  ...(status === "Approved" && {
    color: theme.palette.success.main,
    borderColor: theme.palette.success.main,
  }),
  ...(status === "Pending" && {
    color: theme.palette.warning.main,
    borderColor: theme.palette.warning.main,
  }),
  ...(status === "Rejected" && {
    color: theme.palette.error.main,
    borderColor: theme.palette.error.main,
  }),
  backgroundColor: "transparent",
  border: "1px solid",
}));

const VerificationBadge = styled(Chip, { shouldForwardProp: (p) => p !== "verified" })(
  ({ theme, verified }) => ({
    fontWeight: 700,
    textTransform: "none",
    backgroundColor: "transparent",
    border: "1px solid",
    color: verified ? theme.palette.success.main : theme.palette.text.secondary,
    borderColor: verified ? theme.palette.success.main : theme.palette.grey[300],
  })
);

/* -------------------------
   Helper utils
   ------------------------- */
const safe = (v, fallback = "—") => (v === null || v === undefined || v === "" ? fallback : v);

const csvQuote = (s = "") => `"${String(s).replace(/"/g, '""')}"`;

/* -------------------------
   Component
   ------------------------- */
const ManageTeacherApplied = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // data + ui state
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ classCategory: "", jobType: "", status: "" });
  const [showFilters, setShowFilters] = useState(false);

  const [classCategoryOptions, setClassCategoryOptions] = useState([]);
  const [jobTypeOptions, setJobTypeOptions] = useState([]);

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [actionLoading, setActionLoading] = useState(false);

  // pagination (local DataGrid pagination)
  const [pageSize, setPageSize] = useState(isMobile ? 5 : 10);

  useEffect(() => {
    // fetch lookup options
    fetchClassCategories();
    fetchJobTypes();
    // initial data
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // adjust page size on mobile
    setPageSize(isMobile ? 5 : 10);
  }, [isMobile]);

  /* ---------- API calls ---------- */
  async function fetchClassCategories() {
    try {
      const resp = await getClassCategory();
      if (Array.isArray(resp)) setClassCategoryOptions(resp.map((c) => c.name));
    } catch (err) {
      // silent - non-fatal
    }
  }

  async function fetchJobTypes() {
    try {
      const resp = await getTeacherjobType();
      if (Array.isArray(resp)) setJobTypeOptions(resp.map((j) => j.teacher_job_name));
    } catch (err) {
      // silent - non-fatal
    }
  }

  async function fetchApplications() {
    setLoading(true);
    setError(null);
    try {
      const resp = await getJobApplied();
      const formatted = Array.isArray(resp)
        ? resp.map((app) => ({
            id: app.id,
            teacherName: `${safe(app.user?.Fname, "")} ${safe(app.user?.Lname, "")}`.trim(),
            teacherEmail: app.user?.email || "",
            verified: !!app.user?.is_verified,
            classCategory: app.class_category?.length ? app.class_category[0].name : "N/A",
            subjects: Array.isArray(app.subject) ? app.subject.map((s) => s.subject_name) : [],
            jobType: app.teacher_job_type?.length ? app.teacher_job_type[0].teacher_job_name : "N/A",
            status: app.status ? "Approved" : "Pending",
            appliedDate: app.date ? dayjs(app.date).format("MMM D, YYYY") : "—",
            raw: app,
          }))
        : [];
      setApplications(formatted);
    } catch (err) {
      setError("Failed to load teacher applications. Please try again later.");
      setSnackbar({ open: true, message: "Failed to load teacher applications", severity: "error" });
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Filters & search ---------- */
  // Debounced search handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((val) => {
      setSearchQuery(val);
    }, 250),
    []
  );

  const onSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ classCategory: "", jobType: "", status: "" });
    debouncedSearch("");
  };

  const filteredApplications = useMemo(() => {
    const q = (searchQuery || "").toLowerCase().trim();
    return applications.filter((a) => {
      const matchesSearch =
        !q ||
        (a.teacherName || "").toLowerCase().includes(q) ||
        (a.teacherEmail || "").toLowerCase().includes(q) ||
        (a.jobType || "").toLowerCase().includes(q) ||
        (a.classCategory || "").toLowerCase().includes(q);
      const matchesCat = !filters.classCategory || a.classCategory === filters.classCategory;
      const matchesJobType = !filters.jobType || a.jobType === filters.jobType;
      const matchesStatus = !filters.status || a.status === filters.status;
      return matchesSearch && matchesCat && matchesJobType && matchesStatus;
    });
  }, [applications, filters, searchQuery]);

  /* ---------- Table columns ---------- */
  const columns = useMemo(
    () => [
      {
        field: "teacherInfo",
        headerName: "Teacher",
        flex: 1.6,
        minWidth: 220,
        sortable: true,
        renderCell: (params) => (
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Avatar sx={{ width: 40, height: 40 }}>{(params.row.teacherName || "U").charAt(0)}</Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700 }}>{params.row.teacherName}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", wordBreak: "break-all" }}>
                {params.row.teacherEmail}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: "appliedDate",
        headerName: "Applied",
        flex: 0.9,
        minWidth: 120,
        hide: isMobile,
      },
      {
        field: "classCategory",
        headerName: "Class Category",
        flex: 1,
        minWidth: 150,
        hide: isMobile || isTablet,
      },
      {
        field: "subjects",
        headerName: "Subjects",
        flex: 1.4,
        minWidth: 220,
        hide: isMobile || isTablet,
        renderCell: (params) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {Array.isArray(params.row.subjects) && params.row.subjects.length > 0 ? (
              params.row.subjects.map((s) => (
                <Chip key={s} label={s} size="small" variant="outlined" />
              ))
            ) : (
              <Typography variant="caption" color="text.secondary">—</Typography>
            )}
          </Box>
        ),
      },
      {
        field: "jobType",
        headerName: "Job Type",
        flex: 1,
        minWidth: 140,
        hide: isMobile,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 0.7,
        minWidth: 120,
        renderCell: (params) => <StatusChip label={params.value} status={params.value} size="small" />,
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 100,
        type: "actions",
        getActions: (params) => [
          <GridActionsCellItem
            icon={
              <Tooltip title="View details">
                <VisibilityIcon fontSize="small" />
              </Tooltip>
            }
            label="View"
            onClick={() => openDetails(params.row)}
            showInMenu={false}
          />,
        ],
      },
    ],
    [isMobile, isTablet]
  );

  /* ---------- UI helpers ---------- */
  const openDetails = (row) => {
    setSelectedApplication(row);
    setOpenDetailModal(true);
  };

  const closeDetails = () => {
    setOpenDetailModal(false);
    setSelectedApplication(null);
  };

  const handleSnackbarClose = () => setSnackbar((s) => ({ ...s, open: false }));

  const exportCsv = () => {
    const headers = ["Teacher Name", "Email", "Job Type", "Class Category", "Status", "Applied Date", "Subjects"];
    const rows = filteredApplications.map((r) =>
      [
        csvQuote(r.teacherName),
        csvQuote(r.teacherEmail),
        csvQuote(r.jobType),
        csvQuote(r.classCategory),
        csvQuote(r.status),
        csvQuote(r.appliedDate),
        csvQuote((r.subjects || []).join("; ")),
      ].join(",")
    );
    const csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
    const encoded = encodeURI(csv);
    const link = document.createElement("a");
    link.href = encoded;
    link.download = `teacher_applications_${dayjs().format("YYYY-MM-DD")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ---------- Render ---------- */
  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "center", mb: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800} color="teal">
              Teacher Job Applications
            </Typography>
            <Typography variant="body2" color="text.secondary">View and manage job applications submitted by teachers</Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button startIcon={<RefreshIcon />} onClick={fetchApplications} variant="outlined" size={isMobile ? "small" : "medium"}>
              Refresh
            </Button>
            <Button startIcon={<DownloadIcon />} onClick={exportCsv} variant="outlined" size={isMobile ? "small" : "medium"}>
              Export
            </Button>
            <Button startIcon={<FilterListIcon />} onClick={() => setShowFilters((s) => !s)} variant="contained" color={showFilters ? "primary" : "inherit"}>
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </Stack>
        </Box>

        {/* Search & Filters */}
        <Paper sx={{ p: { xs: 1.25, sm: 2 }, mb: 3, borderRadius: 2 }} elevation={1}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, email, subject or job"
                onChange={onSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ display: "flex", gap: 1, justifyContent: isMobile ? "stretch" : "flex-end" }}>
                <Button variant="text" onClick={resetFilters} sx={{ textTransform: "none" }}>Reset</Button>
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
                  {loading ? "Loading…" : `${filteredApplications.length} result${filteredApplications.length !== 1 ? "s" : ""}`}
                </Typography>
              </Box>
            </Grid>

            {showFilters && (
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Class Category</InputLabel>
                      <Select label="Class Category" name="classCategory" value={filters.classCategory} onChange={handleFilterChange}>
                        <MenuItem value="">All Categories</MenuItem>
                        {classCategoryOptions.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Job Type</InputLabel>
                      <Select label="Job Type" name="jobType" value={filters.jobType} onChange={handleFilterChange}>
                        <MenuItem value="">All Job Types</MenuItem>
                        {jobTypeOptions.map((j) => <MenuItem key={j} value={j}>{j}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select label="Status" name="status" value={filters.status} onChange={handleFilterChange}>
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Summary cards */}
        {!loading && !error && (
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Paper sx={{ p: 2, minWidth: 160 }}>
              <Typography variant="caption" color="text.secondary">Total</Typography>
              <Typography variant="h5" fontWeight={700}>{applications.length}</Typography>
            </Paper>
            <Paper sx={{ p: 2, minWidth: 160, borderLeft: `4px solid ${theme.palette.warning.main}` }}>
              <Typography variant="caption" color="text.secondary">Pending</Typography>
              <Typography variant="h5" fontWeight={700} color="warning.main">{applications.filter((a) => a.status === "Pending").length}</Typography>
            </Paper>
            <Paper sx={{ p: 2, minWidth: 160, borderLeft: `4px solid ${theme.palette.success.main}` }}>
              <Typography variant="caption" color="text.secondary">Approved</Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">{applications.filter((a) => a.status === "Approved").length}</Typography>
            </Paper>
            <Paper sx={{ p: 2, minWidth: 160, borderLeft: `4px solid ${theme.palette.error.main}` }}>
              <Typography variant="caption" color="text.secondary">Rejected</Typography>
              <Typography variant="h5" fontWeight={700} color="error.main">{applications.filter((a) => a.status === "Rejected").length}</Typography>
            </Paper>
          </Box>
        )}

        {/* Error */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* DataGrid */}
        <Paper sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle1" fontWeight={700}>Applications {loading ? "" : `(${filteredApplications.length})`}</Typography>
          </Box>

          {loading ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Loading applications...</Typography>
              <Box sx={{ mt: 2 }}>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rectangular" height={48} sx={{ my: 0.5 }} />)}</Box>
            </Box>
          ) : (
            <Box sx={{ width: "100%" }}>
              <DataGrid
                rows={filteredApplications}
                columns={columns}
                pageSizeOptions={[5, 10, 25, 50]}
                disableSelectionOnClick
                getRowHeight={() => "auto"}
                getRowId={(r) => r.id}
                pageSize={pageSize}
                onPageSizeChange={(newSize) => setPageSize(newSize)}
                sx={{
                  border: "none",
                  "& .MuiDataGrid-cell": {
                    py: 1.25,
                    px: 2,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    alignItems: "flex-start",
                    lineHeight: "1.2",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: theme.palette.mode === "dark" ? "#2a2a2a" : "#f5f5f5",
                    fontWeight: 700,
                  },
                  "& .MuiDataGrid-row:nth-of-type(even)": {
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                  },
                }}
                components={{
                  NoRowsOverlay: () => (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                      <Typography variant="h6" color="text.secondary">No Applications Found</Typography>
                      <Typography variant="body2" color="text.secondary">Try adjusting your filters</Typography>
                    </Box>
                  ),
                }}
                onRowDoubleClick={(params) => openDetails(params.row)}
              />
            </Box>
          )}
        </Paper>

        {/* Details Modal */}
        <Modal open={openDetailModal} onClose={closeDetails}>
          <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: { xs: "95%", sm: "80%", md: 640 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="h6" fontWeight={700}>Application Details</Typography>
              <IconButton onClick={closeDetails}><CloseIcon /></IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {selectedApplication ? (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Full name</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedApplication.teacherName}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography variant="body1" sx={{ wordBreak: "break-all" }}>{selectedApplication.teacherEmail}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Applied for</Typography>
                    <Typography variant="body1">{selectedApplication.jobType}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Applied on</Typography>
                    <Typography variant="body1">{selectedApplication.appliedDate}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Class Category</Typography>
                    <Typography variant="body1">{selectedApplication.classCategory}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <StatusChip label={selectedApplication.status} status={selectedApplication.status} size="small" />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Subjects applied</Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                        {(selectedApplication.subjects || []).length > 0 ? (
                          selectedApplication.subjects.map((s) => <Chip key={s} label={s} variant="outlined" />)
                        ) : <Typography variant="caption" color="text.secondary">—</Typography>}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Verification</Typography>
                      <Box sx={{ mt: 1 }}>
                        <VerificationBadge label={selectedApplication.verified ? "Verified" : "Not Verified"} verified={selectedApplication.verified} size="small" />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Admin notes</Typography>
                    <TextField fullWidth multiline rows={4} placeholder="Add notes about this application" size="small" sx={{ mt: 1 }} />
                  </Grid>
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3, flexWrap: "wrap" }}>
                  <Button variant="outlined" onClick={closeDetails}>Close</Button>
                </Box>
              </>
            ) : (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">No application selected</Typography>
              </Box>
            )}
          </Box>
        </Modal>

        {/* Snackbar */}
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert severity={snackbar.severity} onClose={handleSnackbarClose} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default ManageTeacherApplied;

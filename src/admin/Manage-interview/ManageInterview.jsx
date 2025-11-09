import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Modal,
  Snackbar,
  Alert,
  Switch,
  CircularProgress,
  Backdrop,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme,
  MenuItem,
  Collapse,
} from "@mui/material";
import Grid from "@mui/material/Grid2"; // Grid2 import
import { alpha } from "@mui/material/styles";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { DateTimePicker, DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {
  FiRefreshCw,
  FiEye,
  FiClock,
  FiX,
  FiCheck,
  FiThumbsDown,
  FiLink,
  FiDownload,
  FiList,
  FiBarChart2,
  FiFilter,
  FiSearch,
  FiCalendar,
} from "react-icons/fi";
import Layout from "../Admin/Layout";
import { getInterview, updateInterview } from "../../services/adminInterviewApi";
import debounce from "lodash/debounce";

dayjs.extend(isBetween);

const stringToColor = (string = "") => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

const CenteredPaper = ({ children, sx = {} }) => (
  <Paper
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      width: { xs: "94%", sm: 560 },
      maxHeight: "90vh",
      overflow: "auto",
      p: 3,
      borderRadius: 2,
      ...sx,
    }}
  >
    {children}
  </Paper>
);

export default function InterviewManagementRedesign() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table");

  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "",
    teacherName: "",
    classCategory: "",
    subject: "",
    level: "",
    attempt: "",
    dateFrom: null,
    dateTo: null,
  });

  // Modals
  const [detailsModal, setDetailsModal] = useState({ open: false, data: null });
  const [scheduleModal, setScheduleModal] = useState({ open: false, data: null });
  const [rejectModal, setRejectModal] = useState({ open: false, data: null });
  const [completeModal, setCompleteModal] = useState({ open: false, data: null });

  // form / action state
  const [selectedDateTime, setSelectedDateTime] = useState(dayjs());
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingLinkError, setMeetingLinkError] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [interviewScore, setInterviewScore] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const determineStatus = useCallback((interview) => {
    if (typeof interview.status === "string") {
      switch (interview.status) {
        case "fulfilled":
          return "Completed";
        case "requested":
          return "Pending";
        case "scheduled":
          return "Scheduled";
        case "rejected":
          return "Rejected";
        default:
          return interview.status;
      }
    }
    if (interview.grade != null) return "Completed";
    if (interview.status && interview.link) return "Scheduled";
    if (interview.rejectionReason) return "Rejected";
    return "Pending";
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const resp = await getInterview();
      const data = (Array.isArray(resp) ? resp : []).map((item) => {
        const status = determineStatus(item);
        return {
          id: item.id,
          name: `${item.user?.Fname || ""} ${item.user?.Lname || ""}`.trim(),
          userId: item.user?.id,
          email: item.user?.email,
          classCategory: item.class_category?.name || "Unknown",
          subjectName: item.subject?.subject_name || "Unknown",
          level: item.level?.name || "Unknown",
          levelCode: item.level?.level_code,
          score: item.grade != null ? item.grade : "Not graded",
          status,
          apiStatus: item.status,
          desiredDateTime: item.time ? dayjs(item.time).format("YYYY-MM-DD HH:mm") : "—",
          scheduledDate:
            (item.status === "scheduled" || item.status === "fulfilled") &&
            item.time
              ? dayjs(item.time).format("YYYY-MM-DD HH:mm")
              : null,
          rejectionReason: item.rejectionReason || null,
          link: item.link,
          attempt: item.attempt,
          createdAt: item.created_at
            ? dayjs(item.created_at).format("YYYY-MM-DD HH:mm")
            : "—",
          mergedSubject: `${item.subject?.subject_name || ""} (${item.class_category?.name || ""})`,
          original: item,
        };
      });
      setInterviewData(data);
      setFilteredTeachers(data);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message || "Failed to fetch interviews",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // debounce search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value) => setFilters((f) => ({ ...f, searchTerm: value })), 250),
    []
  );

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, interviewData]);

  const applyFilters = () => {
    let out = [...interviewData];
    const q = (filters.searchTerm || "").toLowerCase().trim();

    if (filters.status) out = out.filter((t) => t.status === filters.status);
    if (filters.teacherName) out = out.filter((t) => t.name.toLowerCase().includes(filters.teacherName.toLowerCase()));
    if (filters.classCategory) out = out.filter((t) => t.classCategory === filters.classCategory);
    if (filters.subject) out = out.filter((t) => t.subjectName === filters.subject);
    if (filters.level) out = out.filter((t) => t.level === filters.level);
    if (filters.attempt) out = out.filter((t) => String(t.attempt) === String(filters.attempt));

    if (filters.dateFrom && filters.dateTo) {
      out = out.filter((t) => {
        if (!t.desiredDateTime || t.desiredDateTime === "—") return false;
        const d = dayjs(t.desiredDateTime);
        return (d.isAfter(filters.dateFrom) || d.isSame(filters.dateFrom, "day")) && (d.isBefore(filters.dateTo) || d.isSame(filters.dateTo, "day"));
      });
    }

    if (q) {
      out = out.filter((t) =>
        Object.values(t).some((v) =>
          String(v).toLowerCase().includes(q)
        )
      );
    }

    setFilteredTeachers(out);
  };

  const resetFilters = () => setFilters({
    searchTerm: "",
    status: "",
    teacherName: "",
    classCategory: "",
    subject: "",
    level: "",
    attempt: "",
    dateFrom: null,
    dateTo: null,
  });

  const exportCsv = () => {
    const headers = ["Teacher Name", "Email", "Subject (Class)", "Status", "Score", "Desired Date/Time", "Scheduled Date"];
    const rows = filteredTeachers.map((t) =>
      [t.name, t.email, t.mergedSubject, `${t.status} (${t.mode})`, t.score, t.desiredDateTime, t.scheduledDate || "Not scheduled"]
        .map((cell) => `"${String(cell || "")?.replace(/"/g, '""')}"`) // safe quoting
        .join(",")
    );
    const csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
    const encoded = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `teacher_interviews_${dayjs().format("YYYY-MM-DD")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---------- Actions ----------
  const openSchedule = (row) => {
    setScheduleModal({ open: true, data: row });
    setSelectedDateTime(dayjs(row.desiredDateTime !== "—" ? row.desiredDateTime : dayjs()));
    setMeetingLink(row.link || "");
    setMeetingLinkError(false);
  };

  const scheduleInterview = async () => {
    if (!meetingLink.trim()) {
      setMeetingLinkError(true);
      return;
    }
    setActionLoading(true);
    try {
      await updateInterview(scheduleModal.data.id, { status: "scheduled", time: selectedDateTime.format("YYYY-MM-DD HH:mm:ss"), link: meetingLink });
      setSnackbar({ open: true, message: "Interview scheduled", severity: "success" });
      setScheduleModal({ open: false, data: null });
      fetchInterviews();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || err?.message || "Failed to schedule", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const openReject = (row) => {
    setRejectModal({ open: true, data: row });
    setRejectionReason("");
  };

  const rejectInterview = async () => {
    if (!rejectionReason.trim()) {
      setSnackbar({ open: true, message: "Rejection reason required", severity: "error" });
      return;
    }
    setActionLoading(true);
    try {
      await updateInterview(rejectModal.data.id, { status: "rejected", rejectionReason });
      setSnackbar({ open: true, message: "Interview rejected", severity: "success" });
      setRejectModal({ open: false, data: null });
      fetchInterviews();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || err?.message || "Failed to reject", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const openComplete = (row) => {
    setCompleteModal({ open: true, data: row });
    setInterviewScore("");
  };

  const completeInterview = async () => {
    const score = Number(interviewScore);
    if (isNaN(score) || score < 0 || score > 10) {
      setSnackbar({ open: true, message: "Score must be 0-10", severity: "error" });
      return;
    }
    setActionLoading(true);
    try {
      await updateInterview(completeModal.data.id, { status: "fulfilled", grade: score });
      setSnackbar({ open: true, message: "Interview marked complete", severity: "success" });
      setCompleteModal({ open: false, data: null });
      fetchInterviews();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || err?.message || "Failed to complete", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // ---------- render helpers ----------
  const renderCard = (row) => (
    <Card key={row.id} sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Avatar sx={{ bgcolor: stringToColor(row.name) }}>{row.name?.charAt(0)}</Avatar>
            <Box>
              <Typography fontWeight={700}>{row.name}</Typography>
              <Typography variant="caption" color="text.secondary">{row.email}</Typography>
            </Box>
          </Box>

          <Chip label={`${row.status} (${row.mode})`} size="small" color={row.status === "Completed" ? "success" : row.status === "Scheduled" ? "info" : row.status === "Pending" ? "warning" : "error"} />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">{row.mergedSubject}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.desiredDateTime}</Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button size="small" variant="outlined" startIcon={<FiEye />} onClick={() => setDetailsModal({ open: true, data: row })}>View</Button>

          <Stack direction="row" spacing={1}>
            {row.status === "Pending" && (
              <>
                <Tooltip title="Schedule"><IconButton onClick={() => openSchedule(row)}><FiClock /></IconButton></Tooltip>
                <Tooltip title="Reject"><IconButton onClick={() => openReject(row)} color="error"><FiX /></IconButton></Tooltip>
              </>
            )}

            {row.status === "Scheduled" && (
              <>
                <Button variant="contained" size="small" startIcon={<FiCheck />} onClick={() => openComplete(row)}>Complete</Button>
                {row.link && <Button variant="outlined" size="small" onClick={() => window.open(row.link, "_blank")}>Join</Button>}
              </>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );

  // ---------- DataGrid columns (memoized) ----------
  const tableColumns = useMemo(() => [
    {
      field: "name",
      headerName: "Teacher",
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", py: 1 }}>
          <Avatar sx={{ bgcolor: stringToColor(params.row.name), width: 36, height: 36 }}>{params.row.name?.charAt(0)}</Avatar>
          <Box>
            <Typography sx={{ fontWeight: 600 }}>{params.row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
          </Box>
        </Box>
      ),
    },
    { field: "mergedSubject", headerName: "Subject (Class)", flex: 1, minWidth: 180, renderCell: (p) => <Typography sx={{ py: 1 }}>{p.value}</Typography> },
    { field: "desiredDateTime", headerName: "Desired Date/Time", flex: 1, minWidth: 160, renderCell: (p) => <Typography sx={{ py: 1 }}>{p.value}</Typography> },
    {
      field: "score",
      headerName: "Grade",
      width: 120,
      renderCell: (params) => params.value !== "Not graded" ? `${params.value}/10` : "—",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <Chip label={`${params.value}`} size="small" color={params.value === "Completed" ? "success" : params.value === "Scheduled" ? "info" : params.value === "Pending" ? "warning" : "error"} />
      ),
    },
    { field: "scheduledDate", headerName: "Scheduled", flex: 1, minWidth: 160, renderCell: (p) => <Typography sx={{ py: 1 }}>{p.value || "—"}</Typography> },
    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <GridActionsCellItem icon={<FiEye size={24} color="green" />} label="View" onClick={() => setDetailsModal({ open: true, data: params.row })} />
          {params.row.apiStatus === "requested" && (
            <>
              <GridActionsCellItem icon={<FiClock size={24} color="blue" />} label="Schedule" onClick={() => openSchedule(params.row)} />
              <GridActionsCellItem icon={<FiX size={24} color="red" />} label="Reject" onClick={() => openReject(params.row)} />
            </>
          )}
          {params.row.apiStatus === "scheduled" && (
            <>
              <GridActionsCellItem icon={<FiCheck size={24} color="green" />} label="Complete" onClick={() => openComplete(params.row)} />
              {params.row.link && <Button sx={{backgroundColor:"green",color:"white"}} size="small" onClick={() => window.open(params.row.link, "_blank")}>Join</Button>}
            </>
          )}
        </Box>
      ),
    },
  ], [openComplete]);

  return (
    <Layout>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="primary">Teacher Interview Management</Typography>
            <Typography variant="body2" color="text.secondary">Schedule, review and grade teacher interviews</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            

            <Tooltip title="Refresh"><IconButton onClick={fetchInterviews}><FiRefreshCw /></IconButton></Tooltip>
            <Tooltip title={viewMode === "table" ? "Card view" : "Table view"}>
              <IconButton onClick={() => setViewMode((v) => (v === "table" ? "card" : "table"))}>
                {viewMode === "table" ? <FiBarChart2 /> : <FiList />}
              </IconButton>
            </Tooltip>
            <Button variant="outlined" startIcon={<FiFilter />} onClick={() => setFiltersOpen((s) => !s)}>Filters</Button>
          </Box>
        </Box>

        {/* Filter panel */}
        <Collapse in={filtersOpen}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by name, email, subject..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  InputProps={{ startAdornment: <FiSearch style={{ marginRight: 8 }} /> }}
                  size="small"
                />
              </Grid>

              <Grid xs={12} md={6}>
                <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                  <Button variant="outlined" startIcon={<FiDownload />} onClick={exportCsv}>Export</Button>
                  <Button variant="outlined" onClick={resetFilters}>Reset</Button>
                </Box>
              </Grid>

              <Grid xs={12} md={3}><TextField label="Teacher" size="small" value={filters.teacherName} onChange={(e) => setFilters({ ...filters, teacherName: e.target.value })} fullWidth /></Grid>
              <Grid xs={12} md={3}><TextField label="Class" size="small" value={filters.classCategory} onChange={(e) => setFilters({ ...filters, classCategory: e.target.value })} fullWidth /></Grid>
              <Grid xs={12} md={3}><TextField label="Subject" size="small" value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })} fullWidth /></Grid>
              <Grid xs={12} md={3}><TextField label="Level" size="small" value={filters.level} onChange={(e) => setFilters({ ...filters, level: e.target.value })} fullWidth /></Grid>

              <Grid xs={12} md={3}><TextField label="Attempt" size="small" type="number" value={filters.attempt} onChange={(e) => setFilters({ ...filters, attempt: e.target.value })} fullWidth /></Grid>

              <Grid xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker label="From (Desired)" value={filters.dateFrom} onChange={(v) => setFilters({ ...filters, dateFrom: v })} slotProps={{ textField: { size: 'small' } }} />
                </LocalizationProvider>
              </Grid>

              <Grid xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker label="To (Desired)" value={filters.dateTo} onChange={(v) => setFilters({ ...filters, dateTo: v })} slotProps={{ textField: { size: 'small' } }} />
                </LocalizationProvider>
              </Grid>

              <Grid xs={12} md={3}>
                <TextField select label="Status" size="small" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} fullWidth>
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>

        {/* Main list / table */}
        <Paper sx={{ p: 0, borderRadius: 2 }}>
          {loading ? (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }} color="text.secondary">Loading interviews...</Typography>
            </Box>
          ) : filteredTeachers.length === 0 ? (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">No interviews found</Typography>
            </Box>
          ) : viewMode === "table" ? (
            <Box sx={{ width: "100%" }}>
              <DataGrid
                rows={filteredTeachers}
                columns={tableColumns}
                pageSizeOptions={[5, 10, 25]}
                disableRowSelectionOnClick
                getRowId={(r) => r.id}
                autoHeight
                getRowHeight={() => 'auto'}
                sx={{
                  '& .MuiDataGrid-cell': {
                    py: 1.5,
                    px: 2,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    alignItems: 'flex-start',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5',
                    fontWeight: 700,
                    py: 1.5,
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04)
                  },
                  border: 'none',
                }}
              />
            </Box>
          ) : (
            <Stack spacing={2} sx={{ p: 2 }}>{filteredTeachers.map(renderCard)}</Stack>
          )}
        </Paper>

        {/* DETAILS MODAL */}
        <Modal open={detailsModal.open} onClose={() => setDetailsModal({ open: false, data: null })}>
          <CenteredPaper>
            {detailsModal.data && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Interview Details</Typography>
                  <IconButton onClick={() => setDetailsModal({ open: false, data: null })}><FiX /></IconButton>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid xs={12} sm={6}><Typography variant="subtitle2">Name</Typography><Typography>{detailsModal.data.name}</Typography></Grid>
                  <Grid xs={12} sm={6}><Typography variant="subtitle2">Email</Typography><Typography>{detailsModal.data.email}</Typography></Grid>
                  <Grid xs={12}><Typography variant="subtitle2">Subject</Typography><Typography>{detailsModal.data.mergedSubject}</Typography></Grid>
                  <Grid xs={12}><Typography variant="subtitle2">Status</Typography><Chip label={`${detailsModal.data.status} (${detailsModal.data.mode})`} /></Grid>

                  {detailsModal.data.scheduledDate && <Grid xs={12}><Typography variant="subtitle2">Scheduled</Typography><Typography>{detailsModal.data.scheduledDate}</Typography></Grid>}

                  {detailsModal.data.rejectionReason && <Grid xs={12}><Typography variant="subtitle2">Rejection Reason</Typography><Paper sx={{ p: 1 }}>{detailsModal.data.rejectionReason}</Paper></Grid>}

                  {detailsModal.data.link && <Grid xs={12}><Button onClick={() => window.open(detailsModal.data.link, '_blank')}>Open Meeting Link</Button></Grid>}
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button onClick={() => setDetailsModal({ open: false, data: null })}>Close</Button>
                </Box>
              </>
            )}
          </CenteredPaper>
        </Modal>

        {/* SCHEDULE MODAL */}
        <Modal open={scheduleModal.open} onClose={() => setScheduleModal({ open: false, data: null })}>
          <CenteredPaper>
            {scheduleModal.data && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Schedule Interview</Typography>
                  <IconButton onClick={() => setScheduleModal({ open: false, data: null })}><FiX /></IconButton>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2">Teacher</Typography>
                <Typography sx={{ mb: 1 }}>{scheduleModal.data.name}</Typography>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Schedule Date & Time"
                    value={selectedDateTime}
                    onChange={setSelectedDateTime}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>

                <TextField fullWidth label="Meeting Link" value={meetingLink} onChange={(e) => { setMeetingLink(e.target.value); if (e.target.value.trim()) setMeetingLinkError(false); }} error={meetingLinkError} helperText={meetingLinkError ? "Meeting link is required" : ""} sx={{ mt: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                  <Button variant="outlined" onClick={() => setScheduleModal({ open: false, data: null })}>Cancel</Button>
                  <Button variant="contained" onClick={scheduleInterview} disabled={actionLoading}>{actionLoading ? <CircularProgress size={18} /> : 'Schedule'}</Button>
                </Box>
              </>
            )}
          </CenteredPaper>
        </Modal>

        {/* REJECT MODAL */}
        <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false, data: null })}>
          <CenteredPaper>
            {rejectModal.data && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Reject Interview</Typography>
                  <IconButton onClick={() => setRejectModal({ open: false, data: null })}><FiX /></IconButton>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2">Reason</Typography>
                <TextField fullWidth multiline rows={4} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} sx={{ mt: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                  <Button variant="outlined" onClick={() => setRejectModal({ open: false, data: null })}>Cancel</Button>
                  <Button variant="contained" color="error" onClick={rejectInterview} disabled={actionLoading}>{actionLoading ? <CircularProgress size={18} /> : 'Reject'}</Button>
                </Box>
              </>
            )}
          </CenteredPaper>
        </Modal>

        {/* COMPLETE MODAL */}
        <Modal open={completeModal.open} onClose={() => setCompleteModal({ open: false, data: null })}>
          <CenteredPaper>
            {completeModal.data && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Complete Interview</Typography>
                  <IconButton onClick={() => setCompleteModal({ open: false, data: null })}><FiX /></IconButton>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2">Score (0-10)</Typography>
                <TextField type="number" fullWidth value={interviewScore} onChange={(e) => setInterviewScore(e.target.value)} inputProps={{ min: 0, max: 10, step: 0.5 }} sx={{ mt: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                  <Button variant="outlined" onClick={() => setCompleteModal({ open: false, data: null })}>Cancel</Button>
                  <Button variant="contained" color="success" onClick={completeInterview} disabled={actionLoading}>{actionLoading ? <CircularProgress size={18} /> : 'Complete'}</Button>
                </Box>
              </>
            )}
          </CenteredPaper>
        </Modal>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
        </Snackbar>

        <Backdrop open={actionLoading} sx={{ zIndex: (t) => t.zIndex.drawer + 2, color: '#fff' }}>
          <CircularProgress color="inherit" />
        </Backdrop>
    </Layout>
  );
}

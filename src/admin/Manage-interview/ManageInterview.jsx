import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Modal,
  Snackbar,
  Alert,
  CircularProgress,
  Backdrop,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Tooltip,
  Divider,
  useTheme,
  MenuItem,
  Collapse,
  InputAdornment
} from "@mui/material";
import Grid from "@mui/material/Grid2";
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
  FiDownload,
  FiList,
  FiBarChart2,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiExternalLink
} from "react-icons/fi";
import Layout from "../Admin/Layout";
import { getInterview, updateInterview, createInterview } from "../../services/adminInterviewApi";
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
    elevation={0}
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      width: { xs: "94%", sm: 500 },
      maxHeight: "90vh",
      overflow: "auto",
      p: 0,
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      outline: 'none',
      ...sx,
    }}
  >
    {children}
  </Paper>
);

export default function InterviewManagementRedesign() {
  const theme = useTheme();

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
  const [createModal, setCreateModal] = useState(false);

  // create form state
  const [createForm, setCreateForm] = useState({
    user: "",
    subject: "",
    level: "",
    class_category: "",
    time: dayjs(),
    link: "",
    status: "requested",
    reject_reason: "",
    grade: "",
    attempt: 1
  });

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
          profilePicture: item.user?.profile_picture,
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

  const handleCreateInterview = async () => {
    setActionLoading(true);
    try {
      const payload = {
        ...createForm,
        time: createForm.time ? createForm.time.format("YYYY-MM-DDTHH:mm:ss[Z]") : null,
        grade: createForm.grade ? Number(createForm.grade) : null,
        user: Number(createForm.user),
        subject: Number(createForm.subject),
        level: Number(createForm.level),
        class_category: Number(createForm.class_category),
        attempt: Number(createForm.attempt)
      };
      await createInterview(payload);
      setSnackbar({ open: true, message: "Interview created successfully", severity: "success" });
      setCreateModal(false);
      setCreateForm({
        user: "",
        subject: "",
        level: "",
        class_category: "",
        time: dayjs(),
        link: "",
        status: "requested",
        reject_reason: "",
        grade: "",
        attempt: 1
      });
      fetchInterviews();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || err?.message || "Failed to create interview", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // ---------- render helpers ----------
  const renderCard = (row) => (
    <Card key={row.id} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Avatar src={row.profilePicture} sx={{ bgcolor: stringToColor(row.name), width: 48, height: 48 }}>{row.name?.charAt(0)}</Avatar>
            <Box>
              <Typography fontWeight={700} variant="subtitle1">{row.name}</Typography>
              <Typography variant="caption" color="text.secondary">{row.email}</Typography>
            </Box>
          </Box>
          <Chip
            label={row.status}
            size="small"
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
            color={row.status === "Completed" ? "success" : row.status === "Scheduled" ? "info" : row.status === "Pending" ? "warning" : "error"}
            variant="soft"
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={6}>
            <Typography variant="caption" color="text.secondary" display="block">Subject</Typography>
            <Typography variant="body2" fontWeight={500}>{row.mergedSubject}</Typography>
          </Grid>
          <Grid xs={6}>
            <Typography variant="caption" color="text.secondary" display="block">Desired Time</Typography>
            <Typography variant="body2" fontWeight={500}>{row.desiredDateTime}</Typography>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<FiEye />} onClick={() => setDetailsModal({ open: true, data: row })}>View</Button>

          {row.status === "Pending" && (
            <>
              <Button size="small" variant="contained" startIcon={<FiClock />} onClick={() => openSchedule(row)}>Schedule</Button>
              <IconButton size="small" color="error" onClick={() => openReject(row)}><FiX /></IconButton>
            </>
          )}

          {row.status === "Scheduled" && (
            <>
              <Button variant="contained" color="success" size="small" startIcon={<FiCheck />} onClick={() => openComplete(row)}>Complete</Button>
              {row.link && <IconButton size="small" color="primary" onClick={() => window.open(row.link, "_blank")}><FiExternalLink /></IconButton>}
            </>
          )}
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
      minWidth: 220,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", py: 1 }}>
          <Avatar src={params.row.profilePicture} sx={{ bgcolor: stringToColor(params.row.name), width: 32, height: 32, fontSize: '0.875rem' }}>{params.row.name?.charAt(0)}</Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{params.row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
          </Box>
        </Box>
      ),
    },
    { field: "mergedSubject", headerName: "Subject (Class)", flex: 1, minWidth: 180, renderCell: (p) => <Typography variant="body2" sx={{ py: 1.5 }}>{p.value}</Typography> },
    { field: "desiredDateTime", headerName: "Desired Date/Time", flex: 1, minWidth: 160, renderCell: (p) => <Typography variant="body2" sx={{ py: 1.5 }}>{p.value}</Typography> },
    {
      field: "score",
      headerName: "Grade",
      width: 100,
      renderCell: (params) => (
        <Box sx={{ py: 1.5 }}>
          {params.value !== "Not graded" ? (
            <Chip label={`${params.value}/10`} size="small" variant="outlined" sx={{ borderRadius: 1, fontWeight: 600 }} />
          ) : (
            <Typography variant="caption" color="text.secondary">—</Typography>
          )}
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <Box sx={{ py: 1.5 }}>
          <Chip
            label={params.value}
            size="small"
            sx={{ fontWeight: 600, borderRadius: 1 }}
            color={params.value === "Completed" ? "success" : params.value === "Scheduled" ? "info" : params.value === "Pending" ? "warning" : "error"}
            variant={params.value === "Pending" ? "outlined" : "filled"}
          />
        </Box>
      ),
    },
    { field: "scheduledDate", headerName: "Scheduled", flex: 1, minWidth: 160, renderCell: (p) => <Typography variant="body2" sx={{ py: 1.5 }}>{p.value || "—"}</Typography> },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5, py: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => setDetailsModal({ open: true, data: params.row })}>
              <FiEye size={18} />
            </IconButton>
          </Tooltip>

          {params.row.apiStatus === "requested" && (
            <>
              <Tooltip title="Schedule">
                <IconButton size="small" color="primary" onClick={() => openSchedule(params.row)}>
                  <FiClock size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton size="small" color="error" onClick={() => openReject(params.row)}>
                  <FiX size={18} />
                </IconButton>
              </Tooltip>
            </>
          )}

          {params.row.apiStatus === "scheduled" && (
            <>
              <Tooltip title="Complete">
                <IconButton size="small" color="success" onClick={() => openComplete(params.row)}>
                  <FiCheck size={18} />
                </IconButton>
              </Tooltip>
              {params.row.link && (
                <Tooltip title="Join Meeting">
                  <IconButton size="small" color="info" onClick={() => window.open(params.row.link, "_blank")}>
                    <FiExternalLink size={18} />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Box>
      ),
    },
  ], [openComplete]);

  return (
    <Layout>
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          gap: 2,
          flexWrap: "wrap",
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box>
            <Typography variant="h4" sx={{
              fontSize: { xs: '1.5rem', md: '1.75rem' },
              fontWeight: 800,
              background: 'linear-gradient(45deg, #2563eb, #3b82f6)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}>
              Interview Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Streamline your teacher assessment process
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchInterviews} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
                <FiRefreshCw />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<FiCalendar />}
              onClick={() => setCreateModal(true)}
              size="medium"
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Add Interview
            </Button>

            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, display: 'flex', p: 0.5 }}>
              <Tooltip title="Table View">
                <IconButton
                  size="small"
                  onClick={() => setViewMode("table")}
                  color={viewMode === "table" ? "primary" : "default"}
                  sx={{ borderRadius: 0.5 }}
                >
                  <FiList />
                </IconButton>
              </Tooltip>
              <Tooltip title="Card View">
                <IconButton
                  size="small"
                  onClick={() => setViewMode("card")}
                  color={viewMode === "card" ? "primary" : "default"}
                  sx={{ borderRadius: 0.5 }}
                >
                  <FiBarChart2 />
                </IconButton>
              </Tooltip>
            </Box>

            <Button
              variant={filtersOpen ? "contained" : "outlined"}
              startIcon={<FiFilter />}
              onClick={() => setFiltersOpen((s) => !s)}
              size="medium"
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Filters
            </Button>
          </Stack>
        </Box>

        {/* Filter panel */}
        <Collapse in={filtersOpen}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.primary.main, 0.02)
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by name, email, subject..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiSearch color="gray" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                  <Button variant="outlined" startIcon={<FiDownload />} onClick={exportCsv} size="small">Export CSV</Button>
                  <Button variant="text" onClick={resetFilters} size="small" color="error">Reset Filters</Button>
                </Box>
              </Grid>

              <Grid xs={12}><Divider sx={{ my: 1 }} /></Grid>

              <Grid xs={12} md={3}><TextField label="Teacher Name" size="small" value={filters.teacherName} onChange={(e) => setFilters({ ...filters, teacherName: e.target.value })} fullWidth sx={{ bgcolor: 'background.paper' }} /></Grid>
              <Grid xs={12} md={3}><TextField label="Class Category" size="small" value={filters.classCategory} onChange={(e) => setFilters({ ...filters, classCategory: e.target.value })} fullWidth sx={{ bgcolor: 'background.paper' }} /></Grid>
              <Grid xs={12} md={3}><TextField label="Subject" size="small" value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })} fullWidth sx={{ bgcolor: 'background.paper' }} /></Grid>
              <Grid xs={12} md={3}><TextField label="Level" size="small" value={filters.level} onChange={(e) => setFilters({ ...filters, level: e.target.value })} fullWidth sx={{ bgcolor: 'background.paper' }} /></Grid>

              <Grid xs={12} md={3}><TextField label="Attempt" size="small" type="number" value={filters.attempt} onChange={(e) => setFilters({ ...filters, attempt: e.target.value })} fullWidth sx={{ bgcolor: 'background.paper' }} /></Grid>

              <Grid xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker label="From (Desired)" value={filters.dateFrom} onChange={(v) => setFilters({ ...filters, dateFrom: v })} slotProps={{ textField: { size: 'small', fullWidth: true, sx: { bgcolor: 'background.paper' } } }} />
                </LocalizationProvider>
              </Grid>

              <Grid xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker label="To (Desired)" value={filters.dateTo} onChange={(v) => setFilters({ ...filters, dateTo: v })} slotProps={{ textField: { size: 'small', fullWidth: true, sx: { bgcolor: 'background.paper' } } }} />
                </LocalizationProvider>
              </Grid>

              <Grid xs={12} md={3}>
                <TextField select label="Status" size="small" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} fullWidth sx={{ bgcolor: 'background.paper' }}>
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
        <Paper elevation={0} sx={{ p: 0, borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ p: 8, textAlign: "center" }}>
              <CircularProgress size={40} thickness={4} />
              <Typography sx={{ mt: 2, fontWeight: 500 }} color="text.secondary">Loading interviews...</Typography>
            </Box>
          ) : filteredTeachers.length === 0 ? (
            <Box sx={{ p: 8, textAlign: "center" }}>
              <Box sx={{ mb: 2, bgcolor: 'action.hover', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}>
                <FiSearch size={24} color="gray" />
              </Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>No interviews found</Typography>
              <Typography color="text.secondary">Try adjusting your filters or search terms</Typography>
            </Box>
          ) : viewMode === "table" ? (
            <Box sx={{ width: "100%" }}>
              <DataGrid
                rows={filteredTeachers}
                columns={tableColumns}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
                getRowId={(r) => r.id}
                autoHeight
                getRowHeight={() => 'auto'}
                sx={{
                  '& .MuiDataGrid-cell': {
                    py: 1,
                    px: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: 'action.hover',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  },
                  '& .MuiDataGrid-row:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                  },
                  border: 'none',
                }}
              />
            </Box>
          ) : (
            <Stack spacing={2} sx={{ p: 3, bgcolor: 'background.default' }}>{filteredTeachers.map(renderCard)}</Stack>
          )}
        </Paper>
      </Box>

      {/* DETAILS MODAL */}
      <Modal open={detailsModal.open} onClose={() => setDetailsModal({ open: false, data: null })}>
        <CenteredPaper>
          {detailsModal.data && (
            <>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700}>Interview Details</Typography>
                <IconButton size="small" onClick={() => setDetailsModal({ open: false, data: null })}><FiX /></IconButton>
              </Box>

              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar src={detailsModal.data.profilePicture} sx={{ width: 64, height: 64, bgcolor: stringToColor(detailsModal.data.name), fontSize: '1.5rem' }}>
                    {detailsModal.data.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>{detailsModal.data.name}</Typography>
                    <Typography color="text.secondary">{detailsModal.data.email}</Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Subject</Typography>
                    <Typography variant="body1" fontWeight={500}>{detailsModal.data.mergedSubject}</Typography>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Status</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip label={detailsModal.data.status} size="small" color={detailsModal.data.status === "Completed" ? "success" : detailsModal.data.status === "Scheduled" ? "info" : "warning"} />
                    </Box>
                  </Grid>

                  <Grid xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Desired Time</Typography>
                    <Typography variant="body1">{detailsModal.data.desiredDateTime}</Typography>
                  </Grid>

                  {detailsModal.data.scheduledDate && (
                    <Grid xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">Scheduled Time</Typography>
                      <Typography variant="body1" color="primary.main" fontWeight={500}>{detailsModal.data.scheduledDate}</Typography>
                    </Grid>
                  )}

                  {detailsModal.data.rejectionReason && (
                    <Grid xs={12}>
                      <Typography variant="caption" color="error" fontWeight={600} textTransform="uppercase">Rejection Reason</Typography>
                      <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#fff5f5', borderColor: '#feb2b2' }}>
                        <Typography variant="body2" color="error.dark">{detailsModal.data.rejectionReason}</Typography>
                      </Paper>
                    </Grid>
                  )}

                  {detailsModal.data.link && (
                    <Grid xs={12}>
                      <Button variant="outlined" startIcon={<FiExternalLink />} onClick={() => window.open(detailsModal.data.link, '_blank')} fullWidth>
                        Open Meeting Link
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
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
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700}>Schedule Interview</Typography>
                <IconButton size="small" onClick={() => setScheduleModal({ open: false, data: null })}><FiX /></IconButton>
              </Box>

              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Teacher</Typography>
                <Typography variant="h6" gutterBottom>{scheduleModal.data.name}</Typography>

                <Box sx={{ mt: 3 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="Select Date & Time"
                      value={selectedDateTime}
                      onChange={setSelectedDateTime}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Box>

                <TextField
                  fullWidth
                  label="Meeting Link"
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => { setMeetingLink(e.target.value); if (e.target.value.trim()) setMeetingLinkError(false); }}
                  error={meetingLinkError}
                  helperText={meetingLinkError ? "Meeting link is required" : ""}
                  sx={{ mt: 3 }}
                />
              </Box>

              <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={() => setScheduleModal({ open: false, data: null })}>Cancel</Button>
                <Button variant="contained" onClick={scheduleInterview} disabled={actionLoading} startIcon={actionLoading ? <CircularProgress size={18} color="inherit" /> : <FiClock />}>
                  Schedule
                </Button>
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
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#fff5f5' }}>
                <Typography variant="h6" fontWeight={700} color="error">Reject Interview</Typography>
                <IconButton size="small" onClick={() => setRejectModal({ open: false, data: null })}><FiX /></IconButton>
              </Box>

              <Box sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Please provide a reason for rejecting the interview request from <strong>{rejectModal.data.name}</strong>.
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Rejection Reason"
                  placeholder="e.g., Not qualified for this level..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  autoFocus
                />
              </Box>

              <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={() => setRejectModal({ open: false, data: null })}>Cancel</Button>
                <Button variant="contained" color="error" onClick={rejectInterview} disabled={actionLoading}>
                  {actionLoading ? <CircularProgress size={18} color="inherit" /> : 'Confirm Rejection'}
                </Button>
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
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f0fdf4' }}>
                <Typography variant="h6" fontWeight={700} color="success.main">Complete Interview</Typography>
                <IconButton size="small" onClick={() => setCompleteModal({ open: false, data: null })}><FiX /></IconButton>
              </Box>

              <Box sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Rate the interview performance for <strong>{completeModal.data.name}</strong>.
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <TextField
                    type="number"
                    label="Score (0-10)"
                    value={interviewScore}
                    onChange={(e) => setInterviewScore(e.target.value)}
                    slotProps={{ htmlInput: { min: 0, max: 10, step: 0.5 } }}
                    sx={{ width: 150 }}
                    autoFocus
                  />
                  <Typography variant="body2" color="text.secondary">
                    / 10 Points
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={() => setCompleteModal({ open: false, data: null })}>Cancel</Button>
                <Button variant="contained" color="success" onClick={completeInterview} disabled={actionLoading}>
                  {actionLoading ? <CircularProgress size={18} color="inherit" /> : 'Mark as Complete'}
                </Button>
              </Box>
            </>
          )}
        </CenteredPaper>
      </Modal>

      {/* CREATE MODAL */}
      <Modal open={createModal} onClose={() => setCreateModal(false)}>
        <CenteredPaper>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700}>Create Interview Record</Typography>
            <IconButton size="small" onClick={() => setCreateModal(false)}><FiX /></IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <TextField label="User ID" type="number" fullWidth size="small" value={createForm.user} onChange={(e) => setCreateForm({ ...createForm, user: e.target.value })} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField label="Subject ID" type="number" fullWidth size="small" value={createForm.subject} onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField label="Level ID" type="number" fullWidth size="small" value={createForm.level} onChange={(e) => setCreateForm({ ...createForm, level: e.target.value })} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField label="Class Category ID" type="number" fullWidth size="small" value={createForm.class_category} onChange={(e) => setCreateForm({ ...createForm, class_category: e.target.value })} />
              </Grid>

              <Grid xs={12} sm={6}>
                <TextField select label="Status" fullWidth size="small" value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}>
                  <MenuItem value="requested">Requested</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="fulfilled">Fulfilled</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField label="Attempt" type="number" fullWidth size="small" value={createForm.attempt} onChange={(e) => setCreateForm({ ...createForm, attempt: e.target.value })} />
              </Grid>

              <Grid xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Interview Time"
                    value={createForm.time}
                    onChange={(v) => setCreateForm({ ...createForm, time: v })}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid xs={12}>
                <TextField label="Meeting Link" fullWidth size="small" value={createForm.link} onChange={(e) => setCreateForm({ ...createForm, link: e.target.value })} />
              </Grid>

              {createForm.status === 'rejected' && (
                <Grid xs={12}>
                  <TextField label="Rejection Reason" fullWidth multiline rows={2} size="small" value={createForm.reject_reason} onChange={(e) => setCreateForm({ ...createForm, reject_reason: e.target.value })} />
                </Grid>
              )}

              {createForm.status === 'fulfilled' && (
                <Grid xs={12}>
                  <TextField label="Grade (0-10)" type="number" fullWidth size="small" value={createForm.grade} onChange={(e) => setCreateForm({ ...createForm, grade: e.target.value })} slotProps={{ htmlInput: { step: 0.1, min: 0, max: 10 } }} />
                </Grid>
              )}
            </Grid>
          </Box>

          <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateInterview} disabled={actionLoading}>
              {actionLoading ? <CircularProgress size={18} color="inherit" /> : 'Create Record'}
            </Button>
          </Box>
        </CenteredPaper>
      </Modal>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>

      <Backdrop open={actionLoading} sx={{ zIndex: (t) => t.zIndex.drawer + 2, color: '#fff' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Layout>
  );
}

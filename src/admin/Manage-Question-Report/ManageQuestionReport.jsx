import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  IconButton,
  Chip,
  Drawer,
  Grid,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  GetApp as GetAppIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import moment from "moment";
import Layout from "../Admin/Layout";
import {
  getQuestionReport,
  updateQuestionReport,
  // deleteQuestionReport,
  // patchQuestionReport,
} from "../../services/adminManageQuestionReport";

// ------------------------
// Helpers
// ------------------------
const safeFormatDate = (dateValue, format = "MMM DD, YYYY") => {
  if (!dateValue) return "—";
  try {
    return moment(dateValue).format(format);
  } catch {
    return "—";
  }
};

const safeText = (v, fallback = "—") =>
  v === null || v === undefined || v === "" ? fallback : v;

const issueTypeMapping = {
  "question wrong": "Question is incorrect",
  "incorrect answer": "Answer is incorrect",
  "offensive content": "Offensive content",
  "duplicate question": "Duplicate question",
  "typo error": "Typographical error",
  other: "Other issue",
};

const statusColors = {
  true: "#f9a825", // pending
  false: "#388e3c", // done
};

const statusLabels = {
  true: "Open",
  false: "Done",
};

// small debounce hook
function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  const timer = useRef();
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer.current);
  }, [value, delay]);
  return debounced;
}

// format issue helpers
const formatIssueTypes = (issueTypeArray) => {
  if (!issueTypeArray || !issueTypeArray.length) return "Not specified";
  return issueTypeArray
    .map((issue) => issueTypeMapping[issue?.issue_type] || issue?.issue_type || "Unknown")
    .join(", ");
};

// ------------------------
// Component
// ------------------------
export default function ManageQuestionReport() {
  const theme = useTheme();
  const isMobile = /xs|sm/.test(theme.breakpoints.values ? "lg" : ""); // not used heavily, kept for parity

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounced(searchTerm, 300);

  const [statusFilter, setStatusFilter] = useState("all"); // all / Pending / Resolved
  const [issueFilter, setIssueFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest"); // newest / oldest / status

  const [filtersOpen, setFiltersOpen] = useState(true);

  // pagination + table controls
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // detail panel
  const [selectedReport, setSelectedReport] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  // snackbar
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    fetchReports();
  }, []);

  const showSnack = (msg, severity = "success") => setSnack({ open: true, msg, severity });

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQuestionReport();
      // Ensure array
      const normalized = Array.isArray(data) ? data : data?.data ?? [];
      setReports(
        normalized.map((r) => ({
          ...r,
          // normalize missing nested structures
          question: r.question || null,
          user: r.user || null,
        }))
      );
      showSnack("Reports loaded", "success");
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || "Failed to fetch reports";
      setError(message);
      showSnack(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Derived lists
  const uniqueIssueTypes = useMemo(() => {
    const set = new Set();
    reports.forEach((r) =>
      (r.issue_type || []).forEach((i) => i?.issue_type && set.add(i.issue_type))
    );
    return Array.from(set);
  }, [reports]);

  // Filtering & sorting pipeline
  const filtered = useMemo(() => {
    const q = (debouncedSearch || "").toLowerCase().trim();

    let out = reports.filter(Boolean);

    if (statusFilter !== "all") {
      if (statusFilter === "Pending") out = out.filter((r) => r.status === true);
      else if (statusFilter === "Resolved") out = out.filter((r) => r.status === false);
    }

    if (issueFilter !== "all") {
      out = out.filter((r) =>
        (r.issue_type || []).some((it) => it?.issue_type === issueFilter)
      );
    }

    if (q) {
      out = out.filter((r) => {
        const reportedBy = `${r.user?.Fname || ""} ${r.user?.Lname || ""}`.toLowerCase();
        const questionText = (r.question?.text || "").toLowerCase();
        const email = (r.user?.email || "").toLowerCase();
        return (
          questionText.includes(q) ||
          reportedBy.includes(q) ||
          email.includes(q) ||
          (r.issue_type || []).some((it) => (it?.issue_type || "").toLowerCase().includes(q))
        );
      });
    }

    // sort
    out.sort((a, b) => {
      if (sortOrder === "newest") return moment(b.created_at).diff(moment(a.created_at));
      if (sortOrder === "oldest") return moment(a.created_at).diff(moment(b.created_at));
      if (sortOrder === "status") {
        // Open(true) first
        const score = (r) => (r.status === true ? 1 : r.status === false ? 3 : 2);
        return score(a) - score(b);
      }
      return 0;
    });

    return out;
  }, [reports, debouncedSearch, statusFilter, issueFilter, sortOrder]);

  // pagination slice
  const paginated = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // DataGrid columns (keeps content accessible and uses autoHeight)
  const columns = useMemo(
    () => [
      {
        field: "id",
        headerName: "Report ID",
        width: 110,
        renderCell: (params) => `REP01-00${params.value}`,
      },
      {
        field: "question",
        headerName: "Question",
        flex: 1.6,
        minWidth: 300,
        renderCell: (params) => (
          <Box sx={{ pr: 1 }}>
            <Typography sx={{ fontWeight: 600 }}>
              {safeText(params.value?.text, "No question text")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.question?.text?.length > 120
                ? `${params.row.question.text.substring(0, 120)}…`
                : params.row.question?.text || ""}
            </Typography>
          </Box>
        ),
      },
      {
        field: "reporter",
        headerName: "Reported By",
        width: 180,
        renderCell: (params) => (
          <Box>
            <Typography>{`${params.row.user?.Fname || ""} ${params.row.user?.Lname || ""}`.trim() || "Unknown"}</Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.user?.email || "—"}
            </Typography>
          </Box>
        ),
      },
      {
        field: "issue_type",
        headerName: "Issue",
        width: 220,
        renderCell: (params) => (
          <Typography variant="body2">
            {formatIssueTypes(params.value)}
          </Typography>
        ),
      },
      {
        field: "created_at",
        headerName: "Date",
        width: 140,
        renderCell: (params) => safeFormatDate(params.value, "MMM DD, YYYY HH:mm"),
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        renderCell: (params) => (
          <Chip
            label={statusLabels[params.value] ?? "Unknown"}
            size="small"
            sx={{
              bgcolor: statusColors[String(params.value)] ?? "#999",
              color: "#fff",
            }}
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View details">
              <IconButton size="small" onClick={() => openReportDetails(params.row)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {params.row.status === true && (
              <Tooltip title="Mark Done">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => confirmAndMarkDone(params.row)}
                    disabled={processing}
                    color="success"
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>
        ),
      },
    ],
    [processing]
  );

  // open details
  const openReportDetails = (row) => {
    setSelectedReport(row);
    setAdminNotes("");
    setDrawerOpen(true);
  };

  const closeReportDetails = () => {
    setSelectedReport(null);
    setDrawerOpen(false);
  };

  // mark done with confirm
  const confirmAndMarkDone = async (row) => {
    // simple confirm
    const ok = window.confirm(`Mark report REP01-00${row.id} as Done?`);
    if (!ok) return;
    await markAsDone(row.id);
  };

  const markAsDone = async (id) => {
    setProcessing(true);
    try {
      // API expects boolean false to indicate resolved in your earlier code
      const reportToUpdate = reports.find((r) => r.id === id);
      if (!reportToUpdate) throw new Error("Report not found");

      const payload = {
        status: false,
        question: reportToUpdate.question?.id,
        issue_type: (reportToUpdate.issue_type || []).map((i) => i.id),
      };

      await updateQuestionReport(id, payload);

      // local update
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: false } : r)));
      showSnack(`Report REP01-00${id} marked as Done`);
      // If detail panel open for this report, close it
      if (selectedReport?.id === id) closeReportDetails();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || "Failed to update report";
      showSnack(msg, "error");
    } finally {
      setProcessing(false);
    }
  };

  // Save admin notes locally (no API specified in your snippet)
  const saveAdminNotes = () => {
    if (!selectedReport) return;
    setReports((prev) =>
      prev.map((r) => (r.id === selectedReport.id ? { ...r, admin_notes: adminNotes || r.admin_notes } : r))
    );
    showSnack("Notes saved (locally)");
  };

  // CSV export
  const exportCsv = () => {
    const headers = ["Report ID", "Question", "Reporter", "Email", "Issue", "Date", "Status"];
    const rows = filtered.map((r) => [
      `REP01-00${r.id}`,
      `"${(r.question?.text || "").replace(/"/g, '""')}"`,
      `"${(`${r.user?.Fname || ""} ${r.user?.Lname || ""}`).trim()}"`,
      `"${r.user?.email || ""}"`,
      `"${formatIssueTypes(r.issue_type).replace(/"/g, '""')}"`,
      `"${safeFormatDate(r.created_at, "YYYY-MM-DD HH:mm")}"`,
      `"${statusLabels[r.status] ?? r.status}"`,
    ]);
    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encoded = encodeURI(csv);
    const a = document.createElement("a");
    a.href = encoded;
    a.download = `question_reports_${moment().format("YYYY-MM-DD")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // UI pieces
  const statusCounts = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === true).length;
    const resolved = reports.filter((r) => r.status === false).length;
    return { total, pending, resolved };
  }, [reports]);

  return (
    <Layout>
        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={4500}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled">
            {snack.msg}
          </Alert>
        </Snackbar>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} color="teal">
            Manage Question Reports
          </Typography>
          <Typography color="text.secondary">Review reported questions and resolve issues.</Typography>
        </Box>

        {/* Controls */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search question text, reporter, email or issue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchReports} disabled={loading}><RefreshIcon /></IconButton>
              </Tooltip>
              <Tooltip title="Export CSV">
                <IconButton onClick={exportCsv}><GetAppIcon /></IconButton>
              </Tooltip>

              <Button
                startIcon={<FilterListIcon />}
                variant={filtersOpen ? "contained" : "outlined"}
                onClick={() => setFiltersOpen((s) => !s)}
              >
                {filtersOpen ? "Hide Filters" : "Show Filters"}
              </Button>
            </Grid>

            {filtersOpen && (
              <Grid item xs={12}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Resolved">Resolved</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Issue</InputLabel>
                      <Select value={issueFilter} label="Issue" onChange={(e) => setIssueFilter(e.target.value)}>
                        <MenuItem value="all">All Issues</MenuItem>
                        {uniqueIssueTypes.map((it) => (
                          <MenuItem key={it} value={it}>
                            {issueTypeMapping[it] || it}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort</InputLabel>
                      <Select value={sortOrder} label="Sort" onChange={(e) => setSortOrder(e.target.value)}>
                        <MenuItem value="newest">Newest First</MenuItem>
                        <MenuItem value="oldest">Oldest First</MenuItem>
                        <MenuItem value="status">By Status</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={3} sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setIssueFilter("all");
                        setSortOrder("newest");
                      }}
                      fullWidth
                    >
                      Reset
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h5" fontWeight={700}>{statusCounts.total}</Typography>
              <Typography color="text.secondary">Total Reports</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Paper sx={{ p: 2, textAlign: "center", borderTop: `3px solid ${statusColors.true}` }}>
              <Typography variant="h5" fontWeight={700}>{statusCounts.pending}</Typography>
              <Typography color="text.secondary">Pending</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Paper sx={{ p: 2, textAlign: "center", borderTop: `3px solid ${statusColors.false}` }}>
              <Typography variant="h5" fontWeight={700}>{statusCounts.resolved}</Typography>
              <Typography color="text.secondary">Resolved</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Content: DataGrid or skeleton / empty */}
        <Paper sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <CircularProgress />
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Typography color="text.secondary">No reports found matching your criteria.</Typography>
            </Box>
          ) : (
            <Box sx={{ width: "100%" }}>
              {/* DataGrid with autoHeight and auto row height so long texts are visible */}
              <DataGrid
                rows={filtered}
                columns={columns}
                autoHeight
                getRowId={(r) => r.id}
                pageSize={pageSize}
                rowsPerPageOptions={[5, 10, 25, 50]}
                pagination
                paginationMode="client"
                onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(0); }}
                page={page}
                onPageChange={(p) => setPage(p)}
                density="standard"
                disableSelectionOnClick
                sx={{
                  border: "none",
                  "& .MuiDataGrid-columnHeaders": {
                    background: theme.palette.mode === "dark" ? "#2a2a2a" : "#f5f5f5",
                    fontWeight: 700,
                  },
                  "& .MuiDataGrid-cell": {
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    alignItems: "flex-start",
                    py: 1.5,
                  },
                }}
                getRowHeight={() => "auto"}
              />
            </Box>
          )}
        </Paper>

        {/* Details Drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={closeReportDetails} PaperProps={{ sx: { width: { xs: "100%", sm: 560 } } }}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="h6">Report Details</Typography>
              <Chip label={selectedReport ? statusLabels[selectedReport.status] : "—"} sx={{ bgcolor: selectedReport ? statusColors[String(selectedReport.status)] : "#999", color: "#fff" }} />
            </Box>

            {selectedReport ? (
              <>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle2" color="text.secondary">Report ID</Typography>
                <Typography sx={{ mb: 1 }}>REP01-00{selectedReport.id}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Reported Question</Typography>
                <Typography sx={{ mb: 1 }}>{selectedReport.question?.text || "N/A"}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Options</Typography>
                <Box sx={{ mb: 1 }}>
                  {(selectedReport.question?.options || []).map((opt, idx) => (
                    <Typography key={idx} sx={{ fontWeight: selectedReport.question?.correct_option === idx ? 700 : 400 }}>
                      {idx + 1}. {opt} {selectedReport.question?.correct_option === idx ? "(Correct)" : ""}
                    </Typography>
                  ))}
                </Box>

                <Typography variant="subtitle2" color="text.secondary">Reported By</Typography>
                <Typography sx={{ mb: 1 }}>{`${selectedReport.user?.Fname || ""} ${selectedReport.user?.Lname || ""}`.trim() || "Unknown"}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Reported At</Typography>
                <Typography sx={{ mb: 1 }}>{safeFormatDate(selectedReport.created_at, "MMM DD, YYYY HH:mm")}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Issue Type</Typography>
                <Typography sx={{ mb: 1 }}>{formatIssueTypes(selectedReport.issue_type)}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography sx={{ mb: 1 }}>{selectedReport.description || "No description provided"}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Admin Notes</Typography>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  sx={{ mb: 2 }}
                  placeholder="Add notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                  <Button onClick={() => { saveAdminNotes(); closeReportDetails(); }} variant="outlined">Save & Close</Button>
                  {selectedReport.status === true && (
                    <Button onClick={() => confirmAndMarkDone(selectedReport)} variant="contained" color="success" disabled={processing}>
                      {processing ? <CircularProgress size={18} color="inherit" /> : "Mark Done"}
                    </Button>
                  )}
                </Box>
              </>
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography color="text.secondary">No report selected</Typography>
              </Box>
            )}
          </Box>
        </Drawer>

        {/* Confirm dialog example (optional) */}
        <Dialog open={Boolean(processing && false)} /* hidden by default */ onClose={() => {}}>
          <DialogTitle>Processing</DialogTitle>
          <DialogContent>
            <Typography>Working…</Typography>
          </DialogContent>
        </Dialog>
    </Layout>
  );
}

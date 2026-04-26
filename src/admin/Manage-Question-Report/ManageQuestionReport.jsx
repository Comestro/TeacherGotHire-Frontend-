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
  TablePagination,
  alpha,
} from "@mui/material";
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
} from "../../services/adminManageQuestionReport";
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
  false: "#f9a825", // pending (yellow)
  true: "#388e3c", // done (green)
};

const statusLabels = {
  false: "Pending",
  true: "Done",
};
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

const formatIssueTypes = (issueTypeArray) => {
  if (!issueTypeArray || !issueTypeArray.length) return "General Issue";
  return issueTypeArray
    .map((issue) => issueTypeMapping[issue?.issue_type] || issue?.issue_type || "Unknown")
    .join(", ");
};
export default function ManageQuestionReport() {
  const theme = useTheme();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounced(searchTerm, 300);

  const [statusFilter, setStatusFilter] = useState("all");
  const [issueFilter, setIssueFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedReport, setSelectedReport] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
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
      const normalized = Array.isArray(data) ? data : data?.data ?? [];
      setReports(
        normalized.map((r) => ({
          ...r,
          question: r.question || null,
          user: r.user || null,
        }))
      );
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || "Failed to fetch reports";
      setError(message);
      showSnack(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = (debouncedSearch || "").toLowerCase().trim();
    let out = reports.filter(Boolean);

    if (statusFilter !== "all") {
      if (statusFilter === "Pending") out = out.filter((r) => r.status === false);
      else if (statusFilter === "Resolved") out = out.filter((r) => r.status === true);
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
        const examInfo = `${r.exam_name || ""} ${r.class_category || ""} ${r.subject || ""}`.toLowerCase();
        const email = (r.user?.email || "").toLowerCase();
        return (
          questionText.includes(q) ||
          examInfo.includes(q) ||
          reportedBy.includes(q) ||
          email.includes(q)
        );
      });
    }

    out.sort((a, b) => {
      if (sortOrder === "newest") return moment(b.created_at).diff(moment(a.created_at));
      if (sortOrder === "oldest") return moment(a.created_at).diff(moment(b.created_at));
      return 0;
    });

    return out;
  }, [reports, debouncedSearch, statusFilter, issueFilter, sortOrder]);

  const paginated = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const openReportDetails = (row) => {
    setSelectedReport(row);
    setAdminNotes("");
    setDrawerOpen(true);
  };

  const closeReportDetails = () => {
    setSelectedReport(null);
    setDrawerOpen(false);
  };

  const markAsDone = async (id) => {
    setProcessing(true);
    try {
      const r = reports.find((x) => x.id === id);
      const payload = {
        status: true,
        question: r.question?.id,
        issue_type: (r.issue_type || []).map((i) => i.id),
      };
      const updated = await updateQuestionReport(id, payload);
      setReports((prev) => prev.map((x) => (x.id === id ? { ...x, ...updated } : x)));
      showSnack(`Report #${id} marked as Resolved`);
      if (selectedReport?.id === id) closeReportDetails();
    } catch (err) {
      showSnack("Failed to update status", "error");
    } finally {
      setProcessing(false);
    }
  };

  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => !r.status).length;
    const resolved = total - pending;
    return { total, pending, resolved };
  }, [reports]);

  return (
    <Layout>
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>

      <Box sx={{ p: 2, maxWidth: 1400, mx: "auto" }}>
        {/* Header Section */}
        <Box sx={{ mb: 2, display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: "#008080", letterSpacing: "-0.01em", mb: 0.5 }}>
              Issue Reports
            </Typography>
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              System-wide question audit and resolution dashboard.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Force Refresh">
              <IconButton onClick={fetchReports} disabled={loading} sx={{ bgcolor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", "&:hover": { bgcolor: "#f8fafc" } }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              disableElevation
              startIcon={<FilterListIcon />}
              onClick={() => setFiltersOpen(!filtersOpen)}
              sx={{ bgcolor: "#008080", borderRadius: 2, px: 3, fontWeight: 600, "&:hover": { bgcolor: "#00695c" } }}
            >
              Filter
            </Button>
          </Stack>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            { label: "Total Reports", value: stats.total, color: "#008080", icon: <VisibilityIcon /> },
            { label: "Pending Resolution", value: stats.pending, color: "#f59e0b", icon: <FilterListIcon /> },
            { label: "Resolved", value: stats.resolved, color: "#10b981", icon: <CheckIcon /> },
          ].map((stat, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "white", position: "relative", overflow: "hidden" }}>
                <Box sx={{ position: "absolute", top: -10, right: -10, opacity: 0.05, transform: "scale(2.5)", color: stat.color }}>
                  {stat.icon}
                </Box>
                <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.1em" }}>
                  {stat.label}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: stat.color, mt: 0.5 }}>
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Search & Filter Bar */}
        {filtersOpen && (
          <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "#fbfcfd" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  placeholder="Search questions, context or reporters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1.5, color: "text.secondary" }} />,
                    sx: { borderRadius: 2, bgcolor: "white" }
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} md={2.5}>
                <FormControl fullWidth size="small">
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ borderRadius: 2, bgcolor: "white" }}>
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Resolved">Resolved</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2.5}>
                <FormControl fullWidth size="small">
                  <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} sx={{ borderRadius: 2, bgcolor: "white" }}>
                    <MenuItem value="newest">Newest First</MenuItem>
                    <MenuItem value="oldest">Oldest First</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth variant="text" onClick={() => { setSearchTerm(""); setStatusFilter("all"); setSortOrder("newest"); }} sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Reset All
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Custom Modern Table */}
        <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden", bgcolor: "white" }}>
          {loading ? (
            <Box sx={{ p: 12, textAlign: "center" }}>
              <CircularProgress size={40} sx={{ color: "#008080" }} />
              <Typography sx={{ mt: 2, fontWeight: 500 }} color="text.secondary">Fetching latest reports...</Typography>
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ p: 12, textAlign: "center" }}>
              <Typography variant="h6" fontWeight={600} color="text.secondary">No Reports Found</Typography>
              <Typography variant="body2" color="text.secondary">Try adjusting your filters or search keywords.</Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Reported Question & Context</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Issue Description</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Reporter Details</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Resolved By</th>
                    <th style={{ padding: "10px 16px", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "10px 16px", textAlign: "right", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((report) => (
                    <tr key={report.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "all 0.2s" }}>
                      <td style={{ padding: "12px 16px", width: "35%" }}>
                        <Typography variant="body2" fontWeight={600} sx={{ color: "#1e293b", mb: 1, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {report.question?.text || "—"}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip label={report.class_category || "General"} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: "#f1f5f9" }} />
                          <Chip label={report.subject || "No Subject"} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: alpha("#008080", 0.08), color: "#008080" }} />
                          <Chip label={report.exam_name || "Custom Exam"} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: "#fff7ed", color: "#ea580c" }} />
                        </Stack>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Typography variant="body2" fontWeight={600} sx={{ color: "#008080" }}>
                          {formatIssueTypes(report.issue_type)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                          ID: REP-{report.id.toString().padStart(4, "0")}
                        </Typography>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Typography variant="body2" fontWeight={600} color="#334155">
                          {`${report.user?.Fname || "Guest"} ${report.user?.Lname || ""}`.trim()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.user?.email || "anonymous@ptpi.com"}
                        </Typography>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {report.status && report.resolved_by ? (
                          <>
                            <Typography variant="body2" fontWeight={600} color="#334155">
                              {`${report.resolved_by.Fname || ""} ${report.resolved_by.Lname || ""}`.trim() || report.resolved_by.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Admin / Manager
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <Chip
                          label={report.status ? "Resolved" : "Pending"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.65rem",
                            height: 22,
                            borderRadius: "6px",
                            bgcolor: report.status ? alpha("#10b981", 0.1) : alpha("#f59e0b", 0.1),
                            color: report.status ? "#059669" : "#d97706"
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => openReportDetails(report)} sx={{ color: "#008080", bgcolor: alpha("#008080", 0.05) }}>
                              <VisibilityIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          {!report.status && (
                            <Tooltip title="Mark Resolved">
                              <IconButton size="small" color="success" onClick={() => markAsDone(report.id)} sx={{ bgcolor: alpha("#10b981", 0.05) }}>
                                <CheckIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", borderTop: "1px solid #f1f5f9", bgcolor: "#f8fafc" }}>
                <TablePagination
                  component="div"
                  count={filtered.length}
                  page={page}
                  onPageChange={(e, p) => setPage(p)}
                  rowsPerPage={pageSize}
                  onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0); }}
                />
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Modern Detail Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={closeReportDetails} PaperProps={{ sx: { width: { xs: "100%", sm: 600 }, p: 0, borderRadius: { xs: 0, sm: "20px 0 0 20px" } } }}>
        <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: "#008080" }}>Report Profile</Typography>
              <Typography variant="caption" color="text.secondary">Transaction ID: PTPI-AUDIT-{selectedReport?.id}</Typography>
            </Box>
            <IconButton onClick={closeReportDetails}><RefreshIcon sx={{ transform: "rotate(45deg)" }} /></IconButton>
          </Box>

          {selectedReport && (
            <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
              <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: "#f1f5f9" }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>Reported Content</Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 1, lineHeight: 1.6, color: "#1e293b" }}>
                  {selectedReport.question?.text}
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>Class Category</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedReport.class_category || "—"}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>Subject</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: "#008080" }}>{selectedReport.subject || "—"}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>Exam</Typography>
                  <Typography variant="body2" fontWeight={600} color="text.primary">{selectedReport.exam_name || "—"}</Typography>
                </Grid>
                {selectedReport.status && selectedReport.resolved_by && (
                  <Grid item xs={12}>
                    <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, bgcolor: alpha("#10b981", 0.05), border: "1px solid", borderColor: alpha("#10b981", 0.1) }}>
                      <Typography variant="overline" color="success.main" fontWeight={700}>Resolved By</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {`${selectedReport.resolved_by.Fname || ""} ${selectedReport.resolved_by.Lname || ""}`.trim() || selectedReport.resolved_by.username}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 1.5, display: "block" }}>Options Check</Typography>
                <Stack spacing={1}>
                  {(selectedReport.question?.options || []).map((opt, i) => (
                    <Box key={i} sx={{ p: 1.5, borderRadius: 2, border: "1px solid", borderColor: selectedReport.question?.correct_option === i + 1 ? "#008080" : "divider", bgcolor: selectedReport.question?.correct_option === i + 1 ? alpha("#008080", 0.03) : "transparent", display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: selectedReport.question?.correct_option === i + 1 ? "#008080" : "#cbd5e1", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                        {i + 1}
                      </Box>
                      <Typography variant="body2" fontWeight={selectedReport.question?.correct_option === i + 1 ? 600 : 400}>
                        {opt} {selectedReport.question?.correct_option === i + 1 && "(Active Answer)"}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: "block" }}>Internal Notes</Typography>
                <TextField multiline rows={4} fullWidth placeholder="Add administrative notes regarding this audit..." variant="filled" hiddenLabel />
              </Box>

              <Box sx={{ mt: "auto", pt: 2, display: "flex", gap: 2 }}>
                <Button fullWidth variant="outlined" size="large" onClick={closeReportDetails} sx={{ borderRadius: 3, fontWeight: 700, borderColor: "divider", color: "text.primary" }}>
                  Cancel
                </Button>
                {!selectedReport.status && (
                  <Button fullWidth variant="contained" size="large" onClick={() => markAsDone(selectedReport.id)} disabled={processing} sx={{ borderRadius: 3, bgcolor: "#008080", fontWeight: 700, "&:hover": { bgcolor: "#00695c" } }}>
                    {processing ? <CircularProgress size={24} color="inherit" /> : "Verify & Close"}
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>
    </Layout>
  );
}

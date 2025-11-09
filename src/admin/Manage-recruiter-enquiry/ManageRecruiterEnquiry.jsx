import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
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
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  Skeleton,
  Stack,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Notes as NotesIcon,
  Visibility as VisibilityIcon,
  Replay as ReplayIcon,
  GetApp as GetAppIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Layout from '../Admin/Layout';
import { getRecruiterEnquiry } from '../../services/adminRecruiterEnquiryApi';
import dayjs from 'dayjs';

/**
 * ManageRecruiterEnquiry — redesigned, responsive admin UI
 *
 * Key notes:
 * - DataGrid shows filteredInquiries (not original list)
 * - autoHeight + getRowHeight ensures row content isn't hidden
 * - search is debounced
 * - mobile card view available below the table
 */

const STATUS_COLORS = {
  Pending: 'warning.main',
  Approved: 'success.main',
  Rejected: 'error.main',
};

const safe = (v, fallback = '—') => (v === null || v === undefined || v === '' ? fallback : v);

const useDebouncedValue = (value, delay = 250) => {
  const [debounced, setDebounced] = useState(value);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer.current);
  }, [value, delay]);

  return debounced;
};

export default function ManageRecruiterEnquiry() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Data
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [sortOption, setSortOption] = useState('newest');
  const [filters, setFilters] = useState({
    teacherType: '',
    state: '',
    status: [],
  });

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  const [pageModel, setPageModel] = useState({ page: 0, pageSize: 10 });

  // fetch inquiries
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await getRecruiterEnquiry();
        // normalize/transform safely
        const transformed = Array.isArray(resp)
          ? resp.map((item) => ({
              id: item.id,
              recruiterName: safe(item.user.Fname + " " + item.user.Lname, 'Unknown'),
              email: safe(item.email, ''),
              contactNumber: safe(item.contact, ''),
              subjects: Array.isArray(item.subject) ? item.subject.map((s) => s.subject_name) : [],
              teacherType: safe(item.teachertype, ''),
              location: {
                city: safe(item.city, ''),
                state: safe(item.state, ''),
                area: safe(item.area, ''),
                pincode: safe(item.pincode, ''),
              },
              status: 'Pending',
              createdAt: item.created_at ? item.created_at : new Date().toISOString(),
              adminNotes: item.adminNotes || '',
              raw: item,
            }))
          : [];
        if (!mounted) return;
        setInquiries(transformed);
        setFilteredInquiries(transformed);
      } catch (err) {
        if (!mounted) return;
        setError('Failed to load inquiries');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Filtering + sorting
  useEffect(() => {
    let out = [...inquiries];

    // search
    const q = (debouncedSearch || '').trim().toLowerCase();
    if (q) {
      out = out.filter((it) => {
        const hay = [
          it.recruiterName,
          it.email,
          it.contactNumber,
          it.teacherType,
          it.location.city,
          it.location.state,
          ...(it.subjects || []),
        ].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }

    // status filter
    if (filters.status && filters.status.length > 0) {
      out = out.filter((it) => filters.status.includes(it.status));
    }

    // teacher type
    if (filters.teacherType) {
      out = out.filter((it) => it.teacherType === filters.teacherType);
    }

    // state
    if (filters.state) {
      out = out.filter((it) => it.location.state === filters.state);
    }

    // sort
    out.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortOption === 'newest' ? db - da : da - db;
    });

    setFilteredInquiries(out);
    setPageModel((m) => ({ ...m, page: 0 })); // reset page on filter change
  }, [inquiries, debouncedSearch, filters, sortOption]);

  // helpers
  const openDetails = (row) => {
    setSelectedInquiry(row);
    setIsDrawerOpen(true);
  };

  const closeDetails = () => {
    setIsDrawerOpen(false);
    setSelectedInquiry(null);
  };

  const handleApprove = (id) => {
    setInquiries((prev) => prev.map((it) => (it.id === id ? { ...it, status: 'Approved' } : it)));
    if (selectedInquiry?.id === id) setSelectedInquiry((s) => ({ ...s, status: 'Approved' }));
  };

  const handleOpenRejectModal = (row) => {
    setSelectedInquiry(row);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!selectedInquiry) return;
    setInquiries((prev) => prev.map((it) =>
      it.id === selectedInquiry.id ? { ...it, status: 'Rejected', adminNotes: (it.adminNotes ? it.adminNotes + '\n' : '') + `Rejected: ${rejectReason}` } : it
    ));
    setSelectedInquiry((s) => s ? { ...s, status: 'Rejected', adminNotes: (s.adminNotes ? s.adminNotes + '\n' : '') + `Rejected: ${rejectReason}` } : s);
    setIsRejectModalOpen(false);
    setRejectReason('');
  };

  const handleAddNote = () => {
    if (!selectedInquiry || !adminNote.trim()) return;
    const noteLine = `${dayjs().format('YYYY-MM-DD')}: ${adminNote.trim()}`;
    setInquiries((prev) => prev.map((it) => it.id === selectedInquiry.id ? { ...it, adminNotes: (it.adminNotes ? it.adminNotes + '\n' : '') + noteLine } : it));
    setSelectedInquiry((s) => s ? { ...s, adminNotes: (s.adminNotes ? s.adminNotes + '\n' : '') + noteLine } : s);
    setAdminNote('');
    setIsNoteModalOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({ teacherType: '', state: '', status: [] });
    setSearchTerm('');
  };

  const exportCsv = () => {
    const headers = ['Recruiter', 'Email', 'Contact', 'Subjects', 'Teacher Type', 'Location', 'Status', 'Applied'];
    const rows = filteredInquiries.map((r) => [
      `"${r.recruiterName.replace(/"/g, '""')}"`,
      `"${r.email.replace(/"/g, '""')}"`,
      `"${r.contactNumber.replace(/"/g, '""')}"`,
      `"${(r.subjects || []).join('; ').replace(/"/g, '""')}"`,
      `"${r.teacherType.replace(/"/g, '""')}"`,
      `"${[r.location.area, r.location.city, r.location.state, r.location.pincode].filter(Boolean).join(', ').replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${dayjs(r.createdAt).format('YYYY-MM-DD')}"`,
    ].join(','));
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encoded = encodeURI(csv);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = `recruiter_inquiries_${dayjs().format('YYYY-MM-DD')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // DataGrid columns
  const columns = useMemo(() => ([
    {
      field: 'recruiterName',
      headerName: 'Recruiter',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography fontWeight={600}>{safe(params.value)}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{safe(params.row.email)}</Typography>
          <Typography variant="caption" color="text.secondary">{safe(params.row.contactNumber)}</Typography>
        </Box>
      ),
    },
    {
      field: 'subjects',
      headerName: 'Requirements',
      flex: 1.6,
      minWidth: 220,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
            {(params.value || []).slice(0, 6).map((s, i) => <Chip key={i} size="small" label={s} />)}
            {(params.value || []).length > 6 && <Chip size="small" label={`+${(params.value || []).length - 6}`} />}
          </Box>
          <Typography variant="caption" color="text.secondary">Type: {safe(params.row.teacherType)}</Typography>
        </Box>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => {
        const loc = params.row.location || {};
        return (
          <Box>
            <Typography>{[loc.city || '', loc.state || ''].filter(Boolean).join(', ') || '—'}</Typography>
            <Typography variant="caption" color="text.secondary">{[loc.area, loc.pincode].filter(Boolean).join(' - ')}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={safe(params.value, 'Pending')}
          size="small"
          sx={{
            bgcolor: STATUS_COLORS[params.value] ? STATUS_COLORS[params.value] : 'warning.main',
            color: '#fff',
          }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => openDetails(params.row)}><VisibilityIcon fontSize="small" /></IconButton>
          </Tooltip>
          {params.row.status === 'Pending' && (
            <>
              <Tooltip title="Approve">
                <IconButton size="small" onClick={() => handleApprove(params.row.id)}><CheckIcon fontSize="small" /></IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton size="small" color="error" onClick={() => handleOpenRejectModal(params.row)}><CloseIcon fontSize="small" /></IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ]), [inquiries]);

  return (
    <Layout>
        <Box sx={{ mb: 2,mt: { xs: 2, md: 0 } }}>
          <Typography variant="h4" sx={{fontSize: { xs: '1.5rem', md: '2rem' }}} fontWeight={700}>Manage Recruiter Inquiries</Typography>
          <Typography variant="body2" color="text.secondary">Review, filter and act on recruiter enquiries for teachers</Typography>
        </Box>

        {/* Sticky filter bar */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, position: 'sticky', top: 8, zIndex: 10 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
            <TextField
              size="small"
              placeholder="Search by name, email, subject or location..."
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />

            <Tooltip title="Refresh">
              <IconButton onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); }, 600); }}><ReplayIcon /></IconButton>
            </Tooltip>

            <Tooltip title="Export CSV">
              <IconButton onClick={exportCsv}><GetAppIcon /></IconButton>
            </Tooltip>

            <IconButton color={isFilterExpanded ? 'primary' : 'default'} onClick={() => setIsFilterExpanded((s) => !s)}>
              <FilterListIcon />
            </IconButton>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Sort</InputLabel>
              <Select value={sortOption} label="Sort" onChange={(e) => setSortOption(e.target.value)}>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Collapse in={isFilterExpanded}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Teacher Type</InputLabel>
                  <Select
                    label="Teacher Type"
                    value={filters.teacherType}
                    onChange={(e) => setFilters((f) => ({ ...f, teacherType: e.target.value }))}
                  >
                    <MenuItem value=''>All Types</MenuItem>
                    <MenuItem value='School Teacher'>School Teacher</MenuItem>
                    <MenuItem value='Tutor'>Tutor</MenuItem>
                    <MenuItem value='Coaching Faculty'>Coaching Faculty</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>State</InputLabel>
                  <Select
                    label="State"
                    value={filters.state}
                    onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))}
                  >
                    <MenuItem value=''>All States</MenuItem>
                    <MenuItem value='Bihar'>Bihar</MenuItem>
                    <MenuItem value='Delhi'>Delhi</MenuItem>
                    <MenuItem value='Maharashtra'>Maharashtra</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label="Pending"
                  clickable
                  color={filters.status.includes('Pending') ? 'primary' : 'default'}
                  onClick={() => setFilters((f) => ({ ...f, status: f.status.includes('Pending') ? f.status.filter(s => s !== 'Pending') : [...f.status, 'Pending'] }))}
                />
                <Chip
                  label="Approved"
                  clickable
                  color={filters.status.includes('Approved') ? 'success' : 'default'}
                  onClick={() => setFilters((f) => ({ ...f, status: f.status.includes('Approved') ? f.status.filter(s => s !== 'Approved') : [...f.status, 'Approved'] }))}
                />
                <Chip
                  label="Rejected"
                  clickable
                  color={filters.status.includes('Rejected') ? 'error' : 'default'}
                  onClick={() => setFilters((f) => ({ ...f, status: f.status.includes('Rejected') ? f.status.filter(s => s !== 'Rejected') : [...f.status, 'Rejected'] }))}
                />
                <Box sx={{ ml: 'auto' }}>
                  <Button size="small" onClick={handleClearFilters}>Clear</Button>
                </Box>
              </Grid>
            </Grid>
          </Collapse>
        </Paper>

        {/* DataGrid */}
        <Paper elevation={1} sx={{ borderRadius: 2, mb: 3,display: { xs: 'none', md: 'block' } }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularLoaderFallback />
            </Box>
          ) : filteredInquiries.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">No inquiries found</Typography>
              <Typography variant="body2" color="text.secondary">Try adjusting filters or search</Typography>
            </Box>
          ) : (
            <Box sx={{ height: '100%', width: '100%' }}>
              <DataGrid
                rows={filteredInquiries}
                columns={columns}
                autoHeight
                getRowHeight={() => 'auto'}
                pageSizeOptions={[5, 10, 25, 50]}
                paginationModel={pageModel}
                onPaginationModelChange={setPageModel}
                disableRowSelectionOnClick
                density={isMobile ? 'compact' : 'standard'}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5', fontWeight: 700 },
                  '& .MuiDataGrid-cell': { alignItems: 'flex-start', py: 1.5 },
                }}
                initialState={{
                  sorting: { sortModel: [{ field: 'createdAt', sort: sortOption === 'newest' ? 'desc' : 'asc' }] },
                }}
                onRowDoubleClick={(params) => openDetails(params.row)}
              />
            </Box>
          )}
        </Paper>

        {/* Mobile card view (fallback) */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          {filteredInquiries.map((inq) => (
            <Card key={inq.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography fontWeight={700}>{inq.recruiterName}</Typography>
                    <Typography variant="caption" color="text.secondary">{inq.email}</Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {(inq.subjects || []).slice(0, 4).map((s, i) => <Chip key={i} label={s} size="small" />)}
                      {(inq.subjects || []).length > 4 && <Chip label={`+${(inq.subjects || []).length - 4}`} size="small" />}
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip label={inq.status} size="small" sx={{ bgcolor: STATUS_COLORS[inq.status], color: '#fff' }} />
                    <Box sx={{ mt: 1 }}>
                      <IconButton size="small" onClick={() => openDetails(inq)}><VisibilityIcon /></IconButton>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Drawer for details */}
        <Drawer
          anchor={isMobile ? 'bottom' : 'right'}
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          PaperProps={{ sx: { width: isMobile ? '100%' : 420, p: 2 } }}
        >
          {selectedInquiry ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Inquiry Details</Typography>
                <IconButton onClick={() => setIsDrawerOpen(false)}><CloseIcon /></IconButton>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2">Recruiter</Typography>
              <Typography fontWeight={600}>{selectedInquiry.recruiterName}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedInquiry.email} • {selectedInquiry.contactNumber}</Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Teacher Type</Typography>
                  <Typography>{selectedInquiry.teacherType}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip label={selectedInquiry.status} size="small" sx={{ bgcolor: STATUS_COLORS[selectedInquiry.status], color: '#fff' }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2">Subjects</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                    {(selectedInquiry.subjects || []).map((s, i) => <Chip key={i} label={s} size="small" />)}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2">Location</Typography>
                  <Typography>{[selectedInquiry.location.area, selectedInquiry.location.city, selectedInquiry.location.state, selectedInquiry.location.pincode].filter(Boolean).join(', ')}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2">Admin Notes</Typography>
                  <Paper variant="outlined" sx={{ p: 1, mt: 1, minHeight: 80, whiteSpace: 'pre-wrap' }}>
                    {selectedInquiry.adminNotes || <Typography color="text.secondary">No notes yet</Typography>}
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', flexDirection: "column", gap: 1, mt: 2 }}>
                {selectedInquiry.status === 'Pending' && (
                  <>
                    <Button variant="contained" sx={{backgroundColor:"teal"}} startIcon={<CheckIcon />} onClick={() => handleApprove(selectedInquiry.id)} fullWidth>Approve</Button>
                    <Button variant="outlined" color="error" startIcon={<CloseIcon />} onClick={() => handleOpenRejectModal(selectedInquiry)} fullWidth>Reject</Button>
                  </>
                )}
                <Button variant="outlined" startIcon={<NotesIcon />} onClick={() => setIsNoteModalOpen(true)}>Add Note</Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography color="text.secondary">No inquiry selected</Typography>
            </Box>
          )}
        </Drawer>

        {/* Reject dialog */}
        <Dialog open={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Reject Inquiry</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 1 }}>Please choose or write a reason for rejection.</Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Reason</InputLabel>
              <Select value={rejectReason} label="Reason" onChange={(e) => setRejectReason(e.target.value)}>
                <MenuItem value="">Select reason</MenuItem>
                <MenuItem value="Incomplete information">Incomplete information</MenuItem>
                <MenuItem value="Not matching requirements">Not matching requirements</MenuItem>
                <MenuItem value="No available teachers">No available teachers</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            {rejectReason === 'Other' && (
              <TextField fullWidth multiline rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Write reason" />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button onClick={handleRejectConfirm} color="error">Reject</Button>
          </DialogActions>
        </Dialog>

        {/* Add note dialog */}
        <Dialog open={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Add Admin Note</DialogTitle>
          <DialogContent>
            <TextField fullWidth multiline rows={4} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Enter note..." />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsNoteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNote} disabled={!adminNote.trim()}>Add</Button>
          </DialogActions>
        </Dialog>
    </Layout>
  );
}

/* Small helper to show skeleton loader while fetching */
function CircularLoaderFallback() {
  return (
    <Stack spacing={1} alignItems="center">
      <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'grey.200' }} />
      <Typography>Loading inquiries…</Typography>
      <Box sx={{ width: '100%' }}>
        <Skeleton variant="rectangular" height={36} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={36} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={36} />
      </Box>
    </Stack>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Paper,
  Modal,
  Backdrop,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import Layout from '../Admin/Layout';
import { getPasskey, updatePasskey } from '../../services/adminPasskeyApi';
import {
  FaUser,
  FaBook,
  FaKey,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaEye
} from 'react-icons/fa';

// Redesigned PasskeyManagement to match the ManageSkills visual/layout patterns
export default function PasskeyManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailsModal, setDetailsModal] = useState({ open: false, row: null });
  const [confirm, setConfirm] = useState({ open: false, type: null, row: null });
  const [processing, setProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: isMobile ? 5 : 10 });

  useEffect(() => {
    setPaginationModel((p) => ({ ...p, pageSize: isMobile ? 5 : 10 }));
  }, [isMobile]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await getPasskey();
      const rows = (Array.isArray(resp) ? resp : []).map((r) => ({
        ...r,
        id: r.id,
        userEmail: r.user?.email || 'N/A',
        examName: r.exam?.name || 'N/A',
        centerName: r.center?.name || 'N/A',
        requestDate: r.created_at || r.request_date || null,
      }));
      setData(rows);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to load passkeys', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.filter((r) => {
      const matchesQ = !q || (r.userEmail || '').toLowerCase().includes(q) || (r.examName || '').toLowerCase().includes(q) || (r.centerName || '').toLowerCase().includes(q) || (r.code || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesQ && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  const counts = useMemo(() => ({
    all: data.length,
    requested: data.filter(d => d.status === 'requested').length,
    fulfilled: data.filter(d => d.status === 'fulfilled').length,
    rejected: data.filter(d => d.status === 'rejected').length,
  }), [data]);

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleApprove = async (row) => {
    setProcessing(true);
    try {
      await updatePasskey(row.id, { user: row.user?.id, code: row.code, status: 'fulfilled' });
      setData(prev => prev.map(p => p.id === row.id ? { ...p, status: 'fulfilled' } : p));
      showSnackbar('Passkey approved', 'success');
    } catch (err) {
      showSnackbar('Approve failed', 'error');
    } finally { setProcessing(false); setConfirm({ open: false, type: null, row: null }); }
  };

  const handleReject = async (row) => {
    if (!rejectReason.trim()) { showSnackbar('Provide rejection reason', 'warning'); return; }
    setProcessing(true);
    try {
      await updatePasskey(row.id, { user: row.user?.id, code: row.code, status: 'rejected', reason: rejectReason });
      setData(prev => prev.map(p => p.id === row.id ? { ...p, status: 'rejected', reject_reason: rejectReason } : p));
      showSnackbar('Passkey rejected', 'success');
    } catch (err) {
      showSnackbar('Reject failed', 'error');
    } finally { setProcessing(false); setConfirm({ open: false, type: null, row: null }); setRejectReason(''); }
  };

  const columns = [
    {
      field: 'userEmail',
      headerName: 'User Email',
      flex: 1,
      minWidth: 180
    },
    { field: 'examName', headerName: 'Exam', flex: 1, minWidth: 150 },
    { field: 'centerName', headerName: 'Center', flex: 1, minWidth: 150 },
    {
      field: 'code',
      headerName: 'Passkey',
      minWidth: 160,
      flex: 1,
      renderCell: (p) => p.row.status === 'fulfilled' ? (
        <Box sx={{ fontFamily: 'monospace', fontWeight: 700, px: 1 }}>{p.value}</Box>
      ) : (
        <Typography variant="body2" color="text.secondary">{p.row.status === 'rejected' ? 'Denied' : 'Pending'}</Typography>
      )
    },
    {
      field: 'status', headerName: 'Status', width: 140, renderCell: (p) => (
        <Chip
          label={p.value === 'fulfilled' ? 'Fulfilled' : p.value === 'rejected' ? 'Rejected' : 'Requested'}
          size="small"
          sx={{
            bgcolor: p.value === 'fulfilled' ? alpha(theme.palette.success.main, 0.15) : p.value === 'rejected' ? alpha(theme.palette.error.main, 0.15) : alpha(theme.palette.warning.main, 0.15),
            color: p.value === 'fulfilled' ? theme.palette.success.main : p.value === 'rejected' ? theme.palette.error.main : theme.palette.warning.main,
            fontWeight: 700
          }}
        />
      )
    },
    {
      field: 'requestDate', headerName: 'Requested', width: 160, renderCell: (p) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FaCalendarAlt />
          <Typography variant="body2">{p.value ? new Date(p.value).toLocaleDateString() : '—'}</Typography>
        </Box>
      )
    },
    {
      field: 'actions', headerName: 'Actions', width: 140, sortable: false, renderCell: (p) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="View details"><IconButton size="small" onClick={() => setDetailsModal({ open: true, row: p.row })}><FaEye /></IconButton></Tooltip>
          {p.row.status === 'requested' && (
            <>
              <Tooltip title="Approve"><IconButton color="success" size="small" onClick={() => setConfirm({ open: true, type: 'approve', row: p.row })}><FaCheck /></IconButton></Tooltip>
              <Tooltip title="Reject"><IconButton color="error" size="small" onClick={() => setConfirm({ open: true, type: 'reject', row: p.row })}><FaTimes /></IconButton></Tooltip>
            </>
          )}
        </Stack>
      )
    }
  ];

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Manage Passkeys</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData} disabled={loading}>Refresh</Button>
          </Stack>
        </Box>

        <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by email, exam, center or passkey"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: { startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Stack direction="row" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} spacing={1}>
                  <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setStatusFilter(s => s === 'all' ? 'requested' : 'all')}>Toggle Pending</Button>
                  <Chip label={`Total: ${counts.all}`} size="small" />
                  <Chip label={`Pending: ${counts.requested}`} size="small" color="warning" />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* content */}
        {loading ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading passkey requests...</Typography>
          </Box>
        ) : (filtered.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6">No passkey requests</Typography>
            <Typography color="text.secondary">Try adjusting filters or click refresh</Typography>
            <Button sx={{ mt: 2 }} startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          </Paper>
        ) : (
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <DataGrid
              rows={filtered}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 35]}
              disableRowSelectionOnClick
              getRowId={(r) => r.id}
            />
          </Paper>
        ))}

        {/* Details modal */}
        <Modal open={detailsModal.open} onClose={() => setDetailsModal({ open: false, row: null })} closeAfterTransition slots={{
          backdrop: Backdrop
        }} slotProps={{
          backdrop: { timeout: 500 }
        }}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '95%', sm: 700 }, bgcolor: 'background.paper', boxShadow: 24, p: 3, borderRadius: 2 }}>
            {detailsModal.row && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Request Details</Typography>
                  <IconButton onClick={() => setDetailsModal({ open: false, row: null })}><CloseIcon /></IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">User Email</Typography>
                    <Typography>{detailsModal.row.userEmail}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Exam</Typography>
                    <Typography>{detailsModal.row.examName}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Center</Typography>
                    <Typography>{detailsModal.row.centerName}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Requested</Typography>
                    <Typography>{detailsModal.row.requestDate ? new Date(detailsModal.row.requestDate).toLocaleString() : '—'}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Status</Typography>
                    <Chip label={detailsModal.row.status} sx={{ mt: 1 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Passkey</Typography>
                    {detailsModal.row.status === 'fulfilled' ? (
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{detailsModal.row.code}</Typography>
                        <Button onClick={() => { navigator.clipboard.writeText(detailsModal.row.code || ''); showSnackbar('Copied'); }} startIcon={<FaKey />}>Copy</Button>
                      </Box>
                    ) : (
                      <Typography sx={{ mt: 1, color: 'text.secondary' }}>{detailsModal.row.status === 'rejected' ? 'Denied' : 'Pending approval'}</Typography>
                    )}
                  </Grid>

                  {detailsModal.row.status === 'rejected' && detailsModal.row.reject_reason && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Rejection Reason</Typography>
                      <Typography sx={{ mt: 1, fontStyle: 'italic' }}>&quot;{detailsModal.row.reject_reason}&quot;</Typography>
                    </Grid>
                  )}
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                  {detailsModal.row.status === 'requested' && (
                    <>
                      <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => setConfirm({ open: true, type: 'approve', row: detailsModal.row })}>Approve</Button>
                      <Button variant="contained" color="error" startIcon={<CancelIcon />} onClick={() => setConfirm({ open: true, type: 'reject', row: detailsModal.row })}>Reject</Button>
                    </>
                  )}
                  <Button variant="outlined" onClick={() => setDetailsModal({ open: false, row: null })}>Close</Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>

        {/* Confirm modal */}
        <Modal open={confirm.open} onClose={() => setConfirm({ open: false, type: null, row: null })} closeAfterTransition slots={{
          backdrop: Backdrop
        }} slotProps={{
          backdrop: { timeout: 500 }
        }}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '95%', sm: 480 }, bgcolor: 'background.paper', boxShadow: 24, p: 3, borderRadius: 2 }}>
            {confirm.row && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{confirm.type === 'approve' ? 'Approve Request' : 'Reject Request'}</Typography>
                  <IconButton onClick={() => setConfirm({ open: false, type: null, row: null })}><CloseIcon /></IconButton>
                </Box>

                <Typography variant="body2">User: <strong>{confirm.row.userEmail}</strong></Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>Exam: <strong>{confirm.row.examName}</strong></Typography>

                {confirm.type === 'reject' && (
                  <TextField fullWidth multiline rows={3} placeholder="Reason for rejection" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} sx={{ mb: 2 }} />
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button variant="outlined" onClick={() => setConfirm({ open: false, type: null, row: null })}>Cancel</Button>
                  <Button variant="contained" color={confirm.type === 'approve' ? 'success' : 'error'} onClick={() => confirm.type === 'approve' ? handleApprove(confirm.row) : handleReject(confirm.row)} disabled={processing}>{processing ? <CircularProgress size={20} /> : confirm.type === 'approve' ? 'Approve' : 'Reject'}</Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
}

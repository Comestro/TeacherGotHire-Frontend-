import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Grid,
  TablePagination,
  FormHelperText,
  IconButton,
  useMediaQuery,
  useTheme,
  Paper,
  Avatar,
  Chip,
  Menu,
  MenuItem as MuiMenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Badge,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  MdAdd,
  MdRefresh,
  MdFilterList,
  MdClear,
  MdViewList,
  MdGridView,
  MdExpandLess,
  MdExpandMore,
} from 'react-icons/md';
import {
  FaSearch,
  FaEye,
  FaEllipsisV,
  FaCheck,
  FaTimes,
  FaTrash,
  FaBookOpen,
  FaLayerGroup,
  FaSchool,
  FaClock,
  FaListUl,
  FaFileAlt,
  FaLaptop,
} from 'react-icons/fa';
import Layout from '../Admin/Layout';
import Loader from '../../components/Loader';
import { Link } from 'react-router-dom';
// services (these are kept as imports; your existing service functions are reused)
import { getExam, deleteExam, createExam, updateExam } from '../../services/adminManageExam';
import { getSubjects } from '../../services/adminSubujectApi';
import { getClassCategory } from '../../services/adminClassCategoryApi';
import { getLevel } from '../../services/adminManageLevel';

/*
  Redesigned ExamManagement component with Approve/Reject actions added.
  - Added handleAccept and handleReject functions
  - Exposed Approve (check) and Reject (times) buttons in Card and Table views
  - Confirmation dialog is bypassed for quick approve/reject; you can add a Dialog if you prefer extra confirmation
*/

// ---------- Styled components (kept minimal) ----------
const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
}));

const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 10,
  padding: theme.spacing(3),
  width: 'min(720px, 95%)',
  maxHeight: '90vh',
  overflow: 'auto',
}));

const FilterPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 12,
  backgroundColor: '#fff',
  border: '1px solid #e6e6e6',
}));

const ExamCard = styled(Card)(({ theme, status }) => ({
  borderRadius: 12,
  border: status ? '1px solid rgba(76,175,80,0.18)' : '1px solid rgba(255,152,0,0.12)',
  background: status ? 'rgba(76,175,80,0.02)' : 'transparent',
  height: '100%',
}));

// ---------- Helper small components ----------
const StatusChip = ({ approved }) => (
  <Chip
    label={approved ? 'Approved' : 'Pending'}
    size="small"
    sx={{
      bgcolor: approved ? '#e8f5e9' : '#fff3e0',
      color: approved ? '#2e7d32' : '#ef6c00',
      fontWeight: 600,
    }}
  />
);

// ---------- Main component ----------
export default function ExamManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [classCategories, setClassCategories] = useState([]);

  // UI state
  const [viewMode, setViewMode] = useState('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // filter values are IDs where applicable
  const [filterClassCategoryId, setFilterClassCategoryId] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterLevelId, setFilterLevelId] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAddedBy, setFilterAddedBy] = useState('');

  // form/modal state
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    class_category: '',
    level: '',
    total_marks: '',
    duration: '',
    type: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // menu & snackbar
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [menuExam, setMenuExam] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // small derived set of unique users (by name)
  const uniqueUsers = useMemo(() => {
    const setNames = new Set();
    exams.forEach((ex) => {
      const assigned = ex.assigneduser?.user;
      const name = assigned ? `${assigned.Fname || ''} ${assigned.Lname || ''}`.trim() : 'Admin';
      if (name) setNames.add(name);
    });
    return Array.from(setNames).sort();
  }, [exams]);

  // -------------- data fetching --------------
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const [examResp, subjectResp, classResp, levelResp] = await Promise.all([
        getExam(),
        getSubjects(),
        getClassCategory(),
        getLevel(),
      ]);

      // sort newest first if responses are arrays
      setExams(Array.isArray(examResp) ? examResp.sort((a, b) => b.id - a.id) : []);
      setSubjects(Array.isArray(subjectResp) ? subjectResp : []);
      setClassCategories(Array.isArray(classResp) ? classResp : []);
      setLevels(Array.isArray(levelResp) ? levelResp : []);
      
      if (isRefresh) {
        showSnackbar('Data refreshed successfully', 'success');
      }
    } catch (err) {
      showSnackbar(err?.response?.data?.error || err?.response?.data?.message || err.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // -------------- helpers --------------
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getAssignedUserName = (exam) => {
    const usr = exam.assigneduser?.user;
    if (!usr) return 'Admin';
    return `${usr.Fname || ''} ${usr.Lname || ''}`.trim() || 'Admin';
  };

  // -------------- filtering (memoized) --------------
  const filteredExams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return exams.filter((exam) => {
      // search by name or id
      const matchesQuery = !q || exam.name.toLowerCase().includes(q) || String(exam.id).includes(q);

      const matchesClass = !filterClassCategoryId || exam.class_category?.id === filterClassCategoryId;
      const matchesSub = !filterSubjectId || exam.subject?.id === filterSubjectId;
      const matchesLevel = !filterLevelId || exam.level?.id === filterLevelId;
      const matchesType = !filterType || exam.type === filterType;
      const matchesStatus = filterStatus === '' ? true : exam.status === (filterStatus === 'true');
      const matchesAdded = !filterAddedBy || getAssignedUserName(exam) === filterAddedBy;

      return (
        matchesQuery &&
        matchesClass &&
        matchesSub &&
        matchesLevel &&
        matchesType &&
        matchesStatus &&
        matchesAdded
      );
    });
  }, [exams, searchQuery, filterClassCategoryId, filterSubjectId, filterLevelId, filterType, filterStatus, filterAddedBy]);

  // -------------- CRUD actions (create/update/delete) --------------
  const handleOpenAdd = () => {
    setSelectedExam(null);
    setFormData({ name: '', subject: '', class_category: '', level: '', total_marks: '', duration: '', type: '' });
    setFormErrors({});
    setOpenAddModal(true);
  };

  const handleEdit = (exam) => {
    setSelectedExam(exam);
    setFormData({
      name: exam.name || '',
      subject: exam.subject?.id || '',
      class_category: exam.class_category?.id || '',
      level: exam.level?.id || '',
      total_marks: exam.total_marks || '',
      duration: exam.duration || '',
      type: exam.type || '',
    });
    setFormErrors({});
    setOpenAddModal(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.class_category) errs.class_category = 'Required';
    if (!formData.subject) errs.subject = 'Required';
    if (!formData.level) errs.level = 'Required';
    if (!formData.total_marks || Number(formData.total_marks) <= 0) errs.total_marks = 'Must be > 0';
    if (!formData.duration || Number(formData.duration) <= 0) errs.duration = 'Must be > 0';

    const selectedLevel = levels.find((l) => l.id === Number(formData.level));
    if (selectedLevel && selectedLevel.level_code >= 2.0 && !formData.type) errs.type = 'Required for this level';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    const snackbarMsg = selectedExam ? 'Updating exam...' : 'Creating exam...';
    showSnackbar(snackbarMsg, 'info');
    
    try {
      const payload = {
        name: formData.name,
        subject: formData.subject,
        class_category: formData.class_category,
        level: formData.level,
        total_marks: formData.total_marks,
        duration: formData.duration,
        type: undefined,
      };
      const selectedLvl = levels.find((l) => l.id === Number(formData.level));
      if (selectedLvl && selectedLvl.level_code >= 2.0) payload.type = formData.type;

      if (selectedExam) {
        await updateExam(selectedExam.id, payload);
        showSnackbar('Exam updated successfully', 'success');
      } else {
        await createExam(payload);
        showSnackbar('Exam created successfully', 'success');
      }
      setOpenAddModal(false);
      await loadAll();
    } catch (err) {
      showSnackbar(err?.response?.data?.error || err?.response?.data?.message || err.message || 'Save failed', 'error');
    }
  };

  const handleDelete = async (examToDelete) => {
    if (!window.confirm('Delete this exam? This cannot be undone.')) return;
    
    showSnackbar('Deleting exam...', 'info');
    
    try {
      await deleteExam(examToDelete.id);
      // Optimistically update UI
      setExams(exams.filter(e => e.id !== examToDelete.id));
      showSnackbar('Exam deleted successfully', 'success');
    } catch (err) {
      showSnackbar(err?.response?.data?.error || err?.response?.data?.message || err.message || 'Delete failed', 'error');
      // Reload on error to sync state
      await loadAll();
    }
  };

  // ---------- New: Approve / Reject handlers ----------
  const handleAccept = async (examToAccept) => {
    if (!examToAccept) return;
    
    showSnackbar('Approving exam...', 'info');
    
    try {
      await updateExam(examToAccept.id, { status: true });
      // Optimistically update UI
      setExams(exams.map(e => e.id === examToAccept.id ? { ...e, status: true } : e));
      showSnackbar('Exam approved successfully', 'success');
    } catch (err) {
      showSnackbar(err?.response?.data?.error || err?.response?.data?.message || err.message || 'Approve failed', 'error');
      // Reload on error to sync state
      await loadAll();
    }
  };

  const handleReject = async (examToReject) => {
    if (!examToReject) return;
    
    showSnackbar('Rejecting exam...', 'info');
    
    try {
      await updateExam(examToReject.id, { status: false });
      // Optimistically update UI
      setExams(exams.map(e => e.id === examToReject.id ? { ...e, status: false } : e));
      showSnackbar('Exam rejected successfully', 'warning');
    } catch (err) {
      showSnackbar(err?.response?.data?.error || err?.response?.data?.message || err.message || 'Reject failed', 'error');
      // Reload on error to sync state
      await loadAll();
    }
  };

  // -------------- pagination handlers --------------
  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(0);
  };

  // small helper to reset filters
  const clearAllFilters = () => {
    setFilterClassCategoryId('');
    setFilterSubjectId('');
    setFilterLevelId('');
    setFilterType('');
    setFilterStatus('');
    setFilterAddedBy('');
    setSearchQuery('');
  };

  if (loading && exams.length === 0) return <Loader />;

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#F9FAFC', minHeight: '100vh', position: 'relative' }}>
        {/* Loading overlay during refresh */}
        {refreshing && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Loader />
          </Box>
        )}
        {/* header */}
        <Box sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: "teal" }}>
              <FaFileAlt color='white'/>
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>Manage Exams</Typography>
              <Typography variant="body2" color="text.primary">Create, edit and manage your exam sets</Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.5, borderRadius: 1, border: '1px solid #e0e0e0' }}>
              <Tooltip title="Card view"><IconButton onClick={() => setViewMode('card')} color={viewMode === 'card' ? 'primary' : 'default'}><MdGridView /></IconButton></Tooltip>
              <Tooltip title="Table view"><IconButton onClick={() => setViewMode('table')} color={viewMode === 'table' ? 'primary' : 'default'}><MdViewList /></IconButton></Tooltip>
            </Box>

            <Button 
              variant="outlined" 
              startIcon={<MdRefresh />} 
              onClick={() => loadAll(true)}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="contained" startIcon={<MdAdd />} onClick={handleOpenAdd}>Add New</Button>
          </Stack>
        </Box>

        {/* search + filters */}
        <Paper 
          elevation={0}
          sx={{ 
            mb: 3, 
            p: 2.5, 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: '#fff'
          }}
        >
          <Stack spacing={2.5}>
            {/* Search and Action Buttons Row */}
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder="Search by exam name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'text.secondary' }}>
                        <FaSearch />
                      </Box>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'teal',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'teal',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<MdClear />} 
                    onClick={clearAllFilters}
                    sx={{
                      borderColor: 'divider',
                      color: 'text.secondary',
                      '&:hover': {
                        borderColor: 'text.secondary',
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    Clear
                  </Button>
                  <Button 
                    fullWidth
                    variant="contained" 
                    onClick={() => setShowFilters((s) => !s)} 
                    startIcon={<MdFilterList />}
                    endIcon={showFilters ? <MdExpandLess /> : <MdExpandMore />}
                    sx={{
                      backgroundColor: 'teal',
                      '&:hover': {
                        backgroundColor: '#0d8478',
                      },
                    }}
                  >
                    Filters
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {/* Filter Options - Collapsible */}
            {showFilters && (
              <Box
                sx={{
                  pt: 1.5,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Class</InputLabel>
                      <Select 
                        value={filterClassCategoryId} 
                        label="Class" 
                        onChange={(e) => setFilterClassCategoryId(e.target.value)}
                        sx={{
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'teal',
                          },
                        }}
                      >
                        <MenuItem value="">All Classes</MenuItem>
                        {classCategories.map((c) => (
                          <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Subject</InputLabel>
                      <Select 
                        value={filterSubjectId} 
                        label="Subject" 
                        onChange={(e) => setFilterSubjectId(e.target.value)}
                        sx={{
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'teal',
                          },
                        }}
                      >
                        <MenuItem value="">All Subjects</MenuItem>
                        {subjects
                          .filter((s) => !filterClassCategoryId || s.class_category === filterClassCategoryId)
                          .map((s) => (
                            <MenuItem key={s.id} value={s.id}>{s.subject_name}</MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Level</InputLabel>
                      <Select 
                        value={filterLevelId} 
                        label="Level" 
                        onChange={(e) => setFilterLevelId(e.target.value)}
                        sx={{
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'teal',
                          },
                        }}
                      >
                        <MenuItem value="">All Levels</MenuItem>
                        {levels.map((l) => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select 
                        value={filterType} 
                        label="Type" 
                        onChange={(e) => setFilterType(e.target.value)}
                        sx={{
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'teal',
                          },
                        }}
                      >
                        <MenuItem value="">All Types</MenuItem>
                        <MenuItem value="online">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FaLaptop size={14} /> Online
                          </Box>
                        </MenuItem>
                        <MenuItem value="offline">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FaSchool size={14} /> Offline
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select 
                        value={filterStatus} 
                        label="Status" 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        sx={{
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'teal',
                          },
                        }}
                      >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="true">
                          <Chip label="Approved" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                        </MenuItem>
                        <MenuItem value="false">
                          <Chip label="Pending" size="small" sx={{ bgcolor: '#fff3e0', color: '#ef6c00' }} />
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Added By</InputLabel>
                      <Select 
                        value={filterAddedBy} 
                        label="Added By" 
                        onChange={(e) => setFilterAddedBy(e.target.value)}
                        sx={{
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'teal',
                          },
                        }}
                      >
                        <MenuItem value="">All Users</MenuItem>
                        {uniqueUsers.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* list / table */}
        {filteredExams.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6">No exams found</Typography>
            <Typography variant="body2" color="text.secondary">Try adjusting filters or add a new exam.</Typography>
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2">Showing {filteredExams.length} {filteredExams.length === 1 ? 'exam' : 'exams'}</Typography>
            </Box>

            {viewMode === 'card' ? (
              <Grid container spacing={2}>
                {filteredExams.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((exam) => (
                  <Grid item xs={12} sm={6} md={6} key={exam.id}>
                    <ExamCard status={exam.status}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>{exam.name}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip label={exam.subject?.subject_name || '-'} size="small" />
                              <Chip label={exam.level?.name || '-'} size="small" />
                              <Chip label={exam.class_category?.name || '-'} size="small" />
                            </Box>
                          </Box>

                          <Box sx={{ textAlign: 'right' }}>
                            <StatusChip approved={exam.status} />
                            <Box sx={{ mt: 1 }}>
                              {/* APPROVE / REJECT buttons added here */}
                              <Tooltip title={exam.status ? 'Already approved' : 'Approve exam'}>
                                <span>
                                  <IconButton
                                    onClick={() => handleAccept(exam)}
                                    disabled={exam.status}
                                    size="small"
                                    sx={{ mr: 0.5 }}
                                  >
                                    <FaCheck />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title={!exam.status ? 'Already pending' : 'Reject exam'}>
                                <span>
                                  <IconButton
                                    onClick={() => handleReject(exam)}
                                    disabled={!exam.status}
                                    size="small"
                                    sx={{ mr: 0.5 }}
                                  >
                                    <FaTimes />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="View details"><IconButton component={Link} to={`/admin/exam/${exam.id}`}><FaEye /></IconButton></Tooltip>
                              <Tooltip title="More"><IconButton onClick={(e) => { setActionMenuAnchor(e.currentTarget); setMenuExam(exam); }}><FaEllipsisV /></IconButton></Tooltip>
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">{exam.questions?.length || 0} questions</Typography>
                          <Typography variant="caption">{exam.duration} min</Typography>
                        </Box>
                      </CardContent>
                    </ExamCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Level</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredExams.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell>{exam.id}</TableCell>
                        <TableCell>{exam.name}</TableCell>
                        <TableCell>{exam.subject?.subject_name}</TableCell>
                        <TableCell>{exam.level?.name}</TableCell>
                        <TableCell>{exam.class_category?.name}</TableCell>
                        <TableCell>{exam.duration} min</TableCell>
                        <TableCell><StatusChip approved={exam.status} /></TableCell>
                        <TableCell>
                          {/* APPROVE / REJECT buttons added to table actions */}
                          <Tooltip title={exam.status ? 'Already approved' : 'Approve exam'}>
                            <span>
                              <IconButton onClick={() => handleAccept(exam)} disabled={exam.status} size="small" sx={{ mr: 0.5 }}>
                                <FaCheck />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={!exam.status ? 'Already pending' : 'Reject exam'}>
                            <span>
                              <IconButton onClick={() => handleReject(exam)} disabled={!exam.status} size="small" sx={{ mr: 0.5 }}>
                                <FaTimes />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="View"><IconButton component={Link} to={`/admin/exam/${exam.id}`}><FaEye /></IconButton></Tooltip>
                          <Tooltip title="Edit"><IconButton onClick={() => handleEdit(exam)}><MdClear /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton onClick={() => handleDelete(exam)}><FaTrash /></IconButton></Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box sx={{ mt: 2 }}>
              <TablePagination
                component="div"
                count={filteredExams.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={isMobile ? [5, 10] : [10, 20, 40]}
              />
            </Box>
          </>
        )}

        {/* action menu */}
        <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={() => setActionMenuAnchor(null)}>
          <MuiMenuItem onClick={() => { handleEdit(menuExam); setActionMenuAnchor(null); }}>Edit</MuiMenuItem>
          <MuiMenuItem onClick={async () => { await handleDelete(menuExam); setActionMenuAnchor(null); }}>Delete</MuiMenuItem>
        </Menu>

        {/* add/edit modal */}
        <StyledModal open={openAddModal} onClose={() => setOpenAddModal(false)}>
          <ModalContent>
            <Typography variant="h6" sx={{ mb: 2 }}>{selectedExam ? 'Edit Exam' : 'Add Exam'}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.class_category}>
                  <InputLabel>Class Category *</InputLabel>
                  <Select name="class_category" value={formData.class_category} onChange={(e) => setFormData({ ...formData, class_category: e.target.value })}>
                    {classCategories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                  {formErrors.class_category && <FormHelperText>{formErrors.class_category}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.subject}>
                  <InputLabel>Subject *</InputLabel>
                  <Select name="subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}>
                    {subjects.filter(s => !formData.class_category || s.class_category === formData.class_category).map((s) => <MenuItem key={s.id} value={s.id}>{s.subject_name}</MenuItem>)}
                  </Select>
                  {formErrors.subject && <FormHelperText>{formErrors.subject}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.level}>
                  <InputLabel>Level *</InputLabel>
                  <Select name="level" value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })}>
                    {levels.map((l) => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
                  </Select>
                  {formErrors.level && <FormHelperText>{formErrors.level}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField label="Total Marks" type="number" fullWidth value={formData.total_marks} onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })} error={!!formErrors.total_marks} helperText={formErrors.total_marks} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField label="Duration (minutes)" type="number" fullWidth value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} error={!!formErrors.duration} helperText={formErrors.duration} />
              </Grid>

              {Number(formData.level) && levels.find(l => l.id === Number(formData.level))?.level_code >= 2.0 && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!formErrors.type}>
                    <InputLabel>Type *</InputLabel>
                    <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                      <MenuItem value="online">Online</MenuItem>
                      <MenuItem value="offline">Offline</MenuItem>
                    </Select>
                    {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
                  </FormControl>
                </Grid>
              )}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button variant="outlined" onClick={() => setOpenAddModal(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSave}>{loading ? 'Saving...' : 'Save'}</Button>
            </Box>
          </ModalContent>
        </StyledModal>

        {/* snackbar */}
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
}

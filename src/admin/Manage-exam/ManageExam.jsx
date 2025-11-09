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
import apiService from '../../services/apiService';

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

  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [classCategories, setClassCategories] = useState([]);

  // UI state
  const [viewMode, setViewMode] = useState('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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
      const name = ex.assigneduser_name || 'Admin';
      if (name) setNames.add(name);
    });
    return Array.from(setNames).sort();
  }, [exams]);

  // -------------- data fetching --------------
  useEffect(() => {
    loadAll(page, rowsPerPage);
  }, [page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, filterClassCategoryId, filterSubjectId, filterLevelId, filterType, filterStatus, filterAddedBy]);

  const loadAll = async (currentPage = 0, currentRowsPerPage = 10) => {
    setLoading(true);
    try {
      const examResp = await apiService.getAll(`api/examsetter/?page=${currentPage + 1}&page_size=${currentRowsPerPage}`);
      const [subjectResp, classResp, levelResp] = await Promise.all([
        getSubjects(),
        getClassCategory(),
        getLevel(), 
      ]);

      setExams(Array.isArray(examResp.results) ? examResp.results : []);
      setTotalCount(examResp.count || 0);
      setSubjects(Array.isArray(subjectResp) ? subjectResp : []);
      setClassCategories(Array.isArray(classResp) ? classResp : []);
      setLevels(Array.isArray(levelResp) ? levelResp : []);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || err.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // -------------- helpers --------------
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getAssignedUserName = (exam) => {
    return exam.assigneduser_name || 'Admin';
  };

  // -------------- filtering (memoized) --------------
  const filteredExams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return exams.filter((exam) => {
      // search by name or id
      const matchesQuery = !q || exam.name.toLowerCase().includes(q) || String(exam.id).includes(q);

      const matchesClass = !filterClassCategoryId || exam.class_category === classCategories.find(c=>c.id===filterClassCategoryId)?.name;
      const matchesSub = !filterSubjectId || exam.subject === subjects.find(s=>s.id===filterSubjectId)?.subject_name;
      const matchesLevel = !filterLevelId || exam.level === levels.find(l=>l.id===filterLevelId)?.name;
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
  }, [exams, searchQuery, filterClassCategoryId, filterSubjectId, filterLevelId, filterType, filterStatus, filterAddedBy, classCategories, subjects, levels]);

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
      subject: subjects.find(s=>s.subject_name === exam.subject)?.id || '',
      class_category: classCategories.find(c=>c.name === exam.class_category)?.id || '',
      level: levels.find(l=>l.name === exam.level)?.id || '',
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
    setLoading(true);
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
        showSnackbar('Exam updated');
      } else {
        await createExam(payload);
        showSnackbar('Exam created');
      }
      await loadAll(page, rowsPerPage);
      setOpenAddModal(false);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || err.message || 'Save failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examToDelete) => {
    if (!window.confirm('Delete this exam? This cannot be undone.')) return;
    setLoading(true);
    try {
      await deleteExam(examToDelete.id);
      showSnackbar('Exam deleted');
      await loadAll(page, rowsPerPage);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || err.message || 'Delete failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ---------- New: Approve / Reject handlers ----------
  const handleAccept = async (examToAccept) => {
    if (!examToAccept) return;
    setLoading(true);
    try {
      await updateExam(examToAccept.id, { status: true });
      showSnackbar('Exam approved', 'success');
      await loadAll(page, rowsPerPage);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || err.message || 'Approve failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (examToReject) => {
    if (!examToReject) return;
    setLoading(true);
    try {
      await updateExam(examToReject.id, { status: false });
      showSnackbar('Exam rejected', 'warning');
      await loadAll(page, rowsPerPage);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || err.message || 'Reject failed', 'error');
    } finally {
      setLoading(false);
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

  if (loading) return <Loader />;

  return (
    <Layout>
      <Box>
        {/* header */}
        <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%', justifyContent: { xs: 'flex-start', sm: 'flex-start' } }}>
            <Avatar sx={{ bgcolor: "teal"}}>
              <FaFileAlt />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>Manage Exams</Typography>
              <Typography variant="body2" color="text.secondary">Create, edit and manage your exam sets</Typography>
            </Box>
          </Box>
          <Stack direction={"row"} spacing={1} sx={{ mt: { xs: 2, sm: 0 }, alignItems: 'center' , justifyContent:"space-between",width:"100%"}}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.5, borderRadius: 1, border: '1px solid #e0e0e0' }}>
              <Tooltip title="Card view"><IconButton onClick={() => setViewMode('card')} color={viewMode === 'card' ? 'primary' : 'default'}><MdGridView /></IconButton></Tooltip>
              <Tooltip title="Table view"><IconButton onClick={() => setViewMode('table')} color={viewMode === 'table' ? 'primary' : 'default'}><MdViewList /></IconButton></Tooltip>
            </Box>

              <Button variant="contained" color='primary' startIcon={<MdAdd />} onClick={handleOpenAdd} fullWidth={isMobile}>Add New</Button>
          </Stack>
        </Paper>

        {/* search + filters */}
        <FilterPaper sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search by exam name or id"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                slotProps={{
                  input: { startAdornment: <FaSearch style={{ marginRight: 8 }} /> }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button fullWidth variant="outlined" startIcon={<MdClear />} onClick={clearAllFilters}>
                  Clear Filters
                </Button>
                <Button variant="contained" onClick={() => setShowFilters((s) => !s)} startIcon={showFilters ? <MdExpandLess /> : <MdExpandMore />}>
                  {isMobile ? 'Filters' : 'Toggle Filters'}
                </Button>
              </Box>
            </Grid>

            {showFilters && (
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Class</InputLabel>
                      <Select value={filterClassCategoryId} label="Class" onChange={(e) => setFilterClassCategoryId(e.target.value)}>
                        <MenuItem value="">All</MenuItem>
                        {classCategories.map((c) => (
                          <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Subject</InputLabel>
                      <Select value={filterSubjectId} label="Subject" onChange={(e) => setFilterSubjectId(e.target.value)}>
                        <MenuItem value="">All</MenuItem>
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
                      <Select value={filterLevelId} label="Level" onChange={(e) => setFilterLevelId(e.target.value)}>
                        <MenuItem value="">All</MenuItem>
                        {levels.map((l) => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="online">Online</MenuItem>
                        <MenuItem value="offline">Offline</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="true">Approved</MenuItem>
                        <MenuItem value="false">Pending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Added By</InputLabel>
                      <Select value={filterAddedBy} label="Added By" onChange={(e) => setFilterAddedBy(e.target.value)}>
                        <MenuItem value="">All</MenuItem>
                        {uniqueUsers.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </FilterPaper>

        {/* list / table */}
        {filteredExams.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6">No exams found</Typography>
            <Typography variant="body2" color="text.secondary">Try adjusting filters or add a new exam.</Typography>
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2">Showing {filteredExams.length} of {totalCount} {totalCount === 1 ? 'exam' : 'exams'}</Typography>
            </Box>

            {viewMode === 'card' ? (
              <Grid container spacing={2}>
                {filteredExams.map((exam) => (
                  <Grid item xs={12} sm={6} md={6} key={exam.id}>
                    <ExamCard status={exam.status}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>{exam.name}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip label={exam.subject || '-'} size="small" />
                              <Chip label={exam.level || '-'} size="small" />
                              <Chip label={exam.class_category || '-'} size="small" />
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
                          <Typography variant="body2">{exam.total_questions || 0} questions</Typography>
                          <Typography variant="caption">{exam.duration} min</Typography>
                        </Box>
                      </CardContent>
                    </ExamCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 2, '& .MuiTableCell-root': { whiteSpace: 'normal', wordBreak: 'break-word', verticalAlign: 'top', paddingTop: 12, paddingBottom: 12 }, '& .MuiTableRow-root': { '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } } }}>
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
                    {filteredExams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell>{exam.id}</TableCell>
                        <TableCell>{exam.name}</TableCell>
                        <TableCell>{exam.subject}</TableCell>
                        <TableCell>{exam.level}</TableCell>
                        <TableCell>{exam.class_category}</TableCell>
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
                count={totalCount}
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
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  IconButton,
  FormControl,
  Box,
  Snackbar,
  Alert,
  Switch,
  Paper,
  Grid,
  CircularProgress,
  Chip,
  Tooltip,
  Avatar,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Divider,
  Badge,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
} from "@mui/material";
// Import DataGrid components
import { 
  DataGrid, 
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector
} from "@mui/x-data-grid";
import {
  MdVisibility as ViewIcon,
  MdGetApp as ExportIcon,
  MdSearch as SearchIcon,
  MdRefresh as RefreshIcon,
  MdFilterList as FilterIcon,
  MdCheck as CheckIcon,
  MdClear as ClearIcon,
  MdHelpOutline as HelpIcon,
  MdPersonAdd as PersonAddIcon,
  MdEdit as EditIcon,
  MdDelete as DeleteIcon,
  MdPerson as PersonIcon,
  MdLocationOn as LocationIcon,
  MdSchool as SchoolIcon,
  MdEmail as EmailIcon,
  MdGridView as GridViewIcon,
  MdViewList as ListViewIcon,
} from "react-icons/md";
import { FaUserGraduate, FaMapMarkerAlt, FaEnvelope, FaFilter } from "react-icons/fa";
import { styled } from "@mui/material/styles";
import Layout from "../Admin/Layout";
import { getTeacher, updateTeacher } from "../../services/adminTeacherApi";
import { Link } from "react-router-dom";
import { getQualification } from "../../services/adminManageQualificationApi";
import { getSubjects } from "../../services/adminSubujectApi";

// Styled components for enhanced UI
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 3,
    top: 3,
    padding: '0 4px',
  },
}));

const TeacherAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: '#0d9488',
  width: 40,
  height: 40,
  fontWeight: 600,
  boxShadow: `0 2px 8px ${alpha('#0d9488', 0.3)}`,
}));

const StatusChip = styled(Chip)(({ theme, active }) => ({
  fontWeight: 500,
  backgroundColor: active === "true" || active === true ? 
    alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
  color: active === "true" || active === true ? '#059669' : '#dc2626',
  border: `1px solid ${active === "true" || active === true ? '#10b981' : '#ef4444'}`,
  '&:hover': {
    backgroundColor: active === "true" || active === true ? 
      alpha('#10b981', 0.15) : alpha('#ef4444', 0.15),
  }
}));

const FilterPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha('#0d9488', 0.02)} 0%, ${alpha('#06b6d4', 0.02)} 100%)`,
  border: `1px solid ${alpha('#0d9488', 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 8px 32px ${alpha('#0d9488', 0.1)}`,
    border: `1px solid ${alpha('#0d9488', 0.2)}`,
  }
}));

const TeacherCard = styled(Card)(({ theme, active }) => ({
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(active ? '#10b981' : '#ef4444', 0.2)}`,
  background: `linear-gradient(135deg, ${alpha(active ? '#10b981' : '#ef4444', 0.02)} 0%, ${alpha('#ffffff', 0.8)} 100%)`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 40px ${alpha(active ? '#10b981' : '#ef4444', 0.15)}`,
  }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    background: `linear-gradient(135deg, ${alpha('#0d9488', 0.05)} 0%, ${alpha('#06b6d4', 0.05)} 100%)`,
    backdropFilter: 'blur(10px)',
  }
}));

const GradientHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)`,
  color: 'white',
  padding: theme.spacing(2),
  borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
  margin: `-${theme.spacing(3)} -${theme.spacing(3)} ${theme.spacing(3)} -${theme.spacing(3)}`,
}));

const ManageTeacher = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQualification, setSelectedQualification] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [confirmStatusChange, setConfirmStatusChange] = useState({
    open: false,
    id: null,
    currentStatus: null,
    bulk: false
  });
  const [expandedFilters, setExpandedFilters] = useState(!isMobile);
  const [processingStatus, setProcessingStatus] = useState(false);

  // Dynamic data state
  const [qualifications, setQualifications] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [locations, setLocations] = useState([]);

  // Fetch teacher data
  const fetchTeacherData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await getTeacher();
      if (Array.isArray(response)) {
        // Ensure we have complete data and normalize it
        const normalizedTeachers = response.map(teacher => ({
          ...teacher,
          teacherqualifications: teacher.teacherqualifications || [],
          teachersubjects: teacher.teachersubjects || [],
          teachersaddress: teacher.teachersaddress || [],
        }));

        setTeachers(normalizedTeachers);

        // Extract unique locations from teacher data
        const uniqueLocations = new Set();
        normalizedTeachers.forEach(teacher => {
          if (Array.isArray(teacher.teachersaddress)) {
            teacher.teachersaddress.forEach(address => {
              if (address && address.state) {
                uniqueLocations.add(address.state);
              }
            });
          }
        });
        setLocations(Array.from(uniqueLocations));

        if (showRefresh) {
          setNotification({
            open: true,
            message: "Teacher data refreshed successfully",
            type: "success",
          });
        }
      } else {
        
        setError("Failed to load teacher data. Please try again later.");
      }
    } catch (error) {
      
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();

    // Fetch qualifications and subjects
    const fetchQualifications = async () => {
      try {
        const response = await getQualification();
        if (Array.isArray(response)) {
          setQualifications(response);
        }
      } catch (error) {
        
      }
    };

    const fetchSubjects = async () => {
      try {
        const response = await getSubjects();
        if (Array.isArray(response)) {
          setSubjects(response);
        }
      } catch (error) {
        
      }
    };

    fetchQualifications();
    fetchSubjects();
  }, []);

  // Reset page when filtering changes
  useEffect(() => {
    setPage(0);
  }, [searchQuery, selectedQualification, selectedSubject, selectedLocation, selectedStatus]);

  // Adjust rows per page based on screen size
  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : 10);

    // If on mobile, collapse filters by default
    if (isMobile) {
      setExpandedFilters(false);
    }
  }, [isMobile]);

  const confirmToggleStatus = (teacherId, currentStatus) => {
    setConfirmStatusChange({
      open: true,
      id: teacherId,
      currentStatus: currentStatus,
      bulk: false
    });
  };

  const handleToggleStatus = async (teacherId, currentStatus) => {
    try {
      setProcessingStatus(true);

      // Find the teacher object to get their email
      const teacher = teachers.find(t => t.id === teacherId);

      if (!teacher) {
        setNotification({
          open: true,
          message: "Teacher not found",
          type: "error",
        });
        return;
      }

      // Prepare update data with required fields
      const updateData = {
        email: teacher.email,
        is_active: !currentStatus // Toggle the active status
      };

      // Call API to update teacher status
      const response = await updateTeacher(teacherId, updateData);

      if (response) {
        // Update the local state after successful API call
        setTeachers(
          teachers.map((t) =>
            t.id === teacherId ? { ...t, is_active: !currentStatus } : t
          )
        );

        setNotification({
          open: true,
          message: `Teacher ${!currentStatus ? "activated" : "deactivated"} successfully`,
          type: "success",
        });
      }
    } catch (error) {
      
      setNotification({
        open: true,
        message: `Failed to update status: ${error.message || "Unknown error"}`,
        type: "error",
      });
    } finally {
      setProcessingStatus(false);
      setConfirmStatusChange({ open: false, id: null, currentStatus: null, bulk: false });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    fetchTeacherData(true);
  };

  const handleExportData = () => {
    if (filteredTeachers.length === 0) {
      setNotification({
        open: true,
        message: "No data to export",
        type: "warning",
      });
      return;
    }

    const csvContent = [
      [
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Status",
        "Verified",
        "Subjects",
        "Address",
        "Qualifications",
        "Total Marks",
      ],
      ...filteredTeachers.map((teacher) => [
        teacher.id || '',
        teacher.Fname || '',
        teacher.Lname || '',
        teacher.email || '',
        teacher.is_active ? 'Active' : 'Inactive',
        teacher.is_verified ? 'Verified' : 'Not Verified',
        (teacher.teachersubjects || []).join(", "),
        (teacher.teachersaddress || [])
          .map((address) => address?.state || '')
          .filter(Boolean)
          .join(", "),
        (teacher.teacherqualifications || [])
          .map((q) => q?.qualification?.name || '')
          .filter(Boolean)
          .join(", "),
        teacher.total_marks || 0,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `teachers_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification({
      open: true,
      message: `${filteredTeachers.length} teachers exported successfully`,
      type: "success",
    });
  };

  const filteredTeachers = teachers.filter((teacher) => {
    // Basic data checks to prevent errors
    const teacherQualifications = teacher.teacherqualifications || [];
    const teacherSubjects = teacher.teachersubjects || [];
    const teacherAddresses = teacher.teachersaddress || [];

    // Map status to is_active
    let activeStatusMatch = true;
    if (selectedStatus) {
      if (selectedStatus.toLowerCase() === "approved") {
        activeStatusMatch = teacher.is_active === true;
      } else if (selectedStatus.toLowerCase() === "rejected") {
        activeStatusMatch = teacher.is_active === false;
      }
    }

    return (
      // Search query filtering
      (!searchQuery ||
        (teacher.Fname?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (teacher.Lname?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (teacher.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (teacher.id?.toString() || '').includes(searchQuery)) &&

      // Qualification filtering
      (!selectedQualification ||
        teacherQualifications.some(q =>
          (q?.qualification?.name?.toLowerCase() || '') === selectedQualification.toLowerCase()
        )) &&

      // Subject filtering - check if teacher has the selected subject
      (!selectedSubject ||
        teacherSubjects.some(subject =>
          (subject?.toLowerCase() || '') === selectedSubject.toLowerCase()
        )) &&

      // Location filtering
      (!selectedLocation ||
        teacherAddresses.some(address =>
          (address?.state?.toLowerCase() || '') === selectedLocation.toLowerCase()
        )) &&

      // Status filtering
      activeStatusMatch
    );
  });

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredTeachers.map((teacher) => teacher.id);
      setSelectedTeachers(newSelected);
      return;
    }
    setSelectedTeachers([]);
  };

  // Function to render teacher cards for mobile view
  const renderTeacherCard = (teacher) => {
    const initials = `${teacher.Fname?.charAt(0) || ''}${teacher.Lname?.charAt(0) || ''}`;

    return (
      <TeacherCard
        key={teacher.id}
        active={teacher.is_active}
        sx={{
          mb: 2,
          borderLeft: `5px solid ${teacher.is_active ? '#10b981' : '#ef4444'}`,
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Box display="flex" alignItems="center">
              <Checkbox
                checked={selectedTeachers.includes(teacher.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTeachers([...selectedTeachers, teacher.id]);
                  } else {
                    setSelectedTeachers(selectedTeachers.filter((id) => id !== teacher.id));
                  }
                }}
                sx={{ p: 0, mr: 1, color: '#0d9488' }}
              />
              <TeacherAvatar>{initials}</TeacherAvatar>
              <Box ml={1}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                  {`${teacher.Fname || ''} ${teacher.Lname || ''}`}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <EmailIcon size={14} color="#6b7280" />
                  <Typography variant="body2" color="textSecondary">
                    {teacher.email || ''}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <StatusChip
              label={teacher.is_active ? "Active" : "Inactive"}
              active={teacher.is_active}
              size="small"
            />
          </Box>

          <Divider sx={{ my: 1.5, borderColor: alpha('#0d9488', 0.1) }} />

          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <SchoolIcon color="#0d9488" size={16} />
                <Typography variant="caption" color="textSecondary" display="block">
                  Qualifications:
                </Typography>
              </Box>
              <Typography variant="body2">
                {(teacher.teacherqualifications || [])
                  .map((q) => q?.qualification?.name || '')
                  .filter(Boolean)
                  .join(", ") || 'N/A'}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationIcon color="#0d9488" size={16} />
                <Typography variant="caption" color="textSecondary" display="block">
                  Location:
                </Typography>
              </Box>
              <Typography variant="body2">
                {(teacher.teachersaddress || [])
                  .map((address) => address?.state || '')
                  .filter(Boolean)
                  .join(", ") || 'N/A'}
              </Typography>
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Tooltip title={teacher.is_active ? "Deactivate" : "Activate"}>
              <Box>
                <Switch
                  checked={teacher.is_active === true}
                  onChange={() => confirmToggleStatus(teacher.id, teacher.is_active)}
                  color={teacher.is_active ? "success" : "error"}
                  size="small"
                />
              </Box>
            </Tooltip>
            <Box>
              <IconButton
                component={Link}
                to={`/admin/view/teacher/${teacher.id}`}
                size="small"
                sx={{ color: '#0d9488' }}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </TeacherCard>
    );
  };

  // Calculate the number of active and inactive teachers
  const activeTeachers = teachers.filter(teacher => teacher.is_active === true).length;
  const inactiveTeachers = teachers.filter(teacher => teacher.is_active === false).length;

  // Custom toolbar for the DataGrid
  function CustomToolbar() {
    return (
      <GridToolbarContainer sx={{ p: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport 
          csvOptions={{
            fileName: `teachers_export_${new Date().toISOString().split('T')[0]}`,
            delimiter: ',',
            utf8WithBom: true,
          }}
        />
      </GridToolbarContainer>
    );
  }
  
  // Prepare columns for the DataGrid
  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      hide: isMobile,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const initials = `${params.row.Fname?.charAt(0) || ''}${params.row.Lname?.charAt(0) || ''}`;
        return (
          <Box display="flex" alignItems="center">
            <TeacherAvatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>{initials}</TeacherAvatar>
            <Box ml={1}>
              <Typography variant="subtitle2" fontWeight={600}>
                {`${params.row.Fname || ''} ${params.row.Lname || ''}`}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ID: {params.row.id || ''}
              </Typography>
            </Box>
          </Box>
        );
      },
      sortable: true,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 220,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <EmailIcon size={16} color="#6b7280" />
          <Typography variant="body2">{params.row.email || ''}</Typography>
        </Box>
      ),
      sortable: true,
    },
    {
      field: 'qualifications',
      headerName: 'Qualification',
      flex: 1,
      minWidth: 180,
      hide: isMobile || isTablet,
      renderCell: (params) => {
        const qualifications = (params.row.teacherqualifications || [])
          .map((q) => q?.qualification?.name || '')
          .filter(Boolean)
          .join(", ");
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <SchoolIcon size={16} color="#0d9488" />
            <Typography variant="body2">{qualifications || 'N/A'}</Typography>
          </Box>
        );
      },
      sortable: false,
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      minWidth: 150,
      hide: isMobile || isTablet,
      renderCell: (params) => {
        const locations = (params.row.teachersaddress || [])
          .map((address) => address?.state || '')
          .filter(Boolean)
          .join(", ");
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <LocationIcon size={16} color="#0d9488" />
            <Typography variant="body2">{locations || 'N/A'}</Typography>
          </Box>
        );
      },
      sortable: false,
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <StatusChip
          label={params.row.is_active ? "Active" : "Inactive"}
          active={params.row.is_active ? "true" : "false"}
          size="small"
        />
      ),
      sortable: true,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="View Details">
            <IconButton
              component={Link}
              to={`/admin/view/teacher/${params.row.id}`}
              size="small"
              sx={{ 
                color: '#0d9488',
                '&:hover': {
                  backgroundColor: alpha('#0d9488', 0.1),
                }
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.is_active ? "Deactivate" : "Activate"}>
            <span>
              <Switch
                checked={params.row.is_active === true}
                onChange={() => confirmToggleStatus(params.row.id, params.row.is_active)}
                size="small"
                color={params.row.is_active ? "success" : "error"}
              />
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Layout>
        {/* Header section with stats */}
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 3, 
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: '#0d9488', width: 56, height: 56 }}>
                <FaUserGraduate size={28} />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: "#0d9488",
                    fontWeight: 700,
                    fontSize: { xs: "1.75rem", sm: "2.125rem" },
                  }}
                >
                  Manage Teachers
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                  {teachers.length} teachers registered • {activeTeachers} active • {inactiveTeachers} inactive
                </Typography>
              </Box>
            </Box>

            <Box display="flex" gap={2} width={{ xs: '100%', md: 'auto' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  textTransform: 'none',
                  borderColor: alpha('#0d9488', 0.3),
                  color: '#0d9488',
                  '&:hover': {
                    borderColor: '#0d9488',
                    backgroundColor: alpha('#0d9488', 0.05),
                  },
                  minWidth: { xs: '50%', md: 'auto' }
                }}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                variant="contained"
                sx={{
                  background: `linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)`,
                  boxShadow: `0 4px 20px ${alpha('#0d9488', 0.3)}`,
                  textTransform: 'none',
                  '&:hover': {
                    background: `linear-gradient(135deg, #0a7c6a 0%, #0891b2 100%)`,
                    boxShadow: `0 6px 25px ${alpha('#0d9488', 0.4)}`,
                  },
                  minWidth: { xs: '50%', md: 'auto' }
                }}
                startIcon={<ExportIcon />}
                onClick={handleExportData}
              >
                Export Data
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Search bar */}
        <FilterPaper elevation={0}>
          <Box mb={2}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or ID"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="#0d9488" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery("")}
                      sx={{ color: '#0d9488' }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: alpha('#0d9488', 0.5),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0d9488',
                  },
                }
              }}
            />
          </Box>

          {/* Filter section with toggle for mobile */}
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <FaFilter color="#0d9488" />
              <Typography variant="subtitle1" fontWeight={600} color="#0d9488">
                Filters
              </Typography>
            </Box>
            {isMobile && (
              <Button
                startIcon={<FilterIcon />}
                onClick={() => setExpandedFilters(!expandedFilters)}
                size="small"
                sx={{ color: '#0d9488' }}
              >
                {expandedFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            )}
          </Box>

          {/* Collapsible filters */}
          {(expandedFilters || !isMobile) && (
            <Grid container spacing={2}>
              {/* Qualification Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <SchoolIcon color="#0d9488" size={16} />
                  <Typography variant="body2" fontWeight={500} color="#0d9488">Qualification</Typography>
                </Box>
                <FormControl variant="outlined" fullWidth size="small">
                  <Select
                    value={selectedQualification}
                    onChange={(e) => setSelectedQualification(e.target.value)}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) return "All Qualifications";
                      return selected;
                    }}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha('#0d9488', 0.3),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha('#0d9488', 0.5),
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#0d9488',
                      },
                    }}
                  >
                    <MenuItem value="">All Qualifications</MenuItem>
                    {qualifications.map((qualification) => (
                      <MenuItem key={qualification.id} value={qualification.name?.toLowerCase()}>
                        {qualification.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Subject Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <FaUserGraduate color="#0d9488" size={14} />
                  <Typography variant="body2" fontWeight={500} color="#0d9488">Subject</Typography>
                </Box>
                <FormControl variant="outlined" fullWidth size="small">
                  <Select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) return "All Subjects";
                      return selected;
                    }}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha('#0d9488', 0.3),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha('#0d9488', 0.5),
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#0d9488',
                      },
                    }}
                  >
                    <MenuItem value="">All Subjects</MenuItem>
                    {subjects.map((subject) => (
                      <MenuItem key={subject.id} value={subject.subject_name?.toLowerCase()}>
                        {subject.subject_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Location Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <LocationIcon color="#0d9488" />
                  <Typography variant="body2" fontWeight={500} color="#0d9488">Location</Typography>
                </Box>
                <FormControl variant="outlined" fullWidth size="small">
                  <Select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) return "All Locations";
                      return selected;
                    }}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha('#0d9488', 0.3),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha('#0d9488', 0.5),
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#0d9488',
                      },
                    }}
                  >
                    <MenuItem value="">All Locations</MenuItem>
                    {locations.map((location, index) => (
                      <MenuItem key={index} value={location?.toLowerCase()}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CheckIcon color="#0d9488" />
                  <Typography variant="body2" fontWeight={500} color="#0d9488">Status</Typography>
                </Box>
                <FormControl variant="outlined" fullWidth size="small">
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) return "All Status";
                      return selected === "approved" ? "Active" : selected === "rejected" ? "Inactive" : "All Statuses";
                    }}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha('#0d9488', 0.3),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha('#0d9488', 0.5),
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#0d9488',
                      },
                    }}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="approved">Active</MenuItem>
                    <MenuItem value="rejected">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {/* Filter results summary */}
          {filteredTeachers.length > 0 && (
            <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Showing {filteredTeachers.length} of {teachers.length} teachers
              </Typography>
              {(selectedQualification || selectedSubject || selectedLocation || selectedStatus) && (
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedQualification("");
                    setSelectedSubject("");
                    setSelectedLocation("");
                    setSelectedStatus("");
                  }}
                  startIcon={<ClearIcon fontSize="small" />}
                  sx={{
                    color: '#0d9488',
                    '&:hover': {
                      backgroundColor: alpha('#0d9488', 0.1),
                    }
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Box>
          )}
        </FilterPaper>

        {/* Teachers List/Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            background: `linear-gradient(135deg, ${alpha('#ffffff', 0.9)} 0%, ${alpha('#f8fafc', 0.9)} 100%)`,
            border: `1px solid ${alpha('#0d9488', 0.1)}`,
            transition: "all 0.3s ease"
          }}
        >
          {loading ? (
            <Box p={3}>
              <Grid container spacing={2}>
                {[1, 2, 3, 4, 5].map((item) => (
                  <Grid item xs={12} key={item}>
                    <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : error ? (
            <Box p={4} textAlign="center">
              <Box mb={2}>
                <HelpIcon fontSize="large" sx={{ fontSize: 60, opacity: 0.5, color: '#ef4444' }} />
              </Box>
              <Typography variant="h6" color="error" gutterBottom>
                Failed to Load Teachers
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {error}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{
                  borderColor: '#0d9488',
                  color: '#0d9488',
                  '&:hover': {
                    borderColor: '#0d9488',
                    backgroundColor: alpha('#0d9488', 0.1),
                  }
                }}
              >
                Try Again
              </Button>
            </Box>
          ) : filteredTeachers.length === 0 ? (
            <Box p={4} textAlign="center">
              <Box mb={2}>
                {searchQuery || selectedQualification || selectedSubject || selectedLocation || selectedStatus ? (
                  <HelpIcon sx={{ fontSize: 60, opacity: 0.5, color: '#f59e0b' }} />
                ) : (
                  <PersonIcon sx={{ fontSize: 60, opacity: 0.7, color: '#0d9488' }} />
                )}
              </Box>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {searchQuery || selectedQualification || selectedSubject || selectedLocation || selectedStatus
                  ? "No teachers match your search criteria"
                  : "No teachers registered yet"}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {searchQuery || selectedQualification || selectedSubject || selectedLocation || selectedStatus
                  ? "Try adjusting your search filters to find what you're looking for."
                  : "Teachers who register on the platform will appear here."}
              </Typography>
              {(searchQuery || selectedQualification || selectedSubject || selectedLocation || selectedStatus) && (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedQualification("");
                    setSelectedSubject("");
                    setSelectedLocation("");
                    setSelectedStatus("");
                  }}
                  sx={{
                    borderColor: '#0d9488',
                    color: '#0d9488',
                    '&:hover': {
                      borderColor: '#0d9488',
                      backgroundColor: alpha('#0d9488', 0.1),
                    }
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </Box>
          ) : isMobile ? (
            // Mobile card view
            <Box p={2}>
              {filteredTeachers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(renderTeacherCard)}
              
              {/* Add pagination control for mobile */}
              <Box display="flex" justifyContent="center" mt={2}>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredTeachers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </Box>
          ) : (
            // Replace table with DataGrid for desktop
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={filteredTeachers}
                getRowId={(row) => row.id} // Important: specify how to get row IDs
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: { 
                      page: page,
                      pageSize: rowsPerPage 
                    },
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
                checkboxSelection
                disableRowSelectionOnClick
                onPaginationModelChange={(newModel) => {
                  setPage(newModel.page);
                  setRowsPerPage(newModel.pageSize);
                }}
                onRowSelectionModelChange={(newSelectionModel) => {
                  setSelectedTeachers(newSelectionModel);
                }}
                rowSelectionModel={selectedTeachers}
                loading={loading}
                slots={{ toolbar: CustomToolbar }}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    background: `linear-gradient(135deg, ${alpha('#0d9488', 0.05)} 0%, ${alpha('#06b6d4', 0.05)} 100%)`,
                    borderBottom: `2px solid ${alpha('#0d9488', 0.2)}`,
                    fontWeight: 600,
                    color: '#0d9488',
                  },
                  '& .MuiDataGrid-row:nth-of-type(even)': {
                    backgroundColor: alpha('#f8fafc', 0.5),
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: alpha('#0d9488', 0.05),
                  },
                  '& .MuiDataGrid-row.Mui-selected': {
                    backgroundColor: alpha('#0d9488', 0.1),
                    '&:hover': {
                      backgroundColor: alpha('#0d9488', 0.15),
                    },
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: `1px solid ${alpha('#0d9488', 0.1)}`,
                    backgroundColor: alpha('#f8fafc', 0.5),
                  },
                  '& .MuiTablePagination-root': {
                    color: '#0d9488',
                  },
                  '& .MuiCheckbox-root': {
                    color: alpha('#0d9488', 0.6),
                    '&.Mui-checked': {
                      color: '#0d9488',
                    },
                  },
                }}
              />
            </Box>
          )}
        </Paper>

      {/* Snackbar notification */}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          severity={notification.type}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Confirm status change dialog */}
      <StyledDialog
        open={confirmStatusChange.open}
        onClose={() => setConfirmStatusChange({ ...confirmStatusChange, open: false })}
      >
        <GradientHeader>
          <Typography variant="h6" fontWeight={600}>
            Confirm Status Change
          </Typography>
        </GradientHeader>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            Are you sure you want to {confirmStatusChange.currentStatus ? "deactivate" : "activate"} the selected teacher?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setConfirmStatusChange({ ...confirmStatusChange, open: false })}
            sx={{ color: '#0d9488' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleToggleStatus(confirmStatusChange.id, confirmStatusChange.currentStatus)}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, #0a7c6a 0%, #0891b2 100%)`,
              }
            }}
            disabled={processingStatus}
          >
            {processingStatus ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </StyledDialog>
    </Layout>
  );
}

export default ManageTeacher;
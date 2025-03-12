import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Avatar,
  IconButton,
  Chip,
  Switch,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  WorkOutline as JobIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle as AccountIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  Category,
  MenuBook,
  Psychology,
  Grade,
  WorkspacePremium,
  Quiz,
  BusinessCenter,
  Key,
  VideoCall,
  AssignmentInd,
  NotificationImportant,
  SupervisorAccount,
  QuestionAnswer as QuestionAnswerIcon,
  LocationOn,
  MoreHoriz,
  WorkOutline
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Layout from '../Admin/Layout';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '../../services/adminDashboardApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

export default function AdminDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [darkMode, setDarkMode] = useState(false);
  const [chartTab, setChartTab] = useState(0);
  const [showAllActions, setShowAllActions] = useState(false);
  const [mockData, setMockData] = useState({
    teachers: { total: 0, pending: 0, thisMonth: 0 },
    recruiters: { total: 0, pending: 0, thisMonth: 0 },
    interviews: { upcoming: 0, completed: 0 },
    passkeys: { total: 0, pending: 0, approved: 0 },
    examcenters: { total_examcenter: 0 },
    QuestioReports: { total: 0 },
    HireRequests: { total: 0, requested: 0, approved: 0, rejected: 0 },
    TeacherApply: { total: 0, pending: 0, approved: 0 },
    RecruiterEnquiryForm: { total: 0 },
    subjects: { total: 0 },
    class_categories: { total: 0 },
    assignedquestionusers: { total: 0 },
    skills: { total: 0 }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboardData();
        setMockData(response);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleChartTabChange = (event, newValue) => {
    setChartTab(newValue);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          color: darkMode ? '#fff' : '#333',
          boxWidth: isMobile ? 8 : 40,
          font: {
            size: isMobile ? 8 : 12
          },
          padding: isMobile ? 5 : 10
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          display: !isMobile
        },
        ticks: {
          color: darkMode ? '#aaa' : '#666',
          font: {
            size: isMobile ? 8 : 12
          },
          maxRotation: isMobile ? 45 : 0
        }
      },
      y: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: darkMode ? '#aaa' : '#666',
          font: {
            size: isMobile ? 8 : 12
          },
          callback: function (value) {
            if (isMobile && value > 100) {
              return value.toString().substring(0, 1) + '00';
            }
            return value;
          }
        }
      }
    }
  };

  const statsSummary = [
    { label: 'Pending Teachers', value: mockData.teachers?.pending, color: '#ff9800', icon: <PeopleIcon fontSize="small" /> },
    { label: 'Pending Recruiters', value: mockData.recruiters?.pending, color: '#2196f3', icon: <SchoolIcon fontSize="small" /> },
    { label: 'Upcoming Interviews', value: mockData.interviews?.upcoming, color: '#9c27b0', icon: <CalendarIcon fontSize="small" /> },
    { label: 'Total Passkeys', value: mockData.passkeys?.total, color: '#4caf50', icon: <Key fontSize="small" /> },
  ];

  const quickActions = [
    { icon: <SchoolIcon />, text: "Teachers", color: "#ff9800", link: "/admin/manage/teacher" },
    { icon: <SupervisorAccount />, text: "Recruiters", color: "#2196f3", link: "/admin/manage/recruiter" },
    { icon: <BusinessCenter />, text: "Hiring", color: "#9c27b0", link: "/admin/manage/hiring" },
    { icon: <VideoCall />, text: "Interviews", color: "#f44336", link: "/admin/manage/interview" },
    { icon: <Quiz />, text: "Exams", color: "#4caf50", link: "/admin/manage/exam" },
    { icon: <MenuBook />, text: "Subjects", color: "#607d8b", link: "/admin/manage/subject" },
    { icon: <Category />, text: "Categories", color: "#795548", link: "/admin/manage/class/category" },
    { icon: <Key />, text: "Passkeys", color: "#009688", link: "/admin/manage/passkey" },
    { icon: <Psychology />, text: "Skills", color: "#e91e63", link: "/admin/manage/skills" },
    { icon: <Grade />, text: "Levels", color: "#673ab7", link: "/admin/manage/level" },
    { icon: <WorkspacePremium />, text: "Qualifications", color: "#3f51b5", link: "/admin/manage/qualification" },
    { icon: <AssignmentInd />, text: "Job Applications", color: "#00bcd4", link: "/admin/manage/teacher/applied/job" },
    { icon: <NotificationImportant />, text: "Enquiries", color: "#ff5722", link: "/admin/manage/recruiter/enquiry" },
    { icon: <QuestionAnswerIcon />, text: "Question manager", color: "#8bc34a", link: "/admin/manage/question/manager" },
    { icon: <LocationOn />, text: "Exam Centers", color: "#009688", link: "/admin/manage/exam/center" },
    { icon: <WorkOutline />, text: "Job Types", color: "#795548", link: "/admin/manage/teacher/jobtype" },
  ];

  const displayedQuickActions = showAllActions
    ? quickActions
    : quickActions.slice(0, isMobile ? 6 : isTablet ? 8 : 12);

  const handleActionClick = (link) => {
    navigate(link);
  };

  return (
    <Layout>
      <Box sx={{
        flexGrow: 1,
        p: { xs: 1, sm: 2, md: 3 },
        backgroundColor: darkMode ? '#121212' : '#f5f5f5',
        minHeight: '100vh',
        color: darkMode ? '#fff' : '#333',
        transition: 'all 0.3s ease',
        overflowX: 'hidden !important',
        width: '100%',
        maxWidth: '100%',
      }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          mb: 3,
          alignItems: isMobile ? 'flex-start' : 'center'
        }}>
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" color={darkMode ? 'primary.light' : 'primary.dark'} >
              Admin Dashboard
            </Typography>
            <Typography variant="body2"  color={darkMode ? 'text.light' : 'text.dark'}>
              Welcome back, Admin | {new Date().toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: isMobile ? 2 : 0,
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'space-between' : 'flex-end'
          }}>
            <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
              <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Key Metrics Summary - Enhanced Responsive Design */}
        <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            sx={{
              mb: { xs: 1, sm: 1.5, md: 2 },
              fontWeight: 600,
              color: darkMode ? '#fff' : 'inherit'
            }}
          >
            Key Metrics
          </Typography>
          <Grid container spacing={isMobile ? 1 : isTablet ? 1.5 : 2}>
            {statsSummary.map((stat, index) => (
              <Grid item xs={6} sm={6} md={3} key={index}>
                <Paper
                  elevation={darkMode ? 1 : 2}
                  sx={{
                    p: { xs: 1.25, sm: 1.75, md: 2 },
                    borderRadius: { xs: 1.5, sm: 2 },
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.07)' : 'white',
                    borderLeft: `4px solid ${stat.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                    minHeight: { xs: 60, sm: 70, md: 80 },
                    transition: 'all 0.2s ease',
                    boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.15)' : undefined,
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Avatar sx={{
                    bgcolor: darkMode ? `${stat.color}80` : stat.color,
                    mr: { xs: 1, sm: 1.5 },
                    width: { xs: 28, sm: 32, md: 40 },
                    height: { xs: 28, sm: 32, md: 40 },
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }
                    }
                  }}>
                    {stat.icon}
                  </Avatar>
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography
                      variant={isMobile ? "caption" : isTablet ? "body2" : "body2"}
                      sx={{
                        maxWidth: { xs: '85px', sm: '150px', md: '100%' },
                        color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.8rem' }
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      variant={isMobile ? "body2" : isTablet ? "body1" : "h6"}
                      sx={{
                        fontWeight: 'bold',
                        color: darkMode ? '#fff' : 'inherit',
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* KPI & Analytics Overview */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          Analytics Overview
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {/* Teachers Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                height: '100%',
                background: 'linear-gradient(to right, #4a6572, #336699)',
                color: 'white',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium" noWrap>Teachers</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.teachers?.total}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 'auto',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0
                }}>
                  <Chip
                    size="small"
                    label={`${mockData.teachers?.pending} pending`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                  <Chip
                    size="small"
                    label={`+${mockData.teachers?.thisMonth} this month`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Recruiters Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                height: '100%',
                background: 'linear-gradient(to right, #5d4157, #a8caba)',
                color: 'white',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SchoolIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium" noWrap>Recruiters</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.recruiters?.total}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 'auto',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0
                }}>
                  <Chip
                    size="small"
                    label={`${mockData.recruiters?.pending} pending`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                  <Chip
                    size="small"
                    label={`+${mockData.recruiters?.thisMonth} this month`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Interviews Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                height: '100%',
                background: 'linear-gradient(to right, #3a6186, #89253e)',
                color: 'white',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium" noWrap>Interviews</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.interviews?.upcoming}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 'auto',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0
                }}>
                  <Chip
                    size="small"
                    label={`${mockData.interviews?.completed} completed`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Passkeys Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                height: '100%',
                background: 'linear-gradient(to right, #134e5e, #71b280)',
                color: 'white',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Key sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium" noWrap>Passkeys</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.passkeys?.total}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 'auto',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0
                }}>
                  <Chip
                    size="small"
                    label={`${mockData.passkeys?.pending} pending`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                  <Chip
                    size="small"
                    label={`${mockData.passkeys?.approved} approved`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Exam Centers Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                height: '100%',
                background: 'linear-gradient(to right, #4b6cb7, #182848)',
                color: 'white',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium" noWrap>Exam Centers</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.examcenters?.total_examcenter}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Question Reports Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                height: '100%',
                background: 'linear-gradient(to right, #8e9eab, #eef2f3)',
                color: '#333',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <QuestionAnswerIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium" noWrap>Question Reports</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.QuestioReports?.total}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Hire Requests Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                height: '100%',
                background: 'linear-gradient(to right, #5d4157, #a8caba)',
                color: 'white',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessCenter sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium" noWrap>Hire Requests</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.HireRequests?.total}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 'auto',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0
                }}>
                  <Chip
                    size="small"
                    label={`${mockData.HireRequests?.requested} requested`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                  <Chip
                    size="small"
                    label={`${mockData.HireRequests?.approved} approved`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                  <Chip
                    size="small"
                    label={`${mockData.HireRequests?.rejected} rejected`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Teacher Apply Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                height: '100%',
                background: 'linear-gradient(to right, #4a6572, #336699)',
                color: 'white',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AssignmentInd sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium" noWrap>Teacher Apply</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.TeacherApply?.total}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 'auto',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0
                }}>
                  <Chip
                    size="small"
                    label={`${mockData.TeacherApply?.pending} pending`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                  <Chip
                    size="small"
                    label={`${mockData.TeacherApply?.approved} approved`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Recruiter Enquiry Form Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                height: '100%',
                background: 'linear-gradient(to right, #3a6186, #89253e)',
                color: 'white',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <NotificationImportant sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium" noWrap>Recruiter Enquiry</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.RecruiterEnquiryForm?.total}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Subjects Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                height: '100%',
                background: 'linear-gradient(to right, #134e5e, #71b280)',
                color: 'white',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MenuBook sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium" noWrap>Subjects</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.subjects?.total}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Class Categories Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                height: '100%',
                background: 'linear-gradient(to right, #4b6cb7, #182848)',
                color: 'white',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Category sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium" noWrap>Class Categories</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.class_categories?.total}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Assigned Question Users Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                height: '100%',
                background: 'linear-gradient(to right, #8e9eab, #eef2f3)',
                color: '#333',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <QuestionAnswerIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium" noWrap>Questions Manager</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.assignedquestionusers?.total}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Skills Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                height: '100%',
                background: 'linear-gradient(to right, #5d4157, #a8caba)',
                color: 'white',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Psychology sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium" noWrap>Skills</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.skills?.total}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions Panel - Responsive for all devices */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h6" fontWeight="500">
              Quick Actions
            </Typography>
            {quickActions.length > displayedQuickActions.length && (
              <Button
                size="small"
                endIcon={<MoreHoriz />}
                onClick={() => setShowAllActions(!showAllActions)}
              >
                {showAllActions ? "Show Less" : "Show All"}
              </Button>
            )}
          </Box>

          <Grid container spacing={isMobile ? 1 : 2}>
            {displayedQuickActions.map((action, index) => (
              <Grid item xs={4} sm={3} md={2} key={index}>
                <Button
                  variant="outlined"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: { xs: 80, sm: 100 },
                    width: '100%',
                    textTransform: 'none',
                    borderRadius: 2,
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
                    color: darkMode ? 'white' : '#333',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    overflow: 'hidden',
                    p: 1,
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'white',
                    }
                  }}
                  onClick={() => handleActionClick(action.link)}
                >
                  <Box sx={{
                    color: action.color,
                    p: { xs: 0.5, sm: 1 },
                    borderRadius: '50%',
                    mb: { xs: 0.5, sm: 1 }
                  }}>
                    {action.icon}
                  </Box>
                  <Typography
                    variant={isMobile ? "caption" : "body2"}
                    textAlign="center"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}
                  >
                    {action.text}
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Analytics Charts - Responsive tabs for all devices */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          Analytics & Growth
        </Typography>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
            p: 2,
            mb: 3,
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <Tabs
            value={chartTab}
            onChange={handleChartTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            sx={{ mb: 2 }}
            scrollButtons="auto"
          >
            <Tab
              icon={<ShowChartIcon />}
              label={isMobile ? undefined : "Growth"}
              iconPosition={isMobile ? "top" : "start"}
            />
            <Tab
              icon={<BarChartIcon />}
              label={isMobile ? undefined : "Jobs"}
              iconPosition={isMobile ? "top" : "start"}
            />
            <Tab
              icon={<PieChartIcon />}
              label={isMobile ? undefined : "Distribution"}
              iconPosition={isMobile ? "top" : "start"}
            />
          </Tabs>

          <Box sx={{ height: { xs: 250, sm: 300, md: 350 }, mt: 2, width: '100%' }}>
            {chartTab === 0 && (
              <Line options={chartOptions} data={{
                labels: ['Teachers', 'Recruiters', 'Interviews', 'Hire Requests', 'Teacher Applications'],
                datasets: [
                  {
                    label: 'Total',
                    data: [
                      mockData.teachers?.total || 0,
                      mockData.recruiters?.total || 0,
                      mockData.interviews?.upcoming + mockData.interviews?.completed || 0,
                      mockData.HireRequests?.total || 0,
                      mockData.TeacherApply?.total || 0
                    ],
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                  }
                ],
              }} />
            )}
            {chartTab === 1 && (
              <Bar options={chartOptions} data={{
                labels: ['Hire Requests', 'Teacher Applications', 'Pending Teachers', 'Pending Recruiters'],
                datasets: [
                  {
                    label: 'Total',
                    data: [
                      mockData.HireRequests?.total || 0,
                      mockData.TeacherApply?.total || 0,
                      mockData.teachers?.pending || 0,
                      mockData.recruiters?.pending || 0
                    ],
                    backgroundColor: [
                      'rgba(255, 99, 132, 0.5)',
                      'rgba(54, 162, 235, 0.5)',
                      'rgba(255, 206, 86, 0.5)',
                      'rgba(75, 192, 192, 0.5)',
                    ],
                  }
                ],
              }} />
            )}
            {chartTab === 2 && (
              <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                height: '100%',
                width: '100%'
              }}>
                <Box sx={{ flex: 1, height: '100%', p: 1 }}>
                  <Doughnut options={{ ...chartOptions, maintainAspectRatio: false }} data={{
                    labels: ['Teachers', 'Recruiters', 'Exam Centers'],
                    datasets: [
                      {
                        data: [
                          mockData.teachers?.total || 0,
                          mockData.recruiters?.total || 0,
                          mockData.examcenters?.total_examcenter || 0
                        ],
                        backgroundColor: [
                          'rgba(255, 99, 132, 0.7)',
                          'rgba(53, 162, 235, 0.7)',
                          'rgba(75, 192, 192, 0.7)',
                        ],
                        borderColor: [
                          'rgb(255, 99, 132)',
                          'rgb(53, 162, 235)',
                          'rgb(75, 192, 192)',
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }} />
                </Box>
                <Box sx={{ flex: 1, height: '100%', p: 1 }}>
                  <Bar options={chartOptions} data={{
                    labels: ['Subjects', 'Class Categories', 'Skills', 'Assigned Questions'],
                    datasets: [
                      {
                        label: 'Total',
                        data: [
                          mockData.subjects?.total || 0,
                          mockData.class_categories?.total || 0,
                          mockData.skills?.total || 0,
                          mockData.assignedquestionusers?.total || 0
                        ],
                        backgroundColor: [
                          'rgba(153, 102, 255, 0.5)',
                          'rgba(255, 159, 64, 0.5)',
                          'rgba(255, 205, 86, 0.5)',
                          'rgba(75, 192, 192, 0.5)',
                        ],
                      }
                    ],
                  }} />
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
}